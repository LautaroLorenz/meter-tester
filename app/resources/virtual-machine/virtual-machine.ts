import { ipcMain } from 'electron';
import { MockBinding, MockBindingInterface } from '@serialport/binding-mock';
import { SerialPortStream } from '@serialport/stream';
import { Observable } from 'rxjs';
import secondaryWindow from '../secondary-window/secondary-window';
import { WindowItem } from '../secondary-window/models/window-item.model';

// Configuración de simulación de transmisión real
interface TransmissionConfig {
    baudRate: number; // Velocidad de transmisión
    cableDelay: number; // Delay del cable (ms)
    machineProcessingDelay: number; // Delay fijo del procesador de la máquina (ms)
    hardwareBufferDelay: number; // Delay del buffer de hardware (ms)
    systemJitter: number; // Jitter variable del sistema (ms)
}

const TRANSMISSION_CONFIG: TransmissionConfig = {
    baudRate: 19200, // 19200 baud
    cableDelay: 0.1, // 20m cable ≈ 0.1ms (despreciable)
    machineProcessingDelay: 5, // 5ms fijo del procesador
    hardwareBufferDelay: 1.5, // 1.5ms buffer hardware
    systemJitter: 2 // 2ms jitter variable
};

let secondaryWindowItem: WindowItem | null = null;

/**
 * Calcula el delay de transmisión realista para un carácter
 * @param config - Configuración de transmisión
 * @returns Delay en milisegundos
 */
function calculateCharTransmissionDelay(config: TransmissionConfig): number {
    // Tiempo por carácter basado en baud rate
    const charTime = 1000 / (config.baudRate / 10); // ~0.52ms para 19200 baud

    // Delay total = tiempo por carácter + delays fijos + jitter variable
    const fixedDelay = config.cableDelay + config.machineProcessingDelay + config.hardwareBufferDelay;
    const jitter = Math.random() * config.systemJitter; // Jitter aleatorio 0-2ms

    return charTime + fixedDelay + jitter;
}

/**
 * Simula transmisión realista carácter por carácter
 * @param command - Comando a transmitir
 * @param serialPort - Puerto serie mock
 */
function simulateRealisticTransmission(command: string, serialPort: SerialPortStream<MockBindingInterface>): void {
    let charIndex = 0;

    function transmitNextChar(): void {
        if (charIndex >= command.length) {
            return; // Transmisión completada
        }

        // Emitir un solo carácter
        const char = command[charIndex];
        const buffer = Buffer.from(char, 'latin1');
        if (serialPort.port) {
            serialPort.port.emitData(buffer);
        }

        charIndex++;

        // Calcular delay para el siguiente carácter
        const delay = calculateCharTransmissionDelay(TRANSMISSION_CONFIG);

        // Programar siguiente carácter
        setTimeout(transmitNextChar, delay);
    }

    // Iniciar transmisión
    transmitNextChar();
}

MockBinding.createPort('/dev/ROBOT', { echo: true, record: true });
const serialPort: SerialPortStream<MockBindingInterface> = new SerialPortStream({
    binding: MockBinding,
    path: '/dev/ROBOT',
    baudRate: 14400
});

export default {
    /**
     * Actualiza la configuración de transmisión
     * @param config - Nueva configuración de transmisión
     */
    updateTransmissionConfig: (config: Partial<TransmissionConfig>) => {
        Object.assign(TRANSMISSION_CONFIG, config);
    },

    /**
     * Obtiene la configuración actual de transmisión
     */
    getTransmissionConfig: (): TransmissionConfig => {
        return { ...TRANSMISSION_CONFIG };
    },

    /**
     * Calcula el tiempo total de transmisión para un comando
     * @param commandLength - Longitud del comando
     * @returns Tiempo total estimado en milisegundos
     */
    calculateTotalTransmissionTime: (commandLength: number): number => {
        const charDelay = calculateCharTransmissionDelay(TRANSMISSION_CONFIG);
        return charDelay * commandLength;
    },

    register: () => {
        ipcMain.handle('open-virtual-machine', async () => {
            secondaryWindowItem = secondaryWindow.openWindow('maquina-virtual');
            if (!serialPort?.isOpen) {
                serialPort.open();
            }
            return secondaryWindowItem.id;
        });

        ipcMain.handle('close-virtual-machine', async () => {
            if (!serialPort?.destroyed && serialPort?.isOpen) {
                serialPort.close();
            }
            secondaryWindowItem?.close();
            return;
        });

        // envió de comando Máquina virtual -> puerto USB (continua en parser.on)
        ipcMain.handle('virtual-machine-write', async (_, { command }) => {
            if (!serialPort?.destroyed && serialPort.port?.isOpen) {
                // Simular transmisión realista carácter por carácter
                simulateRealisticTransmission(command, serialPort);
            }
        });
    },
    getMockSerialPort: () => serialPort,
    observeSoftwareWrite: (observable: Observable<string>) => {
        observable.subscribe((command) => {
            if (secondaryWindowItem?.window && !secondaryWindowItem.window?.isDestroyed()) {
                secondaryWindowItem.window.webContents.send('handle-software-write', command);
            }
        });
    }
};
