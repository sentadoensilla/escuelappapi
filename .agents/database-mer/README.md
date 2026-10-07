# Database MER — bdsae2

Diagramas Entidad-Relación editables de la base PostgreSQL `bdsae2` (SAE + Escuelapp).

Generados con la skill `database-mer` (modo ANALYZE + GENERATE) a partir de:
1. **PostgreSQL** (`pg_catalog`) — fuente de verdad estructural (tablas, columnas, PK, FK, UNIQUE, comentarios).
2. **`.agents/database.md`** — fuente semántica (dominios, canónicos, legacy, migraciones, riesgos).
3. **`api/**`** — código para detectar relaciones implícitas (JOINs) y flujos reales.

## Archivos

| Archivo | Contenido |
|---|---|
| `bdsae2-full.dbml` / `.mmd` | MER completo: 265 tablas, 146 FKs (12 schemas). |
| `sae-academic.dbml` / `.mmd` | Dominio académico SAE: `public`, `observador`, `preescolar`, `estadistica`, `integration`, `logic`. |
| `escuelapp-communication.dbml` / `.mmd` | Dominio de comunicación Escuelapp: `data` + `contact`. |
| `identity-access.dbml` / `.mmd` | IAM: `engine` (canónico) + `logic` (legacy). |
| `integration-migration.dbml` / `.mmd` | Integración y migración: `integration` + `migracion`. |
| `domain-map.mmd` | Diagrama de arquitectura conceptual (SAE → Escuelapp → WhatsApp → Padre), con dominio de enlaces como `PLANNED`. |
| `mer-analysis.md` | Análisis (modo ANALYZE): 10 puntos, confianza de relaciones, diferencias y riesgos. |
| `metadata.json` | Metadatos de generación (fecha, fuentes, conteos, herramienta). |

## Convenciones

- **Formatos canónicos:** DBML (editable, p. ej. [dbdiagram.io](https://dbdiagram.io)) y Mermaid (documentación en Markdown/GitHub).
- **Confianza de relaciones:** `CONFIRMED` (FK física) · `DOCUMENTED` (semántica) · `INFERRED` (nombres/código; **no** presentar como FK real) · `SUSPECTED` (evidencia insuficiente; solo en `mer-analysis.md`).
- **Canónicos:** `public` = académico; `engine` = IAM; `data` = agenda/comunicación; `contact` = WhatsApp; `migracion` = mapeos.
- **Never** dibujar una FK inexistente para conectar entidades visualmente; las equivalencias históricas se documentan como mapeo.

## Regenerar

Los `.dbml`/`.mmd` se regeneran desde el catálogo real:

```bash
# 1. Exportar catálogo (usuario con lectura de pg_catalog)
PGPASSWORD='Ventiuno*21' psql -h localhost -p 5432 -U postgres -d bdsae2 -P pager=off -F $'\t' -Atc "SELECT ..." > /tmp/opencode/mer_tables.tsv
# (mismos pasos para mer_columns.tsv, mer_fks.tsv, mer_keys.tsv — ver /tmp/opencode/gen_mer.py)
python3 /tmp/opencode/gen_mer.py
```

`mer-analysis.md`, `README.md`, `metadata.json` y `domain-map.mmd` se mantienen manualmente o se regeneran con la skill.
