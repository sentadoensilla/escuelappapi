import Db from "../../database/conex.js";
import token from "../../utils/token.js";

/**
 * helpers.js — utilidades del módulo WhatsApp.
 * Derivación de alcance institucional desde el JWT (nunca del frontend),
 * guardas de rol y auditoría.
 */

export function rolDe(req) {
  try {
    const r = parseInt(token.decriptar(req.user?.usuarioRollId || ""));
    return isNaN(r) ? null : r;
  } catch (e) {
    return null;
  }
}

// Resuelve { rol, esAdmin, aeinst_id, cinstid } para el usuario autenticado.
// El emisor se liga a `aeinst_id` (data.aeinstituciones); el JWT trae `cinstid`
// (SAE), que se mapea con migracion.map_institucion.
export async function alcance(req) {
  const rol = rolDe(req);
  const esAdmin = rol === 0;
  if (esAdmin) return { rol, esAdmin, aeinst_id: null, cinstid: null };

  let cinstid = null;
  try {
    cinstid = parseInt(token.decriptar(req.user?.usuarioEmpresaId || ""));
    if (isNaN(cinstid)) cinstid = null;
  } catch (e) {
    cinstid = null;
  }
  if (cinstid == null) return { rol, esAdmin, aeinst_id: null, cinstid };

  const r = await Db.query({
    text: "SELECT aeinst_id FROM migracion.map_institucion WHERE cinstid = $1",
    values: [cinstid],
  });
  return { rol, esAdmin, aeinst_id: r.rows[0]?.aeinst_id ?? null, cinstid };
}

// Guarda de rol: solo Administrador (0) o Institución (3).
export function whatsappGuard(req, res, next) {
  const rol = rolDe(req);
  if (rol === 0 || rol === 3) return next();
  return res.send({ status: "Unauthorized", statusCode: 401, message: "No tienes autorización para gestionar WhatsApp" });
}

// Guarda de rol: solo Administrador (0).
export function adminGuard(req, res, next) {
  const rol = rolDe(req);
  if (rol === 0) return next();
  return res.send({ status: "Unauthorized", statusCode: 401, message: "Solo el administrador puede realizar esta acción" });
}

// Normaliza un número a formato internacional E.164 (Colombia por defecto).
// "3001234567" -> "573001234567"; conserva '+' si viene con él.
export function normalizarNumero(numero) {
  if (numero == null) return "";
  let n = String(numero).trim().replace(/[^0-9+]/g, "");
  if (n.startsWith("+")) n = n.slice(1);
  if (/^57\d{10}$/.test(n)) return n;              // ya en 12 dígitos (57 + 10)
  if (/^57\d{8}$/.test(n)) return n;               // fijos/otros (se conserva)
  if (/^\d{10}$/.test(n)) return "57" + n;         // 10 dígitos local CO
  return n;
}

export async function auditar(req, accion, resultado, detalle) {
  try {
    const { aeinst_id } = await alcance(req);
    let usuarioId = null;
    try { usuarioId = parseInt(token.decriptar(req.user?.usuarioId || "")); } catch (e) { usuarioId = null; }
    await Db.query({
      text: `INSERT INTO contact.auditoria_whatsapp (idempresa, idemisor, usuario_id, accion, resultado, detalle)
             VALUES ($1, $2, $3, $4, $5, $6)`,
      values: [aeinst_id, detalle?.idemisor ?? null, usuarioId, accion, resultado, JSON.stringify(detalle || {})],
    });
  } catch (e) {
    console.log("auditar (whatsapp):", e.message);
  }
}
