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
     * Codifica un número en formato compacto usando ASCII completo (0-255)
     * @param number Número a codificar (0 a 4,294,967,295)
     * @returns String con la representación compacta
     * Ejemplos de uso:
     *  CommandDirector.encodeCompactNumber(1)    // "\x01"  (1 carácter)
     *  CommandDirector.encodeCompactNumber(255)  // "\xFF"  (1 carácter)
     *  CommandDirector.encodeCompactNumber(256)  // "\x01\x00" (2 caracteres)
     *  CommandDirector.encodeCompactNumber(1000) // "\x03\xE8" (2 caracteres)
     */
    static encodeCompactNumber(number: number): string {
        if (number < 0 || number > 0xffffffff) {
            throw new Error(`Número fuera de rango: ${number}`);
        }

        const chars: string[] = [];
        const range = 256; // Usar todo el rango ASCII 0-255

        // Convertir número a base 256 usando todo el rango ASCII
        let remaining = number;
        do {
            chars.unshift(String.fromCharCode(remaining % range));
            remaining = Math.floor(remaining / range);
        } while (remaining > 0);

        return chars.join('');
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
