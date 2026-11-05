import { alcance, auditar } from "./helpers.js";
import { enviarMasivo, validarLid, modoTestActivo } from "./envio.js";

// Encola un envío de WhatsApp (uno o varios destinatarios).
export async function enviar(req, res) {
  try {
    const { esAdmin, aeinst_id } = await alcance(req);
    const idempresa = esAdmin ? (parseInt(req.body.idempresa) || null) : aeinst_id;
    if (idempresa == null) {
      return res.send({ status: "error", statusCode: 400, message: "Institución no resuelta", rows: {} });
    }

    const destinatarios = Array.isArray(req.body.destinatarios) ? req.body.destinatarios : [];
    if (!destinatarios.length) {
      return res.send({ status: "error", statusCode: 400, message: "Sin destinatarios", rows: {} });
    }

    const base = {
      idempresa,
      tipo: req.body.tipo || 1,
      tipoMensaje: req.body.tipoMensaje || "text",
      payload: req.body.payload || { text: req.body.mensaje || "" },
      idreferencia: req.body.idreferencia || 0,
    };

    const r = await enviarMasivo(destinatarios, base);
    await auditar(req, "enviar", "success", {
      idempresa, total: r.total, enviados: r.enviados, bloqueados: r.bloqueados, test: !!modoTestActivo(),
    });

    res.send({
      status: "success", statusCode: 200,
      message: `${r.enviados} encolados, ${r.bloqueados} bloqueados`,
      rows: r,
    });
  } catch (e) {
    console.log("whatsapp/enviar:", e.message);
    res.send({ status: "error", statusCode: 400, message: "No se pudo enviar", rows: {} });
  }
}

// Valida (función independiente) si un destinatario puede recibir mensajes.
export async function validar(req, res) {
  try {
    const { esAdmin, aeinst_id } = await alcance(req);
    const idempresa = esAdmin ? (parseInt(req.body.idempresa) || null) : aeinst_id;
    if (idempresa == null) {
      return res.send({ status: "error", statusCode: 400, message: "Institución no resuelta", rows: {} });
    }
    const r = await validarLid({
      idempresa,
      personaTipo: req.body.personaTipo,
      personaId: req.body.personaId,
      destino: req.body.destino,
    });
    res.send({ status: "success", statusCode: 200, message: r.ok ? "LID válido" : r.motivo, rows: r });
  } catch (e) {
    console.log("whatsapp/lid/validar:", e.message);
    res.send({ status: "error", statusCode: 400, message: "No se pudo validar", rows: {} });
  }
}

export default { enviar, validar };
