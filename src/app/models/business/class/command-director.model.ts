import { CommandsSizes } from '../constants/commands-size.model';
import { Devices } from '../enums/devices.model';

export class CommandDirector {
    public static readonly CHAR_START = 'B';
    public static readonly CHAR_END = 'Z';
    public static readonly DIVIDER = '|';

    static getFrom(command: string): Devices {
        const compositeCode = this.getBlocks(command)[1];
        // Para códigos compuestos como 'PS', 'CS', 'GS', 'SP', 'SC', 'SG'
        // El primer carácter indica el dispositivo origen
        return compositeCode[0] as Devices;
    }

    static getTo(command: string): Devices {
        const compositeCode = this.getBlocks(command)[1];
        // Para códigos compuestos como 'PS', 'CS', 'GS', 'SP', 'SC', 'SG'
        // El segundo carácter indica el dispositivo destino
        return compositeCode[1] as Devices;
    }

    static getBlocks(command: string): string[] {
        // Buscar el patrón que coincida con el comando
        const matchingPattern = CommandsSizes.find((cs) => {
            // Los patrones ya están escapados, usar directamente
            const regex = new RegExp(`^${cs.pattern}`);
            return regex.test(command);
        });

        if (!matchingPattern) {
            // Fallback al método anterior si no se encuentra patrón
            return command.split(this.DIVIDER);
        }

        // Usar las posiciones de dividers para extraer los bloques
        const blocks: string[] = [];
        let lastIndex = 0;

        for (const dividerPos of matchingPattern.dividerPositions) {
            if (dividerPos < command.length) {
                blocks.push(command.substring(lastIndex, dividerPos));
                lastIndex = dividerPos + 1; // +1 para saltar el divider
            }
        }

        // Agregar el último bloque (desde el último divider hasta el final)
        if (lastIndex < command.length) {
            blocks.push(command.substring(lastIndex));
        }

        return blocks;
    }

    static build(...blocks: string[]): string {
        const commandBlocks: string[] = [this.CHAR_START, ...blocks, this.CHAR_END];
        const commandBlocksText = commandBlocks.join(this.DIVIDER);
        return commandBlocksText;
    }

    /**
     * Codifica un número en formato compacto usando el algoritmo específico
     * @param number Número a codificar (valor real con decimales)
     * @param bytes Número de bytes a usar (1-4)
     * @param decimals Número de decimales para punto fijo (0-4)
     * @returns String con la representación compacta
     *
     * Algoritmo:
     * - 1 byte (0-255): Se pone el número directamente
     * - 2 bytes (0-65535): MSB = número/256, LSB = número mod 256
     * - 3 bytes (0-16777215): B2 = número/65536, B1 = (número - B2*65536)/256, B0 = (número - B2*65536) mod 256
     * - 4 bytes (0-4294967295): Similar proceso con 4 bytes
     *
     * Ejemplos de uso:
     *  CommandDirector.encodeCompactNumber(123.4, 2, 1)     // Tensión: 1234 → "\x04\xD2"
     *  CommandDirector.encodeCompactNumber(12.34, 2, 2)     // Corriente: 1234 → "\x04\xD2"
     *  CommandDirector.encodeCompactNumber(0.85, 3, 2)      // Factor de potencia: 85 → "\x00\x00\x55"
     */
    static encodeCompactNumber(number: number, bytes: number, decimals = 0): string {
        if (bytes < 1 || bytes > 4) {
            throw new Error(`Número de bytes debe estar entre 1 y 4: ${bytes}`);
        }

        if (decimals < 0 || decimals > 4) {
            throw new Error(`Número de decimales debe estar entre 0 y 4: ${decimals}`);
        }

        // Convertir a punto fijo multiplicando por 10^decimals
        const multiplier = Math.pow(10, decimals);
        const fixedPointNumber = Math.round(number * multiplier);

        // Verificar que el número en punto fijo no exceda el rango del número de bytes
        const maxValue = Math.pow(256, bytes) - 1;
        if (fixedPointNumber < 0 || fixedPointNumber > maxValue) {
            throw new Error(
                `Número en punto fijo fuera de rango: ${fixedPointNumber} (máximo para ${bytes} bytes: ${maxValue})`
            );
        }

        // Calcular cada byte según el algoritmo específico
        const resultBytes: number[] = [];
        let remaining = fixedPointNumber;

        for (let i = bytes - 1; i >= 0; i--) {
            const divisor = Math.pow(256, i);
            resultBytes.unshift(Math.floor(remaining / divisor));
            remaining = remaining % divisor;
        }

        return resultBytes.map((byte) => String.fromCharCode(byte)).join('');
    }

    /**
     * Decodifica un número desde formato compacto
     * @param encoded String codificado
     * @returns Número decodificado
     * Ejemplos de uso:
     *  CommandDirector.decodeCompactNumber("\x01") // 1
     *  CommandDirector.decodeCompactNumber("\xFF") // 255
     *  CommandDirector.decodeCompactNumber("\x01\x00") // 256
     *  CommandDirector.decodeCompactNumber("\x03\xE8") // 1000
     */
    static decodeCompactNumber(encoded: string): number {
        const range = 256;
        let result = 0;

        for (let i = 0; i < encoded.length; i++) {
            const charCode = encoded.charCodeAt(i);
            result = result * range + charCode;
        }

        return result;
    }
}
