import { BrowserWindow, ipcMain } from 'electron';
import { MockBinding, MockBindingInterface } from '@serialport/binding-mock';
import { SerialPortStream } from '@serialport/stream';
import { Observable } from 'rxjs';

let window: BrowserWindow | null = null;

MockBinding.createPort('/dev/ROBOT', { echo: true, record: true });
const serialPort: SerialPortStream<MockBindingInterface> = new SerialPortStream(
  {
    binding: MockBinding,
    path: '/dev/ROBOT',
    baudRate: 14400,
  }
);

function closeWindow(): void {
  if (window && !window.isDestroyed() && window.isClosable()) {
    window.close();
  }
}

export default {
  register: () => {
    ipcMain.handle('open-virtual-machine', async () => {
      if (window && !window.isDestroyed()) {
        return;
      }
      window = new BrowserWindow({
        x: 0,
        y: 0,
        width: 1240,
        height: 720,
        webPreferences: {
          nodeIntegration: true,
          allowRunningInsecureContent: true,
          contextIsolation: false,
        },
        alwaysOnTop: true,
      });
      window.setMenuBarVisibility(false);
      window.loadURL('http://localhost:4200/maquina-virtual');
      if (!serialPort?.isOpen) {
        serialPort.open();
      }
      return;
    });

    ipcMain.handle('close-virtual-machine', async () => {
      if (serialPort?.isOpen) {
        serialPort.close();
      }
      closeWindow();
      return;
    });

    // envió de comando Máquina virtual -> puerto USB (continua en parser.on)
    ipcMain.handle('virtual-machine-write', async (_, { command }) => {
      serialPort.port?.emitData(command);
    });
  },
  closeWindow,
  getMockSerialPort: () => serialPort,
  observeSoftwareWrite: (observable: Observable<string>) => {
    observable.subscribe((command) =>
      window?.webContents.send('handle-software-write', command)
    );
  },
};
