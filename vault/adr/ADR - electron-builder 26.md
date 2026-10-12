---
tipo: adr
estado: aceptada
fecha: 2026-10-12
tags: [release, electron-builder, node-gyp, python]
---

# ADR — electron-builder 26.0.20

## Contexto

`npm run electron:build` fallaba en la Mac al recompilar `@serialport/bindings-cpp` para
Electron, por dos problemas de la máquina:

1. **Python sin `distutils`:** electron-builder 24.4 trae `@electron/rebuild` 3.6, que usa
   `node-gyp` 9. Su `gyp` importa `distutils`, que Python quitó en la 3.12.
2. **Linker y SDK desparejos:** el Xcode activo (26) tomaba el SDK de macOS 27 de las Command
   Line Tools, con una arquitectura (`arm64e.x1`) que su linker no conoce.

El problema de Python le pasa a cualquier máquina con Python 3.12 o superior: la PC con Windows
si se actualiza, y el CI (las máquinas de GitHub traen 3.12). Está documentado en
[electron/rebuild#1116](https://github.com/electron/rebuild/issues/1116).

## Opciones descartadas

- **`overrides` a `node-gyp` 10:** `@electron/rebuild` 3.6 usa `node-gyp` desde adentro con la
  interfaz de callbacks de la 9 (`promisify(nodeGyp.commands[...])`); la 10 pasó a promesas. En el
  issue, uno de los que lo probaron necesitó además parchear `worker.js` y a otro no le funcionó.
- **electron-builder 26.15 (la última):** trae `@electron/rebuild` 4 y pide Node 22.12 o superior.
- **Python 3.11 o `setuptools` en cada máquina:** requisito invisible que vuelve con cada
  actualización de Python.

## Decisión

electron-builder **26.0.20**: trae `@electron/rebuild` 3.7.2, con la copia de `node-gyp` 10 de
Electron (`@electron/node-gyp`, sin `distutils`), y funciona con Node 20.

## Resultado (verificado en la Mac, 2026-10-12)

- `npm run electron:build` genera el `.dmg` **sin variables extra**: electron-builder 26 usa los
  binarios precompilados de `serialport` y `sqlite3` (`buildFromSource=false`) en vez de
  compilarlos. Por eso tampoco importa el problema del SDK.
- Desde la app empaquetada cargan los dos módulos nativos: `serialport` lista puertos y
  `sqlite3` abre una base.
- El binario de `sqlite3` ahora queda fuera del `.asar` (`app.asar.unpacked`), que es como deben
  ir los módulos nativos. Con la 24 quedaba adentro.
- La dependencias de `serialport` se reacomodan dentro del paquete, pero cada una resuelve la
  versión que pide (`bindings-cpp` → `parser-readline` 11, `serialport` → 12).
- `@electron/node-gyp` figura en el lockfile como `git+ssh`, pero `npm ci` lo baja por HTTPS:
  instala con SSH bloqueado y sin caché.
- Los tests e2e siguen pasando.

## Pendiente

- **Generar el portable en la PC con Windows** (con Node 20 y `npm ci`) y comparar con el último
  entregado. Desde la Mac no se puede: necesita Wine x64.
- Al usar binarios precompilados, la PC con Windows probablemente ya no necesite las Build Tools
  de Visual Studio para el release.
