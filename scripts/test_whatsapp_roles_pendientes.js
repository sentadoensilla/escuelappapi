import 'dotenv/config';
import { enviarWhatsApp, modoTestActivo } from '../controllers/whatsapp/envio.js';
import { resolverAudiencia } from '../controllers/whatsapp/destinatarios.js';

/**
 * Casos que quedaron en 0 en la primera corrida (audiencia corregida):
 *  - Coordinador: acudientes de sus cursos + citación.
 *  - Docente: inasistencia, tarea, examen, observación, citación.
 * Los casos ya enviados (docentes del coordinador, consultas, admin) no se repiten.
 */
const CINSTID = 60;
const AEINST_ID = 34;
const ANO = 9;
const LOREM = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.`;

async function encolar(destinatarios, { tipo, titulo, cuerpo }) {
  let ok = 0, fail = 0;
  for (const d of destinatarios) {
    const r = await enviarWhatsApp({
      idempresa: AEINST_ID,
      personaTipo: d.personaTipo,
      personaId: d.personaId,
      destino: d.destino,
      tipo,
      tipoMensaje: 'text',
      payload: { titulo, cuerpo },
      idreferencia: 0,
      aeestudiantes_id: d.aeestudiantes_id || 0,
    });
    if (r.ok) ok++;
    else { fail++; console.log('   bloqueado:', d.destino, '→', r.motivo); }
  }
  return { total: destinatarios.length, ok, fail };
}

async function acudientes(grupos, limit) {
  const rows = await resolverAudiencia({ audiencia: { tipo: 'grupos', ids: grupos }, cinstid: CINSTID, anolectivo: ANO });
  return rows.slice(0, limit);
}

async function main() {
  console.log('Modo test:', modoTestActivo() || 'INACTIVO');

  // ───────────── COORDINADOR (faltantes) ─────────────
  console.log('\n=== COORDINADOR ===');
  const acCoord = await acudientes(['1', '2'], 20);
  console.log('Acudientes de cursos a cargo (grupos 1,2):', acCoord.length);
  console.log('2) Acudientes de sus cursos:', await encolar(acCoord, {
    tipo: 1, titulo: 'COMUNICADO A ACUDIENTES', cuerpo: LOREM,
  }));
  console.log('3) Citación a padres:', await encolar(acCoord.slice(0, 5), {
    tipo: 1, titulo: 'CITACIÓN A PADRES',
    cuerpo: 'Se cita a los acudientes a reunión por asuntos académicos y de convivencia.\nFecha: mañana, 7:00 a.m.\nLugar: coordinación.',
  }));

  // ───────────── DOCENTE ─────────────
  console.log('\n=== DOCENTE ===');
  const acDoc = await acudientes(['1'], 5);
  console.log('Acudientes del grupo 1:', acDoc.length);
  const casos = [
    { tipo: 2, titulo: 'INASISTENCIA', cuerpo: 'El estudiante no asistió a clase hoy.\nGrupo 1.' },
    { tipo: 5, titulo: 'NUEVA TAREA', cuerpo: 'Se asignó una nueva tarea.\nGrupo 1.\nPlazo: dos días.' },
    { tipo: 6, titulo: 'NUEVA EVALUACIÓN', cuerpo: 'Se programó una evaluación.\nGrupo 1.\nFecha: próximo lunes.' },
    { tipo: 10, titulo: 'OBSERVACIÓN', cuerpo: 'Se registró una observación de convivencia.\nGrupo 1.' },
    { tipo: 1, titulo: 'CITACIÓN A PADRES', cuerpo: 'Citación por asunto académico/disciplinario.\nGrupo 1.\nFecha: mañana, 7:00 a.m.' },
  ];
  for (const c of casos) console.log(`${c.titulo}:`, await encolar(acDoc, c));

  console.log('\nListo. Revisa data.aelog_envios y los logs de apibaileys.');
  process.exit(0);
}

main().catch((e) => { console.error('ERR', e.message); process.exit(1); });
