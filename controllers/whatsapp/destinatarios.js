import Db from "../../database/conex.js";
import { aeinstIdDeCinstid } from "./envio.js";

/**
 * destinatarios.js — resuelve audiencias a una lista de destinatarios para WhatsApp.
 * Cada destinatario: { destino, personaTipo, personaId, aeestudiantes_id }.
 */

function aplanarAcudientes(rows) {
  const out = [];
  for (const est of rows || []) {
    const telefonos = (est.contactos && est.contactos[0]) || [];
    for (const tel of telefonos) {
      if (String(tel).length > 9) {
        out.push({
          destino: String(tel),
          personaTipo: "acudiente",
          personaId: est.idacudiente || null,
          aeestudiantes_id: est.aeestudiantes_id || 0,
        });
      }
    }
  }
  return out;
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
    const r = await Db.query({
      text: `SELECT * FROM engine.contacto_student_one($1, $2, $3);`,
      values: [anolectivo || null, cinstid, ids],
    });
    return aplanarAcudientes(r.rows);
  }

  if (tipo === "grupos") {
    const r = await Db.query({
      text: `SELECT * FROM engine.contacto_student($1, $2, $3);`,
      values: [anolectivo || null, cinstid, ids],
    });
    return aplanarAcudientes(r.rows);
  }

  // Todos los acudientes de la institución (avisos masivos, boletines).
  if (tipo === "todos") {
    const aeinst_id = await aeinstIdDeCinstid(cinstid);
    if (!aeinst_id) return [];
    const g = await Db.query({
      text: `SELECT DISTINCT aeasignaciones_grupo AS grupo
             FROM data.aeasignaciones
             WHERE aeinst_id = $1 ${anolectivo ? "AND aeanol_id = $2" : ""}`,
      values: anolectivo ? [aeinst_id, anolectivo] : [aeinst_id],
    });
    const grupos = g.rows.map((x) => x.grupo).filter(Boolean);
    if (!grupos.length) return [];
    const r = await Db.query({
      text: `SELECT * FROM engine.contacto_student($1, $2, $3);`,
      values: [anolectivo || null, cinstid, grupos],
    });
    return aplanarAcudientes(r.rows);
  }

  // Administrador: notificar a una o varias instituciones (teléfono institucional).
  if (tipo === "instituciones") {
    const r = await Db.query({
      text: `SELECT i.cinstid, i.cinstnomb AS nombre, i.cinsttele AS telefono, m.aeinst_id
             FROM public.tabinst i
             JOIN migracion.map_institucion m ON (m.cinstid = i.cinstid)
             WHERE i.cinstesta = 8
               AND i.cinsttele IS NOT NULL AND trim(i.cinsttele) <> ''
               ${ids.length ? "AND i.cinstid = ANY($1)" : ""}`,
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

export default { resolverAudiencia };
