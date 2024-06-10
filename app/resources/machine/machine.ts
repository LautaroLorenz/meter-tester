import { WebContents, ipcMain } from 'electron';
import { SerialPort, DelimiterParser } from 'serialport';
import { BindingInterface } from '@serialport/bindings-interface';
import { BehaviorSubject, Observable, Subject, filter, firstValueFrom, from, tap, timeout } from 'rxjs';
import { SerialPortStream } from '@serialport/stream';
import { CommandDirector } from './command-director';

let logsSenders: WebContents[] = [];
let serialPort: SerialPortStream<BindingInterface>;
const parser = new DelimiterParser({
    delimiter: '\n',
    includeDelimiter: false
});
parser.removeAllListeners();
parser.on('data', (data) => {
    const response = data.toString('ascii');
    addCommandLog(response);
    machineResponse$.next(response);
});
const machineResponse$ = new Subject<string>();
const _onSoftwareWrite$ = new Subject<string>();

const commandLog$ = new BehaviorSubject<string[]>([]);
function addCommandLog(command: string): void {
    // solamente logueamos si hay senders a los que enviar los logs
    if (!logsSenders.length) {
        return;
    }
    commandLog$.next([...commandLog$.value, command]);
}
function clearCommandLog(): void {
    commandLog$.next([]);
}
commandLog$
    .pipe(
        tap((value) => {
            logsSenders.forEach((sender) => {
                if (!sender.isDestroyed()) {
                    sender.send('command-history', value);
                } else {
                    logsSenders = logsSenders.filter((sender) => !sender.isDestroyed());
                }
            });
        })
    )
    .subscribe();

export default {
    register: () => {
        // envió de comando: STW -> Máquina
        ipcMain.handle('software-write', async (_, { command }) => {
            addCommandLog(command);
            _onSoftwareWrite$.next(command);

            try {
                const response = await firstValueFrom(
                    from(machineResponse$).pipe(
                        filter(
                            (responseCommand) =>
                                CommandDirector.getTo(command) === CommandDirector.getFrom(responseCommand)
                        ),
                        timeout({
                            first: 6000,
                            with: () => {
                                throw new Error('Timeout');
                            }
                        })
                    )
                );
                return { result: response };
            } catch (error) {
                return { error };
            }
        });

        ipcMain.handle('subscribe-to-history', (event) => {
            if (logsSenders.some(({ id }) => event.sender.id === id)) {
                return;
            }
            logsSenders.push(event.sender);
            return;
        });

        ipcMain.on('clear-history', () => {
            clearCommandLog();
        });
    },
    setSerialPort: (serialPortInput: SerialPortStream) => {
        serialPort = serialPortInput;
        serialPort.pipe(parser);
    },
    createSearialPort: async () => {
        const PRODUCT_ID = '7523'; // TODO
        const VENDOR_ID = '1a86'; // TODO
        const ports = await SerialPort.list();
        const port = ports.find(({ productId, vendorId }) => productId === PRODUCT_ID && vendorId === VENDOR_ID);
        if (!port) {
            throw new Error('No se pudo abrir el puerto USB');
        }
        return new SerialPort({ path: port.path, baudRate: 9600 });
    },
    observeSoftwareWrite: (observable: Observable<string>) => {
        observable.subscribe(async (command) => {
            // escribir por el puerto USB
            const buffer = Buffer.from(command, 'ascii');
            // const checksum = getChecksumByte(buffer);
            // const checksumBuffer = decimalChecksumToBuffer(checksum);
            // const commandBuffer = Buffer.concat([buffer, checksumBuffer]);
            // TODO esta linea no va
            // FIXME arreglar la maquina virtual cunado escribo el comando
            const commandBuffer = buffer;
            const coludBeSent = await new Promise((resolve) => {
                serialPort.write(commandBuffer, (err) => {
                    if (err !== null && err !== undefined) {
                        console.error('No se pudo enviar el comando', err);
                        resolve(false);
                    }
                });
                serialPort.drain((err) => {
                    if (err !== null && err !== undefined) {
                        console.error('No se pudo esperar a que se envie el comando', err);
                    }
                    resolve(err === null || err === undefined);
                });
            });
        });
    },
    onSoftwareWrite$: _onSoftwareWrite$.asObservable()
};
