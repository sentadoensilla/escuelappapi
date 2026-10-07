# Mapa y Plan de Refactorización — SAE (PHP) → Escuelapp (NodeJS + React)

> Documento de trabajo para la migración del sistema SAE. Cruza cada módulo PHP (`sae-php.md`) con su destino en la API Node (`api.md`), el frontend (`frontend.md`) y el modelo de datos (`database.md`). Marca lo **ya implementado** y lo **pendiente**, con el orden de ejecución sugerido.

---

## 1. Principio general

Cada módulo PHP (`stub → factory/control.*.php → view`) se traduce a:

| Capa PHP | Capa Node/React |
|---|---|
| stub raíz `x.php` | ruta frontend `/gestion/<entidad>` + registro en `logic.tabmenu/tabopcimenu/tabrollopci` |
| `factory/control.x.php` | `api/controllers/<modulo>/<modulo>Controller.js` (+ `.routes.js` + `.sql.js`) |
| `view/x.php` | `venus/src/pages/<modulo>/*` (o CRUD genérico en `pages/gestion/*` + `crudConfig.js`) |
| `factory/taks/*/listener.php` | endpoints `GET/POST /sae/:recurso/...` |
| `accionador.php` (mutaciones) | endpoints `POST/PUT /sae/...` |
| `$_POST['do']` = `registrar/editar/eliminar` | `POST /registrar`, `PUT /actualizar`, `DELETE lógico /borrar` |
| `$obj->myid()` / `MAX(id)+1` | `COALESCE(MAX(id)+1,1)` en SQL |
| `$obj->encriptar/decriptar` | `utils/token.encriptar/decriptar` + `tool.encriptar()` (front) |
| `$_SESSION['sae...']` | JWT (`token.createtoken`) + `tool.setUser/getUser` (localStorage) |
| `createmenuprincipal()` + `get_keys()` | SQL de login `privilegees` (`sql/authsql.js`) + `head.js` |

---

## 2. Estado actual del lado SAE en la API (feb-ago 2026)

### 2.1 Implementado (patrón moderno `controllers/<modulo>/`, montado en `routes/index.js`)

| Módulo | Rutas | Tablas | Cubre los .php: |
|---|---|---|---|
| `catalogos/` | `/catalogos/:tabla/*` | ~33 catálogos `public.tab*` | grados, jornadas, sexos, parentescos, tipos documento/novedad/nota/desempeño/vinculación/sangre/subsidio, cargos, estados curso/grado/generales, estratos, sisben, zonas, etnias, resguardos, discapacidades, capacidades, conflictos, fuentes recursos, carácter, especialidades, métodos, escalas, empresas, ICBF, departamentos, ciudades |
| `configuracion/` | `/configuracion/*` | `tabesca`, `tabsie`, `tabcerti`, `tabcons`, `tabpazsalv`, `tabfirm` | `control.espeinst`, certificados/constancias/paz-salvo/firmas |
| `institucion/` | `/institucion/*` | `tabinst`, `tabinstsede` | `control.institu.php`, `institucioncambio`, `configuracion_institucion` (parcial) |
| `anolperiodo/` | `/sae/anol*` | `tabanol`, `tabperi`, `anolperi`, `tabperival` | `control.anolec*.php`, `promperiodos` |
| `cursos/` | `/sae/cursos*` | `tabcurs` | `control.cursos.php` |
| `pensum/` | `/sae/*` | `tabarea`, `tabasig`, `instarea`, `tabcontprog`, `asigcurscontprog`, `tabareaconf` | `control.areas`, `asignaturas`, `temas`, `asigareas` |
| `docentes/` | `/sae/docentes*` | `tabdoce`, `tabinstdoce`, `asigcurs` | `control.docente*.php`, `tabdoce` |
| `estudiantes/` | `/sae/estudiantes*` | `tabestu`, `tabmatr`, `tabestuacud`, `tabestuotrodato`, `tabestusociecon`, `tabmatrpago` | `control.matricula*.php`, `cambiodecurso`, `promover` |
| `indicadores/` | `/sae/*` | `tabcomp`, `asigcurscomp` | `control.indicadores*.php` |
| `notas/` | `/sae/*` | `tabnota`, `tabcompestu`, `tabnotadef`, `tabpromdef`, `tabpromasig`, `tabpromo` | `control.calificar*.php`, `notasestudiantes`, `listascal*`, `resumen*`, `prom*` (parcial) |
| `observador/` | `/sae/*` | `observador.*` | `control.observaciones`, `observaestu`, `observadorestu` |
| `usuariossae/` | `/sae/*` | `logic.*`, `public.tabunio` | `control.usuario.php`, `menu.php`, `permisos.php`, `privilegios.php`, `docentesusuarios` |
| `preescolar/` | `/preescolar/*` | `preescolar.tabpreambi`, `tabpredime`, `tabpreasig`, `tabprenota`, `tabprenove` | `control.asignacionespre`, `boletinespre`, `listaspre`, `listascalpre` (parcial) |
| `estadisticassae/` | `/estadisticassae/*` | lectura matrícula/sexo/etnia/grado | `generador.php`, `estadisticas2` |
| `integration/` | `/integration/*` | identity, eventos, enlaces HMAC | nuevo (puente SAE→Escuelapp→padre) |

### 2.2 Pendiente / incompleto

| Área | .php origen | Falta en API |
|---|---|---|
| **Boletines** | `control.boletines*.php`, `generarboletin.php`, `core/pdfmaker/` | formato/endpoint de export (PDF/Excel) y reportes oficiales (`reportesoficiales.php`, `exporter.php`) |
| **Certificados/constancias/reconocimientos** | `control.certificados.php`, `constancias.php`, `reconoinst.php`, `formpiepagbole.php`, `core/pdfmaker/` | generar documento con datos de `tabcerti/tabcons/tabpazsalv/tabfirm` |
| **Asistencias SAE (pensum)** | `control.inasistencias*.php`, `faltasestudiantes.php`, `estadomatricula.php` | complemento de agenda con pensum (`tabnove`, `anolperi`) |
| **Promedios/ranking completos** | `control.promedioestudiantes.php`, `ObrenerPuestos()` (tablas `temporal.*`), `promociones` | lógica de ranking/puestos y promoción completa (`tabpromo`) |
| **Menú/opciones SAE en BD** | `control.menu.php`, `menulst.php`, `menuopcion.php` | ✅ migrado: el login lee `logic.tabmenu/tabopcimenu/tabrollopci/tabusuaopci`; CRUD en `usuariossae/` y `controllers/menu/` |
| **Avisos institucionales** | `control.avisos.php` | `tabavis`, `tabavisroll`, `tabavisusua` |
| **Cambio de curso / estado matrícula** | `control.cambiodecurso.php`, `estadomatricula.php`, `matriculacambiar.php` | completar flujos transaccionales de matrícula |
| **Cargas masivas** | `control.cargasmasivas.php`, `factory/masivo/*` | importadores CSV/Excel (parcial: `DocenteMasivo`) |
| **Configuración completa de institución** | `control.configuracion_institucion.php`, `confi_inst_secre.php`, `configure_inst.php` | `tabconfig`, `tabconfigvar`, `tabinstreso` |
| **Gráficos/Gantt/calendario docente** | `control.granttuser.php`, `graficador.php` | `echarts`/scheduler (`calendar.scheduleevents`) |
| **Ayuda/tutoriales** | `archivos/manuales/` (11 PDF) | página de ayuda + repositorio de manuales |

---

## 3. Plan por fases (orden de ejecución sugerido)

### Fase 0 — Preparación (recomendado antes de tocar código)
- [ ] Confirmar que `.agents/database.md` documenta todas las tablas de los módulos a migrar (esquemas `public`, `logic`, `observador`, `preescolar`, `temporal`, `varios`, `estadistica`, `integration`).
- [ ] Revisar `alter_table_change_all_structures.sql` del repo para detectar renombres de columnas (el PHP usa nombres antiguos).
- [ ] Verificar mapeo `data.aeinst_id ↔ public.tabinst.cinstid` (vía `integration.tabenla` o `data.aematriculas_*`) para precargar institución del usuario (deuda técnica de `frontend.md` §11).

### Fase 1 — Catálogos y configuración (CRUD genérico)
1. Completar catálogos faltantes en `controllers/catalogos/` (ver brecha en `api.md` §13.1 lista de 33+).
2. Completar `configuracion/`: `tabconfig`, `tabconfigvar`, `tabinstreso`, ponderaciones `tabareaconf`/`sie`.
3. Registrar menú/opciones en `logic.tabmenu`/`tabopcimenu` + `tabrollopci` (script `api/scripts/sync_logic_menu.js` como referencia).

### Fase 2 — Núcleo académico
1. Cursos (`tabcurs`) — ya listo.
2. Pensum: áreas, asignaturas, intensidad horaria (`tabarea`, `tabasig`, `instarea`, `tabcontprog`, `asigcurscontprog`, `tabareaconf`) — ya listo, validar reglas de calificación por institución.
3. Docentes (`tabdoce`, `tabinstdoce`) + contrataciones/cargos — ya listo.
4. Asignación académica (`asigcurs`) — completar asignaciones por docente/curso/área.
5. Seguimiento de cursos y temas (`tabcontprog`).

### Fase 3 — Estudiantes y matrícula
1. Estudiantes + acudientes + otros datos + socioeconómicos (`tabestu`, `tabestuacud`, `tabestuotrodato`, `tabestusociecon`) — ya listo.
2. Matrícula (`tabmatr`, `tabmatrpago`, `tabestacurs`) + flujos transaccionales: cambio de curso, retiro, estado (`cambiodecurso`, `estadomatricula`, `matriculacambiar`).
3. Cargas masivas de matrícula/estudiantes.

### Fase 4 — Evaluación
1. Notas (`tabnota`, `tabcompestu`, `tabnotadef`) — ya listo.
2. Promedios/definitivas (`tabpromdef`, `tabpromasig`, `tabpromo`) — completar ranking/puestos y lógica de `ObrenerPuestos()` (equivalente en SQL Node).
3. Indicadores de desempeño (`tabcomp`, `asigcurscomp`, `tablogcomp`) — ya listo.
4. Promoción masiva — ya listo (`/sae/promover`), validar con `tabpromo`.

### Fase 5 — Observador y asistencia
1. Observador (`observador.tabobsplan`, `tabresp`, `tabrespsub`, `tabrespobs`, `tabrespeval`) — ya listo.
2. Asistencias SAE (`tabnove` con `anolperi`) + faltas de estudiantes.

### Fase 6 — Usuarios/roles SAE y avisos
1. Usuarios/roles/menús/privilegios (`logic.*`) — ya listo (el login lee `logic.tabmenu`/`tabopcimenu` + `logic.tabrollopci`/`tabusuaopci`; **no** se importa a `engine.*`).
2. Avisos institucionales (`tabavis`, `tabavisroll`, `tabavisusua`).

### Fase 7 — Reportes, exportables y preescolar
1. Boletines, certificados, constancias (PDF/Excel con formato) — **pendiente definir formato**.
2. Estadísticas SAE — ya listo (parcial).
3. Preescolar — ya listo (parcial; completar boletines preescolar).
4. Ayuda (manuales).

---

## 4. Convenciones a respetar en la migración (checklist por CRUD)

- [ ] `controllers/<modulo>/<modulo>.sql.js` con INSERT/UPDATE/SELECT/DELETE-lógico (PK `COALESCE(MAX(id)+1,1)`).
- [ ] `controllers/<modulo>/<modulo>Controller.js` con `registrar/editar/borrar/listar`.
- [ ] `controllers/<modulo>/<modulo>.routes.js` con `Auth.isAuth` + guarda de rol (mapeo `logic.tabroll` 0-7 ↔ `engine.aeroll` 201-206, ver `database.md` §5.3/5.4).
- [ ] Registrar router en `routes/index.js`.
- [ ] `idregistro` ENCRIPTADO en listados; FKs CRUDAS; `decriptar()` FKs en `registrar/actualizar` (`parseInt(token.decriptar(...))`).
- [ ] Respuesta `{status, statusCode, message, rows}`.
- [ ] Añadir entrada en `venus/src/main/crudConfig.js` (columns + fields) y, si aplica, página dedicada en `pages/<modulo>/`.
- [ ] Registrar menú/opción en `logic.tabmenu`/`tabopcimenu` + `tabrollopci` con enlace `gestion/<entidad>` y `copcimenuicon` Font Awesome.
- [ ] Verificación: `node --check` en API, `@babel/parser` en frontend, `require('./routes/index')`.

---

## 5. Riesgos y decisiones de diseño

| Riesgo / decisión | Mitigación |
|---|---|
| **IDs históricos** (notas `tabnota2013..2016`, copias `aeinstituciones_`, `aeestudiantes_old`, ...) | nunca reutilizar IDs; respetar `MAX(id)+1` por tabla; ver `api.md` §11 |
| **Tipos inconsistentes de PK** (`double precision` vs `bigint`) | respetar tipo de columna al generar IDs |
| **Secuencias compartidas** (`data.secuence_*`, `public.tabla_id_seq`, `public.tabnota_cnotaid_seq`) | verificar `SELECT` cuál corresponde antes de insertar |
| **Sin FKs físicas** en `data`/`engine` | integridad por lógica de app; ver `api.md` §11.1 |
| **Borrado lógico**: PHP usa `8/9/2/4/13/16/17` | mantener lectura compatible; en escritura usar convención `9/0` y estados propios de matrícula/promoción |
| **Doble base64 heredado** | mantener compatibilidad con datos existentes (`cusuallave`, IDs) — `token.encriptar/decriptar` ya implementado |
| **Conexión por consulta en PHP** | pool `pg` (max 50) en `utils/datasource.js`; `Db.query({text, values})` parametrizado |
| **Credenciales en `atom.php`** | usar `.env` (`PG_*`), nunca en código |
| **Inyección SQL heredada** | parámetros `$1..$n` siempre; nunca concatenar entradas |
| **`archivos.php` es un ZIP** | no intentar parsearlo como código |
| **`latin/`, `versiones/`, `dbbackup/`, `sorteo/comfenalco/valores/tareas`** | fuera de alcance de la migración |
| **JWT expira a los 2 min** | revisar duración al integrar login definitivo (`api.md` §6.1) |
| **Institución del usuario**: sesión solo conoce `aeinst_id` | mapear `aeinst_id ↔ cinstid` vía `integration.tabenla` (Fase 0) |
| **Roles duplicados SAE/Escuelapp** | guardas que aceptan ambos rangos (0-7 y 201-206) — ya implementado en `jwtoken.js` |

---

## 6. Dependencias entre módulos (grafo simplificado)

```
catálogos (tabgrad, tabjorn, tabcarg, ...)
   └─ configuración (tabanol, tabperi, tabesca, tabcerti ...)
        └─ cursos (tabcurs) ──┐
        └─ pensum (tabarea, tabasig, asigcurs, tabcontprog) ──┤
             └─ docentes (tabdoce, tabinstdoce) ──────────────┤── asigcurs (asignación)
                  └─ indicadores (tabcomp, asigcurscomp) ─────┤
                       └─ estudiantes/matrícula (tabestu, tabmatr) ──┐
                            └─ notas/evaluación (tabnota, tabcompestu, tabprom*) 
                                 └─ reportes (boletines, certificados, estadísticas)
observador.* / tabnove ── asistencias
logic.* ── usuarios, roles, menús, avisos
```

---

## 7. Seguimiento

| Fase | Estado | Notas |
|---|---|---|
| 0 Preparación | ⏳ pendiente | mapeo `aeinst_id ↔ cinstid` |
| 1 Catálogos/configuración | ✅ mayormente | completar `tabconfig`, `tabconfigvar`, `tabinstreso` |
| 2 Núcleo académico | ✅ mayormente | completar asignación (`asigcurs`) |
| 3 Estudiantes/matrícula | ✅ mayormente | completar flujos transaccionales |
| 4 Evaluación | 🟡 parcial | ranking/puestos y promedio completos |
| 5 Observador/asistencia | 🟡 parcial | asistencias SAE con pensum |
| 6 Usuarios/roles/avisos | ✅ mayormente | avisos (`tabavis*`) pendiente |
| 7 Reportes/preescolar/ayuda | 🟡 parcial | boletines/certificados PDF pendiente |

> Actualizar este archivo y los `.md` de `.agents/` al terminar cada fase.
