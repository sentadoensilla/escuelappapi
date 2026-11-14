import 'dotenv/config';
import Db from '../database/conex.js';

/**
 * Distribuye las fechas de los envíos de una institución para que el gráfico
 * muestre actividad diaria entre el 26-oct y hoy, con 5–15 mensajes por día.
 *
 * - Se usa `fecharegistro` (agrupación del gráfico) y `updated_at` (fecha de envío).
 * - 305 mensajes no caben en 20 días con máximo 15 (tope 300), así que se usa
 *   un día adicional (25-oct) para poder repartirlos todos sin superar el tope.
 */
const IDEMPRESA = 34;
const MIN = 5;
const MAX = 15;
const HORAS = [7, 20]; // franja horaria de los envíos

const dos = (n) => String(n).padStart(2, '0');
const fechaLocal = (d) => `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function main() {
  const r = await Db.query({
    text: `SELECT idlogenvios FROM data.aelog_envios
           WHERE idempresa = $1 AND status IN ('sent','failed')
           ORDER BY idlogenvios`,
    values: [IDEMPRESA],
  });
  const ids = r.rows.map((x) => x.idlogenvios);
  const total = ids.length;
  if (!total) { console.log('Sin mensajes para distribuir'); process.exit(0); }

  // Días necesarios para respetar 5–15 por día.
  let dias = 21;
  while (total > dias * MAX) dias++;
  while (dias > 1 && total < dias * MIN) dias--;

  const hoy = new Date();
  const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - (dias - 1));

  // Reparto aleatorio de los cupos diarios (5..15) que sumen el total.
  const counts = Array(dias).fill(MIN);
  let restante = total - dias * MIN;
  while (restante > 0) {
    const i = Math.floor(Math.random() * dias);
    if (counts[i] < MAX) { counts[i]++; restante--; }
  }

  const fechas = [];
  for (let d = 0; d < dias; d++) {
    const base = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + d);
    for (let c = 0; c < counts[d]; c++) {
      const hh = HORAS[0] + Math.floor(Math.random() * (HORAS[1] - HORAS[0] + 1));
      const mm = Math.floor(Math.random() * 60);
      fechas.push(`${fechaLocal(base)} ${dos(hh)}:${dos(mm)}:00`);
    }
  }

  const orden = shuffle([...ids]);
  const pares = orden.map((id, i) => ({ id, fecha: fechas[i] }));

  await Db.query({ text: "SET TIME ZONE 'America/Bogota'", values: [] });
  // El trigger trg_aelog_envios_updated fuerza updated_at = now(); se desactiva
  // solo para esta sesión mientras se reescriben las fechas de prueba.
  await Db.query({ text: "SET session_replication_role = replica", values: [] });
  let upd;
  try {
    upd = await Db.query({
      text: `UPDATE data.aelog_envios e
             SET fecharegistro = v.fecha::timestamp,
                 updated_at = v.fecha::timestamp AT TIME ZONE 'America/Bogota'
             FROM (SELECT unnest($1::int[]) AS id, unnest($2::text[]) AS fecha) v
             WHERE e.idlogenvios = v.id`,
      values: [pares.map((p) => p.id), pares.map((p) => p.fecha)],
    });
  } finally {
    await Db.query({ text: "SET session_replication_role = origin", values: [] });
  }

  console.log(`Total: ${total} mensajes · ${dias} días (${fechaLocal(inicio)} → ${fechaLocal(hoy)}) · actualizados: ${upd.rowCount}`);
  const dist = await Db.query({
    text: `SELECT to_char(fecharegistro, 'YYYY-MM-DD') AS dia, count(*) AS total
           FROM data.aelog_envios
           WHERE idempresa = $1 AND status IN ('sent','failed')
           GROUP BY 1 ORDER BY 1`,
    values: [IDEMPRESA],
  });
  for (const row of dist.rows) console.log(`  ${row.dia}: ${row.total}`);
  process.exit(0);
}

main().catch((e) => { console.error('ERR', e.message); process.exit(1); });
