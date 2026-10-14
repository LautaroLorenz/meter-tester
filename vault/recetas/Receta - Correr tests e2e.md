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
| Tests del protocolo serial (sin interfaz, ~15 s) | `source ~/.nvm/nvm.sh && nvm use && npm run test:serial` |
| Confirmar que la base real no se tocó (macOS) | `stat -f "%Sm" ~/Library/Application\ Support/oelec-ce-soft/database.db` |

Salidas (ignoradas por git): `e2e/report/` y `e2e/screenshots/`. Ojo: pasar `--reporter=line`
(u otro) reemplaza los reporters de la config y no se regenera el reporte HTML. Cada test adjunta su trace al
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
3. Ventana principal: `launched.mainWindow`. La ventana del simulador la abre la app al entrar a
   ejecutar un ensayo: `abrirEnsayo` de `e2e/support/ensayo.ts` la devuelve.
4. Canales IPC del main desde el renderer (hay `nodeIntegration`):
   `mainWindow.evaluate(() => require('electron').ipcRenderer.invoke('<canal>'))`.
5. Si el flujo abre un diálogo de carpeta o archivo: `await launched.mockOpenDialog([ruta])`
   antes de la acción. Sin eso, el diálogo devuelve "cancelado".
6. Archivos descargados: quedan en `launched.downloadsDir`.
7. Evidencia: `await test.info().attach('<nombre>', { body: await page.screenshot(), contentType: 'image/png' })`.
   Funciona con las ventanas ocultas.
8. Diálogos de PrimeNG: `getByRole('dialog').filter({ hasText: '<título>' })`. PrimeNG 16 no
   les da nombre accesible, así que `getByRole('dialog', { name })` no los encuentra.
9. Tests de funciones comunes a todos los clientes (ABM): `{ tag: '@un-cliente' }` en el
   `describe`; corren solo en el proyecto `edet`.
10. Pantallas con `app-abm` (marcas, modelos, plantillas): helpers de `e2e/support/abm.ts`
    (`abm(page).nuevo()`, `.fila(texto)`, `.guardar`, `confirmar`, `aviso`, `elegir` para
    `p-dropdown`, `escribirNumero` para `p-inputNumber`, `esperarAvisos`). Botones de cada fila:
    `data-testid="abm-editar"` / `"abm-borrar"`.
11. Ensayos: helpers de `e2e/support/ensayo.ts`: `crearMedidor`, `crearPlantillaEnsayo(page,
    nombre, [{ paso: 'vacio' | 'contraste' | 'arranque' | 'integracion', parametros? }])` (con
    parámetros cortos por defecto), `abrirEnsayo`, `verificar`, `prepararPuestos(page, [1, 2, 3])`,
    `comenzarMedicion` (fotocélulas o generador según el cliente) y `resultadoPuesto(page, n)`.
12. Simulador: `simulador(ventana).escenario('mixto')` y `.puesto(n, 'contrast', { outcome:
    'valor', value: 0.8 })` (ver "4a" en [[Plan - QA e2e]]). Hay que elegir el escenario antes de
    que empiece el paso.
13. Para probar lo que se recuerda entre sesiones: cerrar `launched.app` y
    `launchApp({ client, userDataDir: launched.userDataDir })`.

## Particularidades de la app que afectan a los tests

- **Arranque:** con la base nueva, la app muestra dos avisos fijos ("Base de datos creada" /
  "actualizada") al terminar las migraciones. `launchApp` espera ese momento (la base está lista)
  y los cierra; sin eso tapan los botones de arriba a la derecha.
- **`p-inputNumber`:** con `fill()` de Playwright, el valor llega al formulario recién al perder
  el foco (tipeando tecla por tecla llega al instante). `escribirNumero` sale del campo con Tab.
- **Nombre de plantilla:** se valida contra la base 1 s después de escribirlo (`ng-pending`
  mientras tanto); esperar con `expect(...).toBeEnabled()` o a que no tenga `ng-pending`.
- **Avisos y botón Guardar de plantillas:** el aviso tapa el botón mientras dura y no se va con
  el mouse encima; `esperarAvisos` aleja el mouse y espera.
- **Textos parecidos:** `getByText('Activa')` también encuentra "Reactiva"; usar `{ exact: true }`.
- **Paso de vacío:** además de constante, impulsos y tiempo, pide la tensión de las tres fases
  (tres `p-inputNumber` con el mismo `id="voltage"`).
- **Fases con carga** (contraste, arranque, integración): tensión, corriente, cos φ y su letra
  (L/C) en cada fase; los ids se repiten, así que se busca dentro de cada `app-phase-form-group`.
  La lista de la letra tarda en cerrarse: esperar a que no quede ningún `listbox` antes de abrir
  la siguiente.
- **Contraste en modo secuencial** mide hasta que se pasa a "Ensayo unitario".
- **Decimales con coma:** los `p-inputNumber` con decimales (integradores) usan coma; con punto,
  "101.009" queda 101009. Escribir `String(valor).replace('.', ',')`.
- **Hallazgos:** si un test encuentra un error de la app, no se corrige en el momento: el test
  prueba lo que la app hace hoy y el error va a "Hallazgos de QA" del [[Plan - QA e2e]].
- **Integración sin integradores iniciales:** pregunta "Faltan valores iniciales" en un
  `p-confirmdialog`.
- **Tests unitarios (`npm test`):** ya daban "Some of your tests did a full page reload!" antes
  de la fase 4.

## Idioma y ventanas ocultas

- La app de los tests se lanza con `--lang=es` y `LANG=es_ES.UTF-8` / `LANGUAGE=es` (en Linux
  Chromium ignora `--lang`): números con coma decimal, como en las PC de los clientes, aunque el
  sistema esté en inglés (runners del CI). `--lang=es-AR` no sirve: Electron 25 no lo conoce y
  vuelve a `en-US`.
- En e2e las ventanas van ocultas y sin `backgroundThrottling`.

## PC lenta (como el CI)

Los runners del CI no tienen placa de video y son mucho más lentos. Para reproducir una falla del
CI en local, frenar la CPU de cada ventana:

```bash
source ~/.nvm/nvm.sh && nvm use && E2E_CPU_LENTO=6 npx playwright test -c e2e/playwright.config.ts --project=edet e2e/ensayo-completo.spec.ts
```

- Tiempos con margen: el arranque usa mínimo 6 s / máximo 12 s y las esperas de resultados 30 s.
- En el CI (`CI` definida) la espera de cada verificación es 15 s (local 5 s), crear la base 60 s y
  generar el PDF 90 s. Para correr local como en el CI: `CI=1 npx playwright test ...`.
- No sacar capturas de la ventana de la máquina virtual de una app reabierta: en el CI no se
  dibuja y la captura se cuelga.
- En el CI cada test se reintenta una vez (los que pasan al reintentar salen "flaky" en el reporte)
  y solo se guardan los traces de los que fallan.
