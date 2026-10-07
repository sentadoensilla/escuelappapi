export const mapInstitucionListar = `
        SELECT cinstid AS idregistro, cinstid, aeinst_id
        FROM migracion.map_institucion
        ORDER BY cinstid;`;
export const mapInstitucionUpsert = `
        INSERT INTO migracion.map_institucion (cinstid, aeinst_id)
        VALUES ($1, $2)
        ON CONFLICT (cinstid) DO UPDATE SET aeinst_id = EXCLUDED.aeinst_id
        RETURNING cinstid AS idregistro;`;
export const mapInstitucionBorrar = `
        DELETE FROM migracion.map_institucion WHERE cinstid=$1 RETURNING cinstid AS idregistro;`;
export const mapDocenteListar = `
        SELECT aedocentes_id AS idregistro, aedocentes_id, cdoceid
        FROM migracion.map_docente
        ORDER BY aedocentes_id;`;
export const mapDocenteUpsert = `
        INSERT INTO migracion.map_docente (aedocentes_id, cdoceid)
        VALUES ($1, $2)
        ON CONFLICT (aedocentes_id) DO UPDATE SET cdoceid = EXCLUDED.cdoceid
        RETURNING aedocentes_id AS idregistro;`;
export const mapDocenteBorrar = `
        DELETE FROM migracion.map_docente WHERE aedocentes_id=$1 RETURNING aedocentes_id AS idregistro;`;
export const mapEstudianteListar = `
        SELECT aeestudiantes_id AS idregistro, aeestudiantes_id, cestuid
        FROM migracion.map_estudiante
        ORDER BY aeestudiantes_id;`;
export const mapEstudianteUpsert = `
        INSERT INTO migracion.map_estudiante (aeestudiantes_id, cestuid)
        VALUES ($1, $2)
        ON CONFLICT (aeestudiantes_id) DO UPDATE SET cestuid = EXCLUDED.cestuid
        RETURNING aeestudiantes_id AS idregistro;`;
export const mapEstudianteBorrar = `
        DELETE FROM migracion.map_estudiante WHERE aeestudiantes_id=$1 RETURNING aeestudiantes_id AS idregistro;`;
export const mapRolListar = `
        SELECT crollid AS idregistro, crollid, aeroll_id
        FROM migracion.map_rol
        ORDER BY crollid;`;
export const mapRolUpsert = `
        INSERT INTO migracion.map_rol (crollid, aeroll_id)
        VALUES ($1, $2)
        ON CONFLICT (crollid) DO UPDATE SET aeroll_id = EXCLUDED.aeroll_id
        RETURNING crollid AS idregistro;`;
export const mapRolBorrar = `
        DELETE FROM migracion.map_rol WHERE crollid=$1 RETURNING crollid AS idregistro;`;
export const mapUsuarioListar = `
        SELECT cusuaid AS idregistro, cusuaid, aeusu_id
        FROM migracion.map_usuario
        ORDER BY cusuaid;`;
export const mapUsuarioUpsert = `
        INSERT INTO migracion.map_usuario (cusuaid, aeusu_id)
        VALUES ($1, $2)
        ON CONFLICT (cusuaid) DO UPDATE SET aeusu_id = EXCLUDED.aeusu_id
        RETURNING cusuaid AS idregistro;`;
export const mapUsuarioBorrar = `
        DELETE FROM migracion.map_usuario WHERE cusuaid=$1 RETURNING cusuaid AS idregistro;`;
export default {
  mapInstitucionListar: mapInstitucionListar,
  mapInstitucionUpsert: mapInstitucionUpsert,
  mapInstitucionBorrar: mapInstitucionBorrar,
  mapDocenteListar: mapDocenteListar,
  mapDocenteUpsert: mapDocenteUpsert,
  mapDocenteBorrar: mapDocenteBorrar,
  mapEstudianteListar: mapEstudianteListar,
  mapEstudianteUpsert: mapEstudianteUpsert,
  mapEstudianteBorrar: mapEstudianteBorrar,
  mapRolListar: mapRolListar,
  mapRolUpsert: mapRolUpsert,
  mapRolBorrar: mapRolBorrar,
  mapUsuarioListar: mapUsuarioListar,
  mapUsuarioUpsert: mapUsuarioUpsert,
  mapUsuarioBorrar: mapUsuarioBorrar
};
/**
 * migracion.sql.js
 * Sentencias SQL del módulo de mapeo de identidad SAE <-> Escuelapp (esquema migracion):
 * map_institucion, map_docente, map_estudiante, map_rol y map_usuario.
 * Son tablas puente para conservar la coherencia de los IDs entre ambos sistemas.
 */
