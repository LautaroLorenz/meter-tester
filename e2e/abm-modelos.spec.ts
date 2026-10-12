import { Page } from '@playwright/test';
import { test, expect } from './support/fixtures';
import { openMenu } from './support/menu';
import { abm, aviso, confirmar, elegir, escribirNumero } from './support/abm';

const MARCA = 'Marca E2E';

async function crearMarca(page: Page): Promise<void> {
  await openMenu(page, ['menu-medidores', 'menu-medidores-marcas']);
  await abm(page).nuevo();
  await page.locator('#name').fill(MARCA);
  await abm(page).guardar.click();
  await expect(abm(page).fila(MARCA)).toBeVisible();
}


async function completarModelo(page: Page, modelo: string): Promise<void> {
  await elegir(page, 'brand_id', MARCA);
  await page.locator('#model').fill(modelo);
  await elegir(page, 'connection_id', 'Monofásico');
  await escribirNumero(page, 'ratedVoltage', '220');
  await escribirNumero(page, 'maximumCurrent', '60');
  await escribirNumero(page, 'ratedCurrent', '10');
  // cada constante se habilita al elegir su unidad
  await elegir(page, 'activeConstantUnit_id', 'imp/kwh');
  await escribirNumero(page, 'activeConstantValue', '1000');
  await elegir(page, 'reactiveConstantUnit_id', 'imp/kvarh');
  await escribirNumero(page, 'reactiveConstantValue', '1000');
}

async function crearModelo(page: Page, modelo: string): Promise<void> {
  await abm(page).nuevo();
  await completarModelo(page, modelo);
  await abm(page).guardar.click();
  await expect(abm(page).fila(modelo)).toBeVisible();
}

test.describe('ABM de modelos de medidores', { tag: '@un-cliente' }, () => {
  test.beforeEach(async ({ launched: { mainWindow: page } }) => {
    await crearMarca(page);
    await openMenu(page, ['menu-medidores', 'menu-medidores-modelos']);
  });

  test('alta', async ({ launched: { mainWindow: page } }) => {
    await abm(page).nuevo();
    await completarModelo(page, 'Modelo E2E');
    await test.info().attach('formulario', { body: await page.screenshot(), contentType: 'image/png' });
    await abm(page).guardar.click();

    await expect(aviso(page, 'Agregado correctamente')).toBeVisible();
    const fila = abm(page).fila('Modelo E2E');
    for (const valor of [MARCA, 'Monofásico', '60', '10', '220', '1000 [imp/kwh]', '1000 [imp/kvarh]']) {
      await expect(fila).toContainText(valor);
    }
    await test.info().attach('modelo creado', { body: await page.screenshot(), contentType: 'image/png' });
  });

  test('validaciones', async ({ launched: { mainWindow: page } }) => {
    await abm(page).nuevo();
    await expect(abm(page).guardar).toBeDisabled();

    await completarModelo(page, 'Modelo E2E');
    await expect(abm(page).guardar).toBeEnabled();

    // corrientes y tensión: entre 0 y 999
    await escribirNumero(page, 'maximumCurrent', '1000');
    await expect(abm(page).guardar).toBeDisabled();
    await test.info().attach('fuera de rango', { body: await page.screenshot(), contentType: 'image/png' });
    await escribirNumero(page, 'maximumCurrent', '60');
    await expect(abm(page).guardar).toBeEnabled();

    // modelo obligatorio
    await page.locator('#model').fill('');
    await expect(abm(page).guardar).toBeDisabled();
  });

  test('edicion', async ({ launched: { mainWindow: page } }) => {
    await crearModelo(page, 'Modelo E2E');

    await abm(page).fila('Modelo E2E').getByTestId('abm-editar').click();
    await expect(page.locator('#model')).toHaveValue('Modelo E2E');
    await escribirNumero(page, 'ratedVoltage', '380');
    await abm(page).guardar.click();

    await expect(aviso(page, 'Editado correctamente')).toBeVisible();
    await expect(abm(page).fila('Modelo E2E')).toContainText('380');
    await test.info().attach('modelo editado', { body: await page.screenshot(), contentType: 'image/png' });
  });

  test('baja libera la marca', async ({ launched: { mainWindow: page } }) => {
    await crearModelo(page, 'Modelo E2E');

    await test.step('la marca en uso no se puede borrar', async () => {
      await openMenu(page, ['menu-medidores', 'menu-medidores-marcas']);
      await abm(page).fila(MARCA).getByTestId('abm-borrar').click();
      await confirmar(page, 'Confirmar');

      await expect(aviso(page, 'Verifique que ningun elemento este en uso antes de eliminar')).toBeVisible();
      await expect(abm(page).fila(MARCA)).toBeVisible();
      await test.info().attach('marca en uso', { body: await page.screenshot(), contentType: 'image/png' });
    });

    await test.step('baja del modelo', async () => {
      await openMenu(page, ['menu-medidores', 'menu-medidores-modelos']);
      await abm(page).fila('Modelo E2E').getByTestId('abm-borrar').click();
      await confirmar(page, 'Confirmar');

      await expect(aviso(page, 'Eliminado correctamente')).toBeVisible();
      await expect(abm(page).fila('Modelo E2E')).toHaveCount(0);
    });

    await test.step('sin modelos, la marca se puede borrar', async () => {
      await openMenu(page, ['menu-medidores', 'menu-medidores-marcas']);
      await abm(page).fila(MARCA).getByTestId('abm-borrar').click();
      await confirmar(page, 'Confirmar');

      await expect(abm(page).fila(MARCA)).toHaveCount(0);
    });
  });
});
