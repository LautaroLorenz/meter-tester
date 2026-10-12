---
tipo: receta
area: qa
fecha: 2026-10-12
tags: [qa, e2e, playwright]
---

# Receta — Correr tests e2e

Siempre con Node 20 en la misma línea: cada terminal nueva arranca en la versión por defecto
de nvm ([[ADR - Node 20 y Playwright 1.64]]).

| Para qué | Comando |
|---|---|
| Compilar en modo e2e y correr todo | `source ~/.nvm/nvm.sh && nvm use && npm run e2e` |
| Correr sin recompilar | `source ~/.nvm/nvm.sh && nvm use && npx playwright test -c e2e/playwright.config.ts e2e/` |
| Ver cada paso (capturas, DOM, consola) | `source ~/.nvm/nvm.sh && nvm use && npm run e2e:show-trace` |
| Reporte HTML con capturas adjuntas | `source ~/.nvm/nvm.sh && nvm use && npm run e2e:report` |
| Confirmar que la base real no se tocó (macOS) | `stat -f "%Sm" ~/Library/Application\ Support/oelec-ce-soft/database.db` |

Salidas (todas ignoradas por git): `e2e/tracing/trace.zip`, `e2e/report/`, `e2e/screenshots/`.

## Escribir un test

1. Lanzar con `launchApp()` de `e2e/support/launch-app.ts`: modo e2e, `userData` temporal,
   diálogos anulados ([[ADR - Entorno e2e aislado]]). Cerrar con `close()`, que borra la
   carpeta temporal.
2. Ventana principal: `launched.mainWindow`. Ventana del simulador: invocar
   `open-virtual-machine` y esperar `app.waitForEvent('window')`.
3. Canales IPC del main desde el renderer (hay `nodeIntegration`):
   `mainWindow.evaluate(() => require('electron').ipcRenderer.invoke('<canal>'))`.
4. Si el flujo abre un diálogo de carpeta o archivo: `await launched.mockOpenDialog([ruta])`
   antes de la acción. Sin eso, el diálogo devuelve "cancelado".
5. Archivos descargados: quedan en `launched.downloadsDir`.
6. Evidencia: `await test.info().attach('<nombre>', { body: await page.screenshot(), contentType: 'image/png' })`.
   Funciona con las ventanas ocultas.
