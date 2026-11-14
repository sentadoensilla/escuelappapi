import Db from "../../database/conex.js";
import { htmlAWhatsApp, tituloEnNegrita } from "./texto.js";

/**
 * envio.js — núcleo de envío de WhatsApp de Escuelapp.
 *
 * Flujo: valida (LID/consentimiento salvo modo test) → registra en
 * data.aelog_envios (status='pending') → el cron de apibaileys lo drena y envía.
 *
 * - validarLid(): función INDEPENDIENTE que permite/impide el envío.
 * - modoTestActivo(): si APP_WP_NUMBERTEST tiene valor, todo va a ese número
 *   y se omite la validación de LID.
 */

// Devuelve el número de pruebas (string) si el modo test está activo; si no, null.
export function modoTestActivo() {
  const raw = String(process.env.APP_WP_NUMBERTEST || "").trim();
  if (!raw) return null;
  // Normaliza a solo dígitos (tolera formatos tipo "573...@c.us").
  const digits = raw.replace(/\D/g, "");
  return digits || null;
}

/**
 * Validación de LID/consentimiento (independiente). Permite/impide el envío.
 * @returns {{ ok:boolean, motivo?:string, lid?:string|null }}
 */
export async function validarLid({ idempresa, personaTipo, personaId, destino }) {
  try {
    if (!idempresa) return { ok: false, motivo: "Sin institución" };

    const valores = [idempresa];
    let where = "idempresa = $1";
    if (personaTipo && personaId) {
      valores.push(personaTipo, personaId);
      where += " AND persona_tipo = $2 AND persona_id = $3";
    } else if (destino) {
      valores.push(String(destino));
      where += " AND (telefono_norm = $2 OR telefono = $2)";
    } else {
      return { ok: false, motivo: "Destinatario sin identificación" };
    }

    const r = await Db.query({
      text: `SELECT lid, estado FROM contact.vinculacion_whatsapp WHERE ${where} ORDER BY updated_at DESC LIMIT 1`,
      values: valores,
    });
    const v = r.rows[0];
    if (!v) return { ok: false, motivo: "Sin vinculación/consentimiento registrado" };
    if (v.estado !== "ACTIVE") return { ok: false, motivo: `Vinculación no activa (${v.estado})` };
    return { ok: true, lid: v.lid || null };
  } catch (e) {
    return { ok: false, motivo: "Error validando LID: " + e.message };
  }
}

// Nombre de la institución para el pie del mensaje (caché 5 min).
const nombresInstitucion = new Map();
export async function nombreInstitucion(idempresa) {
  if (!idempresa) return null;
  const c = nombresInstitucion.get(idempresa);
  if (c && Date.now() - c.ts < 300000) return c.nombre;
  try {
    const r = await Db.query({
      text: "SELECT aeinst_nombre FROM data.aeinstituciones WHERE aeinst_id = $1 LIMIT 1",
      values: [idempresa],
    });
    const nombre = r.rows[0]?.aeinst_nombre || null;
    nombresInstitucion.set(idempresa, { nombre, ts: Date.now() });
    return nombre;
  } catch {
    return null;
  }
}

/**
 * Formato único de mensaje:
 *
 *   TÍTULO
 *
 *   cuerpo…
 *
 *   [Nombre del colegio]
 *   Enviado desde escuelapp
 */
export function construirMensaje({ titulo = "", cuerpo = "", institucion = "" } = {}) {
  const bloques = [];
  // Transformación obligatoria: HTML del editor → formato WhatsApp.
  const t = tituloEnNegrita(titulo);
  if (t) bloques.push(t);
  const c = htmlAWhatsApp(cuerpo);
  if (c) bloques.push(c);
  const pie = [String(institucion || "").trim(), "Enviado desde escuelapp"].filter(Boolean).join("\n");
  bloques.push(pie);
  return bloques.join("\n\n");
}

// Aplica el formato al payload según el tipo de mensaje (texto o multimedia).
async function componerPayload(idempresa, tipoMensaje, payload) {
  const institucion = await nombreInstitucion(idempresa);
  const cuerpo = payload?.cuerpo ?? payload?.text ?? payload?.caption ?? "";
  const texto = construirMensaje({ titulo: payload?.titulo, cuerpo, institucion });
  switch (tipoMensaje) {
    case "image":
      return { ...payload, imageUrl: payload?.imageUrl, caption: texto };
    case "video":
    case "video_enlace":
      return { ...payload, videoUrl: payload?.videoUrl, caption: texto };
    case "audio":
      return { ...payload, audioUrl: payload?.audioUrl, caption: texto, text: texto };
    default:
      return { ...payload, text: texto };
  }
}

export async function resolverEmisor(idempresa) {
  if (!idempresa) return null;
  const r = await Db.query({
    text: "SELECT emisor FROM contact.emisor WHERE idempresa = $1 LIMIT 1",
    values: [idempresa],
  });
  return r.rows[0]?.emisor || null;
}

// Mapea cinstid (SAE) → aeinst_id (Escuelapp) si hiciera falta.
export async function aeinstIdDeCinstid(cinstid) {
  const r = await Db.query({
    text: "SELECT aeinst_id FROM migracion.map_institucion WHERE cinstid = $1 LIMIT 1",
    values: [cinstid],
  });
  return r.rows[0]?.aeinst_id ?? null;
}

// Acepta indistintamente aeinst_id o cinstid y devuelve el aeinst_id correcto.
// Útil en controladores legacy que reciben `id_institucion` sin contrato claro.
export async function resolverIdempresa(id) {
  if (!id) return null;
  const r = await Db.query({
    text: "SELECT 1 FROM contact.emisor WHERE idempresa = $1 LIMIT 1",
    values: [id],
  });
  if (r.rows[0]) return parseInt(id);
  return (await aeinstIdDeCinstid(id)) ?? parseInt(id);
}

/**
 * Registra un envío de WhatsApp en el outbox.
 * @param {object} p { idempresa (aeinst_id), personaTipo, personaId, destino,
 *   tipo (data.aetipo_envio), tipoMensaje ('text'|'image'|'video'|'audio'),
 *   payload, idreferencia, aeestudiantes_id }
 * @returns {{ ok:boolean, idlogenvios?:number, test?:boolean, motivo?:string }}
 */
export async function enviarWhatsApp(p) {
  try {
    const {
      idempresa,
      personaTipo = null,
      personaId = null,
      destino = null,
      tipo = 1,
      tipoMensaje = "text",
      payload = {},
      idreferencia = 0,
      aeestudiantes_id = 0,
    } = p || {};

    if (!idempresa) return { ok: false, motivo: "Sin institución" };

    const emisor = await resolverEmisor(idempresa);
    if (!emisor) return { ok: false, motivo: "La institución no tiene emisor de WhatsApp" };

    const testNum = modoTestActivo();

    // Normaliza el destino a un teléfono E.164 (solo dígitos; primer número si vienen varios).
    // La columna data.aelog_envios.destino es varchar(20), así que debe quedar corto.
    const destinoRaw = String(destino || "").trim();
    const primerNumero = (destinoRaw.split(/[^0-9]+/).find(Boolean) || "");
    let destinoGuardar = primerNumero;
    if (/^\d{10}$/.test(destinoGuardar)) destinoGuardar = "57" + destinoGuardar;
    if (destinoGuardar.length > 20) destinoGuardar = destinoGuardar.slice(0, 20);

    let lid = null;
    let to = destinoGuardar;
    let destinoEfectivo = null;

    if (testNum) {
      // Modo test: se omite la validación de LID y todo va al número de prueba.
      to = testNum;
      destinoEfectivo = testNum;
    } else {
      const chk = await validarLid({ idempresa, personaTipo, personaId, destino: destinoGuardar });
      if (!chk.ok) return { ok: false, motivo: chk.motivo };
      lid = chk.lid;
    }

    if (to) {
      const s = String(to).trim();
      to = s.endsWith("@c.us") ? s.replace("@c.us", "") : s;
    }
    if (!to) return { ok: false, motivo: "Sin número destino" };

    // Formato único: título + cuerpo + colegio + "Enviado desde escuelapp".
    const payloadFinal = await componerPayload(idempresa, tipoMensaje, payload);

    const r = await Db.query({
      text: `INSERT INTO data.aelog_envios
        (idlogenvios, idreferencia, idempresa, emisor, aeestudiantes_id, destino, tipo,
         fecharegistro, sent, enviosdetalles, status, type, payload, lid, destino_efectivo, attempts)
        VALUES ((SELECT COALESCE(MAX(idlogenvios)+1, 1) FROM data.aelog_envios),
                $1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, false, $7,
                'pending', $8, $9::jsonb, $10, $11, 0)
        RETURNING idlogenvios`,
      values: [
        idreferencia || 0,
        idempresa,
        emisor,
        aeestudiantes_id || 0,
        destinoGuardar,
        tipo || 1,
        JSON.stringify({ mensaje: payloadFinal?.text || payloadFinal?.caption || "", original: destinoRaw || null }),
        tipoMensaje,
        JSON.stringify(payloadFinal || {}),
        lid,
        destinoEfectivo,
      ],
    });

    return { ok: true, idlogenvios: r.rows[0].idlogenvios, test: !!testNum };
  } catch (e) {
    console.log("enviarWhatsApp:", e.message);
    return { ok: false, motivo: "No se pudo registrar el envío: " + e.message };
  }
}

/**
 * Envía a varios destinatarios (una fila por destinatario).
 * @param {Array<{destino, personaTipo, personaId, aeestudiantes_id}>} destinatarios
 */
export async function enviarMasivo(destinatarios, p) {
  const resumen = { total: destinatarios.length, enviados: 0, bloqueados: 0, detalle: [] };
  for (const d of destinatarios) {
    const r = await enviarWhatsApp({ ...p, ...d });
    if (r.ok) resumen.enviados++;
    else resumen.bloqueados++;
    resumen.detalle.push({ destino: d.destino, ...r });
  }
  return resumen;
}

export default {
  modoTestActivo, validarLid, resolverEmisor, aeinstIdDeCinstid, resolverIdempresa,
  enviarWhatsApp, enviarMasivo, nombreInstitucion, construirMensaje,
  htmlAWhatsApp, tituloEnNegrita,
};
