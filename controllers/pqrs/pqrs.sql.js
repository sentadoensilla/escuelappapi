export const tiposolicitudListar = `
        SELECT aepqr_tiposolicitud_id AS idregistro, aepqr_tiposolicitud_descripcion AS descripcion,
               aepqr_tiposolicitud_vencimiento AS vencimiento
        FROM data.aepqr_tiposolicitud
        ORDER BY aepqr_tiposolicitud_descripcion;`;
export const tiposolicitudRegistrar = `
        INSERT INTO data.aepqr_tiposolicitud
            (aepqr_tiposolicitud_id, aepqr_tiposolicitud_descripcion, aepqr_tiposolicitud_vencimiento)
        VALUES ((SELECT COALESCE(MAX(aepqr_tiposolicitud_id)+1, 1) FROM data.aepqr_tiposolicitud), $1, $2)
        RETURNING aepqr_tiposolicitud_id AS idregistro;`;
export const tiposolicitudActualizar = `
        UPDATE data.aepqr_tiposolicitud
        SET aepqr_tiposolicitud_descripcion=$2, aepqr_tiposolicitud_vencimiento=$3
        WHERE aepqr_tiposolicitud_id=$1
        RETURNING aepqr_tiposolicitud_id AS idregistro;`;
export const tiposolicitudBorrar = `
        DELETE FROM data.aepqr_tiposolicitud WHERE aepqr_tiposolicitud_id=$1 RETURNING aepqr_tiposolicitud_id AS idregistro;`;
export const pqrListar = `
        SELECT p.aepqr_id AS idregistro, p.aepqr_fecha AS fecha, p.aepqr_nombre AS nombre,
               p.aepqr_telefono AS telefono, p.aepqr_email AS email, p.aepqr_usuario AS idusuario,
               p.aepqr_tiposolicitud_id AS idtiposolicitud, p.aepqr_contenido AS contenido,
               p.aeinst_id AS idinstitucion, p.aepqr_adjunto AS adjunto, p.aeano_id AS idano,
               p.aeestados_id AS idestado, t.aepqr_tiposolicitud_descripcion AS tiposolicitud,
               s.aeestados_descripcion AS estado
        FROM data.aepqr p
        LEFT JOIN data.aepqr_tiposolicitud t ON (t.aepqr_tiposolicitud_id = p.aepqr_tiposolicitud_id)
        LEFT JOIN data.aeestados s ON (s.aeestados_id = p.aeestados_id)
        WHERE ($1::integer IS NULL OR p.aeinst_id = $1)
        ORDER BY p.aepqr_fecha DESC;`;
export const pqrRegistrar = `
        INSERT INTO data.aepqr
            (aepqr_id, aepqr_fecha, aepqr_nombre, aepqr_telefono, aepqr_email, aepqr_usuario,
             aepqr_tiposolicitud_id, aepqr_contenido, aeinst_id, aepqr_adjunto, aeano_id, aeestados_id)
        VALUES ((SELECT COALESCE(MAX(aepqr_id)+1, 1) FROM data.aepqr), CURRENT_TIMESTAMP,
             $1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING aepqr_id AS idregistro;`;
export const pqrActualizar = `
        UPDATE data.aepqr
        SET aepqr_nombre=$2, aepqr_telefono=$3, aepqr_email=$4, aepqr_tiposolicitud_id=$5,
            aepqr_contenido=$6, aepqr_adjunto=$7, aeestados_id=$8
        WHERE aepqr_id=$1
        RETURNING aepqr_id AS idregistro;`;
export const pqrBorrar = `
        UPDATE data.aepqr SET aeestados_id=$2 WHERE aepqr_id=$1 RETURNING aepqr_id AS idregistro;`;
export const respuestaListar = `
        SELECT r.aepqr_respuesta_id AS idregistro, r.aepqr_id AS idpqr,
               r.aepqr_respuesta_mensaje AS mensaje, r.aepqr_respuesta_fecha AS fecha,
               r.aepqr_respuesta_adjunto AS adjunto
        FROM data.aepqr_respuesta r
        WHERE ($1::integer IS NULL OR r.aepqr_id = $1)
        ORDER BY r.aepqr_respuesta_fecha;`;
export const respuestaRegistrar = `
        INSERT INTO data.aepqr_respuesta
            (aepqr_respuesta_id, aepqr_id, aepqr_respuesta_mensaje, aepqr_respuesta_fecha, aepqr_respuesta_adjunto)
        VALUES ((SELECT COALESCE(MAX(aepqr_respuesta_id)+1, 1) FROM data.aepqr_respuesta),
             $1, $2, CURRENT_TIMESTAMP, $3)
        RETURNING aepqr_respuesta_id AS idregistro;`;
export const respuestaActualizar = `
        UPDATE data.aepqr_respuesta
        SET aepqr_respuesta_mensaje=$2, aepqr_respuesta_adjunto=$3
        WHERE aepqr_respuesta_id=$1
        RETURNING aepqr_respuesta_id AS idregistro;`;
export const respuestaBorrar = `
        DELETE FROM data.aepqr_respuesta WHERE aepqr_respuesta_id=$1 RETURNING aepqr_respuesta_id AS idregistro;`;
export default {
  tiposolicitudListar: tiposolicitudListar,
  tiposolicitudRegistrar: tiposolicitudRegistrar,
  tiposolicitudActualizar: tiposolicitudActualizar,
  tiposolicitudBorrar: tiposolicitudBorrar,
  pqrListar: pqrListar,
  pqrRegistrar: pqrRegistrar,
  pqrActualizar: pqrActualizar,
  pqrBorrar: pqrBorrar,
  respuestaListar: respuestaListar,
  respuestaRegistrar: respuestaRegistrar,
  respuestaActualizar: respuestaActualizar,
  respuestaBorrar: respuestaBorrar
};
/**
 * pqrs.sql.js
 * Sentencias SQL del módulo PQRS de Escuelapp (data.aepqr, data.aepqr_respuesta,
 * data.aepqr_tiposolicitud).
 */
