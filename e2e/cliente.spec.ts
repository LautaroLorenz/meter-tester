import * as FS from 'fs';
import * as PATH from 'path';
import { Environment } from '../src/app/models/core/environment.model';
import { CLIENTS } from './support/clients';
import { test, expect } from './support/fixtures';

test('el build tiene la configuracion del cliente', async ({ launched, client }) => {
  const config = await launched.mainWindow.evaluate(
    () => (window as unknown as { __APP_CONFIG__: Environment }).__APP_CONFIG__,
  );

  expect(config).toMatchObject(CLIENTS[client]);
  // comunes a todos los clientes: los pasos se corren todos y los delays son los de producción
  expect(Object.values(config.skipSteps).every((skip) => !skip)).toBeTruthy();
  expect(config.delays).toEqual({ patternCheckCycleDelay: 50, resultsDelay: 50, loopDelay: 50 });
  expect(config.virtualMachine).toBeTruthy();

  if (config.companyLogoPath) {
    const logo = PATH.join(__dirname, '../dist-e2e', client, config.companyLogoPath);
    expect(FS.existsSync(logo), `falta el logo ${config.companyLogoPath} en el build`).toBeTruthy();
  }
});
