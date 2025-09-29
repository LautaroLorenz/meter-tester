/**
 * Formatea el header de una columna aplicando uppercase al texto pero preservando el case de las unidades
 * @param header - El texto del header a formatear
 * @returns El header formateado con uppercase en el texto y case original en las unidades
 *
 * @example
 * formatHeaderWithUnits('Intg. Inicial [kWh]') // Returns: 'INTG. INICIAL [kWh]'
 * formatHeaderWithUnits('Error [%]') // Returns: 'ERROR [%]'
 * formatHeaderWithUnits('Puesto') // Returns: 'PUESTO'
 */
export function formatHeaderWithUnits(header: string): string {
    // Buscar si hay unidades entre corchetes []
    const unitMatch = header.match(/^(.+?)\s*(\[[^\]]+\])$/);

    if (unitMatch) {
        // Si tiene unidades, aplicar uppercase solo al texto principal
        const textPart = unitMatch[1].toUpperCase();
        const unitPart = unitMatch[2]; // Mantener el case original de las unidades
        return `${textPart} ${unitPart}`;
    }

    // Si no tiene unidades, aplicar uppercase a todo
    return header.toUpperCase();
}
