import * as FS from 'fs';
import * as PATH from 'path';
import { Page } from '@playwright/test';
import { test, expect } from './support/fixtures';

// invoca un canal IPC del proceso main desde una ventana (nodeIntegration activo)
const invoke = <T = unknown>(page: Page, channel: string, ...args: unknown[]): Promise<T> =>
  page.evaluate(
    ({ channel, args }) => (window as any).require('electron').ipcRenderer.invoke(channel, ...args) as Promise<T>,
    { channel, args },
  );

test.describe('Smoke', () => {
  test('la ventana principal abre sin crashear, oculta salvo en headed', async ({ launched, headless }) => {
    const windowState = await launched.app.evaluate(({ BrowserWindow }) => {
      const window = BrowserWindow.getAllWindows()[0];
      return { isVisible: window.isVisible(), isCrashed: window.webContents.isCrashed() };
    });

    expect(windowState.isVisible).toBe(!headless);
    expect(windowState.isCrashed).toBeFalsy();
  });

  test('carga la pantalla inicial con el menu', async ({ launched }) => {
    const { mainWindow } = launched;

    await expect(mainWindow).toHaveURL(/#\/ensayos-disponibles$/);
    await expect(mainWindow.locator('app-menu')).toBeVisible();
    await expect(mainWindow.locator('app-page-title')).toContainText('Administración de Ensayos');

    await test.info().attach('pantalla-inicial', { body: await mainWindow.screenshot(), contentType: 'image/png' });
  });

  test('no busca puertos serie reales', async ({ launched }) => {
    const { ports } = await invoke<{ ports?: unknown }>(launched.mainWindow, 'check-connection-logs');

    expect(ports).toBeUndefined();
  });

  test('la ventana de la maquina virtual abre, oculta salvo en headed', async ({ launched, headless }) => {
    const [virtualMachineWindow] = await Promise.all([
      launched.app.waitForEvent('window'),
      invoke(launched.mainWindow, 'open-virtual-machine'),
    ]);
    await virtualMachineWindow.waitForLoadState('domcontentloaded');

    const visibleWindows = await launched.app.evaluate(({ BrowserWindow }) =>
      BrowserWindow.getAllWindows().filter((window) => window.isVisible()).length,
    );
    expect(visibleWindows).toBe(headless ? 0 : 2);
    await expect(virtualMachineWindow).toHaveURL(/maquina-virtual$/);

    await test.info().attach('maquina-virtual', { body: await virtualMachineWindow.screenshot(), contentType: 'image/png' });
    await invoke(launched.mainWindow, 'close-virtual-machine');
  });

  test('las descargas van a userData sin dialogo', async ({ launched }) => {
    await launched.mainWindow.evaluate(() => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(new Blob(['e2e'], { type: 'text/plain' }));
      link.download = 'descarga-e2e.txt';
      link.click();
    });

    const downloadedFile = PATH.join(launched.downloadsDir, 'descarga-e2e.txt');
    await expect.poll(() => FS.existsSync(downloadedFile)).toBeTruthy();
    expect(FS.readFileSync(downloadedFile, 'utf8')).toBe('e2e');
  });

  test('los dialogos nativos no se abren', async ({ launched }) => {
    expect(await invoke(launched.mainWindow, 'select-backup-folder')).toBeNull();

    await launched.mockOpenDialog([launched.userDataDir]);
    expect(await invoke(launched.mainWindow, 'select-backup-folder')).toBe(launched.userDataDir);
  });
});
