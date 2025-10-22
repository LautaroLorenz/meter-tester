"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExpectedResponse = exports.CommandMappings = void 0;
/**
 * Mapeo de comandos enviados a sus respuestas esperadas
 * Esto permite pre-calcular la respuesta esperada al momento de enviar el comando
 */
exports.CommandMappings = [
    {
        sentCommand: 'B\\|SG.*',
        expectedResponse: 'B\\|GS',
        responseSize: 8,
        responseDividerPositions: [1, 4, 6],
        responsePatternLength: 4
    },
    {
        sentCommand: 'B\\|SP.*',
        expectedResponse: 'B\\|PS',
        responseSize: 43,
        responseDividerPositions: [1, 4, 9, 11, 14, 17, 20, 23, 26, 29, 33, 37, 41],
        responsePatternLength: 4
    },
    {
        sentCommand: 'B\\|SC.*',
        expectedResponse: 'B\\|CS\\|[\\s\\S]\\|',
        responseSize: 12,
        responseDividerPositions: [1, 4, 6, 10],
        responsePatternLength: 7
    }
];
/**
 * Obtiene el mapeo de respuesta esperada para un comando enviado
 * Usa pattern matching para encontrar comandos que empiecen con el patrón
 */
function getExpectedResponse(sentCommand) {
    return (exports.CommandMappings.find((mapping) => {
        const regex = new RegExp(`^${mapping.sentCommand}`);
        return regex.test(sentCommand);
    }) || null);
}
exports.getExpectedResponse = getExpectedResponse;
//# sourceMappingURL=command-size.js.map