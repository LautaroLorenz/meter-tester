import { APP_CONFIG as DEV } from './environment.dev';
import { APP_CONFIG as E2E } from './environment.e2e';
import { APP_CONFIG as PROD } from './environment.prod';

export interface Config {
  production: boolean;
  virtualMachine: boolean;
  inspector: boolean;
  // modo QA: ventanas ocultas, descargas a userData y prohibido el puerto serie real
  e2e?: boolean;
}

export function APP_CONFIG(environment?: string): Config {
  switch (environment) {
    case 'dev':
      return DEV;
    case 'e2e':
      return E2E;
    default:
      return PROD;
  }
}
