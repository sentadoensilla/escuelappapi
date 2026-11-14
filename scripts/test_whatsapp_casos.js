import 'dotenv/config';
import Db from '../database/conex.js';
import { enviarWhatsApp, modoTestActivo } from '../controllers/whatsapp/envio.js';

// Datos de prueba
const CINSTID = 60;          // institución SAE (colpasy@gmail.com)
const AEINST_ID = 34;        // institución Escuelapp equivalente
const LOREM = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;
const VIDEO = 'https://www.w3schools.com/html/mov_bbb.mp4';
const IMAGEN = 'https://picsum.photos/seed/escuelapp/800/450';

async function docentes(limit) {
  const r = await Db.query({
    text: `SELECT d.cdoceid AS personaid, d.cdocecelu AS telefono
           FROM public.tabdoce d
           JOIN public.tabinstdoce ti ON (ti.cdoceid = d.cdoceid)
           WHERE ti.cinstid = $1 AND ti.cinstdoceesta = 8 AND d.cdoceesta = 8
             AND d.cdocecelu IS NOT NULL AND trim(d.cdocecelu) <> ''
           LIMIT $2`,
    values: [CINSTID, limit || 1000],
  });
  return r.rows;
}

async function estudiantesPorGrupos(grupos, limit) {
  const r = await Db.query({
    text: `SELECT aeestudiantes_id AS personaid, aeestudiantes_telefono AS telefono, aeestudiantes_grupo AS grupo
           FROM data.aeestudiantes
           WHERE aeinstitucion_id = $1
             AND trim(aeestudiantes_grupo) = ANY($2)
             AND aeestudiantes_telefono IS NOT NULL AND trim(aeestudiantes_telefono) <> ''
           LIMIT $3`,
    values: [AEINST_ID, grupos, limit || 1000],
  });
  return r.rows;
}

async function enviar(rows, { tipo, tipoMensaje = 'text', payload, personaTipo }) {
  let ok = 0, fail = 0;
  for (const x of rows) {
    const r = await enviarWhatsApp({
      idempresa: AEINST_ID,
      personaTipo,
      personaId: x.personaid,
      destino: x.telefono,
      tipo,
      tipoMensaje,
      payload: typeof payload === 'function' ? payload(x) : payload,
      idreferencia: 0,
    });
    if (r.ok) ok++; else fail++;
  }
  return { total: rows.length, ok, fail };
}

async function main() {
  console.log('Modo test:', modoTestActivo() ? 'ACTIVO -> ' + modoTestActivo() : 'INACTIVO');

  // 1) Aviso a TODOS los docentes (con enlace a video)
  const dAll = await docentes(1000);
  const c1 = await enviar(dAll, {
    tipo: 1, personaTipo: 'docente',
    payload: { titulo: 'AVISO IMPORTANTE', cuerpo: `${LOREM}\n\nVideo: ${VIDEO}` },
  });
  console.log('1) Docentes (AVISO IMPORTANTE):', c1);

  // 2) Eventos del calendario (simulado): 20 estudiantes + 10 docentes
  const e20 = await estudiantesPorGrupos(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'], 20);
  const d10 = await docentes(10);
  const c2a = await enviar(e20, { tipo: 7, personaTipo: 'acudiente', payload: { titulo: 'Próximos eventos del colegio', cuerpo: LOREM } });
  const c2b = await enviar(d10, { tipo: 7, personaTipo: 'docente', payload: { titulo: 'Próximos eventos del colegio', cuerpo: LOREM } });
  console.log('2) Eventos calendario (estudiantes/docentes):', c2a, c2b);

  // 3) Horario de mañana: 20 estudiantes + 10 docentes
  const e20b = await estudiantesPorGrupos(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'], 20);
  const d10b = await docentes(10);
  const c3a = await enviar(e20b, { tipo: 3, personaTipo: 'acudiente', payload: { titulo: 'Horario escolar de mañana', cuerpo: LOREM } });
  const c3b = await enviar(d10b, { tipo: 3, personaTipo: 'docente', payload: { titulo: 'Horario escolar de mañana', cuerpo: LOREM } });
  console.log('3) Horario de mañana (estudiantes/docentes):', c3a, c3b);

  // 4) Boletines: estudiantes de 2 grupos distintos
  const eg1 = await estudiantesPorGrupos(['1'], 1000);
  const eg2 = await estudiantesPorGrupos(['2'], 1000);
  const c4a = await enviar(eg1, { tipo: 1, personaTipo: 'acudiente', payload: { titulo: 'BOLETIN 3er PERIODO', cuerpo: LOREM } });
  const c4b = await enviar(eg2, { tipo: 1, personaTipo: 'acudiente', payload: { titulo: 'BOLETIN 3er PERIODO', cuerpo: LOREM } });
  console.log('4) Boletines (2 grupos):', c4a, c4b);

  // 5) Aviso a grados 1..5 (con imagen)
  const e15 = await estudiantesPorGrupos(['1', '2', '3', '4', '5'], 1000);
  const c5 = await enviar(e15, {
    tipo: 1, personaTipo: 'acudiente', tipoMensaje: 'image',
    payload: { titulo: 'COMUNICADO IMPORTANTE', cuerpo: LOREM, imageUrl: IMAGEN },
  });
  console.log('5) Aviso grados 1-5 (imagen):', c5);

  console.log('Listo. Revisa data.aelog_envios (status pending) y los logs de apibaileys.');
  process.exit(0);
}

main().catch((e) => { console.error('ERR', e.message); process.exit(1); });
