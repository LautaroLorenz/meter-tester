import { ClientConfig } from '../../src/app/models/core/environment.model';
import { CLIENT as EDET } from '../../src/environments/client.edet';
import { CLIENT as CHACO } from '../../src/environments/client.chaco';
import { CLIENT as TANDIL } from '../../src/environments/client.tandil';
import { CLIENT as EDELAP } from '../../src/environments/client.edelap';

// Un proyecto de Playwright por cliente: toda la suite corre contra el build de cada uno
// (npm run build:e2e compila cada cliente en dist-e2e/<cliente>).
export const CLIENTS: Record<string, ClientConfig> = {
  edet: EDET,
  chaco: CHACO,
  tandil: TANDIL,
  edelap: EDELAP,
};
