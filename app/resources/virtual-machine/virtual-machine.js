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
const rxjs_1 = require("rxjs");
const command_director_model_1 = require("../../src/app/models/business/class/command-director.model");
let virtualMachineWindow = null;
let softwareWindow = null;
let serialPort;
const parser = new serialport_1.DelimiterParser({
    delimiter: '\n',
    includeDelimiter: false,
});
const virtualMachineResponse$ = new rxjs_1.Subject();
function closeWindow() {
    if (virtualMachineWindow &&
        !virtualMachineWindow.isDestroyed() &&
        virtualMachineWindow.isClosable()) {
        virtualMachineWindow.close();
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
    // envio de comando puerto USB -> Sw
    parser.on('data', (data) => {
        // TODO delete softwareWindow?.webContents.send('on-data-usb', data.toString('ascii'));
        virtualMachineResponse$.next(data.toString('ascii'));
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
            if (virtualMachineWindow && !virtualMachineWindow.isDestroyed()) {
                return;
            }
            virtualMachineWindow = new electron_1.BrowserWindow({
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
            virtualMachineWindow.setMenuBarVisibility(false);
            virtualMachineWindow.loadURL('http://localhost:4200/maquina-virtual');
            connect();
            return;
        }));
        electron_1.ipcMain.handle('close-virtual-machine', () => __awaiter(void 0, void 0, void 0, function* () {
            closeWindow();
            return;
        }));
        // envió de comando Máquina virtual -> puerto USB (continua en parser.on)
        electron_1.ipcMain.handle('virtual-machine-write', (_, { command }) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            (_a = serialPort.port) === null || _a === void 0 ? void 0 : _a.emitData(command);
        }));
        // envió de comando Sw -> Máquina
        electron_1.ipcMain.handle('software-write', (_, { command }) => __awaiter(void 0, void 0, void 0, function* () {
            // redirección del comando a la máquina virtual
            virtualMachineWindow === null || virtualMachineWindow === void 0 ? void 0 : virtualMachineWindow.webContents.send('handle-software-write', command);
            const response = yield (0, rxjs_1.firstValueFrom)(virtualMachineResponse$
                .asObservable()
                .pipe((0, rxjs_1.filter)((responseCommand) => command_director_model_1.CommandDirector.getTo(command) ===
                command_director_model_1.CommandDirector.getFrom(responseCommand))));
            return response;
        }));
    },
    closeWindow,
    setSoftwareWindow: (window) => {
        if (!window) {
            throw new Error('Error abriendo máquina virtual');
        }
        softwareWindow = window;
    },
};
//# sourceMappingURL=virtual-machine.js.map