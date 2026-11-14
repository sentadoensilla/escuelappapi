import 'dotenv/config';
import Db from '../database/conex.js';
import { enviarWhatsApp, modoTestActivo } from '../controllers/whatsapp/envio.js';

// Verificación del formato único: título + cuerpo + colegio + firma.
const AEINST_ID = 34;
const LOREM = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.`;
const IMAGEN = 'https://picsum.photos/seed/escuelapp/800/450';

async function main() {
  const d = await Db.query({
    text: `SELECT d.cdoceid AS personaid, d.cdocecelu AS telefono
           FROM public.tabdoce d
           JOIN public.tabinstdoce ti ON (ti.cdoceid = d.cdoceid)
           WHERE ti.cinstid = 60 AND ti.cinstdoceesta = 8 AND d.cdoceesta = 8
             AND d.cdocecelu IS NOT NULL AND trim(d.cdocecelu) <> ''
           LIMIT 1`,
    values: [],
  });
  const docente = d.rows[0];
  if (!docente) throw new Error('Sin docente para la prueba');

  console.log('Modo test:', modoTestActivo() || 'INACTIVO');

  const texto = await enviarWhatsApp({
    idempresa: AEINST_ID, personaTipo: 'docente', personaId: docente.personaid,
    destino: docente.telefono, tipo: 1, tipoMensaje: 'text',
    payload: {
      titulo: '<strong>AVISO IMPORTANTE</strong>',
      cuerpo: `<p>${LOREM.replace(/\n\n/g, '</p><p>')}</p><ul><li>Primer punto</li><li>Segundo punto</li></ul><p><a href="https://ejemplo.com/video">Ver video</a></p>`,
    },
  });
  console.log('texto:', texto);

  const imagen = await enviarWhatsApp({
    idempresa: AEINST_ID, personaTipo: 'docente', personaId: docente.personaid,
    destino: docente.telefono, tipo: 1, tipoMensaje: 'image',
    payload: { titulo: 'COMUNICADO IMPORTANTE', cuerpo: LOREM, imageUrl: IMAGEN },
  });
  console.log('imagen:', imagen);

  const r = await Db.query({
    text: `SELECT idlogenvios, type, destino_efectivo, payload FROM data.aelog_envios
           WHERE idlogenvios = ANY($1) ORDER BY idlogenvios`,
    values: [[texto.idlogenvios, imagen.idlogenvios]],
  });
  for (const row of r.rows) {
    console.log('\n=== ' + row.idlogenvios + ' (' + row.type + ') ===');
    console.log(JSON.parse(JSON.stringify(row.payload)).text || JSON.parse(JSON.stringify(row.payload)).caption);
  }
  process.exit(0);
}

main().catch((e) => { console.error('ERR', e.message); process.exit(1); });
