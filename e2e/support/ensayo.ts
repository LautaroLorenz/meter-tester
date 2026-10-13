import { ElectronApplication, Locator, Page, expect } from '@playwright/test';
import { openMenu } from './menu';
import { abm, aviso, elegir, escribirNumero, esperarAvisos } from './abm';

// Ensayo de punta a punta: medidor, plantilla, ejecución y simulador de la máquina virtual.

export type PasoEnsayo = 'vacio' | 'contraste' | 'arranque' | 'integracion';

// Nombre del paso en el diálogo "Agregar paso" ("constraste" está así en la app)
const NOMBRE_PASO: Record<PasoEnsayo, string> = {
  vacio: 'Prueba de vacío',
  contraste: 'Prueba de constraste',
  arranque: 'Prueba de arranque',
  integracion: 'Prueba de integración',
};

// Parámetros cortos para que el ensayo dure poco (ids de los p-inputNumber del diálogo)
export const PARAMETROS: Record<PasoEnsayo, Record<string, string>> = {
  vacio: { maxAllowedPulses: '2', durationSeconds: '5' },
  contraste: { maxAllowedError: '1', meterPulses: '10' },
  arranque: { minDurationSeconds: '2', maxDurationSeconds: '5', allowedPulses: '1' },
  integracion: { durationPulses: '10', maxAllowedError: '1' },
};

export const MEDIDOR = 'Marca E2E - Modelo E2E';

/** Marca y modelo de medidor (monofásico, 1000 imp/kWh) para usar en la preparación */
export async function crearMedidor(page: Page): Promise<void> {
  await openMenu(page, ['menu-medidores', 'menu-medidores-marcas']);
  await abm(page).nuevo();
  await page.locator('#name').fill('Marca E2E');
  await abm(page).guardar.click();
  await expect(abm(page).fila('Marca E2E')).toBeVisible();

  await openMenu(page, ['menu-medidores', 'menu-medidores-modelos']);
  await abm(page).nuevo();
  await elegir(page, 'brand_id', 'Marca E2E');
  await page.locator('#model').fill('Modelo E2E');
  await elegir(page, 'connection_id', 'Monofásico');
  await escribirNumero(page, 'ratedVoltage', '220');
  await escribirNumero(page, 'maximumCurrent', '60');
  await escribirNumero(page, 'ratedCurrent', '10');
  await elegir(page, 'activeConstantUnit_id', 'imp/kwh');
  await escribirNumero(page, 'activeConstantValue', '1000');
  await elegir(page, 'reactiveConstantUnit_id', 'imp/kvarh');
  await escribirNumero(page, 'reactiveConstantValue', '1000');
  await abm(page).guardar.click();
  await expect(abm(page).fila('Modelo E2E')).toBeVisible();
}

/** Plantilla de ensayo con los pasos en ese orden, energía activa, 220 V / 5 A / cos φ 1 */
export async function crearPlantillaEnsayo(
  page: Page,
  nombre: string,
  pasos: Array<{ paso: PasoEnsayo; parametros?: Record<string, string> }>,
): Promise<void> {
  await openMenu(page, ['menu-ensayos', 'menu-ensayos-administracion']);
  await page.getByTestId('plantilla-nueva').click();
  await page.locator('#name').fill(nombre);

  for (const { paso, parametros } of pasos) {
    await page.getByTestId('plantilla-agregar-paso').click();
    await page.getByRole('dialog').filter({ hasText: 'Seleccione un paso' }).getByRole('button', { name: NOMBRE_PASO[paso] }).click();
    await page.getByTestId('plantilla-editar-paso').last().click();

    const dialogo = page.getByRole('dialog').filter({ hasText: 'Ajustar parámetros' });
    await dialogo.locator('#meterConstant').getByText('Activa', { exact: true }).click();
    for (const [id, valor] of Object.entries({ ...PARAMETROS[paso], ...parametros })) {
      await escribirNumero(page, id, valor);
    }
    // cada fase repite los ids: se completa dentro de su grupo (vacío solo pide tensión)
    const fases = dialogo.locator('app-phase-form-group');
    for (let fase = 0; fase < (await fases.count()); fase++) {
      for (const [id, valor] of [['voltage', '220'], ['current', '5'], ['powerFactor', '1']]) {
        const input = fases.nth(fase).locator(`#${id} input`);
        if (await input.count()) {
          await input.fill(valor);
          await input.press('Tab');
        }
      }
      const letra = fases.nth(fase).locator('#powerFactorLetter');
      if (await letra.count()) {
        await letra.click();
        await page.getByRole('option', { name: 'L', exact: true }).click();
        // la lista de la fase anterior tarda en cerrarse: si no, hay dos opciones "L"
        await expect(page.getByRole('listbox')).toHaveCount(0);
      }
    }
    await dialogo.getByRole('button', { name: 'Aceptar' }).click();
    await expect(dialogo).toBeHidden();
  }

  const guardar = page.getByTestId('plantilla-guardar').getByRole('button', { name: 'Guardar' });
  await expect(guardar).toBeEnabled();
  await guardar.click();
  await expect(aviso(page, 'Guardado correctamente')).toBeVisible();
  await esperarAvisos(page);
}

/**
 * Abre la ejecución del ensayo. Con la máquina virtual la app abre su ventana (oculta en e2e):
 * se devuelve para manejar el simulador.
 */
export async function abrirEnsayo(app: ElectronApplication, page: Page, nombre: string): Promise<Page> {
  await openMenu(page, ['menu-ensayos', 'menu-ensayos-administracion']);
  await abm(page).fila(nombre).getByTestId('plantilla-ejecutar').click();
  await expect(page.getByRole('button', { name: 'Verificar todos' })).toBeVisible();
  return ventanaSimulador(app);
}

export async function ventanaSimulador(app: ElectronApplication): Promise<Page> {
  await expect.poll(() => app.windows().some((ventana) => ventana.url().includes('maquina-virtual'))).toBe(true);
  const ventana = app.windows().find((w) => w.url().includes('maquina-virtual')) as Page;
  await ventana.getByTestId('simulador-escenario').waitFor();
  return ventana;
}

export async function verificar(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Verificar todos' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
}

/** Activa los puestos indicados (1 = primer puesto) con el medidor de prueba y desactiva el resto */
export async function prepararPuestos(page: Page, activos: number[]): Promise<void> {
  const filas = page.getByTestId('preparacion-puesto');
  await expect(filas.first()).toBeVisible();
  for (let indice = 0; indice < (await filas.count()); indice++) {
    const fila = filas.nth(indice);
    const casilla = fila.locator('p-checkbox .p-checkbox-box');
    const activo = await casilla.evaluate((elemento) => elemento.classList.contains('p-highlight'));
    const debeEstarActivo = activos.includes(indice + 1);
    if (activo !== debeEstarActivo) {
      await casilla.click();
    }
    if (!debeEstarActivo) {
      continue;
    }
    await fila.locator('#meter').click();
    await page.getByRole('option', { name: MEDIDOR }).click();
    await fila.locator('#yearOfProduction').click();
    await page.getByRole('option').first().click();
    await fila.locator('input[formcontrolname=serialNumber]').fill(`E2E-${indice + 1}`);
  }
  await page.getByRole('button', { name: 'Continuar' }).click();
}

/**
 * Deja la fuente lista y empieza a medir el paso. Con generador manual el operario confirma las
 * fotocélulas; con el generador PYC 5050 (EDET) la app lo enciende.
 */
export async function comenzarMedicion(page: Page): Promise<void> {
  const habilitar = page
    .getByRole('button', { name: 'Fotocélulas ajustadas' })
    .or(page.getByRole('button', { name: 'Iniciar generador' }));
  await habilitar.click();
  const comenzar = page.getByRole('button', { name: 'Comenzar medición' });
  await expect(comenzar).toBeEnabled();
  await comenzar.click();
}

/** Fila de resultados de un puesto en el paso en curso (1 = primer puesto) */
export function resultadoPuesto(page: Page, puesto: number): Locator {
  const numero = String(puesto).padStart(2, '0');
  return page.getByTestId('resultado-puesto').filter({ has: page.getByRole('cell', { name: numero, exact: true }) });
}

// API del simulador en la ventana de la máquina virtual (ver SimulatorService)
type Escenario = 'aleatorio' | 'todo-aprueba' | 'todo-falla' | 'mixto' | 'personalizado';

export function simulador(ventana: Page) {
  return {
    escenario: (escenario: Escenario): Promise<void> =>
      ventana.evaluate((valor) => (window as any).__simulador.setScenario(valor), escenario),
    puesto: (
      puesto: number,
      paso: 'vacuum' | 'contrast' | 'boot' | 'integration',
      ajuste: { outcome: 'aprueba' | 'falla' | 'valor'; value?: number | null },
    ): Promise<void> =>
      ventana.evaluate(([p, s, a]) => (window as any).__simulador.setStand(p, s, a), [puesto, paso, ajuste] as const),
  };
}
