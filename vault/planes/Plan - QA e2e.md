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
| **4. Ensayo completo** | ✅ 4a `148c70a`, 4b `9a51103`, 4c `ab0de63`, 4d `9198242` | En sub-fases 4a–4d: simulador configurable (desarrollo y e2e), ensayo completo por cliente, reglas en sus bordes y PDF. Ver "Fase 4 — detalle". | Uno por sub-fase (ver detalle). |
| **5. Fallas del simulador** | ✅ `16f5675` (ver "Fase 5 — detalle") | Simulador programable: timeout, trama corrupta, sin respuesta, cancelar un ensayo. | Definir qué debería pasar en cada falla y que el test lo compruebe. |
| **6. Protocolo serial** | ✅ `cc25a46` (ver "Fase 6 — detalle") | Vitest sobre `CommandProcessor` y `machine` con `@serialport/binding-mock`, sin UI. | Lista de comandos cubiertos; `npm run test:serial`. |
| **7. Modo interactivo** | ✅ `759c551` | Solo máquina virtual (decisión del usuario; la real, más adelante). `npm run interactivo -- <cliente>` abre la app visible y Claude la maneja con `e2e/interactivo/ejecutar.js` (ver [[Receta - Modo interactivo]]). CDP no funciona con Electron 25: un servidor local mantiene la app con `_electron.launch`. | Pedir "probá X" y recibir capturas de la app real. |
| **8. CI** | ⏭️ Sigue (repo público: GitHub Actions gratis y sin límite de minutos en Linux, Windows y macOS) | Matriz macOS + Linux + Windows. Arreglar los workflows (Linux usa `ubuntu-18.04`, retirada; Windows sigue en Node 18.16), Xvfb en Linux, módulos nativos por plataforma, subir reportes, traces y capturas como archivos de la corrida. | PR con el check en verde y los archivos descargables. |

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

| Cliente | Empresa (`companyName`) | Puestos | Patrón (`PatternEnum`) | Generador (`GeneratorEnum`) | Logo en el repo |
|---|---|---|---|---|---|
| EDET - Tucumán | EDET | 20 | `Sm5050` | `SemiautomaticPYC5050` | `company-logo-edet.png` / `.svg` |
| Chaco | Secheep | 3 | `Physical` | `Manual` | Sin logo (`companyLogoPath: ''`): el PDF muestra el nombre de la empresa, **Secheep** |
| Tandil | Usina Tandil | 6 | `Virtual` | `Manual` | `company-logo-usina-tandil.png` |
| EDELAP - La Plata | EDELAP | 8 | `Physical` | `Manual` | `company-logo-edelap.png` |

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

## Fase 4 — detalle

Decidido con el usuario el 2026-10-13.

### 4a. Simulador configurable (sirve para desarrollo y para e2e)

Hoy el simulador es aleatorio (valores al azar y dependientes del reloj); mejorarlo era una deuda
conocida. Va en la ventana de la máquina virtual, que existe para simular la máquina física.

✅ `148c70a` (checkpoint del usuario OK). Cómo quedó:

- **Medidor simulado por puesto** (`src/app/services/simulator.service.ts`). En cada paso, cada
  puesto Aprueba, Falla o responde un **valor directo**:
  - vacío: impulsos en todo el paso (se emiten en el primer 40 % del tiempo);
  - contraste: error [%];
  - arranque: segundos hasta llegar a los impulsos permitidos (vacío = no arranca);
  - integración: segundos hasta completar los impulsos (por defecto 3 s); se queda en los
    impulsos del paso, así el error depende solo de los integradores.
  - Aprueba/Falla calculan el valor con los parámetros del paso. Arranque que falla: los puestos
    impares llegan antes del mínimo y los pares no arrancan. Contraste: el signo alterna por puesto.
- **Escenarios:** "Aleatorio" (el simulador histórico, sin cambios), "Todo aprueba", "Todo
  falla", "Mixto" (el puesto n falla el paso k —vacío 0, contraste 1, arranque 2— si n + k es
  múltiplo de 3) y "Personalizado" (al tocar un puesto).
- **Condiciones del banco:** vacío, arranque e integración piden lo mismo a la calculadora (TS02)
  y con generador manual la máquina no recibe la carga, así que el simulador no puede deducir el
  paso. En modo máquina virtual, al empezar cada paso la app le avisa el paso y sus parámetros
  (`TestRunComponent` → IPC `virtual-machine-bench` → ventana del simulador). Las respuestas
  siguen el camino real (puerto serie simulado y validación de tramas).
- **Panel "Escenario"** en la ventana de la máquina virtual, con el paso en curso y el valor que
  responde cada puesto. Para los tests, la misma API en `window.__simulador`.
- **Recuerda la última selección** en el `localStorage` de la ventana (vive en `userData`): los
  tests, con `userData` temporal, arrancan siempre en "Aleatorio".
- Fallas de comunicación, alarma de sobrecorriente y errores del generador: fase 5.

### 4b. Ensayo completo por cliente (los 4)

✅ `9a51103` (checkpoint del usuario OK). `e2e/ensayo-completo.spec.ts`, en los 4 clientes (40 s en
Chaco, 70 s en EDET): integración con aprobación manual (impares aprueban, pares se rechazan),
PDF validado y adjunto al reporte, historial con una fila por puesto activo y paso (20 por página).
Al hacerla apareció y se corrigió un problema del simulador: el historial de comandos crecía sin
límite (main lo mandaba entero con cada comando y la ventana lo redibujaba), así que la máquina
virtual respondía cada vez más lento; con 19 puestos la primera lectura del arranque llegaba
después del mínimo y un puesto que tenía que fallar salía OK. Ahora main manda solo el comando
nuevo y la tabla guarda los últimos 500.

- Verificación → preparación (todos los puestos, uno inactivo) → los 4 pasos → reporte.
- Escenario "Mixto": en cada paso, algunos puestos aprueban y otros fallan.
- Generador manual: "Fotocélulas ajustadas" y "Generador apagado"; EDET: "Iniciar generador".
- Contraste: se mide en modo secuencial y se termina cambiando el selector a "Ensayo unitario",
  como lo hace el usuario.
- Reporte: resultado de cada puesto, filas del historial y PDF descargado. Capturas de cada etapa.
- Corre siempre en la suite; si la duración molesta, se toman medidas.

### 4c. Reglas en sus bordes (un cliente) e historial

- Cada regla de aprobado/rechazado en su borde (por ejemplo vacío: impulsos = máximo aprueba,
  máximo + 1 falla).
- Integración con integradores tipeados (además de "Aprobar todos" / "Rechazar todos").
- Exportación del historial a Excel.

✅ `ab0de63` (checkpoint del usuario OK): `e2e/reglas.spec.ts`, en EDET, un ensayo con 4 puestos
con valores directos del simulador. Vacío: 2 impulsos (= máximo) OK, 3 Falló, 0 OK, 10 Falló.
Contraste (máx. 1 %): 1,00 OK, 1,01 Falló, −1,00 OK, −1,01 Falló. Arranque (1 impulso entre 3 y
6 s): llega a 1,5 s Falló, a 4,5 s OK, no arranca Falló, a 7,5 s Falló (los tiempos llevan 1,5 s de
margen: la app lee a todos los puestos en cada vuelta). Integración (1000 imp = 1 kWh, máx. 1 %)
con integradores escritos en pantalla: 0 % OK, 0,9 % OK, 1,1 % Falló, −1,1 % Falló. Exportación a
Excel leída con `xlsx`: 16 filas y el mismo resultado por puesto y paso que en pantalla. El borde
exacto de integración (±1 %) no está en el test: hoy la app falla (ver "Hallazgos de QA").

Reglas (del código, confirmadas por el usuario):

| Paso | Falla si | Tiempo |
|---|---|---|
| Vacío | impulsos medidos > impulsos permitidos | durante `durationSeconds`; al terminar, los que no fallaron aprueban |
| Arranque | llega a los impulsos permitidos antes del mínimo, o no llega al terminar el máximo | ventana `minDurationSeconds`–`maxDurationSeconds`; dura siempre el máximo |
| Contraste | \|error\| > error máximo | sin tiempo: el usuario lo termina con el selector |
| Integración | \|error calculado\| > error máximo; error = (final − inicial − estimado) / estimado × 100 | hasta que todos los puestos llegan a `durationPulses` |

### 4d. PDF

- **Chaco:** el PDF muestra "EDET" porque Chaco no tiene logo y el nombre de la empresa está fijo.
  Debe mostrar "Secheep" (la empresa de Chaco). **Corregido** en `57f4827` (a pedido del usuario, antes de la
  fase 7): `companyName` en el catálogo de clientes (`ClientConfig`); el reporte lo usa y, si un
  entorno no lo trae (environment.ts, dev, web), sigue usando el de client-settings. En el entorno
  es opcional para no tocar los entornos locales.
- **EDET (20 puestos):** cada paso se dibuja en una hoja A4 fija; verificar que entren los 20 y que
  el test lo detecte si deja de entrar (el PDF cambia seguido).

✅ `9198242` (checkpoint del usuario OK). Cada hoja del reporte es un `div` A4 de alto fijo
(`app-pdf-page .page`) que html2canvas captura como imagen: si el contenido se pasa, el PDF lo
corta sin aviso. El ensayo completo de cada cliente mide hasta dónde llega el contenido de cada
hoja (`hojasPdf` en `e2e/support/ensayo.ts`) y falla si supera el A4; también verifica 5 páginas
(preparación + 4 pasos) y el encabezado (logo que carga, o nombre de la empresa si no hay logo).
El reporte dibuja todos los puestos (los inactivos, con la fila vacía). Alto usado / alto de la
hoja (px): EDET 873 preparación y 961 por paso de 1123 (86 %, entran ~6 filas más); EDELAP 561/553;
Tandil 509/485; Chaco 406/383. Comprobado que detecta: 25 filas de más llevan una hoja a 1467 px.
Chaco: `e2e/pdf.spec.ts` verifica "Secheep" (ya sin falla esperada) y el ensayo completo de cada
cliente sin logo verifica el nombre del catálogo.

### Fuera de la fase 4

"Omitir paso", "Detener todo", "Reiniciar paso" y "Reintentar otros pasos": otra fase.

### A verificar al empezar

- **Wake lock:** al empezar la ejecución la app pide que la pantalla no se apague
  (`wake-lock.service.ts`); si falla, el código entra en un camino que nunca continúa y la
  ejecución quedaría en blanco. En la 4a los ensayos corrieron completos con ventanas ocultas
  (Chaco y EDET): no se reprodujo. En la 4b los 4 clientes ejecutaron el ensayo completo sin
  quedar en blanco: verificado, no se reproduce.

## Fase 5 — detalle

Empezada el 2026-10-14. Primero se relevó qué hace hoy la app en cada falla (código + experimentos
con el simulador); con eso el usuario decide qué es correcto y se escriben los tests.

### Fallas programables en el simulador (✅ `16f5675`)

Sección "Fallas" en el panel de la máquina virtual y `window.__simulador.addFault / clearFaults /
getFaults` para los tests. Por dispositivo (calculador, generador, patrón), por puesto (calculador)
y por cantidad de respuestas: sin respuesta, responde tarde (ms), trama corrupta, responde otro
puesto, resultado ignorado (signo X) y sobrecorriente (patrón; tiene en cuenta el multiplicador).
No se recuerdan entre sesiones, para no dejar una falla olvidada en desarrollo.

### Cómo maneja hoy la app una falla de comunicación (código)

- Main (`app/resources/machine/machine.ts`): espera la respuesta 1,5 s; si no llega reenvía el
  comando hasta 2 veces (3 intentos, ~4,5 s) y devuelve error.
- `CommandProcessor` descarta sin aviso una trama inválida (inicio, fin, separadores, tamaño):
  cuenta como sin respuesta.
- Renderer (`MachineDeviceComponent.write$`): con error, el dispositivo pasa a Error y muestra
  "Error de comunicación puesto [NN]" (calculador) o "Error de comunicación [Patrón|Generador]".
- La calculadora lee a todos los puestos en una vuelta y asigna las respuestas por posición.
- Main reconoce la respuesta por dispositivo, no por puesto; nadie valida el puesto de la respuesta.

### Qué pasa hoy (experimentos, contraste secuencial, 3 puestos con 0,10 / 0,20 / 0,30 %)

| Caso | Qué pasa hoy |
|---|---|
| Calculador sin respuesta 1 vez | El reintento lo recupera; nada visible. |
| Trama corrupta 1 vez | Igual: se descarta y el reintento la recupera. |
| Sin respuesta 3 veces seguidas (falla un pedido completo) | Aviso "Error de comunicación puesto [02]" y sigue midiendo. |
| Puesto 2 sin respuesta siempre | **Error:** el puesto 2 muestra el valor del puesto 3 (0,30) y el 3 queda vacío; sigue "Calculando" sin fin, con un aviso cada ~4,7 s. |
| Responde tarde (1,6 s) siempre | En 49 respuestas no hubo cruces entre puestos (el riesgo del código no se reprodujo). |
| Responde otro puesto | La app la acepta igual (no valida el puesto); con el mismo valor no se nota. |
| Resultado ignorado (X) siempre | El puesto queda sin valor y "Calculando" sin fin, sin aviso. |
| Patrón sin respuesta siempre | Aviso cada ~4,7 s; la medición sigue. |
| Generador (EDET) sin respuesta al iniciar | "Realizando start" ~4,5 s, después generador en Error y aviso. Al volver la comunicación sigue en Error; **"Comenzar medición" queda habilitado** con el generador en error. Para reintentar: "Detener todo" → "Iniciar generador". |
| Sobrecorriente (EDET, 1 A) | Aviso fijo "Sobrecarga del generador", calculador Detenido, los puestos quedan "Calculando". |
| "Detener todo" midiendo | Vuelve a "Iniciar generador"; se puede volver a medir. |
| Volver (flecha) midiendo | Vuelve a la lista de ensayos sin preguntar y cierra la máquina virtual; el ensayo se pierde. |

### Tests (`e2e/fallas.spec.ts`, en EDET) — ✅ `16f5675`, checkpoint del usuario OK

Prueban el comportamiento de hoy (decisión del usuario: los cambios van al final). 8 tests, ~3 min:
calculador (falla puntual que se recupera, 3 intentos con aviso, respuesta tarde sin cruces,
respuesta de otro puesto aceptada, resultado X sin valor ni aviso), puesto que no responde nunca
(aviso repetido, "Calculando"), patrón sin respuesta, generador sin respuesta (queda en Error,
"Comenzar medición" habilitado, se reintenta con "Detener todo"), sobrecorriente, "Detener todo"
y volver a medir, y volver sale sin preguntar. Los resultados corridos de puesto son falla
esperada (`test.fail`): cuando se corrija, el test avisa.

### Deuda para el final (decisiones del usuario, cambian el comportamiento)

1. Puesto que no responde: qué mostrar (vacío + error en ese puesto) y cuándo cortar.
2. Resultado ignorado (X): avisar y hasta cuándo esperar.
3. Generador en error: si se debe poder "Comenzar medición".
4. Volver durante la medición: pedir confirmación antes de descartar el ensayo.
5. Falla permanente: aviso de error cada ~4,7 s o uno solo.

## Fase 6 — detalle

Tests del protocolo serial sin interfaz ni Electron, con Vitest 3.2.7: `npm run test:serial`
(35 tests, ~15 s; casi todo el tiempo son las esperas reales de 1,5 s de los reintentos).
Config en `test/serial/vitest.config.ts`; los tests viven en `test/serial/`, fuera de `app/`, para no
entrar en la compilación del proceso main.

- **`command-processor.test.ts`** (14): arma la respuesta aunque llegue byte a byte; acepta valores
  binarios iguales a `|`, `B` o `Z` (posiciones fijas); descarta sin comando pendiente, comando sin
  respuesta conocida, otro dispositivo, sin fin de trama, separador fuera de lugar y trama
  incompleta (a los 100 ms). Comportamiento actual con bytes de más: después de una respuesta se
  descartan; de dos respuestas juntas toma la primera; un byte suelto antes de la trama o restos de
  una respuesta a medias hacen descartar la respuesta buena (no busca el inicio de trama).
- **`codificacion.test.ts`** (13): números compactos (big-endian, punto fijo) con los ejemplos del
  código, redondeo, rangos, factor de potencia, y bloques de las tramas en renderer y main.
- **`machine.test.ts`** (8): reintentos de `machine.ts` con el puerto simulado de serialport
  (`@serialport/binding-mock`), `electron` y `serialport` (bindings nativos) simulados. Responde al
  primer intento; reenvía a los 1,5 s y toma la respuesta; sin respuesta: 3 envíos y "Timeout" a
  los ~4,5 s; trama corrupta y vale la del reintento; respuesta tardía tomada como la del reintento;
  respuesta de otro puesto aceptada; respuesta de otro dispositivo → timeout; generador.

Particularidades: en `app/` cada `.ts` tiene su `.js` compilado al lado y Vite prioriza el `.js`
(que usa `require` y no pasa por los mocks): la config prioriza `.ts`. Los paquetes de serialport
están en `app/node_modules`: alias en la config.

El test viejo hecho a mano (`app/resources/machine/command-processor-test.js` y
`command-processor-test-run.sh`, con una ruta fija a `/home/ubuntu/...`) se borró en `cc25a46`: lo
reemplaza esta fase.

## Hallazgos de QA

Comportamientos de la app encontrados al escribir los tests. **Las correcciones de código se hacen
todas al final** (decisión del usuario, 2026-10-13): mientras tanto los tests prueban lo que la
app hace hoy y cada hallazgo se anota acá.

- **Los avisos tapan el "Guardar" de las plantillas.** Los avisos (p-toast) salen arriba a la
  derecha, justo sobre el botón "Guardar" del armado de plantillas. Después de guardar, el aviso
  "Guardado correctamente" aparece bajo el cursor y tapa el botón mientras dura.
- **Avisos fijos en el primer arranque.** Con una base nueva, "Base de datos creada" y "Base de
  datos actualizada" quedan fijos (no se van solos) sobre la misma zona hasta que el usuario los
  cierra.
- **"Prueba de constraste".** En "Agregar paso" de las plantillas, el paso de contraste se llama
  "Prueba de constraste" (con una "s" de más).
- **Integración rechaza un error exactamente igual al máximo (error).** Con máximo 1 %, integrador
  inicial 100 y final 101,01 (1000 imp a 1000 imp/kWh), la pantalla muestra error "1.00" y
  "Falló". `integration-test-run.component.ts` compara `Math.abs(error) > máximo` sin redondear y
  en punto flotante el error da 1,0000000000005; con inicial 1000 y final 1001,01 da 0,99999… y
  aprueba. Contraste en el mismo borde (1,00 %) aprueba. Propuesta: redondear el error a 2
  decimales (los que se muestran) antes de comparar, y sumar al test de la 4c los casos ±1 %.
- **Integradores con punto decimal.** Los integradores se escriben con coma decimal; si se escribe
  o pega "101.009" con punto, queda 101009 sin aviso.
- ~~**El PDF de Chaco dice "EDET".**~~ Corregido: ver 4d.
- **Resultados corridos de puesto (error).** Si un puesto no responde, la calculadora asigna las
  respuestas por posición y el valor del puesto siguiente aparece en el que falló (fase 5).
- **Respuesta sin validar el puesto.** La app acepta una respuesta de la calculadora aunque traiga
  el número de otro puesto (fase 5).
- **Generador en error y "Comenzar medición" habilitado** (EDET, fase 5).
- **Volver durante la medición no pide confirmación** y descarta el ensayo (fase 5).
- **No busca el inicio de trama.** Si antes de una respuesta llega un byte suelto o quedan restos de
  una respuesta a medias, el `CommandProcessor` descarta la respuesta buena; la salva el reintento
  (1,5 s más). Ver fase 6.

### Correcciones pendientes (al final)

1. Redondear el error de integración antes de comparar (y casos ±1 % en `e2e/reglas.spec.ts`).
1. Resultados por puesto aunque uno no responda (y validar el puesto de la respuesta) — fase 5.
1. Las 5 decisiones de la fase 5 ("Deuda para el final").
2. ~~Nombre de la empresa por cliente en el catálogo: Chaco → "Secheep" (4d).~~ Hecho.
3. Decidir sobre los avisos que tapan el "Guardar", los avisos fijos del primer arranque,
   "constraste" y el punto decimal en los integradores.

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
