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
        responseSize: 41,
        responseDividerPositions: [1, 4, 9, 12, 15, 18, 21, 24, 27, 31, 35, 39],
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