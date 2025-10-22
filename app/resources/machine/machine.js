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
const command_processor_1 = require("./command-processor");
const virtual_machine_1 = require("../virtual-machine/virtual-machine");
let logsSenders = [];
let serialPort;
let portList;
let connectionLogs;
let commandProcessor;
// Función para configurar el parser personalizado
function setupParser() {
    // Callbacks para manejar comandos recibidos
    const callbacks = {
        onCommandReceived: (command) => {
            machineResponse$.next(command);
        },
        onCommandLog: (command) => {
            addCommandLog(command);
        }
    };
    // Crear instancia del procesador
    commandProcessor = new command_processor_1.CommandProcessor(callbacks);
    // Configurar el commandProcessor en la máquina virtual
    virtual_machine_1.default.setCommandProcessor(commandProcessor);
    serialPort.on('data', (data) => {
        // Use 'latin1' encoding to preserve all byte values (0-255)
        const chunk = data.toString('latin1');
        commandProcessor.processDataChunk(chunk);
    });
}
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
// Función auxiliar para enviar comando con reintento automático
function sendCommandWithRetry(command) {
    return __awaiter(this, void 0, void 0, function* () {
        // Primer intento - timeout 3000ms
        try {
            const response = yield (0, rxjs_1.firstValueFrom)((0, rxjs_1.from)(machineResponse$).pipe((0, rxjs_1.filter)((responseCommand) => command_director_1.CommandDirector.getTo(command) === command_director_1.CommandDirector.getFrom(responseCommand)), (0, rxjs_1.timeout)({
                first: 3000,
                with: () => {
                    throw new Error('Timeout');
                }
            })));
            return { result: response };
        }
        catch (error) {
            // Si es timeout, intentar reenviar el comando
            if (error instanceof Error && error.message === 'Timeout') {
                // Loggear el reintento
                addCommandLog(command);
                // Reenviar el comando
                _onSoftwareWrite$.next(command);
                // Segundo intento - timeout 3000ms
                try {
                    const response = yield (0, rxjs_1.firstValueFrom)((0, rxjs_1.from)(machineResponse$).pipe((0, rxjs_1.filter)((responseCommand) => command_director_1.CommandDirector.getTo(command) === command_director_1.CommandDirector.getFrom(responseCommand)), (0, rxjs_1.timeout)({
                        first: 3000,
                        with: () => {
                            throw new Error('Timeout');
                        }
                    })));
                    return { result: response };
                }
                catch (secondError) {
                    return { error: secondError };
                }
            }
            // Si no es timeout, retornar el error original
            return { error };
        }
    });
}
exports.default = {
    register: () => {
        // envió de comando: STW -> Máquina
        electron_1.ipcMain.handle('software-write', (_, { command }) => __awaiter(void 0, void 0, void 0, function* () {
            addCommandLog(command);
            _onSoftwareWrite$.next(command);
            return yield sendCommandWithRetry(command);
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
        setupParser(); // Configurar el parser personalizado
    },
    createSearialPort: () => __awaiter(void 0, void 0, void 0, function* () {
        const HARDWARE_IDs = [
            {
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
            const port = ports.find(({ productId, vendorId, pnpId }) => HARDWARE_IDs.some(({ PRODUCT_ID, VENDOR_ID, PNP_ID }) => {
                var _a;
                return ((productId === null || productId === void 0 ? void 0 : productId.toUpperCase()) === PRODUCT_ID && (vendorId === null || vendorId === void 0 ? void 0 : vendorId.toUpperCase()) === VENDOR_ID) ||
                    (PNP_ID && ((_a = pnpId === null || pnpId === void 0 ? void 0 : pnpId.toUpperCase()) === null || _a === void 0 ? void 0 : _a.replace(/[\\/]/g, '-')) === PNP_ID);
            }));
            if (!port) {
                throw new Error('No se pudo abrir el puerto USB');
            }
            return new serialport_1.SerialPort({ path: port.path, baudRate: 19200 });
        }
        catch (err) {
            connectionLogs = err;
            return;
        }
    }),
    observeSoftwareWrite: (observable) => {
        observable.subscribe((command) => __awaiter(void 0, void 0, void 0, function* () {
            // Iniciar procesamiento de respuesta esperada ANTES de enviar el comando
            commandProcessor.startResponseProcessing(command);
            // escribir por el puerto USB
            const buffer = Buffer.from(command, 'latin1');
            yield new Promise((resolve) => {
                serialPort.write(buffer, (err) => {
                    if (err !== null && err !== undefined) {
                        console.error('[MACHINE] ERROR: No se pudo enviar el comando', err);
                        resolve(false);
                    }
                    else {
                    }
                });
                serialPort.drain((err) => {
                    if (err !== null && err !== undefined) {
                        console.error('[MACHINE] ERROR: No se pudo esperar a que se envie el comando', err);
                    }
                    else {
                    }
                    resolve(err === null || err === undefined);
                });
            });
        }));
    },
    onSoftwareWrite$: _onSoftwareWrite$.asObservable(),
    // Nueva función para limpiar recursos
    cleanup: () => {
        if (commandProcessor) {
            commandProcessor.cleanup();
        }
    }
};
//# sourceMappingURL=machine.js.map