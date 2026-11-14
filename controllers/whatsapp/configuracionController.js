import Db from "../../database/conex.js";
import token from "../../utils/token.js";
import sql from "./configuracion.sql.js";
import { alcance, auditar } from "./helpers.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
require("dotenv").config();

// Resuelve el idemisor objetivo: Admin usa req.body.idemisor; Institución el suyo.
async function emisorObjetivo(req) {
  const { esAdmin, aeinst_id } = await alcance(req);
  if (esAdmin) {
    const id = parseInt(token.decriptar(req.body.idemisor || req.body.idregistro || ""));
    return isNaN(id) ? null : id;
  }
  if (aeinst_id == null) return null;
  const r = await Db.query({ text: sql.emisorIdDeInstitucion, values: [aeinst_id] });
  return r.rows[0]?.idemisor ?? null;
}

export async function configConsultar(req, res) {
  try {
    const idemisor = await emisorObjetivo(req);
    if (idemisor == null) return res.send({ status: "error", statusCode: 400, message: "Emisor no encontrado", rows: {} });
    const r = await Db.query({ text: sql.configConsultar, values: [idemisor] });
    res.send({ status: "success", statusCode: 200, message: "Configuración", rows: r.rows });
  } catch (error) {
    console.log("configConsultar:", error);
    res.send({ status: "error", statusCode: 400, message: "No se pudo consultar", rows: [] });
  }
}

export async function configActualizar(req, res) {
  try {
    const idemisor = await emisorObjetivo(req);
    if (idemisor == null) return res.send({ status: "error", statusCode: 400, message: "Emisor no encontrado", rows: {} });

    const b = req.body;
    const base = parseInt(b.base_delay);
    const jitter = parseInt(b.jitter);
    const burst = parseInt(b.burst_limit);
    const burstPause = parseInt(b.burst_pause);
    const conc = parseInt(b.concurrency);
    if ([base, jitter, burst, burstPause, conc].some((v) => isNaN(v) || v < 0)) {
      return res.send({ status: "error", statusCode: 400, message: "Parámetros de velocidad inválidos", rows: {} });
    }
    const modo = b.modo_prueba === true || b.modo_prueba === "true" || b.modo_prueba === 1;
    const testPhone = b.test_phone ? String(b.test_phone).trim() : null;
    let usuarioId = null;
    try { usuarioId = parseInt(token.decriptar(req.user?.usuarioId || "")); } catch (e) { usuarioId = null; }

    await Db.query({ text: sql.configActualizar, values: [idemisor, base, jitter, burst, burstPause, conc, modo, testPhone, usuarioId] });
    await auditar(req, "configurar", "success", { idemisor, base, jitter, burst, burstPause, conc, modo, testPhone });

    res.send({ status: "success", statusCode: 200, message: "Configuración actualizada", rows: {} });
  } catch (error) {
    console.log("configActualizar:", error);
    res.send({ status: "error", statusCode: 400, message: "No se pudo actualizar", rows: {} });
  }
}

// Activa/desactiva el modo de pruebas (con auditoría).
export async function pruebasCambiar(req, res) {
  try {
    const idemisor = await emisorObjetivo(req);
    if (idemisor == null) return res.send({ status: "error", statusCode: 400, message: "Emisor no encontrado", rows: {} });

    const activar = String(req.body.activar ?? "").toLowerCase() === "true" || req.body.activar === 1 || req.body.activar === "1";
    const testPhone = activar ? String(req.body.test_phone || "").trim() : null;
    if (activar && !/^\d{10,15}$/.test(testPhone)) {
      return res.send({ status: "error", statusCode: 400, message: "Indica un número de pruebas autorizado", rows: {} });
    }
    let usuarioId = null;
    try { usuarioId = parseInt(token.decriptar(req.user?.usuarioId || "")); } catch (e) { usuarioId = null; }

    await Db.query({ text: sql.configPruebas, values: [idemisor, activar, testPhone, usuarioId] });
    await auditar(req, activar ? "pruebas_activar" : "pruebas_desactivar", "success", { idemisor, testPhone });

    res.send({ status: "success", statusCode: 200, message: activar ? "Modo de pruebas activado" : "Modo de pruebas desactivado", rows: {} });
  } catch (error) {
    console.log("pruebasCambiar:", error);
    res.send({ status: "error", statusCode: 400, message: "No se pudo cambiar el modo de pruebas", rows: {} });
  }
}

export default { configConsultar, configActualizar, pruebasCambiar };
