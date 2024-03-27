import { ipcMain } from 'electron';
import { SerialPort, DelimiterParser } from 'serialport';
import { BindingInterface } from '@serialport/bindings-interface';
import { Subject, filter, firstValueFrom, from, timeout } from 'rxjs';
import { CommandDirector } from '../../../src/app/models/business/class/command-director.model';
import { SerialPortStream } from '@serialport/stream';

let serialPort: SerialPortStream<BindingInterface>;
const parser = new DelimiterParser({
  delimiter: '\n',
  includeDelimiter: false,
});
parser.removeAllListeners();
parser.on('data', (data) => {
  machineResponse$.next(data.toString('ascii'));
});
const machineResponse$ = new Subject<string>();
const _onSoftwareWrite$ = new Subject<string>();

export default {
  register: () => {
    // envió de comando: STW -> Máquina
    ipcMain.handle('software-write', async (_, { command }) => {
      _onSoftwareWrite$.next(command);

      try {
        const response = await firstValueFrom(
          from(machineResponse$).pipe(
            filter(
              (responseCommand) =>
                CommandDirector.getTo(command) ===
                CommandDirector.getFrom(responseCommand)
            ),
            timeout({
              first: 3000,
              with: () => {
                throw new Error('Timeout');
              },
            })
          )
        );
        return { result: response };
      } catch (error) {
        return { error };
      }
    });
  },
  setSerialPort: (serialPortInput: SerialPortStream) => {
    serialPort = serialPortInput;
    serialPort.pipe(parser);
  },
  createSearialPort: async () => {
    const PRODUCT_ID = ''; // TODO
    const VENDOR_ID = ''; // TODO
    const ports = await SerialPort.list();
    const port = ports.find(
      ({ productId, vendorId }) =>
        productId === PRODUCT_ID && vendorId === VENDOR_ID
    );
    if (!port) {
      throw new Error('No se pudo abrir el puerto USB');
    }
    return new SerialPort({ path: port.path, baudRate: 9600 });
  },
  onSoftwareWrite$: _onSoftwareWrite$.asObservable(),
};
