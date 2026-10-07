# SAE (PHP) — Contexto y Estructura del Sistema Fuente

> Documento de referencia para la refactorización a NodeJS. Describe cómo está construido el **SAE** original en PHP (el sistema que se está migrando a Escuelapp/Node), su arquitectura, convenciones y el inventario de módulos. El modelo de datos completo está en `database.md`; el destino Node/React en `api.md` y `frontend.md`; el plan de migración en `sae-refactor-mapa.md`.

---

## 1. Contexto

- **Ruta fuente:** `/Users/sentadoensilla/side projects/sae`
- **Stack:** PHP procedural (sin framework), PostgreSQL (solo `pg_*`), jQuery 1.x, HTML server-side, PHPMailer/mPDF para correo/PDF.
- **Proyecto destino:** Escuelapp (Node.js + Express + React), ver `AGENTS.md`.
- **IMPORTANTE:** los nombres `public`, `logic`, `observador`, `preescolar`, `estadistica`, `integration`, `temporal`, `varios` **NO son carpetas** — son **esquemas PostgreSQL** de `bdsae2`/`adminit4_saeaaa`. La estructura de archivos es el trío MVC `core/` + `factory/` + `view/`.

## 2. Layout de primer nivel

| Ruta | Rol |
|---|---|
| `core/` | Framework PHP: `esencial.php` (clase `core`, 121 KB, ~85 métodos), `ses/` (sesión/login), `vendor/` (mPDF), `pdfmaker/`, `sheetmaker/` (Excel), `mail/`, `phpmailer5.1/`, `plus.php` (Oracle, abandonado), `clase.php` (MySQL, abandonado) |
| `factory/` | **Lógica/modelo**: 152 `control.*.php` + `taks/` (endpoints AJAX: `listener.php`, `quickbox.php`, ...) + `masivo/` (importadores CSV) |
| `view/` | **Vistas**: 155 plantillas `*.php` HTML |
| `engine/` | **JS cliente**: `main.js` (AJAX core), `dtx.js` (delegación de eventos/CRUD), `dtf.js`, `graficador.js`, jQuery + jQuery-UI |
| `look/` | **CSS/tema**: `styles.css`, `tipografia.css`, `trama.css`, `menuinicial.css`, `index_login/`, `icons/`, `images/` |
| `archivos/` | Uploads: `docentes/`, `estudiantes/`, `instituciones/`, `manuales/` (11 PDF), `masivo/` |
| `webmap/` | Mapa de instituciones: `mapInfo.php`, `control.mapinfo.php`, `control_territorios.php`, `graficador.php` |
| `dbbackup/`, `versiones/`, `tmp/`, `cgi-bin/`, `bat y sh/` | Backups/staging/legado (irrelevante para la migración) |
| `latin/` | Copia de WordPress (externa, ignorar) |

Raíz: ~175 `.php` (la mayoría stubs de 4 líneas) + archivos de infraestructura (`atom.php`, `accionador.php`, `generador.php`, `validacion.php`, `esencial.php` — copia vieja del core, `enviaremail.php`, `recuperarcontra.php`, `docentesusuarios.php`).

> ⚠️ `archivos.php` (3.6 MB) es un **archivo ZIP** con extensión `.php`, no código.

## 3. Arquitectura y flujo de una solicitud

Patrón server-side MVC de 3 capas estrictas, 1:1:1 por módulo:

```
GET /cursos.php                      (stub raíz)
  └── include_once("view/cursos.php")              ← VISTA
        └── include_once("factory/control.cursos.php")  ← LÓGICA
              ├── include_once("atom.php")               (constantes)
              ├── include_once("core/esencial.php")      (clase core)
              ├── include_once("core/ses/check.php")     (guardia de sesión)
              └── $obj = new core(...) → SQL + fragmentos HTML
```

El `control.*.php` construye **variables HTML** (`$lasede`, `$elañolectivo`, `$elgrado`, `$director`, `$coordinador`, `$bandera`, `$respuesta`, `$menu`, `$identidadInstitucion`) y la vista las imprime con `echo`.

### 3.1 Flujo de interacción (AJAX)

1. **Página completa:** `x.php` → `view/x.php` → `factory/control.x.php` (render server-side).
2. **Mutaciones:** `engine/main.js`/`dtx.js` → `accionador.php` (POST `accion=...`): `guardaCalificacion`, `guardaFirmas`, `guardaObserGeneral`, `createComboBox`, `cambiaestadousu`, `eliminarNotasMasivas*`, etc.
3. **Listados/tablas:** `factory/taks/{escuelas|profesores|coordinadores}/listener.php` (POST `tipo` + `ui` + `srclist`), devuelve HTML de tabla. `tipo` = `cursosinstitucion`, `areasdemiescuela`, `asignaturasdemiescuela`, `avisogrupal`, etc.
4. **Validación:** `validacion.php` (POST `tp`).
5. **Estadísticas:** `generador.php` (POST `accion=mostraresta`).
6. **Correo:** `enviaremail.php` (recuperación de clave), `recuperarcontra.php` (docente).
7. **Reportes:** `factory/taks/escuelas/reportesoficiales.php`, `listenercal.php`, `exporter.php`, `constancia.php`.

Cada `factory/control.*.php` se estructura igual:

1. Incluye `atom.php`, `core/esencial.php`, `core/ses/check.php`; crea `$obj = new core(...)` y `$obj->HistorialVisitas()`.
2. Descifra contexto: `$idinstitucion = $obj->decriptar($_SESSION['saeusuario'])`, `$idanolectivo = $obj->decriptar($_SESSION['saeanolectivo'])`.
3. `switch($obj->decriptar($_POST['do']))` → `registrar` / `editar` / `eliminar` (campo oculto cifrado).
4. `switch($obj->decriptar($_POST['tipo']))` → carga masiva con `$_FILES`.
5. `$_GET['obj']` (id cifrado) → modo edición + `SELECT` del registro.
6. Construye selects HTML con valores de opción cifrados (`encriptar(id)`).
7. Monta `$bandera` (hidden: `do`, `obj`, `getlist`, `srclist`, `filter`, `choice`, `prev`, `drop`, `target`) y `$respuesta` (modal de confirmación).

## 4. `core/esencial.php` — la clase `core` (a desmontar en Node)

Métodos clave que la API Node ya replica o debe replicar:

| Grupo | Métodos | Equivalente Node |
|---|---|---|
| BD | `__construct(usuario,clave,host,base,puerto)`, `post_conectar()` (`pg_connect`), `post_ejecutar($sql)` — **conexión por consulta** | `database/conex.js` (`pg` Client) con pool |
| IDs | `myid($tabla,$id)` = `SELECT MAX(id)+1` | patrón `COALESCE(MAX(id)+1,1)` (AGENTS.md) |
| Cifrado | `encriptar()` / `decriptar()` (doble base64) | `utils/token.encriptar/decriptar` |
| Menú | `createmenuprincipal($mysite)` (arma nav desde `logic.tabmenu`+`tabopcimenu` filtrado por `$_SESSION['saekeys']`) | login `privilegees` (JWT nav) + `logic.tabmenu/tabopcimenu` |
| Acceso | `centinela($keys,"archivo.php",$mysite)` (permiso + log en `integration.tabregiacti`) | `middlware/jwtoken.js` guardas |
| Auditoría | `HistorialVisitas()` → `estadistica.tabhistvis` | `utils/token.logsteps` |
| Notas | `GuardaPromedioAsignatura()`, `TablaResumenPromedios()`, `IdicadoresPromedios()`, `getDesempeno()*`, `juicioValoracion()`, `DecimalesInst()`, `notaminima()`, `formatoDecimal()`, `ValidaDivision()`, `ObrenerPuestos()` (ranking con tablas `temporal.*`), `CantidadMaterias()`, `CantidadAsignaciones()` | módulo `notas/` + `estadisticassae/` |
| Tiempo | `ahora()` (America/Bogota) | `moment-timezone` |
| Archivos | `cargar_imagen()`, `cargar_archivo()` → `archivos/*` | `middlware/uploadImages.js` |
| Listas | `Listado()`, `CrearListas()`, `ListarPeriodos()`, `Sedes()`/`ListaSedes()` | selects en `crudConfig.js` |
| Correo | `sendMailHTML()` (`mail()`) | `utils/notifications/mail/*` |

El resto de métodos son constructores de HTML (`createfooter`, `createwellcome`, `vereventos`, `encode`).

## 5. Sesión y autenticación (PHP)

- **Login:** `core/ses/check.php` valida `logic.tabusua.cusuanick` + `cusuallave = encriptar(clave)` (doble base64, NO hash), cruza con `logic.tabroll`, `integration.tabenla` (mapeo de identidad) y `public.tabunio` (unión usuario↔académico).
- **Clave del sistema:** función `get_keys(user_id)` → `saekeys` (ids de opciones de menú permitidas, cifradas), `saeanolectivo`, `saeperiodoactivo` y nombres/fechas.
- **Variables de sesión:** `saeusuario` (institución cifrada), `saenombre`, `saeidentificacion`, `picture`, `saeroll`, `saeraiz`, `saekeys`, `saeanolectivo`, `saeanolectivonomb/inic/fina`, `saeperiodoactivo`, `systemusuario`, `systemnombre`.
- **Logout:** `core/ses/ses.php?log=0` → `session_destroy()`.
- **Redirección tras login:** `$_SESSION['saeraiz']` (home por rol: `index.maestro.php`, `index.secretaria.php`, `index.coordinador.php`, `index.institucion.php`, `index.admon.php`, `index.alumno.php`, `index.acudiente.php`).
- **Guardia:** `centinela()` está **comentada en casi todos los archivos** (acceso real casi sin control).

### 5.1 Roles (esquema `logic`)

- `logic.tabusua` — usuarios (`cusuanick`, `cusuallave` cifrada, `cusuaroll`, `cusuaesta`).
- `logic.tabroll` — roles (`crollpagientr` = home del rol).
- `logic.tabmenu` / `logic.tabopcimenu` — menús y opciones (`copcimenuenla` = ruta React sin `/`, `copcimenuicon` = clase Font Awesome en Escuelapp).
- `public.tabunio` — unión usuario↔académico (`cusuaid` ↔ `cacadid`).
- Mapeo Escuelapp: `engine.aeroll` (201–208) y los roles SAE `logic.tabroll` (0–7) — ver `database.md` §5. El login Node autentica con `logic.tabusua` y arma el menú con `logic.*` (ver `sql/authsql.js`).

## 6. Conexión a BD y convenciones de datos

- **Solo PostgreSQL** (`pg_connect`); una conexión por consulta; SQL por concatenación (superficie de inyección enorme; en Node se usa parámetros `$1..$n`).
- **Credenciales hardcodeadas** en `atom.php` (host `127.0.0.1`, db `adminit4_saeaaa`, user `adminit4_saeroot`, password en doble base64 `S2tobGJIQkVaWE5yTDBZeEtnPT0=` = `*HelpDesk/F1*`, puerto 5432). En Venus se usan `.env` (`PG_*`) — ver `database.md` §1.
- **IDs:** `SELECT MAX(id)+1` por tabla (no secuencias en la mayoría).
- **Prefijo de tablas:** casi todo es `tab*` (excepciones: `asigcurs`, `anolperi`, `tabeval`, `tabevalsub`, `instarea`, `inst_cue`, `ae*` en Escuelapp).
- **Columnas:** `c<abrev><campo>` (ej. `cinstid`, `cestuid`, `cmatrid`, `ccursid`, `cdoceid`, `cnotaid`, `cgradid`, `cusuaid`, `cmenuid`, `copcimenuid`, `crolid`).
- **Esquemas usados** (frecuencia de aparición en `factory/*.php`): `public.` ×1448, `logic.` ×90, `preescolar.` ×68, `temporal.` ×4; además `observador.`, `integration.` (log acceso), `estadistica.` (log visitas), `varios.`.
- **Máquina de estados (borrado lógico):** `8`=activo, `9`=inactivo, `2`=eliminado, `4`=pendiente, `13`=matrícula activa, `16/17`=promovido. El borrado es `UPDATE ... SET cXesta=2/9`, excepto limpiezas puntuales en notas. **Convención Venus:** `9/0` (AGENTS.md).
- **Cifrado de PK/FK en la app:** los IDs viajan cifrados (doble base64) en formularios/URLs; `encriptar(id)` para valores de opción y `decriptar($_POST['...'])` antes del SQL. Convención Venus idéntica (ver `api.md` §6.3).

## 7. Inventario de módulos PHP (mapa fuente)

Relación **stub raíz → `factory/control.*.php` → vista** (patrón 1:1:1). Los `co.*`/`coor.*`/`se.*` son variantes por rol (coordinador/secretaría) del mismo módulo base.

### 7.1 Catálogos (simples)

| Módulo | Factory | Tabla principal |
|---|---|---|
| Grados | `control.grado.php` / `gradolst.php` | `public.tabgrad` |
| Jornadas | `control.jornada.php` / `jornadalst.php` | `public.tabjorn` |
| Años lectivos | `control.anolec.php` / `anolecinst.php` / `anoleclst.php` | `public.tabanol` |
| Áreas | `control.areas.php` / `areasedit.php` | `public.tabarea` |
| Asignaturas | `control.asignatura*.php` / `control.asigareas.php` | `public.tabasig`, `asigcurs`, `tabarea` |
| Estados | `control.estados.php` / `estadoslst.php` | `public.tabestagene` |
| Sisben | `control.sisben.php` / `sisbenlst.php` | `public.tabsisb` |
| Tipos de sangre | `control.tiposangre.php` | `public.tabtiposang` |
| Tipos de subsidio | `control.tipsubsidio.php` / `tipsubsidiolst.php` | `public.tabsisb` |
| Zonas de residencia | `control.zonaresi.php` / `zonaresilst.php` | `public.tabzonaresi` |
| Especialidades | `control.espeinst.php` / `espeinstlst.php` | `public.tabespeinst` |
| Métodos institucionales | `control.metoinst.php` / `metoinstlst.php` | `public.tabmetoinst` |
| Instituciones | `control.institu.php` / `institulst.php` / `institucioncambio.php` | `public.tabinst`, `tabinstsede` |
| Territorios | `territorios.php` + `webmap/` | `public.tabzonaresi`/geo |
| Cargos | `control.tabdoce.php` | `public.tabcarg` |
| Permisos/roles | `control.permisos.php` / `privilegios.php` | `logic.tabroll`, `tabopcimenu` |

### 7.2 Núcleo académico

| Módulo | Factory | Tabla principal |
|---|---|---|
| Cursos | `control.cursos.php` | `public.tabcurs` |
| Matrícula | `control.matricula.php` / `matriculaedit.php` / `matriculacambiar.php` / `matriculaactualizar.php` / `matriculamasiva.php` / `matricular.php` / `coor.matricula.php` | `public.tabmatr`, `tabestu`, `tabestuacud` |
| Cambio de curso | `control.cambiodecurso.php` | `public.tabmatr`, `tabestacurs` |
| Docentes | `control.docente.php` / `docentelst.php` / `docentescambio.php` / `docentesdistrito.php` / `co.docente.php` | `public.tabdoce`, `tabinstdoce` |
| Asignación académica | `control.asigareas.php` / `control.eliminarasignacion.php` / `co.asignaciones*.php` | `public.asigcurs` |
| Seguimiento de cursos | `control.seguimientocursos.php` | `public.asigcurs`, `tabcurs` |
| Temas | `control.temas.php` / `temasasignatura.php` | `public.tabcontprog` |
| Asignaciones preescolar | `control.asignacionespre.php` | `preescolar.*` |
| Promoción | `control.promociones*.php` / `promedioestudiantes.php` / `promareas.php` / `promasignaciones.php` / `promcursos.php` / `promperiodos.php` / `prompersonal.php` | `public.tabpromo`, `tabpromdef`, `tabpromasig`, `tabmatr` |

### 7.3 Evaluación

| Módulo | Factory | Tabla principal |
|---|---|---|
| Calificar | `control.calificar*.php` (incl. `disciplina`, `inst`, `noc`) | `public.tabnota`, `tabnotadef`, `tabcompestu`, `tabeval` |
| Notas estudiantes | `control.notasestudiantes.php` | `public.tabnota` |
| Indicadores | `control.indicadores.desempeno.php` / `indicadoresdoce.php` / `indicadoresinst.php` | `public.tabcomp`, `asigcurscomp`, `tablogcomp` |
| Rendimiento por áreas | `control.rendimientoareas.php` | `public.tabnota`, `tabarea` |
| Listas de calificación | `control.listascal*.php`, `control.listas*.php`, `control.promasignaciones.php` | `public.asigcurs`, `tabnota` |
| Boletines | `control.boletines*.php` / `boletinespre*.php` / `generarboletin.php` | `public.tabnota`, `tabmatr` + `core/pdfmaker/` |
| Resumen | `control.resumen*.php` / `resumeninstestu.php` | `public.tabnota`, `tabpromdef` |
| Certificados/constancias | `control.certificados.php` / `constancias.php` / `piepagbole.php` / `reconoinst.php` / `form*` | `public.tabcerti`, `tabcons`, `tabpazsalv`, `tabfirm` |

### 7.4 Observador / asistencia

| Módulo | Factory | Tabla principal |
|---|---|---|
| Observaciones | `control.observaciones.php` / `observaestu.php` / `observadorestu.php` | `public.tabnove` + `observador.tabresp*` |
| Inasistencias | `control.inasistencias*.php` / `faltasestudiantes.php` | `public.tabnove` |
| Estado matrícula | `control.estadomatricula.php` | `public.tabmatr` |

### 7.5 Usuarios / sistema

| Módulo | Factory | Tabla principal |
|---|---|---|
| Usuarios | `control.usuario.php` / `usuariolst.php` / `asociarusuario.php` / `cambioclave.php` / `editperfil.php` | `logic.tabusua`, `public.tabunio` |
| Menús | `control.menu.php` / `menulst.php` / `menuopcion.php` | `logic.tabmenu`, `tabopcimenu` |
| Avisos | `control.avisos.php` | `public.tabavis`, `tabavisroll`, `tabavisusua` |
| Permisos/privilegios | `control.permisos.php` / `privilegios.php` | `logic.tabroll`, `tabrollopci` |
| Configuración institución | `control.configuracion_institucion.php` / `confi_inst_secre.php` / `configure_inst.php` | `public.tabconfig`, `tabconfigvar`, `tabinst` |
| Cargas masivas | `control.cargasmasivas.php` + `factory/masivo/*` | varias `tab*` |

### 7.6 Variantes por rol / especiales

- **Secretaría:** `se.docente.php`, `secretaria.php`, `control.index.secretaria.php`.
- **Coordinador:** `cordinador.php`, `dordinador.php`, `co.*` y `coor.*`.
- **Homes por rol:** `control.index.{admon,alumno,acudiente,coordinador,demo,institucion,maestro,secretaria}.php`.
- **Extras (no-SAÉ, ignorar en migración):** `sorteo.php`, `comfenalco.php`, `valores.php`, `tareas*.php`, `AizenOnline.html`, `atom2.php` (sitio sorteo).

## 8. Endpoints AJAX (listener/taks) — mapa a rutas REST

| Endpoint PHP | Propósito | Equivalente Node |
|---|---|---|
| `accionador.php` | mutaciones atómicas (`guardaCalificacion`, `guardaFirmas`, `createComboBox`, ...) | `POST /sae/notas/*`, `/sae/*` actualizar |
| `factory/taks/escuelas/listener.php` | listados HTML (cursos, áreas, asignaturas, avisos) | `GET /sae/:recurso/listar` |
| `factory/taks/escuelas/listenercal.php` | listas de calificación | `POST /sae/notas/*` |
| `factory/taks/escuelas/constancia.php` | constancias | reportes/export |
| `factory/taks/escuelas/matricula.php` | helpers de matrícula | `POST /sae/estudiantes/*` |
| `factory/taks/escuelas/reportesoficiales.php` | reportes oficiales | `controllers/estadisticassae/` |
| `factory/taks/profesores/exporter.php` | export | `utils/exports/excel.js` |
| `factory/taks/profesores/graficador.php` | gráficos | `echarts-for-react` |
| `generador.php` | estadísticas (`mostraresta`) | `GET /estadisticassae/*` |
| `validacion.php` | validación de campos | validación en `gestionAdd.js` |
| `enviaremail.php` / `recuperarcontra.php` | recuperación de clave | `utils/notifications/mail/resetPassword.js` |
| `docentesusuarios.php` | alta masiva usuarios docentes | `POST /sae/usuarios/*` |

## 9. Hallazgos para la migración (resumen ejecutivo)

1. **La clase `core` (god-class) se descompone** en: `database/conex.js` (pool), `utils/token.js` (cifrado/JWT), `middlware/jwtoken.js` (guardas), módulos CRUD (`controllers/*`) y componentes React (los builders de HTML).
2. **Los `switch($_POST['do'])` / `switch($_POST['tipo'])`** de cada `factory/control.*.php` se traducen a endpoints REST (`registrar`→`POST`, `editar`→`PUT`, `eliminar`→`DELETE lógico`, `listar`→`GET`).
3. **Conexión-por-consulta → pool** (`pg` Pool max 50 en `datasource.js`); SQL concatenado → sentencias parametrizadas (`$1..$n`).
4. **`MAX(id)+1` → patrón `COALESCE(MAX(id)+1,1)`** (ya implementado en la API).
5. **Doble base64 de PK/FK → `token.encriptar/decriptar`** (convención ya activa en ambos lados).
6. **Sesión PHP → JWT de 2 min** (`utils/token.createtoken`) + menú desde `logic.tabmenu`/`logic.tabopcimenu` + `logic.tabrollopci`/`logic.tabusuaopci` (el login actual NO usa `engine.*` para menú).
7. **`get_keys()` → SQL de login `privilegees`** (ver `sql/authsql.js`): replica la lógica de privilegios de rol/usuario con `logic.tabrollopci` + `logic.tabusuaopci` sobre `logic.tabopcimenu`.
8. **`HistorialVisitas`/`centinela` → `token.logsteps` + guardas por rol** (`estudiante`, `isTeacher`, `Admin`, ...).
9. **Estados `8/9/2/4/13/16/17` → borrado lógico** `9/0` + estados propios de matrícula/promoción (respetar valores históricos al leer).
10. **WhatsApp NO existe en PHP** — solo correo; la capa WhatsApp es nueva en Escuelapp (`utils/notifications/whatsapp/*`).
11. **PDF/Excel heredados** (mPDF/TCPDF/PEAR) → `exceljs`/`excel4node` (API) y pendiente formato de boletines/certificados.
12. **No hay FKs físicas** en la mayoría de tablas (`public` sí las tiene); integridad por lógica de app — ver `api.md` §11.

> Siguiente paso: `.agents/sae-refactor-mapa.md` (equivalencia módulo a módulo con estado actual en la API y plan por fases).
