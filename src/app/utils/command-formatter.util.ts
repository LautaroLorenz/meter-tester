/**
 * Utilidad para formatear comandos para su visualización
 */
export class CommandFormatterUtil {
    /**
     * Convierte un comando string a su representación en bytes separados por espacios
     * @param command - El comando a formatear
     * @returns String con los bytes del comando separados por espacios
     */
    static formatCommandForDisplay(command: string): string {
        const bytes: number[] = [];
        for (let i = 0; i < command.length; i++) {
            bytes.push(command.charCodeAt(i));
        }
        return bytes.join(' ');
    }
}
