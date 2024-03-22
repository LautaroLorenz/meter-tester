import { BrowserWindow, ipcMain } from 'electron';
import { MockBinding } from '@serialport/binding-mock';
import { SerialPortStream } from '@serialport/stream';
import { DelimiterParser } from 'serialport';

let window: BrowserWindow | null = null;
let serialPort: SerialPortStream;
const parser = new DelimiterParser({
  delimiter: '\n',
  includeDelimiter: false,
});

function closeWindow(): void {
  if (window && !window.isDestroyed() && window.isClosable()) {
    window.close();
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
  parser.on('data', (data) => {
    // TODO llega un dato por el puerto serial, esto sucede cuando virtual machine envia una respuesta mock al software.
    // TODO data.toString('ascii')
    console.log('parser.on data', data);
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
          contextIsolation: false,
        },
      });
      window.setMenuBarVisibility(false);
      window.loadURL('http://localhost:4200/maquina-virtual');
      connect();
      return;
    });
    ipcMain.handle('close-virtual-machine', async () => {
      closeWindow();
      return;
    });
    ipcMain.handle('software-write', async (_, { command }) => {
      // TODO procesar el comando que el software intenta enviar a la máquina y generar una respuesta fake,
      // TODO luego enviar una respuesta como si hubiera llegado a travez del USB conectado a la máquina.
      window?.webContents.send('handle-software-write', command);
    });
  },
  closeWindow,
};
