# Estructura de la Base de Datos — bdsae2

Documento de referencia para que una IA (o cualquier desarrollador) comprenda en profundidad la base de datos unificada `bdsae2`, que integra dos sistemas:

| Sistema | Sigla | Esquemas | Propósito |
|---|---|---|---|
| **Escuelapp** — Agenda Escolar Digital | Escuelapp | `contact`, `data`, `engine` | Comunicación diaria con padres de familia y estudiantes vía WhatsApp (avisos, asistencias, tareas, evaluaciones, excusas, PQRS, certificados). |
| **SAE** — Sistema de Administración Educativa | SAE | `public`, `logic`, `observador`, `preescolar`, `estadistica`, `integration`, `temporal`, `varios` | Gestión escolar para docentes y secretarias (matrícula, notas, observador, boletines, promoción, nómina). |

> **Meta del proyecto:** migrar ambos sistemas a una única aplicación **NodeJS + ReactJS** (backend/frontend), versión web responsive, con notificaciones a través de **WhatsApp**. Este documento describe el modelo de datos de partida.

## 1. Conexión a la base de datos

```env
PG_HOST="localhost"
PG_PORT="5432"
PG_DB_NAME="bdsae2"
PG_USER="adminit4_saeroot"
PG_PASSWORD="*HelpDesk/F1*"
```

Motor: **PostgreSQL**. Todas las tablas residen en una sola base de datos (`bdsae2`) repartidas en 12 esquemas.

## 2. Resumen de esquemas

| Esquema | Sistema | Descripción |
|---|---|---|
| `contact` | Escuelapp | Escuelapp — Agenda Escolar Digital. Gestiona los datos de las cuentas de WhatsApp (emisores), plantillas y variables de los mensajes a enviar. |
| `data` | Escuelapp | Escuelapp — Agenda Escolar Digital. Datos gestionados por la agenda: instituciones, docentes, estudiantes, acudientes, asistencias, avisos/comunicados, cronogramas, excusas, tareas, evaluaciones (cuestionarios), PQRS y matrículas. |
| `engine` | Escuelapp | Escuelapp — Agenda Escolar Digital. Lógica de acceso y navegación: usuarios, roles, menús, opciones de menú, privilegios por rol/usuario y restablecimiento de contraseñas. |
| `estadistica` | SAE | SAE — Sistema de Administración Educativa. Registra el historial de visitas/páginas consultadas por cada usuario. |
| `integration` | SAE | SAE — Tablas de integración/mapeo entre SAE (public/logic) y la agenda (Escuelapp), y registro de actividades de usuarios. |
| `logic` | SAE | SAE — Lógica de acceso y navegación del sistema administrativo: usuarios, roles, menús, opciones y privilegios por rol/usuario. |
| `migracion` | Consolidación | Esquema creado durante la consolidación SAE → Escuelapp: tablas de mapeo de IDs (`map_rol`, `map_usuario`, `map_docente`, `map_estudiante`, `map_institucion`). Lo usa el Integration Layer (`controllers/integration/`) para resolver identidades entre ambos sistemas. |
| `observador` | SAE | SAE — Registros del observador del estudiante: disciplina, bitácora de clases y evaluación de responsabilidades. |
| `preescolar` | SAE | SAE — Registros específicos de preescolar (ámbitos, dimensiones, asignaciones, notas y novedades). |
| `public` | SAE | SAE — Esquema principal con los datos de gestión escolar: instituciones, sedes, docentes, estudiantes, matrículas, cursos, asignaturas, competencias, notas, novedades, observador y catálogos oficiales de Colombia. |
| `temporal` | SAE | SAE — Datos temporales usados en etapas específicas del proyecto o para transformar/importar otras tablas. |
| `varios` | SAE | SAE — Datos adicionales para tareas específicas o que afectaban a una sola institución. |

## 3. Convenciones globales del modelo

### 3.1 Nombres de tablas y columnas

- **Escuelapp (`data`, `engine`, `contact`)**: tablas con prefijo `ae` (`aeavisos`, `aeestudiantes`, `aeusu`, ...). Las columnas suelen llevar el prefijo completo de la tabla (`aeavisos_titulo`, `aeestudiantes_nombres`).
- **SAE (`public`, `logic`, `observador`, `preescolar`, ...)**: tablas con prefijo `tab` (`tabestu`, `tabnota`, `tabcurs`) y columnas con una `c` + abreviatura (`cestunomb`, `cnotavalo`).
- **Clave primaria**: normalmente `<prefijo>id` (`cestuid`, `cmatrid`, `aeusu_id`, `aeavisos_id`).
- **Columnas de estado**: casi todas las tablas tienen una columna de estado (`ae*_estado`, `c*esta`). El valor `1` o `8` suele significar *activo*. Los significados provienen de catálogos (`data.aeestados`, `public.tabestagene`).
- **Año lectivo**: referenciado como `aeano_id` (Escuelapp) o `canolid` (SAE).
- **Institución**: `aeinst_id` (Escuelapp) o `cinstid` (SAE).

### 3.2 Dos subsistemas de autenticación

| Sistema | Tabla de usuarios | Tabla de roles | Enlace con lo académico |
|---|---|---|---|
| Escuelapp | `engine.aeusu` | `engine.aeroll` (201-208) | `engine.aeusuroll` (rol × institución × año) |
| SAE | `logic.tabusua` | `logic.tabroll` (0-7) | `public.tabunio` (usuario login ↔ usuario académico) |

La integración entre ambos la describe `integration.tabenla` (mapeo de entidades) y `integration.tabregiacti` (auditoría de actividad).

### 3.3 Notas sobre el esquema `public`

- El esquema `public` es propiedad de `pg_database_owner` (no de `adminit4_saeroot`), por lo que no se le pudo asignar `COMMENT ON SCHEMA`.
- Contiene tablas legadas con nombre que incluye un punto, copias de `contact`: `public."contact.aetempmess"`, `public."contact.aetempmesssede"`, `public."contact.aetempmesstype"`, `public."contact.aetempmessvars"` (propiedad de `postgres`; no se les pudo asignar comentarios).
- Tablas de archivo de notas: `tabnota2013` a `tabnota2016` conservan el historial de notas por año.

## 4. Detalle por esquema: tablas, columnas, relaciones e índices

### Esquema `contact` (Escuelapp)

Escuelapp — Agenda Escolar Digital. Gestiona los datos de las cuentas de WhatsApp (emisores), plantillas y variables de los mensajes a enviar.

Tablas/objetos: **5**

#### `contact.aetempmess` — tabla

**Descripción:** Plantillas de mensaje de WhatsApp para envíos generales (con guía de destino).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aetempmess_id` | `integer` | NO | `nextval('contact.aetempmess_aetempmess_id_seq'::regclass)` | Identificador único de la plantilla. |
| `aetempmess_type` | `integer` | NO | `` | Tipo de mensaje al que pertenece (FK a aetempmesstype). |
| `aetempmess_text` | `text` | NO | `` | Texto de la plantilla del mensaje. |
| `aetempmess_guia` | `text` | NO | `` | Guía/instructivo asociado al mensaje. |
| `aetempmess_estado` | `integer` | SÍ | `1` | Estado de la plantilla (1=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (aetempmess_id)
- `FK (aetempmess_fk1)`: FOREIGN KEY (aetempmess_type) REFERENCES contact.aetempmesstype(aetempmesstype_id) ON UPDATE CASCADE ON DELETE CASCADE

**Índices:**

- `aetempmess_pkey`: CREATE UNIQUE INDEX aetempmess_pkey ON contact.aetempmess USING btree (aetempmess_id)

---

#### `contact.aetempmesssede` — tabla

**Descripción:** Plantillas de mensaje de WhatsApp específicas por institución (sede), reemplazan a las generales.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aetempmesssede_id` | `integer` | NO | `nextval('contact.aetempmesssede_aetempmesssede_id_seq'::regclass)` | Identificador único del registro. |
| `aetempmesstype_id` | `integer` | NO | `` | Tipo de mensaje al que pertenece (FK a aetempmesstype). |
| `aetempmesssede_estado` | `integer` | SÍ | `1` | Estado de la plantilla (1=activo). |
| `aeinst_id` | `bigint` | NO | `` | Institución a la que aplica la plantilla (FK a data.aeinstituciones). |
| `aetempmesssede_guia` | `text` | NO | `` | Guía/instructivo asociado al mensaje de la sede. |
| `aetempmesssede_text` | `text` | NO | `` | Texto de la plantilla del mensaje de la sede. |

**Restricciones:**

- `PK`: PRIMARY KEY (aetempmesssede_id)
- `FK (messsedeinstitucion)`: FOREIGN KEY (aeinst_id) REFERENCES data.aeinstituciones(aeinst_id) ON UPDATE CASCADE ON DELETE CASCADE
- `FK (messsedetipo)`: FOREIGN KEY (aetempmesstype_id) REFERENCES contact.aetempmesstype(aetempmesstype_id) ON UPDATE CASCADE ON DELETE CASCADE

**Índices:**

- `aetempmesssede_pkey`: CREATE UNIQUE INDEX aetempmesssede_pkey ON contact.aetempmesssede USING btree (aetempmesssede_id)

---

#### `contact.aetempmesstype` — tabla

**Descripción:** Tipos de mensaje/plantilla de WhatsApp disponibles para envío (cada tipo se asocia a un emisor).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aetempmesstype_id` | `integer` | NO | `nextval('contact.aetempmesstype_aetempmesstype_id_seq'::regclass)` | Identificador único del tipo de mensaje. |
| `aetempmesstype_text` | `text` | NO | `` | Texto del tipo de mensaje. |
| `aetempmesstype_estado` | `integer` | SÍ | `1` | Estado del tipo de mensaje (1=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (aetempmesstype_id)

**Índices:**

- `aetempmesstype_pkey`: CREATE UNIQUE INDEX aetempmesstype_pkey ON contact.aetempmesstype USING btree (aetempmesstype_id)

---

#### `contact.aetempmessvars` — tabla

**Descripción:** Variables (placeholders) reemplazables dentro de las plantillas de mensaje de WhatsApp.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aetempmessvars_id` | `integer` | NO | `nextval('contact.aetempmessvars_aetempmessvars_id_seq'::regclass)` | Identificador único de la variable. |
| `aetempmessvars_nombre` | `character varying(19)` | NO | `` | Nombre de la variable (ej. {{nombre_estudiante}}). |
| `aetempmessvars_comentario` | `text` | NO | `` | Descripción del uso de la variable en las plantillas. |
| `aetempmessvars_estado` | `integer` | SÍ | `1` | Estado de la variable (1=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (aetempmessvars_id)

**Índices:**

- `aetempmessvars_pkey`: CREATE UNIQUE INDEX aetempmessvars_pkey ON contact.aetempmessvars USING btree (aetempmessvars_id)

---

#### `contact.emisor` — tabla

**Descripción:** Cuentas/emisores de WhatsApp por institución: número desde el cual se envían los mensajes y su token de sesión.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `idemisor` | `integer` | NO | `nextval('contact.emisor_idemisor_seq'::regclass)` | Identificador único del emisor. |
| `fecharegistro` | `timestamp without time zone` | SÍ | `CURRENT_TIMESTAMP` | Fecha y hora de registro del emisor. |
| `estado` | `integer` | NO | `6` | Estado del emisor (FK a data.aeestados). |
| `idempresa` | `bigint` | NO | `` | Institución dueña del número de WhatsApp (FK a data.aeinstituciones). |
| `emisor` | `character varying(14)` | NO | `` | Número de teléfono del emisor de WhatsApp. |
| `token` | `text` | SÍ | `` | Token de sesión/autenticación del emisor en WhatsApp. |

**Restricciones:**

- `PK`: PRIMARY KEY (idemisor)
- `UNIQUE`: UNIQUE (idempresa)
- `FK (emisor_estado_fkey)`: FOREIGN KEY (estado) REFERENCES data.aeestados(aeestados_id) ON UPDATE CASCADE ON DELETE CASCADE
- `FK (emisor_idempresa_fkey)`: FOREIGN KEY (idempresa) REFERENCES data.aeinstituciones(aeinst_id) ON UPDATE CASCADE ON DELETE CASCADE

**Índices:**

- `emisor_pkey`: CREATE UNIQUE INDEX emisor_pkey ON contact.emisor USING btree (idemisor)
- `emisor_unico`: CREATE UNIQUE INDEX emisor_unico ON contact.emisor USING btree (idempresa)
- `emisores_idx`: CREATE INDEX emisores_idx ON contact.emisor USING btree (idempresa, emisor, fecharegistro)

---

### Esquema `data` (Escuelapp)

Escuelapp — Agenda Escolar Digital. Datos gestionados por la agenda: instituciones, docentes, estudiantes, acudientes, asistencias, avisos/comunicados, cronogramas, excusas, tareas, evaluaciones (cuestionarios), PQRS y matrículas.

Tablas/objetos: **76**

#### `data.aeacudientes` — tabla

**Descripción:** Acudientes (padres/tutores) de los estudiantes.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aeacudientes_id` | `integer` | NO | `` | Identificador único del acudiente. |
| `aeusu_id` | `double precision` | SÍ | `` | Usuario de login asociado (FK a engine.aeusu). |
| `aeestudiantes_id` | `double precision` | SÍ | `` | Estudiante asociado (FK a aeestudiantes). |
| `aeestudiantes_fecharegistro` | `timestamp without time zone` | SÍ | `CURRENT_TIMESTAMP` | Fecha de registro. |
| `aeestudiantes_idenacudiente` | `character varying(16)` | SÍ | `` | Identificación del acudiente. |
| `aeestudiantes_nombresacudiente` | `character varying(64)` | SÍ | `` | Nombres del acudiente. |
| `aeestudiantes_apellidosacudiente` | `character varying(64)` | SÍ | `` | Apellidos del acudiente. |
| `aeestudiantes_generoacudiente` | `character(1)` | SÍ | `` | Género del acudiente. |
| `aeestudiantes_direccionacudiente` | `text` | SÍ | `` | Dirección del acudiente. |
| `aeestudiantes_telefonoacudiente` | `text` | SÍ | `` | Teléfono del acudiente. |
| `aeestudiantes_mailacudiente` | `text` | SÍ | `` | Correo del acudiente. |
| `aeestudiantes_fotoacudiente` | `text` | SÍ | `` | Foto del acudiente. |
| `aeestudiantes_estado` | `integer` | SÍ | `1` | Estado del acudiente (1=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (aeacudientes_id)

**Índices:**

- `aeacudientes_pkey`: CREATE UNIQUE INDEX aeacudientes_pkey ON data.aeacudientes USING btree (aeacudientes_id)
- `aeacudientesindex_id`: CREATE INDEX aeacudientesindex_id ON data.aeacudientes USING btree (aeestudiantes_fecharegistro, aeestudiantes_id)
- `unico_papaxnino`: CREATE UNIQUE INDEX unico_papaxnino ON data.aeacudientes USING btree (aeestudiantes_id, aeestudiantes_idenacudiente)

---

#### `data.aeacudientes_old` — tabla

**Descripción:** Copia/backup de acudientes.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aeacudientes_id` | `integer` | NO | `` | Identificador del acudiente. |
| `aeusu_id` | `double precision` | SÍ | `` | Usuario de login. |
| `aeestudiantes_id` | `double precision` | SÍ | `` | Estudiante asociado. |
| `aeestudiantes_fecharegistro` | `timestamp without time zone` | NO | `` | Fecha de registro. |
| `aeestudiantes_idenacudiente` | `character varying(16)` | SÍ | `` | Identificación. |
| `aeestudiantes_nombresacudiente` | `character varying(64)` | SÍ | `` | Nombres. |
| `aeestudiantes_apellidosacudiente` | `character varying(64)` | SÍ | `` | Apellidos. |
| `aeestudiantes_generoacudiente` | `character(1)` | SÍ | `` | Género. |
| `aeestudiantes_direccionacudiente` | `text` | SÍ | `` | Dirección. |
| `aeestudiantes_telefonoacudiente` | `text` | NO | `` | Teléfono. |
| `aeestudiantes_mailacudiente` | `text` | NO | `` | Correo. |
| `aeestudiantes_fotoacudiente` | `text` | SÍ | `` | Foto. |
| `aeestudiantes_estado` | `integer` | SÍ | `1` | Estado. |

**Restricciones:**

- `PK`: PRIMARY KEY (aeacudientes_id)

**Índices:**

- `aeacudientesindexold_id`: CREATE INDEX aeacudientesindexold_id ON data.aeacudientes_old USING btree (aeestudiantes_fecharegistro, aeestudiantes_id)
- `aeacudientesold_pkey`: CREATE UNIQUE INDEX aeacudientesold_pkey ON data.aeacudientes_old USING btree (aeacudientes_id)

---

#### `data.aeano` — tabla

**Descripción:** Años lectivos para todas las sedes/instituciones en general.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aeano_id` | `integer` | NO | `` | Identificador único del año lectivo. |
| `aeano_descripcion` | `character varying(16)` | SÍ | `` | Descripción del año lectivo (ej. "2026"). |
| `aeano_calendario` | `"char"` | SÍ | `'z'::"char"` | Calendario (A/B) del año lectivo. |
| `fecha_inicio` | `date` | SÍ | `` | Fecha de inicio del año lectivo. |
| `fecha_fin` | `date` | SÍ | `` | Fecha de finalización del año lectivo. |

**Restricciones:**

- `PK`: PRIMARY KEY (aeano_id)

**Índices:**

- `poano_pkey`: CREATE UNIQUE INDEX poano_pkey ON data.aeano USING btree (aeano_id)

---

#### `data.aeasignaciones` — tabla

**Descripción:** Asignaciones académicas: asignatura + docente + grupo + horario.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aeasignaciones_id` | `double precision` | NO | `nextval('data.secuence_aeasignaciones_id'::regclass)` | Identificador único de la asignación. |
| `aeanol_id` | `integer` | NO | `` | Año lectivo (FK a aeano). |
| `aeinst_id` | `double precision` | NO | `` | Institución (FK a aeinstituciones). |
| `aedocentes_id` | `double precision` | NO | `` | Docente a cargo (FK a aedocentes). |
| `aeasignaciones_asignatura` | `character varying(256)` | NO | `` | Nombre de la asignatura. |
| `aeasignaciones_grupo` | `character varying(64)` | NO | `` | Grupo/salón al que se dicta. |
| `aeasignaciones_dia` | `integer` | NO | `` | Día de la semana (índice) de la clase. |
| `aeasignaciones_hora` | `time without time zone` | NO | `` | Hora de inicio de la clase. |
| `aeasignaciones_horafin` | `time without time zone` | SÍ | `` | Hora de fin de la clase. |
| `aeasignaciones_utiles` | `character varying(256)` | SÍ | `` | Útiles/materiales requeridos. |
| `aeasignaciones_enlace` | `text` | SÍ | `` | Enlace virtual de la clase. |
| `aeasignaciones_estado` | `integer` | SÍ | `1` | Estado de la asignación (1=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (aeasignaciones_id)

**Índices:**

- `asignacion`: CREATE UNIQUE INDEX asignacion ON data.aeasignaciones USING btree (aeasignaciones_id)
- `asignaorder`: CREATE INDEX asignaorder ON data.aeasignaciones USING btree (aeanol_id, aeinst_id)

---

#### `data.aeasistencias` — tabla

**Descripción:** Asistencias de los estudiantes registradas por los docentes.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aeasistencia_id` | `double precision` | NO | `` | Identificador único del registro de asistencia. |
| `aeasistencias_docente` | `double precision` | NO | `` | Docente que registra (FK a aedocentes). |
| `aeestudiantes_grupo` | `character varying(32)` | NO | `` | Grupo/salón. |
| `aeasignaciones_asignatura` | `character varying(64)` | NO | `` | Asignatura. |
| `aeestudiantes_id` | `double precision` | NO | `` | Estudiante (FK a aeestudiantes). |
| `aeasistencias_fecha` | `date` | NO | `` | Fecha de la asistencia. |
| `aeasistencias_fecharegistro` | `timestamp with time zone` | SÍ | `` | Fecha de registro. |
| `aeasistencias_llego` | `integer` | SÍ | `` | Indicador de si llegó/asistió. |
| `aeasistencias_estado` | `integer` | SÍ | `1` | Estado (1=activo). |
| `aeasistencias_enviado` | `boolean` | SÍ | `false` | Si la notificación fue enviada. |

**Restricciones:**

- `PK`: PRIMARY KEY (aeasistencia_id)

**Índices:**

- `aeasistencias_pkey`: CREATE UNIQUE INDEX aeasistencias_pkey ON data.aeasistencias USING btree (aeasistencia_id)
- `orden_asistencias`: CREATE INDEX orden_asistencias ON data.aeasistencias USING btree (aeasistencias_fecha, aeasistencias_docente, aeasignaciones_asignatura, aeestudiantes_grupo)

---

#### `data.aeavisos` — tabla

**Descripción:** Avisos/comunicados publicados por docentes para estudiantes y/o acudientes.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aeavisos_id` | `bigint` | NO | `` | Identificador único del aviso. |
| `aeusu_id` | `bigint` | NO | `` | Usuario autor (FK a engine.aeusu). |
| `aeinst_id` | `bigint` | NO | `` | Institución (FK a aeinstituciones). |
| `aeanol_id` | `bigint` | NO | `` | Año lectivo (FK a aeano). |
| `aeavisos_grupo` | `character varying[]` | SÍ | `` | Grupos/salones a los que va dirigido. |
| `aeavisos_estudiantesid` | `bigint[]` | SÍ | `` | Estudiantes específicos a los que va dirigido. |
| `aeavisos_fecha` | `timestamp without time zone` | NO | `` | Fecha de creación del aviso. |
| `aeavisos_fechapublicacion` | `timestamp without time zone` | NO | `` | Fecha de publicación. |
| `aeavisos_fechafinalizacion` | `timestamp without time zone` | NO | `` | Fecha de finalización/vencimiento. |
| `aeavisos_titulo` | `text` | NO | `` | Título del aviso. |
| `aeavisos_descripcion` | `text` | NO | `` | Descripción/cuerpo del aviso. |
| `aeavisos_adjunto` | `text` | SÍ | `` | Archivo adjunto. |
| `aeavisos_estado` | `integer` | SÍ | `1` | Estado del aviso (1=activo). |
| `aeavisos_alcance` | `integer` | SÍ | `1` | Alcance: 0=docentes, 1=docentes y estudiantes. |
| `aeavisos_aceptarespuestas` | `boolean` | SÍ | `true` | Si acepta respuestas o no. |

**Restricciones:**

- `PK`: PRIMARY KEY (aeavisos_id)

**Índices:**

- `aeavisos_pkey`: CREATE UNIQUE INDEX aeavisos_pkey ON data.aeavisos USING btree (aeavisos_id)
- `orden_avisos`: CREATE INDEX orden_avisos ON data.aeavisos USING btree (aeavisos_fecha, aeanol_id, aeinst_id)

---

#### `data.aeavisos_comentarios` — tabla

**Descripción:** Comentarios/respuestas a los avisos.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aeavisoscomentarios_id` | `bigint` | NO | `` | Identificador único del comentario. |
| `aeavisos_id` | `bigint` | NO | `` | Aviso al que pertenece (FK a aeavisos). |
| `aeusu_id` | `bigint` | NO | `` | Usuario que comenta. |
| `aeavisoscomentarios_fecha` | `timestamp without time zone` | NO | `` | Fecha del comentario. |
| `aeavisoscomentarios_descripcion` | `text` | NO | `` | Texto del comentario. |
| `aeavisoscomentarios_estado` | `integer` | SÍ | `1` | Estado del comentario (1=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (aeavisoscomentarios_id)
- `FK (avisoscomentarios_fkey)`: FOREIGN KEY (aeavisos_id) REFERENCES data.aeavisos(aeavisos_id) ON UPDATE CASCADE ON DELETE CASCADE

**Índices:**

- `aeavisoscomentarios_pkey`: CREATE UNIQUE INDEX aeavisoscomentarios_pkey ON data.aeavisos_comentarios USING btree (aeavisoscomentarios_id)
- `orden_comentariosavisos`: CREATE INDEX orden_comentariosavisos ON data.aeavisos_comentarios USING btree (aeavisoscomentarios_fecha, aeusu_id, aeavisos_id)

---

#### `data.aeavisosinternal` — tabla

**Descripción:** Avisos internos dirigidos solo a docentes.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aeavisosinternal_id` | `double precision` | NO | `` | Identificador único del aviso interno. |
| `aeusu_id` | `double precision` | NO | `` | Usuario autor. |
| `aeinst_id` | `double precision` | NO | `` | Institución. |
| `aeanol_id` | `double precision` | NO | `` | Año lectivo. |
| `aeavisosinternal_docentessid` | `double precision[]` | SÍ | `` | Docentes destinatarios. |
| `aeavisosinternal_fecha` | `timestamp without time zone` | NO | `` | Fecha de creación. |
| `aeavisosinternal_fechapublicacion` | `timestamp without time zone` | NO | `` | Fecha de publicación. |
| `aeavisosinternal_fechafinalizacion` | `timestamp without time zone` | NO | `` | Fecha de finalización. |
| `aeavisosinternal_titulo` | `text` | NO | `` | Título. |
| `aeavisosinternal_descripcion` | `text` | NO | `` | Descripción. |
| `aeavisosinternal_adjunto` | `text` | SÍ | `` | Archivo adjunto. |
| `aeavisosinternal_estado` | `integer` | SÍ | `1` | Estado (1=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (aeavisosinternal_id)

**Índices:**

- `aeavisosinternal_pkey`: CREATE UNIQUE INDEX aeavisosinternal_pkey ON data.aeavisosinternal USING btree (aeavisosinternal_id)
- `orden_avisosinternos`: CREATE INDEX orden_avisosinternos ON data.aeavisosinternal USING btree (aeavisosinternal_fecha, aeanol_id, aeinst_id)

---

#### `data.aeavisosinternal_comentarios` — tabla

**Descripción:** Comentarios a los avisos internos.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aeavisosinternalcomentarios_id` | `double precision` | NO | `` | Identificador único del comentario. |
| `aeavisosinternal_id` | `double precision` | NO | `` | Aviso interno (FK a aeavisosinternal). |
| `aeusu_id` | `double precision` | NO | `` | Usuario que comenta. |
| `aeavisosinternalcomentarios_fecha` | `timestamp without time zone` | NO | `` | Fecha del comentario. |
| `aeavisosinternalcomentarios_descripcion` | `text` | NO | `` | Texto del comentario. |
| `aeavisosinternalcomentarios_estado` | `integer` | SÍ | `1` | Estado (1=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (aeavisosinternalcomentarios_id)
- `FK (aviinternalcomentarios_fkey)`: FOREIGN KEY (aeavisosinternal_id) REFERENCES data.aeavisosinternal(aeavisosinternal_id) ON UPDATE CASCADE ON DELETE CASCADE

**Índices:**

- `aeavisosinternalcomentarios_pkey`: CREATE UNIQUE INDEX aeavisosinternalcomentarios_pkey ON data.aeavisosinternal_comentarios USING btree (aeavisosinternalcomentarios_id)
- `orden_comentariosavisosinternal`: CREATE INDEX orden_comentariosavisosinternal ON data.aeavisosinternal_comentarios USING btree (aeavisosinternalcomentarios_fecha, aeusu_id, aeavisosinternal_id)

---

#### `data.aeayuda` — tabla

**Descripción:** Ayudas/tutoriales del sistema (por rol, interfaz y versión).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aeayuda_id` | `double precision` | NO | `` | Identificador único de la ayuda. |
| `aeayuda_para` | `integer[]` | NO | `` | Roles a los que va dirigida. |
| `aeayuda_estado` | `integer` | SÍ | `1` | Estado (1=activo). |
| `aeayuda_tipointerface` | `character varying(4)` | NO | `` | Tipo de interfaz (web/móvil). |
| `aeayuda_titulo` | `text` | NO | `` | Título de la ayuda. |
| `aeayuda_enlace` | `text` | NO | `` | Enlace de la ayuda. |
| `aeayuda_descripcion` | `text` | NO | `` | Descripción de la ayuda. |
| `aeayuda_version` | `character varying(9)` | SÍ | `` | Versión de la ayuda. |
| `aeayuda_vistas` | `integer` | SÍ | `` | Número de vistas de la ayuda. |

**Restricciones:**

- `PK`: PRIMARY KEY (aeayuda_id)

**Índices:**

- `aeayuda_pkey`: CREATE UNIQUE INDEX aeayuda_pkey ON data.aeayuda USING btree (aeayuda_id)

---

#### `data.aebitacora` — tabla

**Descripción:** Bitácora de clases: registro diario de actividades y observaciones por docente.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aebitacora_id` | `double precision` | NO | `` | Identificador único del registro de bitácora. |
| `aebitacora_fecha` | `timestamp without time zone` | NO | `` | Fecha del registro. |
| `aeusu_id` | `double precision` | NO | `` | Docente que registra (FK a engine.aeusu). |
| `aeinst_id` | `double precision` | NO | `` | Institución. |
| `aeanol_id` | `double precision` | NO | `` | Año lectivo. |
| `aebitacora_grupo` | `character varying[]` | SÍ | `` | Grupos a los que aplica. |
| `aebitacora_estudiantesid` | `double precision[]` | SÍ | `` | Estudiantes a los que aplica. |
| `aebitacora_asignatura` | `text` | SÍ | `` | Asignatura. |
| `aebitacora_aviso` | `boolean` | SÍ | `` | Si genera aviso/comunicado. |
| `aebitacora_descripcion` | `text` | SÍ | `` | Descripción de la actividad/observación. |

**Restricciones:**

- `PK`: PRIMARY KEY (aebitacora_id)

**Índices:**

- `aebitacora_pkey`: CREATE UNIQUE INDEX aebitacora_pkey ON data.aebitacora USING btree (aebitacora_id)
- `orden_bitacora`: CREATE INDEX orden_bitacora ON data.aebitacora USING btree (aebitacora_fecha, aeanol_id, aeinst_id)

---

#### `data.aebitacora_comentarios` — tabla

**Descripción:** Comentarios a los registros de bitácora.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aebitacoracomentarios_id` | `double precision` | NO | `` | Identificador único del comentario. |
| `aebitacora_id` | `double precision` | NO | `` | Registro de bitácora (FK a aebitacora). |
| `aeusu_id` | `double precision` | NO | `` | Usuario que comenta. |
| `aebitacoracomentarios_fecha` | `timestamp without time zone` | NO | `` | Fecha del comentario. |
| `aebitacoracomentarios_descripcion` | `text` | NO | `` | Texto del comentario. |
| `aebitacoracomentarios_estado` | `integer` | SÍ | `1` | Estado (1=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (aebitacoracomentarios_id)
- `FK (aeconsultascomentarios_fkey)`: FOREIGN KEY (aebitacora_id) REFERENCES data.aebitacora(aebitacora_id) ON UPDATE CASCADE ON DELETE CASCADE

**Índices:**

- `aebitacoracomentarios_pkey`: CREATE UNIQUE INDEX aebitacoracomentarios_pkey ON data.aebitacora_comentarios USING btree (aebitacoracomentarios_id)
- `orden_aebitacorainternal`: CREATE INDEX orden_aebitacorainternal ON data.aebitacora_comentarios USING btree (aebitacoracomentarios_fecha, aeusu_id, aebitacora_id)

---

#### `data.aecaracter` — tabla

**Descripción:** Carácter de la institución (público/privado).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aecaracter_id` | `smallint` | NO | `` | Identificador único del carácter. |
| `aecaracter_descripcion` | `character varying(16)` | NO | `` | Descripción del carácter (Público/Privado). |
| `aecaracter_estado` | `smallint` | SÍ | `1` | Estado (1=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (aecaracter_id)

**Índices:**

- `_copy_6`: CREATE UNIQUE INDEX _copy_6 ON data.aecaracter USING btree (aecaracter_id)

---

#### `data.aecitaciones` — tabla

**Descripción:** Citaciones a acudientes/estudiantes por motivos de disciplina.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aecitacion_id` | `integer` | NO | `` | Identificador único de la citación. |
| `aecitacion_fecharegistro` | `timestamp without time zone` | NO | `` | Fecha de registro de la citación. |
| `aeanol_id` | `bigint` | NO | `` | Año lectivo (FK a aeano). |
| `aeinst_id` | `bigint` | NO | `` | Institución (FK a aeinstituciones). |
| `aeestudiantes_id` | `bigint[]` | NO | `` | Estudiantes citados. |
| `aedocentes_id` | `bigint` | SÍ | `` | Docente que cita. |
| `aemotivo_id` | `bigint` | NO | `` | Motivo de la citación (FK a aemotivo). |
| `aecitacion_estado` | `smallint` | NO | `` | Estado de la citación. |
| `aecitacion_fecha` | `timestamp without time zone` | NO | `` | Fecha y hora de la citación. |
| `aecitacion_lugar` | `character varying` | NO | `` | Lugar de la citación. |
| `aecitacion_descripcion` | `text` | SÍ | `` | Descripción de la citación. |
| `aecitacion_adjunto` | `text` | SÍ | `` | Archivo adjunto. |

**Restricciones:**

- `PK`: PRIMARY KEY (aecitacion_id)
- `FK (citacionano)`: FOREIGN KEY (aeanol_id) REFERENCES data.aeano(aeano_id) ON UPDATE CASCADE ON DELETE CASCADE
- `FK (citacionmotivo)`: FOREIGN KEY (aemotivo_id) REFERENCES data.aemotivo(aemotivo_id) ON UPDATE CASCADE ON DELETE CASCADE
- `FK (citacionsede)`: FOREIGN KEY (aeinst_id) REFERENCES data.aeinstituciones(aeinst_id) ON UPDATE CASCADE ON DELETE CASCADE

**Índices:**

- `aecitaciones_pkey`: CREATE UNIQUE INDEX aecitaciones_pkey ON data.aecitaciones USING btree (aecitacion_id)
- `citaciones__fkindex1`: CREATE INDEX citaciones__fkindex1 ON data.aecitaciones USING btree (aecitacion_fecha, aeanol_id, aeinst_id, aemotivo_id, aedocentes_id)

---

#### `data.aecondiciones` — tabla

**Descripción:** Aceptación de términos y condiciones por parte de los acudientes (registro del dispositivo).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aecondiciones_id` | `double precision` | NO | `` | Identificador único del registro. |
| `aecondiciones_acudiente` | `text` | NO | `` | Acudiente que acepta. |
| `aecondiciones_fecha` | `timestamp without time zone` | NO | `` | Fecha de aceptación. |
| `aelogdispositivos_model` | `text` | SÍ | `` | Modelo del dispositivo. |
| `aelogdispositivos_platform` | `text` | SÍ | `` | Plataforma. |
| `aelogdispositivos_uuid` | `text` | SÍ | `` | UUID del dispositivo. |
| `aelogdispositivos_version` | `text` | SÍ | `` | Versión de la app. |
| `aelogdispositivos_serial` | `text` | SÍ | `` | Serial del dispositivo. |

**Restricciones:**

- `PK`: PRIMARY KEY (aecondiciones_id)

**Índices:**

- `aecondiciones_pkey`: CREATE UNIQUE INDEX aecondiciones_pkey ON data.aecondiciones USING btree (aecondiciones_id)
- `orden_aecondiciones`: CREATE INDEX orden_aecondiciones ON data.aecondiciones USING btree (aecondiciones_fecha)

---

#### `data.aeconocer` — tabla

**Descripción:** Medios por los que se conoció la institución (encuesta de matrícula).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aeconocer_id` | `smallint` | NO | `` | Identificador único del medio. |
| `aeconocer_descripcion` | `character varying(64)` | NO | `` | Descripción del medio (Redes sociales, Referidos, etc.). |
| `aeconocer_estado` | `smallint` | SÍ | `1` | Estado (1=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (aeconocer_id)

**Índices:**

- `_copy_5`: CREATE UNIQUE INDEX _copy_5 ON data.aeconocer USING btree (aeconocer_id)

---

#### `data.aeconsultasdocentes` — tabla

**Descripción:** Consultas de estudiantes/acudientes a los docentes.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aeconsultasdocentes_id` | `double precision` | NO | `` | Identificador único de la consulta. |
| `aeconsultasdocentes_fecha` | `timestamp without time zone` | NO | `` | Fecha de la consulta. |
| `aeestudiantes_id` | `double precision` | NO | `` | Estudiante que consulta (FK a aeestudiantes). |
| `aeasignaciones_asignatura` | `text` | NO | `` | Asignatura sobre la que se consulta. |
| `aedocente_id` | `double precision` | NO | `` | Docente destinatario (FK a aedocentes). |
| `aeinst_id` | `double precision` | NO | `` | Institución. |
| `aeanol_id` | `double precision` | NO | `` | Año lectivo. |
| `aeconsultasdocentes_descripcion` | `text` | NO | `` | Texto de la consulta. |
| `aeconsultasdocentes_visibilidad` | `boolean` | SÍ | `false` | Si la consulta es visible. |
| `aeconsultasdocentes_estado` | `integer` | SÍ | `1` | Estado (1=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (aeconsultasdocentes_id)

**Índices:**

- `aeconsultasdocentes_pkey`: CREATE UNIQUE INDEX aeconsultasdocentes_pkey ON data.aeconsultasdocentes USING btree (aeconsultasdocentes_id)
- `orden_aeconsultasdocentes`: CREATE INDEX orden_aeconsultasdocentes ON data.aeconsultasdocentes USING btree (aeconsultasdocentes_fecha, aeestudiantes_id, aedocente_id)

---

#### `data.aeconsultasdocentes_comentarios` — tabla

**Descripción:** Comentarios/respuestas a las consultas de docentes.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aeconsultasdocentescomentarios_id` | `double precision` | NO | `` | Identificador único del comentario. |
| `aeconsultasdocentes_id` | `double precision` | NO | `` | Consulta (FK a aeconsultasdocentes). |
| `aeusu_id` | `double precision` | NO | `` | Usuario que comenta. |
| `aeconsultasdocentescomentarios_fecha` | `timestamp without time zone` | NO | `` | Fecha del comentario. |
| `aeconsultasdocentescomentarios_descripcion` | `text` | NO | `` | Texto del comentario. |
| `aeconsultasdocentescomentarios_estado` | `integer` | SÍ | `1` | Estado (1=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (aeconsultasdocentescomentarios_id)
- `FK (aeconsultascomentarios_fkey)`: FOREIGN KEY (aeconsultasdocentes_id) REFERENCES data.aeconsultasdocentes(aeconsultasdocentes_id) ON UPDATE CASCADE ON DELETE CASCADE

**Índices:**

- `aeconsultasdocentescomentarios_pkey`: CREATE UNIQUE INDEX aeconsultasdocentescomentarios_pkey ON data.aeconsultasdocentes_comentarios USING btree (aeconsultasdocentescomentarios_id)
- `orden_aeconsultasdocentesinternal`: CREATE INDEX orden_aeconsultasdocentesinternal ON data.aeconsultasdocentes_comentarios USING btree (aeconsultasdocentescomentarios_fecha, aeusu_id, aeconsultasdocentes_id)

---

#### `data.aecronograma` — tabla

**Descripción:** Cronograma de eventos institucionales (académicos, directivos, etc.).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aecronograma_id` | `integer` | NO | `nextval('data.aecronograma_aecronograma_id_seq'::regclass)` | Identificador único del evento. |
| `aeinst_id` | `bigint[]` | NO | `` | Instituciones a las que aplica. |
| `aeano_id` | `bigint` | NO | `` | Año lectivo. |
| `aecronogramatipoevento_id` | `integer` | SÍ | `1` | Tipo de evento (FK a aecronograma_tipoevento). |
| `aecronograma_grupo` | `character varying[]` | SÍ | `` | Grupos a los que aplica. |
| `aeusu_id` | `bigint` | NO | `` | Usuario autor. |
| `aecronograma_estado` | `integer` | SÍ | `1` | Estado (1=activo). |
| `aecronograma_fecharegistro` | `timestamp without time zone` | NO | `CURRENT_TIMESTAMP` | Fecha de registro. |
| `aecronograma_fechainicio` | `timestamp without time zone` | NO | `` | Fecha de inicio del evento. |
| `aecronograma_fechafin` | `timestamp without time zone` | SÍ | `` | Fecha de fin del evento. |
| `aecronograma_titulo` | `text` | NO | `` | Título del evento. |
| `aecronograma_descripcion` | `text` | NO | `` | Descripción del evento. |
| `aecronograma_responsables` | `text` | SÍ | `` | Responsables del evento. |
| `aecronograma_adjunto` | `text` | SÍ | `` | Archivo adjunto. |

**Restricciones:**

- `PK`: PRIMARY KEY (aecronograma_id)

**Índices:**

- `cronograma_pk`: CREATE UNIQUE INDEX cronograma_pk ON data.aecronograma USING btree (aecronograma_id)
- `iaecronograma`: CREATE INDEX iaecronograma ON data.aecronograma USING btree (aeano_id, aeinst_id, aecronogramatipoevento_id, aecronograma_fechainicio)

---

#### `data.aecronograma_alerta` — tabla

**Descripción:** Alertas/recordatorios de eventos del cronograma.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aecronogramaalerta_id` | `integer` | NO | `nextval('data.aecronograma_alerta_aecronogramaalerta_id_seq'::regclass)` | Identificador único de la alerta. |
| `aecronograma_id` | `bigint` | NO | `` | Evento (FK a aecronograma). |
| `aecronogramaalerta_fecha` | `timestamp without time zone` | NO | `CURRENT_TIMESTAMP` | Fecha de la alerta. |

**Restricciones:**

- `PK`: PRIMARY KEY (aecronogramaalerta_id)

**Índices:**

- `alertaspk`: CREATE UNIQUE INDEX alertaspk ON data.aecronograma_alerta USING btree (aecronogramaalerta_id)
- `iaecronograma_alerta`: CREATE INDEX iaecronograma_alerta ON data.aecronograma_alerta USING btree (aecronograma_id, aecronogramaalerta_fecha)

---

#### `data.aecronograma_comentarios` — tabla

**Descripción:** Comentarios a los eventos del cronograma.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aecronogramacomentario_id` | `integer` | NO | `nextval('data.aecronograma_comentarios_aecronogramacomentario_id_seq'::regclass)` | Identificador único del comentario. |
| `aecronograma_id` | `bigint` | NO | `` | Evento (FK a aecronograma). |
| `aeusu_id` | `bigint` | NO | `` | Usuario que comenta. |
| `aecronogramacomentario_descripcion` | `text` | NO | `` | Texto del comentario. |
| `aecronogramacomentario_fecha` | `timestamp without time zone` | SÍ | `CURRENT_TIMESTAMP` | Fecha del comentario. |

**Restricciones:**

- `PK`: PRIMARY KEY (aecronogramacomentario_id)

**Índices:**

- `cronocomentario`: CREATE UNIQUE INDEX cronocomentario ON data.aecronograma_comentarios USING btree (aecronogramacomentario_id)
- `icronocomentario`: CREATE INDEX icronocomentario ON data.aecronograma_comentarios USING btree (aecronograma_id, aecronogramacomentario_fecha)

---

#### `data.aecronograma_tipoevento` — tabla

**Descripción:** Tipos de evento del cronograma (académica, directiva, financiera, etc.).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aecronogramatipoevento_id` | `integer` | NO | `nextval('data.aecronograma_tipoevento_aecronogramatipoevento_id_seq'::regclass)` | Identificador único del tipo de evento. |
| `aecronogramatipoevento_estado` | `integer` | NO | `1` | Estado (1=activo). |
| `aecronogramatipoevento_descripcion` | `text` | NO | `` | Descripción del tipo de evento. |
| `aecronogramatipoevento_color` | `character varying(8)` | SÍ | `'#FBB919'::character varying` | Color asociado al tipo de evento. |

**Restricciones:**

- `PK`: PRIMARY KEY (aecronogramatipoevento_id)

**Índices:**

- `tipoeventopk`: CREATE UNIQUE INDEX tipoeventopk ON data.aecronograma_tipoevento USING btree (aecronogramatipoevento_id)

---

#### `data.aecue` — tabla

**Descripción:** Evaluaciones/cuestionarios (bancos de preguntas).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aecue_id` | `integer` | NO | `` | Identificador único de la evaluación. |
| `aecue_nombre` | `character varying(128)` | NO | `` | Nombre de la evaluación. |
| `aecue_descripcion` | `text` | NO | `` | Descripción de la evaluación. |
| `aecue_imagen` | `character varying(256)` | SÍ | `` | Imagen de la evaluación. |
| `aecue_fechacreacion` | `timestamp without time zone` | NO | `` | Fecha de creación. |
| `aecue_asignatura` | `text` | SÍ | `` | Asignatura(s) a la que aplica. |
| `aecue_estado` | `boolean` | SÍ | `true` | Estado (true=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (aecue_id)

**Índices:**

- `aepre_key`: CREATE UNIQUE INDEX aepre_key ON data.aecue USING btree (aecue_id)

---

#### `data.aediscapacidades` — tabla

**Descripción:** Discapacidades reconocidas (catálogo).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aediscapacidades_id` | `integer` | NO | `` | Identificador único de la discapacidad. |
| `aediscapacidades_descripcion` | `character varying(32)` | NO | `` | Descripción de la discapacidad. |
| `aediscapacidades_estado` | `integer` | SÍ | `1` | Estado (1=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (aediscapacidades_id)

**Índices:**

- `aediscapacidades_pkey`: CREATE UNIQUE INDEX aediscapacidades_pkey ON data.aediscapacidades USING btree (aediscapacidades_id)

---

#### `data.aedocentes` — tabla

**Descripción:** Docentes (usuarios docentes de la agenda).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aedocentes_id` | `double precision` | NO | `nextval('data.secuence_aedocentes_id'::regclass)` | Identificador único del docente. |
| `aeusu_id` | `double precision` | NO | `` | Usuario de login asociado (FK a engine.aeusu). |
| `aedocentes_identificacion` | `character varying(32)` | NO | `` | Documento de identificación del docente. |
| `aedocentes_nombres` | `character varying(64)` | NO | `` | Nombres del docente. |
| `aedocentes_apellidos` | `character varying(64)` | NO | `` | Apellidos del docente. |
| `aedocentes_fechanacimiento` | `date` | SÍ | `` | Fecha de nacimiento. |
| `aedocentes_genero` | `character(1)` | SÍ | `` | Género del docente. |
| `aedocentes_direccion` | `character varying(128)` | SÍ | `` | Dirección. |
| `aedocentes_telefono` | `character varying(32)` | SÍ | `` | Teléfono. |
| `aedocentes_mail` | `character varying(128)` | SÍ | `` | Correo electrónico (único). |
| `aedocentes_url` | `text` | SÍ | `` | URL/perfil en línea del docente. |
| `aedocentes_titulo` | `character varying(128)` | SÍ | `` | Título académico 1. |
| `aedocentes_titulo2` | `character varying(128)` | SÍ | `` | Título académico 2. |
| `aedocentes_titulo3` | `character varying(128)` | SÍ | `` | Título académico 3. |
| `aedocentes_titulo4` | `character varying(128)` | SÍ | `` | Título académico 4. |
| `aedocentes_experiencia` | `text` | SÍ | `` | Experiencia laboral 1. |
| `aedocentes_experiencia2` | `text` | SÍ | `` | Experiencia laboral 2. |
| `aedocentes_experiencia3` | `text` | SÍ | `` | Experiencia laboral 3. |
| `aedocentes_experiencia4` | `text` | SÍ | `` | Experiencia laboral 4. |
| `aedocentes_foto` | `character varying(128)` | SÍ | `` | Foto del docente. |
| `aedocentes_estado` | `integer` | SÍ | `1` | Estado del docente (1=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (aedocentes_id)
- `UNIQUE`: UNIQUE (aedocentes_mail)

**Índices:**

- `aedocentes_pkey`: CREATE UNIQUE INDEX aedocentes_pkey ON data.aedocentes USING btree (aedocentes_id)
- `docentesorder`: CREATE INDEX docentesorder ON data.aedocentes USING btree (aedocentes_fechanacimiento, aeusu_id)
- `unicomail`: CREATE UNIQUE INDEX unicomail ON data.aedocentes USING btree (aedocentes_mail)

---

#### `data.aeeps` — tabla

**Descripción:** EPS (entidades de salud) para afiliación de estudiantes.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aeeps_id` | `integer` | NO | `` | Identificador único de la EPS. |
| `aeeps_estado` | `smallint` | SÍ | `1` | Estado de la EPS. |
| `aeeps_nombre` | `character varying(255)` | NO | `` | Nombre de la EPS. |
| `aeeps_administradora` | `character varying(255)` | SÍ | `` | Administradora de la EPS. |
| `aeeps_nit` | `character varying(12)` | SÍ | `` | NIT de la EPS. |
| `aeeps_codigo` | `character varying(12)` | SÍ | `` | Código de la EPS. |
| `aeeps_tipo` | `character varying(12)` | SÍ | `` | Tipo de la EPS. |

**Restricciones:**

- `PK`: PRIMARY KEY (aeeps_id)

**Índices:**

- `aeeps_pkey`: CREATE UNIQUE INDEX aeeps_pkey ON data.aeeps USING btree (aeeps_id)

---

#### `data.aeestados` — tabla

**Descripción:** Estados generales usados en los registros de todas las tablas.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aeestados_id` | `integer` | NO | `` | Identificador único del estado. |
| `aeestados_descripcion` | `character varying(20)` | SÍ | `` | Descripción del estado (Activo, Inactivo, etc.). |
| `aeestados_style` | `character varying(64)` | SÍ | `` | Estilo CSS asociado al estado. |
| `aeestados_icons` | `character varying(64)` | SÍ | `` | Icono asociado al estado. |

**Restricciones:**

- `PK`: PRIMARY KEY (aeestados_id)

**Índices:**

- `poestados_pkey`: CREATE UNIQUE INDEX poestados_pkey ON data.aeestados USING btree (aeestados_id)

---

#### `data.aeestudiantes` — tabla

**Descripción:** Estudiantes de la agenda escolar.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aeestudiantes_id` | `integer` | NO | `` | Identificador único del estudiante. |
| `aeinstitucion_id` | `double precision` | NO | `` | Institución (FK a aeinstituciones). |
| `aeano_id` | `integer` | NO | `` | Año lectivo (FK a aeano). |
| `aeacudientes_id` | `bigint` | SÍ | `` | Acudiente asociado (FK a aeacudientes). |
| `aeestudiantes_fecharegistro` | `timestamp without time zone` | SÍ | `CURRENT_TIMESTAMP` | Fecha de registro. |
| `aeestudiantes_mail` | `text` | SÍ | `` | Correo electrónico del estudiante. |
| `aeestudiantes_codigo` | `character varying(32)` | SÍ | `` | Código del estudiante. |
| `aeestudiantes_grupo` | `character varying(32)` | NO | `` | Grupo/salón del estudiante. |
| `aeestudiantes_nombres` | `character varying(64)` | NO | `` | Nombres del estudiante. |
| `aeestudiantes_apellidos` | `character varying(64)` | NO | `` | Apellidos del estudiante. |
| `aeestudiantes_identificacion` | `character varying(32)` | SÍ | `` | Documento de identificación. |
| `aeestudiantes_fechanacimiento` | `date` | SÍ | `` | Fecha de nacimiento. |
| `aeestudiantes_genero` | `character(1)` | SÍ | `` | Género del estudiante. |
| `aeestudiantes_direccion` | `text` | SÍ | `` | Dirección. |
| `aeestudiantes_telefono` | `text` | SÍ | `` | Teléfono. |
| `aeusu_id` | `double precision` | SÍ | `700` | Usuario de login asociado (FK a engine.aeusu). |
| `aeestudiantes_estado` | `integer` | SÍ | `8` | Estado del estudiante (FK a aeestados). |

**Restricciones:**

- `PK`: PRIMARY KEY (aeestudiantes_id)

**Índices:**

- `aeestudiantes_aeinstitucion_id_idx`: CREATE INDEX aeestudiantes_aeinstitucion_id_idx ON data.aeestudiantes USING btree (aeinstitucion_id, aeano_id, aeestudiantes_grupo)
- `aeestudiantes_pkey`: CREATE UNIQUE INDEX aeestudiantes_pkey ON data.aeestudiantes USING btree (aeestudiantes_id)

---

#### `data.aeestudiantes_old` — tabla

**Descripción:** Copia/backup de estudiantes.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aeestudiantes_id` | `integer` | NO | `` | Identificador del estudiante. |
| `aeinstitucion_id` | `double precision` | NO | `` | Institución. |
| `aeano_id` | `integer` | NO | `` | Año lectivo. |
| `aeacudientes_id` | `bigint` | SÍ | `` | Acudiente asociado. |
| `aeestudiantes_fecharegistro` | `timestamp without time zone` | NO | `` | Fecha de registro. |
| `aeestudiantes_mail` | `text` | SÍ | `` | Correo electrónico. |
| `aeestudiantes_codigo` | `character varying(32)` | SÍ | `` | Código. |
| `aeestudiantes_grupo` | `character varying(32)` | NO | `` | Grupo/salón. |
| `aeestudiantes_nombres` | `character varying(64)` | NO | `` | Nombres. |
| `aeestudiantes_apellidos` | `character varying(64)` | NO | `` | Apellidos. |
| `aeestudiantes_identificacion` | `character varying(32)` | SÍ | `` | Identificación. |
| `aeestudiantes_fechanacimiento` | `date` | SÍ | `` | Fecha de nacimiento. |
| `aeestudiantes_genero` | `character(1)` | SÍ | `` | Género. |
| `aeestudiantes_direccion` | `text` | SÍ | `` | Dirección. |
| `aeestudiantes_telefono` | `text` | SÍ | `` | Teléfono. |
| `aeusu_id` | `double precision` | SÍ | `700` | Usuario de login. |
| `aeestudiantes_estado` | `integer` | SÍ | `8` | Estado. |

**Restricciones:**

- `PK`: PRIMARY KEY (aeestudiantes_id)

**Índices:**

- `aeestudiantes_old_pkey`: CREATE UNIQUE INDEX aeestudiantes_old_pkey ON data.aeestudiantes_old USING btree (aeestudiantes_id)

---

#### `data.aeetnias` — tabla

**Descripción:** Grupos étnicos (catálogo).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aeetnias_id` | `integer` | NO | `` | Identificador único de la etnia. |
| `aeetnias_descripcion` | `character varying(32)` | NO | `` | Descripción de la etnia. |
| `aeetnias_estado` | `integer` | SÍ | `1` | Estado (1=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (aeetnias_id)

**Índices:**

- `aeetnias_pkey`: CREATE UNIQUE INDEX aeetnias_pkey ON data.aeetnias USING btree (aeetnias_id)

---

#### `data.aeexcusas` — tabla

**Descripción:** Excusas presentadas por estudiantes/acudientes por inasistencias.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aeexcusas_id` | `integer` | NO | `nextval('data.aeexcusas_aeexcusas_id_seq'::regclass)` | Identificador único de la excusa. |
| `aeinst_id` | `bigint` | NO | `` | Institución. |
| `aeanol_id` | `bigint` | NO | `` | Año lectivo. |
| `aeestudiantes_id` | `bigint` | NO | `` | Estudiante (FK a aeestudiantes). |
| `aeexcusas_fecha` | `timestamp without time zone` | NO | `CURRENT_TIMESTAMP` | Fecha de registro de la excusa. |
| `aeexcusas_desde` | `timestamp without time zone` | NO | `` | Fecha de inicio de la inasistencia. |
| `aeexcusas_hasta` | `timestamp without time zone` | NO | `` | Fecha de fin de la inasistencia. |
| `aetipoexcusa_id` | `integer` | NO | `` | Tipo de excusa (FK a aetipoexcusas). |
| `aeexcusas_asignatura` | `text[]` | SÍ | `` | Asignaturas a las que aplica la excusa. |
| `aeexcusas_mensaje` | `text` | NO | `` | Mensaje/justificación de la excusa. |
| `aeexcusas_archivoadjunto` | `text` | SÍ | `` | Archivo adjunto (soporte). |
| `aeexcusas_estado` | `integer` | SÍ | `1` | Estado de la excusa (1=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (aeexcusas_id)
- `FK (latipoexcusa_fkey_)`: FOREIGN KEY (aetipoexcusa_id) REFERENCES data.aetipoexcusas(aetipoexcusa_id) ON UPDATE CASCADE ON DELETE CASCADE

**Índices:**

- `laexcusa_pkey_`: CREATE UNIQUE INDEX laexcusa_pkey_ ON data.aeexcusas USING btree (aeexcusas_id)
- `orden_aeexcusas_`: CREATE INDEX orden_aeexcusas_ ON data.aeexcusas USING btree (aeexcusas_fecha, aeanol_id, aeinst_id, aeestudiantes_id)

---

#### `data.aeexcusas_respuestas` — tabla

**Descripción:** Respuestas de los docentes a las excusas.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aeexcusasrespuestas_id` | `integer` | NO | `nextval('data.aeexcusas_respuestas_aeexcusasrespuestas_id_seq'::regclass)` | Identificador único de la respuesta. |
| `aeexcusas_id` | `bigint` | NO | `` | Excusa (FK a aeexcusas). |
| `aeusu_id` | `bigint` | NO | `` | Usuario que responde. |
| `aeexcusasrespuestas_tipo` | `integer` | NO | `` | Tipo de respuesta. |
| `aeexcusasrespuestas_fecha` | `timestamp without time zone` | SÍ | `CURRENT_TIMESTAMP` | Fecha de la respuesta. |
| `aeexcusasrespuestas_descripcion` | `text` | SÍ | `` | Texto de la respuesta. |

**Restricciones:**

- `PK`: PRIMARY KEY (aeexcusasrespuestas_id)
- `FK (aeexcusas_fkey_)`: FOREIGN KEY (aeexcusas_id) REFERENCES data.aeexcusas(aeexcusas_id) ON UPDATE CASCADE ON DELETE CASCADE

**Índices:**

- `laexcusaresponse_pkey_`: CREATE UNIQUE INDEX laexcusaresponse_pkey_ ON data.aeexcusas_respuestas USING btree (aeexcusasrespuestas_id)
- `orden_aeexcusasrespuestas_`: CREATE INDEX orden_aeexcusasrespuestas_ ON data.aeexcusas_respuestas USING btree (aeexcusasrespuestas_fecha, aeexcusas_id, aeusu_id)

---

#### `data.aegrados` — tabla

**Descripción:** Grados escolares (Jardín a Once).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aegrados_id` | `smallint` | NO | `` | Identificador único del grado. |
| `aegrados_codigo` | `smallint` | NO | `` | Código del grado (ej. -1=Jardín, 11=Once). |
| `aegrados_descripcion` | `character varying(64)` | SÍ | `` | Descripción del grado. |
| `aegrados_estado` | `smallint` | SÍ | `1` | Estado del grado (1=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (aegrados_id)

**Índices:**

- `aegrados_pkey`: CREATE UNIQUE INDEX aegrados_pkey ON data.aegrados USING btree (aegrados_id)

---

#### `data.aegrupos` — vista

**Descripción:** Vista: grupos/salones activos por institución y año, con sus útiles.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aeinstitucion_id` | `double precision` | SÍ | `` | Institución. |
| `aeano_id` | `integer` | SÍ | `` | Año lectivo. |
| `aeestudiantes_grupo` | `character varying(32)` | SÍ | `` | Nombre del grupo/salón. |
| `aegrupos_utiles` | `character varying(256)` | SÍ | `` | Útiles asociados al grupo. |

---

#### `data.aegruposanguineo` — tabla

**Descripción:** Grupos sanguíneos (catálogo).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aegruposanguineo_id` | `integer` | NO | `` | Identificador único del grupo sanguíneo. |
| `aegruposanguineo_descripcion` | `character varying(2)` | NO | `` | Descripción del grupo (A, B, AB, O). |
| `aegruposanguineo_estado` | `integer` | SÍ | `1` | Estado (1=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (aegruposanguineo_id)

**Índices:**

- `aegruposanguineo_pkey`: CREATE UNIQUE INDEX aegruposanguineo_pkey ON data.aegruposanguineo USING btree (aegruposanguineo_id)

---

#### `data.aeinstituciones` — tabla

**Descripción:** Instituciones educativas (clientes de la plataforma).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aeinst_id` | `double precision` | NO | `nextval('data.secuence_aeinst_id'::regclass)` | Identificador único de la institución. |
| `aeusu_id` | `double precision` | NO | `` | Usuario administrador de la institución (FK a engine.aeusu). |
| `aeinst_nombre` | `character varying(128)` | NO | `` | Nombre de la institución. |
| `aeinst_nit` | `character varying(15)` | NO | `` | NIT de la institución. |
| `aeinst_reconocimiento` | `text` | NO | `` | Reconocimiento oficial (resolución) de la institución. |
| `aeinst_direccion` | `character varying(128)` | NO | `` | Dirección de la institución. |
| `aeinst_mail` | `character varying(128)` | NO | `` | Correo electrónico institucional. |
| `aeinst_telefono` | `character varying(128)` | NO | `` | Teléfono principal. |
| `aeinst_telefono2` | `character varying(128)` | SÍ | `` | Teléfono secundario. |
| `aeinst_fax` | `character varying(128)` | SÍ | `` | Fax de la institución. |
| `aeinst_escudo` | `text` | SÍ | `` | Ruta/imagen del escudo institucional. |
| `aeinst_himno` | `text` | SÍ | `` | Texto del himno institucional. |
| `aeinst_lema` | `text` | SÍ | `` | Lema institucional. |
| `aeinst_resolrector` | `text` | SÍ | `` | Resolución rectoral de la institución. |
| `aeinst_manualconvivencia` | `text` | SÍ | `` | Manual de convivencia de la institución. |
| `calendario` | `character varying(8)` | SÍ | `` | Calendario de la institución (A/B). |
| `coordx` | `real` | SÍ | `` | Coordenada X (longitud) para el mapa. |
| `coordy` | `real` | SÍ | `` | Coordenada Y (latitud) para el mapa. |
| `zona` | `character varying(16)` | SÍ | `` | Zona geográfica (urbana/rural). |
| `codigo` | `character varying(4)` | SÍ | `` | Código corto de la institución. |
| `codigo_cg1` | `smallint` | SÍ | `` | Código interno CG1 de la institución. |
| `aeinst_facebook` | `text` | SÍ | `` | URL de Facebook institucional. |
| `aeinst_instagram` | `text` | SÍ | `` | URL de Instagram institucional. |
| `aeinst_youtube` | `text` | SÍ | `` | URL de YouTube institucional. |
| `aeinst_tiktok` | `text` | SÍ | `` | URL de TikTok institucional. |
| `aeinst_twitter` | `text` | SÍ | `` | URL de Twitter institucional. |

**Restricciones:**

- `PK`: PRIMARY KEY (aeinst_id)

**Índices:**

- `aeinsti_pkey`: CREATE UNIQUE INDEX aeinsti_pkey ON data.aeinstituciones USING btree (aeinst_id)

---

#### `data.aeinstituciones_` — tabla

**Descripción:** Copia/backup de instituciones educativas (tabla de respaldo).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aeinst_id` | `double precision` | NO | `nextval('data.secuence_aeinst_id'::regclass)` | Identificador único de la institución. |
| `aeusu_id` | `double precision` | NO | `` | Usuario administrador de la institución. |
| `aeinst_nombre` | `character varying(128)` | NO | `` | Nombre de la institución. |
| `aeinst_nit` | `character varying(15)` | NO | `` | NIT de la institución. |
| `aeinst_reconocimiento` | `text` | NO | `` | Reconocimiento oficial. |
| `aeinst_direccion` | `character varying(128)` | NO | `` | Dirección. |
| `aeinst_mail` | `character varying(128)` | NO | `` | Correo electrónico. |
| `aeinst_telefono` | `character varying(128)` | NO | `` | Teléfono principal. |
| `aeinst_telefono2` | `character varying(128)` | SÍ | `` | Teléfono secundario. |
| `aeinst_fax` | `character varying(128)` | SÍ | `` | Fax. |
| `aeinst_escudo` | `text` | NO | `` | Escudo institucional. |
| `aeinst_himno` | `text` | SÍ | `` | Himno. |
| `aeinst_lema` | `text` | SÍ | `` | Lema. |
| `aeinst_resolrector` | `text` | SÍ | `` | Resolución rectoral. |
| `aeinst_manualconvivencia` | `text` | NO | `` | Manual de convivencia. |

**Restricciones:**

- `PK`: PRIMARY KEY (aeinst_id)

**Índices:**

- `aeinst_pkey_`: CREATE UNIQUE INDEX aeinst_pkey_ ON data.aeinstituciones_ USING btree (aeinst_id)

---

#### `data.aeinstituciones_conf` — tabla

**Descripción:** Configuraciones (parámetros de funcionamiento) por institución y año lectivo.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aeinstconf_id` | `double precision` | NO | `nextval('data.secuence_aeinstconf_id'::regclass)` | Identificador único de la configuración. |
| `aeinst_id` | `double precision` | NO | `` | Institución (FK a aeinstituciones). |
| `aeinstconf_anolectivo` | `integer` | NO | `` | Año lectivo al que aplica la configuración. |
| `aeinstconf_mobile_comunications_notifier` | `boolean` | SÍ | `true` | Habilitar notificador de comunicados hacia dispositivos móviles. |
| `aeinstconf_mobile_comunications_notifier_text` | `text` | SÍ | `'la institución habilitará los comunicados próximamente'::text` | Mensaje mostrado cuando no se pueden ver comunicados. |
| `aeinstconf_mobile_query` | `boolean` | SÍ | `true` | Permitir consultas desde dispositivos móviles. |
| `aeinstconf_mobile_query_text` | `text` | SÍ | `'la institución habilitará las consultas próximamente'::text` | Mensaje cuando no se pueden hacer consultas. |
| `aeinstconf_bitacora_comunications_notifier` | `boolean` | SÍ | `true` | Permitir notificaciones de bitácora en móviles. |
| `aeinstconf_bitacora_comunications_notifier_text` | `text` | SÍ | `'la institución habilitará los registros de observaciones próximamente'::text` | Texto cuando no pueden consultar la bitácora. |
| `aeinstconf_pqr_notifier` | `boolean` | SÍ | `true` | Habilitar PQRS desde dispositivos móviles. |
| `aeinstconf_pqr_notifier_text` | `text` | SÍ | `'la institución habilitará los PQRS próximamente'::text` | Texto cuando no pueden realizar PQRS. |
| `aeinstconf_comments_receivemail` | `boolean` | SÍ | `true` | Recibir correos cuando los móviles hacen comentarios. |
| `aeinstconf_pin_char` | `character varying(3)` | SÍ | `'Q'::"char"` | Letra actual con la que la institución genera el PIN. |
| `aeinstconf_pin_number` | `character varying(3)` | SÍ | `0` | Número actual para generar los PINs. |
| `aeinstconf_excusas_limite` | `integer` | SÍ | `1` | Límite de excusas permitidas. |
| `aeinstconf_asistencias_umbralweek` | `integer` | SÍ | `2` | Umbral semanal para alertas de asistencias. |

**Restricciones:**

- `PK`: PRIMARY KEY (aeinstconf_id)

**Índices:**

- `aeinstconf_pkey`: CREATE UNIQUE INDEX aeinstconf_pkey ON data.aeinstituciones_conf USING btree (aeinstconf_id)
- `institucionesconforder`: CREATE INDEX institucionesconforder ON data.aeinstituciones_conf USING btree (aeinst_id, aeinstconf_anolectivo)

---

#### `data.aeinstitucionesss` — tabla

**Descripción:** Copia/backup adicional de instituciones educativas.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aeinst_id` | `double precision` | NO | `nextval('data.secuence_aeinst_id'::regclass)` | Identificador único de la institución. |
| `aeusu_id` | `double precision` | NO | `` | Usuario administrador. |
| `aeinst_nombre` | `character varying(128)` | NO | `` | Nombre de la institución. |
| `aeinst_nit` | `character varying(15)` | NO | `` | NIT. |
| `aeinst_reconocimiento` | `text` | NO | `` | Reconocimiento oficial. |
| `aeinst_direccion` | `character varying(128)` | NO | `` | Dirección. |
| `aeinst_mail` | `character varying(128)` | NO | `` | Correo electrónico. |
| `aeinst_telefono` | `character varying(128)` | NO | `` | Teléfono principal. |
| `aeinst_telefono2` | `character varying(128)` | SÍ | `` | Teléfono secundario. |
| `aeinst_fax` | `character varying(128)` | SÍ | `` | Fax. |
| `aeinst_escudo` | `text` | NO | `` | Escudo. |
| `aeinst_himno` | `text` | SÍ | `` | Himno. |
| `aeinst_lema` | `text` | SÍ | `` | Lema. |
| `aeinst_resolrector` | `text` | SÍ | `` | Resolución rectoral. |
| `aeinst_manualconvivencia` | `text` | NO | `` | Manual de convivencia. |

**Restricciones:**

- `PK`: PRIMARY KEY (aeinst_id)

**Índices:**

- `aeinst_pkey`: CREATE UNIQUE INDEX aeinst_pkey ON data.aeinstitucionesss USING btree (aeinst_id)

---

#### `data.aejornada` — tabla

**Descripción:** Jornadas escolares (diurna, nocturna, mañana, tarde, única).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aejornada_id` | `integer` | NO | `` | Identificador único de la jornada. |
| `aejornada_descripcion` | `character varying(32)` | NO | `` | Descripción de la jornada. |
| `aejornada_estado` | `integer` | SÍ | `1` | Estado de la jornada (1=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (aejornada_id)

**Índices:**

- `aeetnias_copy1_pkey`: CREATE UNIQUE INDEX aeetnias_copy1_pkey ON data.aejornada USING btree (aejornada_id)

---

#### `data.aelog_envios` — tabla

**Descripción:** Log de envíos de mensajes (WhatsApp) realizados.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `idlogenvios` | `integer` | NO | `nextval('data.aelog_envios_idlogenvios_seq'::regclass)` | Identificador único del envío. |
| `idreferencia` | `bigint` | NO | `` | Referencia del registro que motivó el envío. |
| `idempresa` | `bigint` | NO | `` | Institución (FK a aeinstituciones). |
| `emisor` | `character varying(14)` | NO | `` | Número emisor de WhatsApp. |
| `aeestudiantes_id` | `bigint` | NO | `` | Estudiante relacionado. |
| `destino` | `character varying(20)` | NO | `` | Número de destino. |
| `tipo` | `integer` | NO | `` | Tipo de mensaje (FK a aetipo_envio). |
| `fecharegistro` | `timestamp without time zone` | NO | `CURRENT_TIMESTAMP` | Fecha del envío. |
| `sent` | `boolean` | NO | `false` | Si fue enviado. |
| `enviosdetalles` | `text` | SÍ | `` | Detalles del envío. |

**Restricciones:**

- `PK`: PRIMARY KEY (idlogenvios)

**Índices:**

- `ifk_registroenvios`: CREATE INDEX ifk_registroenvios ON data.aelog_envios USING btree (fecharegistro, idempresa, idreferencia, emisor, aeestudiantes_id, destino)
- `publicidadenvios_pkey`: CREATE UNIQUE INDEX publicidadenvios_pkey ON data.aelog_envios USING btree (idlogenvios)

---

#### `data.aelogdispositivos` — tabla

**Descripción:** Log de accesos/dispositivos de los usuarios.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aelogdispositivos_id` | `integer` | NO | `nextval('data.aelogdispositivos_aelogdispositivos_id_seq'::regclass)` | Identificador único del registro. |
| `aeusu_id` | `double precision` | NO | `` | Usuario. |
| `aelogdispositivos_fecha` | `timestamp without time zone` | NO | `` | Fecha del acceso. |
| `aelogdispositivos_target` | `text` | SÍ | `` | Destino/acción realizada. |
| `aelogdispositivos_state` | `text` | NO | `` | Estado de la acción. |
| `aelogdispositivos_ip` | `text` | SÍ | `` | IP del dispositivo. |
| `aelogdispositivos_model` | `text` | SÍ | `` | Modelo del dispositivo. |
| `aelogdispositivos_platform` | `text` | SÍ | `` | Plataforma (Android/iOS/web). |
| `aelogdispositivos_uuid` | `text` | SÍ | `` | UUID del dispositivo. |
| `aelogdispositivos_version` | `text` | SÍ | `` | Versión de la app. |
| `aelogdispositivos_serial` | `text` | SÍ | `` | Serial del dispositivo. |

**Restricciones:**

- `PK`: PRIMARY KEY (aelogdispositivos_id)

**Índices:**

- `aelogdispositivos_pkey`: CREATE UNIQUE INDEX aelogdispositivos_pkey ON data.aelogdispositivos USING btree (aelogdispositivos_id)
- `orden_logchecheres`: CREATE INDEX orden_logchecheres ON data.aelogdispositivos USING btree (aelogdispositivos_fecha, aeusu_id, aelogdispositivos_target, aelogdispositivos_state)

---

#### `data.aematriculas_academia` — tabla

**Descripción:** Matrícula: información académica previa del estudiante.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aeestudiantesacademia_id` | `integer` | NO | `nextval('data.aematriculas_academia_aeestudiantesacademia_id_seq'::regclass)` | Identificador único del registro. |
| `aeestudiantes_id` | `integer` | SÍ | `` | Estudiante (FK a aematriculas_estudiantes). |
| `aeestudiantesacademia_nuevo` | `boolean` | SÍ | `` | Si es estudiante nuevo. |
| `aeestudiantesacademia_colegio_caracter` | `smallint` | SÍ | `` | Carácter del colegio anterior (FK a aecaracter). |
| `aeestudiantesacademia_colegio_pais` | `smallint` | SÍ | `` | País del colegio anterior. |
| `aeestudiantesacademia_colegio_provincia` | `smallint` | SÍ | `` | Provincia del colegio anterior. |
| `aeestudiantesacademia_colegio_ciudad` | `smallint` | SÍ | `` | Ciudad del colegio anterior. |
| `aeestudiantesacademia_gradomatricula` | `smallint` | NO | `` | Grado al que se matricula. |
| `aeestudiantesacademia_repitente` | `boolean` | NO | `` | Si es repitente. |
| `aeestudiantesacademia_conocernos` | `smallint` | SÍ | `` | Cómo conoció la institución (FK a aeconocer). |
| `aeestudiantesacademia_conocernos_otro` | `character varying(255)` | SÍ | `` | Otra forma de conocer la institución. |

**Restricciones:**

- `PK`: PRIMARY KEY (aeestudiantesacademia_id)
- `FK (comosupo)`: FOREIGN KEY (aeestudiantesacademia_conocernos) REFERENCES data.aeconocer(aeconocer_id) ON UPDATE CASCADE ON DELETE CASCADE
- `FK (estudiantesacad_fk)`: FOREIGN KEY (aeestudiantes_id) REFERENCES data.aematriculas_estudiantes(aeestudiantes_id) ON UPDATE CASCADE ON DELETE CASCADE
- `FK (privpub)`: FOREIGN KEY (aeestudiantesacademia_colegio_caracter) REFERENCES data.aecaracter(aecaracter_id) ON UPDATE CASCADE ON DELETE CASCADE

**Índices:**

- `_copy_4`: CREATE UNIQUE INDEX _copy_4 ON data.aematriculas_academia USING btree (aeestudiantesacademia_id)

---

#### `data.aematriculas_acudientes` — tabla

**Descripción:** Matrícula: datos de los acudientes en el proceso de matrícula.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aeacudientes_id` | `integer` | NO | `nextval('data.aematriculas_acudientes_aeacudientes_id_seq'::regclass)` | Identificador único del acudiente. |
| `aeusu_id` | `integer` | NO | `` | Usuario de login. |
| `aeacudientes_nombres` | `character varying(128)` | NO | `` | Nombres del acudiente. |
| `aeacudientes_apellidos` | `character varying(128)` | NO | `` | Apellidos del acudiente. |
| `aeacudientes_tipoidentificacion` | `smallint` | NO | `` | Tipo de identificación. |
| `aeacudientes_identificacion` | `character varying(16)` | NO | `` | Identificación. |
| `aeacudientes_telresidencia` | `character varying(255)` | SÍ | `` | Teléfono de residencia. |
| `aeacudientes_celpersonal` | `character varying(255)` | SÍ | `` | Celular personal. |
| `aeacudientes_empresatelefono` | `character varying(255)` | SÍ | `` | Teléfono de la empresa. |
| `aeacudientes_mail` | `character varying(128)` | SÍ | `` | Correo electrónico. |
| `aeacudientes_empresa` | `character varying(64)` | SÍ | `` | Empresa donde trabaja. |
| `aeacudientes_empresacargo` | `character varying(64)` | SÍ | `` | Cargo en la empresa. |
| `aeacudientes_empresadireccion` | `character varying(255)` | SÍ | `` | Dirección de la empresa. |
| `aeacudientes_empresario` | `boolean` | SÍ | `` | Si es empresario independiente. |
| `aeacudientes_empresariotipo` | `smallint` | SÍ | `0` | Tipo de empresa (FK a aetipoempresa). |
| `aeacudientes_parentezcootro` | `character varying(32)` | SÍ | `` | Otro parentesco. |

**Restricciones:**

- `PK`: PRIMARY KEY (aeacudientes_id)
- `FK (tiponegocio)`: FOREIGN KEY (aeacudientes_empresariotipo) REFERENCES data.aetipoempresa(aetipoempresa_id) ON UPDATE CASCADE ON DELETE CASCADE

**Índices:**

- `_copy_3`: CREATE UNIQUE INDEX _copy_3 ON data.aematriculas_acudientes USING btree (aeacudientes_id)

---

#### `data.aematriculas_adjuntos` — tabla

**Descripción:** Matrícula: documentos adjuntos del proceso de matrícula.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aeadjuntos_id` | `integer` | NO | `nextval('data.aematriculas_adjuntos_aeadjuntos_id_seq'::regclass)` | Identificador único del registro. |
| `aeestudiantes_id` | `bigint` | NO | `` | Estudiante (FK a aematriculas_estudiantes). |
| `aeadjuntos_fecharegistro` | `timestamp with time zone` | NO | `` | Fecha de registro. |
| `aeadjuntos_documentoestudiante` | `text` | NO | `` | Documento del estudiante. |
| `aeadjuntos_documentootroestudiante` | `text` | SÍ | `` | Otro documento del estudiante. |
| `aeadjuntos_documentoacudiente` | `text` | NO | `` | Documento del acudiente. |
| `aeadjuntos_documentoresponsable` | `text` | NO | `` | Documento del responsable. |
| `aeadjuntos_fotoestudiante` | `text` | NO | `` | Foto del estudiante. |
| `aeadjuntos_fotoacudiente` | `text` | NO | `` | Foto del acudiente. |
| `aeadjuntos_fotorespfinanciero` | `text` | NO | `` | Foto del responsable financiero. |
| `aeadjuntos_facturaservicios` | `text` | NO | `` | Factura de servicios públicos. |
| `adjuntos_certificadomedico` | `text` | SÍ | `` | Certificado médico. |
| `aeadjuntos_vacunas` | `text` | SÍ | `` | Carné de vacunas. |
| `aeadjuntos_epsafiliacion` | `text` | NO | `` | Afiliación a EPS. |
| `aeadjuntos_pagadamatricula` | `text` | SÍ | `` | Pago de matrícula. |
| `aeadjuntos_pagadaotroscostos` | `text` | SÍ | `` | Pago de otros costos. |
| `aeadjuntos_contrato` | `text` | SÍ | `` | Contrato. |
| `aeadjuntos_pagare` | `text` | SÍ | `` | Pagaré. |
| `aeadjuntos_cartalaboral` | `text` | NO | `` | Carta laboral. |

**Restricciones:**

- `PK`: PRIMARY KEY (aeadjuntos_id)
- `FK (elestudiante)`: FOREIGN KEY (aeestudiantes_id) REFERENCES data.aematriculas_estudiantes(aeestudiantes_id) ON UPDATE CASCADE ON DELETE CASCADE

**Índices:**

- `aeadjuntos_pkey`: CREATE UNIQUE INDEX aeadjuntos_pkey ON data.aematriculas_adjuntos USING btree (aeadjuntos_id)

---

#### `data.aematriculas_demografia` — tabla

**Descripción:** Matrícula: datos demográficos y de salud del estudiante.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aeestudiantesdemografia_id` | `integer` | NO | `nextval('data.aematriculas_demografia_aeestudiantesdemografia_id_seq'::regclass)` | Identificador único del registro. |
| `aeestudiantes_id` | `integer` | NO | `` | Estudiante (FK a aematriculas_estudiantes). |
| `aeestudiantesdemografia_fecharegistro` | `timestamp(6) without time zone` | NO | `` | Fecha de registro. |
| `aeestudiantesdemografia_talla` | `text` | SÍ | `` | Talla. |
| `aeestudiantesdemografia_peso` | `numeric` | SÍ | `` | Peso. |
| `aeestudiantesdemografia_gruposanguineo` | `integer` | SÍ | `` | Grupo sanguíneo (FK a aegruposanguineo). |
| `aeestudiantesdemografia_rh` | `character(1)` | SÍ | `` | Factor RH. |
| `aeestudiantesdemografia_discapacidad` | `integer` | SÍ | `` | Discapacidad (FK a aediscapacidades). |
| `aeestudiantesdemografia_discapacidad_otra` | `character varying(32)` | SÍ | `` | Otra discapacidad. |
| `aeestudiantesdemografia_sisben` | `boolean` | SÍ | `true` | Si tiene SISBEN. |
| `aeestudiantesdemografia_sisbennivel` | `numeric` | NO | `` | Nivel SISBEN. |
| `aeestudiantesdemografia_eps` | `integer` | NO | `` | EPS (FK a aeeps). |
| `aeestudiantesdemografia_direccion` | `text` | SÍ | `` | Dirección. |
| `aeestudiantesdemografia_barrio` | `text` | SÍ | `` | Barrio. |
| `aeestudiantesdemografia_comuna` | `integer` | SÍ | `` | Comuna. |
| `aeestudiantesdemografia_estrato` | `integer` | SÍ | `` | Estrato socioeconómico. |
| `aeestudiantesdemografia_mupionacimiento` | `integer` | SÍ | `` | Municipio de nacimiento. |
| `aeestudiantesdemografia_deptonacimiento` | `integer` | SÍ | `` | Departamento de nacimiento. |
| `aeestudiantesdemografia_paisnacimiento` | `integer` | SÍ | `` | País de nacimiento. |
| `aeestudiantesdemografia_desplazado` | `boolean` | SÍ | `` | Si es desplazado. |
| `aeestudiantesdemografia_cantidadhermanos` | `integer` | SÍ | `` | Número de hermanos. |
| `aeestudiantesdemografia_cantidadhermanas` | `integer` | SÍ | `` | Número de hermanas. |
| `aeestudiantesdemografia_cirugias` | `boolean` | SÍ | `` | Si ha tenido cirugías. |
| `aeestudiantesdemografia_cirugias_cual` | `character varying(255)` | SÍ | `` | Detalle de cirugías. |
| `aeestudiantesdemografia_tratamientoterapia` | `boolean` | SÍ | `` | Si está en tratamiento/terapia. |
| `aeestudiantesdemografia_tratamientoterapia_cual` | `character varying(255)` | SÍ | `` | Detalle del tratamiento. |
| `aeestudiantesdemografia_etnia` | `smallint` | SÍ | `0` | Etnia (FK a aeetnias). |

**Restricciones:**

- `PK`: PRIMARY KEY (aeestudiantesdemografia_id)
- `FK (aematriculas_demografia_fk)`: FOREIGN KEY (aeestudiantes_id) REFERENCES data.aematriculas_estudiantes(aeestudiantes_id) ON UPDATE CASCADE ON DELETE CASCADE
- `FK (discapacidad_fk)`: FOREIGN KEY (aeestudiantesdemografia_discapacidad) REFERENCES data.aediscapacidades(aediscapacidades_id) ON UPDATE CASCADE ON DELETE CASCADE
- `FK (laeps)`: FOREIGN KEY (aeestudiantesdemografia_eps) REFERENCES data.aeeps(aeeps_id) ON UPDATE CASCADE ON DELETE CASCADE
- `FK (laetnia)`: FOREIGN KEY (aeestudiantesdemografia_etnia) REFERENCES data.aeetnias(aeetnias_id) ON UPDATE CASCADE ON DELETE CASCADE
- `FK (tiposangre)`: FOREIGN KEY (aeestudiantesdemografia_gruposanguineo) REFERENCES data.aegruposanguineo(aegruposanguineo_id) ON UPDATE CASCADE ON DELETE CASCADE

**Índices:**

- `aeestudiantesdemografia_pkey`: CREATE UNIQUE INDEX aeestudiantesdemografia_pkey ON data.aematriculas_demografia USING btree (aeestudiantesdemografia_id)
- `idemografiax`: CREATE INDEX idemografiax ON data.aematriculas_demografia USING btree (aeestudiantesdemografia_fecharegistro, aeestudiantesdemografia_comuna, aeestudiantesdemografia_estrato)

---

#### `data.aematriculas_estudiantes` — tabla

**Descripción:** Matrícula: datos del estudiante en el proceso de matrícula.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aeestudiantes_id` | `integer` | NO | `nextval('data.aematriculas_estudiantes_aeestudiantes_id_seq'::regclass)` | Identificador único del estudiante (FK a aeestudiantes). |
| `aeinstitucion_id` | `integer` | NO | `` | Institución. |
| `aeano_id` | `integer` | NO | `` | Año lectivo. |
| `aeusu_id` | `integer` | SÍ | `` | Usuario que registra. |
| `aeacudientes_id` | `bigint` | SÍ | `` | Acudiente asociado. |
| `aeestudiantes_fecharegistro` | `timestamp(6) without time zone` | NO | `` | Fecha de registro. |
| `aeestudiantes_estado` | `smallint` | SÍ | `` | Estado de la matrícula. |
| `aeestudiantes_grado` | `smallint` | SÍ | `` | Grado (FK a aegrados). |
| `aeestudiantes_grupo` | `character varying(32)` | SÍ | `` | Grupo/salón. |
| `aeestudiantes_nombres` | `character varying(64)` | NO | `` | Nombres del estudiante. |
| `aeestudiantes_apellidos` | `character varying(64)` | NO | `` | Apellidos del estudiante. |
| `aeestudiantes_tipodocumento` | `smallint` | SÍ | `2` | Tipo de documento (FK a aetipodocumento). |
| `aeestudiantes_identificacion` | `character varying(32)` | SÍ | `` | Identificación. |
| `aeestudiantes_fechanacimiento` | `date` | SÍ | `` | Fecha de nacimiento. |
| `aeestudiantes_genero` | `character(1)` | SÍ | `` | Género. |
| `aeestudiantes_direccion` | `text` | SÍ | `` | Dirección. |
| `aeestudiantes_telefono` | `text` | SÍ | `` | Teléfono. |
| `aeestudiantes_mail` | `text` | SÍ | `` | Correo. |
| `aeestudiantes_codigo` | `character varying(32)` | SÍ | `` | Código. |
| `aeestudiantes_jornada` | `smallint` | SÍ | `` | Jornada (FK a aejornada). |

**Restricciones:**

- `PK`: PRIMARY KEY (aeestudiantes_id)
- `FK (elacademico)`: FOREIGN KEY (aeestudiantes_id) REFERENCES data.aeestudiantes(aeestudiantes_id) ON UPDATE CASCADE ON DELETE CASCADE
- `FK (elgrado)`: FOREIGN KEY (aeestudiantes_grado) REFERENCES data.aegrados(aegrados_id) ON UPDATE CASCADE ON DELETE CASCADE
- `FK (eltipodoc)`: FOREIGN KEY (aeestudiantes_tipodocumento) REFERENCES data.aetipodocumento(aetipodocumento_id) ON UPDATE CASCADE ON DELETE CASCADE
- `FK (lajornada)`: FOREIGN KEY (aeestudiantes_jornada) REFERENCES data.aejornada(aejornada_id) ON UPDATE CASCADE ON DELETE CASCADE

**Índices:**

- `aeestudiantesmat_pkey`: CREATE UNIQUE INDEX aeestudiantesmat_pkey ON data.aematriculas_estudiantes USING btree (aeestudiantes_id)

---

#### `data.aemediciones` — tabla

**Descripción:** Mediciones/valoraciones (conceptos evaluados) de los estudiantes.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aemediciones_id` | `double precision` | NO | `` | Identificador único de la medición. |
| `aeusu_id` | `double precision[]` | NO | `` | Usuarios destinatarios. |
| `aemediciones_concepto` | `text` | NO | `` | Concepto evaluado. |
| `aemediciones_estudiante` | `double precision` | NO | `` | Estudiante evaluado. |
| `aemediciones_grupo` | `character varying(32)` | SÍ | `` | Grupo/salón. |
| `aemediciones_valor` | `double precision` | NO | `` | Valor de la medición. |
| `aemediciones_fecha` | `timestamp without time zone` | NO | `` | Fecha de la medición. |
| `aelogdispositivos_source` | `text` | SÍ | `` | Origen del registro. |
| `aelogdispositivos_model` | `text` | SÍ | `` | Modelo del dispositivo. |
| `aelogdispositivos_platform` | `text` | SÍ | `` | Plataforma. |
| `aelogdispositivos_uuid` | `text` | SÍ | `` | UUID. |
| `aelogdispositivos_version` | `text` | SÍ | `` | Versión. |
| `aelogdispositivos_serial` | `text` | SÍ | `` | Serial. |

**Restricciones:**

- `PK`: PRIMARY KEY (aemediciones_id)

**Índices:**

- `aemediciones_pkey`: CREATE UNIQUE INDEX aemediciones_pkey ON data.aemediciones USING btree (aemediciones_id)
- `orden_aemediciones`: CREATE INDEX orden_aemediciones ON data.aemediciones USING btree (aemediciones_fecha, aemediciones_concepto, aemediciones_grupo)

---

#### `data.aemotivo` — tabla

**Descripción:** Motivos de citación (catálogo).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aemotivo_id` | `integer` | NO | `` | Identificador único del motivo. |
| `aemotivo_nombre` | `character varying` | NO | `` | Nombre del motivo (Agresión, Evasión, etc.). |
| `aeestados_id` | `integer` | NO | `` | Estado asociado (FK a aeestados). |

**Restricciones:**

- `PK`: PRIMARY KEY (aemotivo_id)

**Índices:**

- `aemotivo_pkey`: CREATE UNIQUE INDEX aemotivo_pkey ON data.aemotivo USING btree (aemotivo_id)

---

#### `data.aenotas` — vista materializada

**Descripción:** NOTAS DE LOS ESTUDIANTES DURANTE EL ANO LECTIVO, 1:EVALUACIONES, 2:TAREAS, ETC.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aenota_id` | `bigint` | SÍ | `` |  |
| `aenota_fecha` | `timestamp with time zone` | SÍ | `` |  |
| `aenota_tipo` | `integer` | SÍ | `` |  |
| `aenota_fuenteid` | `bigint` | SÍ | `` |  |
| `aenota_referenciaid` | `bigint` | SÍ | `` |  |
| `aeestudiantes_id` | `bigint` | SÍ | `` |  |
| `aeinst_id` | `double precision` | SÍ | `` |  |
| `aeanol_id` | `bigint` | SÍ | `` |  |
| `aeestudiantes_grupo` | `character varying(32)` | SÍ | `` |  |
| `aenota_resultado` | `double precision` | SÍ | `` |  |
| `aenota_estado` | `integer` | SÍ | `` |  |

**Índices:**

- `index_aenota_estudiantes`: CREATE INDEX index_aenota_estudiantes ON data.aenotas USING btree (aenota_fecha, aeanol_id, aeinst_id, aeestudiantes_grupo, aeestudiantes_id)

---

#### `data.aenotificaciones` — tabla

**Descripción:** Notificaciones internas generadas para los usuarios (inbox).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aenotificaciones_id` | `double precision` | NO | `` | Identificador único de la notificación. |
| `aenotificaciones_de` | `double precision` | NO | `` | Usuario remitente. |
| `aenotificaciones_para` | `double precision[]` | NO | `` | Usuarios destinatarios. |
| `aenotificaciones_fecha` | `timestamp without time zone` | NO | `` | Fecha de la notificación. |
| `aenotificaciones_title` | `text` | SÍ | `` | Título de la notificación. |
| `aenotificaciones_body` | `text` | SÍ | `` | Cuerpo de la notificación. |
| `aenotificaciones_ruta` | `text` | SÍ | `` | Ruta/URL de destino al abrir. |
| `aenotificaciones_referencia` | `double precision` | NO | `` | Referencia al registro origen. |
| `aenotificaciones_data` | `text` | NO | `` | Datos adicionales. |
| `aenotificaciones_estado` | `integer` | SÍ | `11` | Estado de la notificación (FK a aeestados). |

**Restricciones:**

- `PK`: PRIMARY KEY (aenotificaciones_id)

**Índices:**

- `aenotify_pkey`: CREATE UNIQUE INDEX aenotify_pkey ON data.aenotificaciones USING btree (aenotificaciones_id)
- `orden_aenotificaciones`: CREATE INDEX orden_aenotificaciones ON data.aenotificaciones USING gin (aenotificaciones_para)
- `orden_aenotificaciones2`: CREATE INDEX orden_aenotificaciones2 ON data.aenotificaciones USING btree (aenotificaciones_fecha)
- `orden_aenotificaciones3`: CREATE INDEX orden_aenotificaciones3 ON data.aenotificaciones USING btree (aenotificaciones_ruta DESC NULLS LAST)

---

#### `data.aeopcres` — tabla

**Descripción:** Opciones de respuesta para las preguntas de un cuestionario.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aeopcres_id` | `integer` | NO | `nextval('data.aeopcres_aeopcres_id_seq'::regclass)` | Identificador único de la opción. |
| `aepre_id` | `bigint` | NO | `` | Pregunta a la que pertenece (FK a aepre). |
| `aeopcres_descripcion` | `text` | NO | `` | Texto de la opción. |
| `aeopcres_orden` | `integer` | SÍ | `` | Orden de la opción. |
| `aeopcres_valor` | `double precision` | SÍ | `` | Valor/puntaje de la opción. |
| `aeopcres_estado` | `boolean` | SÍ | `true` | Estado (true=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (aeopcres_id)
- `FK (aeopcres_aepre_id_fkey)`: FOREIGN KEY (aepre_id) REFERENCES data.aepre(aepre_id) ON UPDATE CASCADE ON DELETE CASCADE

**Índices:**

- `aeopcres_fkindex1`: CREATE INDEX aeopcres_fkindex1 ON data.aeopcres USING btree (aepre_id)
- `aeopcres_pkey`: CREATE UNIQUE INDEX aeopcres_pkey ON data.aeopcres USING btree (aeopcres_id)
- `ifk_preg_opc`: CREATE INDEX ifk_preg_opc ON data.aeopcres USING btree (aepre_id)

---

#### `data.aepqr` — tabla

**Descripción:** PQRS (peticiones, quejas, reclamos y sugerencias/felicitaciones) de los usuarios.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aepqr_id` | `integer` | NO | `` | Identificador único del PQRS. |
| `aepqr_fecha` | `timestamp(6) without time zone` | NO | `` | Fecha del PQRS. |
| `aepqr_nombre` | `text` | NO | `` | Nombre del solicitante. |
| `aepqr_telefono` | `character varying(13)` | SÍ | `` | Teléfono del solicitante. |
| `aepqr_email` | `character varying(64)` | NO | `` | Correo del solicitante. |
| `aepqr_usuario` | `integer` | NO | `` | Usuario que registra (FK a engine.aeusu). |
| `aepqr_tiposolicitud_id` | `integer` | NO | `` | Tipo de solicitud (FK a aepqr_tiposolicitud). |
| `aepqr_contenido` | `text` | NO | `` | Contenido del PQRS. |
| `aeinst_id` | `integer` | NO | `` | Institución (FK a aeinstituciones). |
| `aepqr_adjunto` | `character varying(500)` | SÍ | `` | Archivo adjunto. |
| `aeano_id` | `integer` | SÍ | `` | Año lectivo. |
| `aeestados_id` | `integer` | SÍ | `` | Estado del PQRS (FK a aeestados). |

**Restricciones:**

- `PK`: PRIMARY KEY (aepqr_id)
- `FK (aepqr_pqr_tiposolicitud_fkey)`: FOREIGN KEY (aepqr_tiposolicitud_id) REFERENCES data.aepqr_tiposolicitud(aepqr_tiposolicitud_id) ON UPDATE CASCADE ON DELETE CASCADE

**Índices:**

- `aepqr_pqr_pkey`: CREATE UNIQUE INDEX aepqr_pqr_pkey ON data.aepqr USING btree (aepqr_id)
- `prqorder`: CREATE INDEX prqorder ON data.aepqr USING btree (aeano_id, aeinst_id, aepqr_fecha, aepqr_tiposolicitud_id, aeestados_id)

---

#### `data.aepqr_respuesta` — tabla

**Descripción:** Respuestas a los PQRS.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aepqr_respuesta_id` | `integer` | NO | `` | Identificador único de la respuesta. |
| `aepqr_id` | `integer` | SÍ | `` | PQRS respondido (FK a aepqr, único). |
| `aepqr_respuesta_mensaje` | `text` | SÍ | `` | Texto de la respuesta. |
| `aepqr_respuesta_fecha` | `timestamp(6) without time zone` | SÍ | `` | Fecha de la respuesta. |
| `aepqr_respuesta_adjunto` | `character varying(128)` | SÍ | `` | Archivo adjunto. |

**Restricciones:**

- `PK`: PRIMARY KEY (aepqr_respuesta_id)
- `UNIQUE`: UNIQUE (aepqr_id)
- `FK (aepqr_respuesta_id_fkey)`: FOREIGN KEY (aepqr_id) REFERENCES data.aepqr(aepqr_id) ON UPDATE CASCADE ON DELETE CASCADE

**Índices:**

- `pk_respuestas`: CREATE UNIQUE INDEX pk_respuestas ON data.aepqr_respuesta USING btree (aepqr_respuesta_id)
- `prqrespuestaorder`: CREATE INDEX prqrespuestaorder ON data.aepqr_respuesta USING btree (aepqr_respuesta_fecha)
- `solounarespuesta`: CREATE UNIQUE INDEX solounarespuesta ON data.aepqr_respuesta USING btree (aepqr_id)

---

#### `data.aepqr_tiposolicitud` — tabla

**Descripción:** Tipos de solicitud PQRS (Petición, Quejas, Reclamos, Felicitaciones).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aepqr_tiposolicitud_id` | `integer` | NO | `nextval('data.aepqr_tiposolicitud_aepqr_tiposolicitud_id_seq'::regclass)` | Identificador único del tipo de solicitud. |
| `aepqr_tiposolicitud_descripcion` | `character varying(16)` | SÍ | `` | Descripción del tipo de solicitud. |
| `aepqr_tiposolicitud_vencimiento` | `integer` | SÍ | `` | Días para el vencimiento de la respuesta. |

**Restricciones:**

- `PK`: PRIMARY KEY (aepqr_tiposolicitud_id)

**Índices:**

- `aetiposolicitud_pkey`: CREATE UNIQUE INDEX aetiposolicitud_pkey ON data.aepqr_tiposolicitud USING btree (aepqr_tiposolicitud_id)

---

#### `data.aepre` — tabla

**Descripción:** Preguntas de un cuestionario/evaluación.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aepre_id` | `bigint` | NO | `nextval('data.aepre_aecue_id_seq'::regclass)` | Identificador único de la pregunta. |
| `aecue_id` | `bigint` | NO | `` | Evaluación a la que pertenece (FK a aecue). |
| `aetippre_id` | `integer` | NO | `` | Tipo de pregunta (FK a aetippre). |
| `aepre_descripcion` | `text` | NO | `` | Enunciado de la pregunta. |
| `aepre_fechacreacion` | `timestamp without time zone` | SÍ | `` | Fecha de creación. |
| `aepre_orden` | `integer` | SÍ | `1` | Orden de la pregunta. |
| `aepre_estado` | `boolean` | SÍ | `true` | Estado (true=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (aepre_id)
- `FK (aepre_aetippre_id_fkey)`: FOREIGN KEY (aetippre_id) REFERENCES data.aetippre(aetippre_id) ON UPDATE CASCADE ON DELETE CASCADE

**Índices:**

- `aepre_fkindex1`: CREATE INDEX aepre_fkindex1 ON data.aepre USING btree (aecue_id)
- `aepre_fkindex2`: CREATE INDEX aepre_fkindex2 ON data.aepre USING btree (aetippre_id)
- `aepre_pkey`: CREATE UNIQUE INDEX aepre_pkey ON data.aepre USING btree (aepre_id)
- `ifk_cue_pre`: CREATE INDEX ifk_cue_pre ON data.aepre USING btree (aecue_id)
- `ifk_preg_tipo`: CREATE INDEX ifk_preg_tipo ON data.aepre USING btree (aetippre_id)

---

#### `data.aepublicaciones` — tabla

**Descripción:** Publicaciones generales (noticias, anuncios) de la institución.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aepublicaciones_id` | `bigint` | NO | `` | Identificador único de la publicación. |
| `aeusu_id` | `bigint` | NO | `` | Usuario autor. |
| `aeinst_id` | `bigint[]` | NO | `` | Instituciones a las que aplica. |
| `aeanol_id` | `bigint` | NO | `` | Año lectivo. |
| `aepublicaciones_grupo` | `character varying[]` | SÍ | `` | Grupos a los que aplica. |
| `aepublicaciones_estudiantesid` | `bigint[]` | SÍ | `` | Estudiantes específicos. |
| `aepublicaciones_fecha` | `timestamp without time zone` | NO | `` | Fecha de creación. |
| `aepublicaciones_fechapublicacion` | `timestamp without time zone` | NO | `` | Fecha de publicación. |
| `aepublicaciones_fechafinalizacion` | `timestamp without time zone` | NO | `` | Fecha de finalización. |
| `aepublicaciones_titulo` | `text` | NO | `` | Título. |
| `aepublicaciones_descripcion` | `text` | NO | `` | Descripción. |
| `aepublicaciones_adjunto` | `text` | SÍ | `` | Archivo adjunto. |
| `aepublicaciones_estado` | `integer` | SÍ | `1` | Estado (1=activo). |
| `aepublicaciones_alcance` | `integer` | SÍ | `1` | Alcance de la publicación. |
| `aepublicaciones_aceptarespuestas` | `boolean` | SÍ | `true` | Si acepta respuestas. |
| `aepublicacionestipo_id` | `integer` | SÍ | `0` | Tipo de publicación (FK a aepublicaciones_tipo). |

**Restricciones:**

- `PK`: PRIMARY KEY (aepublicaciones_id)
- `FK (elanopublicaciones)`: FOREIGN KEY (aeanol_id) REFERENCES data.aeano(aeano_id) ON UPDATE CASCADE ON DELETE CASCADE

**Índices:**

- `aepublicaciones_pkey`: CREATE UNIQUE INDEX aepublicaciones_pkey ON data.aepublicaciones USING btree (aepublicaciones_id)
- `orden_publicaciones`: CREATE INDEX orden_publicaciones ON data.aepublicaciones USING btree (aepublicaciones_fecha, aeanol_id, aeinst_id, aepublicacionestipo_id)

---

#### `data.aepublicaciones_alerta` — tabla

**Descripción:** Alertas/recordatorios de publicaciones.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aepublicacionesalerta_id` | `integer` | NO | `nextval('data.aepublicaciones_alerta_aepublicacionesalerta_id_seq'::regclass)` | Identificador único de la alerta. |
| `aepublicaciones_id` | `bigint` | NO | `` | Publicación (FK a aepublicaciones). |
| `aepublicacionesalerta_fecha` | `timestamp without time zone` | NO | `CURRENT_TIMESTAMP` | Fecha de la alerta. |

**Restricciones:**

- `PK`: PRIMARY KEY (aepublicacionesalerta_id)
- `FK (alertapublicaciones)`: FOREIGN KEY (aepublicaciones_id) REFERENCES data.aepublicaciones(aepublicaciones_id) ON UPDATE CASCADE ON DELETE CASCADE

**Índices:**

- `alertaspublicacionespk`: CREATE UNIQUE INDEX alertaspublicacionespk ON data.aepublicaciones_alerta USING btree (aepublicacionesalerta_id)
- `iaepublicaciones_alerta`: CREATE INDEX iaepublicaciones_alerta ON data.aepublicaciones_alerta USING btree (aepublicaciones_id, aepublicacionesalerta_fecha)

---

#### `data.aepublicaciones_comentarios` — tabla

**Descripción:** Comentarios a las publicaciones.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aepublicacionescomentarios_id` | `bigint` | NO | `` | Identificador único del comentario. |
| `aepublicaciones_id` | `bigint` | NO | `` | Publicación (FK a aepublicaciones). |
| `aeusu_id` | `bigint` | NO | `` | Usuario que comenta. |
| `aepublicacionescomentarios_fecha` | `timestamp without time zone` | NO | `` | Fecha del comentario. |
| `aepublicacionescomentarios_descripcion` | `text` | NO | `` | Texto del comentario. |
| `aepublicacionescomentarios_estado` | `integer` | SÍ | `1` | Estado (1=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (aepublicacionescomentarios_id)
- `FK (aepublicacionescomentarios_fkey)`: FOREIGN KEY (aepublicaciones_id) REFERENCES data.aepublicaciones(aepublicaciones_id) ON UPDATE CASCADE ON DELETE CASCADE

**Índices:**

- `aepublicacionescomentarios_pkey`: CREATE UNIQUE INDEX aepublicacionescomentarios_pkey ON data.aepublicaciones_comentarios USING btree (aepublicacionescomentarios_id)
- `orden_comentariospublicaciones`: CREATE INDEX orden_comentariospublicaciones ON data.aepublicaciones_comentarios USING btree (aepublicacionescomentarios_fecha, aeusu_id, aepublicaciones_id)

---

#### `data.aepublicaciones_tipo` — tabla

**Descripción:** Tipos de publicación (catálogo con color).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aepublicacionestipo_id` | `integer` | NO | `nextval('data.aepublicaciones_tipo_aepublicacionestipo_id_seq'::regclass)` | Identificador único del tipo. |
| `aepublicacionestipo_estado` | `integer` | NO | `1` | Estado (1=activo). |
| `aepublicacionestipo_descripcion` | `text` | NO | `` | Descripción del tipo. |
| `aepublicacionestipo_color` | `character varying(8)` | SÍ | `'#FBB919'::character varying` | Color asociado al tipo. |

**Restricciones:**

- `PK`: PRIMARY KEY (aepublicacionestipo_id)

**Índices:**

- `tipopublicacionespk`: CREATE UNIQUE INDEX tipopublicacionespk ON data.aepublicaciones_tipo USING btree (aepublicacionestipo_id)

---

#### `data.aeres` — tabla

**Descripción:** Respuestas dadas a las preguntas de un cuestionario en un intento.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aeres_id` | `bigint` | NO | `` | Identificador único de la respuesta. |
| `inst_cue_res_id` | `bigint` | NO | `` | Intento (FK a inst_cue_res). |
| `aepre_id` | `bigint` | NO | `` | Pregunta respondida (FK a aepre). |
| `aeopcres_id` | `integer` | SÍ | `` | Opción elegida (FK a aeopcres). |
| `aeresp_abierta` | `text` | SÍ | `` | Respuesta abierta (texto libre). |

**Restricciones:**

- `PK`: PRIMARY KEY (aeres_id)
- `FK (aeres_fk)`: FOREIGN KEY (inst_cue_res_id) REFERENCES data.inst_cue_res(inst_cue_res_id) ON UPDATE CASCADE ON DELETE CASCADE

**Índices:**

- `iddelarespuestaelegida`: CREATE UNIQUE INDEX iddelarespuestaelegida ON data.aeres USING btree (aeres_id)

---

#### `data.aesolicitud` — tabla

**Descripción:** Solicitudes de certificados (paz y salvo, notas, matrícula, etc.).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aesolicitud_id` | `double precision` | NO | `` | Identificador único de la solicitud. |
| `aeanol_id` | `integer` | NO | `` | Año lectivo. |
| `aeinst_id` | `integer` | NO | `` | Institución (FK a aeinstituciones). |
| `aeusu_id` | `integer` | NO | `` | Usuario que solicita. |
| `aetipo_certicado` | `integer` | NO | `` | Tipo de certificado (FK a aetipo_certificado). |
| `aesolicitud_mensaje` | `text` | NO | `` | Mensaje de la solicitud. |
| `aesolicitud_destino` | `character varying(128)` | SÍ | `'Reclamar en secretaría del colegio'::character varying` | Destino/forma de entrega del certificado. |
| `aesolicitud_estado` | `integer` | SÍ | `1` | Estado de la solicitud. |
| `aesolicitud_fecha` | `date` | SÍ | `('now'::text)::date` | Fecha de la solicitud. |
| `aesolicitud_hora` | `time without time zone` | SÍ | `('now'::text)::time without time zone` | Hora de la solicitud. |

**Restricciones:**

- `PK`: PRIMARY KEY (aesolicitud_id)
- `FK (aesolicitud_aeinstituciones_fk)`: FOREIGN KEY (aeinst_id) REFERENCES data.aeinstituciones(aeinst_id) ON UPDATE CASCADE ON DELETE CASCADE

**Índices:**

- `aesolicitud_pkey`: CREATE UNIQUE INDEX aesolicitud_pkey ON data.aesolicitud USING btree (aesolicitud_id)
- `solicitudorder`: CREATE INDEX solicitudorder ON data.aesolicitud USING btree (aeanol_id, aeinst_id, aesolicitud_fecha, aetipo_certicado)

---

#### `data.aetar` — tabla

**Descripción:** Tareas (plantillas de homework).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aetar_id` | `bigint` | NO | `` | Identificador único de la tarea. |
| `aetar_fechacreacion` | `timestamp without time zone` | NO | `` | Fecha de creación. |
| `aetar_nombre` | `character varying(128)` | NO | `` | Nombre de la tarea. |
| `aetar_descripcion` | `text` | NO | `` | Descripción de la tarea. |
| `aetar_adjunto1` | `character varying(256)` | SÍ | `` | Adjunto 1. |
| `aetar_adjunto2` | `character varying(256)` | SÍ | `` | Adjunto 2. |
| `aetar_adjunto3` | `character varying(256)` | SÍ | `` | Adjunto 3. |
| `aetar_estado` | `integer` | SÍ | `1` | Estado (1=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (aetar_id)

**Índices:**

- `aetar_key`: CREATE UNIQUE INDEX aetar_key ON data.aetar USING btree (aetar_id)

---

#### `data.aetar_pro` — tabla

**Descripción:** Programación de tareas (asignación de una tarea a un grupo/institución/año).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aetar_pro_id` | `bigint` | NO | `` | Identificador único de la programación. |
| `aetar_id` | `bigint` | NO | `` | Tarea (FK a aetar). |
| `aeinst_id` | `bigint` | NO | `` | Institución. |
| `aeanol_id` | `bigint` | NO | `` | Año lectivo. |
| `aedocentes_id` | `bigint` | NO | `` | Docente que asigna. |
| `aeestudiantes_grupo` | `character varying(32)` | NO | `` | Grupo/salón. |
| `aeasignaciones_asignatura` | `character varying(64)` | NO | `` | Asignatura. |
| `aetar_pro_fechalimite` | `timestamp without time zone` | NO | `` | Fecha límite de entrega. |
| `aetar_pro_estado` | `integer` | SÍ | `1` | Estado (1=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (aetar_pro_id)
- `FK (tarprofk)`: FOREIGN KEY (aetar_id) REFERENCES data.aetar(aetar_id) ON UPDATE CASCADE ON DELETE CASCADE

**Índices:**

- `aetarpro_key`: CREATE UNIQUE INDEX aetarpro_key ON data.aetar_pro USING btree (aetar_pro_id)
- `tareasorder`: CREATE INDEX tareasorder ON data.aetar_pro USING btree (aetar_pro_fechalimite, aeinst_id, aeanol_id, aedocentes_id)

---

#### `data.aetar_res` — tabla

**Descripción:** Entrega de tareas (respuesta del estudiante a una tarea programada).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aetar_res_id` | `bigint` | NO | `` | Identificador único de la entrega. |
| `aetar_pro_id` | `bigint` | NO | `` | Programación (FK a aetar_pro). |
| `aeestudiantes_id` | `bigint` | NO | `` | Estudiante que entrega. |
| `aetar_res_fechaentrega` | `timestamp without time zone` | NO | `` | Fecha de entrega. |
| `aetar_res_descripcion` | `text` | NO | `` | Descripción de la entrega. |
| `aetar_res_adjunto1` | `character varying(256)` | SÍ | `` | Adjunto 1. |
| `aetar_res_adjunto2` | `character varying(256)` | SÍ | `` | Adjunto 2. |
| `aetar_res_adjunto3` | `character varying(256)` | SÍ | `` | Adjunto 3. |
| `aetar_res_resultado` | `double precision` | SÍ | `` | Resultado/calificación. |
| `aetar_res_aprobacion` | `boolean` | SÍ | `false` | Si fue aprobada. |
| `aetar_res_estado` | `integer` | SÍ | `1` | Estado (1=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (aetar_res_id)
- `FK (tarprofk)`: FOREIGN KEY (aetar_pro_id) REFERENCES data.aetar_pro(aetar_pro_id) ON UPDATE CASCADE ON DELETE CASCADE

**Índices:**

- `aetar_res_key`: CREATE UNIQUE INDEX aetar_res_key ON data.aetar_res USING btree (aetar_res_id)
- `tareasentregaorder`: CREATE INDEX tareasentregaorder ON data.aetar_res USING btree (aetar_res_fechaentrega, aeestudiantes_id, aetar_res_id)

---

#### `data.aetipint` — tabla

**Descripción:** Tipos de intento para calificar un cuestionario (promedio, primer intento, último intento).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aetipint_id` | `integer` | NO | `` | Identificador único del tipo de intento. |
| `aetipint_descripcion` | `character varying(64)` | SÍ | `` | Descripción del tipo de intento. |
| `aetipint_estado` | `boolean` | SÍ | `true` | Estado (true=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (aetipint_id)

**Índices:**

- `aetipint_pkey`: CREATE UNIQUE INDEX aetipint_pkey ON data.aetipint USING btree (aetipint_id)

---

#### `data.aetipo_certificado` — tabla

**Descripción:** Tipos de certificado (paz y salvo, estudio, matrícula, notas, conducta, etc.).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aetipocertificado_id` | `bigint` | NO | `` | Identificador único del tipo de certificado. |
| `aetipocertificado_nombre` | `character varying` | SÍ | `` | Nombre del certificado. |
| `aetipocertificado_descripcion` | `character varying` | SÍ | `` | Descripción del certificado. |
| `aeestado_id` | `integer` | SÍ | `` | Estado (FK a aeestados). |

**Restricciones:**

- `PK`: PRIMARY KEY (aetipocertificado_id)

**Índices:**

- `aetipo_Certificado_pkey`: CREATE UNIQUE INDEX "aetipo_Certificado_pkey" ON data.aetipo_certificado USING btree (aetipocertificado_id)

---

#### `data.aetipo_envio` — tabla

**Descripción:** Tipos de envío de notificaciones (comunicado, asistencia, horario, excusa, tarea, etc.).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aetipoenvio_id` | `bigint` | NO | `` | Identificador único del tipo de envío. |
| `aetipoenvio_descripcion` | `character varying(64)` | SÍ | `` | Descripción del tipo de envío. |
| `aeestado_id` | `integer` | SÍ | `1` | Estado (FK a aeestados). |

**Restricciones:**

- `PK`: PRIMARY KEY (aetipoenvio_id)

**Índices:**

- `aetipo_envio_pkey`: CREATE UNIQUE INDEX aetipo_envio_pkey ON data.aetipo_envio USING btree (aetipoenvio_id)

---

#### `data.aetipodocumento` — tabla

**Descripción:** Tipos de documento de identidad (catálogo).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aetipodocumento_id` | `smallint` | NO | `` | Identificador único del tipo de documento. |
| `aetipodocumento_sigla` | `character varying(8)` | NO | `` | Sigla del tipo de documento (C.C., T.I., etc.). |
| `aetipodocumento_descripcion` | `character varying(64)` | SÍ | `` | Descripción del tipo de documento. |
| `aetipodocumento_estado` | `smallint` | SÍ | `1` | Estado (1=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (aetipodocumento_id)

**Índices:**

- `_copy_1`: CREATE UNIQUE INDEX _copy_1 ON data.aetipodocumento USING btree (aetipodocumento_id)

---

#### `data.aetipoempresa` — tabla

**Descripción:** Tipos de empresa del acudiente (catálogo de encuesta).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aetipoempresa_id` | `smallint` | NO | `` | Identificador único del tipo de empresa. |
| `aetipoempresa_estado` | `smallint` | SÍ | `1` | Estado (1=activo). |
| `aetipoempresa_descripcion` | `character varying(32)` | SÍ | `` | Descripción del tipo de empresa. |

**Restricciones:**

- `PK`: PRIMARY KEY (aetipoempresa_id)

**Índices:**

- `data.aetipoempresa_pkey`: CREATE UNIQUE INDEX "data.aetipoempresa_pkey" ON data.aetipoempresa USING btree (aetipoempresa_id)

---

#### `data.aetipoexcusas` — tabla

**Descripción:** Tipos de excusa (catálogo: salud, calamidad, etc.).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aetipoexcusa_id` | `integer` | NO | `` | Identificador único del tipo de excusa. |
| `aetipoexcusa_nombre` | `text` | NO | `` | Nombre del tipo de excusa. |
| `aetipoexcusa_descripcion` | `text` | NO | `` | Descripción del tipo de excusa. |
| `aetipoexcusas_estado` | `integer` | NO | `` | Estado del tipo de excusa. |

**Restricciones:**

- `PK`: PRIMARY KEY (aetipoexcusa_id)

**Índices:**

- `tipoexcusa_pkey`: CREATE UNIQUE INDEX tipoexcusa_pkey ON data.aetipoexcusas USING btree (aetipoexcusa_id)

---

#### `data.aetippre` — tabla

**Descripción:** Tipos de pregunta de los cuestionarios (única, múltiple, abierta, verdadero/falso, etc.).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aetippre_id` | `integer` | NO | `nextval('data.aetippre_aetippre_id_seq'::regclass)` | Identificador único del tipo de pregunta. |
| `aetippre_descripcion` | `character varying(64)` | SÍ | `` | Descripción del tipo de pregunta. |
| `aetippre_estado` | `boolean` | SÍ | `true` | Estado (true=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (aetippre_id)

**Índices:**

- `aetippre_pkey`: CREATE UNIQUE INDEX aetippre_pkey ON data.aetippre USING btree (aetippre_id)

---

#### `data.inst_cue` — tabla

**Descripción:** Cuestionarios habilitados para un salón/grupo de una institución.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aeinst_cue_id` | `bigint` | NO | `` | Identificador único de la habilitación. |
| `aecue_id` | `bigint` | NO | `` | Cuestionario (FK a aecue). |
| `aeinst_id` | `double precision` | NO | `` | Institución (FK a aeinstituciones). |
| `aeano_id` | `integer` | NO | `` | Año lectivo. |
| `aeusu_id` | `bigint` | NO | `` | Docente que habilita (FK a engine.aeusu). |
| `aeestudiantes_grupo` | `character varying(32)` | NO | `` | Grupo/salón habilitado. |
| `aeinst_cue_fechacreacion` | `timestamp without time zone` | NO | `` | Fecha de creación. |
| `aeinst_cue_fechaini` | `timestamp without time zone` | NO | `` | Fecha de inicio de la habilitación. |
| `aeinst_cue_fechafin` | `timestamp without time zone` | NO | `` | Fecha de fin de la habilitación. |
| `aeinst_cue_duracion` | `interval` | SÍ | `'00:30:00'::time without time zone` | Duración permitida del cuestionario. |
| `aeinst_cue_intentos` | `integer` | SÍ | `1` | Número de intentos permitidos. |
| `aeinst_cue_tipointento` | `integer` | SÍ | `` | Tipo de intento a calificar (FK a aetipint). |
| `aeinst_cue_ordenado` | `boolean` | SÍ | `true` | Si las preguntas van en orden. |
| `aeinst_cue_resultadominimo` | `double precision` | SÍ | `` | Resultado mínimo para aprobar. |
| `aeinst_cue_estado` | `integer` | SÍ | `1` | Estado (1=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (aeinst_cue_id)
- `FK (cuest_inst)`: FOREIGN KEY (aecue_id) REFERENCES data.aecue(aecue_id) ON UPDATE CASCADE ON DELETE CASCADE
- `FK (inst_cue_aeinstituciones_fk)`: FOREIGN KEY (aeinst_id) REFERENCES data.aeinstituciones(aeinst_id) ON UPDATE CASCADE ON DELETE CASCADE

**Índices:**

- `aeinst_cue_fkindex1`: CREATE INDEX aeinst_cue_fkindex1 ON data.inst_cue USING btree (aecue_id, aeinst_id, aeinst_cue_fechaini, aeinst_cue_fechafin)
- `inst__cue_pkey`: CREATE UNIQUE INDEX inst__cue_pkey ON data.inst_cue USING btree (aeinst_cue_id)

---

#### `data.inst_cue_res` — tabla

**Descripción:** Intentos de respuesta de un estudiante a un cuestionario habilitado.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `inst_cue_res_id` | `bigint` | NO | `` | Identificador único del intento. |
| `aeinst_cue_id` | `bigint` | NO | `` | Cuestionario habilitado (FK a inst_cue). |
| `aeusu_id` | `double precision` | NO | `` | Usuario/estudiante que responde. |
| `inst_cue_res_resultado` | `double precision` | NO | `` | Resultado obtenido. |
| `inst_cue_res_fechaini` | `timestamp with time zone` | NO | `` | Fecha de inicio del intento. |
| `inst_cue_res_fechafin` | `timestamp with time zone` | NO | `` | Fecha de fin del intento. |
| `inst_cue_res_duracion` | `interval` | SÍ | `` | Duración del intento. |
| `inst_cue_res_fechaintento` | `timestamp with time zone` | NO | `` | Fecha del intento. |
| `inst_cue_res_aprobacion` | `boolean` | SÍ | `false` | Si aprobó. |
| `inst_cue_res_estado` | `integer` | SÍ | `1` | Estado (1=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (inst_cue_res_id)
- `FK (unionintento_programacion)`: FOREIGN KEY (aeinst_cue_id) REFERENCES data.inst_cue(aeinst_cue_id) ON UPDATE CASCADE ON DELETE CASCADE

**Índices:**

- `inst_cue_res_pkey`: CREATE UNIQUE INDEX inst_cue_res_pkey ON data.inst_cue_res USING btree (inst_cue_res_id)

---

#### `data.inst_doce` — tabla

**Descripción:** Relación entre instituciones y docentes (docente contratado en una institución y año).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `inst_doce_id` | `double precision` | NO | `nextval('data.secuence_inst_doce_id'::regclass)` | Identificador único de la relación. |
| `aeinst_id` | `double precision` | NO | `` | Institución (FK a aeinstituciones). |
| `aedocentes_id` | `double precision` | NO | `` | Docente (FK a aedocentes). |
| `aeanol_id` | `integer` | SÍ | `` | Año lectivo de la relación. |
| `inst_doce_estado` | `integer` | SÍ | `1` | Estado de la relación (1=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (inst_doce_id)

**Índices:**

- `docentes_colegiosorder`: CREATE INDEX docentes_colegiosorder ON data.inst_doce USING btree (aeanol_id, aeinst_id, aedocentes_id)
- `inst_doce_pkey`: CREATE UNIQUE INDEX inst_doce_pkey ON data.inst_doce USING btree (inst_doce_id)

---

#### `data.tipo_citacion` — tabla

**Descripción:** Tipos/motivos de citación (catálogo adicional).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `motivo_id` | `integer` | NO | `` | Identificador único del motivo. |
| `motivo_nombre` | `character varying(200)` | NO | `` | Nombre del motivo. |
| `motivo_estado` | `smallint` | NO | `` | Estado del motivo. |

**Restricciones:**

- `PK`: PRIMARY KEY (motivo_id)

**Índices:**

- `motivo_id_pkey`: CREATE UNIQUE INDEX motivo_id_pkey ON data.tipo_citacion USING btree (motivo_id)

---

### Esquema `engine` (Escuelapp)

Escuelapp — Agenda Escolar Digital. Lógica de acceso y navegación: usuarios, roles, menús, opciones de menú, privilegios por rol/usuario y restablecimiento de contraseñas.

Tablas/objetos: **8**

#### `engine.aemenu` — tabla

**Descripción:** Menús (agrupadores de opciones) de la agenda escolar.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aemenu_id` | `integer` | NO | `` | Identificador único del menú. |
| `aemenu_nombre` | `text` | NO | `` | Nombre del menú. |
| `aemenu_descripcion` | `text` | NO | `` | Descripción del menú. |
| `aemenu_icono` | `text` | NO | `` | Icono del menú. |
| `aemenu_estado` | `integer` | NO | `` | Estado del menú. |
| `aemenu_orden` | `integer` | SÍ | `` | Orden de visualización del menú. |

**Restricciones:**

- `PK`: PRIMARY KEY (aemenu_id)

**Índices:**

- `aemenu_pkey`: CREATE UNIQUE INDEX aemenu_pkey ON engine.aemenu USING btree (aemenu_id)

---

#### `engine.aeopcmenu` — tabla

**Descripción:** Opciones de menú (páginas/acciones) dentro de cada menú.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aeopcmenu_id` | `integer` | NO | `` | Identificador único de la opción. |
| `aemenu_id` | `integer` | NO | `` | Menú padre de la opción (FK a aemenu). |
| `aeopcmenu_nombre` | `text` | NO | `` | Nombre de la opción de menú. |
| `aeopcmenu_descripcion` | `text` | NO | `` | Descripción de la opción. |
| `aeopcmenu_enlace` | `text` | NO | `` | Enlace/ruta de la opción. |
| `aeopcmenu_icono` | `text` | NO | `` | Icono de la opción. |
| `aeopcmenu_orden` | `integer` | NO | `` | Orden de visualización de la opción. |
| `aeopcmenu_estado` | `integer` | NO | `` | Estado de la opción (1=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (aeopcmenu_id)

**Índices:**

- `aeopcmenu_pkey`: CREATE UNIQUE INDEX aeopcmenu_pkey ON engine.aeopcmenu USING btree (aeopcmenu_id)
- `privilegio_fkindex1`: CREATE INDEX privilegio_fkindex1 ON engine.aeopcmenu USING btree (aemenu_id, aeopcmenu_estado)

---

#### `engine.aeroll` — tabla

**Descripción:** Roles de la agenda escolar (admin académico, docente, estudiante, acudiente, etc.).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aeroll_id` | `integer` | NO | `` | Identificador único del rol. |
| `aeroll_nombre` | `character varying(20)` | NO | `` | Nombre del rol. |
| `aeroll_descripcion` | `text` | NO | `` | Descripción del rol. |
| `aeroll_index` | `text` | NO | `` | Página de inicio a la que redirige el rol. |
| `aeroll_esta` | `integer` | NO | `` | Estado del rol. |

**Restricciones:**

- `PK`: PRIMARY KEY (aeroll_id)

**Índices:**

- `aeroll_pkey`: CREATE UNIQUE INDEX aeroll_pkey ON engine.aeroll USING btree (aeroll_id)

---

#### `engine.aerollopc` — tabla

**Descripción:** Privilegios por rol: opciones de menú a las que puede acceder cada rol.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aerollopc_id` | `integer` | NO | `` | Identificador único del privilegio. |
| `aeopcmenu_id` | `integer` | NO | `` | Opción de menú (FK a aeopcmenu). |
| `aeroll_id` | `integer` | NO | `` | Rol al que se asigna la opción (FK a aeroll). |
| `aerollopc_estado` | `integer` | SÍ | `1` | Estado del privilegio (1=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (aerollopc_id)
- `UNIQUE`: UNIQUE (aeroll_id, aeopcmenu_id, aerollopc_estado)

**Índices:**

- `aerollopc_pkey`: CREATE UNIQUE INDEX aerollopc_pkey ON engine.aerollopc USING btree (aerollopc_id)
- `ifk_rollopc1`: CREATE INDEX ifk_rollopc1 ON engine.aerollopc USING btree (aeroll_id, aeopcmenu_id, aerollopc_estado)
- `unicoprivroll`: CREATE UNIQUE INDEX unicoprivroll ON engine.aerollopc USING btree (aeroll_id, aeopcmenu_id, aerollopc_estado)

---

#### `engine.aeusu` — tabla

**Descripción:** Usuarios de la agenda escolar (login).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aeusu_id` | `double precision` | NO | `nextval('engine.secuence_aeusu_id'::regclass)` | Identificador único del usuario. |
| `aeusu_nombre` | `text` | NO | `` | Nombre del usuario. |
| `aeusu_nick` | `text` | NO | `` | Nick/usuario de login (único). |
| `aeusu_llave` | `text` | NO | `` | Clave/password del usuario. |
| `aeroll_id` | `integer` | NO | `` | Rol del usuario (FK a aeroll). |
| `aeusu_estado` | `integer` | NO | `` | Estado del usuario. |
| `aeusu_token` | `text` | SÍ | `` | Token de sesión/dispositivo del usuario. |

**Restricciones:**

- `PK`: PRIMARY KEY (aeusu_id)
- `UNIQUE`: UNIQUE (aeusu_nick)

**Índices:**

- `aeusu_pkey`: CREATE UNIQUE INDEX aeusu_pkey ON engine.aeusu USING btree (aeusu_id)
- `unicousuario`: CREATE UNIQUE INDEX unicousuario ON engine.aeusu USING btree (aeusu_nick)
- `usuario_index`: CREATE INDEX usuario_index ON engine.aeusu USING btree (aeroll_id DESC, aeusu_nick DESC)

---

#### `engine.aeusuopc` — tabla

**Descripción:** Privilegios por usuario: opciones de menú adicionales asignadas a un usuario específico.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aeusuopc_id` | `integer` | NO | `` | Identificador único del privilegio. |
| `aeopcmenu_id` | `integer` | NO | `` | Opción de menú (FK a aeopcmenu). |
| `aeusu_id` | `integer` | NO | `` | Usuario (FK a aeusu). |
| `aeusuopc_estado` | `integer` | SÍ | `1` | Estado del privilegio (1=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (aeusuopc_id)
- `UNIQUE`: UNIQUE (aeusu_id, aeopcmenu_id, aeusuopc_estado)

**Índices:**

- `aeusuopc_pkey`: CREATE UNIQUE INDEX aeusuopc_pkey ON engine.aeusuopc USING btree (aeusuopc_id)
- `ifk_opc1`: CREATE INDEX ifk_opc1 ON engine.aeusuopc USING btree (aeusu_id, aeopcmenu_id, aeusuopc_estado)
- `unicoprivusu`: CREATE UNIQUE INDEX unicoprivusu ON engine.aeusuopc USING btree (aeusu_id, aeopcmenu_id, aeusuopc_estado)

---

#### `engine.aeusuresetpass` — tabla

**Descripción:** Solicitudes de restablecimiento de contraseña de los usuarios.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aeusures_id` | `integer` | NO | `` | Identificador único de la solicitud. |
| `aeusu_id` | `double precision` | NO | `` | Usuario que solicita el cambio (FK a aeusu). |
| `aeusures_llavepre` | `text` | NO | `` | Clave anterior (verificación). |
| `aeusures_llavenew` | `text` | SÍ | `` | Nueva clave propuesta. |
| `aeusures_fechageneracion` | `timestamp without time zone` | NO | `` | Fecha de generación de la solicitud. |
| `aeusures_fechavence` | `timestamp without time zone` | NO | `` | Fecha de vencimiento del enlace. |
| `aeusures_fechalink` | `timestamp without time zone` | SÍ | `` | Fecha en que se usó el enlace. |
| `aeusures_dirip` | `character varying(32)` | SÍ | `` | IP desde donde se generó la solicitud. |
| `aeusures_estado` | `integer` | SÍ | `8` | Estado de la solicitud. |

**Restricciones:**

- `PK`: PRIMARY KEY (aeusures_id)
- `FK (aeresetpk__fkey)`: FOREIGN KEY (aeusu_id) REFERENCES engine.aeusu(aeusu_id) ON UPDATE CASCADE ON DELETE CASCADE

**Índices:**

- `aeresetpk_pkey`: CREATE UNIQUE INDEX aeresetpk_pkey ON engine.aeusuresetpass USING btree (aeusures_id)
- `resetpass__fkindex1`: CREATE INDEX resetpass__fkindex1 ON engine.aeusuresetpass USING btree (aeusures_fechageneracion, aeusu_id)

---

#### `engine.aeusuroll` — tabla

**Descripción:** Relación usuario-rol con alcance por institución y año lectivo (un usuario puede tener varios roles/contextos).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aeusuroll_id` | `integer` | NO | `nextval('engine.secuence_aeusuroll_id'::regclass)` | Identificador único del registro. |
| `aeroll_id` | `integer` | NO | `` | Rol asignado (FK a aeroll). |
| `aeusu_id` | `bigint` | NO | `` | Usuario (FK a aeusu). |
| `aeacad_referencia` | `bigint` | SÍ | `` | Referencia académica asociada (docente, estudiante o acudiente). |
| `aeinst_id` | `integer` | SÍ | `` | Institución en la que aplica el rol. |
| `aeanol_id` | `integer` | SÍ | `` | Año lectivo en el que aplica el rol. |
| `aeusuroll_estado` | `integer` | SÍ | `1` | Estado de la relación (1=activo). |
| `aeusuroll_fecharegistro` | `timestamp with time zone` | SÍ | `CURRENT_TIMESTAMP` | Fecha de registro de la relación. |

**Restricciones:**

- `PK`: PRIMARY KEY (aeusuroll_id)
- `FK (rollusu__fkey)`: FOREIGN KEY (aeroll_id) REFERENCES engine.aeroll(aeroll_id) ON UPDATE CASCADE ON DELETE CASCADE
- `FK (usuroll__fkey)`: FOREIGN KEY (aeusu_id) REFERENCES engine.aeusu(aeusu_id) ON UPDATE CASCADE ON DELETE CASCADE

**Índices:**

- `aeusuroll__pkey`: CREATE UNIQUE INDEX aeusuroll__pkey ON engine.aeusuroll USING btree (aeusuroll_id)
- `identidad__fkindex1`: CREATE INDEX identidad__fkindex1 ON engine.aeusuroll USING btree (aeroll_id, aeusu_id, aeacad_referencia)

---

### Esquema `estadistica` (SAE)

SAE — Sistema de Administración Educativa. Registra el historial de visitas/páginas consultadas por cada usuario.

Tablas/objetos: **1**

#### `estadistica.tabhistvis` — tabla

**Descripción:** Historial de visitas: páginas consultadas por cada usuario en la aplicación.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `chistid` | `integer` | NO | `` | Identificador único de la visita. |
| `cusuatip` | `character varying(20)` | SÍ | `` | Tipo de usuario que realizó la visita. |
| `cusuaid` | `integer` | NO | `` | Identificador del usuario que visitó la página. |
| `chistpage` | `character varying(200)` | NO | `` | Página visitada (URL/ruta). |
| `chistfech` | `timestamp(6) without time zone` | NO | `` | Fecha y hora de la visita. |
| `chisesta` | `integer` | NO | `8` | Estado del registro (8=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (chistid)

**Índices:**

- `tabhist_pkey`: CREATE UNIQUE INDEX tabhist_pkey ON estadistica.tabhistvis USING btree (chistid)

---

### Esquema `integration` (SAE)

SAE — Tablas de integración/mapeo entre SAE (public/logic) y la agenda (Escuelapp), y registro de actividades de usuarios.

Tablas/objetos: **2**

#### `integration.tabenla` — tabla

**Descripción:** Mapeo de enlace entre los esquemas SAE (public/logic) y la agenda (Escuelapp): describe los campos con los que se hace el enlace.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cenlaid` | `integer` | NO | `` | Identificador único del enlace. |
| `cenladesc` | `text` | NO | `` | Descripción/tabla de destino del enlace. |
| `cenladesccamp` | `text` | NO | `` | Campo(s) de la tabla de destino usados en el enlace. |
| `cenladescextr` | `text` | NO | `` | Campos adicionales (extra) para la visualización en el enlace. |
| `cenlaesta` | `integer` | NO | `` | Estado del enlace. |

**Restricciones:**

- `PK`: PRIMARY KEY (cenlaid)

**Índices:**

- `tabenla_pkey`: CREATE UNIQUE INDEX tabenla_pkey ON integration.tabenla USING btree (cenlaid)

---

#### `integration.tabregiacti` — tabla

**Descripción:** Registro de actividades de los usuarios en la aplicación (auditoría).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cregiactiid` | `real` | NO | `` | Identificador único del registro de actividad. |
| `cregiactisecu` | `character varying(14)` | NO | `` | Secuencia/código de la actividad. |
| `cusuaid` | `integer` | NO | `` | Usuario que realizó la actividad. |
| `cregiactiregi` | `text` | NO | `` | Descripción del registro/acción realizada. |
| `cregiactifech` | `date` | NO | `` | Fecha de la actividad. |
| `cregiactihora` | `time without time zone` | NO | `` | Hora de la actividad. |
| `cregiactinave` | `character varying(16)` | SÍ | `` | Navegador usado por el usuario. |
| `cregiactiip` | `character varying(15)` | SÍ | `` | Dirección IP del usuario. |

**Restricciones:**

- `PK`: PRIMARY KEY (cregiactiid)

**Índices:**

- `registroactividades_index`: CREATE INDEX registroactividades_index ON integration.tabregiacti USING btree (cregiactifech, cusuaid, cregiactiid)
- `registroactividades_pkey`: CREATE UNIQUE INDEX registroactividades_pkey ON integration.tabregiacti USING btree (cregiactiid)

---

### Esquema `logic` (SAE)

SAE — Lógica de acceso y navegación del sistema administrativo: usuarios, roles, menús, opciones y privilegios por rol/usuario.

Tablas/objetos: **6**

#### `logic.tabmenu` — tabla

**Descripción:** Menús (agrupadores de opciones) del sistema administrativo SAE.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cmenuid` | `integer` | NO | `` | Identificador único del menú. |
| `cmenunomb` | `text` | NO | `` | Nombre del menú. |
| `cmenudesc` | `text` | NO | `` | Descripción del menú. |
| `cmenudest` | `text` | NO | `` | Página de destino/inicio del menú. |
| `cmenuesta` | `integer` | NO | `` | Estado del menú. |
| `cmenuorde` | `integer` | SÍ | `` | Orden de visualización del menú. |

**Restricciones:**

- `PK`: PRIMARY KEY (cmenuid)

**Índices:**

- `tabmenu_pkey`: CREATE UNIQUE INDEX tabmenu_pkey ON logic.tabmenu USING btree (cmenuid)

---

#### `logic.tabopcimenu` — tabla

**Descripción:** Opciones de menú (páginas/acciones) dentro de cada menú del SAE.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `copcimenuid` | `integer` | NO | `` | Identificador único de la opción. |
| `copcimenumenu` | `integer` | NO | `` | Menú padre (FK a tabmenu). |
| `copcimenunomb` | `text` | NO | `` | Nombre de la opción. |
| `copcimenudesc` | `text` | NO | `` | Descripción de la opción. |
| `copcimenuenla` | `text` | NO | `` | Enlace/ruta de la opción. |
| `copcimenuicon` | `text` | NO | `` | Icono de la opción. |
| `copcimenuorde` | `integer` | NO | `` | Orden de visualización. |
| `copcimenuesta` | `integer` | NO | `` | Estado de la opción. |

**Restricciones:**

- `PK`: PRIMARY KEY (copcimenuid)

**Índices:**

- `ifk_menopc`: CREATE INDEX ifk_menopc ON logic.tabopcimenu USING btree (copcimenumenu)
- `privilegio_fkindex1`: CREATE INDEX privilegio_fkindex1 ON logic.tabopcimenu USING btree (copcimenumenu, copcimenuesta)
- `tabopcimenu_pkey`: CREATE UNIQUE INDEX tabopcimenu_pkey ON logic.tabopcimenu USING btree (copcimenuid)

---

#### `logic.tabroll` — tabla

**Descripción:** Roles del SAE (administrador, estudiante, docente, institución, acudiente, coordinador, secretaria).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `crollid` | `integer` | NO | `` | Identificador único del rol. |
| `crollnomb` | `character varying(20)` | NO | `` | Nombre del rol. |
| `crolldesc` | `text` | NO | `` | Descripción del rol. |
| `crollpagientr` | `text` | NO | `` | Página de inicio del rol. |
| `cenlaid` | `integer` | NO | `` | Enlace de integración con la agenda (FK a integration.tabenla). |
| `crollesta` | `integer` | NO | `` | Estado del rol. |

**Restricciones:**

- `PK`: PRIMARY KEY (crollid)

**Índices:**

- `tabroll_pkey`: CREATE UNIQUE INDEX tabroll_pkey ON logic.tabroll USING btree (crollid)

---

#### `logic.tabrollopci` — tabla

**Descripción:** Privilegios por rol: opciones de menú accesibles para cada rol.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `crollopciid` | `integer` | NO | `` | Identificador único del privilegio. |
| `copcimenuid` | `integer` | NO | `` | Opción de menú (FK a tabopcimenu). |
| `crollid` | `integer` | NO | `` | Rol (FK a tabroll). |
| `crollopciesta` | `integer` | SÍ | `1` | Estado del privilegio (1=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (crollopciid)

**Índices:**

- `ifk_rollopc1`: CREATE INDEX ifk_rollopc1 ON logic.tabrollopci USING btree (crollid, copcimenuid)
- `ifk_rollopc2`: CREATE INDEX ifk_rollopc2 ON logic.tabrollopci USING btree (crollopciesta)
- `tabrollopci_pkey`: CREATE UNIQUE INDEX tabrollopci_pkey ON logic.tabrollopci USING btree (crollopciid)

---

#### `logic.tabusua` — tabla

**Descripción:** Usuarios del SAE (login).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cusuaid` | `integer` | NO | `` | Identificador único del usuario. |
| `cusuanomb` | `text` | NO | `` | Nombre del usuario. |
| `cusuanick` | `text` | NO | `` | Nick/usuario de login. |
| `cusuallave` | `text` | NO | `` | Clave/password del usuario. |
| `cusuaroll` | `integer` | NO | `` | Rol del usuario (FK a tabroll). |
| `cusuaesta` | `integer` | NO | `` | Estado del usuario. |

**Restricciones:**

- `PK`: PRIMARY KEY (cusuaid)
- `UNIQUE`: UNIQUE (cusuanick, cusuaesta)

**Índices:**

- `tabusua_pkey`: CREATE UNIQUE INDEX tabusua_pkey ON logic.tabusua USING btree (cusuaid)
- `usuario_index`: CREATE INDEX usuario_index ON logic.tabusua USING btree (cusuaroll, cusuanick)
- `usuariosunicos`: CREATE UNIQUE INDEX usuariosunicos ON logic.tabusua USING btree (cusuanick, cusuaesta)

---

#### `logic.tabusuaopci` — tabla

**Descripción:** Privilegios por usuario: opciones de menú adicionales para un usuario específico.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cusuaopciid` | `integer` | NO | `` | Identificador único del privilegio. |
| `cusuaopciopcimenu` | `integer` | NO | `` | Opción de menú (FK a tabopcimenu). |
| `cusuaopciusua` | `integer` | NO | `` | Usuario (FK a tabusua). |
| `cusuaopciesta` | `integer` | SÍ | `1` | Estado del privilegio (1=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (cusuaopciid)

**Índices:**

- `ifk_opc1`: CREATE INDEX ifk_opc1 ON logic.tabusuaopci USING btree (cusuaopciusua, cusuaopciopcimenu)
- `ifk_usu1`: CREATE INDEX ifk_usu1 ON logic.tabusuaopci USING btree (cusuaopciesta)
- `tabusuaopci_pkey`: CREATE UNIQUE INDEX tabusuaopci_pkey ON logic.tabusuaopci USING btree (cusuaopciid)

---

### Esquema `observador` (SAE)

SAE — Registros del observador del estudiante: disciplina, bitácora de clases y evaluación de responsabilidades.

Tablas/objetos: **5**

#### `observador.tabobsplan` — tabla

**Descripción:** Plantilla institucional con el contenido común del documento de observación del estudiante.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cobsplanid` | `integer` | NO | `` | Identificador único de la plantilla. |
| `cinstid` | `integer` | NO | `` | Institución a la que pertenece la plantilla (FK a public.tabinst). |
| `ctituobsplan` | `character varying(100)` | SÍ | `` | Título de la plantilla del observador. |
| `cparrobsplan1` | `text` | SÍ | `` | Primer párrafo del contenido común. |
| `cparrobsplan2` | `text` | SÍ | `` | Segundo párrafo del contenido común. |
| `cestaobsplan` | `integer` | NO | `8` | Estado de la plantilla (8=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (cobsplanid)
- `FK (tabobsplan_cobsplanid_fkey)`: FOREIGN KEY (cinstid) REFERENCES tabinst(cinstid) ON UPDATE CASCADE ON DELETE RESTRICT

**Índices:**

- `cobsplanid_pkey`: CREATE UNIQUE INDEX cobsplanid_pkey ON observador.tabobsplan USING btree (cobsplanid)

---

#### `observador.tabresp` — tabla

**Descripción:** Grupos de responsabilidades (aspectos) de los estudiantes a observar, por institución.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `crespid` | `integer` | NO | `` | Identificador único del grupo de responsabilidades. |
| `cinstid` | `integer` | NO | `` | Institución (FK a public.tabinst). |
| `cpespnomb` | `character varying(100)` | SÍ | `` | Nombre del grupo de responsabilidades. |
| `cpespdesc` | `text` | SÍ | `` | Descripción del grupo de responsabilidades. |
| `crespesta` | `integer` | NO | `8` | Estado del grupo (8=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (crespid)
- `FK (tabresp_cinstid_fkey)`: FOREIGN KEY (cinstid) REFERENCES tabinst(cinstid) ON UPDATE CASCADE ON DELETE RESTRICT

**Índices:**

- `tabresp_pkey`: CREATE UNIQUE INDEX tabresp_pkey ON observador.tabresp USING btree (crespid)

---

#### `observador.tabrespeval` — tabla

**Descripción:** Resultado de la evaluación de cada aspecto/responsabilidad por estudiante y periodo.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `crespevalid` | `integer` | NO | `` | Identificador único de la evaluación. |
| `cperiid` | `integer` | NO | `` | Periodo académico evaluado. |
| `cmatrid` | `integer` | NO | `` | Matrícula del estudiante (FK a public.tabmatr). |
| `crespsubid` | `integer` | NO | `` | Responsabilidad evaluada (FK a tabrespsub). |
| `cevalsubid` | `integer` | NO | `` | Criterio de evaluación usado (FK a public.tabevalsub). |
| `crespevalfech` | `timestamp(6) without time zone` | NO | `` | Fecha de la evaluación. |
| `crespevalhist` | `text` | SÍ | `` | Historial/notas de la evaluación. |
| `crespevalesta` | `integer` | NO | `8` | Estado de la evaluación (8=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (crespevalid)
- `UNIQUE`: UNIQUE (cperiid, cmatrid, crespsubid)
- `FK (tabrespeval_cmatrid_fkey)`: FOREIGN KEY (cmatrid) REFERENCES tabmatr(cmatrid) ON UPDATE CASCADE ON DELETE RESTRICT
- `FK (tabrespeval_crespsubid_fkey)`: FOREIGN KEY (crespsubid) REFERENCES observador.tabrespsub(crespsubid) ON UPDATE CASCADE ON DELETE RESTRICT

**Índices:**

- `tabrespeval_all_key`: CREATE UNIQUE INDEX tabrespeval_all_key ON observador.tabrespeval USING btree (cperiid, cmatrid, crespsubid)
- `tabrespeval_pkey`: CREATE UNIQUE INDEX tabrespeval_pkey ON observador.tabrespeval USING btree (crespevalid)

---

#### `observador.tabrespobs` — tabla

**Descripción:** Observaciones por estudiante para cada responsabilidad/aspecto (bitácora de clases y disciplina).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `crespobsid` | `integer` | NO | `nextval('observador.tabrespobs_crespobsid_seq'::regclass)` | Identificador único de la observación. |
| `crespid` | `integer` | NO | `` | Grupo de responsabilidades (FK a tabresp). |
| `cperiid` | `integer` | NO | `` | Periodo académico de la observación. |
| `cmatrid` | `integer` | NO | `` | Matrícula del estudiante observado (FK a public.tabmatr). |
| `crespobsdesc` | `text` | SÍ | `` | Descripción de la observación. |
| `crespobsfech` | `timestamp(6) without time zone` | NO | `` | Fecha de la observación. |
| `crespobshist` | `text` | SÍ | `` | Historial/notas adicionales de la observación. |
| `crespobsesta` | `integer` | NO | `8` | Estado de la observación (8=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (crespobsid)
- `FK (tabrespobs_crespobsid_fkey)`: FOREIGN KEY (crespid) REFERENCES observador.tabresp(crespid) ON UPDATE CASCADE ON DELETE RESTRICT

**Índices:**

- `tabrespobs_pkey`: CREATE UNIQUE INDEX tabrespobs_pkey ON observador.tabrespobs USING btree (crespobsid)

---

#### `observador.tabrespsub` — tabla

**Descripción:** Responsabilidades (subaspectos) concretas de los estudiantes a observar, pertenecientes a un grupo.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `crespsubid` | `integer` | NO | `nextval('observador.tabrespsub_crespsubid_seq'::regclass)` | Identificador único de la responsabilidad. |
| `crespid` | `integer` | NO | `` | Grupo de responsabilidades padre (FK a tabresp). |
| `crespsubnomb` | `character varying(200)` | SÍ | `` | Nombre de la responsabilidad. |
| `crespsubdesc` | `text` | SÍ | `` | Descripción de la responsabilidad. |
| `crespsubesta` | `integer` | NO | `8` | Estado de la responsabilidad (8=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (crespsubid)
- `FK (tabrespsub_crespid_fkey)`: FOREIGN KEY (crespid) REFERENCES observador.tabresp(crespid) ON UPDATE CASCADE ON DELETE RESTRICT

**Índices:**

- `tabrespsub_pkey`: CREATE UNIQUE INDEX tabrespsub_pkey ON observador.tabrespsub USING btree (crespsubid)

---

### Esquema `preescolar` (SAE)

SAE — Registros específicos de preescolar (ámbitos, dimensiones, asignaciones, notas y novedades).

Tablas/objetos: **5**

#### `preescolar.tabpreambi` — tabla

**Descripción:** Ámbitos de desarrollo para preescolar.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cambiid` | `integer` | NO | `` | Identificador único del ámbito. |
| `cambicode` | `text` | SÍ | `` | Código del ámbito. |
| `cambidesc` | `text` | SÍ | `` | Descripción del ámbito. |
| `cambicome` | `text` | SÍ | `` | Comentario/nota del ámbito. |
| `cambiesta` | `integer` | NO | `` | Estado del ámbito. |

**Restricciones:**

- `PK`: PRIMARY KEY (cambiid)
- `UNIQUE`: UNIQUE (cambidesc)

**Índices:**

- `tabpreambi_cambidesc_key`: CREATE UNIQUE INDEX tabpreambi_cambidesc_key ON preescolar.tabpreambi USING btree (cambidesc)
- `tabpreambi_pkey`: CREATE UNIQUE INDEX tabpreambi_pkey ON preescolar.tabpreambi USING btree (cambiid)

---

#### `preescolar.tabpreasig` — tabla

**Descripción:** Asignaciones de preescolar: relación ámbito + dimensión + curso + docente.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpreasigid` | `integer` | NO | `` | Identificador único de la asignación. |
| `cambiid` | `integer` | NO | `` | Ámbito (FK a tabpreambi). |
| `cdimeid` | `integer` | NO | `` | Dimensión (FK a tabpredime). |
| `ccursid` | `integer` | NO | `` | Curso (FK a public.tabcurs). |
| `cdoceid` | `integer` | NO | `` | Docente a cargo (FK a public.tabdoce). |
| `cpreasiggradinic` | `time(6) without time zone` | SÍ | `` | Grado inicial de la asignación. |
| `cpreasiggradfina` | `time(6) without time zone` | SÍ | `` | Grado final de la asignación. |
| `cpreasigfechregi` | `date` | NO | `` | Fecha de registro de la asignación. |
| `casigdura` | `integer` | SÍ | `` | Duración de la asignación. |
| `cpreasigsesta` | `integer` | NO | `8` | Estado de la asignación (8=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (cpreasigid)
- `UNIQUE`: UNIQUE (cambiid, cdimeid, ccursid)
- `FK (tabpreasig_cambiid_fkey)`: FOREIGN KEY (cambiid) REFERENCES preescolar.tabpreambi(cambiid) ON UPDATE CASCADE ON DELETE RESTRICT
- `FK (tabpreasig_ccursid_fkey)`: FOREIGN KEY (ccursid) REFERENCES tabcurs(ccursid) ON UPDATE CASCADE ON DELETE RESTRICT
- `FK (tabpreasig_cdimeid_fkey)`: FOREIGN KEY (cdimeid) REFERENCES preescolar.tabpredime(cdimeid) ON UPDATE CASCADE ON DELETE RESTRICT

**Índices:**

- `tabpreasig_cambiid_key`: CREATE UNIQUE INDEX tabpreasig_cambiid_key ON preescolar.tabpreasig USING btree (cambiid, cdimeid, ccursid)
- `tabpreasig_pkey`: CREATE UNIQUE INDEX tabpreasig_pkey ON preescolar.tabpreasig USING btree (cpreasigid)

---

#### `preescolar.tabpredime` — tabla

**Descripción:** Dimensiones de desarrollo dentro de los ámbitos de preescolar.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cdimeid` | `integer` | NO | `` | Identificador único de la dimensión. |
| `cdimecode` | `text` | SÍ | `` | Código de la dimensión. |
| `cdimedesc` | `text` | SÍ | `` | Descripción de la dimensión. |
| `cdimecome` | `text` | SÍ | `` | Comentario/nota de la dimensión. |
| `cdimeesta` | `integer` | NO | `` | Estado de la dimensión. |
| `cdimeabre` | `character varying(4)` | SÍ | `` | Abreviatura de la dimensión (única). |

**Restricciones:**

- `PK`: PRIMARY KEY (cdimeid)
- `UNIQUE`: UNIQUE (cdimeabre)
- `UNIQUE`: UNIQUE (cdimedesc)

**Índices:**

- `tabpredime_cdimeabre_key`: CREATE UNIQUE INDEX tabpredime_cdimeabre_key ON preescolar.tabpredime USING btree (cdimeabre)
- `tabpredime_cdimedesc_key`: CREATE UNIQUE INDEX tabpredime_cdimedesc_key ON preescolar.tabpredime USING btree (cdimedesc)
- `tabpredime_pkey`: CREATE UNIQUE INDEX tabpredime_pkey ON preescolar.tabpredime USING btree (cdimeid)

---

#### `preescolar.tabprenota` — tabla

**Descripción:** Notas/evaluaciones de preescolar por asignación, competencia, periodo y matrícula.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cprenotaid` | `integer` | NO | `nextval('preescolar.tabprenota_cprenotaid_seq'::regclass)` | Identificador único de la nota. |
| `cpreasigid` | `integer` | NO | `` | Asignación de preescolar (FK a tabpreasig). |
| `ccompid` | `integer` | NO | `` | Competencia evaluada (FK a public.tabcomp). |
| `cperiid` | `integer` | NO | `` | Periodo académico. |
| `cmatrid` | `integer` | NO | `` | Matrícula del estudiante (FK a public.tabmatr). |
| `cprenotavalo` | `double precision` | NO | `` | Valor de la nota. |
| `cprenotafech` | `date` | NO | `` | Fecha de la nota. |
| `cprenotafechregi` | `timestamp(6) without time zone` | NO | `` | Fecha de registro de la nota. |
| `cprenotaobse` | `text` | SÍ | `` | Observación de la nota. |
| `cprenotaesta` | `integer` | NO | `8` | Estado de la nota (8=activo). |

**Restricciones:**

- `PK`: PRIMARY KEY (cprenotaid)
- `UNIQUE`: UNIQUE (cpreasigid, cperiid, ccompid, cmatrid, cprenotaesta)
- `FK (ligapreinstitucion)`: FOREIGN KEY (cpreasigid) REFERENCES preescolar.tabpreasig(cpreasigid) ON UPDATE RESTRICT ON DELETE CASCADE
- `FK (tabprenota_cmatrid_fkey)`: FOREIGN KEY (cmatrid) REFERENCES tabmatr(cmatrid) ON UPDATE CASCADE ON DELETE RESTRICT

**Índices:**

- `tabprenota_cperiid_key`: CREATE UNIQUE INDEX tabprenota_cperiid_key ON preescolar.tabprenota USING btree (cpreasigid, cperiid, ccompid, cmatrid, cprenotaesta)
- `tabprenota_pkey`: CREATE UNIQUE INDEX tabprenota_pkey ON preescolar.tabprenota USING btree (cprenotaid)

---

#### `preescolar.tabprenove` — tabla

**Descripción:** Novedades (observaciones, asistencias, etc.) de preescolar por asignación, periodo y matrícula.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cprenoveid` | `integer` | NO | `nextval('tabla_id_seq'::regclass)` | Identificador único de la novedad. |
| `cpreasigid` | `integer` | NO | `` | Asignación de preescolar (FK a tabpreasig). |
| `cperiid` | `integer` | NO | `` | Periodo académico (FK a public.anolperi). |
| `cmatrid` | `integer` | NO | `` | Matrícula del estudiante (FK a public.tabmatr). |
| `cprenovefech` | `date` | NO | `` | Fecha de la novedad. |
| `cprenovefechregi` | `timestamp(6) without time zone` | NO | `` | Fecha de registro de la novedad. |
| `cprenoveobse` | `text` | SÍ | `` | Observación de la novedad. |
| `cpretiponoveid` | `integer` | NO | `` | Tipo de novedad (FK a public.tabtiponove). |
| `cprenoveesta` | `integer` | NO | `1` | Estado de la novedad. |

**Restricciones:**

- `PK`: PRIMARY KEY (cprenoveid)
- `FK (tabprenove_cmatrid_fkey)`: FOREIGN KEY (cmatrid) REFERENCES tabmatr(cmatrid) ON UPDATE CASCADE ON DELETE RESTRICT
- `FK (tabprenove_cperiid_fkey)`: FOREIGN KEY (cperiid) REFERENCES anolperi(anolperiid) ON UPDATE CASCADE ON DELETE RESTRICT
- `FK (tabprenove_cpreasigid_fkey)`: FOREIGN KEY (cpreasigid) REFERENCES preescolar.tabpreasig(cpreasigid) ON UPDATE CASCADE ON DELETE RESTRICT
- `FK (tabprenove_cpretiponoveid_fkey)`: FOREIGN KEY (cpretiponoveid) REFERENCES tabtiponove(ctiponoveid) ON UPDATE CASCADE ON DELETE RESTRICT

**Índices:**

- `tabprenove_pkey`: CREATE UNIQUE INDEX tabprenove_pkey ON preescolar.tabprenove USING btree (cprenoveid)

---

### Esquema `public` (SAE)

SAE — Esquema principal con los datos de gestión escolar: instituciones, sedes, docentes, estudiantes, matrículas, cursos, asignaturas, competencias, notas, novedades, observador y catálogos oficiales de Colombia.

Tablas/objetos: **100**

#### `public.aeconsultas` — tabla

**Descripción:** Consultas (mensajes) de usuarios en el SAE.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aeconsultas_id` | `integer` | NO | `` | Identificador único de la consulta. |
| `aeconsultas_fpublicacion` | `date` | NO | `` | Fecha de publicación. |
| `aeconsultas_usuario` | `integer` | NO | `` | Usuario que consulta. |
| `aeconsultas_contenido` | `text` | NO | `` | Contenido de la consulta. |
| `aeconsultas_destino` | `integer` | NO | `` | Destinatario de la consulta. |
| `aeconsultas_estado` | `integer` | NO | `` | Estado de la consulta. |

**Índices:**

- `aeconsultas_pk`: CREATE UNIQUE INDEX aeconsultas_pk ON public.aeconsultas USING btree (aeconsultas_id)

---

#### `public.aeconsultas_Inst` — tabla

**Descripción:** Copia por institución de las consultas (aeconsultas).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aeconsultas_id` | `integer` | NO | `` | Identificador único de la consulta. |
| `aeconsultas_fpublicacion` | `date` | NO | `` | Fecha de publicación. |
| `aeconsultas_usuario` | `integer` | NO | `` | Usuario que consulta. |
| `aeconsultas_contenido` | `text` | NO | `` | Contenido de la consulta. |
| `aeconsultas_destino` | `integer` | NO | `` | Destinatario. |
| `aeconsultas_estado` | `integer` | NO | `` | Estado. |

**Índices:**

- `aeconsultas_ins_pk`: CREATE UNIQUE INDEX aeconsultas_ins_pk ON public."aeconsultas_Inst" USING btree (aeconsultas_id)

---

#### `public.anolperi` — tabla

**Descripción:** Relación institución-año lectivo-periodos: define los periodos académicos de cada institución por año.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `anolperiid` | `integer` | NO | `` | Identificador único del registro. |
| `cinstid` | `integer` | NO | `` | Institución (FK a tabinst). |
| `canolid` | `integer` | NO | `` | Año lectivo (FK a tabanol). |
| `cperiid` | `integer` | NO | `` | Periodo académico (FK a tabperi). |
| `anolperidesc` | `text` | NO | `` | Descripción del periodo. |
| `anolperifechinic` | `date` | NO | `` | Fecha de inicio del periodo. |
| `anolperifechfina` | `date` | NO | `` | Fecha de fin del periodo. |
| `anolperivalo` | `double precision` | SÍ | `` | Valor (porcentaje) del periodo. |
| `anolperifechregi` | `timestamp(6) without time zone` | NO | `` | Fecha de registro. |
| `anolperiesta` | `integer` | NO | `` | Estado del registro. |

**Índices:**

- `anolperi_pkey`: CREATE UNIQUE INDEX anolperi_pkey ON public.anolperi USING btree (anolperiid)

---

#### `public.asigcurs` — tabla

**Descripción:** Asignaturas de un curso: relación asignatura + curso + docente (con horario).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `asigcursid` | `integer` | NO | `` | Identificador único del registro. |
| `casigid` | `integer` | SÍ | `` | Asignatura (FK a tabasig). |
| `ccursid` | `integer` | SÍ | `` | Curso (FK a tabcurs). |
| `cdoceid` | `integer` | SÍ | `` | Docente que dicta (FK a tabdoce). |
| `casiggradinic` | `time(6) without time zone` | SÍ | `` | Hora de inicio de la clase. |
| `casiggradfina` | `time(6) without time zone` | SÍ | `` | Hora de fin de la clase. |
| `casigcursfechregi` | `date` | NO | `` | Fecha de registro. |
| `casigcursesta` | `integer` | NO | `1` | Estado del registro (1=activo). |
| `casigdura` | `double precision` | SÍ | `` | Duración de la clase. |

**Índices:**

- `asigcurs_casigid_key`: CREATE UNIQUE INDEX asigcurs_casigid_key ON public.asigcurs USING btree (casigid, ccursid, cdoceid)
- `asigcurs_pkey`: CREATE UNIQUE INDEX asigcurs_pkey ON public.asigcurs USING btree (asigcursid)

---

#### `public.asigcurscomp` — tabla

**Descripción:** Competencias (logros) asociadas a una asignatura que pertenece a un curso.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `asigcurscompid` | `integer` | NO | `` | Identificador único del registro. |
| `asigcursid` | `integer` | NO | `` | Asignatura-curso (FK a asigcurs). |
| `ccompid` | `integer` | NO | `` | Competencia (FK a tabcomp). |
| `asigcurscompesta` | `integer` | NO | `1` | Estado del registro (1=activo). |

**Índices:**

- `logros irrepetibles`: CREATE UNIQUE INDEX "logros irrepetibles" ON public.asigcurscomp USING btree (asigcursid, ccompid)
- `miscompetenciasxano`: CREATE UNIQUE INDEX miscompetenciasxano ON public.asigcurscomp USING btree (asigcurscompid)

---

#### `public.asigcurscontprog` — tabla

**Descripción:** Contenido programático de una asignatura que pertenece a un curso.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `asigcurscontprogid` | `integer` | NO | `` | Identificador único del registro. |
| `asigcursid` | `integer` | NO | `` | Asignatura-curso (FK a asigcurs). |
| `ccontprogid` | `integer` | NO | `` | Contenido programático (FK a tabcontprog). |
| `casigcurscontprogfech` | `date` | NO | `` | Fecha del registro. |
| `casigcurscontprogfechregi` | `timestamp(6) without time zone` | NO | `` | Fecha de registro. |
| `asigcurscontprogesta` | `integer` | NO | `1` | Estado (1=activo). |

**Índices:**

- `asigcurscontprog_asigcursid_key`: CREATE UNIQUE INDEX asigcurscontprog_asigcursid_key ON public.asigcurscontprog USING btree (asigcursid, ccontprogid)
- `asigcurscontprog_pkey`: CREATE UNIQUE INDEX asigcurscontprog_pkey ON public.asigcurscontprog USING btree (asigcurscontprogid)

---

#### `public.avisrolldest` — tabla

**Descripción:** Tabla intermedia de avisos y roles: destinatarios (por rol) de cada aviso publicado.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cavisrolldestid` | `integer` | NO | `` | Identificador único del registro. |
| `cavisrollid` | `integer` | NO | `` | Aviso (FK a tabavisroll). |
| `crollid` | `integer` | NO | `` | Rol destinatario (FK a logic.tabroll). |
| `cavisusuadest` | `integer` | NO | `` | Usuario destino (creador). |
| `cavisusuafechinic` | `date` | NO | `` | Fecha de inicio de vigencia del aviso. |
| `cavisusuafechfina` | `date` | NO | `` | Fecha de fin de vigencia del aviso. |
| `cavisusuafechregi` | `timestamp(6) without time zone` | NO | `` | Fecha de registro. |
| `cavisrolldestesta` | `integer` | NO | `` | Estado del registro. |

**Índices:**

- `avisrolldest_pkey`: CREATE UNIQUE INDEX avisrolldest_pkey ON public.avisrolldest USING btree (cavisrolldestid)
- `ifk_publicacionesdest`: CREATE INDEX ifk_publicacionesdest ON public.avisrolldest USING btree (cavisusuafechinic, cavisusuafechfina, cavisrollid, crollid)

---

#### `public.contact.aetempmess` — tabla

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aetempmess_id` | `integer` | NO | `nextval('"contact.aetempmess_aetempmess_id_seq"'::regclass)` |  |
| `aetempmess_type` | `integer` | NO | `` |  |
| `aetempmess_text` | `text` | NO | `` |  |
| `aetempmess_guia` | `text` | NO | `` |  |
| `aetempmess_estado` | `integer` | SÍ | `1` |  |

**Índices:**

- `contact.aetempmess_pkey`: CREATE UNIQUE INDEX "contact.aetempmess_pkey" ON public."contact.aetempmess" USING btree (aetempmess_id)

---

#### `public.contact.aetempmesssede` — tabla

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aetempmess_id` | `integer` | NO | `nextval('"contact.aetempmesssede_aetempmess_id_seq"'::regclass)` |  |
| `aetempmess_type` | `integer` | NO | `` |  |
| `aetempmess_estado` | `integer` | SÍ | `1` |  |
| `aeinst_id` | `bigint` | NO | `` |  |
| `aetempmess_guia` | `text` | NO | `` |  |
| `aetempmess_text` | `text` | NO | `` |  |

**Índices:**

- `contact.aetempmesssede_pkey`: CREATE UNIQUE INDEX "contact.aetempmesssede_pkey" ON public."contact.aetempmesssede" USING btree (aetempmess_id)

---

#### `public.contact.aetempmesstype` — tabla

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aetempmesstype_id` | `integer` | NO | `nextval('"contact.aetempmesstype_aetempmesstype_id_seq"'::regclass)` |  |
| `aetempmesstype_text` | `text` | NO | `` |  |
| `aetempmesstype_estado` | `integer` | SÍ | `1` |  |

**Índices:**

- `contact.aetempmesstype_pkey`: CREATE UNIQUE INDEX "contact.aetempmesstype_pkey" ON public."contact.aetempmesstype" USING btree (aetempmesstype_id)

---

#### `public.contact.aetempmessvars` — tabla

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `aetempmessvars_id` | `integer` | NO | `nextval('"contact.aetempmessvars_aetempmessvars_id_seq"'::regclass)` |  |
| `aetempmessvars_nombre` | `character varying(19)` | NO | `` |  |
| `aetempmessvars_comentario` | `text` | NO | `` |  |
| `aetempmessvars_estado` | `integer` | SÍ | `1` |  |

**Índices:**

- `contact.aetempmessvars_pkey`: CREATE UNIQUE INDEX "contact.aetempmessvars_pkey" ON public."contact.aetempmessvars" USING btree (aetempmessvars_id)

---

#### `public.events` — tabla

**Descripción:** Eventos de calendario.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `id` | `integer` | NO | `` | Identificador único del evento. |
| `title` | `character varying(255)` | NO | `` | Título del evento. |
| `color` | `character varying(7)` | SÍ | `NULL::character varying` | Color del evento. |
| `inicio` | `timestamp without time zone` | NO | `` | Fecha/hora de inicio. |
| `fin` | `timestamp without time zone` | SÍ | `` | Fecha/hora de fin. |

---

#### `public.instarea` — tabla

**Descripción:** Áreas del saber con las que cuenta una institución.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cinstareaid` | `integer` | NO | `` | Identificador único del registro. |
| `cinstid` | `integer` | NO | `` | Institución (FK a tabinst). |
| `careaid` | `integer` | NO | `` | Área (FK a tabarea). |
| `cinstareafechregi` | `date` | NO | `` | Fecha de registro. |
| `cinstareaesta` | `integer` | NO | `1` | Estado (1=activo). |

**Índices:**

- `areasunicas`: CREATE UNIQUE INDEX areasunicas ON public.instarea USING btree (cinstid, careaid, cinstareaesta)
- `instarea_pkey`: CREATE UNIQUE INDEX instarea_pkey ON public.instarea USING btree (cinstareaid)

---

#### `public.sorteo` — tabla

**Descripción:** Sorteos (tabla de soporte).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `id` | `integer` | SÍ | `` | Identificador único del sorteo. |
| `nombre` | `text` | SÍ | `` | Nombre del sorteo. |

---

#### `public.tabanol` — tabla

**Descripción:** Año lectivo (catálogo).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `canolid` | `integer` | NO | `` | Identificador único del año lectivo. |
| `canoldesc` | `character varying(20)` | SÍ | `` | Descripción del año lectivo. |
| `canolinic` | `date` | SÍ | `` | Fecha de inicio. |
| `canolfina` | `date` | SÍ | `` | Fecha de fin. |
| `canolesta` | `integer` | SÍ | `` | Estado del año lectivo. |

**Índices:**

- `tabanol_pkey`: CREATE UNIQUE INDEX tabanol_pkey ON public.tabanol USING btree (canolid)

---

#### `public.tabarea` — tabla

**Descripción:** Áreas del saber que contienen asignaturas (catálogo).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `careaid` | `integer` | NO | `` | Identificador único del área. |
| `careadesc` | `text` | SÍ | `` | Descripción del área. |
| `careacome` | `text` | SÍ | `` | Comentario del área. |
| `careaesta` | `integer` | NO | `` | Estado del área. |

**Índices:**

- `tabarea_careadesc_key`: CREATE UNIQUE INDEX tabarea_careadesc_key ON public.tabarea USING btree (careadesc)
- `tabarea_pkey`: CREATE UNIQUE INDEX tabarea_pkey ON public.tabarea USING btree (careaid)

---

#### `public.tabareaconf` — tabla

**Descripción:** Configuración de áreas: relación año-institución-asignatura-grado con su valor/ponderación.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `careaconfid` | `integer` | NO | `` | Identificador único del registro. |
| `canolid` | `integer` | NO | `` | Año lectivo (FK a tabanol). |
| `cinstid` | `integer` | NO | `` | Institución (FK a tabinst). |
| `casigid` | `integer` | NO | `` | Asignatura (FK a tabasig). |
| `cgradid` | `integer` | NO | `` | Grado (FK a tabgrad). |
| `careaconfvalo` | `double precision` | NO | `` | Valor/ponderación de la configuración. |
| `careaconfesta` | `integer` | NO | `8` | Estado del registro (8=activo). |

**Índices:**

- `confideal`: CREATE UNIQUE INDEX confideal ON public.tabareaconf USING btree (careaconfid)
- `confirrepetible`: CREATE UNIQUE INDEX confirrepetible ON public.tabareaconf USING btree (canolid, cinstid, casigid, cgradid, careaconfesta)

---

#### `public.tabasig` — tabla

**Descripción:** Asignaturas (materias) de los cursos (catálogo).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `casigid` | `integer` | NO | `` | Identificador único de la asignatura. |
| `casigdesc` | `text` | SÍ | `` | Descripción de la asignatura. |
| `careaid` | `integer` | SÍ | `` | Área a la que pertenece (FK a tabarea). |
| `casigeval` | `boolean` | SÍ | `` | Si es evaluable. |
| `casigesta` | `integer` | NO | `1` | Estado (1=activo). |
| `casigabre` | `character varying(4)` | SÍ | `` | Abreviatura de la asignatura. |

**Índices:**

- `tabasig_casigabre_key`: CREATE UNIQUE INDEX tabasig_casigabre_key ON public.tabasig USING btree (casigabre)
- `tabasig_fkindex1`: CREATE INDEX tabasig_fkindex1 ON public.tabasig USING btree (careaid)
- `tabasig_pkey`: CREATE UNIQUE INDEX tabasig_pkey ON public.tabasig USING btree (casigid)

---

#### `public.tabavisroll` — tabla

**Descripción:** Avisos para mostrar en la bandeja de entrada (inbox) de cada rol.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cavisrollid` | `integer` | NO | `` | Identificador único del aviso. |
| `cavisorollusua` | `integer` | NO | `` | Usuario creador (FK a logic.tabusua). |
| `cavisrolltitu` | `text` | NO | `` | Título del aviso. |
| `cavisrollcont` | `text` | NO | `` | Contenido del aviso. |
| `cavisrollimag` | `text` | NO | `` | Imagen del aviso. |
| `cavisrollfechregi` | `timestamp(6) without time zone` | NO | `` | Fecha de registro. |
| `cavisrollesta` | `integer` | NO | `` | Estado del aviso. |

**Índices:**

- `tabavisroll_pkey`: CREATE UNIQUE INDEX tabavisroll_pkey ON public.tabavisroll USING btree (cavisrollid)

---

#### `public.tabavisusua` — tabla

**Descripción:** Avisos para mostrar en la bandeja de entrada de cada usuario.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cavisusuaid` | `integer` | NO | `` | Identificador único del aviso. |
| `cavisorollusua` | `integer` | NO | `` | Usuario creador (FK a logic.tabusua). |
| `cavisusuadest` | `integer` | NO | `` | Usuario destinatario. |
| `cavisusuatitu` | `text` | NO | `` | Título del aviso. |
| `cavisusuacont` | `text` | NO | `` | Contenido del aviso. |
| `cavisusuaimag` | `text` | NO | `` | Imagen del aviso. |
| `cavisusuafechinic` | `date` | NO | `` | Fecha de inicio de vigencia. |
| `cavisusuafechfina` | `date` | NO | `` | Fecha de fin de vigencia. |
| `cavisusuafechregi` | `timestamp(6) without time zone` | NO | `` | Fecha de registro. |
| `cavisusuaesta` | `integer` | NO | `` | Estado del aviso. |

**Índices:**

- `ifk_avisosparausuarios`: CREATE INDEX ifk_avisosparausuarios ON public.tabavisusua USING btree (cavisorollusua, cavisusuadest)
- `tabavisusua_pkey`: CREATE UNIQUE INDEX tabavisusua_pkey ON public.tabavisusua USING btree (cavisusuaid)

---

#### `public.tabcapa` — tabla

**Descripción:** Capacidades extraordinarias reconocidas oficialmente (catálogo).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `ccapaid` | `integer` | NO | `` | Identificador único. |
| `ccapadesc` | `character varying(64)` | SÍ | `` | Descripción de la capacidad. |
| `ccapaesta` | `integer` | SÍ | `` | Estado. |

**Índices:**

- `tabcapa_pkey`: CREATE UNIQUE INDEX tabcapa_pkey ON public.tabcapa USING btree (ccapaid)

---

#### `public.tabcara` — tabla

**Descripción:** Carácter del colegio (catálogo anexo 6).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `ccaraid` | `integer` | NO | `` | Identificador único. |
| `ccaradesc` | `character varying(128)` | SÍ | `` | Descripción del carácter. |
| `ccaraesta` | `integer` | SÍ | `` | Estado. |

**Índices:**

- `tabcara_pkey`: CREATE UNIQUE INDEX tabcara_pkey ON public.tabcara USING btree (ccaraid)

---

#### `public.tabcarg` — tabla

**Descripción:** Cargos de los docentes y demás empleados (catálogo).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `ccargid` | `integer` | NO | `` | Identificador único del cargo. |
| `ccargdesc` | `text` | SÍ | `` | Descripción del cargo. |
| `ccargesta` | `integer` | SÍ | `` | Estado del cargo. |

**Índices:**

- `tabcarg_pkey`: CREATE UNIQUE INDEX tabcarg_pkey ON public.tabcarg USING btree (ccargid)

---

#### `public.tabcerti` — tabla

**Descripción:** Relación institución-resolución: certificados/resoluciones de la institución.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `ccertiid` | `integer` | NO | `` | Identificador único del registro. |
| `cinstid` | `integer` | NO | `` | Institución (FK a tabinst). |
| `ctitucert` | `text` | NO | `` | Título del certificado. |
| `cparra1cert` | `text` | NO | `` | Párrafo 1 del certificado. |
| `cparra2cert` | `text` | NO | `` | Párrafo 2 del certificado. |

**Índices:**

- `tabcerti_pkey`: CREATE UNIQUE INDEX tabcerti_pkey ON public.tabcerti USING btree (ccertiid)

---

#### `public.tabciud` — tabla

**Descripción:** Ciudades y municipios de Colombia (catálogo geográfico).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cciudid` | `integer` | NO | `` | Identificador único del municipio. |
| `cdepageogid` | `integer` | SÍ | `` | Departamento (FK a tabdepageog). |
| `cciuddesc` | `text` | SÍ | `` | Descripción del municipio. |
| `cciudgesta` | `integer` | SÍ | `` | Estado. |

**Índices:**

- `tabciud_pkey`: CREATE UNIQUE INDEX tabciud_pkey ON public.tabciud USING btree (cciudid)

---

#### `public.tabcomp` — tabla

**Descripción:** Competencias/indicadores de desempeño (logros) por área y grado.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `ccompid` | `integer` | NO | `` | Identificador único de la competencia. |
| `careaid` | `integer` | NO | `` | Área (FK a tabarea). |
| `cgradid` | `text` | NO | `` | Grado al que aplica. |
| `ccompcodi` | `text` | NO | `` | Código de la competencia. |
| `ccompdesc` | `text` | NO | `` | Descripción de la competencia. |
| `ccompesta` | `integer` | SÍ | `8` | Estado de la competencia (8=activo). |
| `cinstid` | `integer` | SÍ | `0` | Institución (0=global). |
| `casigid` | `integer` | SÍ | `0` | Asignatura (0=global). |
| `ccomptipid` | `integer` | SÍ | `1` | Tipo de competencia. |
| `ccompobse` | `text` | SÍ | `` | Observación de la competencia. |

**Índices:**

- `guiacomeptencia`: CREATE UNIQUE INDEX guiacomeptencia ON public.tabcomp USING btree (ccompid)
- `tabcomp_fkindex1`: CREATE INDEX tabcomp_fkindex1 ON public.tabcomp USING btree (careaid, cgradid, ccompcodi)

---

#### `public.tabcompestu` — tabla

**Descripción:** Logros otorgados a un estudiante en una asignatura de un curso durante un periodo.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `ccompestuid` | `integer` | NO | `nextval('tabcompestu_ccompestuid_seq'::regclass)` | Identificador único del logro. |
| `asigcurscompid` | `integer` | NO | `` | Competencia de la asignatura-curso (FK a asigcurscomp). |
| `cperiid` | `integer` | NO | `` | Periodo académico. |
| `cmatrid` | `integer` | NO | `` | Matrícula del estudiante (FK a tabmatr). |
| `ccompestufechregi` | `timestamp without time zone` | NO | `` | Fecha de registro. |
| `ccompestuesta` | `integer` | NO | `8` | Estado del logro (8=activo). |

**Índices:**

- `logros_irrepetibles`: CREATE UNIQUE INDEX logros_irrepetibles ON public.tabcompestu USING btree (asigcurscompid, cperiid, cmatrid, ccompestuesta)
- `mislogros`: CREATE UNIQUE INDEX mislogros ON public.tabcompestu USING btree (ccompestuid)
- `tablogros_fkindex1`: CREATE INDEX tablogros_fkindex1 ON public.tabcompestu USING btree (cmatrid, cperiid, asigcurscompid)

---

#### `public.tabconf` — tabla

**Descripción:** Tipos de conflicto de los que ha sido víctima el estudiante (catálogo).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cconfid` | `integer` | NO | `` | Identificador único del conflicto. |
| `cconfdesc` | `text` | SÍ | `` | Descripción del conflicto. |
| `cconfesta` | `integer` | SÍ | `` | Estado. |

**Índices:**

- `tabconf_pkey`: CREATE UNIQUE INDEX tabconf_pkey ON public.tabconf USING btree (cconfid)

---

#### `public.tabconfig` — tabla

**Descripción:** Configuración general (correo electrónico de notificaciones).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cconfigid` | `integer` | NO | `` | Identificador único de la configuración. |
| `cconfigemail` | `text` | NO | `` | Correo configurado. |
| `cconfigesta` | `integer` | NO | `` | Estado. |

**Índices:**

- `tabconfig_pkey`: CREATE UNIQUE INDEX tabconfig_pkey ON public.tabconfig USING btree (cconfigid)

---

#### `public.tabconfigvar` — tabla

**Descripción:** Variables de configuración por institución (parámetros booleanos).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cconfvarid` | `integer` | NO | `` | Identificador único de la variable. |
| `cinstid` | `integer` | NO | `` | Institución (FK a tabinst). |
| `cconfpp` | `integer` | SÍ | `` | Configuración de política de privacidad. |
| `cconfbol` | `boolean` | SÍ | `` | Configuración boletín. |
| `cconfaccestu` | `boolean` | SÍ | `` | Configuración de acceso de estudiantes. |

**Índices:**

- `tabconfigvar_pkey`: CREATE UNIQUE INDEX tabconfigvar_pkey ON public.tabconfigvar USING btree (cconfvarid)

---

#### `public.tabcons` — tabla

**Descripción:** Constancias (documentos) por institución.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cconsid` | `integer` | NO | `` | Identificador único de la constancia. |
| `cinstid` | `integer` | NO | `` | Institución (FK a tabinst). |
| `ctitucons` | `text` | NO | `` | Título de la constancia. |
| `cparra1cons` | `text` | NO | `` | Párrafo 1. |
| `cparra2cons` | `text` | NO | `` | Párrafo 2. |

**Índices:**

- `tabcons_pkey`: CREATE UNIQUE INDEX tabcons_pkey ON public.tabcons USING btree (cconsid)

---

#### `public.tabcontprog` — tabla

**Descripción:** Catálogo de contenidos programáticos por asignatura.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `ccontprogid` | `integer` | NO | `` | Identificador único del contenido. |
| `casigid` | `integer` | NO | `` | Asignatura (FK a tabasig). |
| `ccontprogcodi` | `character varying(8)` | SÍ | `` | Código del contenido. |
| `ccontprogdesc` | `text` | NO | `` | Descripción del contenido programático. |
| `ccontprogesta` | `integer` | NO | `1` | Estado (1=activo). |

**Índices:**

- `ifk_asigcontprog`: CREATE INDEX ifk_asigcontprog ON public.tabcontprog USING btree (casigid, ccontprogcodi)
- `tabcontprog_pkey`: CREATE UNIQUE INDEX tabcontprog_pkey ON public.tabcontprog USING btree (ccontprogid)

---

#### `public.tabcurs` — tabla

**Descripción:** Cursos abiertos cada año lectivo por las instituciones.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `ccursid` | `integer` | NO | `` | Identificador único del curso. |
| `cinstid` | `integer` | NO | `` | Institución (FK a tabinst). |
| `cgradid` | `integer` | SÍ | `` | Grado (FK a tabgrad). |
| `cjornid` | `integer` | SÍ | `` | Jornada (FK a tabjorn). |
| `canolid` | `integer` | NO | `` | Año lectivo (FK a tabanol). |
| `ccursnomb` | `text` | SÍ | `` | Nombre del curso. |
| `ccurslimiestu` | `integer` | NO | `` | Límite de estudiantes. |
| `ccursdire` | `integer` | SÍ | `` | Director de curso. |
| `ccurscoor` | `integer` | NO | `0` | Coordinador del curso. |
| `ccursesta` | `integer` | NO | `8` | Estado del curso (8=activo). |
| `csedeid` | `integer` | NO | `0` | Sede (FK a tabinstsede). |

**Índices:**

- `cursnavigation`: CREATE UNIQUE INDEX cursnavigation ON public.tabcurs USING btree (cinstid, cgradid, cjornid, canolid, ccursnomb)
- `tabcurs_fkindex1`: CREATE INDEX tabcurs_fkindex1 ON public.tabcurs USING btree (cgradid)
- `tabcurs_fkindex2`: CREATE INDEX tabcurs_fkindex2 ON public.tabcurs USING btree (cinstid)
- `tabcurs_fkindex3`: CREATE INDEX tabcurs_fkindex3 ON public.tabcurs USING btree (cjornid)
- `tabcurs_fkindex4`: CREATE INDEX tabcurs_fkindex4 ON public.tabcurs USING btree (canolid)
- `tabcurs_pkey`: CREATE UNIQUE INDEX tabcurs_pkey ON public.tabcurs USING btree (ccursid)

---

#### `public.tabcursem` — tabla

**Descripción:** Relación de un curso que funciona por semestre con un periodo académico.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `ccursemid` | `integer` | NO | `` | Identificador único del registro. |
| `ccursid` | `integer` | SÍ | `` | Curso (FK a tabcurs). |
| `anolperiid` | `integer` | SÍ | `` | Periodo académico (FK a anolperi). |
| `ccursemesta` | `integer` | NO | `8` | Estado (8=activo). |

**Índices:**

- `tabcurs_anolperi_key`: CREATE UNIQUE INDEX tabcurs_anolperi_key ON public.tabcursem USING btree (ccursid, anolperiid, ccursemesta)
- `tabcursem_pkey`: CREATE UNIQUE INDEX tabcursem_pkey ON public.tabcursem USING btree (ccursemid)

---

#### `public.tabdepageog` — tabla

**Descripción:** Departamentos administrativos de Colombia (catálogo geográfico).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cdepageogid` | `integer` | NO | `` | Identificador único del departamento. |
| `cdepageogdesc` | `text` | SÍ | `` | Descripción del departamento. |
| `cdepageogesta` | `integer` | SÍ | `` | Estado. |

**Índices:**

- `tabdepageog_pkey`: CREATE UNIQUE INDEX tabdepageog_pkey ON public.tabdepageog USING btree (cdepageogid)

---

#### `public.tabdisc` — tabla

**Descripción:** Discapacidades reconocidas oficialmente (catálogo).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cdiscid` | `integer` | NO | `` | Identificador único de la discapacidad. |
| `cdiscdesc` | `character varying(64)` | SÍ | `` | Descripción de la discapacidad. |
| `cdiscesta` | `integer` | SÍ | `` | Estado. |

**Índices:**

- `tabdisc_pkey`: CREATE UNIQUE INDEX tabdisc_pkey ON public.tabdisc USING btree (cdiscid)

---

#### `public.tabdisci` — tabla

**Descripción:** Disciplinas/materias del sistema (catálogo).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cdisciid` | `integer` | NO | `` | Identificador único de la disciplina. |
| `cdiscnomb` | `text` | SÍ | `` | Nombre de la disciplina. |
| `cdiscesta` | `integer` | NO | `8` | Estado (8=activo). |
| `cdiscabre` | `character varying(4)` | SÍ | `` | Abreviatura de la disciplina. |

**Índices:**

- `tabdisci_pkey`: CREATE UNIQUE INDEX tabdisci_pkey ON public.tabdisci USING btree (cdisciid)

---

#### `public.tabdiscinst` — tabla

**Descripción:** Disciplinas habilitadas por institución.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cdiscinstid` | `integer` | NO | `` | Identificador único del registro. |
| `cdisciid` | `integer` | NO | `` | Disciplina (FK a tabdisci). |
| `cinstid` | `integer` | NO | `` | Institución (FK a tabinst). |
| `cestainstdisc` | `integer` | NO | `8` | Estado (8=activo). |

**Índices:**

- `tabdiscinst_pkey`: CREATE UNIQUE INDEX tabdiscinst_pkey ON public.tabdiscinst USING btree (cdiscinstid)

---

#### `public.tabdiscnota` — tabla

**Descripción:** Notas por disciplina para un estudiante matriculado en un periodo.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cdiscnotaid` | `integer` | NO | `` | Identificador único de la nota. |
| `cdiscinstid` | `integer` | NO | `` | Disciplina-institución (FK a tabdiscinst). |
| `cmatrid` | `integer` | NO | `` | Matrícula (FK a tabmatr). |
| `cperiid` | `integer` | NO | `` | Periodo académico. |
| `cdiscnotavalo` | `double precision` | NO | `` | Valor de la nota. |
| `cdiscnotafech` | `timestamp(6) without time zone` | NO | `` | Fecha de la nota. |
| `cdiscnotafechregi` | `date` | NO | `` | Fecha de registro. |
| `cdiscnotaobse` | `text` | SÍ | `` | Observación de la nota. |
| `cestadiscnota` | `integer` | NO | `8` | Estado de la nota (8=activo). |

**Índices:**

- `tabdiscnota_pkey`: CREATE UNIQUE INDEX tabdiscnota_pkey ON public.tabdiscnota USING btree (cdiscnotaid)

---

#### `public.tabdoce` — tabla

**Descripción:** Docentes en general (datos personales).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cdoceid` | `integer` | NO | `` | Identificador único del docente. |
| `cdocenomb` | `text` | SÍ | `` | Primer nombre. |
| `cdocenomb2` | `text` | SÍ | `` | Segundo nombre. |
| `cdoceapel` | `text` | SÍ | `` | Primer apellido. |
| `cdoceapel2` | `text` | SÍ | `` | Segundo apellido. |
| `cdocefnac` | `date` | SÍ | `` | Fecha de nacimiento. |
| `cdocesexo` | `integer` | SÍ | `` | Sexo (FK a tabsexo). |
| `cdocetiposang` | `integer` | SÍ | `` | Tipo de sangre (FK a tabtiposang). |
| `cdocefoto` | `character varying(100)` | SÍ | `` | Foto del docente. |
| `cdocetipoiden` | `integer` | SÍ | `` | Tipo de identificación (FK a tabtipodocu). |
| `cdoceiden` | `character varying(15)` | SÍ | `` | Número de identificación (único). |
| `cdocecelu` | `character varying(30)` | SÍ | `` | Celular. |
| `cdocetele` | `character varying(30)` | SÍ | `` | Teléfono. |
| `cdocedire` | `character varying(100)` | SÍ | `` | Dirección. |
| `cdoceemai` | `character varying(45)` | SÍ | `` | Correo electrónico. |
| `cdocefechingr` | `date` | SÍ | `` | Fecha de ingreso. |
| `cdocefechregi` | `date` | SÍ | `` | Fecha de registro. |
| `cdocenombrado` | `integer` | SÍ | `` | Si es nombrado en propiedad. |
| `cdoceesta` | `integer` | SÍ | `` | Estado del docente. |
| `cdocefirm` | `text` | SÍ | `` | Firma del docente. |

**Índices:**

- `tabdoce_pkey`: CREATE UNIQUE INDEX tabdoce_pkey ON public.tabdoce USING btree (cdoceid)
- `unicaccdocente`: CREATE UNIQUE INDEX unicaccdocente ON public.tabdoce USING btree (cdoceiden)

---

#### `public.tabempr` — tabla

**Descripción:** Empresas (EPS, ARS, seguros, riesgos) donde están vinculados los docentes.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cemprid` | `integer` | NO | `` | Identificador único de la empresa. |
| `cemprdesc` | `text` | SÍ | `` | Nombre de la empresa. |
| `cemprdire` | `text` | SÍ | `` | Dirección de la empresa. |
| `cemprtele` | `text` | SÍ | `` | Teléfono de la empresa. |
| `cemprpers` | `text` | SÍ | `` | Persona de contacto. |
| `cempresta` | `integer` | SÍ | `` | Estado de la empresa. |

**Índices:**

- `tabempr_pkey`: CREATE UNIQUE INDEX tabempr_pkey ON public.tabempr USING btree (cemprid)

---

#### `public.tabesca` — tabla

**Descripción:** Relación institución-escala: rangos de calificación y las escalas correspondientes.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cescaid` | `integer` | NO | `` | Identificador único del registro. |
| `cinstid` | `integer` | NO | `` | Institución (FK a tabinst). |
| `canolid` | `integer` | NO | `` | Año lectivo (FK a tabanol). |
| `cescanaciid` | `integer` | NO | `` | Escala nacional (FK a tabescanaci). |
| `cescacualid` | `integer` | NO | `` | Escala cualitativa (FK a tabescacual). |
| `cescadesd` | `double precision` | NO | `` | Valor desde del rango. |
| `cescahast` | `double precision` | NO | `` | Valor hasta del rango. |

**Índices:**

- `tabesca_pkey`: CREATE UNIQUE INDEX tabesca_pkey ON public.tabesca USING btree (cescaid)

---

#### `public.tabescacual` — tabla

**Descripción:** Escala cualitativa de calificación (catálogo).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cescacualid` | `integer` | NO | `` | Identificador único. |
| `cescacualdesc` | `text` | SÍ | `` | Descripción de la escala. |
| `cescacualesta` | `integer` | SÍ | `` | Estado. |

**Índices:**

- `tabescacual_pkey`: CREATE UNIQUE INDEX tabescacual_pkey ON public.tabescacual USING btree (cescacualid)

---

#### `public.tabescanaci` — tabla

**Descripción:** Escala nacional de calificación (catálogo).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cescanaciid` | `integer` | NO | `` | Identificador único. |
| `cescanacidesc` | `text` | SÍ | `` | Descripción de la escala. |
| `cescanaciesta` | `integer` | SÍ | `` | Estado. |

**Índices:**

- `tabescanaci_pkey`: CREATE UNIQUE INDEX tabescanaci_pkey ON public.tabescanaci USING btree (cescanaciid)

---

#### `public.tabespeinst` — tabla

**Descripción:** Especialidad de la institución (catálogo).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cespeinstid` | `integer` | NO | `` | Identificador único. |
| `cespeinstdesc` | `character varying(45)` | SÍ | `` | Descripción de la especialidad. |
| `cespeinstesta` | `integer` | SÍ | `` | Estado. |

**Índices:**

- `tabespeinst_pkey`: CREATE UNIQUE INDEX tabespeinst_pkey ON public.tabespeinst USING btree (cespeinstid)

---

#### `public.tabestacurs` — tabla

**Descripción:** Estado de un curso (catálogo: aprobó, reprobó, desertó, etc.).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cestacursid` | `integer` | NO | `` | Identificador único del estado. |
| `cestacursdesc` | `text` | SÍ | `` | Descripción del estado. |
| `cestacursesta` | `integer` | SÍ | `` | Estado. |

**Índices:**

- `tabestacurs_pkey`: CREATE UNIQUE INDEX tabestacurs_pkey ON public.tabestacurs USING btree (cestacursid)

---

#### `public.tabestagene` — tabla

**Descripción:** Estados generales para todos los registros de las tablas (catálogo maestro).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cestageneid` | `integer` | NO | `` | Identificador único del estado. |
| `cestagenedesc` | `text` | SÍ | `` | Descripción del estado. |

**Índices:**

- `tabestagene_pkey`: CREATE UNIQUE INDEX tabestagene_pkey ON public.tabestagene USING btree (cestageneid)

---

#### `public.tabestagrad` — tabla

**Descripción:** Estado del grado (catálogo).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cestagradid` | `integer` | NO | `` | Identificador único. |
| `cestagraddesc` | `text` | SÍ | `` | Descripción del estado del grado. |
| `cestagradesta` | `integer` | SÍ | `` | Estado. |

**Índices:**

- `tabestagrad_pkey`: CREATE UNIQUE INDEX tabestagrad_pkey ON public.tabestagrad USING btree (cestagradid)

---

#### `public.tabestr` — tabla

**Descripción:** Estrato socioeconómico (catálogo).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cestrid` | `integer` | NO | `` | Identificador único del estrato. |
| `cestrdesc` | `integer` | SÍ | `` | Descripción del estrato. |
| `cestresta` | `integer` | SÍ | `` | Estado. |

**Índices:**

- `tabestr_pkey`: CREATE UNIQUE INDEX tabestr_pkey ON public.tabestr USING btree (cestrid)

---

#### `public.tabestu` — tabla

**Descripción:** Datos personales del estudiante.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cestuid` | `integer` | NO | `` | Identificador único del estudiante. |
| `ctipodocuid` | `integer` | NO | `` | Tipo de documento (FK a tabtipodocu). |
| `cestuiden` | `character varying(20)` | NO | `` | Número de identificación (único). |
| `cestuidenexpemuni` | `integer` | SÍ | `` | Municipio de expedición del documento. |
| `cestuidenexpedepa` | `integer` | SÍ | `` | Departamento de expedición del documento. |
| `cestunomb` | `text` | SÍ | `` | Primer nombre. |
| `cestunomb2` | `text` | SÍ | `` | Segundo nombre. |
| `cestuapel` | `text` | SÍ | `` | Primer apellido. |
| `cestuapel2` | `text` | SÍ | `` | Segundo apellido. |
| `cestufechnaci` | `date` | SÍ | `` | Fecha de nacimiento. |
| `cestutiposang` | `integer` | SÍ | `` | Tipo de sangre (FK a tabtiposang). |
| `cestufoto` | `text` | SÍ | `` | Foto del estudiante. |
| `cestutele` | `text` | SÍ | `` | Teléfono. |
| `cestudire` | `text` | SÍ | `` | Dirección. |
| `cestuluganacidepa` | `integer` | SÍ | `` | Departamento de nacimiento. |
| `cestuluganacimuni` | `integer` | SÍ | `` | Municipio de nacimiento. |
| `cestugene` | `integer` | NO | `` | Género (FK a tabsexo). |
| `cestuesta` | `integer` | NO | `` | Estado del estudiante (FK a tabestagene). |
| `cestuemai` | `character varying(45)` | SÍ | `` | Correo electrónico. |

**Índices:**

- `tabestu_cestuiden_key`: CREATE UNIQUE INDEX tabestu_cestuiden_key ON public.tabestu USING btree (cestuiden)
- `tabestu_fkindex2`: CREATE INDEX tabestu_fkindex2 ON public.tabestu USING btree (ctipodocuid)
- `tabestu_pkey`: CREATE UNIQUE INDEX tabestu_pkey ON public.tabestu USING btree (cestuid)

---

#### `public.tabestuacud` — tabla

**Descripción:** Acudientes (datos) asociados a la matrícula de un estudiante.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cestuacudid` | `integer` | NO | `` | Identificador único del acudiente. |
| `cmatrid` | `integer` | NO | `` | Matrícula (FK a tabmatr). |
| `cestuacudiden` | `text` | SÍ | `` | Identificación del acudiente. |
| `cestuacudnomb` | `text` | SÍ | `` | Nombre del acudiente. |
| `cestuacudtele` | `text` | SÍ | `` | Teléfono del acudiente. |
| `cestuacuddire` | `text` | SÍ | `` | Dirección del acudiente. |
| `cestuacudemai` | `text` | SÍ | `` | Correo del acudiente. |
| `cestuacudpare` | `integer` | SÍ | `` | Parentesco (FK a tabpare). |
| `cestuacudesta` | `integer` | NO | `8` | Estado del acudiente (8=activo). |

**Índices:**

- `tabestuacud_fkindex`: CREATE INDEX tabestuacud_fkindex ON public.tabestuacud USING btree (cmatrid, cestuacudpare)
- `tabestuacud_pkey`: CREATE UNIQUE INDEX tabestuacud_pkey ON public.tabestuacud USING btree (cestuacudid)

---

#### `public.tabestuotrodato` — tabla

**Descripción:** Otros datos del estudiante concernientes al anexo 6 del gobierno nacional.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cestuotrodatoid` | `integer` | NO | `` | Identificador único del registro. |
| `cmatrid` | `integer` | NO | `` | Matrícula (FK a tabmatr). |
| `cestuotrodatoprovpriv` | `character varying(1)` | NO | `` | Proveniente de institución privada (S/N). |
| `cestuotrodatosubs` | `character varying(1)` | NO | `` | Recibe subsidio (S/N). |
| `cestuotrodatomadrhoga` | `character varying(1)` | NO | `` | Madre cabeza de hogar (S/N). |
| `cestuotrodatohijomadrhoga` | `character varying(1)` | NO | `` | Hijo de madre cabeza de hogar (S/N). |
| `cestuotrodatobenevete` | `character varying(1)` | NO | `` | Beneficiario veterano (S/N). |
| `cestuotrodatobenehero` | `character varying(1)` | NO | `` | Beneficiario héroe (S/N). |
| `cestuotrodatodisc` | `integer` | NO | `` | Discapacidad (FK a tabdisc). |
| `cestuotrodatocapa` | `integer` | NO | `` | Capacidad extraordinaria (FK a tabcapa). |
| `cestuotrodatoetni` | `integer` | NO | `` | Etnia (FK a tabetni). |
| `cestuotrodatoesta` | `integer` | NO | `` | Estado (FK a tabestagene). |
| `cestuotrodatofuerec` | `integer` | SÍ | `` | Fuente de recursos (FK a tabfuenrecu). |
| `cestuotrodatonomicbf` | `integer` | SÍ | `1` | Número ICBF (FK a tabicbf). |

**Índices:**

- `tabestuotrodato_fkindex`: CREATE INDEX tabestuotrodato_fkindex ON public.tabestuotrodato USING btree (cmatrid, cestuotrodatoid)
- `tabestuotrodato_fkindex2`: CREATE INDEX tabestuotrodato_fkindex2 ON public.tabestuotrodato USING btree (cestuotrodatodisc, cestuotrodatocapa)
- `tabestuotrodato_pkey`: CREATE UNIQUE INDEX tabestuotrodato_pkey ON public.tabestuotrodato USING btree (cestuotrodatoid)

---

#### `public.tabestusociecon` — tabla

**Descripción:** Datos socioeconómicos del estudiante (matrícula).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cestusocieconid` | `integer` | NO | `` | Identificador único del registro. |
| `cmatrid` | `integer` | NO | `` | Matrícula (FK a tabmatr). |
| `cestusocieconzonaresi` | `integer` | NO | `` | Zona de residencia (FK a tabzonaresi). |
| `cestusocieconestr` | `integer` | NO | `` | Estrato (FK a tabestr). |
| `cestusocieconsisb` | `integer` | NO | `` | SISBEN (FK a tabsisb). |
| `cestusociecondeparesi` | `integer` | NO | `` | Departamento de residencia (FK a tabdepageog). |
| `cestusocieconmuniresi` | `integer` | NO | `` | Municipio de residencia (FK a tabciud). |
| `cestusocieconvictconf` | `integer` | NO | `` | Víctima de conflicto (FK a tabconf). |
| `cestusocieconultidepaexpu` | `integer` | SÍ | `` | Último departamento donde fue expulsado. |
| `cestusocieconultimuniexpu` | `integer` | SÍ | `` | Último municipio donde fue expulsado. |
| `cestusocieconmuniprov` | `integer` | SÍ | `` | Municipio de procedencia. |
| `cestusocieregu` | `integer` | SÍ | `1` | Régimen. |
| `cestusocieconesta` | `integer` | NO | `8` | Estado (8=activo). |

**Índices:**

- `tabestusociecon_fkindex`: CREATE INDEX tabestusociecon_fkindex ON public.tabestusociecon USING btree (cmatrid, cestusocieconsisb, cestusocieconestr)
- `tabestusociecon_pkey`: CREATE UNIQUE INDEX tabestusociecon_pkey ON public.tabestusociecon USING btree (cestusocieconid)

---

#### `public.tabetni` — tabla

**Descripción:** Grupos étnicos dados por el MEN (catálogo).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cetniid` | `integer` | NO | `` | Identificador único de la etnia. |
| `cetnicodi` | `integer` | NO | `` | Código de la etnia. |
| `cetnidesc` | `text` | NO | `` | Descripción de la etnia. |
| `cetniesta` | `integer` | NO | `` | Estado de la etnia. |

**Índices:**

- `tabetni_pkey`: CREATE UNIQUE INDEX tabetni_pkey ON public.tabetni USING btree (cetniid)

---

#### `public.tabeval` — tabla

**Descripción:** Tipos de criterios de evaluación (juicios de valoración, frecuencia, etc.).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cevalid` | `integer` | NO | `` | Identificador único del criterio. |
| `cevaltipo` | `character varying(50)` | SÍ | `` | Tipo de criterio. |
| `cevaldesc` | `text` | SÍ | `` | Descripción del criterio. |
| `cevalesta` | `integer` | SÍ | `8` | Estado (8=activo). |

**Índices:**

- `tabeval_pkey`: CREATE UNIQUE INDEX tabeval_pkey ON public.tabeval USING btree (cevalid)

---

#### `public.tabevalsub` — tabla

**Descripción:** Subcriterios de evaluación por institución (valoraciones de un criterio).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cevalsubid` | `integer` | NO | `nextval('tabevalsub_cevalsubid_seq'::regclass)` | Identificador único del subcriterio. |
| `cevalid` | `integer` | NO | `` | Criterio padre (FK a tabeval). |
| `cinstid` | `integer` | NO | `` | Institución (FK a tabinst). |
| `cevalnomb` | `character varying(100)` | SÍ | `` | Nombre del subcriterio. |
| `cevalsigl` | `character varying(4)` | SÍ | `` | Sigla del subcriterio. |
| `cevalini` | `double precision` | SÍ | `0` | Valor inicial. |
| `cevalfin` | `double precision` | SÍ | `0` | Valor final. |
| `cevalsubesta` | `integer` | NO | `8` | Estado (8=activo). |

**Índices:**

- `tabevalsub_pkey`: CREATE UNIQUE INDEX tabevalsub_pkey ON public.tabevalsub USING btree (cevalsubid)

---

#### `public.tabfirm` — tabla

**Descripción:** Firmas correspondientes según la institución y el tipo de documento.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cfirmid` | `integer` | NO | `` | Identificador único de la firma. |
| `cinstid` | `integer` | NO | `` | Institución (FK a tabinst). |
| `cdoceid` | `integer` | NO | `` | Docente que firma (FK a tabdoce). |
| `cfirmcarg` | `character varying(50)` | SÍ | `` | Cargo de la firma. |
| `cfirmtipo` | `integer` | NO | `` | Tipo de documento en el que firma. |
| `cfirmorde` | `integer` | NO | `` | Orden de la firma. |
| `cestafirm` | `integer` | NO | `8` | Estado de la firma (8=activo). |

**Índices:**

- `tabfirm_pkey`: CREATE UNIQUE INDEX tabfirm_pkey ON public.tabfirm USING btree (cfirmid)

---

#### `public.tabfuenrecu` — tabla

**Descripción:** Fuente de recursos del estudiante (catálogo).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cfuenrecuid` | `integer` | NO | `` | Identificador único. |
| `cfuenrecudesc` | `text` | SÍ | `` | Descripción de la fuente de recursos. |
| `cfuenrecuesta` | `integer` | SÍ | `` | Estado. |

**Índices:**

- `tabfuenrecu_pkey`: CREATE UNIQUE INDEX tabfuenrecu_pkey ON public.tabfuenrecu USING btree (cfuenrecuid)

---

#### `public.tabgrad` — tabla

**Descripción:** Grados oficiales (catálogo).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cgradid` | `integer` | NO | `` | Identificador único del grado. |
| `cgradcodi` | `integer` | SÍ | `` | Código del grado. |
| `cgraddesc` | `text` | SÍ | `` | Descripción del grado. |
| `cgradesta` | `integer` | SÍ | `` | Estado del grado. |
| `cgradnive` | `text` | SÍ | `` | Nivel del grado (preescolar, básica, media). |

**Índices:**

- `tabgrad_pkey`: CREATE UNIQUE INDEX tabgrad_pkey ON public.tabgrad USING btree (cgradid)

---

#### `public.tabicbf` — tabla

**Descripción:** Instituciones ICBF (catálogo).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cicbfid` | `integer` | NO | `` | Identificador único del ICBF. |
| `cnombicbf` | `text` | SÍ | `` | Nombre del ICBF. |
| `cestaicbf` | `integer` | SÍ | `` | Estado. |

**Índices:**

- `cicbfid_key`: CREATE UNIQUE INDEX cicbfid_key ON public.tabicbf USING btree (cicbfid)

---

#### `public.tabinst` — tabla

**Descripción:** Instituciones educativas oficiales y extraoficiales.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cinstid` | `integer` | NO | `` | Identificador único de la institución. |
| `tabzonaresi_czonaresiid` | `integer` | NO | `` | Zona de residencia (FK a tabzonaresi). |
| `tabmetoinst_cmetoinst` | `integer` | NO | `` | Método institucional (FK a tabmetoinst). |
| `cinstdire` | `text` | NO | `` | Dirección de la institución. |
| `tabespeinst_cespeinstid` | `integer` | NO | `` | Especialidad (FK a tabespeinst). |
| `cinstnomb` | `text` | SÍ | `` | Nombre de la institución. |
| `cinstcodidane` | `character varying(20)` | SÍ | `` | Código DANE de la institución. |
| `cinstpadre` | `integer` | SÍ | `` | Institución padre (sedes). |
| `cinstciud` | `integer` | SÍ | `` | Ciudad (FK a tabciud). |
| `cinstdepa` | `integer` | SÍ | `` | Departamento (FK a tabdepageog). |
| `cinstescu` | `text` | NO | `'archivos/instituciones/imagenes/escudo.jpg'::text` | Escudo de la institución. |
| `cinstesta` | `integer` | NO | `8` | Estado (FK a tabestagene, 8=activo). |
| `cinsttele` | `text` | SÍ | `` | Teléfono. |
| `cinstemai` | `text` | SÍ | `` | Correo electrónico. |
| `cinstlema` | `text` | SÍ | `` | Lema institucional. |
| `cinstnit` | `text` | SÍ | `` | NIT de la institución. |
| `cinstcara` | `integer` | SÍ | `` | Carácter (FK a tabcara). |
| `cinstfirm` | `character varying(100)` | SÍ | `'archivos/instituciones/auto/blanco.jpg'::character varying` | Firma de la institución. |
| `cinstreconocimiento` | `text` | SÍ | `` | Reconocimiento oficial. *(Columna añadida en la consolidación, 2026-08)* |
| `cinsthimno` | `text` | SÍ | `` | Himno de la institución. *(Columna añadida en la consolidación, 2026-08)* |
| `cinstresolrector` | `text` | SÍ | `` | Resolución rectoral. *(Columna añadida en la consolidación, 2026-08)* |
| `cinstmanualconvivencia` | `text` | SÍ | `` | Manual de convivencia. *(Columna añadida en la consolidación, 2026-08)* |
| `cinstcalendario` | `character varying` | SÍ | `` | Calendario (A/B). *(Columna añadida en la consolidación, 2026-08)* |
| `cinstcoordx` | `real` | SÍ | `` | Coordenada X (georreferenciación). *(Columna añadida en la consolidación, 2026-08)* |
| `cinstcoordy` | `real` | SÍ | `` | Coordenada Y (georreferenciación). *(Columna añadida en la consolidación, 2026-08)* |
| `cinstfacebook` | `text` | SÍ | `` | Red social Facebook. *(Columna añadida en la consolidación, 2026-08)* |
| `cinstinstagram` | `text` | SÍ | `` | Red social Instagram. *(Columna añadida en la consolidación, 2026-08)* |
| `cinstyoutube` | `text` | SÍ | `` | Canal de YouTube. *(Columna añadida en la consolidación, 2026-08)* |
| `cinsttiktok` | `text` | SÍ | `` | Red social TikTok. *(Columna añadida en la consolidación, 2026-08)* |
| `cinsttwitter` | `text` | SÍ | `` | Red social Twitter/X. *(Columna añadida en la consolidación, 2026-08)* |

**Índices:**

- `tabinst_fkindex1`: CREATE INDEX tabinst_fkindex1 ON public.tabinst USING btree (tabzonaresi_czonaresiid)
- `tabinst_fkindex2`: CREATE INDEX tabinst_fkindex2 ON public.tabinst USING btree (tabespeinst_cespeinstid)
- `tabinst_fkindex3`: CREATE INDEX tabinst_fkindex3 ON public.tabinst USING btree (tabmetoinst_cmetoinst)
- `tabinst_fkindex4`: CREATE INDEX tabinst_fkindex4 ON public.tabinst USING btree (cinstdire)
- `tabinst_pkey`: CREATE UNIQUE INDEX tabinst_pkey ON public.tabinst USING btree (cinstid)

---

#### `public.tabinstdoce` — tabla

**Descripción:** Docentes contratados en una institución en un año lectivo determinado (nómina).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cinstdoceid` | `integer` | NO | `` | Identificador único del registro. |
| `cinstid` | `integer` | NO | `` | Institución (FK a tabinst). |
| `cdoceid` | `integer` | NO | `` | Docente (FK a tabdoce). |
| `canolid` | `integer` | NO | `` | Año lectivo (FK a tabanol). |
| `ccargid` | `integer` | NO | `` | Cargo (FK a tabcarg). |
| `ctipovincid` | `integer` | NO | `` | Tipo de vinculación (FK a tabtipovinc). |
| `cinstdocesala` | `integer` | SÍ | `` | Salario. |
| `cinstdoceeps` | `integer` | SÍ | `` | EPS (FK a tabempr). |
| `cinstdocears` | `integer` | SÍ | `` | ARS (FK a tabempr). |
| `cinstdocecaja` | `integer` | SÍ | `` | Caja de compensación (FK a tabempr). |
| `cinstdocearp` | `integer` | SÍ | `` | ARP/riesgos (FK a tabempr). |
| `cinstdocefechinic` | `date` | SÍ | `` | Fecha de inicio del contrato. |
| `cinstdocefechfina` | `date` | SÍ | `` | Fecha de fin del contrato. |
| `cinstdocefechregi` | `date` | SÍ | `` | Fecha de registro. |
| `cinstdoceesta` | `integer` | SÍ | `` | Estado (FK a tabestagene). |
| `cjefearea` | `integer` | SÍ | `0` | Si es jefe de área. |

**Índices:**

- `nominanavegacion`: CREATE UNIQUE INDEX nominanavegacion ON public.tabinstdoce USING btree (cinstid, canolid, cdoceid, cinstdoceesta)
- `tabinstdoce_pkey`: CREATE UNIQUE INDEX tabinstdoce_pkey ON public.tabinstdoce USING btree (cinstdoceid)

---

#### `public.tabinstreso` — tabla

**Descripción:** Recursos institucionales (inventario).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cinstresoid` | `integer` | NO | `` | Identificador único del recurso. |
| `cinstid` | `integer` | NO | `` | Institución (FK a tabinst). |
| `cinstresodesc` | `text` | NO | `` | Descripción del recurso. |
| `cinstdec` | `integer` | SÍ | `2` | Cantidad de recursos. |
| `cinsttipar` | `integer` | SÍ | `1` | Tipo de recurso. |
| `cinstcolcar` | `text` | SÍ | `'58ACFA'::text` | Color/característica del recurso. |

**Índices:**

- `tabinstreso_pkey`: CREATE UNIQUE INDEX tabinstreso_pkey ON public.tabinstreso USING btree (cinstresoid)

---

#### `public.tabinstsede` — tabla

**Descripción:** Sedes de las instituciones.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `csedeid` | `integer` | NO | `` | Identificador único de la sede. |
| `cinstid` | `integer` | NO | `` | Institución (FK a tabinst). |
| `csedenomb` | `text` | NO | `` | Nombre de la sede. |

**Índices:**

- `tabsede_pkey`: CREATE UNIQUE INDEX tabsede_pkey ON public.tabinstsede USING btree (csedeid)

---

#### `public.tabjorn` — tabla

**Descripción:** Jornadas oficiales (catálogo).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cjornid` | `integer` | NO | `` | Identificador único de la jornada. |
| `cjorndesc` | `character varying(20)` | SÍ | `` | Descripción de la jornada. |
| `cjornesta` | `integer` | SÍ | `` | Estado. |

**Índices:**

- `tabjorn_pkey`: CREATE UNIQUE INDEX tabjorn_pkey ON public.tabjorn USING btree (cjornid)

---

#### `public.tablogcomp` — tabla

**Descripción:** Registro histórico de temas y competencias vistos.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `clogcompid` | `integer` | NO | `nextval('tablogcomp_clogcompid_seq'::regclass)` | Identificador único del registro. |
| `ccontprogid` | `integer` | SÍ | `` | Contenido programático (FK a tabcontprog). |
| `ccompid` | `integer` | NO | `` | Competencia (FK a tabcomp). |
| `casigid` | `integer` | NO | `` | Asignatura (FK a tabasig). |
| `cgradid` | `integer` | NO | `` | Grado (FK a tabgrad). |
| `cnotafechregi` | `timestamp(6) without time zone` | NO | `` | Fecha de registro. |

**Índices:**

- `tablogcomp_fkindex1`: CREATE INDEX tablogcomp_fkindex1 ON public.tablogcomp USING btree (cgradid, casigid, ccontprogid, ccompid)
- `tablogcomp_pkey`: CREATE UNIQUE INDEX tablogcomp_pkey ON public.tablogcomp USING btree (clogcompid)

---

#### `public.tabmatr` — tabla

**Descripción:** Matrícula de todas las instituciones.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cmatrid` | `integer` | NO | `` | Identificador único de la matrícula. |
| `cestuid` | `integer` | SÍ | `` | Estudiante (FK a tabestu). |
| `ccursid` | `integer` | SÍ | `` | Curso (FK a tabcurs). |
| `cmatrinst` | `integer` | SÍ | `` | Institución de la matrícula. |
| `cmatrfech` | `date` | SÍ | `` | Fecha de la matrícula. |
| `cmatrnuevestu` | `boolean` | SÍ | `false` | Si es estudiante nuevo. |
| `cmatrirepi` | `boolean` | SÍ | `false` | Si es repitente. |
| `cmatrianopasasitu` | `integer` | SÍ | `` | Año en que aprobó su situación (FK a tabestacurs). |
| `cmatrvaloinsc` | `double precision` | NO | `0` | Valor de inscripción. |
| `cmatrvalopens` | `double precision` | NO | `0` | Valor de pensión. |
| `cmatrdesc` | `double precision` | NO | `0` | Valor de descuento. |
| `cmatresta` | `integer` | NO | `13` | Estado de la matrícula (13=matriculado). |
| `cmatrianopasacond` | `integer` | SÍ | `` | Año en que aprobó condicionalmente. |

**Índices:**

- `tabmatr_cestuid_key`: CREATE UNIQUE INDEX tabmatr_cestuid_key ON public.tabmatr USING btree (cestuid, ccursid, cmatrinst)
- `tabmatr_fkindex1`: CREATE INDEX tabmatr_fkindex1 ON public.tabmatr USING btree (cestuid)
- `tabmatr_fkindex2`: CREATE INDEX tabmatr_fkindex2 ON public.tabmatr USING btree (ccursid)
- `tabmatr_pkey`: CREATE UNIQUE INDEX tabmatr_pkey ON public.tabmatr USING btree (cmatrid)

---

#### `public.tabmatrpago` — tabla

**Descripción:** Cumplimiento de pagos de los estudiantes matriculados.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cmatrpagoid` | `integer` | NO | `` | Identificador único del pago. |
| `cmatrid` | `integer` | NO | `` | Matrícula (FK a tabmatr). |
| `cmatrpagoperi` | `integer` | NO | `` | Periodo del pago. |
| `cmatrpagofech` | `date` | NO | `` | Fecha del pago. |
| `cmatrpagoesta` | `integer` | NO | `` | Estado del pago. |

**Índices:**

- `tabmatrpago_pkey`: CREATE UNIQUE INDEX tabmatrpago_pkey ON public.tabmatrpago USING btree (cmatrpagoid)

---

#### `public.tabmetoinst` — tabla

**Descripción:** Métodos institucionales oficiales (catálogo: escuela tradicional, escuela nueva, etc.).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cmetoinstid` | `integer` | NO | `` | Identificador único del método. |
| `cmetoinstdesc` | `text` | SÍ | `` | Descripción del método. |
| `cmetoinstesta` | `integer` | SÍ | `` | Estado. |

**Índices:**

- `tabmetoinst_pkey`: CREATE UNIQUE INDEX tabmetoinst_pkey ON public.tabmetoinst USING btree (cmetoinstid)

---

#### `public.tabnota` — tabla

**Descripción:** Notas de un estudiante en una asignatura (por competencia y periodo).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cnotaid` | `integer` | NO | `nextval('tabnota_cnotaid_seq'::regclass)` | Identificador único de la nota. |
| `asigcursid` | `integer` | NO | `` | Asignatura-curso (FK a asigcurs). |
| `ccompid` | `integer` | NO | `` | Competencia evaluada (FK a tabcomp). |
| `cperiid` | `integer` | NO | `` | Periodo académico. |
| `cmatrid` | `integer` | NO | `` | Matrícula (FK a tabmatr). |
| `cnotavalo` | `double precision` | NO | `` | Valor de la nota. |
| `cnotafech` | `date` | NO | `` | Fecha de la nota. |
| `cnotafechregi` | `timestamp(6) without time zone` | NO | `` | Fecha de registro. |
| `cnotaobse` | `text` | SÍ | `` | Observación de la nota. |
| `cnotaesta` | `integer` | NO | `8` | Estado de la nota (8=activo). |

**Índices:**

- `tabnota_cperiid_key`: CREATE UNIQUE INDEX tabnota_cperiid_key ON public.tabnota USING btree (cperiid, asigcursid, ccompid, cmatrid, cnotaesta)
- `tabnota_fkindex1`: CREATE INDEX tabnota_fkindex1 ON public.tabnota USING btree (cperiid, asigcursid, ccompid, cmatrid)
- `tabnota_pkey`: CREATE UNIQUE INDEX tabnota_pkey ON public.tabnota USING btree (cnotaid)
- `tabnotahist_fkindex1`: CREATE INDEX tabnotahist_fkindex1 ON public.tabnota USING btree (cperiid, asigcursid, ccompid, cmatrid)

---

#### `public.tabnota2013` — tabla

**Descripción:** Archivo histórico de notas del año 2013 (estructura igual a tabnota).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cnotaid` | `integer` | NO | `nextval('tabnota2013_cnotaid_seq'::regclass)` | Identificador único de la nota. |
| `asigcursid` | `integer` | NO | `` | Asignatura-curso. |
| `ccompid` | `integer` | NO | `` | Competencia. |
| `cperiid` | `integer` | NO | `` | Periodo. |
| `cmatrid` | `integer` | NO | `` | Matrícula. |
| `cnotavalo` | `double precision` | NO | `` | Valor de la nota. |
| `cnotafech` | `date` | NO | `` | Fecha. |
| `cnotafechregi` | `timestamp(6) without time zone` | NO | `` | Fecha de registro. |
| `cnotaobse` | `text` | SÍ | `` | Observación. |
| `cnotaesta` | `integer` | SÍ | `` | Estado. |

**Índices:**

- `tabnota2013_cperiid_key`: CREATE UNIQUE INDEX tabnota2013_cperiid_key ON public.tabnota2013 USING btree (cperiid, asigcursid, ccompid, cmatrid, cnotaesta)
- `tabnota2013_pkey`: CREATE UNIQUE INDEX tabnota2013_pkey ON public.tabnota2013 USING btree (cnotaid)

---

#### `public.tabnota2014` — tabla

**Descripción:** Archivo histórico de notas del año 2014 (estructura igual a tabnota).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cnotaid` | `integer` | NO | `nextval('tabnota2014_cnotaid_seq'::regclass)` | Identificador único de la nota. |
| `asigcursid` | `integer` | NO | `` | Asignatura-curso. |
| `ccompid` | `integer` | NO | `` | Competencia. |
| `cperiid` | `integer` | NO | `` | Periodo. |
| `cmatrid` | `integer` | NO | `` | Matrícula. |
| `cnotavalo` | `double precision` | NO | `` | Valor de la nota. |
| `cnotafech` | `date` | NO | `` | Fecha. |
| `cnotafechregi` | `timestamp(6) without time zone` | NO | `` | Fecha de registro. |
| `cnotaobse` | `text` | SÍ | `` | Observación. |
| `cnotaesta` | `integer` | SÍ | `` | Estado. |

**Índices:**

- `tabnota2014_cperiid_key`: CREATE UNIQUE INDEX tabnota2014_cperiid_key ON public.tabnota2014 USING btree (cperiid, asigcursid, ccompid, cmatrid, cnotaesta)
- `tabnota2014_pkey`: CREATE UNIQUE INDEX tabnota2014_pkey ON public.tabnota2014 USING btree (cnotaid)

---

#### `public.tabnota2015` — tabla

**Descripción:** Archivo histórico de notas del año 2015 (estructura igual a tabnota).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cnotaid` | `integer` | NO | `nextval('tabnota2015_cnotaid_seq'::regclass)` | Identificador único de la nota. |
| `asigcursid` | `integer` | NO | `` | Asignatura-curso. |
| `ccompid` | `integer` | NO | `` | Competencia. |
| `cperiid` | `integer` | NO | `` | Periodo. |
| `cmatrid` | `integer` | NO | `` | Matrícula. |
| `cnotavalo` | `double precision` | NO | `` | Valor de la nota. |
| `cnotafech` | `date` | NO | `` | Fecha. |
| `cnotafechregi` | `timestamp(6) without time zone` | NO | `` | Fecha de registro. |
| `cnotaobse` | `text` | SÍ | `` | Observación. |
| `cnotaesta` | `integer` | SÍ | `` | Estado. |

**Índices:**

- `tabnota2015_cperiid_key`: CREATE UNIQUE INDEX tabnota2015_cperiid_key ON public.tabnota2015 USING btree (cperiid, asigcursid, ccompid, cmatrid, cnotaesta)
- `tabnota2015_pkey`: CREATE UNIQUE INDEX tabnota2015_pkey ON public.tabnota2015 USING btree (cnotaid)

---

#### `public.tabnota2016` — tabla

**Descripción:** Archivo histórico de notas del año 2016 (estructura igual a tabnota).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cnotaid` | `integer` | NO | `nextval('tabnota2016_cnotaid_seq'::regclass)` | Identificador único de la nota. |
| `asigcursid` | `integer` | NO | `` | Asignatura-curso. |
| `ccompid` | `integer` | NO | `` | Competencia. |
| `cperiid` | `integer` | NO | `` | Periodo. |
| `cmatrid` | `integer` | NO | `` | Matrícula. |
| `cnotavalo` | `double precision` | NO | `` | Valor de la nota. |
| `cnotafech` | `date` | NO | `` | Fecha. |
| `cnotafechregi` | `timestamp(6) without time zone` | NO | `` | Fecha de registro. |
| `cnotaobse` | `text` | SÍ | `` | Observación. |
| `cnotaesta` | `integer` | SÍ | `` | Estado. |

**Índices:**

- `tabnota2016_cperiid_key`: CREATE UNIQUE INDEX tabnota2016_cperiid_key ON public.tabnota2016 USING btree (cperiid, asigcursid, ccompid, cmatrid, cnotaesta)
- `tabnota2016_pkey`: CREATE UNIQUE INDEX tabnota2016_pkey ON public.tabnota2016 USING btree (cnotaid)

---

#### `public.tabnotadef` — tabla

**Descripción:** Promedios definitivos por asignatura/dimensión por periodo.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cnotadefid` | `integer` | NO | `nextval('tabnota_cnotaid_seq'::regclass)` | Identificador único del promedio. |
| `cmatrid` | `integer` | NO | `` | Matrícula (FK a tabmatr). |
| `asigcursid` | `integer` | NO | `` | Asignatura-curso (FK a asigcurs). |
| `cperiid` | `integer` | NO | `` | Periodo académico. |
| `ctipodeseid` | `integer` | NO | `` | Tipo de desempeño (FK a tabtipodese). |
| `cnotadefvalo` | `double precision` | NO | `` | Valor definitivo. |
| `cnotadeffech` | `timestamp(6) without time zone` | NO | `` | Fecha del promedio. |
| `cnotadeffechregi` | `date` | NO | `` | Fecha de registro. |
| `cnotadefobse` | `text` | SÍ | `` | Observación. |
| `cnotadefesta` | `integer` | NO | `8` | Estado (8=activo). |

**Índices:**

- `tabnotadef_pkey`: CREATE UNIQUE INDEX tabnotadef_pkey ON public.tabnotadef USING btree (cnotadefid)
- `tabnotadef_varios_key`: CREATE UNIQUE INDEX tabnotadef_varios_key ON public.tabnotadef USING btree (cmatrid, asigcursid, cperiid, ctipodeseid, cnotadefesta)

---

#### `public.tabnotahist` — tabla

**Descripción:** Notas históricas de un estudiante en una asignatura.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cnotaid` | `integer` | NO | `nextval('tabnotahist_cnotaid_seq'::regclass)` | Identificador único de la nota histórica. |
| `asigcursid` | `integer` | NO | `` | Asignatura-curso (FK a asigcurs). |
| `ccompid` | `integer` | NO | `` | Competencia (FK a tabcomp). |
| `cperiid` | `integer` | NO | `` | Periodo académico. |
| `cmatrid` | `integer` | NO | `` | Matrícula (FK a tabmatr). |
| `cnotavalo` | `double precision` | NO | `` | Valor de la nota. |
| `cnotafech` | `date` | NO | `` | Fecha de la nota. |
| `cnotafechregi` | `timestamp(6) without time zone` | NO | `` | Fecha de registro. |
| `cnotaobse` | `text` | SÍ | `` | Observación. |
| `cnotaesta` | `integer` | NO | `9` | Estado (9=inactivo). |

**Índices:**

- `tabnotahist_cperiid_key`: CREATE UNIQUE INDEX tabnotahist_cperiid_key ON public.tabnotahist USING btree (cperiid, asigcursid, ccompid, cmatrid, cnotaesta)
- `tabnotahist_pkey`: CREATE UNIQUE INDEX tabnotahist_pkey ON public.tabnotahist USING btree (cnotaid)

---

#### `public.tabnove` — tabla

**Descripción:** Novedades: inasistencias, observaciones, etc. de un estudiante.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cnoveid` | `integer` | NO | `nextval('tabla_id_seq'::regclass)` | Identificador único de la novedad. |
| `asigcursid` | `integer` | NO | `` | Asignatura-curso (FK a asigcurs). |
| `cperiid` | `integer` | NO | `` | Periodo (FK a anolperi). |
| `cmatrid` | `integer` | NO | `` | Matrícula (FK a tabmatr). |
| `cnovefech` | `date` | NO | `` | Fecha de la novedad. |
| `cnovefechregi` | `timestamp(6) without time zone` | NO | `` | Fecha de registro. |
| `cnoveobse` | `text` | SÍ | `` | Observación de la novedad. |
| `ctiponoveid` | `integer` | NO | `` | Tipo de novedad (FK a tabtiponove). |
| `cnoveesta` | `integer` | NO | `1` | Estado (1=activo). |

**Índices:**

- `ifk_novedades`: CREATE INDEX ifk_novedades ON public.tabnove USING btree (asigcursid, cmatrid, ctiponoveid)
- `tabnove_pkey`: CREATE UNIQUE INDEX tabnove_pkey ON public.tabnove USING btree (cnoveid)

---

#### `public.tabpare` — tabla

**Descripción:** Parentescos útiles en los datos personales (catálogo).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpareid` | `integer` | NO | `` | Identificador único del parentesco. |
| `cparedesc` | `text` | NO | `` | Descripción del parentesco. |
| `cpareesta` | `integer` | NO | `1` | Estado (1=activo). |

**Índices:**

- `tabpare_pkey`: CREATE UNIQUE INDEX tabpare_pkey ON public.tabpare USING btree (cpareid)

---

#### `public.tabpazsalv` — tabla

**Descripción:** Plantilla institucional del documento constancia de paz y salvo.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpazsalvid` | `integer` | NO | `` | Identificador único de la plantilla. |
| `cinstid` | `integer` | NO | `` | Institución (FK a tabinst). |
| `ctitupazsalv1` | `character varying(100)` | SÍ | `` | Título 1 del documento. |
| `ctitupazsalv2` | `character varying(100)` | SÍ | `` | Título 2 del documento. |
| `cparrpazsalv1` | `text` | SÍ | `` | Párrafo 1. |
| `cparrpazsalv2` | `text` | SÍ | `` | Párrafo 2. |
| `cestapazsal` | `integer` | NO | `8` | Estado (8=activo). |

**Índices:**

- `cpazsalvid_pkey`: CREATE UNIQUE INDEX cpazsalvid_pkey ON public.tabpazsalv USING btree (cpazsalvid)

---

#### `public.tabperi` — tabla

**Descripción:** Periodos de un año lectivo para todas las instituciones (catálogo).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cperiid` | `integer` | NO | `` | Identificador único del periodo. |
| `cperidesc` | `integer` | SÍ | `` | Descripción del periodo. |
| `cperinomb` | `text` | SÍ | `` | Nombre del periodo. |
| `cperiesta` | `integer` | SÍ | `` | Estado. |

**Índices:**

- `tabperi_pkey`: CREATE UNIQUE INDEX tabperi_pkey ON public.tabperi USING btree (cperiid)

---

#### `public.tabperival` — tabla

**Descripción:** Valores (etiquetas) para cada periodo académico.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cperivalid` | `integer` | NO | `` | Identificador único del valor. |
| `cperivaldesc` | `text` | NO | `` | Descripción del valor. |
| `canolperiid` | `integer` | NO | `` | Periodo institucional (FK a anolperi). |
| `cperivalesta` | `integer` | NO | `` | Estado. |

**Índices:**

- `tabperival_pkey`: CREATE UNIQUE INDEX tabperival_pkey ON public.tabperival USING btree (cperivalid)

---

#### `public.tabpromasig` — tabla

**Descripción:** Promedio por asignatura: calculado para el promedio general del estudiante.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | NO | `nextval('tabpromasig_cpromasigid_seq'::regclass)` | Identificador único del promedio. |
| `cpromoid` | `integer` | NO | `` | Promedio general (FK a tabpromo). |
| `canolid` | `integer` | NO | `` | Año lectivo (FK a tabanol). |
| `cpromasigpond` | `double precision` | NO | `` | Ponderación de la asignatura. |
| `careaid` | `integer` | NO | `` | Área (FK a tabarea). |
| `asigcursid` | `integer` | NO | `` | Asignatura-curso (FK a asigcurs). |
| `cpromasigprom` | `double precision` | NO | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | NO | `1` | Estado (1=activo). |

**Índices:**

- `idpromediofinalasignatura`: CREATE UNIQUE INDEX idpromediofinalasignatura ON public.tabpromasig USING btree (cpromasigid)

---

#### `public.tabpromdef` — tabla

**Descripción:** Promedios definitivos por matrícula y por periodo.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromdefid` | `integer` | NO | `` | Identificador único del promedio. |
| `cmatrid` | `integer` | NO | `` | Matrícula (FK a tabmatr). |
| `cperiid` | `integer` | NO | `` | Periodo (FK a anolperi). |
| `ctipopromid` | `integer` | NO | `` | Tipo de promedio. |
| `cpromdefvalo` | `double precision` | NO | `` | Valor del promedio. |
| `cpromdefesta` | `integer` | NO | `8` | Estado (8=activo). |

**Índices:**

- `cpromdefid_pkey`: CREATE UNIQUE INDEX cpromdefid_pkey ON public.tabpromdef USING btree (cpromdefid)
- `cpromdefid_varios_key`: CREATE UNIQUE INDEX cpromdefid_varios_key ON public.tabpromdef USING btree (cmatrid, cperiid, cpromdefesta)

---

#### `public.tabpromo` — tabla

**Descripción:** Promedios generales de cada estudiante (con reglas de promoción).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromoid` | `integer` | NO | `` | Identificador único del promedio. |
| `cpromfin` | `double precision` | NO | `` | Promedio final. |
| `cpromdef` | `boolean` | NO | `` | Si el promedio es definitivo. |
| `cgradodesde` | `integer` | NO | `` | Grado desde. |
| `cgradopara` | `integer` | NO | `` | Grado para. |
| `cpromoesta` | `integer` | SÍ | `` | Estado. |

**Índices:**

- `tabpromo_pkey`: CREATE UNIQUE INDEX tabpromo_pkey ON public.tabpromo USING btree (cpromoid)

---

#### `public.tabresg` — tabla

**Descripción:** Resguardos indígenas (catálogo).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cresgid` | `integer` | NO | `` | Identificador único del resguardo. |
| `cresgcodi` | `text` | NO | `` | Código del resguardo. |
| `cresgdesc` | `text` | NO | `` | Descripción del resguardo. |
| `cresgesta` | `integer` | NO | `` | Estado. |

**Índices:**

- `tabresg_pkey`: CREATE UNIQUE INDEX tabresg_pkey ON public.tabresg USING btree (cresgid)

---

#### `public.tabsexo` — tabla

**Descripción:** Género (catálogo).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `csexoid` | `integer` | NO | `` | Identificador único del género. |
| `csexodesc` | `text` | SÍ | `` | Descripción del género. |
| `csexoesta` | `integer` | SÍ | `` | Estado. |

**Índices:**

- `tabsexo_pkey`: CREATE UNIQUE INDEX tabsexo_pkey ON public.tabsexo USING btree (csexoid)

---

#### `public.tabsie` — tabla

**Descripción:** SIE (Sistema Institucional de Evaluación): valor de promoción por institución y año.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `csieid` | `integer` | NO | `` | Identificador único del registro. |
| `ctipodeseid` | `integer` | NO | `` | Tipo de desempeño (FK a tabtipodese). |
| `cinstid` | `integer` | NO | `` | Institución (FK a tabinst). |
| `canolid` | `integer` | NO | `` | Año lectivo (FK a tabanol). |
| `cvalprosie` | `double precision` | NO | `` | Valor de promoción. |
| `csieesta` | `integer` | NO | `8` | Estado (8=activo). |
| `clibsie` | `bit(1)` | SÍ | `` | Indicador de libre/autonomía. |

**Índices:**

- `tabsie_pkey`: CREATE UNIQUE INDEX tabsie_pkey ON public.tabsie USING btree (csieid)

---

#### `public.tabsisb` — tabla

**Descripción:** Niveles SISBEN (catálogo).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `csisbid` | `integer` | NO | `` | Identificador único del nivel. |
| `csisbdesc` | `text` | SÍ | `` | Descripción del nivel SISBEN. |
| `csisbesta` | `integer` | SÍ | `` | Estado. |

**Índices:**

- `tabsisb_pkey`: CREATE UNIQUE INDEX tabsisb_pkey ON public.tabsisb USING btree (csisbid)

---

#### `public.tabsucu` — tabla

**Descripción:** Ubicación de las escuelas en el mapa web (sucursales).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `csucuidpunt` | `integer` | NO | `` | Identificador único del punto. |
| `csucudesc` | `text` | NO | `` | Descripción de la ubicación. |
| `csuculong` | `double precision` | NO | `` | Longitud. |
| `csuculati` | `double precision` | NO | `` | Latitud. |
| `csucudire` | `text` | SÍ | `` | Dirección. |
| `csucucodi` | `integer` | SÍ | `` | Código de la sucursal (único). |
| `csucuclas` | `character(1)` | SÍ | `` | Clase de sucursal. |

**Índices:**

- `tabsucu_csucucodi_key`: CREATE UNIQUE INDEX tabsucu_csucucodi_key ON public.tabsucu USING btree (csucucodi)
- `tabsucu_pkey`: CREATE UNIQUE INDEX tabsucu_pkey ON public.tabsucu USING btree (csucuidpunt)

---

#### `public.tabtipodese` — tabla

**Descripción:** Tipos de desempeño (cognitivo, personal, social, etc.) (catálogo).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `ctipodeseid` | `integer` | NO | `` | Identificador único del tipo de desempeño. |
| `cdesctipodese` | `text` | NO | `` | Descripción del tipo de desempeño. |
| `cestatipdese` | `integer` | NO | `8` | Estado (8=activo). |

**Índices:**

- `tabtipodese_pkey`: CREATE UNIQUE INDEX tabtipodese_pkey ON public.tabtipodese USING btree (ctipodeseid)

---

#### `public.tabtipodocu` — tabla

**Descripción:** Tipos de documento oficiales en Colombia (catálogo).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `ctipodocuid` | `integer` | NO | `` | Identificador único del tipo de documento. |
| `ctipodocudesc` | `text` | SÍ | `` | Descripción del tipo de documento. |
| `ctipodocuesta` | `integer` | SÍ | `` | Estado. |

**Índices:**

- `tabtipodocu_pkey`: CREATE UNIQUE INDEX tabtipodocu_pkey ON public.tabtipodocu USING btree (ctipodocuid)

---

#### `public.tabtiponota` — tabla

**Descripción:** Tipos de nota para la calificación de indicadores de logros (catálogo).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `ctiponotaid` | `integer` | NO | `` | Identificador único del tipo de nota. |
| `ctiponotadesc` | `text` | SÍ | `` | Descripción del tipo de nota. |
| `ctiponotaesta` | `integer` | SÍ | `` | Estado. |

**Índices:**

- `tabtiponota_pkey`: CREATE UNIQUE INDEX tabtiponota_pkey ON public.tabtiponota USING btree (ctiponotaid)

---

#### `public.tabtiponove` — tabla

**Descripción:** Tipos de novedad: inasistencia, observación, etc. (catálogo).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `ctiponoveid` | `integer` | NO | `` | Identificador único del tipo de novedad. |
| `ctiponovedesc` | `text` | SÍ | `` | Descripción del tipo de novedad. |
| `ctiponoveesta` | `integer` | SÍ | `` | Estado. |
| `ctiponoveabre` | `character varying(2)` | SÍ | `` | Abreviatura del tipo de novedad. |

**Índices:**

- `tabtiponove_pkey`: CREATE UNIQUE INDEX tabtiponove_pkey ON public.tabtiponove USING btree (ctiponoveid)

---

#### `public.tabtiposang` — tabla

**Descripción:** Tipos de sangre conocidos (catálogo).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `ctiposangid` | `integer` | NO | `` | Identificador único del tipo de sangre. |
| `ctiposangdesc` | `character varying(20)` | SÍ | `` | Descripción del tipo de sangre. |
| `ctiposangesta` | `integer` | SÍ | `` | Estado. |

**Índices:**

- `tabtiposang_pkey`: CREATE UNIQUE INDEX tabtiposang_pkey ON public.tabtiposang USING btree (ctiposangid)

---

#### `public.tabtiposubs` — tabla

**Descripción:** Tipos de subsidio (catálogo).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `ctiposubsid` | `integer` | NO | `` | Identificador único del subsidio. |
| `ctiposubsdesc` | `text` | SÍ | `` | Descripción del subsidio. |
| `ctiposubsesta` | `integer` | SÍ | `` | Estado. |

**Índices:**

- `tabtiposubs_pkey`: CREATE UNIQUE INDEX tabtiposubs_pkey ON public.tabtiposubs USING btree (ctiposubsid)

---

#### `public.tabtipovinc` — tabla

**Descripción:** Tipos de vinculación en los contratos de los empleados (catálogo).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `ctipovincid` | `integer` | NO | `` | Identificador único del tipo de vinculación. |
| `ctipovincdesc` | `text` | SÍ | `` | Descripción del tipo de vinculación. |
| `ctipovincesta` | `integer` | SÍ | `` | Estado. |

**Índices:**

- `tabtipovinc_pkey`: CREATE UNIQUE INDEX tabtipovinc_pkey ON public.tabtipovinc USING btree (ctipovincid)

---

#### `public.tabunio` — tabla

**Descripción:** Unión de los usuarios de login con los usuarios académicos (enlace entre esquemas).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cunioid` | `integer` | NO | `` | Identificador único del enlace. |
| `cusuaid` | `integer` | NO | `` | Usuario de login (FK a logic.tabusua). |
| `cacadid` | `integer` | NO | `` | Usuario académico (estudiante/docente) asociado. |
| `cunioesta` | `integer` | NO | `` | Estado del enlace. |

**Índices:**

- `tabunio_cusuaid_key`: CREATE UNIQUE INDEX tabunio_cusuaid_key ON public.tabunio USING btree (cusuaid, cacadid, cunioesta)
- `tabunio_pkey`: CREATE UNIQUE INDEX tabunio_pkey ON public.tabunio USING btree (cunioid)

---

#### `public.tabutil` — tabla

**Descripción:** Útiles escolares requeridos para los cursos.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cutilid` | `integer` | NO | `` | Identificador único del útil. |
| `ccursid` | `integer` | NO | `` | Curso (FK a tabcurs). |
| `cutilcant` | `integer` | SÍ | `` | Cantidad del útil. |
| `cutildesc` | `text` | SÍ | `` | Descripción del útil. |

**Índices:**

- `tabutil_pkey`: CREATE UNIQUE INDEX tabutil_pkey ON public.tabutil USING btree (cutilid)

---

#### `public.tabzonaresi` — tabla

**Descripción:** Zona de residencia oficial (catálogo).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `czonaresiid` | `integer` | NO | `` | Identificador único de la zona. |
| `czonaresidesc` | `text` | NO | `` | Descripción de la zona. |
| `czonaresiesta` | `integer` | SÍ | `` | Estado. |

**Índices:**

- `irrepetizona`: CREATE UNIQUE INDEX irrepetizona ON public.tabzonaresi USING btree (czonaresidesc)
- `tabzonaresi_pkey`: CREATE UNIQUE INDEX tabzonaresi_pkey ON public.tabzonaresi USING btree (czonaresiid)

---

#### `public.tipo_citacion` — tabla

**Descripción:** Tipos/motivos de citación (catálogo del SAE).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `motivo_id` | `integer` | NO | `` | Identificador único del motivo. |
| `motivo_nombre` | `character varying(200)` | NO | `` | Nombre del motivo. |
| `motivo_estado` | `smallint` | NO | `` | Estado del motivo. |

**Índices:**

- `motivo_id_pkey`: CREATE UNIQUE INDEX motivo_id_pkey ON public.tipo_citacion USING btree (motivo_id)

---

### Esquema `temporal` (SAE)

SAE — Datos temporales usados en etapas específicas del proyecto o para transformar/importar otras tablas.

Tablas/objetos: **52**

#### `temporal.matricula_2750` — tabla

**Descripción:** Snapshot temporal de matrícula y promedios por periodo (pr1-pr4) de la institución 2750.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cmatrid` | `integer` | SÍ | `` | Matrícula del estudiante. |
| `nombre` | `text` | SÍ | `` | Nombre del estudiante. |
| `pr1` | `double precision` | SÍ | `` | Promedio periodo 1. |
| `pu1` | `integer` | SÍ | `` | Puesto periodo 1. |
| `pr2` | `double precision` | SÍ | `` | Promedio periodo 2. |
| `pu2` | `integer` | SÍ | `` | Puesto periodo 2. |
| `pr3` | `double precision` | SÍ | `` | Promedio periodo 3. |
| `pu3` | `integer` | SÍ | `` | Puesto periodo 3. |
| `pr4` | `double precision` | SÍ | `` | Promedio periodo 4. |
| `pu4` | `integer` | SÍ | `` | Puesto periodo 4. |

---

#### `temporal.matricula_2752` — tabla

**Descripción:** Snapshot temporal de matrícula y promedios por periodo (pr1-pr4) de la institución 2752.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cmatrid` | `integer` | SÍ | `` | Matrícula del estudiante. |
| `nombre` | `text` | SÍ | `` | Nombre del estudiante. |
| `pr1` | `double precision` | SÍ | `` | Promedio periodo 1. |
| `pu1` | `integer` | SÍ | `` | Puesto periodo 1. |
| `pr2` | `double precision` | SÍ | `` | Promedio periodo 2. |
| `pu2` | `integer` | SÍ | `` | Puesto periodo 2. |
| `pr3` | `double precision` | SÍ | `` | Promedio periodo 3. |
| `pu3` | `integer` | SÍ | `` | Puesto periodo 3. |
| `pr4` | `double precision` | SÍ | `` | Promedio periodo 4. |
| `pu4` | `integer` | SÍ | `` | Puesto periodo 4. |

---

#### `temporal.matricula_2757` — tabla

**Descripción:** Snapshot temporal de matrícula y promedios por periodo (pr1-pr4) de la institución 2757.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cmatrid` | `integer` | SÍ | `` | Matrícula del estudiante. |
| `nombre` | `text` | SÍ | `` | Nombre del estudiante. |
| `pr1` | `double precision` | SÍ | `` | Promedio periodo 1. |
| `pu1` | `integer` | SÍ | `` | Puesto periodo 1. |
| `pr2` | `double precision` | SÍ | `` | Promedio periodo 2. |
| `pu2` | `integer` | SÍ | `` | Puesto periodo 2. |
| `pr3` | `double precision` | SÍ | `` | Promedio periodo 3. |
| `pu3` | `integer` | SÍ | `` | Puesto periodo 3. |
| `pr4` | `double precision` | SÍ | `` | Promedio periodo 4. |
| `pu4` | `integer` | SÍ | `` | Puesto periodo 4. |

---

#### `temporal.tabpromasig1129` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig1139` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig1263` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig1642` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig1654` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig1658` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig1665` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig1749` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig1750` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig1961` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig1971` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig1973` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig2049` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig2065` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig2209` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig2213` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig2215` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig2226` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig2307` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig2319` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig2320` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig2326` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig2328` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig2347` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig2355` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig2358` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig253` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig2559` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig2561` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig2575` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig2589` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig2600` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig2612` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig2619` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig2680` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig2682` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig2684` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig2690` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig2692` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig2734` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig2735` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig2823` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig2825` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig2828` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig2829` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig2834` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig351` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig519` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

#### `temporal.tabpromasig782` — tabla

**Descripción:** Snapshot temporal (copia de public.tabpromasig) con los promedios por asignatura de la institución asociada.

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `cpromasigid` | `integer` | SÍ | `` | Identificador único del promedio por asignatura. |
| `cpromoid` | `integer` | SÍ | `` | Referencia al promedio general (FK a public.tabpromo). |
| `canolid` | `integer` | SÍ | `` | Año lectivo (FK a public.tabanol). |
| `cpromasigpond` | `double precision` | SÍ | `` | Ponderación de la asignatura en el promedio. |
| `careaid` | `integer` | SÍ | `` | Área del saber (FK a public.tabarea). |
| `asigcursid` | `integer` | SÍ | `` | Asignatura-curso (FK a public.asigcurs). |
| `cpromasigprom` | `double precision` | SÍ | `` | Promedio de la asignatura. |
| `cpromasigesta` | `integer` | SÍ | `` | Estado del registro. |

---

### Esquema `varios` (SAE)

SAE — Datos adicionales para tareas específicas o que afectaban a una sola institución.

Tablas/objetos: **2**

#### `varios.estuasesoria` — tabla

**Descripción:** Estudiantes en asesoría (tarea específica de una institución).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `idases` | `integer` | NO | `` | Identificador único del registro. |
| `nomases` | `character varying(50)` | SÍ | `` | Nombre del estudiante en asesoría. |
| `estaases` | `integer` | SÍ | `` | Estado del registro. |

**Restricciones:**

- `PK`: PRIMARY KEY (idases)

**Índices:**

- `estuasesoria_pkey`: CREATE UNIQUE INDEX estuasesoria_pkey ON varios.estuasesoria USING btree (idases)

---

#### `varios.sorteo` — tabla

**Descripción:** Sorteos (tarea específica).

| Columna | Tipo | ¿Nulo? | Default | Descripción |
|---|---|---|---|---|

| `idsorteo` | `integer` | NO | `` | Identificador único del sorteo. |
| `nomsorteo` | `character varying(50)` | SÍ | `` | Nombre del sorteo. |
| `fechsorteo` | `date` | SÍ | `` | Fecha del sorteo. |
| `estasorteo` | `integer` | SÍ | `` | Estado del sorteo. |

**Restricciones:**

- `PK`: PRIMARY KEY (idsorteo)

**Índices:**

- `sorteo_pkey`: CREATE UNIQUE INDEX sorteo_pkey ON varios.sorteo USING btree (idsorteo)

---

### Esquema `migracion` (Consolidación SAE → Escuelapp)

**Descripción:** Esquema creado durante la consolidación (2026-08) que registra el mapeo de IDs entre SAE (`public`/`logic`) y Escuelapp (`data`/`engine`). Lo consume el Integration Layer (`controllers/integration/integration.sql.js`) para resolver identidades (p. ej. `migracion.map_institucion` → `contact.emisor` para el envío WhatsApp).

| Tabla | Columnas | Mapeo |
|---|---|---|
| `map_rol` | `crollid, aeroll_id` | Rol SAE → rol Escuelapp |
| `map_usuario` | `cusuaid, aeusu_id` | Usuario SAE → usuario Escuelapp |
| `map_institucion` | `aeinst_id, cinstid` | Institución Escuelapp → institución SAE |
| `map_docente` | `aedocentes_id, cdoceid` | Docente Escuelapp → docente SAE |
| `map_estudiante` | `aeestudiantes_id, cestuid` | Estudiante Escuelapp → estudiante SAE |

> Detalle completo y decisiones de la migración: ver sección «Tablas de mapeo de IDs (schema `migracion`)» al final de este documento.

---


## 5. Catálogos y valores clave (diccionarios de códigos)

Los valores de estas tablas definen el significado de las columnas de estado y de los campos enumerados en todo el modelo.

### 5.1 Estados generales — `data.aeestados` (Escuelapp)
| id | Descripción |
|---|---|
| 0 | Eliminado |
| 1 | Activo |
| 2 | Suspendido |
| 3 | Inactivo |
| 4 | Pendiente de pago |
| 5 | Respondido |
| 6 | Cerrado |
| 7 | Vencido |
| 8 | Pendiente de activación |
| 9 | Pendiente de grupo |
| 10 | Nuevo |
| 11 | Visto |
| 12 | Entregado |
| 13 | En proceso |
| 14 | Inscrito |
| 15 | Matriculado |
| 16 | Cancelado |
| 17 | Aprobado |
| 18 | Reprobado |
| 19 | Desertado |
| 20 | Bloqueado |
| 21 | Desbloqueado |
| 22 | Retirado |

### 5.2 Estados generales — `public.tabestagene` (SAE)
| id | Descripción |
|---|---|
| 1 | Aceptado |
| 2 | Eliminado |
| 4 | Pendiente |
| 5 | En proceso |
| 6 | Cerrado |
| 7 | Abierto |
| 8 | Activo |
| 9 | Inactivo |
| 10 | Desafectado |
| 11 | Desertado |
| 12 | Renuncio |
| 13 | Matriculado |
| 14 | Traslado |
| 15 | Modificado |
| 16 | Aprobado |
| 17 | Reprobado |
| 18 | Promoción anticipada |
| 19 | Promoción (Reprobados) |

### 5.3 Roles — `engine.aeroll` (Escuelapp)
| id | Rol | Descripción |
|---|---|---|
| 201 | Admin Academico | Las instituciones educativas |
| 202 | Docente | Los profesores que pertenecen a una institución |
| 203 | Estudiante | Quien es responsable del estudiante |
| 204 | Administrador | Administrador |
| 205 | Superadmin | Administrador total del sistema |
| 206 | Acudiente | Los estudiantes que no estudian |
| 207 | Coordinador | Rol institucional creado en la consolidación (privilegios copiados del 201) |
| 208 | Secretaria | Rol institucional creado en la consolidación (privilegios copiados del 201) |

### 5.4 Roles — `logic.tabroll` (SAE)
| id | Rol | cenlaid (integración) |
|---|---|---|
| 0 | administrador | 0 |
| 1 | estudiante | 40 |
| 2 | docente | 10 |
| 3 | institucion | 23 |
| 4 | acudiente | 21 |
| 5 | demostracion | 1 |
| 6 | coordinador | 10 |
| 7 | secretaria | 10 |

### 5.5 Grados — `data.aegrados` (Escuelapp)
| id | código | Grado |
|---|---|---|
| 1 | -1 | Jardín |
| 2 | 0 | Transición |
| 3 | 1 | Primero |
| 4 | 2 | Segundo |
| 5 | 3 | Tercero |
| 6 | 4 | Cuarto |
| 7 | 5 | Quinto |
| 8 | 6 | Sexto |
| 9 | 7 | Séptimo |
| 10 | 8 | Octavo |
| 11 | 9 | Noveno |
| 12 | 10 | Décimo |
| 13 | 11 | Once |

### 5.6 Tipos de envío/notificación — `data.aetipo_envio`
| id | Tipo |
|---|---|
| 1 | COMUNICADO |
| 2 | ASISTENCIA |
| 3 | HORARIO |
| 4 | EXCUSA |
| 5 | TAREA |
| 6 | EVALUACION |
| 7 | CALENDARIO |
| 8 | CONSULTASDOCENTE |
| 9 | COBRO |
| 10 | OBSERVACION |

### 5.7 Tipos de novedad — `public.tabtiponove`
| id | Tipo | Abrev. |
|---|---|---|
| 0 | INASISTENCIA | F |
| 1 | ASISTENCIA | A |
| 2 | OBSERVACION | O |
| 3 | MENCION HONORIFICA | MH |
| 4 | DISTINCION | D |
| 5 | LLAMADO DE ATENCION | AT |
| 7 | EVASION | V |
| 8 | RETRASO | R |
| 9 | EXCUSA | E |
| 10 | PERMISO | P |

### 5.8 Otros catálogos frecuentes
| Tabla | Valores (id — descripción) |
|---|---|
| `data.aetipint` | 1 Promedio · 2 Primer intento · 3 Último intento |
| `data.aetippre` (tipos de pregunta) | 0 descripción · 1 múltiple única · 2 múltiple múltiple · 3 abierta extendida · 4 abierta · 5 verdadero/falso · 6 lista · 7 grilla · 8 múltiple única con imágenes · 9 múltiple múltiple con imágenes · 10 descripción con imágenes |
| `data.aetipo_certificado` | 1 Paz y salvo · 2 Autorización de intercambios · 3 Certificado de estudio · 4 Matrícula para EPS · 5 Buena conducta · 6 Certificado de notas |
| `data.aepqr_tiposolicitud` | 1 Petición · 2 Quejas · 3 Reclamos · 4 Felicitaciones |
| `data.aecronograma_tipoevento` | 1 académica · 2 directiva · 3 financiera · 4 cobertura · 5 pastoral · 6 talento humano · 7 psicología · 8 cultural |
| `data.aetipoexcusas` | 1 Salud · 2 Calamidad doméstica · 4 Conectividad/tecnológico · 5 Compromisos médicos · 6 Incapacidad médica · 7 Compromiso personal/familiar · 8 Compromiso institucional · 9 Otros |
| `data.aemotivo` (citaciones) | 1 Agresión · 2 Evasión · 3 Llegadas tarde · 4 Uniforme · 5 Notas en el Observador · 6 Presentación personal |
| `data.aetipodocumento` | 1 C.C. Cédula · 2 C.E. Extranjería · 3 N.E.S. · 4 P.E.P. · 5 R.C. Registro civil · 6 T.I. Tarjeta de identidad |
| `public.tabtipodocu` | 1 Cédula de ciudadanía · 2 Tarjeta de identidad · 3 Cédula de extranjería · 5 Registro civil · 6 NIP · 7 NUIP · 8 NES · 9 Certificado cabildo · 10 NES |
| `public.tabpare` (parentesco) | 0 Pendiente · 1 Madre · 2 Padre · 3 Abuelo · 4 Tío · 5 Hermano · 6 Primo |
| `public.tabsexo` | 1 Femenino · 2 Masculino |
| `public.tabjorn` | 1 Completa · 2 Mañana · 3 Tarde · 4 Nocturna · 5 Fin de semana |
| `public.tabtiponota` | 1 Regular · 2 Definitiva periodo · 3 Definitiva año lectivo |
| `public.tabtipodese` (desempeño) | 1 Cognitivo · 2 Personal · 3 Social · 4 Socioafectivo · 5 Evaluación · 6 Talleres y exposiciones · 7 Apuntes y tareas · 8 Actitudinal · 99 Autoevaluación |
| `public.tabeval` | 1 Juicios de valoración · 2 Frecuencia |
| `public.tabestacurs` | 0 No estudió vigencia anterior · 1 Aprobó · 2 Reprobó · 3 Desertó · 5 Trasladado · 8 No culminó · 9 No aplica |
| `public.tabescanaci` | 1 Bajo · 2 Básico · 3 Alto · 4 Superior |
| `public.tabescacual` | 1 Insuficiente · 2 Aceptable · 3 Sobresaliente · 4 Excelente |
| `public.tabtipovinc` | 1 Aprendiz SENA · 2 Provisional · 3 Propiedad · 4 Periodo de prueba · 5-7 Provisional vacante · 8 Asesoría |
| `public.tabmetoinst` | 1 Escuela Tradicional · 2 Escuela Nueva · 3 Post Primaria · 4 Telesecundaria · 5 SER · 6 CAFAM · 7 SAT · 8 Etnoeducación · 9 Aceleración del Aprendizaje · 10 Programa jóvenes extraedad · 11-12 Preescolar |
| `public.tabzonaresi` | 1 Urbana · 2 Rural |
| `public.tabespeinst` | 0 No aplica · 5 Académico · 6 Industrial · 7 Otro · 8 Comercial · 9 Pedagógico · 10 Agropecuario · 16 Promoción social · 17 Agroturístico |
| `data.aecaracter` | 1 Público · 2 Privado |
| `data.aeconocer` | 1 Redes sociales · 2 Perifoneo · 3 Volantes · 4 Referidos · 5 Parroquia · 6 Pauta · 7 Otro |
| `data.aediscapacidades` | 0 Ninguna · 1 Física · 2 Visual · 3 Cognitiva · 4 Auditiva · 5 Otra |
| `data.aegruposanguineo` | 1 A · 2 B · 3 AB · 4 O |
| `data.aeetnias` | 0 Ninguna · 1 Mulato · 2 Mestizo · 3 Indígena · 4 Afrodescendiente |

## 6. Relaciones entre esquemas

### 6.1 Claves foráneas entre esquemas (referencias cruzadas)
| Origen | Columna | Destino | Significado |
|---|---|---|---|
| `contact.emisor` | `idempresa` | `data.aeinstituciones(aeinst_id)` | Cuenta de WhatsApp de una institución |
| `contact.emisor` | `estado` | `data.aeestados(aeestados_id)` | Estado del emisor |
| `contact.aetempmesssede` | `aeinst_id` | `data.aeinstituciones(aeinst_id)` | Plantilla por institución |
| `observador.tabobsplan` | `cinstid` | `public.tabinst(cinstid)` | Plantilla de observador por institución |
| `observador.tabresp` | `cinstid` | `public.tabinst(cinstid)` | Grupos de responsabilidad por institución |
| `observador.tabrespeval` | `cmatrid` | `public.tabmatr(cmatrid)` | Evaluación por matrícula |
| `preescolar.tabpreasig` | `ccursid` | `public.tabcurs(ccursid)` | Asignación a un curso SAE |
| `preescolar.tabprenota` / `tabprenove` | `cmatrid` | `public.tabmatr(cmatrid)` | Notas/novedades por matrícula SAE |
| `preescolar.tabprenove` | `cperiid` | `public.anolperi(anolperiid)` | Novedad por periodo |
| `public.avisrolldest` | `crollid` | `logic.tabroll(crollid)` | Avisos dirigidos a roles SAE |
| `public.tabavisroll` / `tabavisusua` | `cavisorollusua` | `logic.tabusua(cusuaid)` | Autor del aviso (usuario SAE) |

### 6.2 Equivalencias lógicas (sin FK explícita)
| Entidad | Escuelapp (`data`) | SAE (`public`) |
|---|---|---|
| Institución | `aeinstituciones.aeinst_id` | `tabinst.cinstid` |
| Docente | `aedocentes.aedocentes_id` | `tabdoce.cdoceid` |
| Estudiante | `aeestudiantes.aeestudiantes_id` | `tabestu.cestuid` |
| Acudiente | `aeacudientes.aeacudientes_id` | `tabestuacud.cestuacudid` |
| Año lectivo | `aeano.aeano_id` | `tabanol.canolid` |
| Usuario (login) | `engine.aeusu.aeusu_id` | `logic.tabusua.cusuaid` |

### 6.3 Puentes de integración
- `integration.tabenla` — mapea roles/destinos entre ambos sistemas (ver valores de `cenlaid` en 5.4).
- `integration.tabregiacti` — auditoría unificada de actividad de usuarios.
- `public.tabunio` — une el usuario de login SAE (`cusuaid`) con el usuario académico (`cacadid`).
- `engine.aeusuroll` — asigna a un usuario Escuelapp un rol dentro de una institución y año específicos.

## 7. Vistas y secuencias

### 7.1 Vistas
| Objeto | Tipo | Propósito |
|---|---|---|
| `data.aegrupos` | vista | Grupos/salones activos por institución y año, con sus útiles. |
| `data.aenotas` | vista materializada | Unifica notas/resultados (tareas y cuestionarios) por estudiante, con `aenota_tipo` = 1 (cuestionario) o 2 (tarea). |

### 7.2 Secuencias
Las claves primarias que usan `nextval()` se respaldan con secuencias por tabla (p. ej. `data.secuence_aeinst_id`, `engine.secuence_aeusu_id`, `public.tabmatr` no tiene secuencia propia y usa asignación manual). Las secuencias genéricas `public.tabla_id_seq` y `data.secuence_*` se comparten entre varias tablas. Al migrar, se recomienda normalizar cada tabla con su propia secuencia.

## 8. Notas para la migración a NodeJS + ReactJS

1. **Autenticación única**: consolidar `engine.aeusu` + `engine.aeroll` y `logic.tabusua` + `logic.tabroll` en un único sistema de usuarios/roles con alcance por institución y año (equivalente a `engine.aeusuroll`).
2. **Envíos WhatsApp**: la cola de envíos es `data.aelog_envios` (con `tipo` = `data.aetipo_envio`). El emisor autorizado por institución vive en `contact.emisor`. Las plantillas y variables están en `contact.aetempmesstype/aetempmess/aetempmesssede/aetempmessvars`.
3. **Notificaciones internas (inbox)**: `data.aenotificaciones` soporta destino por array de usuarios (`aenotificaciones_para`, índice GIN) y ruta de navegación (`aenotificaciones_ruta`).
4. **Claves numéricas mixtas**: conviven `integer`, `bigint` y `double precision` para los mismos conceptos (p. ej. `aeusu_id` es `double precision` en `data`). Al migrar, unificar tipos (recomendado: `bigint`/`integer`).
5. **Esquema `temporal` y `varios`**: son históricos/legado y no forman parte del flujo de negocio actual; pueden migrarse como datos de solo lectura o descartarse.
6. **Tablas de archivo de notas** (`tabnota2013`–`2016`) y copias (`_old`, `_`, `ss`, `_Inst`) son respaldos; conviene conservar solo la fuente de verdad actual.
7. **Restricciones de integridad**: la mayoría de FKs usan `ON UPDATE CASCADE ON DELETE CASCADE` (Escuelapp) o `ON DELETE RESTRICT` (SAE). Tenerlo en cuenta al re-diseñar el ORM/API.
8. **Responsive + notificaciones**: los catálogos de estado (`aeestados`, `tabestagene`) y tipos de envío (`aetipo_envio`) son la base para el sistema de alertas/bandeja del frontend.
# Consolidación de Schemas — bdsae2

> Análisis de los schemas duplicados/solapados `data` vs `public` y `engine` vs `logic`.
> Este documento describe el modelo de partida y la estrategia. Las operaciones SQL de consolidación **sí se ejecutaron** (2026-08): ver estado real y evals en `.agents/evals/consolidacion.md`.

---

## Estado actual

La base `bdsae2` integra dos sistemas que **coexisten**:

| Sistema | Schemas | Dominio | Rol en el nuevo proyecto |
|---|---|---|---|
| **Escuelapp** (agenda) | `contact`, `data`, `engine` | Comunicación con acudientes/estudiantes (WhatsApp) | Es la app **Node+React** actual (login activo) |
| **SAE** (PHP) | `public`, `logic`, `observador`, `preescolar`, `estadistica`, `integration`, `temporal`, `varios` | Gestión académica (matrícula, notas, observador) | Sistema **legacy PHP** a reemplazar |

**Hallazgo clave (Fase 2/3):** los datos de ambos sistemas son en gran medida **DISJUNTOS** (distintos clientes/poblaciones). Evidencias:

- Estudiantes: `data.aeestudiantes` (22 608) vs `public.tabestu` (27 792) → **solo 284 coinciden por identificación**.
- Usuarios login: `engine.aeusu` (34 691) vs `logic.tabusua` (2 090) → **solo 37 coinciden por nick**.
- Instituciones: `data.aeinstituciones` (39) contiene clientes distintos a `public.tabinst` (59).

Por lo tanto, **consolidar ≠ eliminar duplicados exactos**. La consolidación es: (1) definir **estructuras canónicas únicas** por dominio, (2) **migrar** los datos de ambos sistemas a esas estructuras con tablas de mapeo de IDs, y (3) retirar progresivamente las estructuras legacy.

---

## Fase 1 — Inventario (resumen)

### Objetos por schema

| Schema | Tablas | Vistas | Matviews | Secuencias | Funciones | Triggers | Tipos compuestos | Owner |
|---|---|---|---|---|---|---|---|---|
| `data` | 74 | 1 (`aegrupos`) | 1 (`aenotas`, owner `agendadmin`) | ~30 | 1 (`asistencias_update`) | 1 (usa `asistencias_update`) | — | `adminit4_saeroot` |
| `public` | 100 | — | — | ~30 | 5 (`consolidadonotas`, `get_keys`, `pointsstring`, `promperi`, `promperi_old`) | — | `datakey`, `outprom` | `pg_database_owner` |
| `engine` | 8 | — | — | 2 | 9 (`contacto_*`, `get_privileges`) | — | `datakey` | `adminit4_saeroot` |
| `logic` | 6 | — | — | — | — | — | — | `adminit4_saeroot` |

- **Extensiones:** solo `plpgsql` (1.0). No hay tipos ENUM/DOMAIN personalizados (solo tipos compuestos de retorno de funciones).
- **Triggers:** únicamente `data` tiene un trigger (sobre `aeasistencias`, función `asistencias_update`).

### Volumen (tablas grandes)

| Tabla | Tamaño |
|---|---|
| `public.tabnota` | ~976 MB |
| `data.aeasistencias` | ~797 MB |
| `public.tabnotadef` | ~598 MB |
| `data.aelogdispositivos` | ~386 MB |
| `data.aenotificaciones` | ~193 MB |
| `public.tabnotahist` | ~146 MB |
| `data.aelog_envios` | ~129 MB |
| `public.tabpromasig` + `tabnota2013..2016` | ~20–50 MB c/u |
| `public.tabnove`, `tabcomp` | ~20–34 MB |

---

## Fase 2 — Comparación `data` vs `public`

### Matriz de entidades

Leyenda: **A** equivalente · **B** parcialmente solapada · **C** complementaria · **D** legacy/histórica · **E** temporal/migración · **F** específica.

| Entidad / dominio | `data` (Escuelapp) | `public` (SAE) | Clase | Evidencia |
|---|---|---|---|---|
| Institución | `aeinstituciones` (39) | `tabinst` (59) | **B** | Mismo concepto; clientes distintos; columnas distintas |
| — copias | `aeinstituciones_` (37), `aeinstitucionesss` (39) | — | **D** | Backups de `aeinstituciones` |
| Docente | `aedocentes` (1 559) | `tabdoce` (1 013) | **B** | Misma entidad; poblaciones distintas |
| Docente×institución | `inst_doce` | `tabinstdoce` | **B** | Relación docente-institución-año |
| Estudiante | `aeestudiantes` (22 608) | `tabestu` (27 792) | **B** | Solo 284 coinciden por identificación |
| — copia | `aeestudiantes_old` | — | **D** | Backup |
| Acudiente | `aeacudientes` (34 777) | `tabestuacud` (50 947) | **B** | Misma entidad |
| — copia | `aeacudientes_old` | — | **D** | Backup |
| Año lectivo | `aeano` (15) | `tabanol` (15) | **A** | Catálogo equivalente (mismos 15 registros) |
| Periodo académico | — (se infiere por config) | `tabperi`, `anolperi`, `tabperival` | **C** | SAE tiene el modelo de periodos; Escuelapp solo año |
| Asistencia | `aeasistencias` (4.3 M) | `tabnove` (173 K, novedades: asistencia/inasistencia/observación) | **B** | Escuelapp registra asistencia diaria; SAE usa `tabnove`+`tabtiponove` |
| Avisos/comunicados | `aeavisos`, `aepublicaciones` (+comentarios) | `tabavisroll`, `tabavisusua`, `avisrolldest` | **B/C** | Ambos publican avisos; distinta granularidad |
| Grado | `aegrados` (13) | `tabgrad` (34) | **B** | SAE más granular (34 vs 13) |
| Jornada | `aejornada` (5) | `tabjorn` (5) | **A** | Catálogo equivalente |
| Estado | `aeestados` (23) | `tabestagene` (18) | **B** | Catálogos de estado distintos en significado |
| Tipo documento | `aetipodocumento` (6) | `tabtipodocu` (9) | **B** | SAE más completo |
| Etnia | `aeetnias` (5) | `tabetni` (86) | **B** | SAE más completo (códigos MEN) |
| Grupo sanguíneo | `aegruposanguineo` | `tabtiposang` | **B** | Catálogo equivalente |
| Discapacidad | `aediscapacidades` | `tabdisc` | **B** | Catálogo equivalente |
| Matrícula | `aematriculas_*` (0 registros) | `tabmatr` (50 903) | **C** | Escuelapp=prematrícula (vacía); SAE=matrícula real |
| Notas | `aenotas` (matview de tareas/evaluaciones) | `tabnota`, `tabnotadef`, `tabpromasig`, `tabpromdef`, `tabpromo` | **B/C** | SAE es el sistema de calificación real |
| — históricas | — | `tabnota2013`–`2016`, `tabnotahist` | **D** | Archivo por año |
| Citación | `aecitaciones` (5) | `tipo_citacion` (6, motivos) | **B** | Escuelapp=citaciones; SAE=motivos |
| Tareas/evaluaciones | `aetar*`, `aecue/aepre/aeopcres/inst_cue*` | — | **F** | Exclusivo de Escuelapp |
| Excusas, PQRS, notificaciones, logs | `aeexcusas*`, `aepqr*`, `aenotificaciones`, `aelog_*` | — | **F** | Exclusivo de Escuelapp |
| Observador | `aebitacora*` (bitácora) | `observador.tabresp*` (observador) | **C** | Dominios distintos (bitácora vs observador de convivencia) |

### Conclusiones de Fase 2

1. `data` contiene el dominio **agenda/comunicación** (avisos, asistencias, tareas, evaluaciones, excusas, PQRS, WhatsApp, notificaciones) — casi **sin equivalente** en `public`. → **F específica, se mantiene.**
2. `public` contiene el dominio **académico/administrativo** (matrícula, cursos, pensum, notas, promoción, nómina, observador) — es la **fuente de verdad académica** (más volumen, más constraints/FKs, más catálogos completos).
3. Las entidades **personas** (institución, docente, estudiante, acudiente) están **duplicadas estructuralmente** con datos **disjuntos**; hay que unificarlas en una sola estructura canónica con mapeo por identificación.
4. Los **catálogos** (año, jornada, tipo documento, etnia, grupo sanguíneo, discapacidad) están duplicados; `public` es generalmente más completo.

---

## Fase 3 — Comparación `engine` vs `logic` (IAM)

| Entidad | `engine` (Escuelapp) | `logic` (SAE) | Clase | Nota |
|---|---|---|---|---|
| Usuario | `aeusu` (34 691) | `tabusua` (2 090) | **B** | Solo 37 coinciden por nick → sistemas casi disjuntos |
| Rol | `aeroll` (6) | `tabroll` (8) | **B** | Modelos distintos |
| Usuario×Rol×contexto | `aeusuroll` (usuario×rol×institución×año×referencia) | `tabunio` (usuario×académico) | **C/B** | `aeusuroll` es más rico |
| Menú | `aemenu` (23) | `tabmenu` (14) | **B** | Ambos definen menús |
| Opción de menú | `aeopcmenu` | `tabopcimenu` | **B** | — |
| Privilegio rol | `aerollopc` | `tabrollopci` | **B** | — |
| Privilegio usuario | `aeusuopc` | `tabusuaopci` | **B** | — |
| Reset password | `aeusuresetpass` | — | **F** | Exclusivo de Escuelapp |
| Sesiones | (tokens en `aeusu.aeusu_token`, `contact.emisor.token`) | — | **F** | No hay tabla de sesión explícita |

### Modelo de identidad actual

| Aspecto | `engine` | `logic` |
|---|---|---|
| Fuente de verdad login activo | ❌ (legacy Escuelapp) | ✅ (lo usa el login actual) |
| Cantidad de usuarios | 34 691 (estudiantes/acudientes/docentes) | 2 090 (administrativos SAE) |
| Roles | 201 admin académico · 202 docente · 203 estudiante · 204 administrador · 205 superadmin · 206 acudiente · 207 coordinador · 208 secretaria | 0 administrador · 1 estudiante · 2 docente · 3 institución · 4 acudiente · 5 demo · 6 coordinador · 7 secretaria |
| Contraseña | `aeusu_llave` en texto/base64 | `cusuallave` (simple/doble base64; el login compara contra ambas + plano) |
| Compatibilidad de IDs | **No** (IDs independientes) | |
| Enlace con académico | `aeusuroll.aeacad_referencia` + `aeinst_id` + `aeanol_id` | `tabunio.cusuaid ↔ cacadid` |
| Menús en uso | ❌ (legacy) | ✅ (el login lee `logic.tabmenu`/`tabopcimenu`/`tabrollopci`/`tabusuaopci`) |

### Conclusiones de Fase 3

1. **`logic` es la fuente de verdad IAM del login activo** (usuario, rol, menús, opciones y privilegios por rol/usuario); `engine` queda como legacy Escuelapp.
2. `logic.tabroll` aporta los roles administrativos SAE (institución, coordinador, secretaria) y `engine.aeroll` (201–208) conserva la equivalencia para el resto de la app.
3. Los dos modelos de usuario son **disjuntos**; la consolidación debe unificar a un único modelo de identidad manteniendo el mapeo de IDs.
4. Riesgo alto: `cusuallave`/`aeusu_llave` en base64 (no hash); al unificar conviene migrar a hash (bcrypt).

---

## Fase 4 — Entidades canónicas propuestas

> Solo propuesta (no ejecutada). El schema destino se define en Fase 5.

| # | Dominio | Origen `data`/`engine` | Origen `public`/`logic` | Propuesta canónica | Justificación |
|---|---|---|---|---|---|
| 1 | Institución | `data.aeinstituciones` | `public.tabinst` | **`public.tabinst`** (ampliada) | `tabinst` tiene más registros, DANE, sedes y FKs; se agregan columnas Escuelapp (escudo URL, redes sociales, coordenadas) |
| 2 | Docente | `data.aedocentes` | `public.tabdoce` | **`public.tabdoce`** (ampliada) | `tabdoce` tiene nómina (`tabinstdoce`) y firma; se agregan campos de agenda (perfil/títulos) |
| 3 | Estudiante | `data.aeestudiantes` | `public.tabestu` | **`public.tabestu`** | `tabestu` más completa + ligada a `tabmatr` |
| 4 | Acudiente | `data.aeacudientes` | `public.tabestuacud` | **`public.tabestuacud`** | Ligada a matrícula SAE |
| 5 | Año lectivo | `data.aeano` | `public.tabanol` | **`public.tabanol`** | Equivalentes; `tabanol` ya ligado a `anolperi` |
| 6 | Grado | `data.aegrados` | `public.tabgrad` | **`public.tabgrad`** | Más completa |
| 7 | Jornada | `data.aejornada` | `public.tabjorn` | **`public.tabjorn`** | Equivalentes |
| 8 | Estado | `data.aeestados` | `public.tabestagene` | **`public.tabestagene`** | Es el estándar SAE (8=Activo) |
| 9 | Tipo documento | `data.aetipodocumento` | `public.tabtipodocu` | **`public.tabtipodocu`** | Más completa |
| 10 | Etnia / otros catálogos | `data.aeetnias`, `aegruposanguineo`, `aediscapacidades` | `public.tabetni`, `tabtiposang`, `tabdisc` | **`public.*`** | Catálogos MEN más completos |
| 11 | Usuario (IAM) | `engine.aeusu` | `logic.tabusua` | **`logic.tabusua`** | Es el login activo SAE (2 090 usuarios administrativos); pendiente unificar las 34 691 cuentas `engine.aeusu` |
| 12 | Rol (IAM) | `engine.aeroll` | `logic.tabroll` | **`logic.tabroll`** | Roles SAE 0–7; `aeroll` (201–208) queda como equivalencia |
| 13 | Usuario×Rol×contexto | `engine.aeusuroll` | `public.tabunio` | **`public.tabunio`** | Vincula login ↔ académico (usado por el login) |
| 14 | Menú / Opción / Privilegio | `engine.aemenu/aeopcmenu/aerollopc/aeusuopc` | `logic.tabmenu/tabopcimenu/tabrollopci/tabusuaopci` | **`logic.*`** | Es lo que lee el login/frontend actual |
| 15 | Asistencia | `data.aeasistencias` | `public.tabnove`+`tabtiponove` | **`data.aeasistencias`** (agenda) + **`public.tabnove`** (novedades SAE) → mantener separadas | Dominios distintos (asistencia diaria vs novedades) |
| 16 | Notas | `data.aenotas` (matview) | `public.tabnota`+`tabnotadef`+`tabprom*` | **`public.tabnota`** (fuente de verdad de calificación) | SAE es el sistema de notas real |

---

## Fase 5 — Arquitectura objetivo

### Alternativa A — Consolidar en schemas existentes

- `data` + `public` → **`public`** (dominio académico + persona + catálogos).
- `engine` + `logic` → **`engine`** (IAM: usuarios, roles, menús, privilegios, sesiones).
- `contact` (WhatsApp) y `data` (agenda/comunicación) se mantienen en `data`/`contact`.

**Ventajas:** mínimo impacto en código existente (el frontend ya lee `engine` y `public`); migración gradual; los FKs ya apuntan a `public`.
**Desventajas:** los nombres `data`/`engine` son poco descriptivos; conviven restos legacy.

### Alternativa B — Crear dominios canónicos nuevos

- `academic` (instituciones, personas, matrícula, notas, cursos, pensum, observador).
- `iam` (usuarios, roles, menús, privilegios, sesiones).
- `agenda` (avisos, asistencias, tareas, evaluaciones, excusas, PQRS, notificaciones).
- `whatsapp` (emisores, plantillas).

**Ventajas:** arquitectura limpia y cohesiva para Node+React; separación clara de responsabilidades.
**Desventajas:** **alto impacto** en TODO el código (PHP legacy + Node + React); requiere reescribir todas las consultas; migración no gradual; mayor riesgo.

### Recomendación

**Alternativa A** con refinamiento:
1. **IAM canónico = `engine`** (ya es el login activo). `logic` se retira tras migrar usuarios/roles/privilegios.
2. **Académico canónico = `public`** (ya tiene FKs y volumen). `data` conserva solo el subdominio **agenda/comunicación** (avisos, asistencias, tareas, evaluaciones, excusas, PQRS, notificaciones) y **`contact`** (WhatsApp).
3. Las entidades **persona/catálogo** duplicadas se consolidan en `public`, y `data` deja de ser fuente para esas entidades (las consultas de agenda apuntan a `public` mediante un mapeo de IDs).
4. Compatibilidad temporal: crear **VIEWS en `data`** (o un schema `compat`) que expongan las tablas canónicas de `public` con los nombres legacy que espera el código PHP, hasta que el PHP sea retirado.

---

## Fase 6 — Plan de migración (sin pérdida de datos)

> Orden propuesto; **nada se ejecutó**.

1. **Respaldo lógico:** `pg_dump -Fc` completo (ver `db_backup.sh`).
2. **Validación de conteos y consistencia:** contar registros por tabla origen, detectar duplicados y huérfanos (queries en Fase 7).
3. **Crear estructura canónica SIN eliminar originales:** añadir columnas a `public.tabinst`, `tabdoce`, `tabestu`, `tabestuacud`; añadir roles a `engine.aeroll`; añadir columnas a `engine.aeusu`.
4. **Copiar datos de prueba** en un schema `staging_consolidacion` (o transacción con rollback) y validar.
5. **Tablas de mapeo de IDs** (los IDs NO son compatibles):
   - `map_institucion (aeinst_id, cinstid)`
   - `map_docente (aedocentes_id, cdoceid)`
   - `map_estudiante (aeestudiantes_id, cestuid)`
   - `map_acudiente (aeacudientes_id, cestuacudid)`
   - `map_usuario (aeusu_id, cusuaid)`
   - `map_rol (aeroll_id, crollid)`
   - Clave de correspondencia: **documento de identificación** (personas), **nick** (usuarios), **nombre/NIT/DANE** (instituciones).
6. **Validar** conteos, PK, duplicados, huérfanos, FKs, NULLs inesperados, conflictos de encoding (acentos), IDs no mapeados.
7. **Compatibilidad temporal:** VIEWS con nombres legacy en `data`/`logic` apuntando a las canónicas.
8. **Cambios PHP:** reemplazar `SELECT ... FROM public.*` por las VIEWS/compat (o directamente las canónicas).
9. **Node.js:** migrar `sql/*.js` y `controllers/*` para que apunten solo a las canónicas (`public` académico + `engine` IAM).
10. **Retiro progresivo:** tras validar, marcar como deprecadas y luego eliminar las tablas legacy (con aprobación explícita).

---

## Fase 7 — Consultas de validación (diseño)

Conjunto de queries automáticas (cada una devuelve `PASS/WARNING/FAIL`):

```sql
-- 1. Conteo antes/después
SELECT 'conteo' , (SELECT count(*) FROM public.tabestu) AS public_est,
                  (SELECT count(*) FROM data.aeestudiantes) AS data_est;

-- 2. Registros sin correspondencia por identificación
SELECT d.aeestudiantes_id
FROM data.aeestudiantes d
LEFT JOIN public.tabestu p ON d.aeestudiantes_identificacion = p.cestuiden
WHERE p.cestuid IS NULL;  -- FAIL si > 0 sin plan de migración

-- 3. Duplicados de identificación
SELECT cestuiden, count(*) FROM public.tabestu GROUP BY cestuiden HAVING count(*) > 1;

-- 4. FK huérfanas (matrícula sin estudiante)
SELECT m.cmatrid FROM public.tabmatr m LEFT JOIN public.tabestu e ON e.cestuid = m.cestuid WHERE e.cestuid IS NULL;

-- 5. Usuarios sin migrar (engine vs logic)
SELECT e.aeusu_id FROM engine.aeusu e
LEFT JOIN logic.tabusua l ON lower(e.aeusu_nick)=lower(l.cusuanick)
WHERE l.cusuaid IS NULL AND e.aeroll_id IN (1,4,201,204,205); -- solo administrativos

-- 6. Roles no mapeados
SELECT * FROM engine.aeroll WHERE aeroll_id NOT IN (SELECT ...);
-- 7. Encoding / acentos
SELECT count(*) FROM public.tabestu WHERE cestunomb ~ '[Ã�]';  -- mojibake
-- 8. NULLs inesperados en columnas NOT NULL de la canónica
-- 9. Credenciales incompatibles (texto plano) -> plan de rehash bcrypt
```

---

## Fase 8 — Mapa de dependencias del código

No hay archivos PHP en este repositorio (el SAE PHP es externo). Referencias encontradas en el código Node (`api/`) y React (`venus/`):

| Área | Schemas/tablas más referenciadas | Riesgo de migración |
|---|---|---|
| Login/auth | `logic.tabusua`, `logic.tabroll`, `public.tabunio` (+ `engine.aeusu` legacy) | **CRÍTICO** (77 refs `aeusu`, 41 `aeusuroll` en agenda) |
| Agenda estudiantes | `data.aeestudiantes`, `data.aeacudientes` | **CRÍTICO** (65 refs) |
| Agenda docentes | `data.aedocentes`, `data.inst_doce` | **CRÍTICO** (43 refs) |
| Agenda asistencias | `data.aeasistencias` | ALTO (31 refs) |
| Agenda asignaciones | `data.aeasignaciones` | ALTO |
| Comunicaciones | `data.aeavisos/aepublicaciones/aecronograma`, `contact.emisor` | MEDIO |
| SAE académico (nuevo) | `public.tabmatr`, `tabestu`, `tabdoce`, `tabcurs`, `tabnota`, `tabcomp` | ALTO (módulos nuevos que ya usan `public`) |
| Menús/privilegios | `logic.tabmenu/tabopcimenu/tabrollopci/tabusuaopci` | ALTO |
| Catálogos | `public.tab*` (grados, jornadas, tipos...) | BAJO |

**Conclusión:** el login/menú actual usa `logic` (IAM SAE); la agenda depende de `data`; los módulos SAE nuevos ya usan `public`. La migración debe preservar `logic` (IAM), `public` (académico) y `data` (agenda) como canónicos para minimizar cambios.

---

## Fase 9 — Decisiones pendientes (requieren aprobación)

1. ¿Confirmar **Alternativa A** (consolidar en `public`+`engine`)?
2. ¿Es aceptable **migrar claves en texto plano a bcrypt** (implica cambiar `AuthController.login`)?
3. ¿Los sistemas sirven **distintos clientes** (datos disjuntos)? → la migración debe **fusionar por identificación** y NO sobrescribir IDs.
4. ¿Se autoriza crear **tablas de mapeo** (`map_*`) y **VIEWS de compatibilidad**?
5. ¿Qué sistema es fuente de verdad para **instituciones** (Escuelapp `aeinstituciones` vs SAE `tabinst`)?

## Cambios prohibidos hasta aprobación

- DROP/TRUNCATE/ALTER de cualquier tabla, columna o schema.
- Eliminar o renombrar FKs, PKs, secuencias.
- Reescribir datos de `data`, `public`, `engine` o `logic`.
- Cambiar el algoritmo de contraseñas sin migración controlada.

---

## Resumen ejecutivo

- La base tiene **dos sistemas coexistentes y mayormente disjuntos**: Escuelapp (`data`/`engine`/`contact`, agenda + IAM activo) y SAE (`public`/`logic`/…, académico legacy PHP).
- **Duplicación estructural** en: personas (institución, docente, estudiante, acudiente), catálogos (año, jornada, grado, tipo documento, etnia, grupo sanguíneo, discapacidad) e IAM (usuario, rol, menú, opción, privilegio).
- **Fuente de verdad propuesta:** `public` (académico + personas + catálogos) y `engine` (IAM). `data` conserva agenda/comunicación; `contact` conserva WhatsApp.
- **Arquitectura recomendada:** Alternativa A (consolidar en schemas existentes) con VIEWS de compatibilidad y tablas de mapeo de IDs.
- **Riesgo principal:** IDs incompatibles y contraseñas en texto plano.
- **Próximo paso:** aprobación de la estrategia para iniciar la Fase 6 (migración) en un entorno de staging.

> **PUNTO DE DETENCIÓN:** No se ejecutó ninguna operación SQL de consolidación.

---

# Resultados de la Consolidación (Alternativa A) — EJECUTADA

> Fecha de ejecución: migración controlada con respaldo. **No se eliminó ninguna tabla/columna/schema.** Las estructuras legacy (`data`, `logic`) siguen intactas.

## Resumen de la migración

| Entidad | Origen | Destino canónico | Resultado |
|---|---|---|---|
| Usuarios IAM | `logic.tabusua` (2 090) | `engine.aeusu` (36 739) | +2 048 nuevos (2 090 mapeados) |
| Roles IAM | `logic.tabroll` (8) | `engine.aeroll` (8) | +2 roles: 207 Coordinador, 208 Secretaria |
| Instituciones | `data.aeinstituciones` (39) | `public.tabinst` (98) | +39 nuevas, columnas Escuelapp añadidas a tabinst |
| Docentes | `data.aedocentes` (1 559) | `public.tabdoce` (2 485) | +1 472 nuevos (1 559 mapeados) |
| Estudiantes | `data.aeestudiantes` (22 608) | `public.tabestu` (49 901) | +22 109 nuevos (22 608 mapeados) |

**Validación:** 0 registros huérfanos en las tablas de mapeo; 0 FK inválidas; `cestugene` y `ctipodocuid` válidos.

## Tablas de mapeo de IDs (schema `migracion`)

- `map_rol (crollid → aeroll_id)`
- `map_usuario (cusuaid → aeusu_id)`
- `map_institucion (aeinst_id → cinstid)`
- `map_docente (aedocentes_id → cdoceid)`
- `map_estudiante (aeestudiantes_id → cestuid)`

## Decisiones tomadas (requieren revisión)

1. **Prioridad SAE:** los registros que coinciden por identificación (docentes 30, estudiantes 284) se mapearon al registro SAE existente (no se duplicaron). Las instituciones no coinciden por NIT (0), todas se insertaron como nuevas.
2. **Contraseñas:** `logic.tabusua.cusuallave` está en base64 (doble o simple). Se desencriptó a texto plano para `engine.aeusu.aeusu_llave` (mismo esquema actual de engine). **Pendiente:** migrar a bcrypt.
3. **IDs largos / duplicados:** identificaciones > límite de columna se reemplazaron por IDs sintéticos (`ESC-<id>`, `MIG-<id>`) para respetar UNIQUE/varchar. Duplicados internos de identificación se deduplicaron.
4. **`ctipodocuid`** de estudiantes migrados = `2` (Tarjeta de Identidad) por defecto.
5. **`cestugene`**: `f/F/1→1`, `m/M/2→2`; valores basura (~1 300) → `1` (por defecto). Pendiente de limpieza.
6. **`cestuesta`**: `aeestados` 1→8 (Activo), 0→2 (Eliminado), resto→8.

## PENDIENTE (no ejecutado)

1. **Acudientes** (`data.aeacudientes` → `public.tabestuacud`): requiere reconstruir matrículas (`tabmatr.cmatrid`), lo que exige decidir el mapeo `grupo → curso`. Diferido.
2. **Enlace `aeusuroll` masivo**: se creó para **95 usuarios institucionales migrados** (roles 201/204/207/208) con `aeinst_id=2`, `aeanol_id=15` como prueba (login OK vía HTTP). El enlace **masivo** para todas las instituciones queda pendiente del onboarding SAE→Escuelapp (`migracion.map_institucion`).
3. **Menús/privilegios `logic`** → `engine`: los roles 207/208 ya tienen privilegios (copiados del 201); el resto de usuarios migrados aún no los tiene asignados.
4. **Compat VIEWS** para código PHP legacy (no hay PHP en este repo; el consumidor activo es Node).
5. **Retiro progresivo** de tablas legacy: NO antes de validar en staging.
6. **Código electoral legacy eliminado** (2026-08-16): los módulos `sql/generalData.js`, `sql/votantessql.js` y derivados fueron retirados del código (ver `.agents/api.md`). Los schemas `temporal` y `varios` **se conservan** (parte de SAE; se revisarán cuando se disponga del código PHP).

## Rollback

- Respaldo: `/tmp/opencode/backup/bdsae2_backup_<timestamp>.dump`.
- Las tablas legacy permanecen intactas; los registros migrados son **aditivos** (se pueden identificar por `map_*` y por IDs nuevos).
