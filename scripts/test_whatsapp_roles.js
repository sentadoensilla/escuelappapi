import 'dotenv/config';
import Db from '../database/conex.js';
import { enviarWhatsApp, modoTestActivo } from '../controllers/whatsapp/envio.js';
import { resolverAudiencia } from '../controllers/whatsapp/destinatarios.js';

/**
 * Pruebas de envío por rol (modo test: todo va a APP_WP_NUMBERTEST).
 *
 * Coordinador  → docentes a cargo, acudientes de sus cursos, citación.
 * Docente      → inasistencia, tarea, examen, observación, citación.
 * Estudiante   → consulta al docente, consulta a la institución.
 * Administrador→ mantenimiento, próximos pagos, colegios específicos.
 *
 * Los envíos se registran en data.aelog_envios y los drena apibaileys.
 */
const CINSTID = 60;        // institución SAE (colpasy@gmail.com)
const AEINST_ID = 34;      // institución Escuelapp
const ANO = 9;             // año lectivo con datos (data.aeestudiantes)
const LOREM = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.`;

async function encolar(destinatarios, { tipo, titulo, cuerpo, tipoMensaje = 'text' }) {
  let ok = 0, fail = 0;
  for (const d of destinatarios) {
    const r = await enviarWhatsApp({
      idempresa: d.idempresa || AEINST_ID,
      personaTipo: d.personaTipo,
      personaId: d.personaId,
      destino: d.destino,
      tipo,
      tipoMensaje,
      payload: { titulo, cuerpo },
      idreferencia: 0,
      aeestudiantes_id: d.aeestudiantes_id || 0,
    });
    if (r.ok) ok++;
    else { fail++; console.log('   bloqueado:', d.destino, '→', r.motivo); }
  }
  return { total: destinatarios.length, ok, fail };
}

// Docentes de la institución (o de los cursos del coordinador si tuviera).
async function docentesACargo(cdoceid, limit = 10) {
  const propios = await Db.query({
    text: `SELECT DISTINCT a.cdoceid AS personaid, d.cdocecelu AS telefono
           FROM public.tabcurs c
           JOIN public.asigcurs a ON (a.ccursid = c.ccursid AND a.casigcursesta = 8)
           JOIN public.tabdoce d ON (d.cdoceid = a.cdoceid)
           WHERE c.cinstid = $1 AND c.ccurscoor = $2 AND d.cdoceesta = 8
             AND d.cdocecelu IS NOT NULL AND trim(d.cdocecelu) <> ''
           LIMIT $3`,
    values: [CINSTID, cdoceid, limit],
  });
  if (propios.rows.length) return { origen: `cursos con coordinador ${cdoceid}`, rows: propios.rows };

  const todos = await Db.query({
    text: `SELECT DISTINCT a.cdoceid AS personaid, d.cdocecelu AS telefono
           FROM public.tabcurs c
           JOIN public.asigcurs a ON (a.ccursid = c.ccursid AND a.casigcursesta = 8)
           JOIN public.tabdoce d ON (d.cdoceid = a.cdoceid)
           WHERE c.cinstid = $1 AND c.ccursesta = 8 AND d.cdoceesta = 8
             AND d.cdocecelu IS NOT NULL AND trim(d.cdocecelu) <> ''
           LIMIT $2`,
    values: [CINSTID, limit],
  });
  return { origen: 'todos los docentes con asignación (sin cursos propios del coordinador)', rows: todos.rows };
}

// Grupos con asignaciones de la institución/año.
async function gruposInstitucion() {
  const r = await Db.query({
    text: `SELECT DISTINCT aeasignaciones_grupo AS grupo
           FROM data.aeasignaciones
           WHERE aeinst_id = $1 AND aeanol_id = $2 AND aeasignaciones_grupo IS NOT NULL
           ORDER BY 1`,
    values: [AEINST_ID, ANO],
  });
  return r.rows.map((x) => String(x.grupo));
}

async function acudientes(grupos, limit) {
  const rows = await resolverAudiencia({ audiencia: { tipo: 'grupos', ids: grupos }, cinstid: CINSTID, anolectivo: ANO });
  return rows.slice(0, limit);
}

async function instituciones(destinoTodas = true, ids = []) {
  const rows = await resolverAudiencia({ audiencia: { tipo: 'instituciones', ids }, cinstid: CINSTID, anolectivo: ANO });
  if (!destinoTodas) return rows.filter((x) => ids.length === 0 || ids.includes(x.personaId));
  return rows;
}

async function main() {
  console.log('Modo test:', modoTestActivo() || 'INACTIVO');

  const coord = await Db.query({
    text: `SELECT cdoceid FROM public.tabdoce WHERE lower(cdoceemai) = 'lualmos@gmail.com' LIMIT 1`,
    values: [],
  });
  const cdoceCoord = coord.rows[0]?.cdoceid || null;
  const grupos = await gruposInstitucion();

  // ───────────── COORDINADOR ─────────────
  console.log('\n=== COORDINADOR ===');
  const dc = await docentesACargo(cdoceCoord, 10);
  console.log('Docentes a cargo:', dc.rows.length, '(' + dc.origen + ')');
  const c1 = await encolar(dc.rows.map((x) => ({ destino: x.telefono, personaTipo: 'docente', personaId: x.personaid })), {
    tipo: 1, titulo: 'COMUNICADO DEL COORDINADOR', cuerpo: LOREM,
  });
  console.log('1) Docentes a cargo:', c1);

  const acCoord = await acudientes(grupos.slice(0, 2), 20);
  console.log('Acudientes de cursos a cargo (grupos ' + grupos.slice(0, 2).join(', ') + '):', acCoord.length);
  const c2 = await encolar(acCoord, { tipo: 1, titulo: 'COMUNICADO A ACUDIENTES', cuerpo: LOREM });
  console.log('2) Acudientes de sus cursos:', c2);

  const c3 = await encolar(acCoord.slice(0, 5), {
    tipo: 1, titulo: 'CITACIÓN A PADRES',
    cuerpo: 'Se cita a los acudientes a reunión por asuntos académicos y de convivencia.\nFecha: mañana, 7:00 a.m.\nLugar: coordinación.',
  });
  console.log('3) Citación a padres:', c3);

  // ───────────── DOCENTE ─────────────
  console.log('\n=== DOCENTE ===');
  const grupoDoc = grupos.includes('1') ? '1' : grupos[0];
  const acDoc = await acudientes([grupoDoc], 5);
  console.log('Acudientes del grupo', grupoDoc + ':', acDoc.length);
  const casosDocente = [
    { tipo: 2, titulo: 'INASISTENCIA', cuerpo: `El estudiante no asistió a clase hoy.\nGrupo ${grupoDoc}.` },
    { tipo: 5, titulo: 'NUEVA TAREA', cuerpo: `Se asignó una nueva tarea.\nGrupo ${grupoDoc}.\nPlazo: dos días.` },
    { tipo: 6, titulo: 'NUEVA EVALUACIÓN', cuerpo: `Se programó una evaluación.\nGrupo ${grupoDoc}.\nFecha: próximo lunes.` },
    { tipo: 10, titulo: 'OBSERVACIÓN', cuerpo: `Se registró una observación de convivencia.\nGrupo ${grupoDoc}.` },
    { tipo: 1, titulo: 'CITACIÓN A PADRES', cuerpo: `Citación por asunto académico/disciplinario.\nGrupo ${grupoDoc}.\nFecha: mañana, 7:00 a.m.` },
  ];
  for (const c of casosDocente) {
    const r = await encolar(acDoc, c);
    console.log(`${c.titulo}:`, r);
  }

  // ───────────── ESTUDIANTE / ACUDIENTE ─────────────
  console.log('\n=== ESTUDIANTE / ACUDIENTE ===');
  const unDocente = await Db.query({
    text: `SELECT d.cdoceid AS personaid, d.cdocecelu AS telefono, d.cdocenomb, d.cdoceapel
           FROM public.tabdoce d JOIN public.tabinstdoce ti ON (ti.cdoceid = d.cdoceid)
           WHERE ti.cinstid = $1 AND ti.cinstdoceesta = 8 AND d.cdoceesta = 8
             AND d.cdocecelu IS NOT NULL AND trim(d.cdocecelu) <> ''
           LIMIT 1`,
    values: [CINSTID],
  });
  const doc = unDocente.rows[0];
  console.log('Consulta al docente:', doc?.cdocenomb, doc?.cdoceapel);
  console.log('1) Consulta al docente:', await encolar([{ destino: doc.telefono, personaTipo: 'docente', personaId: doc.personaid }], {
    tipo: 8, titulo: 'CONSULTA AL DOCENTE', cuerpo: 'Buen día, quisiera consultar por el rendimiento académico de mi hijo(a).',
  }));

  const inst = await Db.query({
    text: `SELECT COALESCE(NULLIF(TRIM(t.cinsttele), ''), NULLIF(TRIM(i.aeinst_telefono), '')) AS telefono
           FROM data.aeinstituciones i
           LEFT JOIN migracion.map_institucion m ON (m.aeinst_id = i.aeinst_id)
           LEFT JOIN public.tabinst t ON (t.cinstid = m.cinstid)
           WHERE i.aeinst_id = $1 LIMIT 1`,
    values: [AEINST_ID],
  });
  console.log('2) Consulta a la institución:', await encolar([{ destino: inst.rows[0]?.telefono, personaTipo: 'institucion', personaId: CINSTID }], {
    tipo: 8, titulo: 'CONSULTA A LA INSTITUCIÓN', cuerpo: 'Solicito información sobre el proceso de matrícula y pagos.',
  }));

  // ───────────── ADMINISTRADOR ─────────────
  console.log('\n=== ADMINISTRADOR ===');
  const todas = await instituciones(true);
  console.log('Instituciones con emisor y teléfono:', todas.length);
  console.log('1) Mantenimiento (todas):', await encolar(todas, {
    tipo: 1, titulo: 'MANTENIMIENTO PROGRAMADO',
    cuerpo: 'La plataforma estará en mantenimiento el sábado de 10:00 p.m. a 2:00 a.m.',
  }));
  console.log('2) Próximos pagos (rectores):', await encolar(todas, {
    tipo: 9, titulo: 'PRÓXIMOS PAGOS',
    cuerpo: 'Recuerde que el pago de la mensualidad vence el día 30. Evite recargos.',
  }));
  const especificas = await instituciones(false, [CINSTID]);
  console.log('3) Colegios específicos (' + especificas.length + '):', await encolar(especificas, {
    tipo: 1, titulo: 'COMUNICADO A COLEGIOS SELECCIONADOS',
    cuerpo: 'Este mensaje se envía solo a las instituciones seleccionadas por el administrador.',
  }));

  console.log('\nListo. Revisa data.aelog_envios y los logs de apibaileys.');
  process.exit(0);
}

main().catch((e) => { console.error('ERR', e.message); process.exit(1); });
