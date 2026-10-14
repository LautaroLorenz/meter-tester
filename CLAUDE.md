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

<!-- VAULT-SYNC-END -->
