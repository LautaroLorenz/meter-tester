"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandsSizes = void 0;
/**
 * Sabe como empieza el comando
 * Sabe la longitud del comando
 * Sabe en que posiciones están los dividers para ese comando
 */
exports.CommandsSizes = [
    {
        // Calculador -> Software - Respuesta - Puesto (1-255 -> regex "[\\s\\S]") + ACK + Valores del ensayo
        // MÁS FRECUENTE: Comandos del calculador
        pattern: `B\\|CS\\|[\\s\\S]\\|`,
        size: 12,
        dividerPositions: [1, 4, 6, 10],
        patternLength: 7
    },
    {
        // Patrón -> Software - Respuesta - Constante y Valores medidos de fases
        // FRECUENTE: Comandos de patrón
        pattern: `B\\|PS`,
        size: 41,
        dividerPositions: [1, 4, 9, 12, 15, 18, 21, 24, 27, 31, 35, 39],
        patternLength: 4
    },
    {
        // Generador -> Software - Respuesta - ACK
        // MENOS FRECUENTE: Comandos de generador
        pattern: `B\\|GS`,
        size: 8,
        dividerPositions: [1, 4, 6],
        patternLength: 4
    }
];
//# sourceMappingURL=command-size.js.map