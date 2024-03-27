"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const serialport_1 = require("serialport");
const rxjs_1 = require("rxjs");
const command_director_model_1 = require("../../../src/app/models/business/class/command-director.model");
let serialPort;
const parser = new serialport_1.DelimiterParser({
    delimiter: '\n',
    includeDelimiter: false,
});
parser.removeAllListeners();
parser.on('data', (data) => {
    machineResponse$.next(data.toString('ascii'));
});
const machineResponse$ = new rxjs_1.Subject();
const _onSoftwareWrite$ = new rxjs_1.Subject();
exports.default = {
    register: () => {
        // envió de comando: STW -> Máquina
        electron_1.ipcMain.handle('software-write', (_, { command }) => __awaiter(void 0, void 0, void 0, function* () {
            _onSoftwareWrite$.next(command);
            try {
                const response = yield (0, rxjs_1.firstValueFrom)((0, rxjs_1.from)(machineResponse$).pipe((0, rxjs_1.filter)((responseCommand) => command_director_model_1.CommandDirector.getTo(command) ===
                    command_director_model_1.CommandDirector.getFrom(responseCommand)), (0, rxjs_1.timeout)({
                    first: 3000,
                    with: () => {
                        throw new Error('Timeout');
                    },
                })));
                return { result: response };
            }
            catch (error) {
                return { error };
            }
        }));
    },
    setSerialPort: (serialPortInput) => {
        serialPort = serialPortInput;
        serialPort.pipe(parser);
    },
    createSearialPort: () => __awaiter(void 0, void 0, void 0, function* () {
        const PRODUCT_ID = ''; // TODO
        const VENDOR_ID = ''; // TODO
        const ports = yield serialport_1.SerialPort.list();
        const port = ports.find(({ productId, vendorId }) => productId === PRODUCT_ID && vendorId === VENDOR_ID);
        if (!port) {
            throw new Error('No se pudo abrir el puerto USB');
        }
        return new serialport_1.SerialPort({ path: port.path, baudRate: 9600 });
    }),
    onSoftwareWrite$: _onSoftwareWrite$.asObservable(),
};
//# sourceMappingURL=machine.js.map