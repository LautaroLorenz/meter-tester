export interface CommandSize {
    pattern: string;
    size: number;
    dividerPositions: number[];
}

/**
 * Sabe como empieza el comando
 * Sabe la longitud del comando
 * Sabe en que posiciones están los dividers para ese comando
 */
export const CommandsSizes: CommandSize[] = [
    {
        // Patrón -> Software - Respuesta - Constante y Valores medidos de fases
        pattern: `B\\|PS`,
        size: 43,
        dividerPositions: [1, 4, 9, 11, 14, 17, 20, 23, 26, 29, 33, 37, 41]
    },
    {
        // Generador -> Software - Respuesta - ACK
        pattern: `B\\|GS`,
        size: 8,
        dividerPositions: [1, 4, 6]
    },
    {
        // Calculador -> Software - Respuesta - Puesto (1-255 -> regex "[\\s\\S]") + ACK + Valores del ensayo
        pattern: `B\\|CS\\|[\\s\\S]\\|`,
        size: 12,
        dividerPositions: [1, 4, 6, 10]
    }
];
