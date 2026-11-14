# Integración de WhatsApp en Escuelapp — Diseño (FASE 2)

Documento de diseño de la integración multiinstitucional de WhatsApp. Complementa la guía maestra
[`AGENTS.md`](AGENTS.md) y el modelo [`BASE_DATOS.md`](BASE_DATOS.md).

**Rama:** `integrar_whatsapp` (en `escuelappapi`, `escuelappvenus` y `apibaileys`).

---

## 1. Arquitectura

Se conserva el patrón *outbox* de misvotos.com, adaptado a multiinstitución:

```
escuelappapi (Express)  ──INSERT──▶  data.aelog_envios  (status='pending')
   │  valida pre-envío: destinatario válido, institución, consentimiento vigente,
   │  emisor activo, sesión disponible, tipo autorizado.  Rechaza con motivo.
   ▼
apibaileys (gateway)  ──cron 2 min (FOR UPDATE SKIP LOCKED)──▶  Bull "whatsapp"  ──▶  Baileys
   │  velocidad desde contact.emisor_config · reintentos (5, backoff 30s) · auto-pausa 408/429
   ▼
data.aelog_envios (status=sent|failed, attempts++, last_error)
```

- **Frontend** consume `escuelappapi` (nunca PostgreSQL directamente).
- **Identidad/alcance**: la API deriva la institución (`idempresa`) del JWT autenticado y sus privilegios
  (rol `Administrador` global; rol `Institucion` solo su propio `idempresa`). No se confía en el `id` del frontend.
- **apibaileys** es el único que conecta con Baileys/WhatsApp y Redis; `escuelappapi` solo persiste el outbox.

---

## 2. Modelo de datos (delta)

Esquema `contact` = infraestructura WhatsApp. `data` = outbox. Todo es **aditivo y reversible**
(migración en `sql/migrations/001_whatsapp_integracion.sql`; rollback en `...rollback.sql`).

### 2.1 Nuevas tablas (`contact`)

| Tabla | Propósito | Claves / columnas relevantes |
|---|---|---|
| `sessions_status` | Catálogo de estado de sesión | `code` PK: 1 waiting_qr, 2 qr_generated, 3 scanning, 4 connected, 5 disconnected, 6 logged_out, 7 error |
| `sessions` | Estado persistido de cada sesión Baileys | `id` PK (=número), `idempresa`, `status`→sessions_status, `device_name`, `phone_number`, `last_qr`, `last_error`, `created_at`, `updated_at` |
| `whatsapp_auth` | Credenciales Baileys (auth state) | `session_id`+`key` PK, `value` (JSON/BufferJSON) |
| `emisor_config` | Velocidad y control por emisor | `idemisor` PK→emisor, `idempresa`, `base_delay`, `jitter`, `burst_limit`, `burst_pause`, `concurrency`, `paused`, `stopped`, `modo_prueba`, `test_phone`, `updated_by`, `updated_at` |
| `vinculacion_whatsapp` | Vinculación + LID + consentimiento | `idempresa`, `idemisor`, `persona_tipo` (estudiante/acudiente/docente), `persona_id`, `telefono`, `telefono_norm`, `jid`, `lid`, `estado`, `consentimiento_version`, `consentimiento_fecha`, `consentimiento_origen`, `verificado_at`, `opt_codigo`, `opt_codigo_expires_at` · UNIQUE(idempresa, persona_tipo, persona_id) |
| `auditoria_whatsapp` | Trazabilidad de acciones administrativas | `idempresa`, `idemisor`, `usuario_id`, `accion`, `resultado`, `detalle jsonb`, `fecha` |

### 2.2 Modificaciones a `data.aelog_envios` (aditivas)

`status text DEFAULT 'pending'` · `attempts int DEFAULT 0` · `last_error text` · `payload jsonb` ·
`type text` · `lid text` · `destino_efectivo text` · `updated_at timestamptz`.

Estados del outbox: `pending → queued → sending → sent | failed` (y `cancelled`).

Índices: `(status, idempresa, fecharegistro)` y `(idempresa, fecharegistro)`.

> Se reutilizan: `contact.emisor` (ya ligado a `idempresa`, UNIQUE), `data.aetipo_envio`,
> `contact.aetempmess*` (plantillas), teléfonos de `public.tabestu`/`tabestuacud`/`tabdoce`.

---

## 3. Estados

### 3.1 Emisor / sesión
- `contact.emisor.estado` (FK `data.aeestados`): 6 Conectado, 7 Sin conexión (según catálogo existente).
- `contact.sessions.status`: 1→7 (ver tabla).

### 3.2 Vinculación (`vinculacion_whatsapp.estado`)
`PENDING → CONVERSATION_STARTED → IDENTIFIED → LID_REGISTERED → CONSENT_PENDING → CONSENT_ACCEPTED → ACTIVE`
· terminales/reversibles: `REVOKED`, `BLOCKED`, `ERROR`.

Transiciones permitidas (documentadas para la validación):
- `PENDING → CONVERSATION_STARTED` (recibe el código de un solo uso).
- `CONVERSATION_STARTED → IDENTIFIED` (se identifica persona).
- `IDENTIFIED → LID_REGISTERED` (se obtiene LID cuando el protocolo lo entrega).
- `LID_REGISTERED|IDENTIFIED → CONSENT_PENDING` (se solicita SI/NO + términos).
- `CONSENT_PENDING → CONSENT_ACCEPTED` (SI) / `REJECTED` (NO).
- `CONSENT_ACCEPTED → ACTIVE` (habilitado para recibir).
- `ACTIVE → REVOKED` (revocación) · cualquier → `BLOCKED`/`ERROR`.

Solo `ACTIVE` permite envíos que requieran consentimiento.

---

## 4. API (`escuelappapi` → `controllers/whatsapp/*`)

Patrón de la casa: `<modulo>.routes.js` + `<modulo>Controller.js` + `<modulo>.sql.js`, montado en
`routes/index.js` bajo prefijo `/whatsapp`. Guards: `Auth.isAuth` + `Auth.Admin` (global) o
guarda de institución con scope derivado del JWT.

| Área | Endpoints (POST, salvo consultas) |
|---|---|
| Emisores/sesiones | `emisores/listar`, `emisores/vincular` (crea sesión + QR), `emisores/qr`, `emisores/eliminar`, `sesiones/estado` |
| Colas | `colas/pausar`, `colas/reanudar`, `colas/detener`, `colas/eliminar` (pendientes) |
| Configuración | `config/consultar`, `config/actualizar` (velocidad + modo prueba) |
| Vinculación | `vinculacion/generar` (QR/link), `vinculacion/estado`, `vinculacion/revocar` |
| Mensajes | `mensajes/consultar` (admin global), `mensajes/institucion` (propia) — filtros/orden/paginación |
| Pruebas | `pruebas/activar`, `pruebas/desactivar` |

**Validación pre-envío** (en la API, antes de insertar en el outbox):
destinatario válido → pertenece a la institución → número válido → LID si el mecanismo lo exige →
consentimiento vigente → no revocado → emisor activo → sesión conectada → tipo autorizado.
Si falla, no se encola y se registra el motivo.

---

## 5. apibaileys (gateway)

- Adaptar `src/sql/*` a `contact.*` + `data.aelog_envios` (hoy apuntan a tablas de misvotos).
- `sessionManager`/`postgresAuthState`: persistir en `contact.sessions` + `contact.whatsapp_auth`.
- Cron (2 min): reclamar `pending` con `FOR UPDATE SKIP LOCKED` por emisor de la institución; respetar
  `emisor_config.paused/stopped`; velocidad (`base_delay/jitter/burst_limit/burst_pause/concurrency`) leída
  de PostgreSQL; auto-pausa 408/429 (3 errores → 5 min); reintentos (5, backoff 30 s).
- **Modo prueba**: si `emisor_config.modo_prueba`, redirigir a `test_phone` y registrar `destino_efectivo`.

---

## 6. Frontend (`escuelappvenus`)

- Reutilizar `initWP` (QR + socket), `ActionButton`, `TituloPagina`, `Listado`, `messenger`, `tool`.
- **Admin**: configuración de velocidad, listado de emisores (acciones pausar/reanudar/detener/eliminar
  cola/emisor), consulta global de mensajes.
- **Institución**: vincular emisor (QR), estado conexión, cola, mensajes propios, modo pruebas.
- Menú dinámico: registrar opciones para roles `logic` Admin (0) e Institución (3) vía `scripts/register_menu.js`.

---

## 7. Auditoría y riesgos

- Todo cambio administrativo se registra en `contact.auditoria_whatsapp` (sin secretos/tokens).
- Riesgos documentados: apibaileys no es drop-in (SQL a reescribir); "encriptación" = base64 (usar código
  de un solo uso con expiración, no exponer IDs internos); consentimiento legal (Ley 1581/2012 + políticas
  Meta — borrador a validar); canal no oficial (riesgo de ban; la velocidad no elude límites).

---

## 8. Configuración y despliegue

Los tres servicios deben apuntar a la **misma** base de datos (`bdsae2`) y coordinarse por URL local:

| Servicio | Puerto | Base de datos | Referencia `.env` |
|---|---|---|---|
| `escuelappapi` | 4004 | `sae12.com/bdsae2` | `PG_HOST=sae12.com`, `PG_DB_NAME=bdsae2`, `PG_USER=adminit4_saeroot` |
| `apibaileys` | 4088 | `sae12.com/bdsae2` | `PG_*` idem; `APP_API_BACKEND_MASTER/APP_API_BACKEND=http://localhost:4004`, `WP_API_BACKEND=http://localhost:4088`, `APP_API_FRONT=http://localhost:3000`, `WP_API_ENABLE_CRON=true` |
| `escuelappvenus` | 3000 | — | `REACT_APP_BACKEND_URL=http://localhost:4004` |

Requisitos: **Redis** local (para las colas de `apibaileys`) y migraciones `sql/migrations/001` y `002`
aplicadas a `bdsae2` (aditivas y reversibles; ver `001_whatsapp_integracion.rollback.sql`).

## 9. Documentación relacionada

- [`CONSENTIMIENTO_WHATSAPP.md`](CONSENTIMIENTO_WHATSAPP.md) — borrador de términos/consentimiento (v1.0).
- [`PRUEBAS_WHATSAPP.md`](PRUEBAS_WHATSAPP.md) — checklist de pruebas (FASE 5).
- [`BASE_DATOS.md`](BASE_DATOS.md) — modelo completo de `bdsae2` (actualizar tras cambios de esquema).

## 10. Envío de mensajes: núcleo y casos de uso

### 10.1 Núcleo (`controllers/whatsapp/envio.js`)
- `validarLid()` — función **independiente** que permite/bloquea por vinculación `ACTIVE`.
- `modoTestActivo()` — `APP_WP_NUMBERTEST` (todo va a ese número y se omite el LID).
  Debe definirse en **ambos** servicios: `escuelappapi` fija `destino_efectivo` al encolar y
  `apibaileys` lo vuelve a forzar en el cron/worker (por si el job llegara con otro destino).
- `enviarWhatsApp()` / `enviarMasivo()` → `data.aelog_envios` (`pending`); el envío físico lo hace apibaileys.
  El gateway envía a `COALESCE(destino_efectivo, destino)` y registra el número usado en `enviosdetalles`.
- **Formato único** (`construirMensaje`): `*TÍTULO*` + cuerpo + `[nombre del colegio]` + `Enviado desde escuelapp`.
  Los títulos van **siempre en negrita** (`tituloEnNegrita`). Los módulos pasan `payload: { titulo, cuerpo }`;
  en imagen/video/audio el texto se usa como `caption`. El nombre del colegio se resuelve con
  `nombreInstitucion(idempresa)`. El aviso institucional envía imagen/video si el adjunto lo es, con URL
  pública `APP_API_BACKEND` + `/p/c/...`.
- **Transformación obligatoria** (`controllers/whatsapp/texto.js` → `htmlAWhatsApp`): convierte el HTML del
  editor WYSIWYG al formato de WhatsApp (`<b>`→`*`, `<i>`→`_`, `<s>`→`~`, `<h1..h6>`→negrita, `<li>`→`•`,
  `<a>`→`texto (url)`, entidades HTML, listas, saltos y Markdown `**`/`__`). Es transparente: `enviarWhatsApp()`
  la aplica a todo título y cuerpo, y es el **único** punto que inserta en `data.aelog_envios`.
- Endpoints: `POST /whatsapp/enviar`, `/whatsapp/lid/validar`, `/whatsapp/notificar`, `/whatsapp/instituciones`.

### 10.2 Audiencias (`/whatsapp/notificar`)
`audiencia.tipo`: `docentes` · `estudiantes` (ids) · `grupos` (ids) · `todos` (todos los acudientes) ·
`instituciones` (Admin; ids o todas).

- El resolutor recibe `cinstid` (SAE) y lo mapea a `aeinst_id`; el año del JWT es `canolid`
  y se mapea a `aeano_id` (`aeanoIdDe`).
- Los destinatarios se construyen directo desde `data.aeestudiantes` + `data.aeacudientes`
  (teléfono del acudiente y del estudiante, sin duplicados). La función `engine.contacto_student`
  descartaba el contacto cuando faltaba uno de los dos teléfonos.
- `instituciones` lista las instituciones con emisor y usa `tabinst.cinsttele` (o
  `aeinstituciones.aeinst_telefono` como respaldo).
- La grilla de la cola muestra **nombre + teléfono + grupo** del destinatario (`persona_nombre`,
  `grupo`) y el error solo como tooltip sobre el badge de estado.
- Al hacer clic en una fila se abre una modal con el detalle completo y una **vista previa tipo
  WhatsApp** (texto con `*negrita*`, `_cursiva_`, media, hora y estado); incluye payload JSON y
  el error completo si el envío falló.
- `POST /whatsapp/mensajes/estadisticas { todo: true }` devuelve la **serie diaria completa**
  (también los días sin envíos, en 0). El frontend la grafica con `echarts-for-react`
  (“Uso en el tiempo”) en lugar del sparkline anterior.

### 10.3 Casos de uso cableados
| Rol | Caso | Implementación |
|---|---|---|
| Docente | Observación (checkbox) | `ObservadorController.observacionesSend` + `observador` SAE + `observacionesAdd` |
| Docente | Inasistencia | `asistenciasController.saveAttendance` |
| Docente | Tarea / Examen | `AcademicController.CreateTask` / `createExam` |
| Docente/Coordinador | Citación | `CitacionesController.citacionesRegistrar` |
| Estudiante/Acudiente | Consulta al docente | `comunicationController.sendQuestionTeacher` |
| Estudiante/Acudiente | Consulta a la institución (PQRS) | `pqrsController.pqrRegistrar` |
| Institución | Aviso a docentes / segmentado | `avisosController.avisorollRegistrar` (+ `b.audiencia`) |
| Institución | Comunicación masiva / boletines | `WhatsappInstitucion` → `/notificar` (`docentes` / `todos`) |
| Administrador | Mantenimiento / pagos / colegios | `WhatsappAdmin` → `/notificar` (`instituciones`) |
| Institución (cron) | Horario de mañana | `utils/scheduler.js` (18:00, `WP_CRON_ESCUELAPP=true`, primeros 2 meses) |

### 10.4 Controles de la cola (`escuelappvenus`)
| Botón | Endpoint | Efecto |
|---|---|---|
| Pausar cola | `POST /whatsapp/colas/pausar` | `emisor_config.paused=true`; el cron no reclama y el worker devuelve los jobs ya encolados a `pending`. |
| Reanudar cola | `POST /whatsapp/colas/reanudar` | `paused=false, stopped=false`; el cron vuelve a reclamar. |
| Detener cola | `POST /whatsapp/colas/detener` | `stopped=true`; igual que pausar (los pendientes se conservan). |
| Eliminar cola | `POST /whatsapp/colas/eliminar` | Cancela `pending/queued/sending` de la institución (historial conservado); el worker ignora los `cancelled`. |
| Eliminar emisor | `POST /whatsapp/emisores/eliminar` | Borra emisor, configuración, sesión y credenciales; el historial de mensajes se conserva. |

El worker consulta `contact.emisor_config` y el estado del registro **antes de cada envío**, por lo
que pausar/detener también frena los mensajes que ya estaban en la cola de Bull (vuelven a `pending`).

### 10.5 Pendiente
- **Multimedia** (imagen/video) en avisos: hoy se envía texto; falta construir la URL pública del adjunto.
- **Cron de calendario** y **boletines automáticos** (el calendario aún no se programa; boletines hoy manual).

---

## ⚠️ NOTA NO NEGOCIABLE PARA EL AGENTE CODER

> **Es OBLIGATORIO actualizar este `INTEGRACION_WHATSAPP.md` después de CADA cambio** en la integración
> (endpoints, tablas, casos de uso, variables de entorno, cron). Un cambio **no se considera terminado**
> hasta que este documento refleje el estado real. Actualiza también [`BASE_DATOS.md`](BASE_DATOS.md) si
> cambia el esquema.
