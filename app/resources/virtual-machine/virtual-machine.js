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
let window = null;
binding_mock_1.MockBinding.createPort('/dev/ROBOT', { echo: true, record: true });
const serialPort = new stream_1.SerialPortStream({
    binding: binding_mock_1.MockBinding,
    path: '/dev/ROBOT',
    baudRate: 14400,
});
function closeWindow() {
    if (window && !window.isDestroyed() && window.isClosable()) {
        window.close();
    }
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
                    allowRunningInsecureContent: true,
                    contextIsolation: false,
                },
                alwaysOnTop: true,
            });
            window.setMenuBarVisibility(false);
            window.loadURL('http://localhost:4200/maquina-virtual');
            if (!(serialPort === null || serialPort === void 0 ? void 0 : serialPort.isOpen)) {
                serialPort.open();
            }
            return;
        }));
        electron_1.ipcMain.handle('close-virtual-machine', () => __awaiter(void 0, void 0, void 0, function* () {
            if (serialPort === null || serialPort === void 0 ? void 0 : serialPort.isOpen) {
                serialPort.close();
            }
            closeWindow();
            return;
        }));
        // envió de comando Máquina virtual -> puerto USB (continua en parser.on)
        electron_1.ipcMain.handle('virtual-machine-write', (_, { command }) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            (_a = serialPort.port) === null || _a === void 0 ? void 0 : _a.emitData(command);
        }));
    },
    closeWindow,
    getMockSerialPort: () => serialPort,
    observeSoftwareWrite: (observable) => {
        observable.subscribe((command) => window === null || window === void 0 ? void 0 : window.webContents.send('handle-software-write', command));
    },
};
//# sourceMappingURL=virtual-machine.js.map