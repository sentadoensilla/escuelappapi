import Db from "../../database/conex.js";
import sql from "./mensajes.sql.js";
import { alcance } from "./helpers.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
require("dotenv").config();

// Consulta de mensajes con filtros por columna, búsqueda, orden y paginación.
export async function mensajesConsultar(req, res) {
  try {
    const { esAdmin, aeinst_id } = await alcance(req);
    const b = req.body || {};

    const where = [];
    const values = [];
    let p = 1;

    if (!esAdmin) {
      // La institución solo ve SUS mensajes.
      if (aeinst_id == null) return res.send({ status: "error", statusCode: 400, message: "Institución no resuelta", rows: [] });
      values.push(aeinst_id); where.push(`l.idempresa = $${p++}`);
    } else if (b.idempresa) {
      values.push(parseInt(b.idempresa)); where.push(`l.idempresa = $${p++}`);
    }
    if (b.emisor) { values.push(String(b.emisor)); where.push(`l.emisor = $${p++}`); }
    if (b.status) { values.push(String(b.status)); where.push(`l.status = $${p++}`); }
    if (b.tipo) { values.push(parseInt(b.tipo)); where.push(`l.tipo = $${p++}`); }
    if (b.desde) { values.push(String(b.desde)); where.push(`l.fecharegistro >= $${p++}`); }
    if (b.hasta) { values.push(String(b.hasta)); where.push(`l.fecharegistro <= $${p++}`); }
    if (b.busqueda) { values.push(`%${String(b.busqueda)}%`); where.push(`(l.destino ILIKE $${p} OR l.emisor ILIKE $${p} OR l.lid ILIKE $${p})`); p++; }

    const whereSql = where.length ? " WHERE " + where.join(" AND ") : "";
    const orden = b.orden === "asc" ? "ASC" : "DESC";
    const limit = Math.min(parseInt(b.limit) || 50, 200);
    const offset = parseInt(b.offset) || 0;

    const consulta = sql.mensajesBase + whereSql + ` ORDER BY l.fecharegistro ${orden}, l.idlogenvios ${orden} LIMIT $${p++} OFFSET $${p++}`;
    values.push(limit, offset);

    const total = await Db.query({
      text: `SELECT COUNT(*) AS total FROM data.aelog_envios l` + whereSql,
      values: values.slice(0, values.length - 2),
    });

    const r = await Db.query({ text: consulta, values });
    res.send({
      status: "success", statusCode: 200,
      message: r.rows.length + " mensajes",
      rows: r.rows,
      total: parseInt(total.rows[0].total),
      limit, offset,
    });
  } catch (error) {
    console.log("mensajesConsultar:", error);
    res.send({ status: "error", statusCode: 400, message: "No se pudo consultar", rows: [] });
  }
}

// Mensajes enviados/fallidos por día (para el gráfico de la institución o global).
export async function mensajesEstadisticas(req, res) {
  try {
    const { esAdmin, aeinst_id } = await alcance(req);
    const dias = Math.min(parseInt(req.body.dias) || 14, 90);
    let r;
    if (esAdmin && !req.body.idempresa) {
      r = await Db.query({ text: sql.mensajesPorDiaGlobal, values: [String(dias)] });
    } else {
      const idempresa = esAdmin ? parseInt(req.body.idempresa) : aeinst_id;
      if (idempresa == null) return res.send({ status: "error", statusCode: 400, message: "Institución no resuelta", rows: [] });
      r = await Db.query({ text: sql.mensajesPorDiaInstitucion, values: [idempresa, String(dias)] });
    }
    res.send({ status: "success", statusCode: 200, message: r.rows.length + " días", rows: r.rows });
  } catch (error) {
    console.log("mensajesEstadisticas:", error);
    res.send({ status: "error", statusCode: 400, message: "No se pudieron consultar las estadísticas", rows: [] });
  }
}

export default { mensajesConsultar, mensajesEstadisticas };
