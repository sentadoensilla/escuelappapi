import Db from "../../database/conex.js";
import { alcance, auditar } from "./helpers.js";
import { enviarMasivo, validarLid, modoTestActivo } from "./envio.js";
import { resolverAudiencia } from "./destinatarios.js";

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

// Notifica a una audiencia (docentes, estudiantes o grupos) resolviendo sus teléfonos.
export async function notificar(req, res) {
  try {
    const { esAdmin, aeinst_id, cinstid } = await alcance(req);
    const audiencia = req.body.audiencia || {};
    const esInstituciones = audiencia.tipo === "instituciones";
    if (esAdmin) {
      if (!esInstituciones) {
        return res.send({ status: "error", statusCode: 400, message: "El administrador solo notifica a instituciones (audiencia.tipo='instituciones')", rows: {} });
      }
    } else if (aeinst_id == null) {
      return res.send({ status: "error", statusCode: 400, message: "Institución no resuelta", rows: {} });
    }
    const instCinst = esAdmin ? null : cinstid;
    if (!esAdmin && instCinst == null) {
      return res.send({ status: "error", statusCode: 400, message: "Institución (SAE) no resuelta", rows: {} });
    }

    const destinatarios = await resolverAudiencia({
      audiencia,
      cinstid: instCinst,
      anolectivo: req.body.anolectivo,
    });
    if (!destinatarios.length) {
      return res.send({ status: "error", statusCode: 400, message: "La audiencia no tiene destinatarios con teléfono", rows: {} });
    }

    const r = await enviarMasivo(destinatarios, {
      idempresa: aeinst_id,
      tipo: req.body.tipo || 1,
      tipoMensaje: req.body.tipoMensaje || "text",
      payload: req.body.payload || { text: req.body.mensaje || "" },
      idreferencia: req.body.idreferencia || 0,
    });
    await auditar(req, "notificar", "success", {
      idempresa: aeinst_id, audiencia: req.body.audiencia?.tipo, total: r.total, enviados: r.enviados, bloqueados: r.bloqueados,
    });

    res.send({ status: "success", statusCode: 200, message: `${r.enviados} encolados, ${r.bloqueados} bloqueados`, rows: r });
  } catch (e) {
    console.log("whatsapp/notificar:", e.message);
    res.send({ status: "error", statusCode: 400, message: "No se pudo notificar", rows: {} });
  }
}

// Lista de instituciones (para que el Admin seleccione a quién notificar).
export async function instituciones(req, res) {
  try {
    const { esAdmin } = await alcance(req);
    if (!esAdmin) return res.send({ status: "error", statusCode: 403, message: "Solo el administrador", rows: [] });
    const r = await Db.query({
      text: `SELECT DISTINCT ON (i.aeinst_id)
                    i.aeinst_id, m.cinstid, i.aeinst_nombre AS nombre,
                    COALESCE(NULLIF(TRIM(t.cinsttele), ''), NULLIF(TRIM(i.aeinst_telefono), '')) AS telefono
             FROM contact.emisor e
             JOIN data.aeinstituciones i ON (i.aeinst_id = e.idempresa)
             LEFT JOIN migracion.map_institucion m ON (m.aeinst_id = i.aeinst_id)
             LEFT JOIN public.tabinst t ON (t.cinstid = m.cinstid)
             ORDER BY i.aeinst_id, m.cinstid`,
      values: [],
    });
    res.send({ status: "success", statusCode: 200, message: r.rows.length + " instituciones", rows: r.rows });
  } catch (e) {
    console.log("whatsapp/instituciones:", e.message);
    res.send({ status: "error", statusCode: 400, message: "No se pudo consultar", rows: [] });
  }
}

export default { enviar, validar, notificar, instituciones };
