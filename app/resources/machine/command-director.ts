export class CommandDirector {
    public static readonly CHAR_START = 'B';
    public static readonly CHAR_END = 'Z';
    public static readonly DIVIDER = '|';

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
        return command.split(this.DIVIDER);
    }
}
