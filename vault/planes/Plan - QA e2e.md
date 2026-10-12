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
| **2. Base de los tests** | ⏭️ Sigue | `launchApp` pasa a ser fixture de Playwright; video; `data-testid` en menú y navegación; un test que recorre todas las pantallas del menú. | En el reporte, un video recorriendo todas las pantallas del menú. |
| **3. ABM** | ⏸️ Espera dudas | Altas, bajas y modificaciones de medidores, marcas y plantillas de ensayo. | Validar la lista de casos con sus capturas. |
| **4. Ensayo completo** | ⏸️ Espera dudas | `run-essay` de punta a punta: ensayo, resultados, historial, PDF. Corrientes simuladas deterministas (hoy usan `Math.random` en `command-map`). | Video del ensayo; revisar el PDF generado. |
| **5. Fallas del simulador** | ⏸️ Espera dudas | Simulador programable: timeout, trama corrupta, sin respuesta, cancelar un ensayo. | Definir qué debería pasar en cada falla y que el test lo compruebe. |
| **6. Protocolo serial** | ⏳ | Vitest sobre `CommandProcessor` y `machine` con `@serialport/binding-mock`, sin UI. | Lista de comandos cubiertos; `npm run test:serial`. |
| **7. Modo interactivo** | ⏳ | Flag de CDP (`--remote-debugging-port`) + MCP para que Claude maneje la app en vivo. | Pedir "probá X" y recibir capturas de la app real. |
| **8. CI** | ⏳ | Arreglar los workflows (Linux usa `ubuntu-18.04`, retirada; Windows sigue en Node 18.16), Xvfb, subir traces y videos como archivos de la corrida. | PR con el check en verde y los archivos descargables. |

## Dudas abiertas (bloquean desde la fase 3)

1. **Flujos críticos:** ¿qué ensayos importan más (vacío, arranque, contraste, integración) y quién define el resultado correcto (usuario, manual, norma)?
2. **Plataforma:** ¿alcanza con Mac y Linux, o los tests también tienen que correr en Windows (destino real: el portable)?
4. **Configuración por cliente:** ¿solo la de producción actual (Usina Tandil, 20 puestos) o una por cliente (logo, generador, patrón, `skipSteps`)?
6. **Evidencia:** ¿los reportes quedan solo locales (ignorados por git) o se guarda un resumen por fase en `vault/qa/`?

Resueltas: los cambios de app para testear entran en 6.4.0 (3); un commit por fase y PR al cerrar la fase 2 (5); los `environment.dev.*` son configuración local y no se commitean (7).

## Fuera del plan

- **El release no se puede generar en la Mac del usuario.** `npm run electron:build` falla con Node 18 y con 20: al recompilar `@serialport/bindings-cpp`, el `node-gyp` viejo del proyecto importa `distutils`, que Python 3.12+ ya no trae. Falta saber de dónde sale hoy el portable. Arreglo posible: `setuptools` en ese Python, o actualizar `node-gyp` / `@electron/rebuild`.
