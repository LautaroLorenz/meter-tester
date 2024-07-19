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
const command_director_1 = require("./command-director");
let logsSenders = [];
let serialPort;
let portList;
let connectionLogs;
const parser = new serialport_1.DelimiterParser({
    delimiter: '\n',
    includeDelimiter: false
});
parser.removeAllListeners();
parser.on('data', (data) => {
    const response = data.toString('ascii');
    addCommandLog(response);
    machineResponse$.next(response);
});
const machineResponse$ = new rxjs_1.Subject();
const _onSoftwareWrite$ = new rxjs_1.Subject();
const commandLog$ = new rxjs_1.BehaviorSubject([]);
function addCommandLog(command) {
    // solamente logueamos si hay senders a los que enviar los logs
    if (!logsSenders.length) {
        return;
    }
    commandLog$.next([...commandLog$.value, command]);
}
function clearCommandLog() {
    commandLog$.next([]);
}
commandLog$
    .pipe((0, rxjs_1.tap)((value) => {
    logsSenders.forEach((sender) => {
        if (!sender.isDestroyed()) {
            sender.send('command-history', value);
        }
        else {
            logsSenders = logsSenders.filter((sender) => !sender.isDestroyed());
        }
    });
}))
    .subscribe();
exports.default = {
    register: () => {
        // envió de comando: STW -> Máquina
        electron_1.ipcMain.handle('software-write', (_, { command }) => __awaiter(void 0, void 0, void 0, function* () {
            addCommandLog(command);
            _onSoftwareWrite$.next(command);
            try {
                const response = yield (0, rxjs_1.firstValueFrom)((0, rxjs_1.from)(machineResponse$).pipe((0, rxjs_1.filter)((responseCommand) => command_director_1.CommandDirector.getTo(command) === command_director_1.CommandDirector.getFrom(responseCommand)), (0, rxjs_1.timeout)({
                    first: 6000,
                    with: () => {
                        throw new Error('Timeout');
                    }
                })));
                return { result: response };
            }
            catch (error) {
                return { error };
            }
        }));
        electron_1.ipcMain.handle('subscribe-to-history', (event) => {
            if (logsSenders.some(({ id }) => event.sender.id === id)) {
                return;
            }
            logsSenders.push(event.sender);
            return;
        });
        electron_1.ipcMain.on('clear-history', () => {
            clearCommandLog();
        });
        electron_1.ipcMain.handle('check-connection-logs', () => __awaiter(void 0, void 0, void 0, function* () {
            return {
                connectionLogs: connectionLogs,
                ports: portList
            };
        }));
    },
    setSerialPort: (serialPortInput) => {
        serialPort = serialPortInput;
        serialPort.pipe(parser);
    },
    createSearialPort: () => __awaiter(void 0, void 0, void 0, function* () {
        const HARDWARE_IDs = [{
                PRODUCT_ID: '7523',
                VENDOR_ID: '1A86',
                PNP_ID: undefined
            }
            // Ejemplo con PNP_ID
            // {
            //     PRODUCT_ID: '2303',
            //     VENDOR_ID: '067B',
            //     PNP_ID: 'ACPI-PNP0501-2'
            // }
        ];
        const ports = yield serialport_1.SerialPort.list();
        portList = ports;
        try {
            const port = ports
                .find(({ productId, vendorId, pnpId }) => HARDWARE_IDs
                .some(({ PRODUCT_ID, VENDOR_ID, PNP_ID }) => {
                var _a;
                return ((productId === null || productId === void 0 ? void 0 : productId.toUpperCase()) === PRODUCT_ID && (vendorId === null || vendorId === void 0 ? void 0 : vendorId.toUpperCase()) === VENDOR_ID) ||
                    (PNP_ID && ((_a = pnpId === null || pnpId === void 0 ? void 0 : pnpId.toUpperCase()) === null || _a === void 0 ? void 0 : _a.replace(/[\\/]/g, '-')) === PNP_ID);
            }));
            if (!port) {
                throw new Error('No se pudo abrir el puerto USB');
            }
            return new serialport_1.SerialPort({ path: port.path, baudRate: 9600 });
        }
        catch (err) {
            connectionLogs = err;
            return;
        }
    }),
    observeSoftwareWrite: (observable) => {
        observable.subscribe((command) => __awaiter(void 0, void 0, void 0, function* () {
            // escribir por el puerto USB
            const buffer = Buffer.from(command, 'ascii');
            // const checksum = getChecksumByte(buffer);
            // const checksumBuffer = decimalChecksumToBuffer(checksum);
            // const commandBuffer = Buffer.concat([buffer, checksumBuffer]);
            // TODO esta linea no va
            // FIXME arreglar la maquina virtual cunado escribo el comando
            const commandBuffer = buffer;
            const coludBeSent = yield new Promise((resolve) => {
                serialPort.write(commandBuffer, (err) => {
                    if (err !== null && err !== undefined) {
                        console.error('No se pudo enviar el comando', err);
                        resolve(false);
                    }
                });
                serialPort.drain((err) => {
                    if (err !== null && err !== undefined) {
                        console.error('No se pudo esperar a que se envie el comando', err);
                    }
                    resolve(err === null || err === undefined);
                });
            });
        }));
    },
    onSoftwareWrite$: _onSoftwareWrite$.asObservable()
};
//# sourceMappingURL=machine.js.map