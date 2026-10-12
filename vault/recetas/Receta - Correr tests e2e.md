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
| Compilar los 4 clientes en modo e2e y correr todo | `source ~/.nvm/nvm.sh && nvm use && npm run e2e` |
| Correr sin recompilar | `source ~/.nvm/nvm.sh && nvm use && npx playwright test -c e2e/playwright.config.ts e2e/` |
| Un solo cliente, sin recompilar | `source ~/.nvm/nvm.sh && nvm use && npx playwright test -c e2e/playwright.config.ts e2e/ --project=chaco` |
| Ver los tests en vivo (ventanas visibles) | `source ~/.nvm/nvm.sh && nvm use && npm run e2e:headed` |
| Reporte HTML: capturas y trace de cada test | `source ~/.nvm/nvm.sh && nvm use && npm run e2e:report` |
| Confirmar que la base real no se tocó (macOS) | `stat -f "%Sm" ~/Library/Application\ Support/oelec-ce-soft/database.db` |

Salidas (ignoradas por git): `e2e/report/` y `e2e/screenshots/`. Cada test adjunta su trace al
reporte: desde el test en el reporte se abre el visor, con la línea de tiempo cuadro a cuadro, el
DOM, la consola y la red de cada paso. Si el test falla, adjunta también una captura.

Sin video, por decisión: alcanza con las capturas. Además, con Electron 25 la grabación de video
de Playwright cuelga el arranque de la app.

## Escribir un test

1. Importar `test` y `expect` de `e2e/support/fixtures.ts` y pedir el fixture `launched`: cada
   test arranca su propia app en modo e2e, con `userData` temporal y diálogos anulados
   ([[ADR - Entorno e2e aislado]]). El fixture graba el trace y cierra la app al final.
   Cada test corre una vez por cliente (proyectos de Playwright); el fixture `client` dice cuál, y
   `CLIENTS[client]` de `e2e/support/clients.ts` da su configuración.
2. Navegar con `openMenu(page, [...])` de `e2e/support/menu.ts`, pasando el camino de
   `automationId` del menú (por ejemplo `['menu-medidores', 'menu-medidores-marcas']`).
   Para elementos propios de la app, usar `data-testid` y `getByTestId`.
3. Ventana principal: `launched.mainWindow`. Ventana del simulador: invocar
   `open-virtual-machine` y esperar `app.waitForEvent('window')`.
4. Canales IPC del main desde el renderer (hay `nodeIntegration`):
   `mainWindow.evaluate(() => require('electron').ipcRenderer.invoke('<canal>'))`.
5. Si el flujo abre un diálogo de carpeta o archivo: `await launched.mockOpenDialog([ruta])`
   antes de la acción. Sin eso, el diálogo devuelve "cancelado".
6. Archivos descargados: quedan en `launched.downloadsDir`.
7. Evidencia: `await test.info().attach('<nombre>', { body: await page.screenshot(), contentType: 'image/png' })`.
   Funciona con las ventanas ocultas.
8. Diálogos de PrimeNG: `getByRole('dialog').filter({ hasText: '<título>' })`. PrimeNG 16 no
   les da nombre accesible, así que `getByRole('dialog', { name })` no los encuentra.
