import { Page } from '@playwright/test';
import * as FS from 'fs';
import * as PATH from 'path';
import { test, expect } from './support/fixtures';
import { CLIENTS } from './support/clients';
import { openMenu } from './support/menu';
import { abm } from './support/abm';
import {
  abrirEnsayo,
  comenzarMedicion,
  crearMedidor,
  crearPlantillaEnsayo,
  prepararPuestos,
  resultadoPuesto,
  simulador,
  hojasPdf,
  verificar,
} from './support/ensayo';

// Escenario "Mixto" del simulador: el puesto n falla el paso k (vacío 0, contraste 1, arranque 2)
// si n + k es múltiplo de 3. En integración el resultado lo decide el usuario: se aprueban los
// impares y se rechazan los pares.
function fallaMixto(puesto: number, paso: 'vacio' | 'contraste' | 'arranque' | 'integracion'): boolean {
  if (paso === 'integracion') {
    return puesto % 2 === 0;
  }
  const orden = { vacio: 0, contraste: 1, arranque: 2 }[paso];
  return (puesto + orden) % 3 === 0;
}

async function esperarResultados(page: Page, activos: number[], paso: Parameters<typeof fallaMixto>[1]): Promise<void> {
  for (const puesto of activos) {
    await expect(resultadoPuesto(page, puesto)).toContainText(fallaMixto(puesto, paso) ? 'Falló' : 'OK', {
      timeout: 30000,
    });
  }
}

async function continuar(page: Page): Promise<void> {
  const boton = page.getByRole('button', { name: 'Continuar', exact: true });
  await expect(boton).toBeEnabled();
  await boton.click();
}

async function captura(page: Page, nombre: string): Promise<void> {
  await test.info().attach(nombre, { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
}

// El ensayo depende de la configuración de cada cliente (puestos, generador y patrón): corre en
// los 4. Todos los puestos activos menos el último.
test('ensayo completo: verificación, preparación, los 4 pasos y reporte', async ({
  launched: { app, mainWindow: page, downloadsDir },
  client,
}) => {
  test.setTimeout(240000);
  const puestos = CLIENTS[client].standsQuantity;
  const activos = Array.from({ length: puestos - 1 }, (_, indice) => indice + 1);
  const inactivo = puestos;

  await test.step('medidor y plantilla con los 4 pasos', async () => {
    await crearMedidor(page);
    await crearPlantillaEnsayo(page, 'Ensayo completo', [
      { paso: 'vacio' },
      { paso: 'contraste' },
      { paso: 'arranque' },
      { paso: 'integracion' },
    ]);
  });

  const maquina = await abrirEnsayo(app, page, 'Ensayo completo');
  await simulador(maquina).escenario('mixto');

  await test.step('verificación', async () => {
    await captura(page, 'verificación');
    await verificar(page);
  });

  await test.step(`preparación: ${activos.length} puestos activos, el ${inactivo} inactivo`, async () => {
    await prepararPuestos(page, activos);
  });

  await test.step('vacío', async () => {
    await comenzarMedicion(page);
    await esperarResultados(page, activos, 'vacio');
    await expect(resultadoPuesto(page, inactivo)).not.toContainText(/OK|Falló/);
    await captura(page, 'vacío');
    await continuar(page);
  });

  await test.step('contraste', async () => {
    await comenzarMedicion(page);
    // en modo secuencial mide hasta que el usuario pasa a "Ensayo unitario"
    await expect(resultadoPuesto(page, activos[0])).toContainText('0.50');
    await page.getByText('Ensayo unitario').click();
    await esperarResultados(page, activos, 'contraste');
    await captura(page, 'contraste');
    await continuar(page);
  });

  await test.step('arranque', async () => {
    await comenzarMedicion(page);
    await esperarResultados(page, activos, 'arranque');
    await captura(page, 'arranque');
    await continuar(page);
  });

  await test.step('integración', async () => {
    await comenzarMedicion(page);
    // sin integradores iniciales la app pregunta antes de medir
    await page.locator('p-confirmdialog').getByRole('button', { name: 'Continuar' }).click();
    const apagado = page.getByRole('button', { name: 'Generador apagado' });
    const confirmarResultado = page.getByRole('button', { name: 'Confirmar resultado' });
    // el generador manual pide confirmar que se apagó; el PYC 5050 se apaga solo
    await expect(apagado.or(confirmarResultado)).toBeVisible({ timeout: 20000 });
    if (await apagado.isVisible()) {
      await apagado.click();
    }
    const filas = page.getByTestId('integracion-puesto');
    for (const puesto of activos) {
      await filas
        .nth(puesto - 1)
        .getByTestId(fallaMixto(puesto, 'integracion') ? 'integracion-rechazar' : 'integracion-aprobar')
        .click();
    }
    // los resultados de integración están en la tabla de ingreso de valores
    for (const puesto of activos) {
      await expect(filas.nth(puesto - 1)).toContainText(fallaMixto(puesto, 'integracion') ? 'Falló' : 'OK');
    }
    await captura(page, 'integración');
    await confirmarResultado.click();
    await continuar(page);
  });

  let hojas: Awaited<ReturnType<typeof hojasPdf>> = [];
  await test.step('reporte y PDF', async () => {
    const descargar = page.getByRole('button', { name: 'Descargar PDF' });
    await expect(descargar).toBeVisible();
    await captura(page, 'reporte');

    // preparación + una hoja por paso; el reporte dibuja todos los puestos (activos o no), así que
    // EDET con 20 es el caso más cargado. Si una tabla no entra, el PDF la corta sin aviso.
    hojas = await hojasPdf(page);
    await test.info().attach('alto de cada hoja', { body: JSON.stringify(hojas, null, 2), contentType: 'application/json' });
    expect(hojas).toHaveLength(5);
    for (const hoja of hojas) {
      expect(hoja.altoUsado, `el contenido de la hoja ${hoja.hoja} entra en el A4`).toBeLessThanOrEqual(hoja.altoHoja);
    }

    // encabezado: el logo del cliente o, si no tiene, el nombre de la empresa
    const encabezado = page.locator('app-preparation-pdf-report .company-info');
    const logo = CLIENTS[client].companyLogoPath;
    if (logo) {
      const imagen = encabezado.locator('img.company-logo');
      await expect(imagen).toHaveAttribute('src', logo);
      await expect.poll(() => imagen.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
    } else {
      await expect(encabezado.locator('.company-name-header')).toHaveText(CLIENTS[client].companyName);
    }
    await descargar.click();
    await expect.poll(() => (FS.existsSync(downloadsDir) ? FS.readdirSync(downloadsDir) : []), { timeout: 30000 })
      .toHaveLength(1);
    const pdf = PATH.join(downloadsDir, FS.readdirSync(downloadsDir)[0]);
    await expect.poll(() => FS.statSync(pdf).size).toBeGreaterThan(0);
    const contenido = FS.readFileSync(pdf);
    expect(contenido.subarray(0, 4).toString()).toBe('%PDF');
    expect(contenido.toString('latin1').match(/\/Type\s*\/Page[^s]/g), 'una página por hoja').toHaveLength(hojas.length);
    await test.info().attach('reporte.pdf', { path: pdf, contentType: 'application/pdf' });
  });

  await test.step('guardar: queda en el historial', async () => {
    await page.getByRole('button', { name: 'Guardar y salir' }).click();
    await expect(page.locator('app-page-title')).toContainText('Administración de Ensayos');
    await openMenu(page, ['menu-ensayos', 'menu-ensayos-historial']);
    // una fila por puesto activo y paso, de a 20 por página
    const filas = activos.length * 4;
    await expect(abm(page).fila('Ensayo completo')).toHaveCount(Math.min(filas, 20));
    await expect(page.locator('.p-paginator-page')).toHaveCount(Math.ceil(filas / 20));
    await captura(page, 'historial');
  });
});
