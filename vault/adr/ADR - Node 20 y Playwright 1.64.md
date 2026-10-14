---
tipo: adr
estado: aceptada
fecha: 2026-10-12
tags: [node, playwright, tooling]
---

# ADR — Node 20 y Playwright 1.64

## Contexto

El proyecto fijaba Node 18 (`.nvmrc`, `.node-version`). Playwright 1.57 en adelante exige
Node 20; la última versión compatible con Node 18 es la 1.56.

## Decisión

Pasar a **Node 20** (`.nvmrc` = `v20`, `.node-version` = `20`) y **Playwright 1.64.0**
(`@playwright/test` y `playwright`, versión exacta).

## Por qué es seguro

- **Electron trae su propio Node** (Electron 25 → Node 18.15). El Node de la máquina solo
  corre las herramientas: Angular CLI, tsc, electron-builder, Playwright.
- **Angular 16 declara `node: >=18.10`**, y con Node 20 el build de Angular compila igual.
- **El build de release no cambia:** con Node 18 y con Node 20, `npm run electron:build`
  falla igual en la Mac del usuario (por `distutils`, ver [[Plan - QA e2e]]). Node 20 no rompe
  nada que funcionara.

## Consecuencias

- Cada terminal tiene que usar Node 20: `source ~/.nvm/nvm.sh && nvm use` antes de `npm`.
  Con Node 18, Playwright corta con "requires Node.js 20 or higher".
- `node_modules` se instala con Node 20; no correr `npm i` con Node 18 en este repo.
- Los workflows de CI siguen en Node 18.16 hasta la fase 8 del plan.
