export const tipoListar = `
        SELECT aetempmesstype_id AS idregistro, aetempmesstype_text AS nombre, aetempmesstype_estado AS idestado
        FROM contact.aetempmesstype
        ORDER BY aetempmesstype_text;`;
export const tipoRegistrar = `
        INSERT INTO contact.aetempmesstype (aetempmesstype_id, aetempmesstype_text, aetempmesstype_estado)
        VALUES ((SELECT COALESCE(MAX(aetempmesstype_id)+1, 1) FROM contact.aetempmesstype), $1, $2)
        RETURNING aetempmesstype_id AS idregistro;`;
export const tipoActualizar = `
        UPDATE contact.aetempmesstype SET aetempmesstype_text=$2, aetempmesstype_estado=$3
        WHERE aetempmesstype_id=$1 RETURNING aetempmesstype_id AS idregistro;`;
export const tipoBorrar = `
        UPDATE contact.aetempmesstype SET aetempmesstype_estado=$2 WHERE aetempmesstype_id=$1 RETURNING aetempmesstype_id AS idregistro;`;
export const varListar = `
        SELECT aetempmessvars_id AS idregistro, aetempmessvars_nombre AS nombre,
               aetempmessvars_comentario AS comentario, aetempmessvars_estado AS idestado
        FROM contact.aetempmessvars
        ORDER BY aetempmessvars_nombre;`;
export const varRegistrar = `
        INSERT INTO contact.aetempmessvars (aetempmessvars_id, aetempmessvars_nombre, aetempmessvars_comentario, aetempmessvars_estado)
        VALUES ((SELECT COALESCE(MAX(aetempmessvars_id)+1, 1) FROM contact.aetempmessvars), $1, $2, $3)
        RETURNING aetempmessvars_id AS idregistro;`;
export const varActualizar = `
        UPDATE contact.aetempmessvars SET aetempmessvars_nombre=$2, aetempmessvars_comentario=$3, aetempmessvars_estado=$4
        WHERE aetempmessvars_id=$1 RETURNING aetempmessvars_id AS idregistro;`;
export const varBorrar = `
        UPDATE contact.aetempmessvars SET aetempmessvars_estado=$2 WHERE aetempmessvars_id=$1 RETURNING aetempmessvars_id AS idregistro;`;
export const plantillaListar = `
        SELECT m.aetempmess_id AS idregistro, m.aetempmess_type AS idtipo, m.aetempmess_text AS texto,
               m.aetempmess_guia AS guia, m.aetempmess_estado AS idestado, t.aetempmesstype_text AS tipo
        FROM contact.aetempmess m
        LEFT JOIN contact.aetempmesstype t ON (t.aetempmesstype_id = m.aetempmess_type)
        WHERE ($1::integer IS NULL OR m.aetempmess_type = $1)
        ORDER BY t.aetempmesstype_text, m.aetempmess_id;`;
export const plantillaRegistrar = `
        INSERT INTO contact.aetempmess (aetempmess_id, aetempmess_type, aetempmess_text, aetempmess_guia, aetempmess_estado)
        VALUES ((SELECT COALESCE(MAX(aetempmess_id)+1, 1) FROM contact.aetempmess), $1, $2, $3, $4)
        RETURNING aetempmess_id AS idregistro;`;
export const plantillaActualizar = `
        UPDATE contact.aetempmess SET aetempmess_type=$2, aetempmess_text=$3, aetempmess_guia=$4, aetempmess_estado=$5
        WHERE aetempmess_id=$1 RETURNING aetempmess_id AS idregistro;`;
export const plantillaBorrar = `
        UPDATE contact.aetempmess SET aetempmess_estado=$2 WHERE aetempmess_id=$1 RETURNING aetempmess_id AS idregistro;`;
export const plantillasedeListar = `
        SELECT s.aetempmesssede_id AS idregistro, s.aetempmesstype_id AS idtipo, s.aeinst_id AS idinstitucion,
               s.aetempmesssede_estado AS idestado, s.aetempmesssede_guia AS guia,
               s.aetempmesssede_text AS texto, t.aetempmesstype_text AS tipo
        FROM contact.aetempmesssede s
        LEFT JOIN contact.aetempmesstype t ON (t.aetempmesstype_id = s.aetempmesstype_id)
        WHERE ($1::integer IS NULL OR s.aeinst_id = $1)
        ORDER BY t.aetempmesstype_text;`;
export const plantillasedeRegistrar = `
        INSERT INTO contact.aetempmesssede
            (aetempmesssede_id, aetempmesstype_id, aetempmesssede_estado, aeinst_id, aetempmesssede_guia, aetempmesssede_text)
        VALUES ((SELECT COALESCE(MAX(aetempmesssede_id)+1, 1) FROM contact.aetempmesssede), $1, $2, $3, $4, $5)
        RETURNING aetempmesssede_id AS idregistro;`;
export const plantillasedeActualizar = `
        UPDATE contact.aetempmesssede
        SET aetempmesstype_id=$2, aetempmesssede_estado=$3, aeinst_id=$4, aetempmesssede_guia=$5, aetempmesssede_text=$6
        WHERE aetempmesssede_id=$1 RETURNING aetempmesssede_id AS idregistro;`;
export const plantillasedeBorrar = `
        UPDATE contact.aetempmesssede SET aetempmesssede_estado=$2 WHERE aetempmesssede_id=$1 RETURNING aetempmesssede_id AS idregistro;`;
export default {
  tipoListar: tipoListar,
  tipoRegistrar: tipoRegistrar,
  tipoActualizar: tipoActualizar,
  tipoBorrar: tipoBorrar,
  varListar: varListar,
  varRegistrar: varRegistrar,
  varActualizar: varActualizar,
  varBorrar: varBorrar,
  plantillaListar: plantillaListar,
  plantillaRegistrar: plantillaRegistrar,
  plantillaActualizar: plantillaActualizar,
  plantillaBorrar: plantillaBorrar,
  plantillasedeListar: plantillasedeListar,
  plantillasedeRegistrar: plantillasedeRegistrar,
  plantillasedeActualizar: plantillasedeActualizar,
  plantillasedeBorrar: plantillasedeBorrar
};
/**
 * templates.sql.js
 * Sentencias SQL del módulo de plantillas de mensajería (esquema contact):
 * contact.aetempmess (plantillas), contact.aetempmesssede (plantillas por sede),
 * contact.aetempmesstype (tipos) y contact.aetempmessvars (variables).
 */
