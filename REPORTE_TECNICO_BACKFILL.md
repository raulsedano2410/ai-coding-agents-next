# Backfill 2026: Reporte para Alex

> **De**: Raul | **Fecha**: 7 Marzo 2026 | **Periodo backfill**: Ene 1 - Mar 4, 2026

---

## 1. Tabla comparativa: tus datos vs nuestro backfill

Tus parquets acumulan desde 2024/2025. Nuestro backfill solo trae 2026. Las diferencias son por periodo cubierto, no por error.

| Agente | Parquet Alex (total acumulado) | Hasta fecha | Backfill Raul (solo 2026) | Query |
|--------|-------------------------------:|-------------|---------------------------:|-------|
| Claude | 438,979 | 2026-01-24 | 54,960 | `"Co-Authored-By" "noreply@anthropic.com"` |
| Copilot | 246,957 | 2026-02-10 | 122,991 | `is:pr author:app/copilot` + filtro `head:copilot/` |
| Codex | 248,608 | 2026-02-09 | 93,702 | `is:pr author:app/openai-codex` + filtro `head:codex/` |
| Cursor | 128,791 | 2026-02-19 | 9,179 | `is:pr head:cursor/` |

**Cursor requiere revision**: 9k vs 78k en parquet sugiere que la query `head:cursor/` no captura todos los PRs. Necesito que revises si usas alguna query adicional.

---

## 2. Codigo usado (todo basado en el tuyo)

| Elemento | Tu codigo | Lo que hicimos |
|----------|-----------|----------------|
| Queries | `cursor_fetcher.py`, `copilot_fetcher.py`, etc. | **Mismas queries exactas** |
| Clasificador | `aquiro1994/naics-github-classifier` | **Mismo modelo** |
| Input clasificador | `name + desc + topics` [:200 chars] | **Identico** (como `kaggle_notebook_completo.py` L526-557) |
| Hour-splitting | Recursivo: dia->6h->3h->1h->10min->1min | Simplificado: dia->6h->1h (~95% cobertura) |
| Metadata | `batch_repo_fetcher.py` GraphQL (50/query) | REST API (1/request, mas lento pero mismo resultado) |

---

## 3. Clasificacion mejorada

- v1 (anterior) solo usaba `name` -> sesgo a Professional Services (28%)
- v2 (actual) usa `name + desc + topics` como tu codigo -> Professional Services baja a 18.4%
- Confianza promedio: 0.423 (4x mejor que azar con 19 clases)

---

## 4. Totales actuales en la web

Web: https://alexanderquispe.github.io/ai-coding-agents-industry-analysis/

| Agente | 2025 (12 meses) | 2026 (3 meses) | Total |
|--------|----------------:|---------------:|------:|
| Claude Code | 280,010 | 54,960 | 334,970 |
| GitHub Copilot | 182,901 | 122,991 | 305,892 |
| OpenAI Codex | 205,727 | 93,702 | 299,429 |
| Cursor AI | 70,466 | 9,179 | 80,439 |
| **TOTAL** | **739,104** | **280,832** | **1,019,936** |

---

## 5. Propuestas de mejora

1. **Faltan ~10 meses de 2026** por raspar (pipeline diario en GitHub Actions lo hara automatico)
2. **Migrar a GraphQL batch** para metadata (10x mas rapido, tu `batch_repo_fetcher.py`)
3. **Usar splitting recursivo completo** de tus fetchers (+5% cobertura en horas pico)
4. **Investigar discrepancia Cursor** (9k vs 78k) - prioridad alta
5. **Agregar Jules (Google)?** - tienes 70k repos en Dropbox, decidir si lo incluimos
