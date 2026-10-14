// Modo interactivo (fase 7): deja corriendo en segundo plano servidor.js, que abre la app visible
// con la máquina virtual, el build e2e del cliente y datos temporales, y recibe las acciones de
// ejecutar.js.
//   npm run interactivo -- <cliente>          (edet | chaco | tandil | edelap)
//   npm run interactivo:cerrar
const { spawn } = require('child_process');
const FS = require('fs');
const PATH = require('path');

const RAIZ = PATH.join(__dirname, '../..');
const ESTADO = PATH.join(RAIZ, '.interactivo');
const ARCHIVO_ESTADO = PATH.join(ESTADO, 'estado.json');
const CLIENTES = ['edet', 'chaco', 'tandil', 'edelap'];

function leerEstado() {
  try {
    return JSON.parse(FS.readFileSync(ARCHIVO_ESTADO, 'utf8'));
  } catch {
    return null;
  }
}

function corriendo(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function cerrar() {
  const estado = leerEstado();
  if (estado && corriendo(estado.pid)) {
    await fetch(`${estado.url}/cerrar`, { method: 'POST' }).catch(() => process.kill(estado.pid));
    console.log(`App cerrada (${estado.cliente}).`);
  } else {
    console.log('No hay una app interactiva abierta.');
  }
  FS.rmSync(ARCHIVO_ESTADO, { force: true });
}

async function abrir(cliente) {
  if (!CLIENTES.includes(cliente)) {
    console.error(`Indicá el cliente: npm run interactivo -- <${CLIENTES.join(' | ')}>`);
    process.exit(1);
  }
  if (!FS.existsSync(PATH.join(RAIZ, 'dist-e2e', cliente, 'index.html'))) {
    console.error(`Falta el build e2e de ${cliente}: npm run electron:serve-tsc && npm run build:e2e:${cliente}`);
    process.exit(1);
  }
  const anterior = leerEstado();
  if (anterior && corriendo(anterior.pid)) {
    console.error(`Ya hay una app abierta (${anterior.cliente}): npm run interactivo:cerrar`);
    process.exit(1);
  }
  FS.mkdirSync(ESTADO, { recursive: true });
  FS.rmSync(ARCHIVO_ESTADO, { force: true });
  const log = FS.openSync(PATH.join(ESTADO, 'servidor.log'), 'w');
  spawn(process.execPath, [PATH.join(__dirname, 'servidor.js'), cliente], {
    detached: true,
    stdio: ['ignore', log, log],
  }).unref();

  // el servidor escribe el estado cuando la app está lista
  const hasta = Date.now() + 60000;
  while (Date.now() < hasta) {
    const estado = leerEstado();
    if (estado) {
      console.log(`App abierta: ${estado.cliente}, datos temporales en ${estado.userDataDir}`);
      return;
    }
    await new Promise((listo) => setTimeout(listo, 500));
  }
  console.error(`La app no arrancó: ver ${PATH.join(ESTADO, 'servidor.log')}`);
  process.exit(1);
}

(process.argv[2] === 'cerrar' ? cerrar() : abrir(process.argv[2])).catch((error) => {
  console.error(error.message);
  process.exit(1);
});
