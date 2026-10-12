#!/usr/bin/env python3
"""Genera el INDICE de reglas del vault para el CLAUDE.md del workspace.

En vez de concatenar las 40 reglas CORE a texto completo (~24k tokens que se
recargan en cada turno), emite:

  - Reglas CRITICAS (BLOQUEANTE / titulo con ⛔ o ⚠️): titulo + extracto de la
    regla + path. Lo suficiente para no violarla sin abrir el archivo.
  - Resto: titulo + una linea + path. Se lee con Read cuando aplica.

Uso: vault-rules-index.py <RULES_DIR> <INDEX_README> [seccion-excluida ...]
"""
import os
import re
import sys

CRIT_EXTRACT = 700
HOOK_CHARS = 150

SKIP_PREFIXES = ("#", ">", "|", "```", "---", "- [[", "![")


def strip_frontmatter(text):
    """Saca el bloque YAML inicial (--- ... ---) para que no ensucie el hook."""
    return re.sub(r"\A---\n.*?\n---\n", "", text, flags=re.S)


def h1_of(text):
    for line in text.splitlines():
        if line.startswith("# "):
            return line[2:].strip()
    return ""


def is_critical(text, h1):
    return "BLOQUEANTE" in text or "⛔" in h1 or "⚠️" in h1


def body_lines(text):
    """Lineas de prosa: sin headings, tablas, citas ni bloques de codigo."""
    out = []
    in_fence = False
    for line in text.splitlines():
        s = line.strip()
        if s.startswith("```"):
            in_fence = not in_fence
            continue
        if in_fence or not s or s.startswith(SKIP_PREFIXES):
            continue
        out.append(s)
    return out


def hook_of(text):
    cands = [x for x in body_lines(text) if len(x) >= 15] or fallback_lines(text)
    for s in cands:
        s = re.sub(r"^[-*]\s+|^\d+\.\s+", "", re.sub(r"\s+", " ", s))
        if len(s) < 15:
            continue
        return s[:HOOK_CHARS] + ("…" if len(s) > HOOK_CHARS else "")
    return ""


def fallback_lines(text):
    """Ultimo recurso: archivos que son casi puro tabla o codigo."""
    out = []
    for line in text.splitlines():
        s = line.strip().strip("|").strip()
        if not s or s.startswith(("#", "```", "---", "|--", ":--")):
            continue
        out.append(re.sub(r"\s*\|\s*", " · ", s))
    return out


def extract_of(text):
    """Extracto de la seccion '## Regla' si existe; si no, primeros parrafos."""
    m = re.search(r"^(##+) .*Regla.*$", text, re.M)
    seg = text[m.end():] if m else text
    if m:
        level = len(m.group(1))
        nxt = re.search(r"^#{1,%d} " % level, seg, re.M)
        if nxt:
            seg = seg[: nxt.start()]
    if not body_lines(seg):
        seg = text
    chunks = []
    size = 0
    for s in body_lines(seg):
        s = re.sub(r"\s+", " ", s)
        chunks.append(s)
        size += len(s)
        if size >= CRIT_EXTRACT:
            break
    out = " ".join(chunks)
    return out[:CRIT_EXTRACT] + ("…" if len(out) > CRIT_EXTRACT else "")


def collect(rules_dir, index_path, excluded):
    items = []
    section = None
    skip = False
    with open(index_path, errors="replace") as fh:
        for line in fh:
            if line.startswith("## "):
                section = line[3:].strip()
                skip = any(kw and kw in line for kw in excluded)
                continue
            if skip:
                continue
            m = re.search(r"\[\[([^\]]+)\]\]", line)
            if not m:
                continue
            fname = m.group(1).split("|")[0]
            path = os.path.join(rules_dir, fname + ".md")
            if not os.path.isfile(path):
                continue
            items.append((section, fname, path))
    return items


def main():
    rules_dir, index_path = sys.argv[1], sys.argv[2]
    excluded = sys.argv[3:]
    items = collect(rules_dir, index_path, excluded)
    if not items:
        return

    # La base va ABSOLUTA y se dice una sola vez; cada entrada es solo el nombre
    # del archivo. Antes se emitian los dos ultimos componentes en cada linea:
    # con el vault afuera del workspace eso daba `compliance-knowledge-vault/
    # reglas/...`, que no resuelve desde ningun cwd. De paso ahorra, porque el
    # prefijo se repetia en las 41 entradas.
    abs_dir = os.path.abspath(rules_dir)
    crit = []
    rest = {}

    for section, fname, path in items:
        text = strip_frontmatter(open(path, errors="replace").read())
        h1 = h1_of(text) or fname
        if is_critical(text, h1):
            crit.append((h1, fname, extract_of(text)))
        else:
            rest.setdefault(section or "Otras", []).append((h1, fname, hook_of(text)))

    print("# Reglas del vault — ÍNDICE (NO es el texto completo)")
    print()
    print("Cada entrada es un puntero. **Antes de escribir código en un área, LEER su .md**")
    print(f"con Read. Todas viven en `{abs_dir}/` — abrirlas por su nombre de archivo.")
    print()
    print("El vault MANDA: en conflicto con este CLAUDE.md o con cualquier .cursor*/.mdc")
    print("de un subrepo, gana el archivo del vault.")

    if crit:
        print()
        print("## 🚨 Críticas — la regla va acá; el detalle, en el archivo")
        for h1, fname, extract in crit:
            print()
            print(f"### {h1}")
            print(extract)
            print(f"→ `{fname}.md`")

    for section, entries in rest.items():
        print()
        print(f"## {section}")
        for h1, fname, hook in entries:
            print(f"- **{h1}** — {hook}")
            print(f"  → `{fname}.md`")


if __name__ == "__main__":
    main()
