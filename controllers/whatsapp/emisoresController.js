import Db from "../../database/conex.js";
import token from "../../utils/token.js";
import sql from "./emisores.sql.js";
import { alcance, normalizarNumero, auditar } from "./helpers.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
require("dotenv").config();

/**
 * emisoresController.js — gestión de emisores/sesiones WhatsApp por institución.
 * La sesión Baileys real (QR/estado) la maneja apibaileys; aquí se persiste el emisor.
 */
export async function emisorListar(req, res) {
  try {
    const { esAdmin, aeinst_id } = await alcance(req);
    let resp;
    if (esAdmin) {
      resp = await Db.query({ text: sql.emisoresTodos, values: [] });
    } else {
      resp = await Db.query({ text: sql.emisorDeInstitucion, values: [aeinst_id] });
    }
    resp.rows.forEach((f) => { f.idregistro = token.encriptar(String(f.idemisor)); });
    res.send({ status: "success", statusCode: 200, message: resp.rows.length + " emisores", rows: resp.rows });
  } catch (error) {
    console.log("emisorListar:", error);
    res.send({ status: "error", statusCode: 400, message: "No se pudo consultar", rows: [] });
  }
}

// Vincula (registra) el número del emisor de la institución y su configuración por defecto.
export async function emisorVincular(req, res) {
  try {
    const { esAdmin, aeinst_id } = await alcance(req);
    if (esAdmin) {
      return res.send({ status: "error", statusCode: 400, message: "La vinculación del emisor la realiza la institución (no el administrador).", rows: {} });
    }
    if (aeinst_id == null) {
      return res.send({ status: "error", statusCode: 400, message: "No se pudo resolver la institución de Escuelapp para tu cuenta (falta el vínculo institución SAE ↔ Escuelapp). Contacta al administrador.", rows: {} });
    }
    const numero = normalizarNumero(req.body.numero || req.body.emisor);
    if (!/^\d{10,15}$/.test(numero)) {
      return res.send({ status: "error", statusCode: 400, message: "Número de WhatsApp no válido", rows: {} });
    }

    const b = req.body;
    const base = parseInt(b.base_delay) || 700;
    const jitter = parseInt(b.jitter) || 400;
    const burst = parseInt(b.burst_limit) || 5;
    const burstPause = parseInt(b.burst_pause) || 3000;
    const conc = parseInt(b.concurrency) || 1;

    const ups = await Db.query({ text: sql.emisorUpsert, values: [aeinst_id, numero, 1, null] });
    const idemisor = ups.rows[0].idemisor;
    await Db.query({ text: sql.emisorConfigUpsert, values: [idemisor, aeinst_id, base, jitter, burst, burstPause, conc] });

    await auditar(req, "vincular", "success", { idemisor, numero });

    res.send({
      status: "success", statusCode: 200, message: "Emisor vinculado. Escanea el QR para conectar la sesión.",
      rows: { idregistro: token.encriptar(String(idemisor)), numero },
    });
  } catch (error) {
    console.log("emisorVincular:", error);
    res.send({ status: "error", statusCode: 400, message: "No se pudo vincular el emisor", rows: {} });
  }
}

// Devuelve el QR vigente (guardado por apibaileys en contact.sessions.last_qr) si existe.
export async function emisorQr(req, res) {
  try {
    const { esAdmin, aeinst_id } = await alcance(req);
    const resp = await Db.query({
      text: `SELECT s.last_qr, s.status FROM contact.sessions s
             JOIN contact.emisor e ON (e.emisor = s.id)
             WHERE e.idempresa = $1 ORDER BY s.updated_at DESC LIMIT 1`,
      values: [esAdmin ? req.body.idempresa : aeinst_id],
    });
    const r = resp.rows[0];
    if (!r || !r.last_qr) {
      return res.send({ status: "error", statusCode: 400, message: "QR no disponible. Inicia la conexión de la sesión.", rows: {} });
    }
    res.send({ status: "success", statusCode: 200, message: "QR", rows: { qr: r.last_qr, estado_sesion: r.status } });
  } catch (error) {
    console.log("emisorQr:", error);
    res.send({ status: "error", statusCode: 400, message: "No se pudo obtener el QR", rows: {} });
  }
}

// Elimina el emisor (y su sesión/config), conservando el historial de mensajes.
export async function emisorEliminar(req, res) {
  try {
    const { esAdmin, aeinst_id } = await alcance(req);
    const idemisor = parseInt(token.decriptar(req.body.idregistro || req.body.idemisor || ""));
    if (isNaN(idemisor)) return res.send({ status: "error", statusCode: 400, message: "Emisor no válido", rows: {} });

    const e = await Db.query({
      text: "SELECT emisor FROM contact.emisor WHERE idemisor = $1" + (esAdmin ? "" : " AND idempresa = $2"),
      values: esAdmin ? [idemisor] : [idemisor, aeinst_id],
    });
    if (!e.rows[0]) return res.send({ status: "error", statusCode: 400, message: "Emisor no encontrado", rows: {} });

    const numero = e.rows[0].emisor;
    await Db.query({ text: sql.authEliminar, values: [numero] });
    await Db.query({ text: sql.sesionEliminar, values: [numero] });
    await Db.query({ text: sql.configEliminar, values: [idemisor] });
    await Db.query({ text: sql.emisorEliminar, values: [idemisor] });

    await auditar(req, "eliminar_emisor", "success", { idemisor, numero });
    res.send({ status: "success", statusCode: 200, message: "Emisor eliminado", rows: {} });
  } catch (error) {
    console.log("emisorEliminar:", error);
    res.send({ status: "error", statusCode: 400, message: "No se pudo eliminar el emisor", rows: {} });
  }
}

export default { emisorListar, emisorVincular, emisorQr, emisorEliminar };
