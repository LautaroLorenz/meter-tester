"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandDirector = void 0;
class CommandDirector {
    static getFrom(command) {
        return this.getBlocks(command)[1];
    }
    static getTo(command) {
        return this.getBlocks(command)[2];
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