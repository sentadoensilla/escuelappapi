# Análisis MER — bdsae2 (modo ANALYZE)

> Fecha: 2026-08-16 · Fuente física: catálogo PostgreSQL (`pg_catalog`, superuser) · Fuente semántica: `.agents/database.md` · Código: `api/**`
> Estado: análisis completo. A la espera de aprobación para conversión de relaciones `INFERRED` a constraints y para decisiones de canonicalización.

---

## 1. Schemas encontrados (12)

| Esquema | Sistema | Tablas | ~Filas totales | Tamaño | Rol |
|---|---|---|---|---|---|
| `public` | SAE | 100 | ~8.9 M | ~2 GB | Dominio académico e institucional (canónico) |
| `data` | Escuelapp | 74 | ~4.9 M | ~1.3 GB | Agenda, comunicación, PQRS, evaluaciones |
| `temporal` | SAE (legacy) | 52 | ~0 | < 1 MB | Snapshots temporales de matrícula/promedios |
| `engine` | Escuelapp | 8 | ~70 K | ~14 MB | IAM canónico de la app |
| `logic` | SAE | 6 | ~2.4 K | ~1 MB | IAM legacy SAE (migrado a engine) |
| `observador` | SAE | 5 | ~124 K | ~28 MB | Observador del estudiante |
| `preescolar` | SAE | 5 | ~362 K | ~70 MB | Registros de preescolar |
| `contact` | Escuelapp | 5 | ~20 | ~160 KB | WhatsApp: emisores y plantillas |
| `migracion` | Consolidación | 5 | ~26 K | ~1.7 MB | Mapeo de IDs SAE ↔ Escuelapp |
| `integration` | SAE | 2 | ~201 K | ~32 MB | Puente SAE↔Escuelapp + auditoría |
| `estadistica` | SAE | 1 | ~123 K | ~13 MB | Historial de visitas |
| `varios` | SAE (legacy) | 2 | ~84 | < 1 MB | Datos sueltos por institución |

**Total:** 265 tablas + 2 vistas (2 relkind v/m) + 68 secuencias + 20 funciones.

---

## 2. Fuente canónica por dominio

| Dominio | Fuente canónica | Justificación |
|---|---|---|
| Académico: instituciones, sedes, estudiantes, docentes, matrículas, cursos, notas, promoción | `public` | SAE es el maestro (`tabinst` 98, `tabdoce` 2 485, `tabestu` 49 901, `tabmatr` 73 013, `tabnota` 3.69 M). La consolidación migró datos de `data` hacia `public` (matrículas de prueba 22 110). |
| Observador / convivencia | `observador` (+ `public.tabmatr`) | Registros disciplinarios y evaluación por matrícula. `data.aebitacora` (463) coexiste como capa operativa de la app. |
| Preescolar | `preescolar` | Ámbitos, dimensiones, notas y novedades propias. |
| IAM / login | `engine` | `engine.aeusu` (36 739) es el IAM activo de la app; `logic.tabusua` (2 090) migró vía `migracion.map_usuario`. |
| Agenda, comunicación, WhatsApp, tareas, PQRS, excusas | `data` + `contact` | Capa digital de Escuelapp (`data.aelog_envios` 104 K, `aenotificaciones` 447 K). |
| WhatsApp / plantillas | `contact` | Emisores por institución (`contact.emisor`), plantillas (`aetempmess*`). |
| Mapeos / integración | `migracion` + `integration` | `map_*` (IDs) y `tabenla`/`tabregiacti` (puente y auditoría). |

> Regla de la skill: **no** tratar `data` y `public` como fuentes equivalentes; `public` manda en lo académico. **No** tratar `engine` y `logic` como dos IAM independientes (estado de consolidación: engine canónico, logic legacy).

---

## 3. Relaciones cross-schema principales

### 3.1 Físicas (FK reales)
| Origen | Columna | Destino | Esquema cruzado |
|---|---|---|---|
| `contact.emisor` | `idempresa` | `data.aeinstituciones` | contact → data |
| `contact.emisor` | `estado` | `data.aeestados` | contact → data |
| `contact.aetempmesssede` | `aeinst_id` | `data.aeinstituciones` | contact → data |
| `observador.tabobsplan` | `cinstid` | `public.tabinst` | observador → public |
| `observador.tabresp` | `cinstid` | `public.tabinst` | observador → public |
| `observador.tabrespeval` | `cmatrid` | `public.tabmatr` | observador → public |
| `preescolar.tabpreasig` | `ccursid` | `public.tabcurs` | preescolar → public |
| `preescolar.tabprenota` | `cmatrid` | `public.tabmatr` | preescolar → public |
| `preescolar.tabprenove` | `cmatrid` | `public.tabmatr` | preescolar → public |
| `preescolar.tabprenove` | `cperiid` | `public.anolperi` | preescolar → public |
| `public.avisrolldest` | `crollid` | `logic.tabroll` | public → logic |
| `public.tabavisroll` | `cavisorollusua` | `logic.tabusua` | public → logic |
| `public.tabavisusua` | `cavisorollusua` | `logic.tabusua` | public → logic |

### 3.2 Lógicas (sin FK, documentadas en database.md §6.2)
`data.aeinstituciones ↔ public.tabinst`, `data.aedocentes ↔ public.tabdoce`, `data.aeestudiantes ↔ public.tabestu`, `data.aeacudientes ↔ public.tabestuacud`, `data.aeano ↔ public.tabanol`, `engine.aeusu ↔ logic.tabusua` — resueltas por `migracion.map_*` (no por FK).

### 3.3 Puentes de integración (database.md §6.3)
`integration.tabenla`, `integration.tabregiacti`, `public.tabunio` (login SAE → usuario académico), `engine.aeusuroll` (usuario×rol×institución×año).

---

## 4. Tablas legacy

| Tabla | Filas | Motivo de clasificación |
|---|---|---|
| `temporal.*` (52: `matricula_*`, `tabpromasigNNNN`) | ~0 | Snapshots temporales por institución (SAE). Conservadas por decisión del usuario (2026-08-16). |
| `varios.estuasesoria` / `varios.sorteo` | 43 / 41 | Datos sueltos SAE. Conservadas por decisión del usuario. |
| `data.aeacudientes_old` / `data.aeestudiantes_old` | 5 327 / 6 107 | Copias históricas (`_old`). |
| `data.aeinstituciones_` / `data.aeinstitucionesss` | 37 / 39 | Duplicados de `data.aeinstituciones` (sufijos `_` y `sss`), no documentados. |
| `public.tabnota2013` … `tabnota2016` | 866 K en total | Archivos anuales de notas (pre-estructura `tabnota`). |
| `public.contact.aetempmess*` (4) | 0 | **Artefactos**: tablas vacías en `public` con el nombre del schema incrustado. |
| `public.sorteo` | 0 | Artefacto/duplicado (el real es `varios.sorteo` con 41 filas). |
| `public.events` | 2 | Tabla de eventos del scheduler (poco usada). |
| `data.aepublicaciones` | 0 | Vacía (publicaciones sin datos). |

---

## 5. Tablas de migración (schema `migracion`)

| Tabla | Columnas | Filas | Mapeo |
|---|---|---|---|
| `map_rol` | `crollid, aeroll_id` | 8 | Rol SAE → rol Escuelapp |
| `map_usuario` | `cusuaid, aeusu_id` | 2 090 | Usuario SAE → usuario Escuelapp (= filas de `logic.tabusua`) |
| `map_institucion` | `aeinst_id, cinstid` | 39 | Institución Escuelapp → institución SAE |
| `map_docente` | `aedocentes_id, cdoceid` | 1 559 | Docente Escuelapp → docente SAE (= filas de `data.aedocentes`) |
| `map_estudiante` | `aeestudiantes_id, cestuid` | 22 608 | Estudiante Escuelapp → estudiante SAE (= filas de `data.aeestudiantes`) |

---

## 6. Relaciones físicas confirmadas

- **146 FKs físicas** en la base (catálogo `pg_constraint`, contype='f').
- Cobertura por esquema origen: `data` 37, `public` ~80, `preescolar` 9, `observador` 6, `contact` 5, `engine` 3 (+ `contact.aetempmess*` artefactos y `anolperi/asigcurs/...` internas de `public`).
- Todos los FKs cross-schema documentados en `database.md` §6.1 existen físicamente (verificado).
- Los `map_*` de `migracion` están poblados al 100 % respecto a sus fuentes (2 090/2 090, 22 608/22 608, 1 559/1 559, 39/39, 8/8).

---

## 7. Relaciones documentadas sin FK

| Relación | Tipo | Documentación |
|---|---|---|
| `data.aeinstituciones ↔ public.tabinst` | Equivalencia histórica (INFERRED → mapeo) | database.md §6.2 + `migracion.map_institucion` |
| `data.aedocentes ↔ public.tabdoce` | Equivalencia histórica | §6.2 + `map_docente` |
| `data.aeestudiantes ↔ public.tabestu` | Equivalencia histórica | §6.2 + `map_estudiante` |
| `data.aeacudientes ↔ public.tabestuacud` | Equivalencia histórica | §6.2 — **sin mapa** (migración de acudientes pendiente) |
| `data.aeano ↔ public.tabanol` | Equivalencia histórica | §6.2 — sin mapa |
| `engine.aeusu ↔ logic.tabusua` | Equivalencia IAM | §6.2 + `map_usuario` |
| `integration.tabenla / tabregiacti` | Puentes | §6.3 |
| `public.tabunio` (cusuaid→cacadid) | Puente login↔académico | §6.3 |
| `engine.aeusuroll` | Asignación rol×inst×año | §6.3 |

---

## 8. Relaciones inferidas (requieren validación)

> `INFERRED: validar antes de convertir en constraint`. Basadas en convención de nombres y JOINs de código (`api/**`). **No** existen como FK.

### 8.1 En `data` (capa Escuelapp)
| Columna | En tablas | Destino probable |
|---|---|---|
| `aeinst_id` | aeasignaciones, aeavisos, aeavisosinternal, aebitacora, aeconsultasdocentes, aecronograma, aeexcusas, aepqr, aepublicaciones, inst_cue, inst_doce, aetar_pro, aesolicitud | `data.aeinstituciones` |
| `aeanol_id` | aeasignaciones, aeavisos, aeavisosinternal, aebitacora, aeconsultasdocentes, aeexcusas, aepqr, aesolicitud, aetar_pro, inst_cue, inst_doce | `data.aeano` |
| `aeusu_id` | ~20 tablas (aeavisos, aebitacora, aenotificaciones, aecronograma, …) | `engine.aeusu` |
| `aeestudiantes_id` | aeacudientes(_old), aeasistencias, aecitaciones, aeconsultasdocentes, aeestudiantes(_old), aeexcusas, aelog_envios, aetar_res | `data.aeestudiantes` |
| `aedocentes_id` | aeasignaciones, aecitaciones, aetar_pro, inst_doce | `data.aedocentes` |
| `aeacudientes_id` (en `aeestudiantes`, `aematriculas_estudiantes`) | — | `data.aeacudientes` |
| `aeinstituciones.aeusu_id` | — | `engine.aeusu` |

### 8.2 En `engine` (IAM)
| Columna | Tabla | Destino probable |
|---|---|---|
| `aeroll_id` | `engine.aeusu`, `engine.aerollopc` | `engine.aeroll` (sin FK) |
| `aeopcmenu_id` | `engine.aerollopc`, `engine.aeusuopc` | `engine.aeopcmenu` (sin FK) |
| `aeusu_id` | `engine.aeusuopc`, `engine.aeusuroll` | `engine.aeusu` (parcial; `aeusuroll`→`aeusu` y `→aeroll` SÍ tienen FK) |
| `aeinst_id`, `aeanol_id` | `engine.aeusuroll` | `data.aeinstituciones`, `data.aeano` (sin FK) |

### 8.3 Cross-system (SAE ↔ Escuelapp)
| Relación | Evidencia | Estado |
|---|---|---|
| `data.aeestudiantes.aeestudiantes_id` → `public.tabestu.cestuid` | `migracion.map_estudiante` + JOINs en código | MAPPED (vía mapa, no FK) |
| `data.aedocentes` → `public.tabdoce` | `map_docente` | MAPPED |
| `data.aeinstituciones` → `public.tabinst` | `map_institucion` | MAPPED |
| `engine.aeusu` → `logic.tabusua` | `map_usuario` | MAPPED |
| `data.aeacudientes` → `public.tabestuacud` | Sin mapa | PENDING (migración diferida) |
| `data.aeano` → `public.tabanol` | Sin mapa | SUSPECTED |
| `data.aegrupos` (vista) | Vista sobre `data.aeasignaciones`/`aeestudiantes` | SUSPECTED |
| `public.events` ↔ scheduler | `database/conexpool.js` (sequelize) | SUSPECTED (2 filas) |

---

## 9. Diferencias PostgreSQL vs database.md

| Diferencia | Clasificación | Detalle |
|---|---|---|
| 11 → **12 esquemas** | DOCUMENTATION_OUTDATED | `migracion` no estaba en el resumen (ya corregido en el .md). |
| `engine.aeroll` 201-206 → **201-208** | DATABASE_CHANGED | Roles 207/208 creados en la consolidación (ya corregido). |
| `public.tabinst` +12 columnas | DATABASE_CHANGED | Columnas de redes/coordenadas añadidas en la consolidación (ya corregido). |
| `public.tabinst` 59 → **98** | POSSIBLE_MIGRATION_STATE | 39 instituciones Escuelapp insertadas como nuevas (no coincidieron por NIT). |
| `engine.aeusu` 34 691 → **36 739** | POSSIBLE_MIGRATION_STATE | Creció con la migración de `logic.tabusua` (2 090). |
| `data.aegrupos` / `data.aenotas` | DATABASE_CHANGED | En el .md aparecen como tablas; en PG son **vista** y **matview**. |
| `public.contact.aetempmess*` (4) | DATABASE_CHANGED | Tablas vacías en `public` con nombre `contact.*` incrustado; no documentadas. |
| `public.sorteo` (0 filas) vs `varios.sorteo` (41) | UNKNOWN | Artefacto/duplicado. |
| `data.aeinstituciones_` (37), `data.aeinstitucionesss` (39) | UNKNOWN | Duplicados no documentados. |
| `migracion.map_*` | DATABASE_CHANGED | No listadas como tablas en el .md (solo en la sección de migración). |

---

## 10. Riesgos

1. **Duplicidad de identidad** entre `data` y `public` (bases históricamente disjuntas: solo 284 estudiantes coinciden por identificación). Requiere política de canonicalización explícita.
2. **Integridad referencial débil en `data`**: la mayoría de `aeinst_id/aeanol_id/aeusu_id/aeestudiantes_id/aedocentes_id` no tienen FK física (riesgo de huérfanos).
3. **Duplicados activos**: `data.aeinstituciones_` (37) y `aeinstitucionesss` (39) coexisten con `aeinstituciones` (39) — riesgo de escrituras divergentes.
4. **Legacy no depurado**: `temporal` (52) + `varios` (2) + `_old` (2) + `tabnota2013-16` (4) + artefactos `public.contact.*`/`public.sorteo` — 61+ tablas que contaminan inventarios y backups.
5. **Dominio WhatsApp vacío**: `contact.aetempmess*`, `aetempmesssede`, `aetempmessvars` = 0 filas; solo `emisor` (10) y `aetempmesstype` (10) pobladas. El flujo de envío real está pendiente (cola Bull + sesión).
6. **Matrícula legacy rota**: `sql/matricula.js` referencia tablas inexistentes (`aeterritorios_*`, `aeparentezco`, `estudiantes_acudientes`, `cartera.*`) — 8 consultas fallan; requiere integración SAE de matrícula.
7. **Acudientes sin migrar**: `data.aeacudientes` (34 777) no tiene mapa a `public.tabestuacud` (50 947).
8. **`aeusuroll` masivo pendiente**: solo 95 usuarios de prueba con contexto institucional; el resto de usuarios SAE migrados no inicia sesión con contexto.
9. **Volumen**: `public.tabnota` 3.69 M (930 MB), `data.aeasistencias` 4.3 M (760 MB), `data.aenotificaciones` 447 K (184 MB), `aelog_envios` 104 K (123 MB), `integration.tabregiacti` 201 K (32 MB) — sin política de retención/particionado.
10. **Modelo de permisos**: el usuario de la app (`adminit4_saeroot`) es solo-lectura en SAE (`public/logic/observador/preescolar`) — cualquier flujo que deba escribir en SAE requiere reconsiderar el modelo.
11. **`public.events` (2) y scheduler**: infraestructura de colas `utils/queues/` inerte (falta `bull`); `parallelQueueProcessor.js` importa módulos inexistentes.

---

## Clasificación de confianza (resumen)

- **CONFIRMED (físico):** 146 FKs · 265 tablas · 68 secuencias · 20 funciones · 2 vistas.
- **DOCUMENTED (semántico):** equivalencias §6.2, puentes §6.3, mapa `migracion`, decisiones de consolidación.
- **INFERRED (a validar):** todas las columnas del punto 8 (listadas).
- **SUSPECTED:** `data.aeano↔tabanol`, `data.aegrupos` (vista), `public.events↔scheduler`, `public.sorteo`/`aeinstituciones_`/`aeinstitucionesss`.

> **Acciones propuestas (tras aprobación):** (1) convertir las `INFERRED` de `data` en FKs reales (validando datos); (2) decidir destino de duplicados (`aeinstituciones_`, `aeinstitucionesss`, `public.sorteo`, `public.contact.*`); (3) política de retención para tablas voluminosas; (4) completar migración de acudientes y `aeusuroll` masivo.
