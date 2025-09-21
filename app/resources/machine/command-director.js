"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandDirector = void 0;
const command_size_1 = require("./command-size");
const constants_1 = require("./constants");
class CommandDirector {
    static getFrom(command) {
        const compositeCode = this.getBlocks(command)[1];
        // Para códigos compuestos como 'PS', 'CS', 'GS', 'SP', 'SC', 'SG'
        // El primer carácter indica el dispositivo origen
        return compositeCode[0];
    }
    static getTo(command) {
        const compositeCode = this.getBlocks(command)[1];
        // Para códigos compuestos como 'PS', 'CS', 'GS', 'SP', 'SC', 'SG'
        // El segundo carácter indica el dispositivo destino
        return compositeCode[1];
    }
    static getBlocks(command) {
        // Buscar el patrón que coincida con el comando
        const matchingPattern = command_size_1.CommandsSizes.find((cs) => {
            // Los patrones ya están escapados, usar directamente
            const regex = new RegExp(`^${cs.pattern}`);
            return regex.test(command);
        });
        if (!matchingPattern) {
            // Fallback al método anterior si no se encuentra patrón
            return command.split(this.DIVIDER);
        }
        // Usar las posiciones de dividers para extraer los bloques
        const blocks = [];
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
exports.CommandDirector = CommandDirector;
CommandDirector.CHAR_START = constants_1.CHAR_START;
CommandDirector.CHAR_END = constants_1.CHAR_END;
CommandDirector.DIVIDER = constants_1.DIVIDER;
//# sourceMappingURL=command-director.js.map