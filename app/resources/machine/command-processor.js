"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandProcessor = void 0;
const command_size_1 = require("./command-size");
const constants_1 = require("./constants");
class CommandProcessor {
    constructor(config, callbacks) {
        this.commandBuffer = '';
        this.dataTimeout = null;
        this.processingAttempts = 0;
        this.config = config;
        this.callbacks = callbacks;
    }
    /**
     * Procesa un chunk de datos recibidos del puerto serie
     * @param chunk - Datos recibidos como string
     */
    processDataChunk(chunk) {
        this.commandBuffer += chunk;
        // Cancelar timeout anterior si existe
        if (this.dataTimeout) {
            clearTimeout(this.dataTimeout);
        }
        // Calcular timeout adaptativo
        const adaptiveTimeout = Math.min(this.config.dataWaitTimeout + this.processingAttempts * 10, this.config.maxDataWaitTimeout);
        // Establecer nuevo timeout para procesar después de un breve período
        this.dataTimeout = setTimeout(() => {
            this.processCommands();
            this.dataTimeout = null;
        }, adaptiveTimeout);
    }
    /**
     * Procesa todos los comandos completos en el buffer
     */
    processCommands() {
        this.processingAttempts++;
        while (this.commandBuffer.length > 0) {
            // Buscar el primer comando que coincida con algún patrón
            const recognizedCommand = this.findRecognizedCommand(this.commandBuffer);
            if (recognizedCommand) {
                const { command, commandSize } = recognizedCommand;
                // Verificar que el comando tenga el tamaño correcto
                if (command.length === commandSize.size) {
                    // Verificar que termine en 'Z'
                    if (command.endsWith(constants_1.CHAR_END)) {
                        // Verificar que los dividers estén en las posiciones correctas
                        if (this.validateDividers(command, commandSize.dividerPositions)) {
                            // Comando válido encontrado
                            this.callbacks.onCommandLog(command);
                            this.callbacks.onCommandReceived(command);
                            // Remover el comando procesado del buffer
                            this.commandBuffer = this.commandBuffer.substring(command.length);
                            this.processingAttempts = 0; // Resetear contador al procesar exitosamente
                            continue;
                        }
                        else {
                            // Remover el comando completo ya que sabemos su tamaño
                            this.commandBuffer = this.commandBuffer.substring(command.length);
                            continue;
                        }
                    }
                    else {
                        // Remover el comando completo ya que sabemos su tamaño
                        this.commandBuffer = this.commandBuffer.substring(command.length);
                        continue;
                    }
                }
                else if (command.length < commandSize.size) {
                    break;
                }
                else {
                    // El comando es más largo de lo esperado, remover el comando completo
                    this.commandBuffer = this.commandBuffer.substring(command.length);
                    continue;
                }
            }
            else {
                // No se encontró ningún patrón reconocido, remover el primer carácter
                this.commandBuffer = this.commandBuffer.substring(1);
            }
        }
    }
    /**
     * Busca un comando reconocido en el buffer
     * @param buffer - Buffer de datos a analizar
     * @returns Comando encontrado y su tamaño, o null si no se encuentra
     */
    findRecognizedCommand(buffer) {
        for (const commandSize of command_size_1.CommandsSizes) {
            // Usar directamente el patrón como regex (ya está escapado en CommandsSizes)
            const regex = new RegExp(`^${commandSize.pattern}`);
            // Verificar si el buffer hace match con el patrón regex
            if (regex.test(buffer)) {
                // Si el buffer tiene al menos el tamaño mínimo para este comando, extraer el comando
                if (buffer.length >= commandSize.size) {
                    const command = buffer.substring(0, commandSize.size);
                    return { command, commandSize };
                }
                else {
                    // No tenemos suficientes datos para este comando, pero el patrón coincide
                    return null;
                }
            }
        }
        return null;
    }
    /**
     * Valida que los dividers estén en las posiciones correctas
     * @param command - Comando a validar
     * @param dividerPositions - Posiciones donde deben estar los dividers
     * @returns true si los dividers están en las posiciones correctas
     */
    validateDividers(command, dividerPositions) {
        for (const position of dividerPositions) {
            // Verificar que la posición esté dentro del rango del comando
            if (position < command.length) {
                // Verificar que en esa posición haya un divider '|'
                if (command[position] !== constants_1.DIVIDER) {
                    return false;
                }
            }
            else {
                // Si la posición está fuera del rango, el comando no es válido
                return false;
            }
        }
        return true;
    }
    /**
     * Limpia el timeout y resetea el estado del procesador
     */
    cleanup() {
        if (this.dataTimeout) {
            clearTimeout(this.dataTimeout);
            this.dataTimeout = null;
        }
        this.commandBuffer = '';
        this.processingAttempts = 0;
    }
    /**
     * Obtiene el estado actual del buffer (útil para debugging)
     */
    getBufferState() {
        return {
            bufferLength: this.commandBuffer.length,
            processingAttempts: this.processingAttempts
        };
    }
}
exports.CommandProcessor = CommandProcessor;
//# sourceMappingURL=command-processor.js.map