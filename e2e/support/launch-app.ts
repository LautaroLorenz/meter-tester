import { ElectronApplication, Page, _electron as electron } from '@playwright/test';
import * as FS from 'fs';
import * as OS from 'os';
import * as PATH from 'path';

export interface LaunchedApp {
  app: ElectronApplication;
  mainWindow: Page;
  userDataDir: string;
  downloadsDir: string;
  // próxima respuesta de dialog.showOpenDialog; sin llamar, el diálogo devuelve "cancelado"
  mockOpenDialog: (filePaths: string[]) => Promise<void>;
  close: () => Promise<void>;
}

// Lanza la app en modo e2e con el build del cliente (dist-e2e/<cliente>): máquina virtual,
// ventanas ocultas (salvo headed) y userData temporal
// (base, electron-store y descargas). Los diálogos nativos y app.relaunch quedan anulados
// para que nada bloquee el test ni lo saque de control.
// Con headed las ventanas se muestran, para mirar el test en vivo. No se graba video: con
// Electron 25 la grabación de Playwright cuelga el arranque; el trace trae los cuadros igual.
export async function launchApp(options: { client: string; headed?: boolean }): Promise<LaunchedApp> {
  const userDataDir = FS.mkdtempSync(PATH.join(OS.tmpdir(), 'meter-tester-e2e-'));
  const args = [
    PATH.join(__dirname, '../../app/main.js'),
    '--environment=e2e',
    `--e2e-dist=${PATH.join(__dirname, '../../dist-e2e', options.client)}`,
    `--user-data-dir=${userDataDir}`,
  ];
  const app = await electron.launch({
    args: options.headed ? [...args, '--e2e-headed'] : args,
  });

  await app.evaluate(({ app: electronApp, dialog }) => {
    const state = { nextOpenDialog: null as string[] | null };
    (globalThis as any).__e2e = state;
    dialog.showOpenDialog = (() => {
      const filePaths = state.nextOpenDialog;
      state.nextOpenDialog = null;
      return Promise.resolve(filePaths ? { canceled: false, filePaths } : { canceled: true, filePaths: [] });
    }) as typeof dialog.showOpenDialog;
    dialog.showSaveDialog = (() => Promise.resolve({ canceled: true })) as typeof dialog.showSaveDialog;
    dialog.showMessageBox = (() => Promise.resolve({ response: 0, checkboxChecked: false })) as typeof dialog.showMessageBox;
    electronApp.relaunch = () => undefined;
  });

  const mainWindow = await app.firstWindow();
  await mainWindow.waitForLoadState('domcontentloaded');

  return {
    app,
    mainWindow,
    userDataDir,
    downloadsDir: PATH.join(userDataDir, 'downloads'),
    mockOpenDialog: (filePaths) =>
      app.evaluate((_, paths) => {
        (globalThis as any).__e2e.nextOpenDialog = paths;
      }, filePaths),
    close: async () => {
      await app.close();
      FS.rmSync(userDataDir, { recursive: true, force: true });
    },
  };
}
