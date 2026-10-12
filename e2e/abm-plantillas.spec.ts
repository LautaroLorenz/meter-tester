import { Locator, Page } from '@playwright/test';
import { test, expect } from './support/fixtures';
import { openMenu } from './support/menu';
import { abm, aviso, confirmar, escribirNumero, esperarAvisos } from './support/abm';

// Guardar es un p-splitButton: el botón principal guarda y queda en la pantalla
const guardar = (page: Page): Locator => page.getByTestId('plantilla-guardar').getByRole('button', { name: 'Guardar' });

// El paso se elige en "Agregar paso". Cualquier paso agregado queda inválido hasta configurar
// sus parámetros; se usa Prueba de vacío como paso simple (los pasos se prueban a fondo en la fase 4).
async function agregarPasoVacio(page: Page, { configurar }: { configurar: boolean }): Promise<void> {
  await page.getByTestId('plantilla-agregar-paso').click();
  await page.getByRole('dialog').filter({ hasText: 'Seleccione un paso' }).getByRole('button', { name: 'Prueba de vacío' }).click();
  if (!configurar) {
    return;
  }
  await page.getByTestId('plantilla-editar-paso').click();
  const parametros = page.getByRole('dialog').filter({ hasText: 'Ajustar parámetros' });
  await parametros.locator('#meterConstant').getByText('Activa', { exact: true }).click();
  await escribirNumero(page, 'maxAllowedPulses', '10');
  await escribirNumero(page, 'durationSeconds', '60');
  // tensión de ensayo de cada fase (L1, L2, L3): los tres campos comparten id="voltage"
  const tensiones = parametros.locator('app-phase-form-group p-inputnumber input');
  for (let fase = 0; fase < (await tensiones.count()); fase++) {
    await tensiones.nth(fase).fill('220');
    await tensiones.nth(fase).press('Tab');
  }
  await parametros.getByRole('button', { name: 'Aceptar' }).click();
  await expect(parametros).toBeHidden();
}

async function crearPlantilla(page: Page, nombre: string): Promise<void> {
  await page.getByTestId('plantilla-nueva').click();
  await page.locator('#name').fill(nombre);
  await agregarPasoVacio(page, { configurar: true });
  // el nombre se valida contra la base (que no esté en uso) 1 s después de escribirlo
  await expect(guardar(page)).toBeEnabled();
  await guardar(page).click();
  await expect(aviso(page, 'Guardado correctamente')).toBeVisible();
  await esperarAvisos(page);
}

async function irAAdministracion(page: Page): Promise<void> {
  await openMenu(page, ['menu-ensayos', 'menu-ensayos-administracion']);
  await expect(page.locator('app-page-title')).toContainText('Administración de Ensayos');
}

test.describe('ABM de plantillas de ensayo', { tag: '@un-cliente' }, () => {
  test('alta con un paso', async ({ launched: { mainWindow: page } }) => {
    await crearPlantilla(page, 'Plantilla E2E');
    await expect(page.locator('app-steps-sequence-table')).toContainText('Prueba de vacío');
    await test.info().attach('plantilla guardada', { body: await page.screenshot(), contentType: 'image/png' });

    await irAAdministracion(page);
    await expect(abm(page).fila('Plantilla E2E')).toBeVisible();
    await test.info().attach('en la lista', { body: await page.screenshot(), contentType: 'image/png' });
  });

  test('validaciones', async ({ launched: { mainWindow: page } }) => {
    await page.getByTestId('plantilla-nueva').click();

    await test.step('sin nombre no se puede guardar', async () => {
      await agregarPasoVacio(page, { configurar: true });
      await expect(guardar(page)).toBeDisabled();
    });

    await test.step('un paso sin configurar no deja guardar', async () => {
      await page.locator('#name').fill('Plantilla E2E');
      await expect(guardar(page)).toBeEnabled();
      await agregarPasoVacio(page, { configurar: false });
      await expect(guardar(page)).toBeDisabled();
      await test.info().attach('paso sin configurar', { body: await page.screenshot(), contentType: 'image/png' });
    });
  });

  test('nombre repetido no se puede guardar', async ({ launched: { mainWindow: page } }) => {
    await crearPlantilla(page, 'Plantilla E2E');
    await irAAdministracion(page);

    await page.getByTestId('plantilla-nueva').click();
    await page.locator('#name').fill('Plantilla E2E');
    await agregarPasoVacio(page, { configurar: true });

    // la validación contra la base tarda 1 s: se espera a que termine antes de mirar el botón
    await expect(page.locator('#name')).not.toHaveClass(/ng-pending/);
    await expect(guardar(page)).toBeDisabled();
    await test.info().attach('nombre repetido', { body: await page.screenshot(), contentType: 'image/png' });
  });

  test('edicion', async ({ launched: { mainWindow: page } }) => {
    await crearPlantilla(page, 'Plantilla original');
    await irAAdministracion(page);

    await abm(page).fila('Plantilla original').getByTestId('plantilla-editar').click();
    await expect(page.locator('#name')).toHaveValue('Plantilla original');
    await page.locator('#name').fill('Plantilla editada');
    await page.getByTestId('plantilla-borrar-paso').click();
    await confirmar(page, 'Confirmar');
    await expect(page.locator('app-steps-sequence-table')).not.toContainText('Prueba de vacío');
    await expect(guardar(page)).toBeEnabled();
    await guardar(page).click();
    await expect(aviso(page, 'Guardado correctamente')).toBeVisible();

    await irAAdministracion(page);
    await expect(abm(page).fila('Plantilla editada')).toBeVisible();
    await expect(abm(page).fila('Plantilla original')).toHaveCount(0);
    await test.info().attach('plantilla editada', { body: await page.screenshot(), contentType: 'image/png' });
  });

  test('baja', async ({ launched: { mainWindow: page } }) => {
    await crearPlantilla(page, 'Plantilla a borrar');
    await irAAdministracion(page);

    await abm(page).fila('Plantilla a borrar').getByTestId('abm-borrar').click();
    await confirmar(page, 'Confirmar');

    await expect(aviso(page, 'Eliminado correctamente')).toBeVisible();
    await expect(abm(page).fila('Plantilla a borrar')).toHaveCount(0);
  });
});
