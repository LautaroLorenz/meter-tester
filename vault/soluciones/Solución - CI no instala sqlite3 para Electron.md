# Solución - CI no instala sqlite3 para Electron

Resuelto el 2026-10-14 (PR #71). Ver [[Plan - QA e2e]] (fase 8).

## Síntoma

En GitHub Actions, el paso "Instalar dependencias" (`npm ci`) falla en Linux y en Windows con
`ERR_ELECTRON_BUILDER_CANNOT_EXECUTE` en `app/node_modules/sqlite3`. En la Mac local no pasa:
`app/node_modules` quedó instalado desde antes.

- **Linux:** `prebuild-install warn This package does not support N-API version 25.2.0`, y después
  `node-gyp rebuild` no compila: `'node_api_get_module_file_name' was not declared in this scope`.
- **Windows:** `gyp ERR! find VS unknown version "undefined" found at "C:\Program Files\Microsoft
  Visual Studio\18\Enterprise"`. node-gyp 8.4.1 no reconoce el Visual Studio 2026 del runner.

## Causa raíz

El `postinstall` de la raíz (`electron-builder install-app-deps`) instala `app/` pasando la versión
de Electron (25.2.0) como target. `sqlite3` se instala con `prebuild-install -r napi`, así que toma
25.2.0 como **versión de N-API**: no encuentra el binario precompilado, intenta compilar con
`NAPI_VERSION` inválido y usa funciones que los headers de Electron 25 no tienen.

## Fix

No hace falta recompilar: `sqlite3` y `serialport` son **N-API** (ABI estable), así que los
binarios precompilados que baja un `npm ci` común en `app/` andan en Electron 25. Se verificó
cargando los dos en el Electron del proyecto (`ELECTRON_RUN_AS_NODE=1`): sqlite 3.44.2 y
`SerialPort.list()` andan.

En `.github/workflows/ci.yml`:

```bash
npm pkg delete scripts.postinstall   # solo en la copia del runner
npm ci                               # con los scripts de las dependencias (p. ej. bajar Electron)
npm ci --prefix app                  # app/ con los binarios N-API precompilados
```

Primer intento (`6eafc7d`): `npm ci --ignore-scripts` + `npm rebuild` + `npm ci --prefix app`. **No
sirve en Linux:** `npm rebuild` también corre el `postinstall` de la raíz y vuelve a fallar igual (en
Windows pasó la instalación). Por eso se borra el `postinstall` del `package.json` en el runner.

Portables: `electron-builder` también recompila al empaquetar (`npmRebuild`), así que el CI pasa
`-c.npmRebuild=false`. `scripts/release.js` acepta opciones extra después del cliente:
`npm run electron:build:edet -- -c.npmRebuild=false`. Sin opciones, el build local no cambia.

## Pendiente

- Confirmar con la corrida del CI de PR #71.
- El botón de portables (`workflow_dispatch`) solo aparece cuando el workflow está en `main`:
  la generación con `npmRebuild=false` se prueba recién ahí.
