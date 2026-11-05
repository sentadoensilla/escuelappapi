import Db from "../../database/conex.js";

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
  const n = String(process.env.APP_WP_NUMBERTEST || "").trim();
  return n !== "" ? n : null;
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
    let lid = null;
    let to = destino;
    let destinoEfectivo = null;

    if (testNum) {
      // Modo test: se omite la validación de LID y todo va al número de prueba.
      to = testNum;
      destinoEfectivo = testNum;
    } else {
      const chk = await validarLid({ idempresa, personaTipo, personaId, destino });
      if (!chk.ok) return { ok: false, motivo: chk.motivo };
      lid = chk.lid;
    }

    if (!to) return { ok: false, motivo: "Sin número destino" };

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
        destino || "",
        tipo || 1,
        JSON.stringify({ mensaje: payload?.text || "", original: destino || null }),
        tipoMensaje,
        JSON.stringify(payload || {}),
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

export default { modoTestActivo, validarLid, resolverEmisor, aeinstIdDeCinstid, enviarWhatsApp, enviarMasivo };
