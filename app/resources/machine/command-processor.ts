import { getExpectedResponse, CommandMapping } from './command-size';
import { CHAR_START, CHAR_END, DIVIDER } from './constants';

export interface CommandProcessorCallbacks {
    onCommandReceived: (command: string) => void;
    onCommandLog: (command: string) => void;
}

interface PendingResponse {
    expectedMapping: CommandMapping;
    startTime: number;
    timeoutId: NodeJS.Timeout | null;
}

export class CommandProcessor {
    private dataBuffer = '';
    private pendingResponse: PendingResponse | null = null;
    private callbacks: CommandProcessorCallbacks;
    private readonly PROCESSING_TIMEOUT = 100; // 100ms máximo para procesar respuesta

    constructor(callbacks: CommandProcessorCallbacks) {
        this.callbacks = callbacks;
    }

    /**
     * Inicia el procesamiento de una respuesta esperada para un comando enviado
     * @param sentCommand - Comando que se envió
     */
    startResponseProcessing(sentCommand: string): void {
        const expectedMapping = getExpectedResponse(sentCommand);

        if (!expectedMapping) {
            return;
        }

        // Limpiar respuesta pendiente anterior si existe
        this.clearPendingResponse();

        // Configurar nueva respuesta pendiente (sin timeout aún)
        this.pendingResponse = {
            expectedMapping,
            startTime: 0, // Se establecerá cuando se reciba CHAR_START
            timeoutId: null // Se creará cuando se reciba CHAR_START
        };
    }

    /**
     * Procesa un chunk de datos recibidos del puerto serie
     * @param chunk - Datos recibidos como string
     */
    processDataChunk(chunk: string): void {
        this.dataBuffer += chunk;
        // Si no hay respuesta pendiente, descartar datos
        if (!this.pendingResponse) {
            this.dataBuffer = '';
            return;
        }

        // a. Start Character Detection - Iniciar timer cuando se reciba CHAR_START
        if (this.dataBuffer.length > 0 && this.dataBuffer[0] === CHAR_START && this.pendingResponse.startTime === 0) {
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
    private processResponse(): void {
        if (!this.pendingResponse) {
            return;
        }

        const { expectedMapping } = this.pendingResponse;
        const response = this.dataBuffer.substring(0, expectedMapping.responseSize);
        console.log('response', response);

        // a. Start Character Detection
        if (response[0] !== CHAR_START) {
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
        if (response[response.length - 1] !== CHAR_END) {
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
    private validatePattern(response: string, expectedMapping: CommandMapping): boolean {
        const regex = new RegExp(`^${expectedMapping.expectedResponse}`);
        const isValid = regex.test(response);
        return isValid;
    }

    /**
     * Valida que los dividers estén en las posiciones correctas
     */
    private validateDividers(response: string, dividerPositions: number[]): boolean {
        for (const position of dividerPositions) {
            if (position >= response.length) {
                return false;
            }
            if (response[position] !== DIVIDER) {
                return false;
            }
        }
        return true;
    }

    /**
     * Descarta el frame actual y limpia el estado
     */
    private discardFrame(): void {
        console.log('discardFrame', this.dataBuffer);
        this.clearPendingResponse();
        this.dataBuffer = '';
    }

    /**
     * Limpia la respuesta pendiente y sus timeouts
     */
    private clearPendingResponse(): void {
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
    cleanup(): void {
        this.clearPendingResponse();
        this.dataBuffer = '';
    }

    /**
     * Obtiene el estado actual del procesador (útil para debugging)
     */
    getState(): {
        hasPendingResponse: boolean;
        bufferLength: number;
        expectedResponse?: string;
        expectedSize?: number;
    } {
        return {
            hasPendingResponse: this.pendingResponse !== null,
            bufferLength: this.dataBuffer.length,
            expectedResponse: this.pendingResponse?.expectedMapping.expectedResponse,
            expectedSize: this.pendingResponse?.expectedMapping.responseSize
        };
    }
}
