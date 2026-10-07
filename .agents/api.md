# Estructura y Guía del Backend (API) — Escuelapp

> Documento de referencia para agentes IA y desarrolladores. Describe cómo está construido el backend de **Escuelapp** (integración de SAE + Escuelapp), sus convenciones, lo que ya está implementado y el plan para completar los CRUDs pendientes.

---

## 1. Contexto

- **Ruta:** `/home/sentadoensilla/Projects/Venus/venus/api/`
- **Nombre npm:** `escuelapp` (v1.2.1)
- **Objetivo:** API que gestiona los datos de las tablas, envía notificaciones por WhatsApp, genera reportes/dashboards/exportables y gestiona el inicio de sesión y las sesiones de los usuarios.
- **Modelo de datos:** base PostgreSQL `bdsae2`, 11 esquemas (ver `.agents/database.md`).

## 2. Stack y dependencias

| Categoría | Librerías |
|---|---|
| Servidor | `express`, `body-parser`, `cors`, `express-useragent`, `multer` |
| BD relacional | `pg`, `pg-promise`, `pg-format`, `pg-hstore`, `sequelize` |
| BD no relacional | `mongoose` (solo un schema `file.js`) |
| Auth / seguridad | `jsonwebtoken`, `jose` (JWT), `bcrypt`, `cryptr` |
| WhatsApp | `whatsapp-web.js`, `@whiskeysockets/baileys`, `qrcode`, `qrcode-terminal` |
| Correo | `nodemailer` |
| Tiempo real | `socket.io`, `@socket.io/cluster-adapter`, `@socket.io/sticky`, `socket.io-redis`, `sticky-session`, `redis` (en `utils/queues/redis.js`) |
| Tareas programadas | `node-cron` |
| Exportables | `exceljs`, `excel4node`, `xlsx-populate`, `csv-parser`, `csv-parse` |
| Utilidades | `moment`, `moment-timezone`, `axios`, `uuid`, `lz-string`, `sharp`, `jimp`, `ffmpeg`, `link-preview-js`, `request` |

**Scripts (package.json):** `devel`/`start` (nodemon `app.js`), `startcluster` (`appCluster.js`), `starter`/`stoper` (forever para producción).

## 3. Estructura de directorios

```
api/
├── app.js                    # Punto de entrada Express + Socket.io
├── appCluster.js             # Arranque en cluster (sticky sessions)
├── controllers/              # Lógica de negocio (30+ archivos)
│   ├── menu/                 # Módulo MODERNO: menu.routes.js + menuController.js + menu.sql.js
│   └── tipodesempeno/        # Módulo MODERNO (mismo patrón)
├── routes/                   # Definición de rutas HTTP
│   └── index.js              # Router raíz que agrupa todos los módulos
├── sql/                      # Sentencias SQL por módulo
├── database/                 # Conexiones a PostgreSQL
├── middlware/                # jwtoken.js, uploadImages.js, file.js
├── scheduler/                # Eventos de calendario (Sequelize)
├── utils/                    # token.js, datasource, notificaciones, colas, exports
├── public/                   # Archivos estáticos servidos en /p/...
├── plantilla/                # Plantillas (matrícula)
├── test/                     # pruebas sueltas
└── .env / .envsae            # variables de entorno
```

### 3.1 El patrón de módulo recomendado (definido en `.ia/rules.md`)

Cada módulo nuevo debe crear una carpeta en `controllers/<modulo>/` con tres archivos:

1. **`<modulo>.routes.js`** — rutas que invocan cada función del controlador.
2. **`<modulo>Controller.js`** — las funciones (handler).
3. **`<modulo>.sql.js`** — sentencias SQL usadas por las funciones.

Ejemplo ya implementado: `controllers/menu/` y `controllers/tipodesempeno/`.

> Nota histórica: la mayoría del código existente NO sigue este patrón (está en `controllers/*.js` plano + `sql/*.js` + `routes/*.js`). El código nuevo debe seguir el patrón de carpeta.

## 4. Flujo de arranque

1. `app.js` carga `dotenv`, crea la app Express, habilita CORS, body parsers y `express-useragent`.
2. Sirve archivos estáticos bajo `/p/...` (tareas, exámenes, excusas, avisos, cronograma, matrículas).
3. Monta `routes/index.js` en `/`.
4. Levanta **Socket.IO** en el path `/communication` (para WhatsApp remoto y sincronización en tiempo real).
5. Escucha en `process.env.PORT` sobre `0.0.0.0`.

## 5. Conexiones a la base de datos (¡hay 4!)

| Archivo | Librería | Uso real | Estado |
|---|---|---|---|
| `database/conex.js` | `pg` (Client) | **La más usada** por controllers vía `Db.query({text, values})` | Activa (ssl:true) |
| `utils/datasource.js` + `datasourceConst.js` | `pg` (Pool, max 50) | Usada por `utils/token.js` (logs, notificaciones) | Activa |
| `database/pgpromise.js` | `pg-promise` | Disponible, poco usada | Activa |
| `database/conexpool.js` | `sequelize` | Solo el modelo del **scheduler** (`scheduleevents` en esquema `calendar`) | Activa |

> ⚠️ Al crear un módulo nuevo, importar `const Db = require('../../database/conex')` y usar `Db.query({ text, values })`.

## 6. Autenticación

### 6.1 Login (`AuthController.login`)

- Lee `{username, password}`.
- Consulta `sql/authsql.verify` — **autentica contra SAE**: `logic.tabusua` + `logic.tabroll` + `public.tabunio` (usuario ↔ académico). Valida `cusuanick` + `cusuaesta=8` + `crollesta=8`.
- Compara la clave aceptando `cusuallave` en **simple base64**, **doble base64** o **texto plano** (para no romper usuarios históricos ni las claves de prueba de simple base64).
- Según `logic.tabroll.crollid` ejecuta una consulta distinta para construir `datos_usuario` (todas sobre `public.*` vía `public.tabunio`):
  - `1` estudiante → `inicio_estudiante` (`public.tabestu` + `tabmatr` + `tabcurs` + `tabgrad` + `tabinst`)
  - `2`/`6`/`7` docente/coordinador/secretaria → `inicio_Docente` (`public.tabdoce` + `tabinstdoce` + `tabinst`)
  - `3` institución → `inicio_institucion` (`public.tabinst`)
  - `4` acudiente → `inicio_acudiente` (`public.tabestuacud` + `tabmatr` + `tabinst`)
  - `0` administrador global → `inicio_administrador` (`logic.tabusua` + `tabrol`, año activo de `public.tabanol`)
- El año lectivo (`canolid`) y el periodo activo se toman de `public.anolperi` (estado `7`) para la institución del usuario.
- Obtiene los privilegios del menú (`sql/authsql.privilegees`) — **esquema `logic`**: `logic.tabmenu` + `logic.tabopcimenu` + `logic.tabrollopci` (privilegios por rol) + `logic.tabusuaopci` (privilegios por usuario). Replica la lógica de `get_keys()` del SAE original (rol EXCEPTO usuario-negado UNION usuario EXCEPTO rol-negado).
- `logic.tabopcimenu.copcimenuenla` guarda la ruta React SIN `/` inicial (ej. `areas`, `anolec`, `gestion/cursos`) y `copcimenuicon` es clase Font Awesome/Bootstrap; el query lo expone como `'/' || copcimenuenla`.
- Genera dos JWT (`utils/token.createtoken`): uno para `datos_usuario` y otro para el menú. **Expiran en 2 minutos** (`setExpirationTime('2m')`).

### 6.2 Middleware (`middlware/jwtoken.js`)

- `isAuth` — exige `Authorization: Bearer <token>` y valida con `jose`.
- Guardas de rol (comparan `usuarioRollId` descifrado): `estudiante`, `Admin_academico`, `Admin`, `isTeacher`, `isAcudient`, `isDirector_and_tecaher`, `isAcudiente_and_estudiante`, `isAcademico_and_estudiante_and_teacher`, `isDirector_and_tecaher_and_admin`, etc.
- Mapeo de roles (ver `database.md` §5.3/5.4): las guardas aceptan los roles SAE `logic.tabroll` (0 administrador, 1 estudiante, 2 docente, 3 institución, 4 acudiente, 6 coordinador, 7 secretaria) y su equivalencia Escuelapp `engine.aeroll` (201–208). Al iniciar sesión vía `logic.tabusua`, `usuarioRollId` es el `crollid` SAE (0–7).

### 6.3 Cifrado de IDs (clave para el frontend) — CONVENCIÓN FINAL

- `utils/token.encriptar(x)` → doble base64. `decriptar(x)` lo revierte.
- **PK (`idregistro`)**: el backend la devuelve ENCRIPTADA en los listados y el frontend la reenvía tal cual; los controladores la `decriptar()` en `actualizar`/`borrar`.
- **FKs**: el backend las devuelve **CRUDAS** en los listados. El frontend las enmascara con `tool.encriptar()` antes de enviarlas y el backend las `decriptar()`:
  - Controladores SAE: `parseInt(token.decriptar(b.idgrado))` en `registrar`/`actualizar`.
  - Catálogos genéricos (`catalogosController`): decripta las columnas marcadas en `config.fk` (ej. `ciudades` → `fk: ['cdepageogid']`).
- **IMPORTANTE**: no encriptar las FKs en los `SELECT` de los listados (solo `idregistro`), para que el frontend pueda enmascararlas con `tool.encriptar()` de forma uniforme.

### 6.4 Registro de menús/opciones en la BD

El menú del login se arma con **esquema `logic`**: `logic.tabmenu` (menús) + `logic.tabopcimenu` (opciones) + `logic.tabrollopci` (privilegios por rol) + `logic.tabusuaopci` (privilegios por usuario). El campo `logic.tabopcimenu.copcimenuenla` guarda la ruta React SIN `/` inicial (ej. `areas`, `anolec`, `gestion/cursos`); `copcimenuicon` es clase Font Awesome/Bootstrap. Ver script `api/scripts/sync_logic_menu.js` (idempotente: ajusta rutas/iconos y claves de prueba). El login las expone como `'/' || copcimenuenla`.

## 7. Convenciones de código

- **Respuesta estándar** de controllers:
  ```js
  res.send({ status: "success"|"error"|"fail", statusCode: 200|400|..., message: "...", rows: <datos> })
  ```
- **Dato clave para el frontend**: cuando un controller no encuentra resultados responde
  `{status:'error', statusCode:400, message:'0 Resultados encontrados', rows:{}}` (o similar), es
  decir **`rows` va vacío pero con `statusCode` 400**. Por eso el frontend debe validar
  `Number(statusCode) === 200 && rows con contenido real`; **nunca** comparar `rows` contra el
  string `"{}"` (un objeto nunca es igual a ese string). Ver el caso `/totals/statsinitial/*` y la
  corrección del dashboard de estudiante (`.agents/frontend.md` §11).
- **SQL** en `sql/*.js` como plantillas con `$1..$n`; ejecución `Db.query({text, values})`.
- **Borrado lógico**: en general se hace `UPDATE ... SET <campo>_estado = 0` (no `DELETE`).
- **IDs autoincrementales**: patrón `(SELECT COALESCE(MAX(id)+1),1) FROM tabla)` o secuencias (`nextval`). Ver §11.
- **async/await** (aunque hay mezcla con `.then`).
- **Nombres** de funciones en camelCase; comentarios `/** */`.
- ~~Restos de un proyecto electoral anterior~~ (`votantes`, `campana`, `bochinche`, `personal`) — **eliminados** (2026-08-16): `sql/generalData.js`, `sql/votantessql.js`, `controllers/DirectorController.js`, `controllers/Estandartes.js`, `controllers/matricula.data.js`, `sql/estandartes.js` y los métodos `calcularCondicionesEnvio`/`registrarCondicionesEnvio` de `utils/token.js`. Backup en `/tmp/opencode/backup-removals/`. **No replicar esa lógica.**

## 8. Notificaciones y envíos

| Mecanismo | Ubicación | Notas |
|---|---|---|
| WhatsApp (web.js) | `utils/notifications/whatsapp/wpRomote.js` (activo), `wpBaileys.js`, `wpEmisor.js` | Las copias `.bk`/por fecha/`copy` fueron **eliminadas** (2026-08-16). Se vincula con `contact.emisor` |
| Cola de envío | `utils/queues/` (parallelQueue, process/queue36..66) | Cada `queueNN` es un worker/prioridad. Pendiente: instalar `bull` + Redis para operarla |
| Correo | `utils/notifications/mail/*` (welcome/inscripcion/alerta/resetPassword) | nodemailer |
| Push | `utils/notifications/push/*` (firebase) | Firebase |
| Socket.IO | `utils/notifications/socket.io/*` + `app.js` | canal `/communication` |
| Registro de envíos | tabla `data.aelog_envios` (tipo = `data.aetipo_envio`) | |
| Auditoría/visitas | `data.aelogdispositivos` vía `utils/token.logsteps` | |

## 9. Reportes / exportables

- `utils/exports/excel.js` + `utils/spreadSheetStyles.js` + `controllers/*Export.js` (`AsistenciasControllerExport`, `AcademicControllerExport`).
- Librerías: `exceljs`, `excel4node`, `xlsx-populate`.

## 10. Scheduler

- Modelo Sequelize `scheduler/models/model.js` → tabla `calendar.scheduleevents`.
- Controlador `scheduler/controllers/scheduler.controller.js` (CRUD tipo Syncfusion: `added/changed/deleted`).
- Ruta montada en `/calendar`.

## 11. Consideraciones CRÍTICAS sobre Primary Keys y datos históricos

> El usuario exige conservar los registros históricos de forma coherente y que cada dato corresponda a su usuario/docente/estudiante/acudiente.

1. **No hay FKs físicas entre la mayoría de tablas** de `data`/`engine` (solo existen en `public`/`observador`/`preescolar`). La integridad la mantiene la lógica de la app. Al codificar CRUDs, **nunca** reinventar IDs ni mezclar identificadores entre entidades.
2. **Tipos inconsistentes de PK**: `aeusu_id` es `double precision` en `data` pero `bigint`/`integer` en `engine`. `aedocentes_id` es `double precision`. Al generar nuevos registros usar el patrón `MAX(id)+1` de la propia tabla y respetar el tipo de columna.
3. **Secuencias compartidas**: `data.secuence_aeinst_id`, `data.secuence_aedocentes_id`, `engine.secuence_aeusu_id`, `public.tabla_id_seq`, `public.tabnota_cnotaid_seq` alimentan varias tablas. Verificar con `SELECT` cuál secuencia corresponde antes de insertar.
4. **Conservación histórica**: las notas viejas viven en `tabnota2013..2016` y `tabnotahist`; existen copias `aeinstituciones_`, `aeinstitucionesss`, `aeestudiantes_old`, `aeacudientes_old`. No borrar ni reutilizar IDs de estas.
5. **Unión usuario↔académico**: `engine.aeusuroll.aeacad_referencia` (docente/estudiante/acudiente) y `public.tabunio` (cusuaid↔cacadid) son los vínculos de identidad. Todo CRUD de docentes/estudiantes/acudientes debe crear/actualizar su vínculo de usuario y de rol correctamente.

## 12. Inventario de módulos implementados (backend)

| Módulo | Routes | Controller | SQL | Tablas | Estado |
|---|---|---|---|---|---|
| Auth / login | `routes/users.js` | `AuthController` | `sql/authsql` | logic.tabusua, tabroll, tabunio, tabmenu, tabopcimenu, tabrollopci, tabusuaopci + public.* | ✅ |
| Menús | `controllers/menu/menu.routes.js` | menu/menuController | menu/menu.sql.js | logic.tabmenu | ✅ |
| Tipos de desempeño | `controllers/tipodesempeno/*` | tipodesempeno | tipodesempeno.sql.js | public.tabtipodese | ✅ |
| Docentes (agenda) | `routes/teachers.js` | `TeacherController`, `DocenteMasivo` | sql/teachers | data.aedocentes, inst_doce | ✅ |
| Estudiantes (agenda) | `routes/students.js` | `StudentsControllers`, `DocenteMasivo` | sql/students | data.aeestudiantes, aeacudientes | ✅ |
| Asignaciones/horario | `routes/horario.js` | `horarioController` | sql/horarios | data.aeasignaciones | ✅ |
| Asistencias | `routes/attendance.js` | `asistenciasController`, `AsistenciasControllerExport` | sql/asistencias | data.aeasistencias | ✅ |
| Comunicados/avisos | `routes/comunications.js` | `AlertsController`, `AlertsControllerPlus`, `comunicationController` | sql/alerts, alertsPlus, comms | data.aeavisos, aepublicaciones, aecronograma | ✅ |
| Excusas | (en `routes/academic.js`) | `AcademicController` | sql/academics | data.aeexcusas, aeexcusas_respuestas | ✅ |
| Consultas al docente | (en academic) | `AcademicController` | sql/academics | data.aeconsultasdocentes | ✅ |
| Evaluaciones/exámenes | (en academic) | `AcademicController` | sql/exams | data.aecue, aepre, aeopcres, inst_cue, inst_cue_res, aeres | ✅ |
| Tareas | (en academic) | `AcademicController` | sql/exams | data.aetar, aetar_pro, aetar_res | ✅ |
| Citaciones | `routes/citaciones.js` | `CitacionesController` | sql/citaciones | data.aecitaciones, aemotivo | ✅ |
| Observaciones (agenda) | `routes/observer.js` | `ObservadorController` | sql/observaciones | data.aebitacora | ✅ |
| Matrículas | `routes/matriculas.js` | `MatriculasController`, `matricula.data` | sql/matricula | data.aematriculas_* | ✅ |
| Datos generales/catálogos | `routes/datosgenerales.js`, `general.js`, `linkables.js` | `DatosGeneralesController`, `generalData`, `linkables` | sql/datosGenerales, generalData | catálogos data.* | ✅ (parcial) |
| Año lectivo | `routes/anolectivo.js` | `anolectivoController` | sql/anolectivo | data.aeano | ✅ |
| Áreas | `routes/areas.js` | `AreasController` | sql/areas | public.tabarea | ⚠️ solo listado |
| Emisor WhatsApp | `routes/emisor.js` | `EmisorController` | sql/whatsapp | contact.emisor | ⚠️ parcial |
| Estadísticas/dashboards | `routes/estadisticas.js`, `stats.js` | `StatisticsController`, `TotalController` | sql/statistical, total | data.* | ✅ (parcial) |
| Scheduler/calendario | `routes/scheduler.js` | scheduler/controller | Sequelize | calendar.scheduleevents | ⚠️ |

## 13. BRECHA — CRUDs pendientes

La API cubre bien el lado **Escuelapp** (`data`, `engine`, `contact`). El lado **SAE** (`public.tab*`, `logic`, `observador`, `preescolar`) está **casi sin implementar**. Según `Sae 2.0.xlsx`, faltan los siguientes módulos (con su tabla principal y de apoyo).

| # | Actividad (Sae 2.0) | Tabla principal | Tablas de apoyo | Prioridad |
|---|---|---|---|---|
| 2 | Gestión de cursos | `public.tabcurs` | tabgrad, tabjorn, tabanol, tabinst, tabinstsede | 🔴 Alta |
| 3 | Gestión de docentes (SAE) | `public.tabdoce` | tabinstdoce, tabcarg, tabtipodocu, tabtiposang, tabsexo | 🔴 Alta |
| 4 | Asignación académica (SAE) | `public.asigcurs` | tabcurs, tabdoce, tabasig, tabarea | 🔴 Alta |
| 5-7 | Gestión estudiantes (matrícula SAE) | `public.tabmatr` + `tabestu` | tabestuacud, tabestuotrodato, tabestusociecon, tabestagene | 🔴 Alta |
| 8 | Observaciones SAE | `public.tabnove` + `observador.*` | tabtiponove, tabresp, tabrespsub, tabrespobs | 🔴 Alta |
| 9 | Asistencias SAE | (complemento de agenda con pensum) | tabnove, anolperi | 🟡 Media |
| 10 | Calificaciones SAE | `public.tabnota` + `tabcompestu` | tabnotadef, tabnotahist, tabtiponota, tabeval, tabevalsub | 🔴 Alta |
| 11 | Promedios ponderados | `public.tabpromasig` + `tabpromo` + `tabpromdef` | tabareaconf, tabperival | 🟡 Media |
| 12 | Promociones | (generación masiva desde tabpromo) | tabmatr, tabcurs, tabestacurs | 🟡 Media |
| 13 | Configuración (años, periodos, escalas, resoluciones, certificados, constancias, ponderaciones) | `public.tabanol`, `anolperi`, `tabesca`, `tabescanaci`, `tabescacual`, `tabcerti`, `tabcons`, `tabpazsalv`, `tabfirm` | tabperi, tabperival | 🔴 Alta |
| 14 | Reportes (boletines, certificados, estadísticas) | (lecturas + export) | tabnota, tabmatr, tabcompestu | 🟡 Media |
| 15 | Pensum (áreas, intensidad horaria, asignaturas) | `public.tabarea`, `tabasig`, `tabareaconf`, `instarea` | tabcontprog, asigcurscontprog | 🔴 Alta |
| 16 | Ayuda | (tutoriales) | — | 🟢 Baja |
| 17 | Administración de usuarios (SAE) | `logic.tabusua`, `tabroll`, `tabunio` | tabopcimenu, tabrollopci | 🔴 Alta |
| 18 | Prematrícula | `data.aematriculas_*` | (ya parcial) | 🟡 Media |
| 19 | Indicadores de desempeño | `public.tabcomp` | asigcurscomp, tabcompestu, tablogcomp | 🔴 Alta |

### 13.1 Plan de implementación sugerido (orden)

1. **Catálogos SAE** (rápidos, sin dependencias): tabgrad, tabjorn, tabsexo, tabpare, tabtipodocu, tabtiponove, tabtiponota, tabtipodese, tabestagene, tabestr, tabsisb, tabzonaresi, tabmetoinst, tabespeinst, tabcarg, tabcapa, tabcara, tabdisc, tabconf, tabetni, tabresg, tabescanaci, tabescacual, tabtipovinc, tabfuenrecu, tabdepageog, tabciud, tabempr, tabicbf, tabestacurs, tabestagrad.
2. **Configuración institucional**: tabanol + anolperi + tabperi + tabperival → tabesca → tabcerti/tabcons/tabpazsalv/tabfirm → tabareaconf/sie.
3. **Núcleo académico**: tabcurs → tabasig/tabarea/pensum (instarea, tabcontprog, asigcurscontprog) → tabdoce + tabinstdoce → asigcurs → tabcomp (indicadores) + asigcurscomp.
4. **Estudiantes y matrícula**: tabestu → tabmatr (+ tabestuacud, tabestuotrodato, tabestusociecon) → tabmatrpago.
5. **Evaluación**: tabnota/tabcompestu → tabnotadef → tabpromdef/tabpromasig/tabpromo → promociones.
6. **Observador SAE** (observador.*): tabresp, tabrespsub, tabrespobs, tabrespeval, tabobsplan.
7. **Usuarios/roles SAE** (logic.*): tabmenu, tabopcimenu, tabroll, tabrollopci, tabusua, tabusuaopci, tabunio + avisos (tabavisroll, tabavisusua, avisrolldest).
8. **Reportes/exportables** y dashboards SAE.
9. **Preescolar** (preescolar.*) y **Ayuda**.

Cada módulo se crea siguiendo el patrón de carpeta (`controllers/<modulo>/<modulo>.routes.js` + `Controller.js` + `.sql.js`), se registra en `routes/index.js`, y el frontend lo consume con su ruta en `src/main/constants.js`.

## 14. Checklist para cada CRUD nuevo

- [ ] `controllers/<modulo>/<modulo>.sql.js` con INSERT/UPDATE/SELECT/DELETE-lógico (patrón PK: `COALESCE(MAX(id)+1, 1)`).
- [ ] `controllers/<modulo>/<modulo>Controller.js` con funciones `registrar/editar/borrar/listar`.
- [ ] `controllers/<modulo>/<modulo>.routes.js` con `Auth.isAuth` + guarda de rol correcta.
- [ ] Registrar el router en `routes/index.js`.
- [ ] `idregistro` ENCRIPTADO en listados; FKs CRUDAS en listados; `decriptar()` las FKs en `registrar`/`actualizar`.
- [ ] Respuesta `{status, statusCode, message, rows}`.
- [ ] Añadir la entrada en `src/main/crudConfig.js` del frontend (columns + fields).
- [ ] Registrar menú/opción en `logic.tabmenu`/`logic.tabopcimenu` + `logic.tabrollopci` (enlace `gestion/<entidad>` sin `/` inicial; `copcimenuicon` Font Awesome).

## 15. Estado actual de los CRUDs SAE (implementado)

Módulos nuevos (patrón de subcarpeta en `controllers/`), todos montados en `routes/index.js`:

| Módulo | Ruta API | Tablas |
|---|---|---|
| `catalogos/` | `/catalogos/:tabla/*` | CRUD genérico de ~33 catálogos SAE |
| `configuracion/` | `/configuracion/*` | tabesca, tabsie, tabcerti, tabcons, tabpazsalv, tabfirm |
| `institucion/` | `/institucion/*` | tabinst, tabinstsede |
| `anolperiodo/` | `/sae/*` | tabanol, tabperi, anolperi, tabperival |
| `cursos/` | `/sae/*` | tabcurs |
| `pensum/` | `/sae/*` | tabarea, tabasig, instarea, tabcontprog, asigcurscontprog, tabareaconf |
| `docentes/` | `/sae/*` | tabdoce, tabinstdoce, asigcurs |
| `estudiantes/` | `/sae/*` | tabestu, tabmatr, tabestuacud, tabestuotrodato, tabestusociecon, tabmatrpago |
| `indicadores/` | `/sae/*` | tabcomp, asigcurscomp |
| `notas/` | `/sae/*` | tabnota, tabcompestu, tabnotadef, tabpromdef, tabpromasig, tabpromo |
| `observador/` | `/sae/*` | observador.* (plan, tabresp, tabrespsub, tabrespobs, tabrespeval) |
| `usuariossae/` | `/sae/*` | logic.* + public.tabunio |
| `preescolar/` | `/preescolar/*` | preescolar.tabpreambi, tabpredime, tabpreasig, tabprenota, tabprenove |
| `estadisticassae/` | `/estadisticassae/*` | (solo lectura) matrícula total, por sexo, etnia y grado + resumen |
| **`integration/`** | `/integration/*` | **Integration Layer** (SAE → Escuelapp → Padre): adapters de identidad, eventos (asistencia/comunicado), enlaces seguros HMAC con expiración, registro de envíos (`data.aelog_envios`) y accesos (`estadistica.tabhistvis`) |
| Promoción masiva | `/sae/promover` | tabmatr (en `estudiantes` module) |

**Integration Layer (nuevo, EDD):**
- `controllers/integration/`: `tokens.js` (enlaces firmados HMAC), `dispatch.js` (mensaje + registro en `aelog_envios` + encolado no fatal), `integration.sql.js` (identidad acudiente→estudiante, READ_MODEL SAE, registro de acceso), `integrationController.js`, `integration.routes.js`.
- Rutas: `POST /integration/familia/mis-estudiantes`, `POST /integration/eventos/asistencia`, `POST /integration/eventos/comunicado`, `GET /integration/enlace/:token` (público; el token es la autorización).
- **Permisos DB** (modelo de propiedad): en la base local `adminit4_saeroot` tiene CRUD completo en `logic` (login, menús, privilegios) y en `data/engine/contact`; en `public/observador/preescolar` se opera con cuidado (SAE fuente maestra, lecturas y mutaciones puntuales). En producción el modelo de propiedad debe limitar `public/logic` a lectura salvo lo estrictamente necesario.
- Verificación EDD: `.agents/evals/consolidacion.md` (7/7 capability PASS, 2/3 regression + 1 WARNING).

Pendientes: boletines y certificados (PDF/export con formato), preescolar ya cubierto, ayuda.
