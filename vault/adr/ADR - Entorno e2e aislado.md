---
tipo: adr
estado: aceptada
fecha: 2026-10-12
tags: [qa, e2e, electron, serial]
---

# ADR — Entorno e2e aislado

## Contexto

Los tests e2e lanzan la app Electron real. Sin aislar, tocan cosas de la máquina de quien los
corre: la base SQLite y electron-store (en `userData`), el puerto serie USB (adaptador
CH340 `1A86:7523`), `~/Downloads`, diálogos nativos que bloquean, y `app.relaunch`.

No es un sandbox del sistema operativo: el aislamiento es por configuración. Un sandbox real
sería CI o un contenedor Linux con Xvfb (fase 8 de [[Plan - QA e2e]]).

## Decisión

Un **entorno `e2e`** propio, para el proceso main y para el renderer:

- **Main** (`app/environment/environment.e2e.ts`, elegido con `--environment=e2e`):
  `virtualMachine: true` y `e2e: true`. `APP_CONFIG` ahora recibe el nombre del entorno
  (`dev` / `e2e` / producción por defecto). El campo `e2e` es opcional en `Config` para no
  obligar a tocar `environment.dev.ts`, que es configuración local.
- **Renderer** (`src/environments/environment.e2e.ts`, configuración `e2e` de `angular.json`):
  igual a producción (Usina Tandil, 20 puestos, PYC5050 / SM5050) pero con `virtualMachine: true`.

Con `e2e: true` el main:

| Riesgo | Cómo se evita |
|---|---|
| Puerto serie real | Siempre el simulador; si `e2e` sin `virtualMachine`, la app no arranca. |
| Ventanas en pantalla | `show: false` en principal y secundarias; sin `maximize()` ni `focus()` (en macOS las mostrarían). |
| Descargas (PDF, Excel) | `will-download` las guarda en `userData/downloads`, sin diálogo. |

Y el helper de tests (`e2e/support/launch-app.ts`):

| Riesgo | Cómo se evita |
|---|---|
| Base y electron-store reales | `--user-data-dir` temporal por corrida, borrado al cerrar. |
| Diálogos nativos | `showOpenDialog` / `showSaveDialog` / `showMessageBox` devuelven "cancelado"; `mockOpenDialog(rutas)` fija la próxima respuesta. |
| Reinicio | `app.relaunch` no hace nada. |

## Consecuencias

- `npm run e2e` compila `dist/` en modo e2e. `electron:local` y `electron:build` lo recompilan
  en producción; solo afecta si se lanza `electron .` a mano.
- Las corrientes simuladas de `command-map` siguen siendo aleatorias hasta la fase 4.
