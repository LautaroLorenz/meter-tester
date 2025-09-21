import { CommandsSizes } from './command-size';
import { CHAR_START, CHAR_END, DIVIDER } from './constants';

export class CommandDirector {
    public static readonly CHAR_START = CHAR_START;
    public static readonly CHAR_END = CHAR_END;
    public static readonly DIVIDER = DIVIDER;

    static getFrom(command: string): string {
        const compositeCode = this.getBlocks(command)[1];
        // Para códigos compuestos como 'PS', 'CS', 'GS', 'SP', 'SC', 'SG'
        // El primer carácter indica el dispositivo origen
        return compositeCode[0];
    }

    static getTo(command: string): string {
        const compositeCode = this.getBlocks(command)[1];
        // Para códigos compuestos como 'PS', 'CS', 'GS', 'SP', 'SC', 'SG'
        // El segundo carácter indica el dispositivo destino
        return compositeCode[1];
    }

    static getBlocks(command: string): string[] {
        // Buscar el patrón que coincida con el comando
        const matchingPattern = CommandsSizes.find((cs) => {
            const regexPattern = cs.pattern.replace(/\?/g, '.');
            const regex = new RegExp(`^${regexPattern}`);
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
}
