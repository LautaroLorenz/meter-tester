import { Locator, Page } from '@playwright/test';
import * as FS from 'fs';
import * as PATH from 'path';
import * as XLSX from 'xlsx';
import { test, expect } from './support/fixtures';
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
  verificar,
} from './support/ensayo';

type Caso = { puesto: number; valor: number | null; resultado: 'OK' | 'Falló'; porque: string };

// Cada regla de aprobado/rechazado en su borde, con valores directos del simulador.
// Vacío: falla si los impulsos superan el máximo (2).
const VACIO: Caso[] = [
  { puesto: 1, valor: 2, resultado: 'OK', porque: 'impulsos = máximo' },
  { puesto: 2, valor: 3, resultado: 'Falló', porque: 'impulsos = máximo + 1' },
  { puesto: 3, valor: 0, resultado: 'OK', porque: 'sin impulsos' },
  { puesto: 4, valor: 10, resultado: 'Falló', porque: 'muy por encima del máximo' },
];
// Contraste: falla si |error| supera el máximo (1 %).
const CONTRASTE: Caso[] = [
  { puesto: 1, valor: 1, resultado: 'OK', porque: 'error = máximo' },
  { puesto: 2, valor: 1.01, resultado: 'Falló', porque: 'error = máximo + 0,01' },
  { puesto: 3, valor: -1, resultado: 'OK', porque: 'error = −máximo' },
  { puesto: 4, valor: -1.01, resultado: 'Falló', porque: 'error = −máximo − 0,01' },
];
// Arranque (1 impulso entre 3 y 6 s): falla si llega antes del mínimo o no llega antes del máximo.
// El valor es cuándo llega (s desde que la calculadora empieza a medir); el tiempo no se puede
// probar al milisegundo (la app lee a todos los puestos en cada vuelta), se deja 1,5 s de margen.
const ARRANQUE: Caso[] = [
  { puesto: 1, valor: 1.5, resultado: 'Falló', porque: 'llega antes del mínimo' },
  { puesto: 2, valor: 4.5, resultado: 'OK', porque: 'llega entre el mínimo y el máximo (justo 1 impulso)' },
  { puesto: 3, valor: null, resultado: 'Falló', porque: 'no arranca' },
  { puesto: 4, valor: 7.5, resultado: 'Falló', porque: 'llega después del máximo' },
];
// Integración (1000 impulsos a 1000 imp/kWh = 1 kWh estimado, máximo 1 %): el error sale de los
// integradores que carga el usuario: (final − inicial − estimado) / estimado × 100.
const INICIAL = 100;
const INTEGRACION: Array<Caso & { final: number }> = [
  { puesto: 1, valor: null, final: 101, resultado: 'OK', porque: 'error 0 %' },
  { puesto: 2, valor: null, final: 101.009, resultado: 'OK', porque: 'error 0,9 %' },
  { puesto: 3, valor: null, final: 101.011, resultado: 'Falló', porque: 'error 1,1 %' },
  { puesto: 4, valor: null, final: 100.989, resultado: 'Falló', porque: 'error −1,1 %' },
];
const PUESTOS = [1, 2, 3, 4];

async function esperarCasos(filas: (puesto: number) => Locator, casos: Caso[]): Promise<void> {
  for (const caso of casos) {
    await test.step(`puesto ${caso.puesto}: ${caso.porque} → ${caso.resultado}`, async () => {
      await expect(filas(caso.puesto)).toContainText(caso.resultado, { timeout: 15000 });
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

async function escribirIntegrador(fila: Locator, columna: 0 | 1, valor: number): Promise<void> {
  const input = fila.locator('p-inputnumber input').nth(columna);
  // la app usa coma decimal: con punto, "101.009" queda como 101009
  const texto = String(valor).replace('.', ',');
  // al apagarse el generador la tabla se vuelve a dibujar y puede perderse lo escrito: se reintenta
  await expect(async () => {
    await input.fill(texto);
    await input.press('Tab');
    await expect(input).toHaveValue(texto, { timeout: 1000 });
  }).toPass({ timeout: 10000 });
}

test.describe('Reglas de aprobado y rechazado en sus bordes', { tag: '@un-cliente' }, () => {
  test('vacío, contraste, arranque, integración con integradores y exportación a Excel', async ({
    launched: { app, mainWindow: page, downloadsDir },
  }) => {
    test.setTimeout(240000);
    await crearMedidor(page);
    await crearPlantillaEnsayo(page, 'Ensayo bordes', [
      { paso: 'vacio', parametros: { maxAllowedPulses: '2', durationSeconds: '5' } },
      { paso: 'contraste', parametros: { maxAllowedError: '1' } },
      { paso: 'arranque', parametros: { minDurationSeconds: '3', maxDurationSeconds: '6', allowedPulses: '1' } },
      { paso: 'integracion', parametros: { durationPulses: '1000', maxAllowedError: '1' } },
    ]);

    const maquina = await abrirEnsayo(app, page, 'Ensayo bordes');
    for (const [paso, casos] of [['vacuum', VACIO], ['contrast', CONTRASTE], ['boot', ARRANQUE]] as const) {
      for (const { puesto, valor } of casos) {
        await simulador(maquina).puesto(puesto, paso, { outcome: 'valor', value: valor });
      }
    }
    await test.info().attach('simulador', { body: await maquina.screenshot({ fullPage: true }), contentType: 'image/png' });
    await verificar(page);
    await prepararPuestos(page, PUESTOS);

    await test.step('vacío', async () => {
      await comenzarMedicion(page);
      await esperarCasos((puesto) => resultadoPuesto(page, puesto), VACIO);
      await captura(page, 'vacío');
      await continuar(page);
    });

    await test.step('contraste', async () => {
      await comenzarMedicion(page);
      await expect(resultadoPuesto(page, 2)).toContainText('1.01');
      await page.getByText('Ensayo unitario').click();
      await esperarCasos((puesto) => resultadoPuesto(page, puesto), CONTRASTE);
      await captura(page, 'contraste');
      await continuar(page);
    });

    await test.step('arranque', async () => {
      await comenzarMedicion(page);
      await esperarCasos((puesto) => resultadoPuesto(page, puesto), ARRANQUE);
      await captura(page, 'arranque');
      await continuar(page);
    });

    await test.step('integración con integradores cargados', async () => {
      const filas = page.getByTestId('integracion-puesto');
      await comenzarMedicion(page, async () => {
        await page.getByRole('tab', { name: 'Ingreso de valores' }).click();
        for (const puesto of PUESTOS) {
          await escribirIntegrador(filas.nth(puesto - 1), 0, INICIAL);
        }
      });
      const apagado = page.getByRole('button', { name: 'Generador apagado' });
      const confirmarResultado = page.getByRole('button', { name: 'Confirmar resultado' });
      await expect(apagado.or(confirmarResultado)).toBeVisible({ timeout: 20000 });
      if (await apagado.isVisible()) {
        await apagado.click();
      }
      for (const { puesto, final } of INTEGRACION) {
        await escribirIntegrador(filas.nth(puesto - 1), 1, final);
      }
      await page.getByTestId('integracion-calcular-todos').click();
      await esperarCasos((puesto) => filas.nth(puesto - 1), INTEGRACION);
      await captura(page, 'integración');
      await confirmarResultado.click();
      await continuar(page);
    });

    await test.step('historial exportado a Excel', async () => {
      await page.getByRole('button', { name: 'Guardar y salir' }).click();
      await expect(page.locator('app-page-title')).toContainText('Administración de Ensayos');
      await openMenu(page, ['menu-ensayos', 'menu-ensayos-historial']);
      await expect(abm(page).fila('Ensayo bordes')).toHaveCount(16);
      await page.getByRole('button', { name: 'Exportar' }).click();

      await expect.poll(() => (FS.existsSync(downloadsDir) ? FS.readdirSync(downloadsDir) : []), { timeout: 30000 })
        .toHaveLength(1);
      const archivo = PATH.join(downloadsDir, FS.readdirSync(downloadsDir)[0]);
      await test.info().attach('historial.xlsx', { path: archivo });
      const libro = XLSX.read(FS.readFileSync(archivo));
      const filas = XLSX.utils.sheet_to_json<Record<string, string>>(libro.Sheets[libro.SheetNames[0]]);
      expect(filas).toHaveLength(16);
      // un resultado por puesto y paso, igual que en la pantalla
      const resultados = (paso: string): string[] =>
        PUESTOS.map((puesto) => filas.find((fila) => fila.Paso === paso && fila['Número de serie'] === `E2E-${puesto}`)?.Resultado ?? '');
      const pasos = [...new Set(filas.map((fila) => fila.Paso))].sort();
      await test.info().attach('pasos en el Excel', { body: pasos.join('\n'), contentType: 'text/plain' });
      expect(pasos).toEqual(['Prueba de arranque', 'Prueba de constraste', 'Prueba de integración', 'Prueba de vacío']);
      const esperado: Record<string, Caso[]> = {
        'Prueba de vacío': VACIO,
        'Prueba de constraste': CONTRASTE,
        'Prueba de arranque': ARRANQUE,
        'Prueba de integración': INTEGRACION,
      };
      for (const [paso, casos] of Object.entries(esperado)) {
        expect(resultados(paso), paso).toEqual(casos.map((caso) => caso.resultado));
      }
    });
  });
});
