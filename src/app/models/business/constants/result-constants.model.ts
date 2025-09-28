/**
 * Constantes relacionadas con el procesamiento de resultados
 * que pueden ser reutilizadas en diferentes componentes
 *
 * Estas constantes implementan un mecanismo estándar para ignorar resultados
 * cuando llega el signo 'X' en las respuestas de los dispositivos.
 */

/**
 * Signo utilizado para indicar que un resultado debe ser ignorado
 * (ej: stand locked, error de comunicación, etc.)
 *
 * @example
 * // En mapTSxxResponse o similar:
 * if (sign === IGNORED_RESULT_SIGN) {
 *     return undefined; // Ignorar este resultado
 * }
 */
export const IGNORED_RESULT_SIGN = 'X';

/**
 * Valor por defecto para resultados ignorados
 *
 * @example
 * // Al crear respuestas mock para stands locked:
 * const mockResponse = command.replace(/[^|]*$/, `${IGNORED_RESULT_SIGN}${IGNORED_RESULT_VALUE}`);
 */
export const IGNORED_RESULT_VALUE = '00';

/**
 * Combinación completa para resultados ignorados
 *
 * @example
 * // Uso directo en reemplazos de comandos:
 * const mockResponse = command.replace(/[^|]*$/, IGNORED_RESULT_PATTERN);
 *
 * // En verificaciones de resultado:
 * if (resultBlock === IGNORED_RESULT_PATTERN) {
 *     return undefined;
 * }
 */
export const IGNORED_RESULT_PATTERN = `${IGNORED_RESULT_SIGN}${IGNORED_RESULT_VALUE}`;
