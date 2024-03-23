import { BrowserWindow, ipcMain } from 'electron';
import { MockBinding, MockBindingInterface } from '@serialport/binding-mock';
import { SerialPortStream } from '@serialport/stream';
import { DelimiterParser } from 'serialport';

let virtualMachineWindow: BrowserWindow | null = null;
let softwareWindow: BrowserWindow | null = null;
let serialPort: SerialPortStream<MockBindingInterface>;
const parser = new DelimiterParser({
  delimiter: '\n',
  includeDelimiter: false,
});

function closeWindow(): void {
  if (
    virtualMachineWindow &&
    !virtualMachineWindow.isDestroyed() &&
    virtualMachineWindow.isClosable()
  ) {
    virtualMachineWindow.close();
    disconnect();
  }
}

function connect(): void {
  MockBinding.createPort('/dev/ROBOT', { echo: true, record: true });
  serialPort = new SerialPortStream({
    binding: MockBinding,
    path: '/dev/ROBOT',
    baudRate: 14400,
  });
  parser.removeAllListeners();

  // envio de comando puerto USB -> Sw
  parser.on('data', (data) => {
    softwareWindow?.webContents.send('on-data-usb', data.toString('ascii'));
  });
  serialPort.pipe(parser);
}

function disconnect(): void {
  serialPort.close();
  parser.removeAllListeners();
}

export default {
  register: () => {
    ipcMain.handle('open-virtual-machine', async () => {
      if (virtualMachineWindow && !virtualMachineWindow.isDestroyed()) {
        return;
      }
      virtualMachineWindow = new BrowserWindow({
        x: 0,
        y: 0,
        width: 1240,
        height: 720,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
        },
        alwaysOnTop: true,
      });
      virtualMachineWindow.setMenuBarVisibility(false);
      virtualMachineWindow.loadURL('http://localhost:4200/maquina-virtual');
      connect();
      return;
    });
    ipcMain.handle('close-virtual-machine', async () => {
      closeWindow();
      return;
    });

    // envió de comando Máquina virtual -> puerto USB (continua en parser.on)
    ipcMain.handle('virtual-machine-write', async (_, { command }) => {
      serialPort.port?.emitData(command);
    });

    // envió de comando Sw -> Máquina
    ipcMain.handle('software-write', async (_, { command }) => {
      // redirección del comando a la máquina virtual
      virtualMachineWindow?.webContents.send('handle-software-write', command);
    });
  },
  closeWindow,
  setSoftwareWindow: (window: BrowserWindow | null) => {
    softwareWindow = window;
  },
};
