import { test, expect } from './support/fixtures';
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

// Lo demás del PDF (hojas que entran en el A4, logo y cantidad de páginas) se prueba en el ensayo
// completo de cada cliente.
test('Chaco: el encabezado del reporte dice "Secheep"', async ({ launched: { app, mainWindow: page }, client }) => {
  test.skip(client !== 'chaco', 'Chaco es el único cliente sin logo: el reporte muestra el nombre de la empresa');

  await crearMedidor(page);
  await crearPlantillaEnsayo(page, 'Ensayo PDF', [{ paso: 'vacio' }]);
  const maquina = await abrirEnsayo(app, page, 'Ensayo PDF');
  await simulador(maquina).escenario('todo-aprueba');
  await verificar(page);
  await prepararPuestos(page, [1]);
  await comenzarMedicion(page);
  await expect(resultadoPuesto(page, 1)).toContainText('OK', { timeout: 15000 });
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();

  const nombre = page.locator('app-preparation-pdf-report .company-name-header');
  await expect(nombre).toBeVisible();
  await test.info().attach('encabezado', { body: await page.screenshot(), contentType: 'image/png' });
  await expect(nombre).toHaveText('Secheep', { timeout: 2000 });
});
