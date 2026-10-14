import { ElectronApplication, Page, _electron as electron, expect } from '@playwright/test';
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
// Con `userDataDir` reabre la app sobre los datos de otra (para probar lo que se recuerda entre
// sesiones): la base ya existe y `close` no borra la carpeta.
export async function launchApp(options: { client: string; headed?: boolean; userDataDir?: string }): Promise<LaunchedApp> {
  const userDataDir = options.userDataDir ?? FS.mkdtempSync(PATH.join(OS.tmpdir(), 'meter-tester-e2e-'));
  const args = [
    PATH.join(__dirname, '../../app/main.js'),
    '--environment=e2e',
    `--e2e-dist=${PATH.join(__dirname, '../../dist-e2e', options.client)}`,
    `--user-data-dir=${userDataDir}`,
    // idioma de los clientes: números con coma decimal (los runners del CI están en inglés). Electron 25
    // no conoce es-AR: con ese valor vuelve a en-US
    '--lang=es',
  ];
  const app = await electron.launch({
    args: options.headed ? [...args, '--e2e-headed'] : args,
    // en Linux Chromium ignora --lang y toma el idioma de estas variables
    env: { ...process.env, LANG: 'es_ES.UTF-8', LANGUAGE: 'es' },
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

  // E2E_CPU_LENTO=<n>: frena n veces la CPU de cada ventana, para reproducir una PC lenta (los
  // runners del CI no tienen placa de video)
  const cpuLento = Number(process.env.E2E_CPU_LENTO);
  if (cpuLento > 1) {
    const frenar = async (ventana: Page): Promise<void> => {
      const cdp = await app.context().newCDPSession(ventana);
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpuLento });
    };
    app.on('window', (ventana) => void frenar(ventana));
    await Promise.all(app.windows().map(frenar));
  }

  const mainWindow = await app.firstWindow();
  await mainWindow.waitForLoadState('domcontentloaded');

  // Con la base nueva la app avisa "Base de datos creada" y "Base de datos actualizada" al terminar
  // las migraciones. Son avisos fijos (no se van solos) que tapan la zona de arriba a la derecha:
  // se espera a que la base esté lista y se cierran.
  // El botón de cerrar nunca queda "estable" para Playwright (animación del toast): se dispara el
  // click directo y se verifica que desaparezcan.
  if (!options.userDataDir) {
    const avisos = mainWindow.locator('p-toast p-toastitem');
    // en el CI (Windows) crear la base a veces pasa de los 30 s
    await avisos.getByText('Base de datos actualizada').waitFor({ timeout: 60000 });
    for (const cerrar of await avisos.getByRole('button', { name: 'Close' }).all()) {
      await cerrar.dispatchEvent('click');
    }
    await expect(avisos).toHaveCount(0);
  }
  await mainWindow.locator('[data-automationid="menu-ensayos"]').waitFor();

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
      if (!options.userDataDir) {
        FS.rmSync(userDataDir, { recursive: true, force: true });
      }
    },
  };
}
