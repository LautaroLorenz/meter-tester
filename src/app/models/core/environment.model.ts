export interface Environment {
  // flag si es producción
  production: boolean;

  // nombre del ambiente
  environment: string;

  // cantidad de puestos que tiene la máquina
  standsQuantiy: number;

  // cantidad de puestos que se envian en los comandos
  commandStandsQuantity: number;

  // completa pasos automaticamente
  skipSteps: boolean;

  // activa la maquina virtual
  virtualMachine: boolean;
}
