---
tipo: plan
area: qa
estado: en curso
fecha: 2026-10-12
actualizado: 2026-10-12
tags: [qa, e2e, playwright, electron]
---

# Plan — QA e2e de meter-tester

Tests de QA automatizados sobre la app Electron real (Angular + Node), contra la máquina
virtual en lugar del equipo por USB. Se avanza **por fases**: cada una cierra con un
**checkpoint que verifica el usuario**, y no se pasa a la siguiente sin su confirmación.

- Rama de trabajo: `feature/e2e-tests`, que sale de `release/6.4.0` (esta sale de `release/6.3.0`).
- Un commit por fase. PR hacia `release/6.4.0` al cerrar la fase 2.
- Cómo correr los tests: [[Receta - Correr tests e2e]].
- Decisiones: [[ADR - Node 20 y Playwright 1.64]], [[ADR - Entorno e2e aislado]].

## Estado

| Fase | Estado | Qué incluye | Checkpoint del usuario |
|---|---|---|---|
| **0. Base** | ✅ `194c2e2` | Node 20, Playwright 1.64, smoke test real con trace y reporte HTML. | `npm run e2e` en verde; abrir trace y reporte. |
| **1. Entorno aislado** | ✅ `cd7249c` | Modo `e2e`: simulador obligatorio, ventanas ocultas, `userData` temporal, descargas a `userData/downloads`, diálogos nativos y `app.relaunch` anulados. 6 tests. | Dos corridas iguales, sin ventanas; la base real sin modificar; `npm start` igual que antes. |
| **2. Base de los tests** | ✅ `660d72f` | Fixture `launched` (una app limpia por test, con trace adjunto y captura si falla); modo visible `npm run e2e:headed`; `automationId` en el menú; un test que recorre las 6 pantallas y los 2 diálogos del menú. Sin video: alcanza con las capturas (además, con Electron 25 la grabación cuelga el arranque). El parámetro de cliente se suma en la 2b. | En el reporte, el trace del recorrido con todas las pantallas; `npm run e2e:headed` muestra el recorrido en vivo. |
| **2b. Configuraciones por cliente** | ✅ `55acdc3` (portable probado en Windows) | Catálogo en `src/environments/client.<cliente>.ts`; un build e2e y un proyecto de Playwright por cliente (32 tests = 8 × 4); test que verifica la configuración de cada build; `npm run electron:build:<cliente>` con el cliente en el nombre del archivo. Ver "Configuración por cliente". | El reporte muestra cada test una vez por cliente, todos en verde; el portable de un cliente generado en la PC con Windows. |
| **3. ABM básicos** | ✅ `5b01748` | 15 casos, solo en EDET (`@un-cliente`): marcas (alta, validación, edición, búsqueda, baja, baja cancelada), modelos (alta, validaciones, edición, baja con marca en uso) y plantillas (alta con un paso, validaciones, nombre repetido, edición, baja). | Validar la lista de casos con sus capturas. |
| **4. Ensayo completo** | ⏳ Detalle más adelante | `run-essay` de punta a punta: ensayo, resultados, historial, PDF. Corrientes simuladas deterministas (hoy usan `Math.random` en `command-map`). | Video del ensayo; revisar el PDF generado. |
| **5. Fallas del simulador** | ⏳ Detalle más adelante | Simulador programable: timeout, trama corrupta, sin respuesta, cancelar un ensayo. | Definir qué debería pasar en cada falla y que el test lo compruebe. |
| **6. Protocolo serial** | ⏳ | Vitest sobre `CommandProcessor` y `machine` con `@serialport/binding-mock`, sin UI. | Lista de comandos cubiertos; `npm run test:serial`. |
| **7. Modo interactivo** | ⏳ | Flag de CDP (`--remote-debugging-port`) + MCP para que Claude maneje la app en vivo. | Pedir "probá X" y recibir capturas de la app real. |
| **8. CI** | ⏳ | Matriz macOS + Linux + Windows. Arreglar los workflows (Linux usa `ubuntu-18.04`, retirada; Windows sigue en Node 18.16), Xvfb en Linux, módulos nativos por plataforma, subir traces y videos como archivos de la corrida. | PR con el check en verde y los archivos descargables. |

## Dudas resueltas

1. **Flujos críticos:** se detallan después de la implementación básica. El foco inicial son los ABM básicos (fase 3); ensayo completo y fallas (fases 4 y 5) quedan para más adelante.
2. **Plataformas:** macOS, Linux y Windows. Local se corre en macOS; las tres van en la matriz de CI (fase 8).
3. Los cambios de app para testear entran en 6.4.0.
4. **Configuración por cliente:** todas las configuraciones de clientes tienen que andar, porque cada cliente tiene la suya en su instalación. Ver abajo.
5. Un commit por fase; PR hacia `release/6.4.0` al cerrar la fase 2.
6. **Evidencia:** por ahora solo local (reportes, traces y capturas ignorados por git). Capturas de pantalla, sin video.
7. Los `environment.dev.*` son configuración local del usuario y no se commitean.

## Configuración por cliente

La configuración de un cliente vive en dos capas:

| Capa | Qué define | Cuándo se fija |
|---|---|---|
| Entorno del renderer (`src/environments/environment.prod.ts`) | logo, cantidad de puestos, generador, patrón, `delays` | Al compilar |
| `ClientSettings` (electron-store) | `companyName`, `brandDescription` | En ejecución, desde la app |

Proceso actual de release: se edita `environment.prod.ts` con la configuración del cliente, se
genera el build y se le entrega la versión en una carpeta.

`skipSteps` es solo para desarrollo (ahorra tiempo): **los clientes corren todos los pasos**, así
que en todas las configuraciones de cliente va todo en `false`.

### Catálogo de clientes

| Cliente | Puestos | Patrón (`PatternEnum`) | Generador (`GeneratorEnum`) | Logo en el repo |
|---|---|---|---|---|
| EDET - Tucumán | 20 | `Sm5050` | `SemiautomaticPYC5050` | `company-logo-edet.png` / `.svg` |
| Chaco | 3 | `Physical` | `Manual` | Sin logo (`companyLogoPath: ''`): el PDF muestra el nombre de la empresa |
| Tandil | 6 | `Virtual` | `Manual` | `company-logo-usina-tandil.png` |
| EDELAP - La Plata | 8 | `Physical` | `Manual` | `company-logo-edelap.png` |

Resuelto en la 2b: el `environment.prod.ts` commiteado mezclaba clientes (logo de Usina Tandil con
la configuración de EDET). Ahora toma los valores del catálogo y ya no se edita a mano.

### Cómo funciona (fase 2b)

- **Catálogo:** `src/environments/client.<cliente>.ts` (`edet`, `chaco`, `tandil`, `edelap`), con
  lo propio de cada cliente (`ClientConfig`: logo, puestos, generador, patrón). Están al mismo
  nivel que `client.ts` porque Angular resuelve los imports del archivo reemplazado desde la
  ubicación del original.
- **`environment.prod.ts` y `environment.e2e.ts`** toman los valores de `client.ts`; lo común
  (pasos, delays) queda en el entorno. `client.ts` apunta a EDET: es el cliente de los builds sin
  cliente (`build:prod`, `electron:local`).
- **Angular:** `production-<cliente>` (release, en `dist/`) y `e2e-<cliente>` (tests, en
  `dist-e2e/<cliente>`) reemplazan `environment.ts` y `client.ts`.
- **Tests:** un proyecto de Playwright por cliente; el fixture lanza la app con
  `--e2e-dist=dist-e2e/<cliente>`. `cliente.spec.ts` verifica que el build tenga la configuración
  del catálogo (el renderer la expone en `window.__APP_CONFIG__`, solo en E2E).
- **Release:** `npm run electron:build:<cliente>` (`scripts/release.js`). `npm run electron:build`
  sin cliente falla a propósito. El nombre del archivo lleva el cliente:
  `OELEC - CE Soft - <Cliente> - <versión>.exe` en Windows.

**Agregar un cliente:** crear `client.<cliente>.ts`, sumar `production-<cliente>` y
`e2e-<cliente>` en `angular.json`, `build:e2e:<cliente>` y `electron:build:<cliente>` en
`package.json`, y el cliente en `scripts/release.js` y `e2e/support/clients.ts`.

Comunes a todos los clientes: `delays` de producción (50 ms en los tres), `skipSteps` todo en
`false`, y `ClientSettings` por defecto (`EDET` / `Laboratorio de Medidores`): en el historial del
repo no hay valores propios de cada cliente.

### Release por cliente (decidido, va en la fase 2b)

El mismo catálogo genera el release: una configuración de Angular y un script por cliente
(`npm run electron:build:<cliente>`), con el cliente en el nombre del portable. Ya no se edita
`environment.prod.ts` a mano, y lo que se entrega es exactamente la configuración que pasó los
tests. Se prueba de punta a punta en la PC con Windows, donde se genera el portable.

## Hallazgos de QA

Comportamientos de la app encontrados al escribir los tests. No se tocaron; quedan para decidir.

- **Los avisos tapan el "Guardar" de las plantillas.** Los avisos (p-toast) salen arriba a la
  derecha, justo sobre el botón "Guardar" del armado de plantillas. Después de guardar, el aviso
  "Guardado correctamente" aparece bajo el cursor y tapa el botón mientras dura.
- **Avisos fijos en el primer arranque.** Con una base nueva, "Base de datos creada" y "Base de
  datos actualizada" quedan fijos (no se van solos) sobre la misma zona hasta que el usuario los
  cierra.

## Release

- **El portable de Windows que reciben los clientes se genera en una PC con Windows**, no en la
  Mac. En la Mac, `npm run electron:build` genera solo el `.dmg` de Mac.
- **electron-builder 26.0.20** ([[ADR - electron-builder 26]]): el release ya no compila los
  módulos nativos, usa binarios precompilados. En la Mac sale con `npm run electron:build` a secas;
  los problemas de `distutils` (Python 3.12+) y del SDK de macOS 27 dejan de importar.
- **Probado en la PC con Windows (2026-10-12):** Node 20, `npm ci` y
  `npm run electron:build:<cliente>` generan el portable y funciona igual que el último entregado
  ([[Receta - Release en Windows]]).
- **Fase 2b:** los scripts `electron:build:<cliente>` se prueban de punta a punta en esa PC.
- **Los workflows de CI llaman a `npm run electron:build`**, que ahora pide cliente: fallan hasta
  la fase 8 (el de Linux ya fallaba por `ubuntu-18.04`; el de Windows corre al pushear a `main`).
- **A futuro (fase 8):** el workflow de Windows en CI podría generar los portables de cada
  cliente, sin depender de una PC.
