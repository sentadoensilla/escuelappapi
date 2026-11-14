// mensajes.sql.js — consulta de mensajes (outbox) con joins.
// Resuelve el nombre del destinatario y su grupo a partir del teléfono:
// acudiente → estudiante (por teléfono) → estudiante (por id) → docente → institución.
export const mensajesBase = `
  SELECT l.idlogenvios, l.idempresa, i.aeinst_nombre AS institucion, l.emisor, l.destino, l.destino_efectivo, l.lid,
         l.type, l.tipo, t.aetipoenvio_descripcion AS tipo_nombre, l.status,
         l.fecharegistro AS fecha_creacion, l.updated_at AS fecha_envio,
         l.attempts, l.last_error, l.enviosdetalles,
         COALESCE(
           NULLIF(TRIM(CONCAT_WS(' ', ac.nombres, ac.apellidos)), ''),
           NULLIF(TRIM(CONCAT_WS(' ', et.nombres, et.apellidos)), ''),
           NULLIF(TRIM(CONCAT_WS(' ', est.aeestudiantes_nombres, est.aeestudiantes_apellidos)), ''),
           NULLIF(TRIM(CONCAT_WS(' ', doc.nombres, doc.apellidos)), ''),
           NULLIF(TRIM(i.aeinst_nombre), '')
         ) AS persona_nombre,
         COALESCE(est.aeestudiantes_grupo, ac.grupo, et.grupo) AS grupo
  FROM data.aelog_envios l
  LEFT JOIN data.aeinstituciones i ON (i.aeinst_id = l.idempresa)
  LEFT JOIN data.aeestudiantes est ON (est.aeestudiantes_id = l.aeestudiantes_id)
  LEFT JOIN LATERAL (
    SELECT a.aeestudiantes_nombresacudiente AS nombres,
           a.aeestudiantes_apellidosacudiente AS apellidos,
           e.aeestudiantes_grupo AS grupo
    FROM data.aeacudientes a
    LEFT JOIN data.aeestudiantes e ON (e.aeestudiantes_id = a.aeestudiantes_id)
    WHERE RIGHT(REGEXP_REPLACE(COALESCE(a.aeestudiantes_telefonoacudiente,''), '\\D', '', 'g'), 10)
        = RIGHT(REGEXP_REPLACE(COALESCE(l.destino,''), '\\D', '', 'g'), 10)
    LIMIT 1
  ) ac ON true
  LEFT JOIN LATERAL (
    SELECT e.aeestudiantes_nombres AS nombres,
           e.aeestudiantes_apellidos AS apellidos,
           e.aeestudiantes_grupo AS grupo
    FROM data.aeestudiantes e
    WHERE RIGHT(REGEXP_REPLACE(COALESCE(e.aeestudiantes_telefono,''), '\\D', '', 'g'), 10)
        = RIGHT(REGEXP_REPLACE(COALESCE(l.destino,''), '\\D', '', 'g'), 10)
    LIMIT 1
  ) et ON true
  LEFT JOIN LATERAL (
    SELECT d.aedocentes_nombres AS nombres,
           d.aedocentes_apellidos AS apellidos
    FROM data.aedocentes d
    WHERE RIGHT(REGEXP_REPLACE(COALESCE(d.aedocentes_telefono,''), '\\D', '', 'g'), 10)
        = RIGHT(REGEXP_REPLACE(COALESCE(l.destino,''), '\\D', '', 'g'), 10)
    LIMIT 1
  ) doc ON true
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
