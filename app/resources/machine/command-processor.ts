import { CommandsSizes, CommandSize } from './command-size';
import { CHAR_END, DIVIDER } from './constants';

export interface CommandProcessorConfig {
    dataWaitTimeout: number; // Timeout base para búsqueda de patrones (ms)
}

export interface CommandProcessorCallbacks {
    onCommandReceived: (command: string) => void;
    onCommandLog: (command: string) => void;
}

export class CommandProcessor {
    private commandBuffer = '';
    private dataTimeout: NodeJS.Timeout | null = null;
    private config: CommandProcessorConfig;
    private callbacks: CommandProcessorCallbacks;

    constructor(config: CommandProcessorConfig, callbacks: CommandProcessorCallbacks) {
        this.config = config;
        this.callbacks = callbacks;
    }

    /**
     * Procesa un chunk de datos recibidos del puerto serie
     * @param chunk - Datos recibidos como string
     */
    processDataChunk(chunk: string): void {
        this.commandBuffer += chunk;

        // Cancelar timeout anterior si existe
        if (this.dataTimeout) {
            clearTimeout(this.dataTimeout);
        }

        // Buscar comando reconocido para calcular timeout inteligente
        const recognizedCommand = this.findRecognizedCommand(this.commandBuffer);

        if (recognizedCommand) {
            const { commandSize } = recognizedCommand;
            const remainingChars = commandSize.size - this.commandBuffer.length;

            if (remainingChars <= 0) {
                // Comando completo - procesar inmediatamente
                this.processCommands();
                return;
            }

            // Calcular timeout inteligente basado en caracteres faltantes
            const estimatedTime = this.calculateSmartTimeout(remainingChars);

            this.dataTimeout = setTimeout(() => {
                this.processCommands();
                this.dataTimeout = null;
            }, estimatedTime);
        } else {
            // No se reconoce patrón - timeout corto para buscar patrones
            this.dataTimeout = setTimeout(() => {
                this.processCommands();
                this.dataTimeout = null;
            }, 10); // 10ms para detectar patrones
        }
    }

    /**
     * Procesa todos los comandos completos en el buffer
     */
    private processCommands(): void {
        while (this.commandBuffer.length > 0) {
            // Buscar el primer comando que coincida con algún patrón
            const recognizedCommand = this.findRecognizedCommand(this.commandBuffer);

            if (recognizedCommand) {
                const { command, commandSize } = recognizedCommand;

                // Verificar que el comando tenga el tamaño correcto
                if (command.length === commandSize.size) {
                    // Verificar que termine en 'Z'
                    if (command.endsWith(CHAR_END)) {
                        // Verificar que los dividers estén en las posiciones correctas
                        if (this.validateDividers(command, commandSize.dividerPositions)) {
                            // Comando válido encontrado
                            this.callbacks.onCommandLog(command);
                            this.callbacks.onCommandReceived(command);

                            // Remover el comando procesado del buffer
                            this.commandBuffer = this.commandBuffer.substring(command.length);
                            continue;
                        } else {
                            // Remover el comando completo ya que sabemos su tamaño
                            this.commandBuffer = this.commandBuffer.substring(command.length);
                            continue;
                        }
                    } else {
                        // Remover el comando completo ya que sabemos su tamaño
                        this.commandBuffer = this.commandBuffer.substring(command.length);
                        continue;
                    }
                } else if (command.length < commandSize.size) {
                    break;
                } else {
                    // El comando es más largo de lo esperado, remover el comando completo
                    this.commandBuffer = this.commandBuffer.substring(command.length);
                    continue;
                }
            } else {
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
    private findRecognizedCommand(buffer: string): { command: string; commandSize: CommandSize } | null {
        for (const commandSize of CommandsSizes) {
            // Usar directamente el patrón como regex (ya está escapado en CommandsSizes)
            const regex = new RegExp(`^${commandSize.pattern}`);

            // Verificar si el buffer hace match con el patrón regex
            if (regex.test(buffer)) {
                // Si el buffer tiene al menos el tamaño mínimo para este comando, extraer el comando
                if (buffer.length >= commandSize.size) {
                    const command = buffer.substring(0, commandSize.size);
                    return { command, commandSize };
                } else {
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
    private validateDividers(command: string, dividerPositions: number[]): boolean {
        for (const position of dividerPositions) {
            // Verificar que la posición esté dentro del rango del comando
            if (position < command.length) {
                // Verificar que en esa posición haya un divider '|'
                if (command[position] !== DIVIDER) {
                    return false;
                }
            } else {
                // Si la posición está fuera del rango, el comando no es válido
                return false;
            }
        }
        return true;
    }

    /**
     * Limpia el timeout y resetea el estado del procesador
     */
    cleanup(): void {
        if (this.dataTimeout) {
            clearTimeout(this.dataTimeout);
            this.dataTimeout = null;
        }
        this.commandBuffer = '';
    }

    /**
     * Obtiene el estado actual del buffer (útil para debugging)
     */
    getBufferState(): { bufferLength: number } {
        return {
            bufferLength: this.commandBuffer.length
        };
    }

    /**
     * Calcula el timeout inteligente basado en caracteres faltantes
     * @param remainingChars - Caracteres que faltan para completar el comando
     * @param baudRate - Velocidad del puerto serie (opcional, por defecto 19200)
     * @returns Tiempo estimado en milisegundos
     */
    private calculateSmartTimeout(remainingChars: number, baudRate: number = 19200): number {
        // Calcular tiempo por carácter basado en baud rate
        // 19200 baud ≈ 1920 caracteres/segundo ≈ 0.52ms por carácter
        const msPerChar = 1000 / (baudRate / 10); // Aproximación para caracteres de 8 bits

        // Timeout = caracteres faltantes * tiempo por carácter + margen de seguridad
        const estimatedTime = remainingChars * msPerChar + 5; // +5ms margen

        // Limitar entre 5ms (mínimo) y 50ms (máximo)
        return Math.max(5, Math.min(50, estimatedTime));
    }
}
