"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandDirector = void 0;
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
        return command.split(this.DIVIDER);
    }
}
exports.CommandDirector = CommandDirector;
CommandDirector.CHAR_START = 'B';
CommandDirector.CHAR_END = 'Z';
CommandDirector.DIVIDER = '|';
//# sourceMappingURL=command-director.js.map