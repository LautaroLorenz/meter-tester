import { CommandMappings } from './command-size';
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
        // Buscar el mapeo que coincida con el comando
        const matchingMapping = CommandMappings.find((mapping) => {
            // Para comandos enviados, usar pattern matching
            const sentCommandRegex = new RegExp(`^${mapping.sentCommand}`);
            if (sentCommandRegex.test(command)) {
                return true;
            }
            // Para respuestas, usar pattern matching
            const responseRegex = new RegExp(`^${mapping.expectedResponse}`);
            return responseRegex.test(command);
        });

        if (!matchingMapping) {
            // Fallback al método anterior si no se encuentra mapeo
            return command.split(this.DIVIDER);
        }

        // Determinar si es un comando enviado o una respuesta esperada
        const sentCommandRegex = new RegExp(`^${matchingMapping.sentCommand}`);
        const isSentCommand = sentCommandRegex.test(command);
        const dividerPositions = isSentCommand
            ? [1, 4] // Para comandos enviados, solo B|SG, B|SP, B|SC
            : matchingMapping.responseDividerPositions;

        // Usar las posiciones de dividers para extraer los bloques
        const blocks: string[] = [];
        let lastIndex = 0;

        for (const dividerPos of dividerPositions) {
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
