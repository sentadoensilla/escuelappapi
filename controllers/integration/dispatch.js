import Db from "../../database/conex.js";
import { enviarWhatsApp, aeinstIdDeCinstid } from "../whatsapp/envio.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
require('dotenv').config();

// Tipos de envío (data.aetipo_envio)
const TIPO = {
  COMUNICADO: 1,
  ASISTENCIA: 2,
  HORARIO: 3,
  EXCUSA: 4,
  TAREA: 5,
  EVALUACION: 6,
  CALENDARIO: 7,
  CONSULTA: 8,
  COBRO: 9,
  OBSERVACION: 10
};

/**
 * enviaNotificacion: registra un envío de WhatsApp en el outbox (data.aelog_envios)
 * usando el núcleo de envío (validación LID / modo test). El envío físico lo hace
 * apibaileys (cron → Bull → Baileys).
 *
 * `idempresa` puede venir como aeinst_id (Escuelapp) o cinstid (SAE); se resuelve.
 * @returns {number|null} idlogenvios o null si fue bloqueado/error.
 */
async function enviaNotificacion(p) {
  try {
    let aeinst_id = null;
    if (p.idempresa) {
      const direct = await Db.query({
        text: "SELECT 1 FROM contact.emisor WHERE idempresa = $1 LIMIT 1",
        values: [p.idempresa],
      });
      aeinst_id = direct.rows[0] ? p.idempresa : await aeinstIdDeCinstid(p.idempresa);
    }

    const texto = [p.mensaje || "", p.enlace || ""].filter(Boolean).join("\n");
    const r = await enviarWhatsApp({
      idempresa: aeinst_id,
      destino: p.destino,
      tipo: p.tipo || TIPO.COMUNICADO,
      tipoMensaje: "text",
      payload: { cuerpo: texto },
      idreferencia: p.idreferencia || 0,
      aeestudiantes_id: p.aeestudiantes_id || 0,
    });

    if (!r.ok) {
      console.log("enviaNotificacion (bloqueado):", r.motivo);
      return null;
    }
    return r.idlogenvios;
  } catch (e) {
    console.log("enviaNotificacion:", e.message);
    return null;
  }
}

/**
 * mensajeEnlace: devuelve la URL del enlace seguro que consulta el evento.
 */
const urlEnlace = (token) => {
  const base = process.env.APP_API_FRONT || "http://localhost:3000";
  return `${base}/vista/${token}`;
};

export { enviaNotificacion };
export { urlEnlace };
export { TIPO };
export default {
  enviaNotificacion: enviaNotificacion,
  urlEnlace: urlEnlace,
  TIPO: TIPO
};
