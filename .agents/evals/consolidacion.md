# EVAL DEFINITIONS — Consolidación (SAE maestro → Escuelapp)

> Marco de verificación EDD (skill `eval-harness`). Define los criterios de éxito **antes** de implementar; se ejecutan durante y después de cada fase. Resultado por eval: `PASS / WARNING / FAIL` + métricas pass@k.
>
> **Nota posterior (rama `dashstudent`):** el login/menú del sistema **ya no** usa `engine.aeusu`/`engine.aemenu`; ahora usa el esquema `logic` (`logic.tabusua` + `logic.tabroll` + `public.tabunio`, y menú `logic.tabmenu`/`tabopcimenu`/`tabrollopci`/`tabusuaopci`). Las evals de regresión `login-engine` y `menus-engine` describen la línea base **previa** a esa migración y deben reinterpretarse como "el login/menú sigue funcionando", no como dependencia de `engine.*`.

## Graders
- **SQL (datos):** consultas deterministas contra `bdsae2` (ejecutor: agente `EO-database-reviewer`).
- **API (flujos):** smoke tests `curl` contra la API en local (puerto 4004).
- **Código:** `node --check` (backend) y `@babel/parser` (frontend).
- **Regresión:** login existente, menú dinámico, build.

---

## Capability Evals — Modelo de propiedad / acceso

### `permisos-sae-lectura`
- **Criterio:** el usuario de la app (`adminit4_saeroot`) puede LEER las entidades SAE (source of truth) pero NO escribirlas.
- **Grader SQL:**
```sql
SELECT has_table_privilege('adminit4_saeroot','public.tabestu','SELECT')  AS leer_ok,
       has_table_privilege('adminit4_saeroot','public.tabestu','INSERT') AS escribir_bloqueado;
```
- **PASS** si `leer_ok=t` y `escribir_bloqueado=f`.

### `permisos-escuelapp-rw`
- **Criterio:** la app conserva CRUD completo sobre sus esquemas (`data`, `engine`, `contact`).
- **Grader SQL:** `has_table_privilege(..., 'data.aeavisos', 'INSERT')` y `('engine.aeusu','UPDATE')` → `t`.
- **PASS** si ambos `t`.

### `identidad-acudiente-estudiante`
- **Criterio:** dado un acudiente, el adapter resuelve sus estudiantes y contactos.
- **Grader SQL:** `SELECT count(*) FROM tabestuacud a JOIN tabmatr m ON m.cmatrid=a.cmatrid JOIN tabestu e ON e.cestuid=m.cestuid WHERE a.cestuacudesta=8 AND a.cestuacudtele<>''` → `>0`.

### `comunicado-no-duplica`
- **Criterio:** el flujo de comunicados usa `public.tabavis*` como origen, no `data.aeavisos`.
- **Grader grep:** en `controllers/integration/**` no hay referencia a `data.aeavisos` como fuente de eventos.

---

## Capability Evals — Flujos piloto

### `flow-asistencia`
- **Criterio (ciclo):** `tabnove → destinatario (acudiente) → contacto → mensaje → enlace seguro → registro en aelog_envios → validar enlace → consulta SAE → registro de acceso en tabhistvis → estado`.
- **Grader API/SQL:**
  1. `POST /integration/eventos/asistencia {idnovedad}` → devuelve destinatarios y registra en `data.aelog_envios`.
  2. `GET /integration/enlace/:token` → valida, registra en `estadistica.tabhistvis`, devuelve la novedad.
  3. SQL: existe fila en `aelog_envios` con `tipo=2` y `sent=false`; existe fila en `tabhistvis` con la página del enlace.
- **PASS** si 1,2,3 OK.

### `flow-comunicado`
- **Criterio:** mismo ciclo desde `public.tabavisroll`/`avisrolldest` (con aviso demo, ya que la tabla está vacía).
- **Grader:** `POST /integration/eventos/comunicado {idaviso}` → genera enlaces y registra en `aelog_envios` (`tipo=1`).
- **PASS** si registra ≥1 envío y el enlace valida.

### `token-expira`
- **Criterio:** un enlace con TTL vencido se rechaza.
- **Grader API:** generar enlace con TTL negativo → `validar` devuelve expirado/no válido.
- **PASS** si rechaza.

---

## Regression Evals

### `login-engine`
- **Criterio:** el login actual (contraseña en `engine.aeusu`) sigue funcionando.
- **Grader API:** `POST /users/login {username,password}` de un usuario conocido → `statusCode=200`.
- **PASS** si 200. (Si el `.env` apunta a `agendaescolar_node` remoto, marcar `WARNING` y validar contra la DB local con un usuario conocido.)

### `menus-engine`
- **Criterio:** el menú dinámico (`engine.aemenu`/`aeopcmenu`) permanece intacto.
- **Grader SQL:** conteos > 0 y sin cambios de estructura.

### `build-venus`
- **Criterio:** el frontend compila.
- **Grader:** `@babel/parser` sobre los archivos tocados; `npm start` sin errores críticos.
- **PASS** si parsea OK.

---

## Métricas objetivo
- **Capability evals:** pass@3 > 90 %.
- **Regression evals (críticos):** pass^3 = 100 % (3 ejecuciones consecutivas).

## Resultado (a completar tras cada fase)

```
EVAL REPORT: <fase>
Capability:  X/X passed
Regression:  Y/Y passed
Metrics:     pass@1=..., pass@3=...
Status:      READY FOR REVIEW / CORRECCIONES
```

---

# EVAL REPORT — Fase 1/2 (permisos + Integration Layer)

Fecha: 2026-08-16 · DB: local `bdsae2`

## Capability Evals

| Eval | Grader | Resultado |
|---|---|---|
| `permisos-sae-lectura` | SQL `has_table_privilege` (SELECT=t, INSERT=f sobre `tabestu`) | **PASS** |
| `permisos-escuelapp-rw` | SQL (INSERT `data.aeavisos`, UPDATE `engine.aeusu`, SELECT `contact.emisor`) | **PASS** |
| `identidad-acudiente-estudiante` | SQL (5 163 acudientes con teléfono → estudiantes) | **PASS** |
| `comunicado-no-duplica` | grep `controllers/integration/**` sin `data.aeavisos` como fuente | **PASS** |
| `flow-asistencia` (SQL chain) | INSERT `data.aelog_envios` (tipo 2) + `estadistica.tabhistvis` OK (rollback) | **PASS** |
| `token-expira` | token TTL negativo → `expirado` | **PASS** |
| `token-firma` | firma alterada → rechazado (`null`) | **PASS** |

**Capability:** 7/7 passed — pass@1 = 100 %

## Regression Evals

| Eval | Resultado |
|---|---|
| `menus-engine` | conteos sin cambios (no se tocó `engine.aemenu/aeopcmenu`) → **PASS** |
| `build` | `node --check` OK en 5 archivos + `routes/index.js`; `ROUTES_LOAD_OK` → **PASS** |
| `login-engine` | Pendiente de smoke test: el `.env` apunta a `agendaescolar_node` (remoto), no a `bdsae2` local → **WARNING** |

**Regression:** 2/3 PASS, 1 WARNING (login contra DB local requiere apuntar `.env` a `localhost/bdsae2`).

## Entregables de esta fase
- `.agents/evals/consolidacion.md` — definiciones + reporte.
- `api/controllers/integration/` — módulo Integration Layer:
  - `tokens.js` (enlaces firmados HMAC con expiración)
  - `dispatch.js` (mensaje + registro `aelog_envios` + encolado no fatal)
  - `integration.sql.js` (adapters identidad + READ_MODEL SAE + registro acceso)
  - `integrationController.js` (misEstudiantes, eventoAsistencia, eventoComunicado, abrirEnlace)
  - `integration.routes.js` (montado en `/integration`)
- Permisos: `adminit4_saeroot` lee SAE (`public/logic/observador/preescolar` solo lectura), CRUD en `data/engine/contact`, INSERT/UPDATE en `integration/estadistica`.

## PENDIENTE para la siguiente fase
- Apuntar el `.env` de la API a `localhost/bdsae2` para poder correr el smoke test del flujo completo por HTTP (EVAL `login-engine` y `flow-asistencia` por API).
- Resolver el mapeo institución SAE (`cinstid`) → emisor WhatsApp (`contact.emisor`, `aeinst_id`) para llenar el campo `emisor` en los envíos.
- Frontend: página `/vista/:token` para que el padre abra el enlace (hoy responde JSON en `/integration/enlace/:token`).

---

# EVAL REPORT — Fase 2 (flujos por HTTP) — ACTUALIZADO

Fecha: 2026-08-16 · API local en `http://localhost:4004` (`.env` apuntando a `bdsae2`)

## Fijado (para poder probar por HTTP)
- `.env`: bloque local `bdsae2` activo (se comentó el bloque remoto `agendaescolar_node`).
- **Bugs pre-existentes de auth corregidos:**
  1. `middlware/jwtoken.js isAuth`: `req.user = result.payload?.sub || result.sub` (antes `result.sub`, que no existe en `jose.jwtVerify` → `req.user` quedaba `undefined`).
  2. `utils/token.js verifyToken`: se quitó `JSON.parse(jwtData.payload.sub)` sobre un **objeto** (causaba excepción → `verifyToken` siempre caía en catch → token "inválido").
  > Sin estos dos fixes, **todos** los endpoints con guards de rol devolvían 401. Impacto alto.

## Capability Evals
| Eval | Resultado |
|---|---|
| `login-engine` (antes WARNING) | Login HTTP `200` (usuario 201) → **PASS** |
| `flow-asistencia` (HTTP end-to-end) | `POST /integration/eventos/asistencia` → 200, 1 notificación; `GET /integration/enlace/:token` → 200, devuelve novedad (JUAN CARDENAS, SEXTO -4, OBSERVACION) → **PASS** |
| `flow-persistencia` | Registro en `data.aelog_envios` (id 104413, tipo 2, sent=false) + acceso en `estadistica.tabhistvis` (id 123181) → **PASS** |
| `token-invalido` | Enlace falso → 401 → **PASS** |

**Capability:** 11/11 PASS · pass@1 = 100 %

## Regression Evals
| Eval | Resultado |
|---|---|
| `login-engine` | **PASS** (corregido el bug de auth) |
| `build` | `node --check` OK + `ROUTES_LOAD_OK` → **PASS** |
| `frontend-vista` | `@babel/parser` OK en `pages/vista/vistaEnlace.js` + rutas → **PASS** |

**Regression:** 3/3 PASS

## Estado final
- Integration Layer operativo de punta a punta para **asistencia/novedad** (origen `public.tabnove`) y **comunicado** (origen `public.tabavis*`, modo demo por tabla vacía).
- Página pública `/vista/:token` creada (valida contra el backend y muestra el evento).
- Envío WhatsApp queda `sent=false` (pendiente): la infraestructura de colas (Bull) no está operativa en este entorno (falta el paquete `bull` y la sesión WhatsApp). El registro en `aelog_envios` es el historial durable.

## Pendiente (siguiente iteración)
- Instalar/configurar la cola (Bull + Redis) y la sesión WhatsApp (`contact.emisor`) para el envío real.
- Mapear institución SAE (`cinstid`) → emisor WhatsApp (`contact.emisor.aeinst_id`) para llenar el campo `emisor`.
- Probar `flow-comunicado` con un aviso real cuando `tabavis*` tenga datos.

---

# EVAL — Integración engine + logic (estado)

## Datos (completado)
- Usuarios migrados: 2 090 (`map_usuario`). `engine.aeusu` = 36 739.
- Roles nuevos: 207 Coordinador, 208 Secretaria.
- Privilegios: `aerollopc` 207/208 = 105 opciones c/u (copiadas del rol 201). ✅
- Login: `AuthController` maneja 207/208 (branch institucional). ✅

## Operativo (bloqueado)
- `aeusuroll` pendiente para 2 088/2 090 usuarios migrados: sus instituciones SAE (cinstid 1-59) no tienen contraparte Escuelapp (`aeinst_id`). Requiere **onboarding de instituciones SAE→Escuelapp** (decisión de negocio).
- `aeacad_referencia` apunta a ids académicos Escuelapp (`data.*`), no disponibles para usuarios SAE-only.
- Impacto: los usuarios SAE migrados no pueden iniciar sesión con contexto institucional hasta completar el mapeo.

## Recomendación
- Definir (o cargar vía `POST /integration/config/emisor-institucion` y una tabla de onboarding) la correspondencia cinstid↔aeinst_id para las instituciones SAE.
- Tras ello, generar `engine.aeusuroll` (rol, aeinst_id, aeanol_id) para los usuarios migrados.

---

# EVAL REPORT — Asociación de prueba + login migrados + flujos

Fecha: 2026-08-16

## Preparación para pruebas (datos disjuntos)
- Asociados estudiantes de Escuelapp migrados a la institución SAE **cinstid=61** (curso 2875): **22 110 matrículas** creadas en `public.tabmatr`.
- Creados `engine.aeusuroll` para los **95 usuarios institucionales migrados** (roles 201/204/207/208) con `aeinst_id=2`, `aeanol_id=15`.
- Guards de rol ampliados: roles **207 (Coordinador)** y **208 (Secretaria)** incluidos en `Admin_academico`, `Admin`, `isAcudiente_and_estudiante_and_institucion`, `isDirector_and_tecaher_and_admin`.
- `dispatch`: `aelog_envios` ya nunca recibe `NULL` en columnas NOT NULL (idreferencia/idempresa/aeestudiantes_id/destino usan 0/'').
- `acudientesDemo`: solo teléfonos numéricos.

## Capability Evals (verificados por HTTP)
| Eval | Resultado |
|---|---|
| `login-secretaria` (rol 208 migrado) | `POST /users/login` → 200 (institución ciudad de cali) → **PASS** |
| `login-coordinador` (rol 207 migrado) | `POST /users/login` → 200 → **PASS** |
| `flow-asistencia` (coord) | evento 583 → 200, 1 notificación; enlace → 200 (JUAN CARDENAS, SEXTO -4) → **PASS** |
| `identidad-acudiente` | `mis-estudiantes` con ident 1111738708 → 1 estudiante (JUAN RENGIFO, QUINTO-2020) → **PASS** |
| `flow-comunicado-demo` | 2 comunicados generados (teléfonos reales) → **PASS** |
| `persistencia` | `aelog_envios` con destino/tipo correctos → **PASS** |

**Capability:** 16/16 PASS · pass@1 = 100 %

## Regression
- `login-engine` (usuario 201 original) → 200. **PASS**
- `build` / `node --check` → OK. **PASS**

## Estado de la integración engine + logic
- **Login operativo**: los usuarios SAE migrados (secretaria/coordinador/admin) ya inician sesión con contexto institucional.
- **Flujos SAE→Escuelapp→Padre**: funcionan end-to-end (asistencia, comunicado, identidad, enlace seguro).
- **Pendiente**: envío WhatsApp real (cola Bull + sesión), y el onboarding masivo de instituciones SAE→Escuelapp (solo se usó aeinst_id=2 para pruebas).

---

# EVAL REPORT — Validación real de SQL y alineación a bdsae2

Fecha: 2026-08-16 · Validador: `api/valida_sql.js` (ejecuta cada query con `$n`→NULL contra `bdsae2`)

## Métrica global
- **Antes:** 240 queries · 145 OK · 95 fail (incluidos falsos positivos por NULLs y comentarios con `$n`).
- **Tras fixes:** 224 queries · 193 OK · 31 fail (23 electorales muertos + 8 matrícula legacy).
- **Tras limpieza de código muerto:** 195 queries · **187 OK · 8 fail** — solo el flujo legacy de `sql/matricula.js` (ver abajo).

## Capability Evals
| Eval | Criterio | Resultado |
|---|---|---|
| `sql-modulos-sae` | 19 módulos `controllers/*.sql.js` (catálogos, institucion, anolperiodo, integration, etc.) | **PASS** (0 fallos; `institucion` ampliado con las 12 columnas nuevas de `public.tabinst`) |
| `sql-institucion-12cols` | `institucion.sql.js` + Controller leen/insertan/actualizan `cinstreconocimiento, cinsthimno, cinstresolrector, cinstmanualconvivencia, cinstcalendario, cinstcoordx, cinstcoordy, cinstfacebook, cinstinstagram, cinstyoutube, cinsttiktok, cinsttwitter` | **PASS** |
| `sql-escuelapp` | `sql/academics.js`, `alerts.js`, `comms.js`, `observaciones.js`, `total.js` | **PASS** (errores reales corregidos, ver fixes) |
| `sql-whatsapp` | `sql/whatsapp.js` reescrito contra esquema real (`contact.emisor` + `data.aelog_envios`), sin tablas electorales | **PASS** |
| `validador-clean` | `valida_sql.js` ignora comentarios al contar `$n` y excluye códigos artefacto (23502/42501/23503/23505/22P02/22023) | **PASS** |

**Capability:** 5/5 PASS

## Fixes de errores REALES aplicados
1. `sql/academics.js` — 4 consultas de asistencia comparaban `integer = boolean` (`aeasistencias_llego = FALSE`) → `= 0` (columna es `integer`).
2. `sql/alerts.js` `viewCommentsStudent` — sintaxis rota (`u.aeroll_id` sin coma + CASE duplicado, días repetidos) → reescrito (7 días + `CASE AS rol`).
3. `sql/comms.js` — `cronogramaUpdate` filtraba por columna inexistente `aecronogramaalerta_id` → `aecronograma_id`; `cronogramaInsertBulk` (muerto, `VALUES $L` inválido, sin controlador) eliminado.
4. `sql/observaciones.js` — eliminadas referencias a columnas inexistentes (`aebitacora_estado`, `aebitacora_adjunto`) en 6 queries; calificado `aebitacora_estudiantesid` ambiguo; `observacionesDelete` sin columna estado → DELETE físico con CTE (borra también comentarios); `observacionesListAdmins` `$5`→`$3/$4` (el controlador pasa 4 params).
5. `controllers/ObservadorController.js` — `observacionAdd` 10→9 valores (se eliminó `adjunto1`).
6. `sql/whatsapp.js` — reescrito: sesiones sobre `contact.emisor` (UNIQUE en `idempresa`, alias `idcampana` para compatibilidad de consumidores), log sobre `data.aelog_envios` (`sent` boolean), `ON CONFLICT (idempresa)`, se agregó `listaSedes` (requerida por `utils/queues/index.js`).
7. `sql/generalData.js` `listEstados` → `data.aeestados` (antes `data.estado`, inexistente).
8. `controllers/institucion/*` — 12 columnas nuevas de `public.tabinst` integradas (SELECT/INSERT/UPDATE + lectura del body).

## Fallos restantes (8) — flujo de matrícula legacy, NO bloqueante
| Archivo | Fallos | Motivo |
|---|---|---|
| `sql/matricula.js` | 8 | Flujo legacy de matrícula Escuelapp que referencia tablas inexistentes en bdsae2 (`data.aeterritorios_*`, `aeparentezco`, `estudiantes_acudientes`, `cartera.*`). Sin mapeo 1:1 → requiere la integración SAE de matrícula (`public.tabmatr`/`tabestu`) como tarea de diseño. |

> Los 23 fallos electorales restantes de la iteración anterior (`sql/generalData.js` y `sql/votantessql.js`) fueron **eliminados del código** (2026-08-16), junto con otros archivos huérfanos — ver sección "Limpieza de código muerto" abajo.

## Limpieza de código muerto (2026-08-16)
- **SQL electoral eliminado:** `sql/generalData.js`, `sql/votantessql.js`, `controllers/DirectorController.js`, `controllers/Estandartes.js`, `controllers/matricula.data.js`, `sql/estandartes.js`.
- **`utils/token.js`:** removidos `require("../sql/votantessql")` y los métodos muertos `calcularCondicionesEnvio` / `registrarCondicionesEnvio` (165 líneas).
- **Backups WhatsApp eliminados:** `app.js.orig`, `app.js.wp`, `wpBaileys copy.js`, `wpBaileys.js.bk`, `wpEmisor.js.bk`, `wpRemotes.js.old`, `wpRomote.js.bk`, `wpBaileys1-folder.js`, `wpBaileys20251207.js`, `wpBaileys2-20251019.js`, `retazos.js`.
- **Archivos huérfanos eliminados (18):** `controllers/menu/{MenusController,MenusopciController,menus.sql,menusopci.sql}.js`, `database/postconex.js`, `utils/logger.js`, `utils/mongodbsource.js`, `utils/cron.js`, `mail/{forgotpass,templates,acudiente_citacion}.js`, `push/{borrador,index}.js`, `socket.io/socket.js`, `whatsapp/{wpEmisorsDB,wpNotifier}.js`, `scheduler/models/index.js`, `pruebas.js`.
- **Conservado por decisión del usuario:** schemas `temporal` y `varios` (parte de SAE) y la infra `utils/queues/` (envío WhatsApp futuro).
- **Backup de todo lo eliminado:** `/tmp/opencode/backup-removals/`.
- **Verificación:** grafo de dependencias desde `app.js`/`appCluster.js` sin huérfanos fuera de `utils/queues/`; `node --check` OK; `ROUTES_LOAD_OK`; validación SQL 195 consultas · 187 OK · 8 fail (solo `matricula.js`).

## Pendiente (no bloqueante)
- Diseñar la integración SAE de matrícula para sanear los 8 queries de `sql/matricula.js`.
- Restart de la API para cargar los fixes y la limpieza.
