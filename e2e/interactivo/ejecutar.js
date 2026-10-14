// Modo interactivo (fase 7): manda código de Playwright a la app abierta con
// `npm run interactivo -- <cliente>` y muestra el resultado. Lo usa Claude para manejar la app:
//   node e2e/interactivo/ejecutar.js <<'JS'
//     await ventana.locator('[data-automationid="menu-ensayos"]').click();
//     await capturar('menu');
//     return await ventana.title();
//   JS
// Disponibles: ventana (principal), maquina() (ventana de la máquina virtual, si está abierta),
// simulador(metodo, ...args) (window.__simulador de la máquina virtual), capturar(nombre[, pagina]),
// expect y app (ElectronApplication). Lo que devuelve el código se imprime como JSON, con las
// capturas guardadas en .interactivo/capturas.
const FS = require('fs');
const PATH = require('path');

async function main() {
  const estado = JSON.parse(FS.readFileSync(PATH.join(__dirname, '../../.interactivo/estado.json'), 'utf8'));
  const respuesta = await fetch(`${estado.url}/ejecutar`, { method: 'POST', body: FS.readFileSync(0, 'utf8') });
  const texto = await respuesta.text();
  console.log(JSON.stringify(JSON.parse(texto), null, 2));
  if (!respuesta.ok) process.exit(1);
}

main().catch((error) => {
  console.error(error.code === 'ENOENT' ? 'No hay una app abierta: npm run interactivo -- <cliente>' : error.message);
  process.exit(1);
});
