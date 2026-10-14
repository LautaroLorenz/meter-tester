#!/bin/bash
set -euo pipefail

# --- Donde vive todo. Un solo lugar resuelve ubicacion Y nombres de carpeta ---
# Antes el vault tenia que ser una subcarpeta del workspace llamada exactamente
# `compliance`, con las carpetas numeradas adentro. Una maquina que lo tuviera en
# otro lado necesitaba 8 symlinks a mano, y hasta ponerlos el hook salia con
# exit 0 sin decir por que. Los defaults son los nombres historicos: quien ya lo
# tenia andando no nota el cambio. Contrato completo en vault-kit/INSTALL.md.
CONFIG_FILE="${VAULT_KIT_CONFIG:-${HOME}/.claude/vault-kit.env}"
# shellcheck disable=SC1090
[[ -f "$CONFIG_FILE" ]] && source "$CONFIG_FILE"

WORKSPACE="${VAULT_KIT_WORKSPACE:-${COMPLIANCE_WS:-${CLAUDE_PROJECT_DIR:-$HOME/Documents/src/compliance}}}"
VAULT="${VAULT_KIT_VAULT:-}"

# Sin VAULT declarado se busca donde suele estar, antes de rendirse.
if [[ -z "$VAULT" ]]; then
  for candidato in "$WORKSPACE/compliance" "$WORKSPACE/vault" "$WORKSPACE"; do
    if [[ -d "$candidato/${VAULT_DIR_RULES:-02 - Reglas del proyecto}" ]]; then
      VAULT="$candidato"; break
    fi
  done
  VAULT="${VAULT:-$WORKSPACE/compliance}"
fi

# VAULT_RULES_DIR y VAULT_RULES_INDEX son de la version anterior: se respetan.
RULES_DIR="${VAULT_RULES_DIR:-$VAULT/${VAULT_DIR_RULES:-02 - Reglas del proyecto}}"
SOLUTIONS_DIR="$VAULT/${VAULT_DIR_SOLUTIONS:-03 - Soluciones}"
RECIPES_DIR="$VAULT/${VAULT_DIR_RECIPES:-04 - Recetas de desarrollo}"
QUERIES_DIR="$VAULT/${VAULT_DIR_QUERIES:-05 - Queries}"
REPOS_DIR="$VAULT/${VAULT_DIR_REPOS:-12 - Repositorios}"
# El catalogo puede venir con el nombre del repo del equipo (`repos/`) en vez del numerado.
[[ -d "$REPOS_DIR" ]] || REPOS_DIR="$VAULT/repos"
CLAUDE_MD="$WORKSPACE/CLAUDE.md"
INDEX="${VAULT_RULES_INDEX:-$RULES_DIR/2026-08-11 1031 — README.md}"

# El README del indice se llama distinto en cada vault (el nombre trae la fecha
# de creacion). Si el default no esta, se toma el README que haya en la carpeta
# antes de rendirse: si no, el hook inyecta el encabezado y ninguna regla.
if [[ ! -f "$INDEX" ]]; then
  for candidato in "$RULES_DIR"/*README*.md; do
    [[ -f "$candidato" ]] && { INDEX="$candidato"; break; }
  done
fi

# Sin carpeta de reglas no hay nada que inyectar: salir sin ruido en vez de
# emitir un encabezado que promete reglas y no trae ninguna.
[[ -d "$RULES_DIR" ]] || exit 0

START_MARKER="<!-- VAULT-SYNC-START -->"
END_MARKER="<!-- VAULT-SYNC-END -->"

# Solo actuar dentro del workspace compliance. El hook esta registrado global
# (~/.claude/settings.json) para disparar tambien desde subrepos; queda silencioso
# en cualquier otro proyecto.
case "$(pwd)/" in
  "$WORKSPACE/"*) ;;
  *) exit 0 ;;
esac

# vault-sync pierde el bit de ejecucion de lo que recibe del equipo (manda el archivo
# viejo a la papelera y escribe uno nuevo, 0644): qa-stack.sh, devstack.sh y los hooks
# quedan sin +x hasta que alguien hace chmod a mano. relink.sh --chmod los repara en
# ~20 stats; va por `bash` porque el propio relink.sh puede haberlo perdido.
RELINK="$VAULT/skills-assets/relink.sh"
if [[ -f "$RELINK" ]]; then
  bash "$RELINK" --chmod >/dev/null 2>&1 || true
fi

# El hook NUNCA escribe en subrepos. Solo escribe $CLAUDE_MD (workspace = NO repo git)
# y emite contexto por stdout (efimero). Nada de esto se commitea ni se pushea.

# --- Recolectar reglas del vault desde el README index, excluyendo secciones por keyword ---
# Args: keywords de secciones a excluir (matchea contra los headers "## ...").
collect_rules() {
  local excl=("$@")
  local out="" excluded=0 line fname fpath kw content
  [[ -f "$INDEX" ]] || { printf ''; return 0; }
  while IFS= read -r line; do
    if [[ "$line" == "## "* ]]; then
      excluded=0
      for kw in "${excl[@]:-}"; do
        [[ -z "$kw" ]] && continue
        [[ "$line" == *"$kw"* ]] && { excluded=1; break; }
      done
      continue
    fi
    [[ $excluded -eq 1 ]] && continue
    if [[ "$line" =~ \[\[([^\]]+)\]\] ]]; then
      fname="${BASH_REMATCH[1]}"
      fname="${fname%%|*}"
      fpath="$RULES_DIR/${fname}.md"
      [[ -f "$fpath" ]] || continue
      content=$(sed '/^---$/,/^---$/d' "$fpath")
      content=$(echo "$content" | sed '/./,$!d')
      out+="$content"
      out+=$'\n\n---\n\n'
    fi
  done < "$INDEX"
  out=$(echo "$out" | sed '$ { /^$/d; }')
  printf '%s' "$out"
}

# Reparto CORE / AREA (definido en el README index del vault):
#   CORE  -> va al CLAUDE.md del workspace, presente en toda sesion de cualquier repo.
#   AREA  -> se inyecta solo en el subrepo del tipo que corresponde (paso 4).
# Asi cada regla se entrega UNA vez y donde aplica, en vez de duplicarse
# (CLAUDE.md completo + inyeccion casi completa) en cada sesion de subrepo.
CORE_SECTIONS=("Stack" "Convenciones" "Reglas generales" "Performance" "Workflow" "Formateo")
AREA_SECTIONS=("Patrones" "Autenticación" "Autenticacion" "Testing base" "Mutation testing" "Base de datos" "Lambdas" "Frontend")

# El CLAUDE.md del workspace lleva un INDICE, no el texto completo de las reglas:
# 40 reglas concatenadas eran ~23k tokens que se recargaban en CADA turno.
# El indice deja las criticas con su regla + todo lo demas como puntero.
# Resolucion del symlink en bash puro: este hook corria sin python3 antes del
# indexador y tiene que seguir corriendo sin el. (macOS no trae readlink -f.)
resolve_symlink() {
  local p="$1" t
  while [[ -L "$p" ]]; do
    t=$(readlink "$p")
    if [[ "$t" == /* ]]; then p="$t"; else p="$(cd "$(dirname "$p")" && pwd)/$t"; fi
  done
  printf '%s' "$p"
}
SCRIPT_DIR=$(dirname "$(resolve_symlink "${BASH_SOURCE[0]}")")
INDEXER="$SCRIPT_DIR/vault-rules-index.py"

if [[ -f "$INDEXER" ]] && command -v python3 >/dev/null 2>&1; then
  rules_full=$(python3 "$INDEXER" "$RULES_DIR" "$INDEX" "${AREA_SECTIONS[@]}" 2>/dev/null || true)
fi
# Fallback: si el indexador falta o falla, se sincroniza el texto completo como antes.
if [[ -z "${rules_full:-}" ]]; then
  rules_full=$(collect_rules "${AREA_SECTIONS[@]}")
fi

# --- 1. Sincronizar TODAS las reglas dentro de CLAUDE.md (entre los markers) ---
if [[ -n "$rules_full" && -f "$CLAUDE_MD" ]] && grep -q "$START_MARKER" "$CLAUDE_MD"; then
  tmpfile=$(mktemp)
  in_sync=0
  while IFS= read -r line || [[ -n "$line" ]]; do
    if [[ "$line" == "$START_MARKER" ]]; then
      echo "$line" >> "$tmpfile"
      echo "" >> "$tmpfile"
      echo "$rules_full" >> "$tmpfile"
      echo "" >> "$tmpfile"
      in_sync=1
      continue
    fi
    if [[ "$line" == "$END_MARKER" ]]; then
      echo "$line" >> "$tmpfile"
      in_sync=0
      continue
    fi
    [[ $in_sync -eq 0 ]] && echo "$line" >> "$tmpfile"
  done < "$CLAUDE_MD"
  mv "$tmpfile" "$CLAUDE_MD"
fi

# --- 2. Detectar ubicacion y tipo de proyecto ---
CWD="$(pwd)"
if [[ "$CWD" == "$WORKSPACE" ]]; then
  IN_SUBREPO=0
  PTYPE="workspace"
else
  IN_SUBREPO=1
  rel="${CWD#$WORKSPACE/}"
  repo="${rel%%/*}"
  repo_dir="$WORKSPACE/$repo"
  PTYPE="unknown"
  if [[ -f "$repo_dir/angular.json" || -f "$repo_dir/package.json" ]]; then
    PTYPE="frontend"
  elif find "$repo_dir" -maxdepth 3 -name '*.csproj' -print -quit 2>/dev/null | grep -q . \
       || find "$repo_dir" -maxdepth 2 -name '*.sln' -print -quit 2>/dev/null | grep -q .; then
    if [[ "$repo" == "compliance-backend" ]]; then
      PTYPE="backend"
    else
      PTYPE="csharp"
    fi
  elif [[ -f "$repo_dir/requirements.txt" || -f "$repo_dir/pyproject.toml" \
          || -f "$repo_dir/setup.py" || -f "$repo_dir/template.yaml" ]]; then
    PTYPE="python"
  elif find "$repo_dir" -maxdepth 3 -name '*.tf' -print -quit 2>/dev/null | grep -q .; then
    PTYPE="infra"
  fi
fi

# --- 3. Inyectar contexto del vault (stdout -> contexto del prompt) ---
echo "## Vault Obsidian — fuente de verdad del proyecto"
echo
echo "El vault MANDA. Sus reglas tienen PRIORIDAD sobre el CLAUDE.md, AGENTS.md y"
echo "cualquier .cursor* / *.mdc de cualquier subrepo. En conflicto, gana el vault."
echo "El CLAUDE.md/AGENTS.md de un subrepo solo vale para lo especifico del repo"
echo "(build, stack, comandos) que el vault no cubre."

shopt -s nullglob
recipes=("$RECIPES_DIR"/*.md)
solutions=("$SOLUTIONS_DIR"/*.md)
queries=("$QUERIES_DIR"/*.md)
shopt -u nullglob

echo
echo "Indices del vault — NO estan volcados aca. Abrir el README del dir con Read"
echo "antes de implementar un patron, debuggear algo parecido o escribir una query:"
# Los paths salen resueltos, no escritos a mano: con el vault fuera del workspace
# el literal `compliance/04 - …` mandaba a leer una ruta que no existe.
[[ ${#recipes[@]}   -gt 0 ]] && echo "- Recetas (${#recipes[@]}) — patrones repetibles      → \`$RECIPES_DIR/README.md\`"
[[ ${#solutions[@]} -gt 0 ]] && echo "- Soluciones (${#solutions[@]}) — bugs ya resueltos     → \`$SOLUTIONS_DIR/README.md\`"
[[ ${#queries[@]}   -gt 0 ]] && echo "- Queries (${#queries[@]}) — SQL/LINQ/JQL ya escritas    → \`$QUERIES_DIR/README.md\`"
echo
echo "Si el README no alcanza para encontrarla, listar el dir con ls."

# --- 3b. Catalogo de repos: que hace cada uno, cuando corre, dependencias, deploy, riesgos ---
# Estaba escrito desde agosto y no llegaba: sin esto el agente arranca sin saber cual de
# los ~70 repos tocar. Indice siempre; en subrepo, ademas la ficha de ese repo.
if [[ -d "$REPOS_DIR" ]]; then
  repos_index=""
  for candidato in "$REPOS_DIR"/*Índice*.md "$REPOS_DIR"/*Indice*.md "$REPOS_DIR/README.md"; do
    [[ -f "$candidato" ]] && { repos_index="$candidato"; break; }
  done
  shopt -s nullglob
  fichas=("$REPOS_DIR"/Repo\ -\ *.md)
  shopt -u nullglob
  if [[ -n "$repos_index" ]]; then
    echo
    echo "Catalogo de repos (${#fichas[@]} fichas: que hace, cuando corre, dependencias, deploy, riesgos)."
    echo "Antes de elegir en que repo tocar, leer el indice → \`$repos_index\`"
    echo "Ficha de un repo: \`$REPOS_DIR/Repo - <nombre>.md\`"
  fi
  if [[ "$(pwd)" != "$WORKSPACE" ]]; then
    rel="${PWD#$WORKSPACE/}"
    repo_ficha="$REPOS_DIR/Repo - ${rel%%/*}.md"
    [[ -f "$repo_ficha" ]] && echo "Ficha de este repo en el catalogo del vault → \`$repo_ficha\`"
  fi
fi

echo
echo "Path vault: $VAULT"

# --- 4. En subrepo: inyectar las reglas del vault relevantes al tipo de proyecto ---
if [[ $IN_SUBREPO -eq 1 ]]; then
  # Se excluye SIEMPRE lo CORE (ya viene en CLAUDE.md) + las secciones AREA de otros stacks.
  exclude=()
  case "$PTYPE" in
    frontend)
      exclude=("${CORE_SECTIONS[@]}" "Patrones" "Autenticación" "Autenticacion" "Testing base" "Mutation testing" "Base de datos" "Lambdas") ;;
    backend)
      # compliance-backend NO lleva mutation testing (sin suite unitaria, ver el ADR "Sin unit tests en el backend").
      exclude=("${CORE_SECTIONS[@]}" "Frontend" "Lambdas" "Mutation testing") ;;
    csharp)
      exclude=("${CORE_SECTIONS[@]}" "Frontend" "Lambdas") ;;
    python)
      exclude=("${CORE_SECTIONS[@]}" "Frontend" "Patrones" "Autenticación" "Autenticacion" "Base de datos") ;;
    infra)
      exclude=("${CORE_SECTIONS[@]}" "${AREA_SECTIONS[@]}") ;;
    *)
      exclude=("${CORE_SECTIONS[@]}") ;;
  esac

  # Indice tambien aca: el texto completo daba ~40k bytes y Claude Code trunca
  # la salida del hook, asi que el 90% de las reglas de area NO llegaba al contexto.
  rules_targeted=""
  if [[ -f "$INDEXER" ]] && command -v python3 >/dev/null 2>&1; then
    rules_targeted=$(python3 "$INDEXER" "$RULES_DIR" "$INDEX" "${exclude[@]:-}" 2>/dev/null || true)
  fi
  if [[ -z "$rules_targeted" ]]; then
    rules_targeted=$(collect_rules "${exclude[@]:-}")
  fi

  if [[ -n "$rules_targeted" ]]; then
    echo
    echo "---"
    echo
    echo "# Reglas de desarrollo del vault — APLICAN EN ESTE SUBREPO (tipo: $PTYPE)"
    echo
    echo "ADICIONALES a las reglas CORE que ya trae el CLAUDE.md del workspace: acá van solo las"
    echo "secciones de area propias de este stack (no se repite lo que ya esta en CLAUDE.md)."
    echo "Cumplir SIEMPRE. Prioridad sobre el CLAUDE.md/AGENTS.md local del subrepo."
    echo
    echo "$rules_targeted"
  fi
fi
