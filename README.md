# Escuelapp (Venus) — README del proyecto · backend `escuelappapi`

> Este repositorio (`escuelappapi`) aloja también la **documentación maestra del proyecto** (guía,
> modelo de datos), para que quede versionada en git: la carpeta superior `Venus/` **no** es un repo.

Integración de **SAE** (gestión escolar, PHP→Node) y **Escuelapp** (agenda escolar digital, Node/React)
en una sola aplicación web responsive con notificaciones por **WhatsApp**, sobre PostgreSQL (`bdsae2`).
`escuelappapi` es el **backend** (API REST) de ese sistema.

---

## Documentación principal

| Documento | Contenido |
|---|---|
| [`AGENTS.md`](AGENTS.md) | **Guía maestra**: objetivos, roles, mapa de subproyectos, arranque y convenciones. **Léela antes de codificar.** |
| [`BASE_DATOS.md`](BASE_DATOS.md) | Modelo completo de la base de datos `bdsae2`. |
| [`ARQUITECTURA.md`](ARQUITECTURA.md) | Arquitectura del backend (este repo). |
| [`../escuelappvenus/CATALOGO_CONTROLES.md`](../escuelappvenus/CATALOGO_CONTROLES.md) | Documento único de interfaz (controles React+HTML, widgets Atlantis, iconos, `react-hook-form`). **Léelo antes de construir/modificar la interfaz.** |

## Subproyectos (bajo `venus/`)

| Repo | Rol | Documento |
|---|---|---|
| `escuelappapi` (este) | Backend Node/Express | [`ARQUITECTURA.md`](ARQUITECTURA.md) |
| `escuelappvenus` | Frontend React 18 | [`../escuelappvenus/ARQUITECTURA.md`](../escuelappvenus/ARQUITECTURA.md) |
| `apibaileys` | API WhatsApp (Baileys + Bull/Redis) | [`../apibaileys/ARQUITECTURA.md`](../apibaileys/ARQUITECTURA.md) |

## Puesta en marcha rápida

Ver [`AGENTS.md`](AGENTS.md) §6. Backend: `npm install` → `cp .env.example .env` → `npm run devel`.
Frontend: `npm start` (3000). WhatsApp: `npm start` (4088). Requiere PostgreSQL (`bdsae2`) y Redis.

---

## Backend `escuelappapi`

API REST de **Escuelapp**: Node.js (ESM) + Express 4 + PostgreSQL (`bdsae2`). Gestiona los datos escolares,
la sesión de usuarios, reportes/exportables y las notificaciones (correo y WhatsApp), y expone los
endpoints que consume el frontend `escuelappvenus`.

### Instalación y ejecución

```bash
npm install
cp .env.example .env     # completar credenciales locales (PostgreSQL, JWT, correo, …)
npm run devel            # nodemon app.js   (o: npm run startcluster → appCluster.js)
```

Puerto: `PORT` del `.env` (CORS acepta `http://localhost:3000` y `http://localhost:4004`).

Requiere PostgreSQL con la base `bdsae2` restaurada. Ver credenciales de referencia en
[`AGENTS.md`](AGENTS.md) §7 y el modelo en [`BASE_DATOS.md`](BASE_DATOS.md).

### Convenciones clave

- Respuesta `{status, statusCode, message, rows}`.
- Borrado lógico (`UPDATE ... SET <estado> = <inactivo>`), nunca `DELETE`.
- PK con `COALESCE(MAX(<pk>)+1, 1)`; PK/FK encriptadas (base64url) en el transporte.
- Módulos nuevos: `controllers/<modulo>/` con `<modulo>.routes.js` + `<modulo>Controller.js` + `<modulo>.sql.js`.

Ver detalles, tabla de rutas, deuda técnica y "cómo agregar un módulo" en [`ARQUITECTURA.md`](ARQUITECTURA.md).

### Verificación

```bash
node --check app.js
node --check controllers/<modulo>/<modulo>Controller.js
```

---

## ⚠️ NOTA NO NEGOCIABLE PARA EL AGENTE CODER

> **Es OBLIGATORIO mantener actualizados los `.md` del proyecto después de CADA cambio o modificación**
> (`AGENTS.md`, `BASE_DATOS.md`, `ARQUITECTURA.md` de este repo, y el `ARQUITECTURA.md`/
> `CATALOGO_CONTROLES.md` del frontend cuando aplique).
> **Antes de construir o modificar la interfaz, lee
> [`../escuelappvenus/CATALOGO_CONTROLES.md`](../escuelappvenus/CATALOGO_CONTROLES.md).**
> Un cambio **no se considera terminado** hasta que la documentación refleje el estado real del código.
> Si afecta el modelo de datos, actualiza [`BASE_DATOS.md`](BASE_DATOS.md). Antes de cerrar cualquier
> tarea: corrige lo desactualizado y actualiza la fecha en el encabezado.
