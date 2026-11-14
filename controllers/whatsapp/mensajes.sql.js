// mensajes.sql.js — consulta de mensajes (outbox) con joins.
export const mensajesBase = `
  SELECT l.idlogenvios, l.idempresa, i.aeinst_nombre AS institucion, l.emisor, l.destino, l.destino_efectivo, l.lid,
         l.type, l.tipo, t.aetipoenvio_descripcion AS tipo_nombre, l.status,
         l.fecharegistro AS fecha_creacion, l.updated_at AS fecha_envio,
         l.attempts, l.last_error, l.enviosdetalles
  FROM data.aelog_envios l
  LEFT JOIN data.aeinstituciones i ON (i.aeinst_id = l.idempresa)
  LEFT JOIN data.aetipo_envio t ON (t.aetipoenvio_id = l.tipo)
`;

// Mensajes enviados/fallidos por día (últimos N días) — institución.
export const mensajesPorDiaInstitucion = `
  SELECT to_char(fecharegistro, 'YYYY-MM-DD') AS dia,
         COUNT(*) FILTER (WHERE status = 'sent')   AS enviados,
         COUNT(*) FILTER (WHERE status = 'failed') AS fallidos
  FROM data.aelog_envios
  WHERE idempresa = $1 AND fecharegistro >= now() - ($2 || ' days')::interval
  GROUP BY dia ORDER BY dia;`;

// Mensajes enviados/fallidos por día (últimos N días) — global (Admin).
export const mensajesPorDiaGlobal = `
  SELECT to_char(fecharegistro, 'YYYY-MM-DD') AS dia,
         COUNT(*) FILTER (WHERE status = 'sent')   AS enviados,
         COUNT(*) FILTER (WHERE status = 'failed') AS fallidos
  FROM data.aelog_envios
  WHERE fecharegistro >= now() - ($1 || ' days')::interval
  GROUP BY dia ORDER BY dia;`;

export default { mensajesBase, mensajesPorDiaInstitucion, mensajesPorDiaGlobal };
