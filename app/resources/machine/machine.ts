import { WebContents, ipcMain } from 'electron';
import { SerialPort } from 'serialport';
import { BindingInterface } from '@serialport/bindings-interface';
import { BehaviorSubject, Observable, Subject, filter, firstValueFrom, from, tap, timeout } from 'rxjs';
import { SerialPortStream } from '@serialport/stream';
import { CommandDirector } from './command-director';
import { CommandsSizes, CommandSize } from './command-size';
import { CHAR_END, DIVIDER } from './constants';

let logsSenders: WebContents[] = [];
let serialPort: SerialPortStream<BindingInterface>;
let portList: any;
let connectionLogs: any;

// Buffer para acumular datos hasta encontrar el final del comando
let commandBuffer = '';
// Timeout para esperar datos adicionales
let dataTimeout: NodeJS.Timeout | null = null;
// Tiempo de espera en milisegundos (ajustable)
const DATA_WAIT_TIMEOUT = 100; // 100ms de espera
// Tiempo máximo de espera
const MAX_DATA_WAIT_TIMEOUT = 500; // 500ms máximo
// Contador de intentos de procesamiento
let processingAttempts = 0;

// Función para configurar el parser personalizado
function setupParser() {
    serialPort.on('data', (data) => {
        // Use 'latin1' encoding to preserve all byte values (0-255)
        const chunk = data.toString('latin1');
        commandBuffer += chunk;

        // Cancelar timeout anterior si existe
        if (dataTimeout) {
            clearTimeout(dataTimeout);
        }

        // Calcular timeout adaptativo
        const adaptiveTimeout = Math.min(DATA_WAIT_TIMEOUT + processingAttempts * 10, MAX_DATA_WAIT_TIMEOUT);

        // Establecer nuevo timeout para procesar después de un breve período
        dataTimeout = setTimeout(() => {
            processCommands();
            dataTimeout = null;
        }, adaptiveTimeout);
    });
}

function processCommands() {
    processingAttempts++;
    const initialBufferLength = commandBuffer.length;

    while (commandBuffer.length > 0) {
        // Buscar el primer comando que coincida con algún patrón
        const recognizedCommand = findRecognizedCommand(commandBuffer);

        if (recognizedCommand) {
            const { command, commandSize } = recognizedCommand;

            // Verificar que el comando tenga el tamaño correcto
            if (command.length === commandSize.size) {
                // Verificar que termine en 'Z'
                if (command.endsWith(CHAR_END)) {
                    // Verificar que los dividers estén en las posiciones correctas
                    if (validateDividers(command, commandSize.dividerPositions)) {
                        // Comando válido encontrado
                        addCommandLog(command);
                        machineResponse$.next(command);

                        // Remover el comando procesado del buffer
                        commandBuffer = commandBuffer.substring(command.length);
                        processingAttempts = 0; // Resetear contador al procesar exitosamente
                        continue;
                    } else {
                        // Remover el comando completo ya que sabemos su tamaño
                        commandBuffer = commandBuffer.substring(command.length);
                        continue;
                    }
                } else {
                    // Remover el comando completo ya que sabemos su tamaño
                    commandBuffer = commandBuffer.substring(command.length);
                    continue;
                }
            } else if (command.length < commandSize.size) {
                break;
            } else {
                // El comando es más largo de lo esperado, remover el comando completo
                commandBuffer = commandBuffer.substring(command.length);
                continue;
            }
        } else {
            // No se encontró ningún patrón reconocido, remover el primer carácter
            commandBuffer = commandBuffer.substring(1);
        }
    }
}

function findRecognizedCommand(buffer: string): { command: string; commandSize: CommandSize } | null {
    for (const commandSize of CommandsSizes) {
        // Usar directamente el patrón como regex (ya está escapado en CommandsSizes)
        const regex = new RegExp(`^${commandSize.pattern}`);

        // Verificar si el buffer hace match con el patrón regex
        if (regex.test(buffer)) {
            // Si el buffer tiene al menos el tamaño mínimo para este comando, extraer el comando
            if (buffer.length >= commandSize.size) {
                const command = buffer.substring(0, commandSize.size);
                return { command, commandSize };
            } else {
                // No tenemos suficientes datos para este comando, pero el patrón coincide
                return null;
            }
        }
    }
    return null;
}

function validateDividers(command: string, dividerPositions: number[]): boolean {
    for (const position of dividerPositions) {
        // Verificar que la posición esté dentro del rango del comando
        if (position < command.length) {
            // Verificar que en esa posición haya un divider '|'
            if (command[position] !== DIVIDER) {
                return false;
            }
        } else {
            // Si la posición está fuera del rango, el comando no es válido
            return false;
        }
    }
    return true;
}

// Función para limpiar el timeout al cerrar la conexión
function clearDataTimeout() {
    if (dataTimeout) {
        clearTimeout(dataTimeout);
        dataTimeout = null;
    }
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
    onSoftwareWrite$: _onSoftwareWrite$.asObservable(),
    // Nueva función para limpiar recursos
    cleanup: () => {
        clearDataTimeout();
    }
};
