import { Environment } from '../app/models/core/environment.model';
import { APP_CONFIG as PROD } from './environment.prod';

// Igual a producción (con el cliente del build), pero contra la máquina virtual (tests e2e)
export const APP_CONFIG: Environment = {
    ...PROD,
    environment: 'E2E',
    virtualMachine: true
};
