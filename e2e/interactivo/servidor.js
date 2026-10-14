// Modo interactivo (fase 7): abre la app con Playwright (igual que los tests, pero visible) y
// atiende en 127.0.0.1 las acciones que manda ejecutar.js. Lo arranca abrir.js.
const FS = require('fs');
const HTTP = require('http');
const OS = require('os');
const PATH = require('path');
const { _electron: electron, expect } = require('@playwright/test');

const RAIZ = PATH.join(__dirname, '../..');
const ESTADO = PATH.join(RAIZ, '.interactivo');
const CAPTURAS = PATH.join(ESTADO, 'capturas');
const cliente = process.argv[2];

async function main() {
  const userDataDir = FS.mkdtempSync(PATH.join(OS.tmpdir(), 'meter-tester-interactivo-'));
  const app = await electron.launch({
    args: [
      PATH.join(RAIZ, 'app/main.js'),
      '--environment=e2e',
      '--e2e-headed',
      `--e2e-dist=${PATH.join(RAIZ, 'dist-e2e', cliente)}`,
      `--user-data-dir=${userDataDir}`,
    ],
  });
  // los diálogos nativos no se pueden manejar desde acá: se anulan como en los tests
  await app.evaluate(({ app: electronApp, dialog }) => {
    dialog.showOpenDialog = () => Promise.resolve({ canceled: true, filePaths: [] });
    dialog.showSaveDialog = () => Promise.resolve({ canceled: true });
    dialog.showMessageBox = () => Promise.resolve({ response: 0, checkboxChecked: false });
    electronApp.relaunch = () => undefined;
  });
  const ventana = await app.firstWindow();
  // con la base nueva quedan dos avisos fijos arriba a la derecha que tapan botones: se cierran
  // (igual que launchApp en los tests)
  const avisos = ventana.locator('p-toast p-toastitem');
  await avisos.getByText('Base de datos actualizada').waitFor({ timeout: 30000 });
  for (const cerrarAviso of await avisos.getByRole('button', { name: 'Close' }).all()) {
    await cerrarAviso.dispatchEvent('click');
  }
  await expect(avisos).toHaveCount(0);

  const maquina = () => app.windows().find((pagina) => pagina.url().includes('maquina-virtual'));
  const simulador = async (metodo, ...args) => {
    const vm = maquina();
    if (!vm) throw new Error('La máquina virtual no está abierta (se abre al ejecutar un ensayo)');
    return vm.evaluate(([m, a]) => window.__simulador[m](...a), [metodo, args]);
  };
  const AsyncFunction = Object.getPrototypeOf(async () => undefined).constructor;

  const cerrar = async () => {
    await app.close().catch(() => undefined);
    FS.rmSync(userDataDir, { recursive: true, force: true });
    FS.rmSync(PATH.join(ESTADO, 'estado.json'), { force: true });
    process.exit(0);
  };
  app.on('close', () => cerrar());

  const servidor = HTTP.createServer(async (pedido, respuesta) => {
    let cuerpo = '';
    for await (const parte of pedido) cuerpo += parte;
    if (pedido.url === '/cerrar') {
      respuesta.end('{}');
      return cerrar();
    }
    const capturas = [];
    const capturar = async (nombre, pagina = ventana) => {
      FS.mkdirSync(CAPTURAS, { recursive: true });
      const archivo = PATH.join(CAPTURAS, `${new Date().toISOString().replace(/[:.]/g, '-')}-${nombre}.png`);
      await pagina.screenshot({ path: archivo });
      capturas.push(archivo);
      return archivo;
    };
    try {
      const resultado = await new AsyncFunction('ventana', 'maquina', 'simulador', 'capturar', 'expect', 'app', cuerpo)(
        ventana,
        maquina,
        simulador,
        capturar,
        expect,
        app,
      );
      respuesta.end(JSON.stringify({ resultado, capturas }));
    } catch (error) {
      // si falla, una captura de cómo quedó la pantalla
      await capturar('error').catch(() => undefined);
      respuesta.statusCode = 500;
      respuesta.end(JSON.stringify({ error: error.message, capturas }));
    }
  });
  servidor.listen(0, '127.0.0.1', () => {
    const { port } = servidor.address();
    FS.writeFileSync(
      PATH.join(ESTADO, 'estado.json'),
      JSON.stringify({ pid: process.pid, cliente, userDataDir, url: `http://127.0.0.1:${port}` }, null, 2),
    );
    console.log(`listo en el puerto ${port}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
