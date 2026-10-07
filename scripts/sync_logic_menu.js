/**
 * sync_logic_menu.js
 * Sincroniza el menú dinámico del login SAE (esquema logic) con el frontend React:
 *   1. logic.tabopcimenu.copcimenuenla  -> ruta React SIN "/" inicial (areas.php -> areas, anolec.php -> anolec).
 *   2. logic.tabopcimenu.copcimenuicon  -> clases de iconos Bootstrap / Font Awesome (fa fa-...).
 *   3. Claves de prueba para la institución educativa Patricio Symes (colpasy@gmail.com):
 *        - institución  (rol 3):  SW5zdGl0dWNpb24uMjAwMA==  (Institucion.2000)
 *        - secretarias  (rol 7):  RG9jZW50ZS4yMDAw          (Docente.2000)
 *        - docentes     (rol 2):  RG9jZW50ZS4yMDAw          (Docente.2000)
 *        - coordinadores(rol 6):  RG9jZW50ZS4yMDAw          (Docente.2000)
 *        - estudiantes  (rol 1):  RXN0dWRpYW50ZS4yMDAw      (Estudiante.2000)
 *        - acudientes   (rol 4):  RXN0dWRpYW50ZS4yMDAw      (Estudiante.2000)
 *
 * Uso:
 *   node scripts/sync_logic_menu.js
 */
import 'dotenv/config';
import pg from 'pg';

const { Client } = pg;

const c = new Client({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  database: process.env.PG_DB_NAME,
  password: process.env.PG_PASSWORD,
  ssl: false,
});

// copcimenuid -> [copcimenuenla (ruta React sin "/"), copcimenuicon (clase Font Awesome)]
const RUTAS = {
  // ---- Menú 1 (Cursos) ----
  1: ['gestion/cursos', 'fa fa-graduation-cap'],
  67: ['gestion/cursos', 'fa fa-graduation-cap'],
  2: ['areas', 'fa fa-th-large'],
  50: ['gestion/cursos', 'fa fa-graduation-cap'],
  // ---- Menú 2 (Noticias; menú inactivo, se deja coherente) ----
  37: ['avisos', 'fa fa-bullhorn'],
  4: ['avisosadd', 'fa fa-plus-circle'],
  6: ['avisos', 'fa fa-list-alt'],
  5: ['avisos', 'fa fa-list-alt'],
  // ---- Menú 3 (Reportes) ----
  101: ['gestion/prenotas', 'fa fa-file-text'],
  107: ['gestion/promedios', 'fa fa-calculator'],
  71: ['gestion/notas', 'fa fa-file-text'],
  7: ['gestion/notas', 'fa fa-file-text'],
  41: ['gestion/certificados', 'fa fa-certificate'],
  103: ['estadisticassae', 'fa fa-chart-bar'],
  // ---- Menú 4 (Estudiantes) ----
  11: ['gestion/matriculas', 'fa fa-user-plus'],
  64: ['gestion/matriculas', 'fa fa-user-plus'],
  104: ['gestion/notas', 'fa fa-pencil-alt'],
  83: ['gestion/matriculas', 'fa fa-user-check'],
  105: ['gestion/notas', 'fa fa-pencil-alt'],
  12: ['gestion/estudiantes', 'fa fa-users'],
  109: ['gestion/promedios', 'fa fa-calculator'],
  13: ['gestion/matriculas', 'fa fa-file-import'],
  106: ['gestion/promedios', 'fa fa-calculator'],
  33: ['gestion/obsobservaciones', 'fa fa-book'],
  20: ['gestion/estudiantes', 'fa fa-users'],
  97: ['gestion/obsobservaciones', 'fa fa-book'],
  35: ['asistencias', 'fa fa-calendar-check'],
  88: ['asistencias', 'fa fa-calendar-check'],
  108: ['gestion/notas', 'fa fa-pencil-alt'],
  98: ['gestion/obsobservaciones', 'fa fa-book'],
  // ---- Menú 5 (Docentes) ----
  38: ['gestion/usuarios', 'fa fa-key'],
  69: ['gestion/docentes', 'fa fa-chalkboard-teacher'],
  39: ['gestion/docentes', 'fa fa-users'],
  65: ['gestion/docentes', 'fa fa-users'],
  100: ['gestion/preasignaciones', 'fa fa-tasks'],
  14: ['gestion/docentes', 'fa fa-chalkboard-teacher'],
  85: ['gestion/preasignaciones', 'fa fa-tasks'],
  51: ['gestion/asignaciones', 'fa fa-calendar-alt'],
  66: ['gestion/asignaciones', 'fa fa-calendar-alt'],
  // ---- Menú 6 (Asignaturas) ----
  36: ['gestion/asignaturas', 'fa fa-book'],
  16: ['gestion/asignaturas', 'fa fa-book'],
  17: ['areas', 'fa fa-th-large'],
  31: ['gestion/asignaciones', 'fa fa-search'],
  34: ['gestion/competencias', 'fa fa-flag'],
  24: ['gestion/contenidos', 'fa fa-list-alt'],
  // ---- Menú 7 (Configuracion) ----
  55: ['gestion/tipossangre', 'fa fa-tint'],
  53: ['gestion/sisben', 'fa fa-list'],
  52: ['gestion/sisben', 'fa fa-list'],
  63: ['gestion/privilegiosrol', 'fa fa-key'],
  70: ['gestion/institucion', 'fa fa-cog'],
  62: ['gestion/metodosinstitucionales', 'fa fa-university'],
  49: ['gestion/opciones', 'fa fa-bars'],
  48: ['gestion/menus', 'fa fa-list'],
  57: ['gestion/tipossubsidio', 'fa fa-list'],
  60: ['gestion/zonasresidencia', 'fa fa-map-marker'],
  59: ['gestion/usuarios', 'fa fa-users'],
  54: ['gestion/especialidades', 'fa fa-graduation-cap'],
  47: ['gestion/menus', 'fa fa-bars'],
  40: ['gestion/especialidades', 'fa fa-graduation-cap'],
  56: ['gestion/tipossubsidio', 'fa fa-money'],
  61: ['gestion/zonasresidencia', 'fa fa-map-marker'],
  58: ['gestion/usuarios', 'fa fa-user'],
  46: ['gestion/jornadas', 'fa fa-list'],
  45: ['gestion/jornadas', 'fa fa-clock'],
  44: ['gestion/grados', 'fa fa-graduation-cap'],
  21: ['gestion/institucion', 'fa fa-cog'],
  99: ['gestion/institucion', 'fa fa-cogs'],
  22: ['anolec', 'fa fa-calendar'],
  68: ['gestion/institucion', 'fa fa-cog'],
  23: ['anolec', 'fa fa-calendar'],
  29: ['gestion/pazsalvo', 'fa fa-file-text'],
  87: ['gestion/certificados', 'fa fa-certificate'],
  30: ['anolec', 'fa fa-calendar'],
  // ---- Menú 8 (Clientes) ----
  26: ['gestion/institucion', 'fa fa-building'],
  27: ['gestion/docentes', 'fa fa-users'],
  28: ['gestion/estudiantes', 'fa fa-users'],
  // ---- Menú 9 (Documentos) ----
  43: ['gestion/pazsalvo', 'fa fa-check-circle'],
  42: ['gestion/firmas', 'fa fa-pen'],
  // ---- Menú 10 (Promociones) ----
  79: ['gestion/anolperi', 'fa fa-calendar-alt'],
  80: ['gestion/roles', 'fa fa-users'],
  81: ['gestion/cursos', 'fa fa-file-import'],
  110: ['gestion/asignaciones', 'fa fa-file-import'],
  82: ['promocion', 'fa fa-arrow-up'],
  // ---- Menú 11 (SAE Ayuda) ----
  89: ['heLp', 'fa fa-question-circle'],
  90: ['heLp', 'fa fa-question-circle'],
  // ---- Menú 12 (Áreas) ----
  78: ['areas', 'fa fa-th-large'],
  92: ['gestion/competencias', 'fa fa-flag'],
  // ---- Menú 13 (Calificaciones) ----
  93: ['gestion/promedios', 'fa fa-calculator'],
  94: ['gestion/promedios', 'fa fa-calculator'],
  // ---- Menú 14 (Novedades) ----
  95: ['gestion/obsobservaciones', 'fa fa-book'],
  96: ['gestion/obsobservaciones', 'fa fa-calendar-times'],
};

const CLAVES = {
  institucion: 'SW5zdGl0dWNpb24uMjAwMA==', // Institucion.2000
  secretaria: 'RG9jZW50ZS4yMDAw', // Docente.2000
  coordinador: 'RG9jZW50ZS4yMDAw', // Docente.2000
  docente: 'RG9jZW50ZS4yMDAw', // Docente.2000
  estudiante: 'RXN0dWRpYW50ZS4yMDAw', // Estudiante.2000
  acudiente: 'RXN0dWRpYW50ZS4yMDAw', // Estudiante.2000
};

async function main() {
  await c.connect();

  // 1) Rutas e iconos de logic.tabopcimenu
  let actualizadas = 0;
  for (const [id, [enlace, icono]] of Object.entries(RUTAS)) {
    const r = await c.query(
      `UPDATE logic.tabopcimenu SET copcimenuenla=$2, copcimenuicon=$3 WHERE copcimenuid=$1`,
      [parseInt(id, 10), enlace, icono]
    );
    actualizadas += r.rowCount;
  }
  console.log('tabopcimenu actualizadas: ' + actualizadas + ' opciones');

  // 2) Claves de prueba — institución Patricio Symes (colpasy)
  const instId = await c.query(
    `SELECT cacadid AS cinstid FROM public.tabunio WHERE cusuaid=(SELECT cusuaid FROM logic.tabusua WHERE cusuanick='colpasy@gmail.com' AND cusuaesta=8) AND cunioesta=8 LIMIT 1`
  );
  if (instId.rows.length === 0) throw new Error('No se encontró la institución colpasy en public.tabunio');
  const CINSTID = parseInt(instId.rows[0].cinstid, 10);

  // Institución
  const inst = await c.query(
    `UPDATE logic.tabusua SET cusuallave=$1 WHERE cusuanick='colpasy@gmail.com' AND cusuaesta=8 AND cusuaroll=3 RETURNING cusuaid`,
    [CLAVES.institucion]
  );
  console.log('clave institución colpasy: ' + inst.rowCount + ' usuario(s)');

  // Secretarias (rol 7) y coordinadores (rol 6) ligados a la institución
  const sec = await c.query(
    `UPDATE logic.tabusua SET cusuallave=$2
     WHERE cusuaesta=8 AND cusuaroll IN (7,6) AND cusuaid IN (
       SELECT t.cusuaid FROM public.tabunio t
       JOIN public.tabinstdoce d ON d.cdoceid=t.cacadid AND d.cinstdoceesta=8
       WHERE t.cunioesta=8 AND d.cinstid=$1
     )`,
    [CINSTID, CLAVES.secretaria]
  );
  console.log('clave secretarias/coordinadores: ' + sec.rowCount + ' usuario(s)');

  // Docentes (rol 2) ligados a la institución
  const doc = await c.query(
    `UPDATE logic.tabusua SET cusuallave=$2
     WHERE cusuaesta=8 AND cusuaroll=2 AND cusuaid IN (
       SELECT t.cusuaid FROM public.tabunio t
       JOIN public.tabinstdoce d ON d.cdoceid=t.cacadid AND d.cinstdoceesta=8
       WHERE t.cunioesta=8 AND d.cinstid=$1
     )`,
    [CINSTID, CLAVES.docente]
  );
  console.log('clave docentes: ' + doc.rowCount + ' usuario(s)');

  // Estudiantes (rol 1) matriculados en la institución
  const est = await c.query(
    `UPDATE logic.tabusua SET cusuallave=$2
     WHERE cusuaesta=8 AND cusuaroll=1 AND cusuaid IN (
       SELECT t.cusuaid FROM public.tabunio t
       JOIN public.tabmatr m ON m.cestuid=t.cacadid AND m.cmatresta=13
       WHERE t.cunioesta=8 AND m.cmatrinst=$1
     )`,
    [CINSTID, CLAVES.estudiante]
  );
  console.log('clave estudiantes: ' + est.rowCount + ' usuario(s)');

  // Acudientes (rol 4) ligados a estudiantes de la institución
  const acu = await c.query(
    `UPDATE logic.tabusua SET cusuallave=$2
     WHERE cusuaesta=8 AND cusuaroll=4 AND cusuaid IN (
       SELECT t.cusuaid FROM public.tabunio t
       JOIN public.tabestuacud a ON a.cestuacudid=t.cacadid
       WHERE t.cunioesta=8 AND a.cmatrid IN (
         SELECT m.cmatrid FROM public.tabmatr m WHERE m.cmatrinst=$1 AND m.cmatresta=13
       )
     )`,
    [CINSTID, CLAVES.acudiente]
  );
  console.log('clave acudientes: ' + acu.rowCount + ' usuario(s)');

  console.log('OK: menú logic.tabopcimenu sincronizado y claves de prueba asignadas.');
  await c.end();
  process.exit(0);
}

main().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
