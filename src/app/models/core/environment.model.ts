export interface Environment {
    // flag si es producción
    production: boolean;

    // nombre del ambiente
    environment: string;

    // cantidad de puestos que tiene la máquina
    standsQuantity: number;

    // el generador puede ser:
    // - Manual: el usuario lo ajusta manualmente, click en la UI para continuar.
    // - Semiautomático-PYC5050: Se le envian parámetros del ensayo.
    generatorType: 'Manual' | 'Semiautomatic-PYC5050';

    // el patrón puede ser Físico o Virtual (desde una tabla de BBDD)
    patternType: 'Virtual' | 'Physical';

    // completa pasos automaticamente
    skipSteps: Record<string, boolean>;

    // activa la maquina virtual
    virtualMachine: boolean;

    // activa el historial de logs
    logsHistory: boolean;
}
