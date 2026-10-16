import Db from "../../database/conex.js";
import token from "../../utils/token.js";
import crypto from "crypto";
import sql from "./vinculacion.sql.js";
import { alcance, auditar } from "./helpers.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
require("dotenv").config();

const TIPOS = ["estudiante", "acudiente", "docente"];

// Genera (o regenera) el código de vinculación de un solo uso y su enlace wa.me.
export async function vinculacionGenerar(req, res) {
  try {
    const { esAdmin, aeinst_id } = await alcance(req);
    if (esAdmin || aeinst_id == null) {
      return res.send({ status: "error", statusCode: 400, message: "La vinculación se genera desde una institución", rows: {} });
    }
    const persona_tipo = String(req.body.persona_tipo || "").toLowerCase();
    if (!TIPOS.includes(persona_tipo)) {
      return res.send({ status: "error", statusCode: 400, message: "Tipo de persona no válido", rows: {} });
    }
    const persona_id = parseInt(token.decriptar(req.body.persona_id || ""));
    if (isNaN(persona_id)) return res.send({ status: "error", statusCode: 400, message: "Persona no válida", rows: {} });

    const em = await Db.query({ text: sql.emisorDeInstitucion, values: [aeinst_id] });
    if (!em.rows[0]) return res.send({ status: "error", statusCode: 400, message: "La institución no tiene emisor vinculado", rows: {} });

    const codigo = crypto.randomBytes(5).toString("hex").toUpperCase(); // 10 hex, un solo uso
    const keyword = `ESC-${codigo}`;
    const waUrl = `https://wa.me/${em.rows[0].emisor}?text=${encodeURIComponent(keyword)}`;

    const origen = req.body.origen || "qr";
    const up = await Db.query({
      text: sql.vinculacionUpsert,
      values: [aeinst_id, em.rows[0].idemisor, persona_tipo, persona_id, keyword, origen],
    });

    await auditar(req, "vinculacion_generar", "success", { persona_tipo, persona_id, opt_codigo: keyword });

    res.send({
      status: "success", statusCode: 200, message: "Código de vinculación generado (expira en 15 min)",
      rows: { waUrl, codigo_activacion: keyword, estado: up.rows[0].estado },
    });
  } catch (error) {
    console.log("vinculacionGenerar:", error);
    res.send({ status: "error", statusCode: 400, message: "No se pudo generar la vinculación", rows: {} });
  }
}

export async function vinculacionEstado(req, res) {
  try {
    const { esAdmin, aeinst_id } = await alcance(req);
    const persona_tipo = String(req.body.persona_tipo || "").toLowerCase();
    const persona_id = parseInt(token.decriptar(req.body.persona_id || ""));
    const idempresa = esAdmin ? parseInt(req.body.idempresa || "0") : aeinst_id;
    if (isNaN(persona_id) || !TIPOS.includes(persona_tipo) || idempresa == null) {
      return res.send({ status: "error", statusCode: 400, message: "Parámetros inválidos", rows: {} });
    }
    const r = await Db.query({ text: sql.vinculacionPorPersona, values: [idempresa, persona_tipo, persona_id] });
    res.send({
      status: "success", statusCode: 200,
      message: r.rows.length ? "Vinculación encontrada" : "Sin vinculación",
      rows: r.rows[0] || {},
    });
  } catch (error) {
    console.log("vinculacionEstado:", error);
    res.send({ status: "error", statusCode: 400, message: "No se pudo consultar", rows: {} });
  }
}

export async function vinculacionRevocar(req, res) {
  try {
    const { esAdmin, aeinst_id } = await alcance(req);
    if (esAdmin) return res.send({ status: "error", statusCode: 400, message: "La revocación la hace la institución", rows: {} });
    const persona_tipo = String(req.body.persona_tipo || "").toLowerCase();
    const persona_id = parseInt(token.decriptar(req.body.persona_id || ""));
    if (isNaN(persona_id) || !TIPOS.includes(persona_tipo)) {
      return res.send({ status: "error", statusCode: 400, message: "Parámetros inválidos", rows: {} });
    }
    const r = await Db.query({ text: sql.vinculacionRevocar, values: [aeinst_id, persona_tipo, persona_id] });
    await auditar(req, "consentimiento_revocar", "success", { persona_tipo, persona_id });
    res.send({ status: "success", statusCode: 200, message: "Consentimiento revocado", rows: { revocado: r.rows.length > 0 } });
  } catch (error) {
    console.log("vinculacionRevocar:", error);
    res.send({ status: "error", statusCode: 400, message: "No se pudo revocar", rows: {} });
  }
}

export default { vinculacionGenerar, vinculacionEstado, vinculacionRevocar };
