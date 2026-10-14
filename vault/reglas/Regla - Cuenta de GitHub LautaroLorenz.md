# Regla - Cuenta de GitHub LautaroLorenz

**BLOQUEANTE.** En meter-tester, todo lo que se hace con `gh` (PRs, reviews, merges, CI, API) va
con la cuenta **`LautaroLorenz`**, la dueña del repo. Nunca con otra cuenta, aunque sea la activa.

Decidido por el usuario el 2026-10-14.

## Por qué

En la máquina hay más de una cuenta logueada en `gh` y la activa puede ser otra (por ejemplo,
`jim-lautaro-cargoproduce`, de otro trabajo). Con esa cuenta se abrió el PR #71: no es admin del
repo y, como autora del PR, no lo puede aprobar, así que el merge quedó bloqueado.

## Cómo

No cambiar la cuenta activa de `gh` (la usan otros proyectos): pasar el token de `LautaroLorenz`
en cada comando.

```bash
GH_TOKEN=$(gh auth token -u LautaroLorenz) gh pr view 71
```

Antes de crear o mergear algo, confirmar la cuenta:

```bash
GH_TOKEN=$(gh auth token -u LautaroLorenz) gh api user --jq .login
```
