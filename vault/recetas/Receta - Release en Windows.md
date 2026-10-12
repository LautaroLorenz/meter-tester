---
tipo: receta
area: release
fecha: 2026-10-12
tags: [release, windows, electron-builder]
---

# Receta — Release en Windows

El portable que reciben los clientes se genera en la PC con Windows. Desde la 6.4.0 el repo pide
**Node 20** ([[ADR - Node 20 y Playwright 1.64]]) y usa **electron-builder 26**
([[ADR - electron-builder 26]]), y el release se genera **por cliente**
(ver "Configuración por cliente" en [[Plan - QA e2e]]).

Comandos para PowerShell.

## 1. Node 20 (una sola vez)

Con [nvm-windows](https://github.com/coreybutler/nvm-windows) instalado:

```powershell
nvm install 20
nvm use 20
node -v
```

`node -v` tiene que mostrar `v20.x`.

## 2. Código e instalación limpia

```powershell
git fetch
git checkout <rama>
git pull
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
npm ci
```

`npm ci` borra `node_modules` igual, pero hacerlo antes evita que queden binarios nativos
compilados con la versión anterior. Ya no hacen falta las Build Tools de Visual Studio ni Python:
electron-builder 26 usa binarios precompilados de `serialport` y `sqlite3`.

## 3. Generar el portable de un cliente

```powershell
npm run electron:build:edelap
```

Clientes: `edet`, `chaco`, `tandil`, `edelap`. Sin cliente (`npm run electron:build`) falla a
propósito.

En el log tiene que aparecer `buildFromSource=false` y, al final, `target=portable`. El archivo
queda en `release\`:

```powershell
Get-ChildItem release\*.exe
```

Tiene que llamarse `OELEC - CE Soft - EDELAP - <versión>.exe`.

## 4. Probar el portable

1. **Arranca:** abrirlo; muestra el splash y llega a "Administración de Ensayos".
2. **Base de datos:** el engranaje → "Base de datos" muestra la base conectada; crear y borrar
   una marca de prueba.
3. **Configuración del cliente:** el logo correcto en el reporte (Chaco no lleva logo: muestra el
   nombre de la empresa) y la cantidad de puestos correcta al empezar un ensayo.
4. **Máquina por USB:** con la máquina conectada, que conecte y responda a un ensayo corto. Es lo
   único que los tests no cubren: usan el simulador.
5. **Comparar** con el último portable entregado a ese cliente: mismo comportamiento.

## 5. Opcional: la suite e2e en Windows

Valida la plataforma Windows con los mismos tests que corren en la Mac:

```powershell
npm run e2e
```

Tiene que dar `32 passed`. Reporte: `npm run e2e:report`.

## Si algo falla

- `Playwright requires Node.js 20`: la terminal sigue en Node 18 → `nvm use 20`.
- Error de `node-gyp` o `distutils`: quedó un `node_modules` viejo → paso 2 completo.
- Para volver a electron-builder 24 mientras se investiga: `git revert 3d00ce2`.
