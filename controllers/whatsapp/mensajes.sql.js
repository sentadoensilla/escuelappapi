// mensajes.sql.js — consulta de mensajes (outbox) con joins.
export const mensajesBase = `
  SELECT l.idlogenvios, l.idempresa, i.aeinst_nombre AS institucion, l.emisor, l.destino, l.lid,
         l.type, l.tipo, t.aetipoenvio_descripcion AS tipo_nombre, l.status,
         l.fecharegistro AS fecha_creacion, l.updated_at AS fecha_envio,
         l.attempts, l.last_error, l.enviosdetalles
  FROM data.aelog_envios l
  LEFT JOIN data.aeinstituciones i ON (i.aeinst_id = l.idempresa)
  LEFT JOIN data.aetipo_envio t ON (t.aetipoenvio_id = l.tipo)
`;

export default { mensajesBase };
