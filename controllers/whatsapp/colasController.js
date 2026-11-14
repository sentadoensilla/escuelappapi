import Db from "../../database/conex.js";
import token from "../../utils/token.js";
import sql from "./colas.sql.js";
import { alcance, auditar } from "./helpers.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
require("dotenv").config();

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

async function accionCola(req, res, accion, consulta, detalleAccion) {
  try {
    const idemisor = await emisorObjetivo(req);
    if (idemisor == null) return res.send({ status: "error", statusCode: 400, message: "Emisor no encontrado", rows: {} });
    await Db.query({ text: consulta, values: [idemisor] });
    await auditar(req, accion, "success", { idemisor });
    res.send({ status: "success", statusCode: 200, message: "Cola " + detalleAccion, rows: {} });
  } catch (error) {
    console.log(accion + ":", error);
    res.send({ status: "error", statusCode: 400, message: "No se pudo ejecutar la acción", rows: {} });
  }
}

export async function colaPausar(req, res) {
  return accionCola(req, res, "pausar", sql.colaPausar, "pausada (se conservan los mensajes)");
}
export async function colaReanudar(req, res) {
  return accionCola(req, res, "reanudar", sql.colaReanudar, "reanudada");
}
export async function colaDetener(req, res) {
  return accionCola(req, res, "detener", sql.colaDetener, "detenida (pendientes sin procesar)");
}

export async function colaEliminar(req, res) {
  try {
    const idemisor = await emisorObjetivo(req);
    if (idemisor == null) return res.send({ status: "error", statusCode: 400, message: "Emisor no encontrado", rows: {} });
    const e = await Db.query({ text: sql.idempresaDeEmisor, values: [idemisor] });
    if (!e.rows[0]) return res.send({ status: "error", statusCode: 400, message: "Emisor no encontrado", rows: {} });

    const r = await Db.query({ text: sql.colaEliminarPendientes, values: [e.rows[0].idempresa] });
    await auditar(req, "eliminar_cola", "success", { idemisor, cancelados: r.rows.length });
    res.send({ status: "success", statusCode: 200, message: r.rows.length + " mensajes en cola cancelados (historial conservado)", rows: { cancelados: r.rows.length } });
  } catch (error) {
    console.log("colaEliminar:", error);
    res.send({ status: "error", statusCode: 400, message: "No se pudo eliminar la cola", rows: {} });
  }
}

export default { colaPausar, colaReanudar, colaDetener, colaEliminar };
