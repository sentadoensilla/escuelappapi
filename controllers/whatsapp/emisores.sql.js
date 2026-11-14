// emisores.sql.js — consultas del módulo de emisores/sesiones WhatsApp.
export const emisorDeInstitucion = `
  SELECT e.idemisor, e.emisor AS numero, e.estado, e.token, e.fecharegistro,
         s.status AS estado_sesion, s.device_name, s.last_qr, s.last_error, s.updated_at AS ultima_actividad,
         c.paused, c.stopped, c.modo_prueba, c.test_phone,
         c.base_delay, c.jitter, c.burst_limit, c.burst_pause, c.concurrency
  FROM contact.emisor e
  LEFT JOIN contact.sessions s ON (s.id = e.emisor)
  LEFT JOIN contact.emisor_config c ON (c.idemisor = e.idemisor)
  WHERE e.idempresa = $1
  ORDER BY e.idemisor;`;

export const emisoresTodos = `
  SELECT e.idemisor, e.idempresa, i.aeinst_nombre AS institucion, e.emisor AS numero,
         e.estado, e.fecharegistro,
         s.status AS estado_sesion, s.updated_at AS ultima_actividad,
         c.paused, c.stopped,
         (SELECT COUNT(*) FROM data.aelog_envios l WHERE l.idempresa = e.idempresa AND l.status = 'pending') AS pendientes,
         (SELECT COUNT(*) FROM data.aelog_envios l WHERE l.idempresa = e.idempresa AND l.status = 'sent') AS enviados,
         (SELECT COUNT(*) FROM data.aelog_envios l WHERE l.idempresa = e.idempresa AND l.status = 'failed') AS fallidos
  FROM contact.emisor e
  LEFT JOIN data.aeinstituciones i ON (i.aeinst_id = e.idempresa)
  LEFT JOIN contact.sessions s ON (s.id = e.emisor)
  LEFT JOIN contact.emisor_config c ON (c.idemisor = e.idemisor)
  ORDER BY i.aeinst_nombre;`;

export const emisorUpsert = `
  INSERT INTO contact.emisor (idemisor, fecharegistro, estado, idempresa, emisor, token)
  VALUES ((SELECT COALESCE(MAX(idemisor)+1, 1) FROM contact.emisor), CURRENT_TIMESTAMP, $3, $1, $2, $4)
  ON CONFLICT (idempresa) DO UPDATE
    SET emisor = EXCLUDED.emisor, estado = EXCLUDED.estado, token = EXCLUDED.token, fecharegistro = CURRENT_TIMESTAMP
  RETURNING idemisor;`;

export const emisorConfigUpsert = `
  INSERT INTO contact.emisor_config (idemisor, idempresa, base_delay, jitter, burst_limit, burst_pause, concurrency)
  VALUES ($1, $2, $3, $4, $5, $6, $7)
  ON CONFLICT (idemisor) DO UPDATE SET
    idempresa = EXCLUDED.idempresa, base_delay = EXCLUDED.base_delay, jitter = EXCLUDED.jitter,
    burst_limit = EXCLUDED.burst_limit, burst_pause = EXCLUDED.burst_pause, concurrency = EXCLUDED.concurrency
  RETURNING idemisor;`;

export const emisorEliminar = `DELETE FROM contact.emisor WHERE idemisor = $1;`;
export const configEliminar = `DELETE FROM contact.emisor_config WHERE idemisor = $1;`;
export const authEliminar = `DELETE FROM contact.whatsapp_auth WHERE session_id = $1;`;
export const sesionEliminar = `DELETE FROM contact.sessions WHERE id = $1;`;

export default {
  emisorDeInstitucion, emisoresTodos, emisorUpsert, emisorConfigUpsert,
  emisorEliminar, configEliminar, authEliminar, sesionEliminar,
};
