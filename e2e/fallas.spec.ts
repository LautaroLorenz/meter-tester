import { ElectronApplication, Page } from '@playwright/test';
import { test, expect } from './support/fixtures';
import { aviso } from './support/abm';
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

// Fallas de comunicación con la máquina, provocadas desde el simulador. Los tests prueban lo que la
// app hace HOY: lo que debería cambiar está en "Fase 5 — detalle" del plan (decisiones para el
// final) y lo que es un error queda como falla esperada (`test.fail`).
//
// Cómo maneja hoy una falla: main espera 1,5 s y reenvía el comando hasta 2 veces (~4,5 s); si
// sigue sin respuesta, el dispositivo pasa a Error y aparece "Error de comunicación ...".

// Contraste en modo secuencial con un error distinto por puesto, para ver si un valor cambia de puesto
const ERRORES = { 1: '0.10', 2: '0.20', 3: '0.30' } as const;

async function midiendoContraste(app: ElectronApplication, page: Page): Promise<Page> {
  const maquina = await prepararEnsayo(app, page);
  await comenzarMedicion(page);
  await esperarValores(page);
  return maquina;
}

async function prepararEnsayo(app: ElectronApplication, page: Page, corriente = '5'): Promise<Page> {
  await crearMedidor(page);
  await crearPlantillaEnsayo(page, 'Ensayo fallas', [{ paso: 'contraste', corriente }]);
  const maquina = await abrirEnsayo(app, page, 'Ensayo fallas');
  for (const [puesto, error] of Object.entries(ERRORES)) {
    await simulador(maquina).puesto(Number(puesto), 'contrast', { outcome: 'valor', value: Number(error) });
  }
  await verificar(page);
  await prepararPuestos(page, [1, 2, 3]);
  return maquina;
}

/** cada puesto muestra su propio error */
async function esperarValores(page: Page): Promise<void> {
  for (const [puesto, error] of Object.entries(ERRORES)) {
    await expect(resultadoPuesto(page, Number(puesto))).toContainText(error);
  }
}

/** Mira la pantalla durante unos segundos y devuelve todos los valores que mostró cada puesto */
async function valoresMostrados(page: Page, segundos: number): Promise<Record<number, Set<string>>> {
  const vistos: Record<number, Set<string>> = { 1: new Set(), 2: new Set(), 3: new Set() };
  const hasta = Date.now() + segundos * 1000;
  while (Date.now() < hasta) {
    for (const puesto of [1, 2, 3]) {
      const texto = await resultadoPuesto(page, puesto).innerText();
      vistos[puesto].add(texto.match(/-?\d+\.\d\d/)?.[0] ?? 'vacío');
    }
    await page.waitForTimeout(100);
  }
  return vistos;
}

const errorDeComunicacion = (page: Page, dispositivo: string): ReturnType<typeof aviso> =>
  aviso(page, `Error de comunicación ${dispositivo}`);

async function cerrarAvisos(page: Page): Promise<void> {
  for (const cerrar of await page.locator('p-toast p-toastitem').getByRole('button', { name: 'Close' }).all()) {
    await cerrar.dispatchEvent('click');
  }
  await expect(page.locator('p-toast p-toastitem')).toHaveCount(0);
}

async function captura(page: Page, nombre: string): Promise<void> {
  await test.info().attach(nombre, { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
}

test.describe('Fallas de comunicación', { tag: '@un-cliente' }, () => {
  test('calculador: fallas que se recuperan o no se notan', async ({ launched: { app, mainWindow: page } }) => {
    test.setTimeout(150000);
    const maquina = await midiendoContraste(app, page);
    const fallas = simulador(maquina);

    await test.step('sin respuesta y trama corrupta una vez: el reintento lo recupera sin aviso', async () => {
      await fallas.falla({ kind: 'sin-respuesta', device: 'C', stand: 2, times: 1 });
      await fallas.falla({ kind: 'corrupta', device: 'C', stand: 2, times: 1 });
      await expect.poll(() => fallas.fallasActivas(), { timeout: 15000 }).toHaveLength(0);
      await page.waitForTimeout(2000);
      await expect(page.locator('p-toast p-toastitem')).toHaveCount(0);
      await esperarValores(page);
    });

    await test.step('fallan los 3 intentos: avisa y sigue midiendo', async () => {
      await fallas.falla({ kind: 'sin-respuesta', device: 'C', stand: 2, times: 3 });
      await expect(errorDeComunicacion(page, 'puesto [02]')).toBeVisible({ timeout: 10000 });
      await captura(page, 'error de comunicación puesto 2');
      await cerrarAvisos(page);
      await esperarValores(page);
    });

    await test.step('responde tarde siempre: los valores no cambian de puesto', async () => {
      await fallas.falla({ kind: 'tarde', device: 'C', stand: 2, delayMs: 1600 });
      const vistos = await valoresMostrados(page, 8);
      await fallas.sinFallas();
      expect([...vistos[1]]).toEqual([ERRORES[1]]);
      expect([...vistos[3]]).toEqual([ERRORES[3]]);
      expect(vistos[2].has(ERRORES[1]) || vistos[2].has(ERRORES[3])).toBe(false);
      await cerrarAvisos(page);
    });

    await test.step('responde con el número de otro puesto: la app la acepta igual (no valida el puesto)', async () => {
      await fallas.falla({ kind: 'otro-puesto', device: 'C', stand: 2 });
      await page.waitForTimeout(3000);
      await esperarValores(page);
      await expect(page.locator('p-toast p-toastitem')).toHaveCount(0);
      await fallas.sinFallas();
    });

    await test.step('resultado ignorado (X): el puesto queda sin valor, calculando y sin aviso', async () => {
      await fallas.falla({ kind: 'ignorado', device: 'C', stand: 2 });
      await expect(resultadoPuesto(page, 2)).not.toContainText(/\d\.\d\d/);
      await page.waitForTimeout(3000);
      await expect(resultadoPuesto(page, 2)).toContainText('Calculando');
      await expect(page.locator('p-toast p-toastitem')).toHaveCount(0);
      await captura(page, 'resultado ignorado');
      await fallas.sinFallas();
      await esperarValores(page);
    });
  });

  test('calculador: un puesto que no responde nunca da aviso cada ~4,7 s y sigue calculando', async ({
    launched: { app, mainWindow: page },
  }) => {
    test.setTimeout(120000);
    const maquina = await midiendoContraste(app, page);
    await simulador(maquina).falla({ kind: 'sin-respuesta', device: 'C', stand: 2 });

    await expect(errorDeComunicacion(page, 'puesto [02]')).toBeVisible({ timeout: 10000 });
    await cerrarAvisos(page);
    // el aviso se repite con cada vuelta de lectura
    await expect(errorDeComunicacion(page, 'puesto [02]')).toBeVisible({ timeout: 10000 });
    await expect(resultadoPuesto(page, 2)).toContainText('Calculando');
    await captura(page, 'puesto 2 sin respuesta');
  });

  test('calculador: un puesto que no responde no muestra el valor de otro puesto', async ({
    launched: { app, mainWindow: page },
  }) => {
    // Hallazgo de QA (fase 5, para corregir al final): la calculadora asigna las respuestas por
    // posición y, si un puesto no responde, los siguientes se corren uno: el puesto 2 muestra el
    // error del 3 y el 3 queda vacío. Cuando se corrija, el test pasa y hay que sacar esta línea.
    test.fail(true, 'Hoy el puesto 2 muestra el valor del puesto 3');
    test.setTimeout(120000);
    const maquina = await midiendoContraste(app, page);
    await simulador(maquina).falla({ kind: 'sin-respuesta', device: 'C', stand: 2 });
    await expect(errorDeComunicacion(page, 'puesto [02]')).toBeVisible({ timeout: 10000 });
    await captura(page, 'valores después de la falla');

    const vistos = await valoresMostrados(page, 6);
    expect([...vistos[2]], 'el puesto 2 nunca muestra el error del puesto 3').not.toContain(ERRORES[3]);
    expect([...vistos[3]], 'el puesto 3 sigue con su error').toEqual([ERRORES[3]]);
  });

  test('patrón sin respuesta: avisa y la medición sigue', async ({ launched: { app, mainWindow: page } }) => {
    test.setTimeout(120000);
    const maquina = await midiendoContraste(app, page);
    await simulador(maquina).falla({ kind: 'sin-respuesta', device: 'P' });

    await expect(errorDeComunicacion(page, '[Patrón]')).toBeVisible({ timeout: 10000 });
    await esperarValores(page);
    await captura(page, 'patrón sin respuesta');
  });

  test('generador sin respuesta: queda en error; se reintenta con "Detener todo"', async ({
    launched: { app, mainWindow: page },
  }) => {
    test.setTimeout(120000);
    const maquina = await prepararEnsayo(app, page);
    const generador = page.locator('app-generator');
    await simulador(maquina).falla({ kind: 'sin-respuesta', device: 'G' });
    await page.getByRole('button', { name: 'Iniciar generador' }).click();

    await expect(errorDeComunicacion(page, '[Generador]')).toBeVisible({ timeout: 10000 });
    await expect(generador).toContainText('Error');
    await simulador(maquina).sinFallas();
    await page.waitForTimeout(2000);
    // aunque vuelva la comunicación sigue en error; "Comenzar medición" queda habilitado
    // (decisión pendiente, ver fase 5)
    await expect(generador).toContainText('Error');
    await expect(page.getByRole('button', { name: 'Comenzar medición' })).toBeEnabled();
    await captura(page, 'generador en error');

    await page.getByRole('button', { name: 'Detener todo' }).click();
    await cerrarAvisos(page);
    await comenzarMedicion(page);
    await esperarValores(page);
  });

  test('sobrecorriente: aviso fijo y el calculador se detiene', async ({ launched: { app, mainWindow: page } }) => {
    test.setTimeout(120000);
    // la alarma se controla con corrientes de ensayo de hasta 2 A (patrón SM 5050: EDET)
    const maquina = await prepararEnsayo(app, page, '1');
    await comenzarMedicion(page);
    await esperarValores(page);
    await simulador(maquina).falla({ kind: 'sobrecorriente', device: 'P', times: 1 });

    await expect(aviso(page, 'Sobrecarga del generador')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('app-calculator')).toContainText('Detenido');
    await captura(page, 'sobrecorriente');
  });

  test('"Detener todo" durante la medición permite volver a medir', async ({ launched: { app, mainWindow: page } }) => {
    test.setTimeout(120000);
    await midiendoContraste(app, page);
    await page.getByRole('button', { name: 'Detener todo' }).click();
    await expect(page.getByRole('button', { name: 'Iniciar generador' })).toBeVisible();
    await captura(page, 'detenido');

    await comenzarMedicion(page);
    await esperarValores(page);
  });

  test('volver durante la medición sale del ensayo sin preguntar', async ({ launched: { app, mainWindow: page } }) => {
    test.setTimeout(120000);
    await midiendoContraste(app, page);
    await page.locator('app-page-title button').first().click();

    // decisión pendiente (fase 5): hoy no pide confirmación y el ensayo se pierde
    await expect(page.locator('app-page-title')).toContainText('Administración de Ensayos');
    await expect.poll(() => app.windows().some((ventana) => ventana.url().includes('maquina-virtual'))).toBe(false);
    await captura(page, 'después de volver');
  });
});
