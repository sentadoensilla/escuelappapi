export const ayudaListar = `
        SELECT aeayuda_id AS idregistro, aeayuda_para AS par, aeayuda_estado AS idestado,
               aeayuda_tipointerface AS tipointerface, aeayuda_titulo AS titulo,
               aeayuda_enlace AS enlace, aeayuda_descripcion AS descripcion,
               aeayuda_version AS version, aeayuda_vistas AS vistas
        FROM data.aeayuda
        ORDER BY aeayuda_titulo;`;
export const ayudaRegistrar = `
        INSERT INTO data.aeayuda
            (aeayuda_id, aeayuda_para, aeayuda_estado, aeayuda_tipointerface, aeayuda_titulo,
             aeayuda_enlace, aeayuda_descripcion, aeayuda_version, aeayuda_vistas)
        VALUES ((SELECT COALESCE(MAX(aeayuda_id)+1, 1) FROM data.aeayuda),
             $1, $2, $3, $4, $5, $6, $7, 0)
        RETURNING aeayuda_id AS idregistro;`;
export const ayudaActualizar = `
        UPDATE data.aeayuda
        SET aeayuda_para=$2, aeayuda_estado=$3, aeayuda_tipointerface=$4, aeayuda_titulo=$5,
            aeayuda_enlace=$6, aeayuda_descripcion=$7, aeayuda_version=$8, aeayuda_vistas=$9
        WHERE aeayuda_id=$1
        RETURNING aeayuda_id AS idregistro;`;
export const ayudaBorrar = `
        UPDATE data.aeayuda SET aeayuda_estado=$2 WHERE aeayuda_id=$1 RETURNING aeayuda_id AS idregistro;`;
export const condicionListar = `
        SELECT aecondiciones_id AS idregistro, aecondiciones_acudiente AS acudiente,
               aecondiciones_fecha AS fecha, aelogdispositivos_model AS modelo,
               aelogdispositivos_platform AS plataforma, aelogdispositivos_uuid AS uuid,
               aelogdispositivos_version AS version, aelogdispositivos_serial AS serial
        FROM data.aecondiciones
        ORDER BY aecondiciones_fecha DESC;`;
export const condicionRegistrar = `
        INSERT INTO data.aecondiciones
            (aecondiciones_id, aecondiciones_acudiente, aecondiciones_fecha, aelogdispositivos_model,
             aelogdispositivos_platform, aelogdispositivos_uuid, aelogdispositivos_version, aelogdispositivos_serial)
        VALUES ((SELECT COALESCE(MAX(aecondiciones_id)+1, 1) FROM data.aecondiciones),
             $1, CURRENT_TIMESTAMP, $2, $3, $4, $5, $6)
        RETURNING aecondiciones_id AS idregistro;`;
export const condicionBorrar = `
        DELETE FROM data.aecondiciones WHERE aecondiciones_id=$1 RETURNING aecondiciones_id AS idregistro;`;
export const solicitudListar = `
        SELECT s.aesolicitud_id AS idregistro, s.aeanol_id AS idano, s.aeinst_id AS idinstitucion,
               s.aeusu_id AS idusuario, s.aetipo_certicado AS idtipocertificado,
               s.aesolicitud_mensaje AS mensaje, s.aesolicitud_destino AS destino,
               s.aesolicitud_estado AS idestado, s.aesolicitud_fecha AS fecha, s.aesolicitud_hora AS hora,
               t.aetipocertificado_nombre AS tipocertificado
        FROM data.aesolicitud s
        LEFT JOIN data.aetipo_certificado t ON (t.aetipocertificado_id = s.aetipo_certicado)
        WHERE ($1::integer IS NULL OR s.aeinst_id = $1)
        ORDER BY s.aesolicitud_fecha DESC;`;
export const solicitudRegistrar = `
        INSERT INTO data.aesolicitud
            (aesolicitud_id, aeanol_id, aeinst_id, aeusu_id, aetipo_certicado, aesolicitud_mensaje,
             aesolicitud_destino, aesolicitud_estado, aesolicitud_fecha, aesolicitud_hora)
        VALUES ((SELECT COALESCE(MAX(aesolicitud_id)+1, 1) FROM data.aesolicitud),
             $1, $2, $3, $4, $5, $6, $7, CURRENT_DATE, CURRENT_TIME)
        RETURNING aesolicitud_id AS idregistro;`;
export const solicitudActualizar = `
        UPDATE data.aesolicitud
        SET aetipo_certicado=$2, aesolicitud_mensaje=$3, aesolicitud_destino=$4, aesolicitud_estado=$5
        WHERE aesolicitud_id=$1
        RETURNING aesolicitud_id AS idregistro;`;
export const solicitudBorrar = `
        UPDATE data.aesolicitud SET aesolicitud_estado=$2 WHERE aesolicitud_id=$1 RETURNING aesolicitud_id AS idregistro;`;
export const medicionListar = `
        SELECT aemediciones_id AS idregistro, aeusu_id AS idusuarios, aemediciones_concepto AS concepto,
               aemediciones_estudiante AS idestudiante, aemediciones_grupo AS grupo,
               aemediciones_valor AS valor, aemediciones_fecha AS fecha
        FROM data.aemediciones
        ORDER BY aemediciones_fecha DESC;`;
export const medicionRegistrar = `
        INSERT INTO data.aemediciones
            (aemediciones_id, aeusu_id, aemediciones_concepto, aemediciones_estudiante,
             aemediciones_grupo, aemediciones_valor, aemediciones_fecha)
        VALUES ((SELECT COALESCE(MAX(aemediciones_id)+1, 1) FROM data.aemediciones),
             $1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
        RETURNING aemediciones_id AS idregistro;`;
export const medicionActualizar = `
        UPDATE data.aemediciones
        SET aeusu_id=$2, aemediciones_concepto=$3, aemediciones_estudiante=$4,
            aemediciones_grupo=$5, aemediciones_valor=$6
        WHERE aemediciones_id=$1
        RETURNING aemediciones_id AS idregistro;`;
export const medicionBorrar = `
        DELETE FROM data.aemediciones WHERE aemediciones_id=$1 RETURNING aemediciones_id AS idregistro;`;
export const tipocertificadoListar = `
        SELECT aetipocertificado_id AS idregistro, aetipocertificado_nombre AS nombre,
               aetipocertificado_descripcion AS descripcion, aeestado_id AS idestado
        FROM data.aetipo_certificado
        ORDER BY aetipocertificado_nombre;`;
export const tipocertificadoRegistrar = `
        INSERT INTO data.aetipo_certificado (aetipocertificado_id, aetipocertificado_nombre, aetipocertificado_descripcion, aeestado_id)
        VALUES ((SELECT COALESCE(MAX(aetipocertificado_id)+1, 1) FROM data.aetipo_certificado), $1, $2, $3)
        RETURNING aetipocertificado_id AS idregistro;`;
export const tipocertificadoActualizar = `
        UPDATE data.aetipo_certificado
        SET aetipocertificado_nombre=$2, aetipocertificado_descripcion=$3, aeestado_id=$4
        WHERE aetipocertificado_id=$1
        RETURNING aetipocertificado_id AS idregistro;`;
export const tipocertificadoBorrar = `
        DELETE FROM data.aetipo_certificado WHERE aetipocertificado_id=$1 RETURNING aetipocertificado_id AS idregistro;`;
export const avisointernoListar = `
        SELECT a.aeavisosinternal_id AS idregistro, a.aeusu_id AS idusuario,
               a.aeinst_id AS idinstitucion, a.aeanol_id AS idano,
               a.aeavisosinternal_docentessid AS iddocentes, a.aeavisosinternal_fecha AS fecha,
               a.aeavisosinternal_fechapublicacion AS fechapublicacion,
               a.aeavisosinternal_fechafinalizacion AS fechafinalizacion,
               a.aeavisosinternal_titulo AS titulo, a.aeavisosinternal_descripcion AS descripcion,
               a.aeavisosinternal_adjunto AS adjunto, a.aeavisosinternal_estado AS idestado
        FROM data.aeavisosinternal a
        WHERE ($1::double precision IS NULL OR a.aeinst_id = $1)
        ORDER BY a.aeavisosinternal_fecha DESC;`;
export const avisointernoRegistrar = `
        INSERT INTO data.aeavisosinternal
            (aeavisosinternal_id, aeusu_id, aeinst_id, aeanol_id, aeavisosinternal_docentessid,
             aeavisosinternal_fecha, aeavisosinternal_fechapublicacion, aeavisosinternal_fechafinalizacion,
             aeavisosinternal_titulo, aeavisosinternal_descripcion, aeavisosinternal_adjunto, aeavisosinternal_estado)
        VALUES ((SELECT COALESCE(MAX(aeavisosinternal_id)+1, 1) FROM data.aeavisosinternal),
             $1, $2, $3, $4, CURRENT_TIMESTAMP, $5, $6, $7, $8, $9, $10)
        RETURNING aeavisosinternal_id AS idregistro;`;
export const avisointernoActualizar = `
        UPDATE data.aeavisosinternal
        SET aeavisosinternal_docentessid=$2, aeavisosinternal_fechapublicacion=$3,
            aeavisosinternal_fechafinalizacion=$4, aeavisosinternal_titulo=$5,
            aeavisosinternal_descripcion=$6, aeavisosinternal_adjunto=$7, aeavisosinternal_estado=$8
        WHERE aeavisosinternal_id=$1
        RETURNING aeavisosinternal_id AS idregistro;`;
export const avisointernoBorrar = `
        UPDATE data.aeavisosinternal SET aeavisosinternal_estado=$2 WHERE aeavisosinternal_id=$1 RETURNING aeavisosinternal_id AS idregistro;`;
export const avisointcomentarioListar = `
        SELECT c.aeavisosinternalcomentarios_id AS idregistro, c.aeavisosinternal_id AS idaviso,
               c.aeusu_id AS idusuario, c.aeavisosinternalcomentarios_fecha AS fecha,
               c.aeavisosinternalcomentarios_descripcion AS descripcion, c.aeavisosinternalcomentarios_estado AS idestado
        FROM data.aeavisosinternal_comentarios c
        WHERE ($1::double precision IS NULL OR c.aeavisosinternal_id = $1)
        ORDER BY c.aeavisosinternalcomentarios_fecha;`;
export const avisointcomentarioRegistrar = `
        INSERT INTO data.aeavisosinternal_comentarios
            (aeavisosinternalcomentarios_id, aeavisosinternal_id, aeusu_id, aeavisosinternalcomentarios_fecha,
             aeavisosinternalcomentarios_descripcion, aeavisosinternalcomentarios_estado)
        VALUES ((SELECT COALESCE(MAX(aeavisosinternalcomentarios_id)+1, 1) FROM data.aeavisosinternal_comentarios),
             $1, $2, CURRENT_TIMESTAMP, $3, $4)
        RETURNING aeavisosinternalcomentarios_id AS idregistro;`;
export const avisointcomentarioBorrar = `
        UPDATE data.aeavisosinternal_comentarios SET aeavisosinternalcomentarios_estado=$2
        WHERE aeavisosinternalcomentarios_id=$1 RETURNING aeavisosinternalcomentarios_id AS idregistro;`;
export const pubalertaListar = `
        SELECT aepublicacionesalerta_id AS idregistro, aepublicaciones_id AS idpublicacion,
               aepublicacionesalerta_fecha AS fecha
        FROM data.aepublicaciones_alerta
        WHERE ($1::bigint IS NULL OR aepublicaciones_id = $1)
        ORDER BY aepublicacionesalerta_fecha;`;
export const pubalertaRegistrar = `
        INSERT INTO data.aepublicaciones_alerta (aepublicacionesalerta_id, aepublicaciones_id, aepublicacionesalerta_fecha)
        VALUES ((SELECT COALESCE(MAX(aepublicacionesalerta_id)+1, 1) FROM data.aepublicaciones_alerta), $1, CURRENT_TIMESTAMP)
        RETURNING aepublicacionesalerta_id AS idregistro;`;
export const pubalertaBorrar = `
        DELETE FROM data.aepublicaciones_alerta WHERE aepublicacionesalerta_id=$1 RETURNING aepublicacionesalerta_id AS idregistro;`;
export const tipocitacionListar = `
        SELECT motivo_id AS idregistro, motivo_nombre AS nombre, motivo_estado AS idestado
        FROM data.tipo_citacion
        ORDER BY motivo_nombre;`;
export const tipocitacionRegistrar = `
        INSERT INTO data.tipo_citacion (motivo_id, motivo_nombre, motivo_estado)
        VALUES ((SELECT COALESCE(MAX(motivo_id)+1, 1) FROM data.tipo_citacion), $1, $2)
        RETURNING motivo_id AS idregistro;`;
export const tipocitacionActualizar = `
        UPDATE data.tipo_citacion SET motivo_nombre=$2, motivo_estado=$3
        WHERE motivo_id=$1 RETURNING motivo_id AS idregistro;`;
export const tipocitacionBorrar = `
        UPDATE data.tipo_citacion SET motivo_estado=$2 WHERE motivo_id=$1 RETURNING motivo_id AS idregistro;`;
export default {
  ayudaListar: ayudaListar,
  ayudaRegistrar: ayudaRegistrar,
  ayudaActualizar: ayudaActualizar,
  ayudaBorrar: ayudaBorrar,
  condicionListar: condicionListar,
  condicionRegistrar: condicionRegistrar,
  condicionBorrar: condicionBorrar,
  solicitudListar: solicitudListar,
  solicitudRegistrar: solicitudRegistrar,
  solicitudActualizar: solicitudActualizar,
  solicitudBorrar: solicitudBorrar,
  medicionListar: medicionListar,
  medicionRegistrar: medicionRegistrar,
  medicionActualizar: medicionActualizar,
  medicionBorrar: medicionBorrar,
  tipocertificadoListar: tipocertificadoListar,
  tipocertificadoRegistrar: tipocertificadoRegistrar,
  tipocertificadoActualizar: tipocertificadoActualizar,
  tipocertificadoBorrar: tipocertificadoBorrar,
  avisointernoListar: avisointernoListar,
  avisointernoRegistrar: avisointernoRegistrar,
  avisointernoActualizar: avisointernoActualizar,
  avisointernoBorrar: avisointernoBorrar,
  avisointcomentarioListar: avisointcomentarioListar,
  avisointcomentarioRegistrar: avisointcomentarioRegistrar,
  avisointcomentarioBorrar: avisointcomentarioBorrar,
  pubalertaListar: pubalertaListar,
  pubalertaRegistrar: pubalertaRegistrar,
  pubalertaBorrar: pubalertaBorrar,
  tipocitacionListar: tipocitacionListar,
  tipocitacionRegistrar: tipocitacionRegistrar,
  tipocitacionActualizar: tipocitacionActualizar,
  tipocitacionBorrar: tipocitacionBorrar
};
/**
 * configapp.sql.js
 * Sentencias SQL del módulo de configuración/ayuda de Escuelapp:
 * data.aeayuda, data.aecondiciones, data.aesolicitud, data.aemediciones,
 * data.aetipo_certificado, data.aeavisosinternal, data.aeavisosinternal_comentarios,
 * data.aepublicaciones_alerta y data.tipo_citacion (motivos de citación).
 */
