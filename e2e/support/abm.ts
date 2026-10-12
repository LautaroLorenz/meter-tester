import { Locator, Page, expect } from '@playwright/test';

// Pantallas hechas con el componente genérico app-abm (marcas, modelos, ...)
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function abm(page: Page) {
  return {
    nuevo: (): Promise<void> => page.getByTestId('abm-nuevo').click(),
    buscar: (texto: string): Promise<void> => page.getByTestId('abm-buscar').fill(texto),
    filas: page.getByTestId('abm-fila'),
    fila: (texto: string): Locator => page.getByTestId('abm-fila').filter({ hasText: texto }),
    // PrimeNG 16 no le da nombre accesible al p-dialog: se busca por el texto del header
    detalle: page.getByRole('dialog').filter({ hasText: 'Detalle' }),
    guardar: page.getByTestId('abm-guardar'),
    cancelar: page.getByTestId('abm-cancelar'),
  };
}

// Responde el diálogo de confirmación (p-confirmDialog) que la app usa antes de borrar
export function confirmar(page: Page, respuesta: 'Confirmar' | 'Cancelar'): Promise<void> {
  return page.locator('p-confirmdialog').getByRole('button', { name: respuesta }).click();
}

// Mensajes de la app (p-toast): 'Agregado correctamente', 'Eliminado correctamente', ...
export function aviso(page: Page, texto: string): Locator {
  return page.locator('p-toast').getByText(texto).first();
}

// Los avisos aparecen arriba a la derecha y tapan los botones de esa zona (el Guardar de las
// plantillas) mientras duran (1,25 s los de éxito). Con el mouse encima no se van: después de
// clickear Guardar el aviso aparece justo debajo del cursor. Se aleja el mouse y se espera.
export async function esperarAvisos(page: Page): Promise<void> {
  await page.mouse.move(0, 0);
  await expect(page.locator('p-toast p-toastitem')).toHaveCount(0, { timeout: 10000 });
}

// Elige una opción de un p-dropdown por el id del componente
export async function elegir(page: Page, dropdownId: string, opcion: string): Promise<void> {
  await page.locator(`#${dropdownId}`).click();
  await page.getByRole('option', { name: opcion, exact: true }).click();
}

// Escribe en un p-inputNumber (el id está en el componente, el input real adentro). El
// componente le pasa el valor al formulario recién al perder el foco: se sale con Tab.
export async function escribirNumero(page: Page, inputNumberId: string, valor: string): Promise<void> {
  const input = page.locator(`#${inputNumberId} input`);
  await input.fill(valor);
  await input.press('Tab');
}
