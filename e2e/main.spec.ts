import { test, expect } from '@playwright/test';
import * as FS from 'fs';
import * as PATH from 'path';
import { LaunchedApp, launchApp } from './support/launch-app';

const TRACE_PATH = PATH.join(__dirname, 'tracing', 'trace.zip');

test.describe.serial('Smoke', () => {
  let launched: LaunchedApp;

  // invoca un canal IPC del proceso main desde la ventana principal (nodeIntegration activo)
  const invoke = <T = unknown>(channel: string, ...args: unknown[]): Promise<T> =>
    launched.mainWindow.evaluate(
      ({ channel, args }) => (window as any).require('electron').ipcRenderer.invoke(channel, ...args) as Promise<T>,
      { channel, args },
    );

  test.beforeAll(async () => {
    launched = await launchApp();
    await launched.app.context().tracing.start({ screenshots: true, snapshots: true });
  });

  test.afterAll(async () => {
    await launched.app.context().tracing.stop({ path: TRACE_PATH });
    await launched.close();
  });

  test('la ventana principal abre oculta y sin crashear', async () => {
    const windowState = await launched.app.evaluate(({ BrowserWindow }) => {
      const window = BrowserWindow.getAllWindows()[0];
      return { isVisible: window.isVisible(), isCrashed: window.webContents.isCrashed() };
    });

    expect(windowState.isVisible).toBeFalsy();
    expect(windowState.isCrashed).toBeFalsy();
  });

  test('carga la pantalla inicial con el menu', async () => {
    const { mainWindow } = launched;

    await expect(mainWindow).toHaveURL(/#\/ensayos-disponibles$/);
    await expect(mainWindow.locator('app-menu')).toBeVisible();
    await expect(mainWindow.locator('app-page-title')).toContainText('Administración de Ensayos');

    await test.info().attach('pantalla-inicial', { body: await mainWindow.screenshot(), contentType: 'image/png' });
  });

  test('no busca puertos serie reales', async () => {
    const { ports } = await invoke<{ ports?: unknown }>('check-connection-logs');

    expect(ports).toBeUndefined();
  });

  test('la ventana de la maquina virtual abre oculta', async () => {
    const [virtualMachineWindow] = await Promise.all([launched.app.waitForEvent('window'), invoke('open-virtual-machine')]);
    await virtualMachineWindow.waitForLoadState('domcontentloaded');

    const visibleWindows = await launched.app.evaluate(({ BrowserWindow }) =>
      BrowserWindow.getAllWindows().filter((window) => window.isVisible()).length,
    );
    expect(visibleWindows).toBe(0);
    await expect(virtualMachineWindow).toHaveURL(/maquina-virtual$/);

    await test.info().attach('maquina-virtual', { body: await virtualMachineWindow.screenshot(), contentType: 'image/png' });
    await invoke('close-virtual-machine');
  });

  test('las descargas van a userData sin dialogo', async () => {
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

  test('los dialogos nativos no se abren', async () => {
    expect(await invoke('select-backup-folder')).toBeNull();

    await launched.mockOpenDialog([launched.userDataDir]);
    expect(await invoke('select-backup-folder')).toBe(launched.userDataDir);
  });
});
