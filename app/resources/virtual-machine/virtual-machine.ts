import { ipcMain } from 'electron';
import { MockBinding, MockBindingInterface } from '@serialport/binding-mock';
import { SerialPortStream } from '@serialport/stream';
import { Observable } from 'rxjs';
import secondaryWindow from '../secondary-window/secondary-window';
import { WindowItem } from '../secondary-window/models/window-item.model';

let secondaryWindowItem: WindowItem | null = null;

MockBinding.createPort('/dev/ROBOT', { echo: true, record: true });
const serialPort: SerialPortStream<MockBindingInterface> = new SerialPortStream({
    binding: MockBinding,
    path: '/dev/ROBOT',
    baudRate: 14400
});

export default {
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
                serialPort.port.emitData(command);
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
