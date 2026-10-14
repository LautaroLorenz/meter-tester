---
tipo: receta
area: qa
fecha: 2026-10-14
tags: [qa, interactivo, playwright]
---

# Receta — Modo interactivo (Claude maneja la app en vivo)

Para pedirle a Claude "probá X" y que maneje la app y devuelva capturas, sin escribir un test.
Solo con la máquina virtual (fase 7 del [[Plan - QA e2e]]); la máquina real queda para más adelante.

| Para qué | Comando |
|---|---|
| Abrir la app de un cliente (visible, máquina virtual, datos temporales) | `source ~/.nvm/nvm.sh && nvm use && npm run interactivo -- <edet\|chaco\|tandil\|edelap>` |
| Cerrarla (borra los datos temporales) | `npm run interactivo:cerrar` |
| Mandarle acciones (lo usa Claude) | `node e2e/interactivo/ejecutar.js <<'JS' ... JS` |

Necesita el build e2e del cliente (`npm run electron:serve-tsc && npm run build:e2e:<cliente>`).

## Cómo funciona

- `abrir.js` deja corriendo en segundo plano `servidor.js`, que abre la app con Playwright
  (`_electron.launch`, igual que los tests) en modo e2e visible (`--e2e-headed`), con el build del
  cliente y un `userData` temporal. Anula los diálogos nativos y cierra los avisos fijos de la base
  nueva. Atiende en `127.0.0.1` (puerto en `.interactivo/estado.json`).
- `ejecutar.js` le manda código de Playwright por stdin. Disponibles: `ventana` (principal),
  `maquina()` (ventana de la máquina virtual; se abre al ejecutar un ensayo), `simulador(metodo,
  ...args)` (`window.__simulador`: `setScenario`, `setStand`, `addFault`, `clearFaults`, ...),
  `capturar(nombre[, pagina])`, `expect` y `app`. Lo que devuelve el código se imprime como JSON.
- Capturas en `.interactivo/capturas/` (ignorado por git); si una acción falla, el servidor deja una
  captura `error`. Log del servidor: `.interactivo/servidor.log`.
- Los selectores son los mismos de los tests: `data-testid`, `data-automationid` del menú y los
  helpers de [[Receta - Correr tests e2e]] como referencia.

## Por qué no CDP

Conectar Playwright por CDP (`--remote-debugging-port` + `connectOverCDP`) a Electron 25 falla:
`Browser.setDownloadBehavior: Browser context management is not supported`. Por eso el servidor
mantiene la app abierta con `_electron.launch`.
