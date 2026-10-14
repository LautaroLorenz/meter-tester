import { Page } from '@playwright/test';
import { test, expect } from './support/fixtures';
import { launchApp } from './support/launch-app';
import {
  abrirEnsayo,
  comenzarMedicion,
  crearMedidor,
  crearPlantillaEnsayo,
  prepararPuestos,
  resultadoPuesto,
  simulador,
  verificar,
} from './support/ensayo';

async function esperarResultados(page: Page, esperados: string[]): Promise<void> {
  for (const [indice, resultado] of esperados.entries()) {
    await expect(resultadoPuesto(page, indice + 1)).toContainText(resultado, { timeout: 30000 });
  }
}

async function continuar(page: Page): Promise<void> {
  const boton = page.getByRole('button', { name: 'Continuar', exact: true });
  await expect(boton).toBeEnabled();
  await boton.click();
}

// El simulador corre en la ventana de la máquina virtual y responde lo que el escenario decide.
// Es común a todos los clientes: corre en uno.
test.describe('Simulador de la máquina virtual', { tag: '@un-cliente' }, () => {
  test('el escenario Mixto decide qué aprueba y qué falla en cada paso', async ({ launched: { app, mainWindow: page } }) => {
    test.setTimeout(120000);
    await crearMedidor(page);
    await crearPlantillaEnsayo(page, 'Ensayo simulador', [{ paso: 'vacio' }, { paso: 'contraste' }, { paso: 'arranque' }]);

    const maquina = await abrirEnsayo(app, page, 'Ensayo simulador');
    // Mixto: el puesto n falla el paso k (vacío 0, contraste 1, arranque 2) si n + k es múltiplo de 3
    await simulador(maquina).escenario('mixto');
    await verificar(page);
    await prepararPuestos(page, [1, 2, 3]);

    await test.step('vacío: falla el puesto 3', async () => {
      await comenzarMedicion(page);
      await expect(maquina.getByTestId('simulador-paso')).toContainText('Vacío');
      await esperarResultados(page, ['OK', 'OK', 'Falló']);
      await expect(resultadoPuesto(page, 3)).toContainText('3'); // impulsos: máximo permitido 2
      await test.info().attach('vacío', { body: await page.screenshot(), contentType: 'image/png' });
      await test.info().attach('simulador en vacío', { body: await maquina.screenshot(), contentType: 'image/png' });
      await continuar(page);
    });

    await test.step('contraste: falla el puesto 2', async () => {
      await comenzarMedicion(page);
      await expect(resultadoPuesto(page, 2)).toContainText('-2.00');
      // en modo secuencial mide hasta que el usuario pasa a "Ensayo unitario"
      await page.getByText('Ensayo unitario').click();
      await esperarResultados(page, ['OK', 'Falló', 'OK']);
      await test.info().attach('contraste', { body: await page.screenshot(), contentType: 'image/png' });
      await continuar(page);
    });

    await test.step('arranque: falla el puesto 1 (llega antes del mínimo)', async () => {
      await comenzarMedicion(page);
      await esperarResultados(page, ['Falló', 'OK', 'OK']);
      await test.info().attach('arranque', { body: await page.screenshot(), contentType: 'image/png' });
    });
  });

  test('el escenario elegido se recuerda al volver a abrir la app', async ({ launched, client }) => {
    const { app, mainWindow: page, userDataDir } = launched;
    await crearPlantillaEnsayo(page, 'Ensayo simulador', [{ paso: 'vacio' }]);

    const maquina = await abrirEnsayo(app, page, 'Ensayo simulador');
    await expect(maquina.getByTestId('simulador-escenario')).toContainText('Aleatorio');
    await maquina.getByTestId('simulador-escenario').click();
    await maquina.getByRole('option', { name: 'Todo falla' }).click();
    await expect(maquina.getByTestId('simulador-puesto').first()).toContainText('Falla');
    await test.info().attach('elegido', { body: await maquina.screenshot(), contentType: 'image/png' });
    await app.close();

    const reabierta = await launchApp({ client, userDataDir });
    try {
      const otraMaquina = await abrirEnsayo(reabierta.app, reabierta.mainWindow, 'Ensayo simulador');
      await expect(otraMaquina.getByTestId('simulador-escenario')).toContainText('Todo falla');
      await test.info().attach('al reabrir', { body: await otraMaquina.screenshot(), contentType: 'image/png' });
    } finally {
      await reabierta.close();
    }
  });
});
