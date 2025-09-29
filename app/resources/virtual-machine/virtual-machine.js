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
const secondary_window_1 = require("../secondary-window/secondary-window");
const TRANSMISSION_CONFIG = {
    baudRate: 19200,
    cableDelay: 0.1,
    machineProcessingDelay: 5,
    hardwareBufferDelay: 1.5,
    systemJitter: 2 // 2ms jitter variable
};
let secondaryWindowItem = null;
/**
 * Calcula el delay de transmisión realista para un carácter
 * @param config - Configuración de transmisión
 * @returns Delay en milisegundos
 */
function calculateCharTransmissionDelay(config) {
    // Tiempo por carácter basado en baud rate
    const charTime = 1000 / (config.baudRate / 10); // ~0.52ms para 19200 baud
    // Delay total = tiempo por carácter + delays fijos + jitter variable
    const fixedDelay = config.cableDelay + config.machineProcessingDelay + config.hardwareBufferDelay;
    const jitter = Math.random() * config.systemJitter; // Jitter aleatorio 0-2ms
    return charTime + fixedDelay + jitter;
}
/**
 * Simula transmisión realista carácter por carácter
 * @param command - Comando a transmitir
 * @param serialPort - Puerto serie mock
 */
function simulateRealisticTransmission(command, serialPort) {
    let charIndex = 0;
    function transmitNextChar() {
        if (charIndex >= command.length) {
            return; // Transmisión completada
        }
        // Emitir un solo carácter
        const char = command[charIndex];
        const buffer = Buffer.from(char, 'latin1');
        if (serialPort.port) {
            serialPort.port.emitData(buffer);
        }
        charIndex++;
        // Calcular delay para el siguiente carácter
        const delay = calculateCharTransmissionDelay(TRANSMISSION_CONFIG);
        // Programar siguiente carácter
        setTimeout(transmitNextChar, delay);
    }
    // Iniciar transmisión
    transmitNextChar();
}
binding_mock_1.MockBinding.createPort('/dev/ROBOT', { echo: true, record: true });
const serialPort = new stream_1.SerialPortStream({
    binding: binding_mock_1.MockBinding,
    path: '/dev/ROBOT',
    baudRate: 14400
});
exports.default = {
    /**
     * Actualiza la configuración de transmisión
     * @param config - Nueva configuración de transmisión
     */
    updateTransmissionConfig: (config) => {
        Object.assign(TRANSMISSION_CONFIG, config);
    },
    /**
     * Obtiene la configuración actual de transmisión
     */
    getTransmissionConfig: () => {
        return Object.assign({}, TRANSMISSION_CONFIG);
    },
    /**
     * Calcula el tiempo total de transmisión para un comando
     * @param commandLength - Longitud del comando
     * @returns Tiempo total estimado en milisegundos
     */
    calculateTotalTransmissionTime: (commandLength) => {
        const charDelay = calculateCharTransmissionDelay(TRANSMISSION_CONFIG);
        return charDelay * commandLength;
    },
    register: () => {
        electron_1.ipcMain.handle('open-virtual-machine', () => __awaiter(void 0, void 0, void 0, function* () {
            secondaryWindowItem = secondary_window_1.default.openWindow('maquina-virtual');
            if (!(serialPort === null || serialPort === void 0 ? void 0 : serialPort.isOpen)) {
                serialPort.open();
            }
            return secondaryWindowItem.id;
        }));
        electron_1.ipcMain.handle('close-virtual-machine', () => __awaiter(void 0, void 0, void 0, function* () {
            if (!(serialPort === null || serialPort === void 0 ? void 0 : serialPort.destroyed) && (serialPort === null || serialPort === void 0 ? void 0 : serialPort.isOpen)) {
                serialPort.close();
            }
            secondaryWindowItem === null || secondaryWindowItem === void 0 ? void 0 : secondaryWindowItem.close();
            return;
        }));
        // envió de comando Máquina virtual -> puerto USB (continua en parser.on)
        electron_1.ipcMain.handle('virtual-machine-write', (_, { command }) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            if (!(serialPort === null || serialPort === void 0 ? void 0 : serialPort.destroyed) && ((_a = serialPort.port) === null || _a === void 0 ? void 0 : _a.isOpen)) {
                // Simular transmisión realista carácter por carácter
                simulateRealisticTransmission(command, serialPort);
            }
        }));
    },
    getMockSerialPort: () => serialPort,
    observeSoftwareWrite: (observable) => {
        observable.subscribe((command) => {
            var _a;
            if ((secondaryWindowItem === null || secondaryWindowItem === void 0 ? void 0 : secondaryWindowItem.window) && !((_a = secondaryWindowItem.window) === null || _a === void 0 ? void 0 : _a.isDestroyed())) {
                secondaryWindowItem.window.webContents.send('handle-software-write', command);
            }
        });
    }
};
//# sourceMappingURL=virtual-machine.js.map