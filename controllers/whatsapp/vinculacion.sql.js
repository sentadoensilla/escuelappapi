// vinculacion.sql.js — vinculación de personas + LID + consentimiento.
export const emisorDeInstitucion = `SELECT e.emisor, e.idemisor FROM contact.emisor e WHERE e.idempresa = $1 LIMIT 1;`;

export const vinculacionUpsert = `
  INSERT INTO contact.vinculacion_whatsapp
    (idempresa, idemisor, persona_tipo, persona_id, opt_codigo, opt_codigo_expires_at, estado, consentimiento_origen, created_at)
  VALUES ($1, $2, $3, $4, $5, NOW() + interval '15 minutes', 'PENDING', $6, now())
  ON CONFLICT (idempresa, persona_tipo, persona_id) DO UPDATE SET
    opt_codigo = EXCLUDED.opt_codigo,
    opt_codigo_expires_at = EXCLUDED.opt_codigo_expires_at,
    updated_at = now()
  RETURNING id, opt_codigo, opt_codigo_expires_at, estado;`;

export const vinculacionPorPersona = `
  SELECT id, idempresa, idemisor, persona_tipo, persona_id, telefono, telefono_norm, jid, lid,
         estado, consentimiento_version, consentimiento_fecha, consentimiento_origen,
         verificado_at, opt_codigo, opt_codigo_expires_at, updated_at
  FROM contact.vinculacion_whatsapp
  WHERE idempresa = $1 AND persona_tipo = $2 AND persona_id = $3;`;

export const vinculacionRevocar = `
  UPDATE contact.vinculacion_whatsapp SET estado = 'REVOKED', updated_at = now()
  WHERE idempresa = $1 AND persona_tipo = $2 AND persona_id = $3
  RETURNING id;`;

export default { emisorDeInstitucion, vinculacionUpsert, vinculacionPorPersona, vinculacionRevocar };
