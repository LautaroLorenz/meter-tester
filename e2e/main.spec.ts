import { ElectronApplication, Page, _electron as electron, test, expect } from '@playwright/test';
import * as FS from 'fs';
import * as OS from 'os';
import * as PATH from 'path';

const TRACE_PATH = PATH.join(__dirname, 'tracing', 'trace.zip');

test.describe.serial('Smoke', () => {
  let app: ElectronApplication;
  let mainWindow: Page;
  let userDataDir: string;

  test.beforeAll(async () => {
    // userData temporal: la base (database.db) y electron-store viven ahi, asi el test no toca la del usuario
    userDataDir = FS.mkdtempSync(PATH.join(OS.tmpdir(), 'meter-tester-e2e-'));
    app = await electron.launch({
      args: [PATH.join(__dirname, '../app/main.js'), `--user-data-dir=${userDataDir}`],
    });
    await app.context().tracing.start({ screenshots: true, snapshots: true });
    mainWindow = await app.firstWindow();
    await mainWindow.waitForLoadState('domcontentloaded');
  });

  test.afterAll(async () => {
    await app.context().tracing.stop({ path: TRACE_PATH });
    await app.close();
    FS.rmSync(userDataDir, { recursive: true, force: true });
  });

  test('la ventana principal abre visible y sin crashear', async () => {
    const windowState = await app.evaluate(async ({ BrowserWindow }) => {
      const window = BrowserWindow.getAllWindows()[0];
      if (!window.isVisible()) {
        await new Promise((resolve) => window.once('ready-to-show', resolve));
      }
      return { isVisible: window.isVisible(), isCrashed: window.webContents.isCrashed() };
    });

    expect(windowState.isVisible).toBeTruthy();
    expect(windowState.isCrashed).toBeFalsy();
  });

  test('carga la pantalla inicial con el menu', async ({}, testInfo) => {
    await expect(mainWindow).toHaveURL(/#\/ensayos-disponibles$/);
    await expect(mainWindow.locator('app-menu')).toBeVisible();
    await expect(mainWindow.locator('app-page-title')).toContainText('Administración de Ensayos');

    await testInfo.attach('pantalla-inicial', {
      body: await mainWindow.screenshot(),
      contentType: 'image/png',
    });
  });
});
