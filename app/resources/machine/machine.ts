import { WebContents, ipcMain } from 'electron';
import { SerialPort } from 'serialport';
import { BindingInterface } from '@serialport/bindings-interface';
import { BehaviorSubject, Observable, Subject, filter, firstValueFrom, from, tap, timeout } from 'rxjs';
import { SerialPortStream } from '@serialport/stream';
import { CommandDirector } from './command-director';
import { CommandProcessor, CommandProcessorCallbacks } from './command-processor';
import virtualMachine from '../virtual-machine/virtual-machine';

let logsSenders: WebContents[] = [];
let serialPort: SerialPortStream<BindingInterface>;
let portList: any;
let connectionLogs: any;
let commandProcessor: CommandProcessor;

// Función para configurar el parser personalizado
function setupParser() {
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
    commandProcessor = new CommandProcessor(callbacks);

    // Configurar el commandProcessor en la máquina virtual
    virtualMachine.setCommandProcessor(commandProcessor);

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

// Función auxiliar para esperar respuesta con timeout
async function waitForResponse(command: string, timeoutMs: number = 3000): Promise<string> {
    return await firstValueFrom(
        from(machineResponse$).pipe(
            filter((responseCommand) => CommandDirector.getTo(command) === CommandDirector.getFrom(responseCommand)),
            timeout({
                first: timeoutMs,
                with: () => {
                    throw new Error('Timeout');
                }
            })
        )
    );
}

// Configuración de reintentos
const RETRY_CONFIG = {
    maxRetries: 2, // Cantidad de reintentos
    timeoutMs: 200 // Timeout en milisegundos
};

// Función auxiliar para enviar comando con reintento automático
async function sendCommandWithRetry(command: string): Promise<{ result?: string; error?: any }> {
    const { maxRetries, timeoutMs } = RETRY_CONFIG;

    // Loggear y enviar comando inicial
    addCommandLog(command);
    _onSoftwareWrite$.next(command);

    // Intentar hasta maxRetries + 1 veces (intento inicial + reintentos)
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const response = await waitForResponse(command, timeoutMs);
            return { result: response };
        } catch (error) {
            // Si es timeout y no es el último intento, reintentar
            if (error instanceof Error && error.message === 'Timeout' && attempt < maxRetries) {
                // Loggear y reenviar el comando
                addCommandLog(command);
                _onSoftwareWrite$.next(command);
                continue; // Continuar al siguiente intento
            }
            // Si no es timeout o es el último intento, retornar error
            return { error };
        }
    }

    // Este punto no debería alcanzarse, pero por seguridad
    return { error: new Error('Unexpected error in retry logic') };
}

export default {
    register: () => {
        // envió de comando: STW -> Máquina
        ipcMain.handle('software-write', async (_, { command }) => {
            return await sendCommandWithRetry(command);
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
            // Iniciar procesamiento de respuesta esperada ANTES de enviar el comando
            commandProcessor.startResponseProcessing(command);

            // escribir por el puerto USB
            const buffer = Buffer.from(command, 'latin1');

            await new Promise((resolve) => {
                serialPort.write(buffer, (err) => {
                    if (err !== null && err !== undefined) {
                        console.error('[MACHINE] ERROR: No se pudo enviar el comando', err);
                        resolve(false);
                    } else {
                    }
                });
                serialPort.drain((err) => {
                    if (err !== null && err !== undefined) {
                        console.error('[MACHINE] ERROR: No se pudo esperar a que se envie el comando', err);
                    } else {
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
