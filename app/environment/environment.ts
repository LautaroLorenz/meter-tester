import { APP_CONFIG as DEV } from './environment.dev';
import { APP_CONFIG as PROD } from './environment.prod';

export interface Config {
  production: boolean;
  virtualMachine: boolean;
  inspector: boolean;
}

export function APP_CONFIG(isDev: boolean): Config {
  return isDev ? DEV : PROD;
}
