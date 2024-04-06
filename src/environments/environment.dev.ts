import { Environment } from '../app/models/core/environment.model';

export const APP_CONFIG: Environment = {
  production: false,
  environment: 'DEV',
  standsQuantiy: 10, // cantidad de puestos que tiene la máquina
  commandStandsQuantity: 20, // cantidad de puestos que se envian en los comandos
  skipSteps: true,
  virtualMachine: true,
};
