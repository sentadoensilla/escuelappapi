import 'dotenv/config';
import Db from '../database/conex.js';
import token from '../utils/token.js';
import { enviarWhatsApp } from '../controllers/whatsapp/envio.js';
import { resolverAudiencia } from '../controllers/whatsapp/destinatarios.js';

/**
 * Prueba de los botones de la cola desde la API que usa escuelappvenus:
 *   Pausar · Reanudar · Detener · Eliminar cola · Eliminar emisor.
 *
 * Encola 260 mensajes en modo test y verifica en la BD el efecto de cada acción.
 * El borrado del emisor se prueba con respaldo y restauración inmediata.
 */
const API = 'http://localhost:4004';
const USER = 'colpasy@gmail.com';
const PASS = 'Institucion.2000';
const CINSTID = 60;
const AEINST_ID = 34;
const ANO = 9;
const TITULO = 'PRUEBA DE COLA';
const CANTIDAD = 260;

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const ahora = () => new Date().toLocaleTimeString('es-CO');
const log = (...a) => console.log(`[${ahora()}]`, ...a);

async function login() {
  const r = await fetch(`${API}/users/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: USER, password: PASS }),
  });
  const j = await r.json();
  const t = j?.rows?.[0]?.datos_usuario?.token;
  if (!t) throw new Error('Login sin token: ' + JSON.stringify(j).slice(0, 200));
  return t;
}

async function accion(t, endpoint, body = {}) {
  const r = await fetch(`${API}/whatsapp${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
    body: JSON.stringify(body),
  });
  return r.json();
}

async function configCola() {
  const r = await Db.query({
    text: `SELECT c.paused, c.stopped FROM contact.emisor e
           JOIN contact.emisor_config c ON (c.idemisor = e.idemisor)
           WHERE e.idempresa = $1 LIMIT 1`,
    values: [AEINST_ID],
  });
  return r.rows[0] || {};
}

async function estadoBatch(maxId) {
  const r = await Db.query({
    text: `SELECT count(*)::int AS total,
                  count(*) FILTER (WHERE status='pending')::int   AS pending,
                  count(*) FILTER (WHERE status='queued')::int    AS queued,
                  count(*) FILTER (WHERE status='sending')::int   AS sending,
                  count(*) FILTER (WHERE status='sent')::int      AS sent,
                  count(*) FILTER (WHERE status='failed')::int    AS failed,
                  count(*) FILTER (WHERE status='cancelled')::int AS cancelled
           FROM data.aelog_envios
           WHERE idempresa = $1 AND idlogenvios > $2`,
    values: [AEINST_ID, maxId],
  });
  return r.rows[0];
}

async function maxId() {
  const r = await Db.query({ text: 'SELECT COALESCE(MAX(idlogenvios),0)::int AS m FROM data.aelog_envios', values: [] });
  return r.rows[0].m;
}

async function esperarHasta(cond, timeoutMs, intervaloMs, etiqueta) {
  const inicio = Date.now();
  while (Date.now() - inicio < timeoutMs) {
    const v = await cond();
    if (v) return true;
    await esperar(intervaloMs);
  }
  log(`⚠️  timeout esperando: ${etiqueta}`);
  return false;
}

async function encolar(cantidad) {
  const acudientes = await resolverAudiencia({ audiencia: { tipo: 'todos' }, cinstid: CINSTID, anolectivo: ANO });
  const docentes = await resolverAudiencia({ audiencia: { tipo: 'docentes' }, cinstid: CINSTID, anolectivo: ANO });
  const pool = [...acudientes, ...docentes];
  if (!pool.length) throw new Error('Sin destinatarios');
  let ok = 0;
  for (let i = 0; i < cantidad; i++) {
    const d = pool[i % pool.length];
    const r = await enviarWhatsApp({
      idempresa: AEINST_ID,
      personaTipo: d.personaTipo,
      personaId: d.personaId,
      destino: d.destino,
      tipo: 1,
      tipoMensaje: 'text',
      payload: { titulo: TITULO, cuerpo: `Mensaje ${i + 1} de ${cantidad} — prueba de los botones de la cola.` },
      idreferencia: i + 1,
      aeestudiantes_id: d.aeestudiantes_id || 0,
    });
    if (r.ok) ok++;
  }
  return ok;
}

async function respaldarEmisor() {
  const em = await Db.query({ text: 'SELECT * FROM contact.emisor WHERE idempresa = $1', values: [AEINST_ID] });
  const idemisor = em.rows[0]?.idemisor;
  const numero = em.rows[0]?.emisor;
  const cfg = await Db.query({ text: 'SELECT * FROM contact.emisor_config WHERE idemisor = $1', values: [idemisor] });
  const ses = await Db.query({ text: 'SELECT * FROM contact.sessions WHERE id = $1', values: [numero] });
  const auth = await Db.query({ text: 'SELECT * FROM contact.whatsapp_auth WHERE session_id = $1', values: [numero] });
  return { emisor: em.rows, config: cfg.rows, sesiones: ses.rows, auth: auth.rows, idemisor, numero };
}

async function restaurar(tabla, filas) {
  for (const fila of filas) {
    const cols = Object.keys(fila);
    const params = cols.map((_, i) => `$${i + 1}`);
    await Db.query({
      text: `INSERT INTO ${tabla} (${cols.map((c) => `"${c}"`).join(',')})
             VALUES (${params.join(',')}) ON CONFLICT DO NOTHING`,
      values: cols.map((c) => fila[c]),
    });
  }
}

async function contarEmisor(idemisor, numero) {
  const q = async (text, values) => (await Db.query({ text, values })).rows[0].n;
  return {
    emisor: await q('SELECT count(*)::int n FROM contact.emisor WHERE idemisor=$1', [idemisor]),
    config: await q('SELECT count(*)::int n FROM contact.emisor_config WHERE idemisor=$1', [idemisor]),
    sesion: await q('SELECT count(*)::int n FROM contact.sessions WHERE id=$1', [numero]),
    auth: await q('SELECT count(*)::int n FROM contact.whatsapp_auth WHERE session_id=$1', [numero]),
  };
}

async function main() {
  log('Login…');
  const t = await login();
  log('Token OK');

  // ───── 1) PAUSAR ─────
  log('1) Pausar cola');
  log('   respuesta:', await accion(t, '/colas/pausar'));
  log('   config:', await configCola());

  // ───── 2) ENCOLAR 260 ─────
  const max1 = await maxId();
  log(`2) Encolando ${CANTIDAD} mensajes (id > ${max1})…`);
  const ok = await encolar(CANTIDAD);
  log('   encolados:', ok);
  log('   estado inicial:', await estadoBatch(max1));

  log('   esperando 135 s con la cola pausada…');
  await esperar(135000);
  const pausada = await estadoBatch(max1);
  log('   estado tras pausa:', pausada);
  if (pausada.sent !== 0) log('⚠️  se enviaron mensajes con la cola pausada');

  // ───── 3) REANUDAR ─────
  log('3) Reanudar cola');
  log('   respuesta:', await accion(t, '/colas/reanudar'));
  log('   config:', await configCola());

  await esperarHasta(async () => (await estadoBatch(max1)).sent >= 40, 240000, 10000, '40 enviados');
  const antesStop = await estadoBatch(max1);
  log('   estado antes de detener:', antesStop);

  // ───── 4) DETENER ─────
  log('4) Detener cola');
  log('   respuesta:', await accion(t, '/colas/detener'));
  log('   config:', await configCola());
  await esperar(135000);
  const trasStop = await estadoBatch(max1);
  log('   estado tras detener:', trasStop);
  log(`   enviados durante la detención: ${trasStop.sent - antesStop.sent}`);

  // ───── 5) REANUDAR Y DRENAR ─────
  log('5) Reanudar y drenar los 260');
  log('   respuesta:', await accion(t, '/colas/reanudar'));
  await esperarHasta(async () => {
    const e = await estadoBatch(max1);
    return e.pending + e.queued + e.sending === 0;
  }, 9 * 60 * 1000, 15000, 'drenaje completo');
  log('   estado final del lote:', await estadoBatch(max1));

  // ───── 6) ELIMINAR COLA ─────
  log('6) Eliminar cola (con 20 mensajes pendientes)');
  log('   pausar:', await accion(t, '/colas/pausar'));
  const max2 = await maxId();
  const ok2 = await encolar(20);
  log('   encolados extra:', ok2);
  await esperar(3000);
  const antesEliminar = await estadoBatch(max2);
  log('   antes de eliminar:', antesEliminar);
  const del = await accion(t, '/colas/eliminar');
  log('   respuesta:', del);
  const trasEliminar = await estadoBatch(max2);
  log('   después de eliminar:', trasEliminar);
  log('   reanudar:', await accion(t, '/colas/reanudar'));

  // ───── 7) ELIMINAR EMISOR (respaldo/restauración) ─────
  log('7) Eliminar emisor (con respaldo)');
  const bk = await respaldarEmisor();
  log('   respaldo:', { idemisor: bk.idemisor, numero: bk.numero, config: bk.config.length, sesiones: bk.sesiones.length, auth: bk.auth.length });
  const idemisorEnc = token.encriptar(String(bk.idemisor));
  const delEm = await accion(t, '/emisores/eliminar', { idregistro: idemisorEnc });
  log('   respuesta:', delEm);
  log('   filas tras eliminar:', await contarEmisor(bk.idemisor, bk.numero));

  await restaurar('contact.emisor', bk.emisor);
  await restaurar('contact.emisor_config', bk.config);
  await restaurar('contact.sessions', bk.sesiones);
  await restaurar('contact.whatsapp_auth', bk.auth);
  log('   filas tras restaurar:', await contarEmisor(bk.idemisor, bk.numero));

  // Envío de control tras restaurar el emisor
  const max3 = await maxId();
  log('   envío de control…');
  await encolar(1);
  await esperarHasta(async () => (await estadoBatch(max3)).sent >= 1, 4 * 60 * 1000, 10000, 'envío de control');
  log('   control:', await estadoBatch(max3));

  log('FIN');
  process.exit(0);
}

main().catch((e) => { console.error('ERR', e); process.exit(1); });
