import { test as base } from '@playwright/test';
import { LaunchedApp, launchApp } from './launch-app';

// Cada test arranca su propia app limpia y deja en el reporte su trace (cuadros, DOM y consola
// de cada paso) y, si falla, una captura de la ventana principal. Con `playwright test --headed`
// las ventanas se ven, para mirar el test en vivo.
export const test = base.extend<{ launched: LaunchedApp }, { client: string }>({
  // lo define cada proyecto de playwright.config.ts
  client: ['edet', { option: true, scope: 'worker' }],
  launched: async ({ client, headless }, use, testInfo) => {
    const launched = await launchApp({ client, headed: !headless });
    await launched.app.context().tracing.start({ screenshots: true, snapshots: true });

    await use(launched);

    if (testInfo.status !== testInfo.expectedStatus) {
      await testInfo.attach('falla', { body: await launched.mainWindow.screenshot(), contentType: 'image/png' });
    }
    const tracePath = testInfo.outputPath('trace.zip');
    await launched.app.context().tracing.stop({ path: tracePath });
    await testInfo.attach('trace', { path: tracePath, contentType: 'application/zip' });

    await launched.close();
  },
});

export { expect } from '@playwright/test';
