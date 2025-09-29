import { WebContents, ipcMain } from 'electron';
import { SerialPort } from 'serialport';
import { BindingInterface } from '@serialport/bindings-interface';
import { BehaviorSubject, Observable, Subject, filter, firstValueFrom, from, tap, timeout } from 'rxjs';
import { SerialPortStream } from '@serialport/stream';
import { CommandDirector } from './command-director';
import { CommandProcessor, CommandProcessorConfig, CommandProcessorCallbacks } from './command-processor';

let logsSenders: WebContents[] = [];
let serialPort: SerialPortStream<BindingInterface>;
let portList: any;
let connectionLogs: any;
let commandProcessor: CommandProcessor;

// Función para configurar el parser personalizado
function setupParser() {
    // Configuración del procesador de comandos
    const config: CommandProcessorConfig = {
        dataWaitTimeout: 100 // 100ms de espera
    };

    // Callbacks para manejar comandos recibidos
    const callbacks: CommandProcessorCallbacks = {
        onCommandReceived: (command: string) => {
            machineResponse$.next(command);
        },
        onCommandLog: (command: string) => {
            addCommandLog(command);
        }
    };

    // Crear instancia del procesador
    commandProcessor = new CommandProcessor(config, callbacks);

    serialPort.on('data', (data) => {
        // Use 'latin1' encoding to preserve all byte values (0-255)
        const chunk = data.toString('latin1');
        commandProcessor.processDataChunk(chunk);
    });
}

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

        ipcMain.handle('check-connection-logs', async () => {
            return {
                connectionLogs: connectionLogs,
                ports: portList
            };
        });
    },
    setSerialPort: (serialPortInput: SerialPortStream) => {
        serialPort = serialPortInput;
        setupParser(); // Configurar el parser personalizado
    },
    createSearialPort: async () => {
        const HARDWARE_IDs = [
            {
                PRODUCT_ID: '7523',
                VENDOR_ID: '1A86',
                PNP_ID: undefined
            }
            // Ejemplo con PNP_ID
            // {
            //     PRODUCT_ID: '2303',
            //     VENDOR_ID: '067B',
            //     PNP_ID: 'ACPI-PNP0501-2'
            // }
        ];
        const ports = await SerialPort.list();
        portList = ports;
        try {
            const port = ports.find(({ productId, vendorId, pnpId }) =>
                HARDWARE_IDs.some(
                    ({ PRODUCT_ID, VENDOR_ID, PNP_ID }) =>
                        (productId?.toUpperCase() === PRODUCT_ID && vendorId?.toUpperCase() === VENDOR_ID) ||
                        (PNP_ID && pnpId?.toUpperCase()?.replace(/[\\/]/g, '-') === PNP_ID)
                )
            );
            if (!port) {
                throw new Error('No se pudo abrir el puerto USB');
            }
            return new SerialPort({ path: port.path, baudRate: 19200 });
        } catch (err) {
            connectionLogs = err;
            return;
        }
    },
    observeSoftwareWrite: (observable: Observable<string>) => {
        observable.subscribe(async (command) => {
            // escribir por el puerto USB
            const buffer = Buffer.from(command, 'latin1');
            await new Promise((resolve) => {
                serialPort.write(buffer, (err) => {
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
    onSoftwareWrite$: _onSoftwareWrite$.asObservable(),
    // Nueva función para limpiar recursos
    cleanup: () => {
        if (commandProcessor) {
            commandProcessor.cleanup();
        }
    }
};
