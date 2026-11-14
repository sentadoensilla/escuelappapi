import Db from "../../database/conex.js";
import { aeinstIdDeCinstid } from "./envio.js";

/**
 * destinatarios.js — resuelve audiencias a una lista de destinatarios para WhatsApp.
 * Cada destinatario: { destino, personaTipo, personaId, aeestudiantes_id }.
 */

// `engine.contacto_student*` devuelve `contactos` como CSV:
// "telEstudiante,telAcudiente,telEstudiante,telAcudiente,...".
export function telefonosDeContactos(contactos) {
  const crudos = Array.isArray(contactos)
    ? contactos.flat(Infinity)
    : String(contactos || "").split(",");
  const tels = [];
  for (const c of crudos) {
    const t = String(c ?? "").trim();
    if (t && t.replace(/\D/g, "").length > 9) tels.push(t);
  }
  return [...new Set(tels)];
}

/**
 * Destinatarios (acudiente y/o estudiante) por institución/año, con filtros de
 * grupo o de estudiantes. Consulta directa: la función engine.contacto_student
 * pierde el contacto cuando falta uno de los dos teléfonos.
 */
async function acudientesDeEstudiantes({ aeinst_id, ano, grupos = null, ids = null }) {
  const filtros = [];
  const values = [aeinst_id, ano];
  let p = 3;
  if (grupos && grupos.length) {
    values.push(grupos.map(String));
    filtros.push(`string_to_array(e.aeestudiantes_grupo, ',') && $${p++}::text[]`);
  }
  if (ids && ids.length) {
    const enteros = ids.map((x) => parseInt(x)).filter((x) => Number.isFinite(x));
    if (enteros.length) {
      values.push(enteros);
      filtros.push(`e.aeestudiantes_id = ANY($${p++}::int[])`);
    }
  }

  const r = await Db.query({
    text: `SELECT e.aeestudiantes_id,
                  COALESCE(NULLIF(TRIM(e.aeestudiantes_telefono), ''), '') AS tel_estudiante,
                  COALESCE(NULLIF(TRIM(a.aeestudiantes_telefonoacudiente), ''), '') AS tel_acudiente
           FROM data.aeestudiantes e
           LEFT JOIN data.aeacudientes a ON (a.aeestudiantes_id = e.aeestudiantes_id)
           WHERE e.aeinstitucion_id = $1 AND e.aeano_id = $2
             AND e.aeestudiantes_estado = 1
             ${filtros.length ? "AND " + filtros.join(" AND ") : ""}
           ORDER BY e.aeestudiantes_id`,
    values,
  });

  const out = [];
  const vistos = new Set();
  for (const row of r.rows) {
    for (const tel of [row.tel_acudiente, row.tel_estudiante]) {
      const t = String(tel || "").trim();
      if (t.replace(/\D/g, "").length <= 9) continue;
      const key = `${row.aeestudiantes_id}|${t}`;
      if (vistos.has(key)) continue;
      vistos.add(key);
      out.push({
        destino: t,
        personaTipo: "acudiente",
        personaId: null,
        aeestudiantes_id: row.aeestudiantes_id || 0,
      });
    }
  }
  return out;
}

function aplanarAcudientes(rows) {
  const out = [];
  const vistos = new Set();
  for (const est of rows || []) {
    for (const tel of telefonosDeContactos(est.contactos)) {
      const key = `${est.aeestudiantes_id || 0}|${tel}`;
      if (vistos.has(key)) continue;
      vistos.add(key);
      out.push({
        destino: tel,
        personaTipo: "acudiente",
        personaId: null,
        aeestudiantes_id: est.aeestudiantes_id || 0,
      });
    }
  }
  return out;
}

// Año lectivo: el JWT trae `canolid` (SAE) pero `data.aeano` usa `aeano_id`.
// Se intenta directo, luego por descripción (2021 → 2021-2022) y, como último
// recurso, el último año con estudiantes de la institución.
export async function aeanoIdDe(anolectivo, aeinst_id) {
  if (!anolectivo) {
    const u = await Db.query({
      text: "SELECT MAX(aeano_id) AS aeano_id FROM data.aeestudiantes WHERE aeinstitucion_id = $1",
      values: [aeinst_id],
    });
    return u.rows[0]?.aeano_id || null;
  }
  const directo = await Db.query({
    text: "SELECT aeano_id FROM data.aeano WHERE aeano_id = $1 LIMIT 1",
    values: [anolectivo],
  });
  if (directo.rows[0]) return parseInt(anolectivo);

  const y = await Db.query({
    text: "SELECT canoldesc FROM public.tabanol WHERE canolid = $1 LIMIT 1",
    values: [anolectivo],
  });
  const desc = y.rows[0]?.canoldesc;
  if (desc) {
    const m = await Db.query({
      text: `SELECT aeano_id FROM data.aeano
             WHERE aeano_descripcion = $1 OR aeano_descripcion LIKE $1 || '-%'
             ORDER BY aeano_id DESC LIMIT 1`,
      values: [desc],
    });
    if (m.rows[0]) return m.rows[0].aeano_id;
  }

  const u = await Db.query({
    text: "SELECT MAX(aeano_id) AS aeano_id FROM data.aeestudiantes WHERE aeinstitucion_id = $1",
    values: [aeinst_id],
  });
  return u.rows[0]?.aeano_id || null;
}

/**
 * @param {object} p { audiencia:{tipo:'docentes'|'estudiantes'|'grupos', ids:[]}, cinstid, anolectivo }
 * @returns {Promise<Array<{destino,personaTipo,personaId,aeestudiantes_id}>>}
 */
export async function resolverAudiencia({ audiencia, cinstid, anolectivo }) {
  const tipo = audiencia?.tipo;
  const ids = Array.isArray(audiencia?.ids) ? audiencia.ids : [];
  if (!cinstid || !tipo) return [];

  if (tipo === "docentes") {
    const r = await Db.query({
      text: `SELECT d.cdoceid AS personaid, d.cdocecelu AS telefono
             FROM public.tabdoce d
             JOIN public.tabinstdoce ti ON (ti.cdoceid = d.cdoceid)
             WHERE ti.cinstid = $1 AND ti.cinstdoceesta = 8 AND d.cdoceesta = 8
               AND d.cdocecelu IS NOT NULL AND trim(d.cdocecelu) <> ''
               ${anolectivo ? "AND ti.canolid = $2" : ""}`,
      values: anolectivo ? [cinstid, anolectivo] : [cinstid],
    });
    return r.rows.map((x) => ({
      destino: String(x.telefono),
      personaTipo: "docente",
      personaId: x.personaid,
      aeestudiantes_id: 0,
    }));
  }

  if (tipo === "estudiantes") {
    const aeinst_id = await aeinstIdDeCinstid(cinstid);
    if (!aeinst_id) return [];
    const ano = await aeanoIdDe(anolectivo, aeinst_id);
    return acudientesDeEstudiantes({ aeinst_id, ano, ids });
  }

  if (tipo === "grupos") {
    const aeinst_id = await aeinstIdDeCinstid(cinstid);
    if (!aeinst_id) return [];
    const ano = await aeanoIdDe(anolectivo, aeinst_id);
    return acudientesDeEstudiantes({ aeinst_id, ano, grupos: ids });
  }

  // Todos los acudientes de la institución (avisos masivos, boletines).
  if (tipo === "todos") {
    const aeinst_id = await aeinstIdDeCinstid(cinstid);
    if (!aeinst_id) return [];
    const ano = await aeanoIdDe(anolectivo, aeinst_id);
    return acudientesDeEstudiantes({ aeinst_id, ano });
  }

  // Administrador: notificar a una o varias instituciones (teléfono institucional).
  // Prefiere el teléfono del SAE (tabinst.cinsttele) y, si no existe, el de aeinstituciones.
  if (tipo === "instituciones") {
    const r = await Db.query({
      text: `SELECT DISTINCT ON (i.aeinst_id)
                    i.aeinst_id, i.aeinst_nombre AS nombre, m.cinstid,
                    COALESCE(NULLIF(TRIM(t.cinsttele), ''), NULLIF(TRIM(i.aeinst_telefono), '')) AS telefono
             FROM contact.emisor e
             JOIN data.aeinstituciones i ON (i.aeinst_id = e.idempresa)
             LEFT JOIN migracion.map_institucion m ON (m.aeinst_id = i.aeinst_id)
             LEFT JOIN public.tabinst t ON (t.cinstid = m.cinstid)
             WHERE COALESCE(NULLIF(TRIM(t.cinsttele), ''), NULLIF(TRIM(i.aeinst_telefono), '')) IS NOT NULL
               ${ids.length ? "AND m.cinstid = ANY($1)" : ""}
             ORDER BY i.aeinst_id, m.cinstid`,
      values: ids.length ? [ids] : [],
    });
    return r.rows.map((x) => ({
      idempresa: x.aeinst_id,
      destino: String(x.telefono),
      personaTipo: "institucion",
      personaId: x.cinstid,
    }));
  }

  return [];
}

export default { resolverAudiencia, telefonosDeContactos, aeanoIdDe };
