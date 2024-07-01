export interface Environment {
    // flag si es producción
    production: boolean;

    // nombre del ambiente
    environment: string;

    // cantidad de puestos que tiene la máquina
    standsQuantity: number;

    // cantidad de puestos que se envian en los comandos
    commandStandsQuantity: number;

    // completa pasos automaticamente
    skipSteps: Record<string, boolean>;

    // activa la maquina virtual
    virtualMachine: boolean;

    // activa el historial de logs
    logsHistory: boolean;
}
