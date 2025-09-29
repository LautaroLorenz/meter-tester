export interface CommandMapping {
    sentCommand: string;
    expectedResponse: string; // Patrón regex para validar la respuesta
    responseSize: number;
    responseDividerPositions: number[];
    responsePatternLength: number;
}

/**
 * Mapeo de comandos enviados a sus respuestas esperadas
 * Esto permite pre-calcular la respuesta esperada al momento de enviar el comando
 */
export const CommandMappings: CommandMapping[] = [
    {
        sentCommand: 'B\\|SG.*', // Patrón regex para comandos que empiezan con B|SG (Software -> Generador)
        expectedResponse: 'B\\|GS', // Patrón regex para respuesta del Generador -> Software
        responseSize: 8,
        responseDividerPositions: [1, 4, 6],
        responsePatternLength: 4
    },
    {
        sentCommand: 'B\\|SP.*', // Patrón regex para comandos que empiezan con B|SP (Software -> Patrón)
        expectedResponse: 'B\\|PS', // Patrón regex para respuesta del Patrón -> Software
        responseSize: 41,
        responseDividerPositions: [1, 4, 9, 12, 15, 18, 21, 24, 27, 31, 35, 39],
        responsePatternLength: 4
    },
    {
        sentCommand: 'B\\|SC.*', // Patrón regex para comandos que empiezan con B|SC (Software -> Calculador)
        expectedResponse: 'B\\|CS\\|[\\s\\S]\\|', // Patrón regex para respuesta del Calculador -> Software (X es variable 1-255)
        responseSize: 12,
        responseDividerPositions: [1, 4, 6, 10],
        responsePatternLength: 7
    }
];

/**
 * Obtiene el mapeo de respuesta esperada para un comando enviado
 * Usa pattern matching para encontrar comandos que empiecen con el patrón
 */
export function getExpectedResponse(sentCommand: string): CommandMapping | null {
    return (
        CommandMappings.find((mapping) => {
            const regex = new RegExp(`^${mapping.sentCommand}`);
            return regex.test(sentCommand);
        }) || null
    );
}
