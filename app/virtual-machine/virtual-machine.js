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
const binding_mock_1 = require("@serialport/binding-mock");
const stream_1 = require("@serialport/stream");
const serialport_1 = require("serialport");
let window = null;
let serialPort;
const parser = new serialport_1.DelimiterParser({
    delimiter: '\n',
    includeDelimiter: false,
});
function closeWindow() {
    if (window && !window.isDestroyed() && window.isClosable()) {
        window.close();
        disconnect();
    }
}
function connect() {
    binding_mock_1.MockBinding.createPort('/dev/ROBOT', { echo: true, record: true });
    serialPort = new stream_1.SerialPortStream({
        binding: binding_mock_1.MockBinding,
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
function disconnect() {
    serialPort.close();
    parser.removeAllListeners();
}
exports.default = {
    register: () => {
        electron_1.ipcMain.handle('open-virtual-machine', () => __awaiter(void 0, void 0, void 0, function* () {
            if (window && !window.isDestroyed()) {
                return;
            }
            window = new electron_1.BrowserWindow({
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
        }));
        electron_1.ipcMain.handle('close-virtual-machine', () => __awaiter(void 0, void 0, void 0, function* () {
            closeWindow();
            return;
        }));
        electron_1.ipcMain.handle('software-write', (_, { command }) => __awaiter(void 0, void 0, void 0, function* () {
            // TODO procesar el comando que el software intenta enviar a la máquina y generar una respuesta fake,
            // TODO luego enviar una respuesta como si hubiera llegado a travez del USB conectado a la máquina.
            window === null || window === void 0 ? void 0 : window.webContents.send('handle-software-write', command);
        }));
    },
    closeWindow,
};
//# sourceMappingURL=virtual-machine.js.map