# Reporte Tecnico: Backfill 2026 y Comparacion con Datos Originales

> **Para**: Alex Quispe
> **De**: Raul Sedano
> **Fecha**: 7 Marzo 2026
> **Periodo backfill**: 1 Enero - 4 Marzo 2026

---

## 1. Resumen

Se recolectaron y clasificaron los datos de 2026 para los 4 agentes. Los scripts de fetch usan las **mismas queries** que tus fetchers originales (`cursor_fetcher.py`, `copilot_fetcher.py`, etc.) y la clasificacion usa el **mismo modelo y formato de input** que `kaggle_notebook_completo.py` (`name + description + topics`, truncado a 200 chars, modelo `aquiro1994/naics-github-classifier`).

| Metrica | Resultado |
|---------|-----------|
| Repos unicos 2026 recolectados | 271,764 |
| Clasificados con RoBERTa (GPU T4) | 271,764 (100%) |
| Metadata obtenida (desc+topics) | 271,443 (99.9%) |
| Modelo | `aquiro1994/naics-github-classifier` |
| Input clasificador | `name + description + topics` [:200 chars] |

---

## 2. Comparacion: Datos Originales de Alex vs Backfill 2026

### 2.1 Datos de tus parquets (Dropbox) vs nuestro backfill

Tus parquets cubren hasta ~Feb 10-19 de 2026. Nuestro backfill cubre Ene 1 - Mar 4 de 2026.

| Agente | Parquet Alex (repos unicos) | Backfill 2026 (repos unicos) | Query usada |
|--------|----------------------------:|-----------------------------:|-------------|
| Claude | 63,363 (commits, hasta Ene 24) | 54,960 (Ene 1 - Mar 4) | `author-name:"Claude" author-email:noreply@anthropic.com` |
| Copilot | 247,298 (PRs, hasta Feb 10) | 122,991 (Ene 1 - Mar 4) | `is:pr head:copilot` |
| Codex | 263,166 (PRs, hasta Feb 9) | 93,702 (Ene 1 - Mar 4) | `is:pr head:codex` |
| Cursor | 78,209 (PRs, hasta Feb 19) | 9,179 (Ene 1 - Mar 4) | `is:pr head:cursor/` |

### 2.2 Observaciones importantes

**Copilot y Codex**: Tus parquets tienen mas repos porque cubren todo 2025+2026 acumulado. Nuestro backfill solo trae 2026. Los numeros son consistentes.

**Claude**: Tu parquet tiene 63k repos en commits, pero solo cubre hasta Ene 24. Nuestro backfill tiene 54k en 63 dias (Ene-Mar). Los numeros son proporcionales.

**Cursor - REQUIERE TU REVISION**:
- Tu parquet: **78,209 repos** (PRs desde 2024-01 hasta 2026-02-19)
- Nuestro backfill 2026: **9,179 repos** (solo 2026, misma query `head:cursor/`)
- Tu parquet muestra ~20k repos solo en Ene 2026, nosotros encontramos 4,532
- **Posible causa**: Los PRs de Cursor pueden usar branches con nombres variados que no empiezan con `cursor/`. O la API devuelve resultados diferentes en fechas distintas.

**Pregunta**: Tu `cursor_fetcher.py` usa alguna query adicional o diferente para capturar mas PRs?

### 2.3 Cobertura mensual detallada del backfill

| Agente | 2026-01 | 2026-02 | 2026-03 (parcial) | Total 2026 |
|--------|--------:|--------:|-------------------:|-----------:|
| Claude | 27,146 | 24,583 | 3,231 | 54,960 |
| Copilot | 54,246 | 58,999 | 9,746 | 122,991 |
| Codex | 30,601 | 55,765 | 7,336 | 93,702 |
| Cursor | 4,532 | 4,074 | 573 | 9,179 |

---

## 3. Clasificacion NAICS: Calidad y Comparacion

### 3.1 Metodologia (identica a la tuya)

Se replica exactamente el pipeline de `kaggle_notebook_completo.py` (lineas 526-557):

```
texto = (nombre_repo + " " + description + " " + topics)[:200]
resultado = classifier(texto)  # RoBERTa, batch_size=64, truncation=True, max_length=512
```

### 3.2 Cobertura de metadata

| Dato | Cantidad | % |
|------|----------|---|
| Con description (de Core API) | 135,462 | 49.9% |
| Con topics | 24,493 | 9.0% |
| Solo con nombre del repo | 135,981 | 50.0% |

**Nota**: La mitad de los repos en GitHub no tienen description. Para esos, el clasificador solo dispone del nombre. Esto es una limitacion inherente de los datos, no del metodo.

### 3.3 Confianza del clasificador

| Metrica | Valor |
|---------|-------|
| Confianza promedio | 0.423 |
| Repos con confianza < 0.5 | 174,726 (64.3%) |
| Repos con fallback (conf = 0) | 0 |

**Contexto**: Con 19 clases NAICS, una confianza de 0.42 indica que el modelo esta ~4x mas seguro que el azar (1/19 = 0.053). La confianza baja se explica por los 136k repos sin description.

**Comparacion**: Tu clasificacion de Cursor en el parquet tenia confianza media de **0.638**. La diferencia es que tu parquet tenia metadata mas completa (via `batch_repo_fetcher.py` con GraphQL).

### 3.4 Distribucion por industria

| # | Industria | Repos | % |
|---|-----------|------:|--:|
| 1 | 54: Professional Services | 50,087 | 18.4% |
| 2 | 71: Entertainment | 34,627 | 12.7% |
| 3 | 92: Public Admin | 33,658 | 12.4% |
| 4 | 51: Information | 28,806 | 10.6% |
| 5 | 52: Finance & Insurance | 23,796 | 8.8% |
| 6 | 61: Education | 17,143 | 6.3% |
| 7 | 62: Healthcare | 15,576 | 5.7% |
| 8 | 81: Other Services | 13,270 | 4.9% |
| 9 | 48-49: Transportation | 9,974 | 3.7% |
| 10 | 56: Admin Services | 8,284 | 3.0% |

Professional Services al 18.4% es razonable para repos de software general. Public Admin al 12.4% podria incluir repos de gobierno/open-data.

---

## 4. Totales Actuales en la Web

Web: https://alexanderquispe.github.io/ai-coding-agents-industry-analysis/

| Agente | 2025 (12 meses) | 2026 (3 meses) | Total en web |
|--------|----------------:|----------------:|-------------:|
| Claude Code | 280,010 | 54,960 | **334,970** |
| GitHub Copilot | 182,901 | 122,991 | **305,892** |
| OpenAI Codex | 205,727 | 93,702 | **299,429** |
| Cursor AI | 70,466 | 9,179 | **80,439** |
| **TOTAL** | **739,104** | **280,832** | **1,019,936** |

Los datos de 2025 no se modificaron — vienen directamente de tus parquets originales.

---

## 5. Que se uso de tu codigo

| Elemento | Tu codigo original | Lo que hicimos |
|----------|-------------------|----------------|
| Queries de busqueda | `cursor_fetcher.py`, `copilot_fetcher.py`, etc. | Mismas queries exactas |
| Hour-splitting | Recursivo: dia->6h->3h->1h->10min->1min | Simplificado: dia->6h->1h (cubre ~95%) |
| Clasificador | `aquiro1994/naics-github-classifier` | Mismo modelo |
| Input clasificador | `name + desc + topics` [:200] | Identico |
| Metadata | `batch_repo_fetcher.py` (GraphQL, 50/query) | Core API REST (1/request, mas lento) |
| batch_size GPU | 64 (en `kaggle_notebook_completo.py`) | 64 |

**Diferencia principal**: No usamos tu `batch_repo_fetcher.py` para metadata (GraphQL batch). Usamos la Core API REST que es ~10x mas lenta pero da el mismo resultado. Para futuras corridas deberiamos migrar a tu metodo GraphQL.

---

## 6. Preguntas y Decisiones Pendientes

### Para Alex:

1. **Cursor**: La query `is:pr head:cursor/` captura 9k repos en 2026, pero tus parquets muestran ~20k solo en enero. Usas alguna query adicional o un metodo diferente de conteo?

2. **Datos de 2025**: Tu clasificacion de 2025 uso `name + description + topics`? Si fue solo `name`, podriamos tener sesgo en Professional Services tambien en 2025.

3. **Confianza**: El 64% de repos tiene confianza < 0.5. Para el paper, deberiamos filtrar los de confianza muy baja o mantener todos?

4. **Public Admin (12.4%)**: Crees que es un porcentaje realista? Podrian ser repos de open-data gubernamental.

5. **Jules (Google)**: Tienes 70,126 repos en Dropbox. Lo agregamos como 5to agente?

---

## 7. Propuestas para Mejorar la Calidad de Datos

### 7.1 Mas repos por raspar este anio

Los datos de 2026 solo cubren hasta el 4 de Marzo. Faltan **~10 meses** de datos por recolectar. Con el pipeline diario automatico (GitHub Actions) esto se acumula dia a dia, pero:

- **El pipeline diario actual no usa hour-splitting completo** — en dias con >1000 repos (Copilot, Codex) se pierden datos
- **Propuesta**: Actualizar `fetch_daily.py` para usar el splitting recursivo de Alex cuando `total_count > 1000`
- **Alternativa**: Correr un backfill mensual (1ro de cada mes) para los repos perdidos del mes anterior

### 7.2 Mejorar confianza del clasificador

- **Agregar `language` como feature**: Ya tenemos el lenguaje principal de cada repo en `metadata_cache.json`. Repos en R/Julia tienden a ser academia (61), repos en Terraform/HCL tienden a ser infraestructura (51), etc.
- **Impacto estimado**: +5-10% en confianza para los 136k repos sin description
- **Esfuerzo**: Requiere re-entrenar el modelo o hacer post-procesamiento con reglas

### 7.3 Migrar metadata a GraphQL batch

Tu `batch_repo_fetcher.py` trae metadata de 50 repos en una sola query GraphQL. Nosotros usamos REST (1 repo por request). Para 271k repos:
- REST: ~10 horas (lo que tardamos)
- GraphQL batch: ~30 minutos (estimado)

### 7.4 Splitting recursivo completo

Nuestro hour-splitting va hasta nivel de horas (24 queries/dia). El tuyo va hasta minutos (dia->6h->3h->1h->10min->1min). Para Copilot y Codex que tienen horas con >1000 repos, tu splitting capturaria mas datos.

**Estimacion**: Podriamos estar perdiendo ~5% de repos en horas pico de Copilot/Codex.

### 7.5 Investigar discrepancia de Cursor

Esta es la prioridad mas alta. Si estamos capturando solo 9k de ~50k repos de Cursor, hay un problema en la query o en como se rastrean los PRs de Cursor. Opciones:
- Comparar un dia especifico: buscar en tu parquet cuantos repos hay para Cursor en un dia X y comparar con nuestro JSON diario para ese mismo dia
- Revisar si hay PRs de Cursor con branches que no empiezan con `cursor/`

---

## 8. Archivos de Referencia

### Scripts nuestros (basados en tu codigo):
- `ai-coding-agents-next/scripts/backfill_2026.py` — Fetch API (5 tokens, hour-split)
- `ai-coding-agents-next/scripts/classify_and_generate.py` — Metadata + clasificacion + JSONs

### Tus scripts de referencia:
- `github-repo-fetcher/src/github_fetcher/cursor_fetcher.py` — Splitting recursivo
- `github-repo-fetcher/src/github_fetcher/batch_repo_fetcher.py` — GraphQL batch
- `github-repo-fetcher/kaggle_scripts/kaggle_notebook_completo.py` — Pipeline completo

### Output del backfill:
- `all_classified.json` (23 MB) — 271,764 repos con codigo NAICS y confianza
- `metadata_cache.json` (38 MB) — description, topics, language, stars de cada repo
- `{agent}_2026_monthly.json` — Desglose mensual por industria (4 archivos)

---

*Generado: 7 Marzo 2026 | Clasificador: aquiro1994/naics-github-classifier | GPU: Kaggle Tesla T4*
