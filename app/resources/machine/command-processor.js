"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandProcessor = void 0;
const command_size_1 = require("./command-size");
const constants_1 = require("./constants");
class CommandProcessor {
    constructor(callbacks) {
        this.dataBuffer = '';
        this.pendingResponse = null;
        this.PROCESSING_TIMEOUT = 100; // 100ms máximo para procesar respuesta
        this.callbacks = callbacks;
    }
    /**
     * Inicia el procesamiento de una respuesta esperada para un comando enviado
     * @param sentCommand - Comando que se envió
     */
    startResponseProcessing(sentCommand) {
        const expectedMapping = (0, command_size_1.getExpectedResponse)(sentCommand);
        if (!expectedMapping) {
            return;
        }
        // Limpiar respuesta pendiente anterior si existe
        this.clearPendingResponse();
        // Configurar nueva respuesta pendiente (sin timeout aún)
        this.pendingResponse = {
            expectedMapping,
            startTime: 0,
            timeoutId: null // Se creará cuando se reciba CHAR_START
        };
    }
    /**
     * Procesa un chunk de datos recibidos del puerto serie
     * @param chunk - Datos recibidos como string
     */
    processDataChunk(chunk) {
        this.dataBuffer += chunk;
        // Si no hay respuesta pendiente, descartar datos
        if (!this.pendingResponse) {
            this.dataBuffer = '';
            return;
        }
        // a. Start Character Detection - Iniciar timer cuando se reciba CHAR_START
        if (this.dataBuffer.length > 0 && this.dataBuffer[0] === constants_1.CHAR_START && this.pendingResponse.startTime === 0) {
            this.pendingResponse.startTime = Date.now();
            this.pendingResponse.timeoutId = setTimeout(() => {
                this.discardFrame();
            }, this.PROCESSING_TIMEOUT);
        }
        // Verificar si tenemos suficientes datos para procesar
        if (this.dataBuffer.length < this.pendingResponse.expectedMapping.responseSize) {
            return; // Esperar más datos
        }
        // Procesar la respuesta
        this.processResponse();
    }
    /**
     * Procesa la respuesta actual según el algoritmo mejorado
     */
    processResponse() {
        if (!this.pendingResponse) {
            return;
        }
        const { expectedMapping } = this.pendingResponse;
        const response = this.dataBuffer.substring(0, expectedMapping.responseSize);
        // a. Start Character Detection
        if (response[0] !== constants_1.CHAR_START) {
            this.discardFrame();
            return;
        }
        // b. Pattern Validation
        if (!this.validatePattern(response, expectedMapping)) {
            this.discardFrame();
            return;
        }
        // c. Command Size Validation
        if (response.length !== expectedMapping.responseSize) {
            this.discardFrame();
            return;
        }
        // d. End Character Validation
        if (response[response.length - 1] !== constants_1.CHAR_END) {
            this.discardFrame();
            return;
        }
        // e. Divider Positions Validation
        if (!this.validateDividers(response, expectedMapping.responseDividerPositions)) {
            this.discardFrame();
            return;
        }
        // Respuesta válida encontrada
        this.clearPendingResponse();
        this.callbacks.onCommandLog(response);
        this.callbacks.onCommandReceived(response);
        this.dataBuffer = '';
    }
    /**
     * Valida que el patrón de la respuesta coincida con el esperado
     */
    validatePattern(response, expectedMapping) {
        const regex = new RegExp(`^${expectedMapping.expectedResponse}`);
        const isValid = regex.test(response);
        return isValid;
    }
    /**
     * Valida que los dividers estén en las posiciones correctas
     */
    validateDividers(response, dividerPositions) {
        for (const position of dividerPositions) {
            if (position >= response.length) {
                console.log(`[COMMAND_PROCESSOR] ERROR: Posición ${position} fuera de rango (${response.length})`);
                return false;
            }
            if (response[position] !== constants_1.DIVIDER) {
                return false;
            }
        }
        return true;
    }
    /**
     * Descarta el frame actual y limpia el estado
     */
    discardFrame() {
        this.clearPendingResponse();
        this.dataBuffer = '';
    }
    /**
     * Limpia la respuesta pendiente y sus timeouts
     */
    clearPendingResponse() {
        if (this.pendingResponse) {
            if (this.pendingResponse.timeoutId) {
                clearTimeout(this.pendingResponse.timeoutId);
            }
            this.pendingResponse = null;
        }
    }
    /**
     * Limpia el timeout y resetea el estado del procesador
     */
    cleanup() {
        this.clearPendingResponse();
        this.dataBuffer = '';
    }
    /**
     * Obtiene el estado actual del procesador (útil para debugging)
     */
    getState() {
        var _a, _b;
        return {
            hasPendingResponse: this.pendingResponse !== null,
            bufferLength: this.dataBuffer.length,
            expectedResponse: (_a = this.pendingResponse) === null || _a === void 0 ? void 0 : _a.expectedMapping.expectedResponse,
            expectedSize: (_b = this.pendingResponse) === null || _b === void 0 ? void 0 : _b.expectedMapping.responseSize
        };
    }
}
exports.CommandProcessor = CommandProcessor;
//# sourceMappingURL=command-processor.js.map