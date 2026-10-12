import { Page } from '@playwright/test';
import { test, expect } from './support/fixtures';
import { openMenu } from './support/menu';
import { abm, aviso, confirmar } from './support/abm';

async function crearMarca(page: Page, nombre: string): Promise<void> {
  await abm(page).nuevo();
  await page.locator('#name').fill(nombre);
  await abm(page).guardar.click();
  await expect(abm(page).fila(nombre)).toBeVisible();
}

test.describe('ABM de marcas', { tag: '@un-cliente' }, () => {
  test.beforeEach(async ({ launched }) => {
    await openMenu(launched.mainWindow, ['menu-medidores', 'menu-medidores-marcas']);
  });

  test('alta', async ({ launched: { mainWindow: page } }) => {
    await abm(page).nuevo();
    await page.locator('#name').fill('Marca E2E');
    await test.info().attach('formulario', { body: await page.screenshot(), contentType: 'image/png' });
    await abm(page).guardar.click();

    await expect(aviso(page, 'Agregado correctamente')).toBeVisible();
    await expect(abm(page).fila('Marca E2E')).toBeVisible();
    await test.info().attach('marca creada', { body: await page.screenshot(), contentType: 'image/png' });
  });

  test('sin nombre no se puede guardar', async ({ launched: { mainWindow: page } }) => {
    await abm(page).nuevo();

    await expect(abm(page).guardar).toBeDisabled();
    await page.locator('#name').fill('Marca');
    await expect(abm(page).guardar).toBeEnabled();
    await page.locator('#name').fill('');
    await expect(abm(page).guardar).toBeDisabled();
  });

  test('edicion', async ({ launched: { mainWindow: page } }) => {
    await crearMarca(page, 'Marca original');

    await abm(page).fila('Marca original').getByTestId('abm-editar').click();
    await expect(page.locator('#name')).toHaveValue('Marca original');
    await page.locator('#name').fill('Marca editada');
    await abm(page).guardar.click();

    await expect(aviso(page, 'Editado correctamente')).toBeVisible();
    await expect(abm(page).fila('Marca editada')).toBeVisible();
    await expect(abm(page).fila('Marca original')).toHaveCount(0);
    await test.info().attach('marca editada', { body: await page.screenshot(), contentType: 'image/png' });
  });

  test('busqueda', async ({ launched: { mainWindow: page } }) => {
    await crearMarca(page, 'Alfa');
    await crearMarca(page, 'Beta');
    await crearMarca(page, 'Alfa Plus');

    await abm(page).buscar('alfa');

    await expect(abm(page).filas).toHaveCount(2);
    await expect(abm(page).fila('Beta')).toHaveCount(0);
    await test.info().attach('busqueda', { body: await page.screenshot(), contentType: 'image/png' });
  });

  test('baja', async ({ launched: { mainWindow: page } }) => {
    await crearMarca(page, 'Marca a borrar');

    await abm(page).fila('Marca a borrar').getByTestId('abm-borrar').click();
    await test.info().attach('confirmacion', { body: await page.screenshot(), contentType: 'image/png' });
    await confirmar(page, 'Confirmar');

    await expect(aviso(page, 'Eliminado correctamente')).toBeVisible();
    await expect(abm(page).fila('Marca a borrar')).toHaveCount(0);
  });

  test('baja cancelada no borra', async ({ launched: { mainWindow: page } }) => {
    await crearMarca(page, 'Marca que queda');

    await abm(page).fila('Marca que queda').getByTestId('abm-borrar').click();
    await confirmar(page, 'Cancelar');

    await expect(abm(page).fila('Marca que queda')).toBeVisible();
  });
});
