# AGENTS.md — Guía maestra del proyecto Escuelapp (Venus)

Guía de referencia para agentes de programación y desarrolladores. Explica **qué** es el proyecto,
**cómo está organizado**, **cómo se levanta** y **qué convenciones** seguir para seguir codificando.

**Última actualización:** _(fecha — actualizar tras cada cambio)_

---

## 1. ¿Qué es Escuelapp?

Integración de **dos** sistemas en una sola aplicación **NodeJS + ReactJS** (backend + frontend),
web responsive y con notificaciones por **WhatsApp**:

| Sistema | Origen | Propósito |
|---|---|---|
| **SAE** — Sistema de Administración Educativa | PHP (legacy) | Gestión escolar para docentes y secretarias: matrícula, notas, observador, boletines, promoción, nómina. |
| **Escuelapp** — Agenda Escolar Digital | Node/React | Comunicación diaria con padres y estudiantes vía WhatsApp: avisos, asistencias, tareas, evaluaciones, excusas, PQRS. |

La aplicación resultante se llama **Escuelapp** y comparte una única base de datos PostgreSQL: **`bdsae2`**.

### Actores y roles

- **Colegio / Institución** — dueño de la cuenta; gestiona docentes, estudiantes y acudientes; pre-matrículas; registros institucionales.
- **Docentes** — registran notas, asistencias y observaciones; disparan notificaciones (WhatsApp/correo).
- **Estudiantes** — reciben y consultan registros académicos y de convivencia; se comparan con su grupo.
- **Padres / Acudientes** — reciben notificaciones; realizan pre-matrículas; consultan dashboards académicos y de convivencia.

Roles técnicos del menú SAE (`logic.tabroll`): `0` Admin · `1` Estudiante · `2` Docente · `3` Institución ·
`4` Acudiente · `5` Demo · `6` Coordinador · `7` Secretaría. Equivalencia Escuelapp (`engine.aeroll` 201–208).

---

## 2. Mapa de subproyectos y documentación

El código real vive en **`venus/`**. Cada subcarpeta es un **repositorio git independiente**.

> **Estos documentos (`AGENTS.md`, [`BASE_DATOS.md`](BASE_DATOS.md)) viven en el repo `escuelappapi`**
> para que queden versionados, ya que la carpeta superior `Venus/` no es un repositorio git.

| Carpeta | Repo | Rol | Documento detallado |
|---|---|---|---|
| `venus/escuelappapi` | `escuelappapi` (privado) | Backend Node/Express + acceso a PostgreSQL | [`ARQUITECTURA.md`](ARQUITECTURA.md) |
| `venus/escuelappvenus` | `escuelappvenus` (privado) | Frontend React 18 (CRA) | [`../escuelappvenus/ARQUITECTURA.md`](../escuelappvenus/ARQUITECTURA.md) |
| `venus/apibaileys` | `apibaileys` (privado, requiere ser colaborador) | API de WhatsApp multi-cuenta (Baileys + Bull/Redis) | [`../apibaileys/ARQUITECTURA.md`](../apibaileys/ARQUITECTURA.md) |
| — | — | Base de datos `bdsae2` | [`BASE_DATOS.md`](BASE_DATOS.md) |

**Documento único de interfaz** del frontend (controles React+HTML, widgets de Atlantis y mapeo de iconos
FontAwesome → Bootstrap Icons):
[`../escuelappvenus/CATALOGO_CONTROLES.md`](../escuelappvenus/CATALOGO_CONTROLES.md).
> **Obligatorio:** léelo antes de construir o modificar cualquier vista, formulario, control o widget.

---

## 3. Estructura de carpetas (raíz `Venus/`)

```
Venus/                         # carpeta de trabajo (NO es un repo git)
├── venus/                     # ── CÓDIGO REAL (3 repos git) ──
│   ├── README.md              # instrucciones de clonado
│   ├── escuelappapi/          #   Backend Node/Express  ← aquí viven AGENTS.md y BASE_DATOS.md
│   │   ├── AGENTS.md          #     este documento (guía maestra)
│   │   ├── BASE_DATOS.md      #     modelo completo de bdsae2
│   │   ├── ARQUITECTURA.md    #     arquitectura del backend
│   │   └── README.md          #     índice del repo/proyecto
│   ├── escuelappvenus/        #   Frontend React (ARQUITECTURA.md, CATALOGO_CONTROLES.md, README.md)
│   └── apibaileys/            #   API WhatsApp (ARQUITECTURA.md, README.md)
├── atlantis/                  # plantilla HTML/JS base (referencia de diseño)
├── disenhos/                  # diseños y recursos gráficos
├── EJEMPLOS/, Imagenes varias/, scripts/   # material de apoyo
├── api-backup-local/          # respaldos locales (NO es código activo)
├── venus-backup-local/        # respaldos locales (NO es código activo)
└── *.tar.bz2, *.xlsx, *.pptx, *.sql ...     # respaldos y documentos sueltos
```

> **Nota:** `api-backup-local/`, `venus-backup-local/`, `atlantis/`, los `.tar.bz2` y documentos sueltos
> **no forman parte del código activo**; no se documentan ni modifican salvo indicación expresa.
> Los `.md` de proyecto (esta guía y [`BASE_DATOS.md`](BASE_DATOS.md)) se ubican dentro de `escuelappapi`
> para que **se versionen en git**.

---

## 4. Arquitectura general y flujo de datos

```
                       ┌──────────────────────────────┐
   Navegador  ──HTTP──▶ │  escuelappvenus (React 18)   │
   (responsive)        │  CRUD genérico /gestion/:e   │
                       └───────────────┬──────────────┘
                                       │ fetch (messenger.poster)
                                       │ Authorization: Bearer <jwt>
                                       ▼
                       ┌──────────────────────────────┐        ┌───────────────────┐
                       │  escuelappapi (Express)      │──SQL──▶│ PostgreSQL bdsae2 │
                       │  controllers/<modulo>/       │◀───────│ (12 esquemas)     │
                       └───────┬──────────────┬───────┘        └───────────────────┘
                               │              │ encola job (Bull)
             nodemailer (mail) │              ▼
                               │     ┌──────────────────────────────┐
                               │     │  apibaileys (Baileys + Redis) │──▶ WhatsApp
                               └────▶│  sesiones = "campana-<id>-<n>"│
                                     └──────────────────────────────┘
```

- **Frontend** consume la API vía `messenger.poster` → `REACT_APP_BACKEND_URL`.
- **Backend** valida, consulta PostgreSQL y responde `{status, statusCode, message, rows}`.
- **Notificaciones WhatsApp**: el backend (o el cron de `apibaileys`) encola mensajes; `apibaileys` los
  envía con Baileys respetando *rate limit* y actualiza `data.log_envios`.
- **Menú dinámico**: el login devuelve el árbol de menú/privilegios desde `logic` (SAE) / `engine`
  (Escuelapp); el frontend mapea cada `enlace` a una ruta React.

---

## 5. Stack

| Capa | Tecnología |
|---|---|
| Backend | Node.js (ESM), Express 4, PostgreSQL (`pg`, `pg-promise`, Sequelize puntual) |
| Frontend | React 18, react-router-dom 6, react-hook-form 7, Bootstrap 5.3 + Bootstrap Icons + plantilla Atlantis, ECharts |
| WhatsApp | `@whiskeysockets/baileys`, Bull + Redis (`ioredis`), `qrcode` |
| Correo | Nodemailer |
| Base de datos | PostgreSQL — una sola BD `bdsae2`, 12 esquemas (ver [`BASE_DATOS.md`](BASE_DATOS.md)) |

---

## 6. Cómo levantar el proyecto (local)

```bash
# 1) Backend
git clone https://github.com/sentadoensilla/escuelappapi.git
cd escuelappapi && npm install
cp .env.example .env      # completar credenciales locales
npm run devel             # nodemon app.js

# 2) Frontend (otra terminal)
git clone https://github.com/sentadoensilla/escuelappvenus.git
cd escuelappvenus && npm install
cp .env.example .env      # REACT_APP_BACKEND_URL apuntando al backend
npm start                 # react-scripts → http://localhost:3000

# 3) API WhatsApp (otra terminal) — repo PRIVADO: primero ser colaborador
git clone https://github.com/sentadoensilla/apibaileys.git
cd apibaileys && npm install
# configurar .env (PostgreSQL + Redis) y levantar
npm start                 # → http://localhost:4088
```

Requisitos de entorno: **PostgreSQL** con la BD `bdsae2` restaurada y **Redis** (para las colas de `apibaileys`).

---

## 7. Conexiones y credenciales

> Las credenciales reales se toman de los `.env` de cada repo (no versionados). Referencia:

| Recurso | Valor de referencia |
|---|---|
| PostgreSQL (dev) | `PG_HOST=localhost` `PG_PORT=5432` `PG_DB_NAME=bdsae2` `PG_USER=adminit4_saeroot` `PG_PASSWORD=*HelpDesk/F1*` |
| Redis (colas) | `REDIS_HOST` / `REDIS_PORT` / `REDIS_PASSWORD` (en `.env` de `apibaileys`) |
| Correo | `MAIL_HOST=mail.misvotos.com` `MAIL_PORT=587` `MAIL_USER=soporte@misvotos.com` |
| Serve de pruebas | `SYS_SSH_HOST=185.211.4.225:2321` (usuario `root`) |

Puertos habituales: frontend **3000**, backend según `PORT` del `.env` (CORS acepta `3000` y `4004`),
`apibaileys` **4088**, API maestra **4008**.

---

## 8. Convenciones globales (aplican a todo el proyecto)

1. **Contrato de respuesta API** — los controladores responden
   `{status, statusCode, message, rows}`. Éxito: `status:'success'`, `rows` con datos. Sin resultados:
   `status:'error'`, `statusCode:400`, `message:'0 Resultados encontrados'`, `rows:{}` o `[]`.
   El frontend valida `statusCode === 200` y que `rows` tenga contenido real.
2. **Borrado lógico** — **nunca** `DELETE`. Se hace `UPDATE ... SET <estado> = <inactivo>`
   (`9`/`0`/`2` según tabla). Se conservan los históricos.
3. **Claves primarias** — patrón `COALESCE(MAX(<pk>) + 1, 1)` en los `INSERT` (no se usan secuencias).
   Nunca se reutilizan IDs.
4. **Encriptación PK/FK** — la PK (`idregistro`) viaja **encriptada** (base64url, doble capa) y se
   reenvía tal cual; las FK viajan **crudas** y el frontend las enmascara con `tool.encriptar()`.
   Backend: `token.encriptar` / `token.decriptar`.
5. **Módulos backend** — cada módulo es `controllers/<modulo>/` con
   `<modulo>.routes.js` + `<modulo>Controller.js` + `<modulo>.sql.js`, montado en `routes/index.js`.
6. **Menú dinámico** — para que un módulo aparezca en el sidebar debe registrarse en la BD
   (`logic.tabmenu`/`tabopcimenu`/`tabrollopci`; o `engine.aemenu`/`aeopcmenu`/`aerollopc`). El `enlace`
   es la ruta React **sin** `/` inicial (p. ej. `gestion/cursos`).
7. **Fechas y estados** — se formatean en el **frontend** (`tool.soloFecha()`, `tool.estadoGeneral()`),
   no en la API. Estados generales: `public.tabestagene` (8 = Activo, 9 = Inactivo).
8. **Estilo** — código limpio y modular, camelCase, `async/await` (sin callbacks), responsive
   mobile-first, y comentarios útiles. Plantilla visual base: `atlantis/`.

---

## 9. Estado actual y deuda conocida (resumen)

- La migración **SAE (PHP) → React** está **en curso**; conviven módulos nuevos (patrón `controllers/<modulo>/`)
  y legacy (controladores planos + `sql/*.js`).
- En el backend coexisten **4 mecanismos de acceso a BD** (Client de `database/conex.js`, Pool de
  `utils/datasource.js`, Sequelize del calendario y `pg-promise` legacy). El estándar nuevo es el Client/Pool.
- El subsistema de **colas del backend** (`utils/queues/`) está **dormido/roto**; el envío real de WhatsApp
  hoy está centralizado en `apibaileys`.
- El frontend conserva **archivos por defecto de CRA**, dependencias sin usar y algunas rutas/páginas
  huérfanas (ver deuda detallada en cada `ARQUITECTURA.md`).
- Detalle por repo en cada `ARQUITECTURA.md`; detalle de datos en [`BASE_DATOS.md`](BASE_DATOS.md).

---

## 10. Verificación rápida

> Rutas relativas desde `venus/` (la carpeta que contiene los 3 repos).

```bash
# Backend: chequeo de sintaxis de un módulo
node --check escuelappapi/controllers/<modulo>/<modulo>Controller.js

# Frontend: parsear un archivo JSX
node -e "require('@babel/parser').parse(require('fs').readFileSync('escuelappvenus/src/...','utf8'),{sourceType:'module',plugins:['jsx']})"

# BD: comprobar conexión
psql -h localhost -U adminit4_saeroot -d bdsae2 -c '\dn'
```

---

## ⚠️ NOTA NO NEGOCIABLE PARA EL AGENTE CODER

> **Es OBLIGATORIO actualizar este archivo `AGENTS.md` después de CADA cambio o modificación** en el
> proyecto (nuevos módulos, rutas, dependencias, convenciones, scripts, puertos, variables de entorno,
> etc.).
> Un cambio **no se considera terminado** hasta que este documento (y el `ARQUITECTURA.md` del repo
> afectado, y [`BASE_DATOS.md`](BASE_DATOS.md) si aplica) refleje el estado real del código. Antes de
> cerrar cualquier tarea: corrige lo desactualizado y actualiza la fecha en el encabezado.
