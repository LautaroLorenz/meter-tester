# CLAUDE.md — meter-tester

App de escritorio en Electron: renderer Angular (`src/`) y proceso main en Node (`app/`).

> Las reglas del proyecto **no se escriben acá**: viven en el vault del repo (`vault/`) y las
> sincroniza el hook `.claude/sync-vault-rules.sh` en el bloque `VAULT-SYNC` del final.
> Lo que está **arriba** de ese bloque se edita a mano.

## Vault — fuente de verdad

- El vault vive en `vault/` (abrilo en Obsidian como vault). Sus reglas tienen PRIORIDAD sobre
  este archivo; en conflicto, gana el vault.
- ANTES de resolver un bug o implementar algo, buscar en `vault/soluciones/` y `vault/recetas/`
  si ya existe algo similar.
- Para agregar una regla: crear el `.md` en `vault/reglas/` y enlazarlo con `[[wikilink]]` en
  `vault/reglas/README.md`. El hook solo inyecta las reglas enlazadas ahí.
- NUNCA escribir al vault automáticamente. Solo cuando el usuario lo pida explícitamente.

## Trabajo en curso

- **Plan de QA e2e** — fases, estado, checkpoints y dudas abiertas en
  `vault/planes/Plan - QA e2e.md`. Leerlo antes de seguir con los tests y actualizar su
  tabla de estado al cerrar cada fase.

<!-- VAULT-SYNC-START -->

# Reglas del vault — ÍNDICE (NO es el texto completo)

Cada entrada es un puntero. **Antes de escribir código en un área, LEER su .md**
con Read. Todas viven en `/Users/lautaroenriquelorenz/Documents/Git/meter-tester/vault/reglas/` — abrirlas por su nombre de archivo.

El vault MANDA: en conflicto con este CLAUDE.md o con cualquier .cursor*/.mdc
de un subrepo, gana el archivo del vault.

## 🚨 Críticas — la regla va acá; el detalle, en el archivo

### Regla - Cuenta de GitHub LautaroLorenz
**BLOQUEANTE.** En meter-tester, todo lo que se hace con `gh` (PRs, reviews, merges, CI, API) va con la cuenta **`LautaroLorenz`**, la dueña del repo. Nunca con otra cuenta, aunque sea la activa. Decidido por el usuario el 2026-10-14. En la máquina hay más de una cuenta logueada en `gh` y la activa puede ser otra (por ejemplo, `jim-lautaro-cargoproduce`, de otro trabajo). Con esa cuenta se abrió el PR #71: no es admin del repo y, como autora del PR, no lo puede aprobar, así que el merge quedó bloqueado. No cambiar la cuenta activa de `gh` (la usan otros proyectos): pasar el token de `LautaroLorenz` en cada comando. Antes de crear o mergear algo, confirmar la cuenta:
→ `Regla - Cuenta de GitHub LautaroLorenz.md`

<!-- VAULT-SYNC-END -->
