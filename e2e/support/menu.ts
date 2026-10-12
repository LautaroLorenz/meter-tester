import { Page } from '@playwright/test';

// Abre un ítem del menú recorriendo su camino de automationId (PrimeNG lo renderiza como data-automationid).
// El botón de configuración no es un ítem del modelo: se identifica por data-testid="menu-configuracion".
export async function openMenu(page: Page, path: string[]): Promise<void> {
  for (const automationId of path) {
    const locator =
      automationId === 'menu-configuracion'
        ? page.getByTestId(automationId)
        : page.locator(`[data-automationid="${automationId}"]`);
    await locator.click();
  }
}
