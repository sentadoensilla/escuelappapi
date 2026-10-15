# ARQUITECTURA.md — `escuelappapi` (Backend Node/Express)

Guía de arquitectura del **backend** de Escuelapp (`escuelappapi`). Permite a cualquier agente de
programación comprender el código y continuar la codificación sin contexto previo.

**Última actualización:** _(fecha — actualizar tras cada cambio)_

---

## 0. Documentos relacionados

| Documento | Contenido |
|---|---|
| [`AGENTS.md`](AGENTS.md) | Guía maestra del proyecto (objetivos, roles, mapa, convenciones globales). |
| [`BASE_DATOS.md`](BASE_DATOS.md) | Modelo completo de `bdsae2` (esquemas, tablas, catálogos, PK/FK). |
| [`../escuelappvenus/ARQUITECTURA.md`](../escuelappvenus/ARQUITECTURA.md) | Frontend React que consume esta API. |
| [`../escuelappvenus/CATALOGO_CONTROLES.md`](../escuelappvenus/CATALOGO_CONTROLES.md) | **Documento único de interfaz** (controles, widgets, iconos). Léelo antes de construir/modificar la UI. |
| [`../apibaileys/ARQUITECTURA.md`](../apibaileys/ARQUITECTURA.md) | Servicio de envío de WhatsApp (colas + Baileys). |

---

## 1. Descripción y stack

Backend REST de **Escuelapp**: gestiona los datos escolares, la sesión de usuarios, reportes/exportables
y el disparo de notificaciones (correo y WhatsApp). Es el puente entre el frontend React y PostgreSQL
(`bdsae2`), y encola mensajes hacia `apibaileys`.

| Aspecto | Detalle |
|---|---|
| Runtime | Node.js, **ESM** (`"type": "module"`) |
| Framework | Express 4 |
| BD | PostgreSQL vía `pg` (Client), `pg-promise`, `pg.Pool` y `sequelize` (puntual) |
| Auth | JWT firmado con `jose` (HS256); guardas por rol en `middlware/jwtoken.js` |
| Correo | `nodemailer` |
| WhatsApp | `@whiskeysockets/baileys` (legacy) + encolado vía Bull/Redis |
| Realtime | `socket.io` (path `/communication`) |
| `name`/`version` | `escuelapp` / `1.2.1` (`package.json`) |

Scripts (`package.json`): `devel` → `nodemon app.js` (desarrollo), `startcluster` → `nodemon appCluster.js`,
`starter` → `forever start app.js` (producción). _(Ver deuda: `start`/`stop`/`stoper` están mal definidos.)_

---

## 2. Estructura de carpetas

```
escuelappapi/
├── app.js                 # arranque single-process
├── appCluster.js          # arranque cluster (sticky + Redis adapter)
├── controllers/           # (a) carpetas <modulo>/ y (b) controladores planos legacy
├── routes/                # enrutadores legacy + index.js que monta todo
├── database/              # conex.js (Client), conexpool.js (Sequelize), pgpromise.js
├── middlware/             # jwtoken.js (isAuth + guardas), uploadImages.js (Multer), file.js
├── utils/                 # token.js, datasource.js, notifications/, queues/, exports/, etc.
├── scheduler/             # CRUD de eventos de calendario (Sequelize, esquema calendar)
├── sql/                   # sentencias SQL de controladores legacy
├── scripts/               # utilidades de mantenimiento (menú, migración de claves)
├── test/                  # scripts sueltos (NO son tests automatizados)
├── public/                # archivos estáticos servidos (ignorado por git)
└── plantilla/             # plantillas de importación (ignorado por git)
```

---

## 3. Arranque del servidor

### `app.js` (single process)
1. `dotenv.config()`; `const app = express()`; `PORT = process.env.PORT`.
2. **CORS** (`corsOpts`): allow-list `http://localhost:3000`, `http://localhost:4004`,
   `colarqui.edu.co`, `test.colarqui.edu.co`, `escuelapp.co`, `colegiosarquidiocesanos.edu.co` **y `'*'`**,
   `credentials:true`, métodos `PUT/GET/POST/DELETE/HEAD/OPTIONS` → responde `204` al preflight.
3. **Middleware**: `cors`, `express.urlencoded`, `express.json`, `body-parser`, `express-useragent`.
   No hay `helmet`, ni rate-limiter, ni logger.
4. **Rutas**: `app.use('/', indexrouter)` + una serie de `express.static` en `/p`, `/p/t`, `/p/w`, `/p/c`,
   `/p/ex`, `/p/i`, `/p/d/m`, `/p/cl`, `/public` (cada una apunta a un subdirectorio de `public/`).
5. **Socket.IO** en path `/communication` (CORS `corsOpts`); eventos de WhatsApp por institución
   (`givemewplist`, `connectnamba`, `disconnect`) delegados a `utils/notifications/whatsapp/wpRomote.js`.
6. `httpServer.listen(PORT, "0.0.0.0", ...)`.

> **Seguridad pendiente:** `'*'` junto a `credentials:true`; `app.js` imprime en el log claves de prueba
> cifradas al arrancar; no hay manejador central de errores.

### `appCluster.js`
Variante multicore: usa `sticky.listen()` para repartir workers, adapter Redis de Socket.IO (host/port
hardcodeados) y CORS con primer origen `localhost:8080`. La lógica de rutas/middleware es equivalente.

---

## 4. Rutas (`routes/index.js`)

`routes/index.js` importa todos los enrutadores y los monta. Conviven:
- **Enrutadores legacy** en `routes/*.js` (controladores planos + `sql/*.js`).
- **Enrutadores de módulo** importados directamente desde `controllers/<modulo>/<modulo>.routes.js`.

| Base path | Módulo / controlador | Notas |
|---|---|---|
| `/users` | `routes/users.js` → `AuthController`, `changePassword` | login, reset |
| `/teachers`, `/students` | `TeacherController`, `StudentsControllers`, `DocenteMasivo` | legacy |
| `/asignments` | `horarioController` | horarios |
| `/academic` | `AcademicController(+Export)` | exámenes/tareas |
| `/attendance` | `asistenciasController(+Export)`, `AcademicControllerAdmin` | |
| `/alerts`, `/request`, `/comms`, `/data`, `/show`, `/genesis`, `/emisor`, `/estadisticas`, `/totals`, `/anolectivo` | varios controllers legacy | |
| `/menu` | `controllers/menu/menu.routes.js` | |
| `/areas`, `/citaciones`, `/observer` | legacy | |
| `/calendar` | `scheduler/controllers/scheduler.controller.js` | Sequelize |
| `/catalogos` | `controllers/catalogos/` | **CRUD genérico** por tabla |
| `/tipodesempeno`, `/configuracion`, `/institucion`, `/preescolar`, `/estadisticassae`, `/integration`, `/avisos`, `/pqrs`, `/configapp`, `/templates`, `/migracion` | carpetas de módulo | |
| `/sae` | **11 módulos** (`anolperiodo`, `cursos`, `pensum`, `docentes`, `estudiantes`, `indicadores`, `notas`, `observador`, `usuariossae`, `novedades`, `disciplina`) | todos bajo el mismo prefijo `/sae/<recurso>/<accion>` |

> Casi todas las operaciones son **POST** (incluidas lecturas); algunas rutas legacy usan GET.
> `routes/routes.js` **no** es un enrutador: es un mapa de constantes de rutas para el frontend, usado
> solo por `TotalController.js`.

---

## 5. Patrón de controladores (arquitectura por capas)

Coexisten dos estilos:

### A) Módulos por carpeta (estándar nuevo) — 24 carpetas
`anolperiodo, avisos, catalogos, configapp, configuracion, cursos, disciplina, docentes, estadisticassae,
estudiantes, indicadores, institucion, integration, menu, migracion, notas, novedades, observador, pensum,
pqrs, preescolar, templates, tipodesempeno, usuariossae`.

Cada carpeta contiene:
- `<modulo>.routes.js` — `express.Router()`, rutas + guardas `[Auth.isAuth, Auth.<guarda>]` + `upload.<x>`.
- `<modulo>Controller.js` — handlers; validan, **decriptan** entradas, ejecutan SQL, **encriptan** PKs de
  salida y responden `{status, statusCode, message, rows}`.
- `<modulo>.sql.js` — sentencias SQL parametrizadas (`$1, $2, ...`).

**Ejemplo de referencia — `controllers/estudiantes/`**:
- `estudiantes.routes.js`: 6 sub-recursos con `listar/registrar/actualizar/borrar` (borrar = lógico) + `promover`.
- `estudiantesController.js`: 19 handlers; `ESTADO_INACTIVO = 9`; encripta `idregistro` de cada fila.
- `estudiantes.sql.js`: 20 sentencias sobre `public.tabestu, tabmatr, tabestuacud, tabestuotrodato,
  tabestusociecon, tabmatrpago`; PK con `COALESCE(MAX(<pk>)+1,1)` y alias `idregistro`.

Casos especiales: `controllers/menu/` importa `../menuController.js` (plano) — hay **controlador duplicado**;
`controllers/catalogos/` es un motor genérico dirigido por un mapa declarativo en `catalogos.sql.js`;
`controllers/integration/` añade `dispatch.js` (encolado) y `tokens.js` (enlaces firmados).

### B) Controladores planos (legacy) — 27 archivos
`AcademicController*, AlertsController*, AreasController, AsistenciasControllerExport, AuthController,
CitacionesController, DatosGeneralesController, DocenteMasivo, EmisorController, MatriculasController,
ObservadorController, StatisticsController, StudentsControllers, TeacherController, TotalController,
anolectivoController, asistenciasController, changePassword, comunicationController, generalData,
horarioController, linkables, menuController, pusher`. El SQL de varios de ellos vive en `sql/*.js`.

### Flujo por capas
```
routes/<x>.js  ó  controllers/<modulo>/<modulo>.routes.js   (path + guards + multer)
        ▼
<...>Controller.js   (validar → token.decriptar entradas → Db.query → token.encriptar salidas)
        ▼
<modulo>.sql.js  ó  sql/<x>.js   (SQL parametrizado)
```

---

## 6. Acceso a datos

Conviven **cuatro** mecanismos; el estándar nuevo es Client/Pool:

| Archivo | Tipo | Usado por |
|---|---|---|
| `database/conex.js` | `pg.Client` singleton (dev, `ssl:false`; prod SSL comentado) | **casi todos los controladores** |
| `utils/datasource.js` | `pg.Pool` (config en `utils/datasourceConst.js`) | `utils/token.js`, `utils/queues/*`, `utils/notifications/whatsapp/*` |
| `database/conexpool.js` | **Sequelize** (registra el modelo `scheduler`) | `scheduler/` (calendario) |
| `database/pgpromise.js` | `pg-promise` (connection string) | `AcademicController`, `CitacionesController`, `TotalController`, `changePassword` |

---

## 7. Utilidades (`utils/`)

- **`token.js`** (352 líneas) — helper central:
  - `createtoken(sub)` / `verifyToken(token)`: JWT con `jose` (HS256, secreto `JWT_PRIVATE_key`, 8 h).
  - `encriptar(text)` / `decriptar(text)`: **base64url reversible** (enmascaramiento, no criptografía).
    `decriptar` tolera base64 estándar legacy y texto plano.
  - `encriptarHash` (md5), `encryptBuffer/decryptBuffer` (crypto legacy), `paginate`, `randomString`,
    `validEmail`, `sleep`, `ahora`, `chunk`, `postMessage` (axios a `WP_API_BACKEND`), `notificationSave/Show`.
  - `logsteps()` es un **no-op** (auditoría de dispositivos deshabilitada).
- **`datasource.js` / `datasourceConst.js`** — `pg.Pool` (`max:50`).
- **`buttons.js` / `textos.js`** — generadores de HTML para correos (botón CTA, encabezado/pie).
- **`encrypassword.js`** — wrapper de `cryptr` (clave hardcodeada) para enlaces de reset.
- **`passworGenearte.js`** — genera clave aleatoria de 9 caracteres.
- **`webpush.js`** — configuración de `web-push` (VAPID).
- **`exports/excel.js`** — exportables con ExcelJS (`spreadSheetStyles.js`).
- **`notifications/mail/`** — plantillas nodemailer: `alerta`, `welcome`, `inscripcion`, `resetPassword`.
- **`notifications/push/`** — FCM (`firebase-admin`); requiere un service-account JSON gitignored (ausente).
- **`notifications/whatsapp/`** — `wpBaileys.js`, `wpRomote.js` (cliente "emisor remoto" grande) — **legacy**,
  con buena parte del código comentado y funciones referenciadas que ya no existen.
- **`notifications/socket.io/mySockets.js`** — holder global de `io`.
- **`queues/`** — sistema de colas Bull (`parallelQueue.js`, `redis.js`, `process/`). **Dormido/roto**: ver §14.

> No existe `utils/cron.js`; `node-cron` está declarado pero no se importa.

---

## 8. Middleware (`middlware/`, con typo en el nombre)

- **`jwtoken.js`**:
  - `isAuth`: exige `Authorization: Bearer <jwt>`, verifica con `token.verifyToken`, setea `req.user`.
  - Guardas por rol (decriptan `req.user.usuarioRollId`): `estudiante`, `Admin_academico`, `Admin`,
    `isTeacher`, `isAcudient`, `isDirector_and_tecaher`, `isAcudiente_and_estudiante(_and_institucion)`,
    `isAcademico_and_estudiante_and_teacher`, `isDirector_and_tecaher_and_admin`.
  - `registrarPaso` (auditoría) es inútil porque `logsteps` es no-op; `notAuth` está roto.
- **`uploadImages.js`** — 8 instancias de **Multer** (`upload`, `uploadAll`, `uploadPath`, `uploadResponse`,
  `uploadAlert`, `uploadExcusa`, `uploadInscripcion`, `uploadCrono`); destino según empresa del usuario.
- **`file.js`** — modelo Mongoose legacy (Mongo no se usa realmente).

---

## 9. `scheduler/` — Calendario (Sequelize)

**No** es un planificador de tareas: es un **CRUD de eventos de calendario**.
- `scheduler/models/model.js`: `sequelize.define("scheduleevents", {...}, {schema:'calendar'})`.
- `scheduler/controllers/scheduler.controller.js`: `getData` y `crudActions` (`added/changed/deleted`).
- Montado en `routes/scheduler.js` → `POST /calendar/getData`, `POST /calendar/crudActions`.

---

## 10. `sql/` y `scripts/`

- **`sql/`** — SQL de controladores legacy: `academics, alerts, alertsPlus, anolectivo, areas, asistencias,
  authsql, citaciones, comms, datosGenerales, exams, horarios, matricula, menu, observaciones, statistical,
  students, teachers, total, whatsapp`. `sql/authsql.js` contiene el login y la consulta **`privilegees`**
  (menú/privilegios, equivalente al `get_keys()` de SAE).
- **`scripts/`**:
  - `sync_logic_menu.js` — actualiza `logic.tabopcimenu` (ruta React sin `/` y clase de ícono) para ~90
    opciones; además resetea claves de prueba. Ejecutar: `node scripts/sync_logic_menu.js`.
  - `register_menu.js` — registra una opción de menú en `engine.aemenu/aeopcmenu/aerollopc` por CLI.
  - `migrar_cusuallave_base64url.js` — normaliza `logic.tabusua.cusuallave` a base64url (dry-run; `--apply`).

---

## 11. Convenciones

1. **Respuesta**: `{status, statusCode, message, rows}`. Éxito `status:'success'`, `rows` con datos; sin
   resultados `status:'error'`, `statusCode:400`, `message:'0 Resultados encontrados'`. Casi todo se
   responde con HTTP 200 vía `res.send(...)` (solo las guardas usan `res.status(401)`).
2. **Borrado lógico**: `UPDATE ... SET <estado> = <inactivo>` (`9`, `0`, `2` según tabla). Nunca `DELETE`.
3. **PK**: `INSERT ... VALUES ((SELECT COALESCE(MAX(<pk>)+1, 1) FROM <tabla>), ...)`. Sin secuencias.
4. **PK/FK**: PK (`idregistro`) encriptada (base64url) en la respuesta; FKs crudas (el front las enmascara).
   Las claves SAE legacy están en **doble base64**; `AuthController` acepta plano/base64/doble/base64url.
5. **Menú/privilegios**: se lee en el login (`privilegees`) desde `logic.tabmenu/tabopcimenu/tabrollopci/
   tabusuaopci/tabroll`. `enlace` = ruta React sin `/` inicial.

---

## 12. Variables de entorno (`.env.example`)

`PORT, HOST, NODE_ENV, APP_KEY, APP_API_NAME, APP_API_FRONT, APP_API_BACKEND, DB_CONNECTION`,
`PG_HOST, PG_PORT, PG_DB_NAME, PG_USER, PG_PASSWORD, PG_DIALECT, POOL_MAX, POOL_MIN, POOL_ACQUIRE, POOL_IDLE`,
`PG_CERT, PG_CERT_KEY, PG_CERT_CA` (prod), `JWT_PRIVATE_key`,
`APP_WP_SESSION_PATH, APP_WP_SESSION_RELATIVE_PATH, APP_WP_CUSTOMERS, APP_WP_NUMBERTEST`,
`MAIL_HOST, MAIL_PORT, MAIL_SECURE, MAIL_USER, MAIL_PASS`, `MONGODB_URI*`.

Referenciadas en código pero fuera del `.env.example`: `REDIS_*`, `WP_API_BACKEND`, `INTEGRATION_SECRET`,
`APP_PATH`, `QUEUE_CONCURRENT_PARALLEL`, `FIREBASE_*`, `PUBLIC_KEY_PVID`, `PRIVATE_KEY_PVID`, `MAIL_SENDER_*`.

---

## 13. Tests

**No hay tests automatizados** (no hay script `test`, ni config de Jest, ni archivos `.test.js`). La carpeta
`test/` solo contiene scripts sueltos (`pruebas.js`, `passwordEncrypt.js`). Ejecutar manualmente con
`node test/<archivo>.js`.

---

## 14. Deuda técnica e inconsistencias (importante para el próximo agente)

- **Scripts npm** incompletos/erróneos: `start` corre `nodemon`; `stop`/`whatsapp-web.js`/`stoper` mal definidos.
- **Dependencias no declaradas** usadas en código: `bull`, `ioredis`, `firebase-admin`, `web-push`, `pino`,
  `@hapi/boom`, `debug`. Fallan al importar si no están instaladas.
- **Colas dormidas/rotas**: `utils/queues/index.js` no se importa en ningún lado, usa `require` en ESM y
  rutas al datasource equivocadas; `process/parallelQueueProcessor.js` importa archivos inexistentes.
- **Sin `cron.js`**: `node-cron` declarado pero sin uso; el envío real de WhatsApp vive en `apibaileys`.
- **Cuatro capas de acceso a BD** coexistentes (ver §6).
- **Sin manejo central de errores**; cada controlador arma su try/catch y suele responder HTTP 200 en error.
  `AuthController` usa la clave `StatusCode` (S mayúscula) y `statusCode:201`.
- **Controlador de menú duplicado** (`controllers/menu/menuController.js` vs `../menuController.js`).
- **Rutas sin guarda**: `/anolectivo/listado|listadoroles|registrarroles` y todo `tipodesempeno/*`.
- **Secretos hardcodeados**: clave de `crypto` en `token.js`, `'cifrado_key'` en `encrypassword.js`,
  secreto de `integration/tokens.js`, host Redis en `appCluster.js`.
- **Firebase push** inutilizable (falta el JSON de service-account).
- **Código legado roto**: `menuController.menuInsert`, `resetPassword.js`, `wpRomote.js`, `passworGenearte.js`.

---

## 15. Cómo agregar un módulo nuevo

1. Crear `controllers/<modulo>/` con `<modulo>.routes.js`, `<modulo>Controller.js`, `<modulo>.sql.js`.
2. **SQL**: queries parametrizadas; PK aliasada a `idregistro`, estado a `idestado`; insert con
   `COALESCE(MAX(<pk>)+1,1)`; borrado lógico con `UPDATE ... SET <estado>=<inactivo>`.
3. **Controller**: `import Db from "../../database/conex.js"`, `import token from "../../utils/token.js"`,
   `import sql from "./<modulo>.sql.js"`. Decriptar entradas, encriptar `idregistro` de salida, responder
   `{status, statusCode, message, rows}` en try/catch. Exportar handlers y objeto default.
4. **Router**: `express.Router()`; `import Auth from "../../middlware/jwtoken.js"`; registrar rutas con
   `[Auth.isAuth, Auth.<guarda>]` y `upload.none()` cuando no hay archivos. Lecturas:
   `isDirector_and_tecaher_and_admin`; escrituras: `Admin_academico` (o `Admin`).
5. **Montar** en `routes/index.js` (import + `router.use('/<base>', modulo)`); para SAE usar `'/sae'`.
6. **Menú**: registrar la opción en la BD (`scripts/register_menu.js` para `engine`, o actualizar
   `logic.tabopcimenu` con la ruta React **sin** `/` inicial, como en `scripts/sync_logic_menu.js`).
7. **`.env`**: si agregas variables, documéntalas en `.env.example`. No introduzcas imports no declarados.
8. **Verificar** con `node --check controllers/<modulo>/<modulo>Controller.js`.

---

## 16. Verificación rápida

```bash
node --check controllers/<modulo>/<modulo>Controller.js
node --check app.js
```

---

## ⚠️ NOTA NO NEGOCIABLE PARA EL AGENTE CODER

> **Es OBLIGATORIO actualizar este archivo `ARQUITECTURA.md` después de CADA cambio o modificación** en
> este repositorio (nuevos módulos, rutas, controladores, SQL, dependencias, variables de entorno,
> convenciones, etc.).
> Un cambio **no se considera terminado** hasta que este documento refleje el estado real del código.
> Si el cambio afecta el modelo de datos, actualiza también [`BASE_DATOS.md`](BASE_DATOS.md);
> si cambia algo global, [`AGENTS.md`](AGENTS.md). Antes de cerrar cualquier tarea: corrige lo
> desactualizado y actualiza la fecha en el encabezado.
