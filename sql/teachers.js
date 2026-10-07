export const allTeachers = `
    -- LIST TEACHER OF A SCHOOL IN A YEAR
    SELECT 
        x.aeusuroll_id, d.aedocentes_id, u.aeusu_id, x.aeroll_id,
        INITCAP(LOWER(d.aedocentes_apellidos)) as aedocentes_apellidos, INITCAP(LOWER(d.aedocentes_nombres)) as aedocentes_nombres,
        u.aeusu_nick, u.aeusu_llave, d.aedocentes_mail, d.aedocentes_telefono, d.aedocentes_fechanacimiento,
        d.aedocentes_genero, d.aedocentes_direccion,d.aedocentes_identificacion
    FROM 
        data.aedocentes d, engine.aeusuroll x, engine.aeusu u 
    WHERE 
        x.aeinst_id = $1
        AND x.aeanol_id= $2
        AND (x.aeroll_id = 2 OR x.aeroll_id = 1)
        AND x.aeusuroll_estado = 1
        AND u.aeusu_estado = 1
        AND d.aedocentes_estado = 1
        AND x.aeacad_referencia =d.aedocentes_id
        AND x.aeusu_id=u.aeusu_id
        AND d.aeusu_id = u.aeusu_id
    ORDER BY d.aedocentes_nombres, d.aedocentes_apellidos;`;
export const insertTeacher = `
    -- REGISTRO DE DOCENTE EN LA TABLA DOCENTE SI NO EXISTE
        INSERT INTO data.aedocentes(
            aedocentes_id,aeusu_id, aedocentes_identificacion, aedocentes_nombres, 
            aedocentes_apellidos, aedocentes_fechanacimiento, aedocentes_genero, 
            aedocentes_direccion, aedocentes_telefono, aedocentes_mail)
        VALUES ((SELECT MAX(aedocentes_id)+1 FROM data.aedocentes),$1, $2, $3, $4, $5, $6, $7,  $8, $9)
        ON CONFLICT (aedocentes_mail)
        DO
            UPDATE SET aedocentes_identificacion=$2, aedocentes_nombres=$3, aedocentes_apellidos=$4, 
            aedocentes_fechanacimiento=$5, aedocentes_genero=$6, 
            aedocentes_direccion=$7, aedocentes_telefono=$8, aedocentes_mail=$9
        RETURNING aedocentes_id;`;
export const insertTeacherUser = `
        -- CREACION DE DOCENTE EN LA TABLA USUARIO SI NO EXISTE
        INSERT INTO engine.aeusu(
            aeusu_id,aeusu_nombre, aeusu_nick, aeusu_llave, aeroll_id, aeusu_estado) 
        VALUES ((SELECT MAX(aeusu_id)+1 FROM engine.aeusu),$1, $2, $3, $4, $5)
        ON CONFLICT (aeusu_nick)
        DO
            UPDATE SET aeusu_llave=$3, aeroll_id=$4, aeusu_estado=$5
        RETURNING aeusu_id;`;
export const inheritAssignations = `
    -- ALL ASSIGNATIONS OF A TEACHER FOR ANOTHER
    UPDATE data.aeasignaciones
    SET aedocentes_id = $4
    WHERE aeinst_id=$2
    AND aeanol_id=$1
    AND aedocentes_id = $3;`;
export const inheritAttendances = `
    -- LAS ASISTENCIAS DEBEN HEREDARSE, PERO FALTA EL CAMPO IDINST E IDANOL EN ESA TABLA
    `;
export const getDocenteUnico = `
    -- DATOS DEL DOCENTE A ELIMINAR
    SELECT aedocentes_id,aeusu_id,aedocentes_nombres,aedocentes_apellidos 
    FROM data.aedocentes 
    WHERE aedocentes_id = $1`;
export const insertDocenteUnion = `
    -- UNION ENTRE DOCENTE Y LA INSTITUCION
    INSERT INTO data.inst_doce(
        inst_doce_id,aeinst_id, aedocentes_id, aeanol_id, inst_doce_estado)
    VALUES ((SELECT MAX(inst_doce_id)+1 FROM data.inst_doce),
    $1, $2, $3, $4)RETURNING inst_doce_id`;
export const updateDocenteUnion = `
    -- UNION ENTRE DOCENTE Y LA INSTITUCION
    UPDATE data.inst_doce
    SET
        aeinst_id=$1, aedocentes_id=$2, aeanol_id=$3, inst_doce_estado=$4
    WHERE aedocentes_id=$2 AND aeanol_id=$3 RETURNING inst_doce_id`;
export const deleteDocenteUnion = `
    -- ELIMINAR LA UNION ENTRE EL DOCENTE Y LA INSTITUCION
    DELETE FROM engine.aeusuroll
    WHERE aeinst_id=$1
    AND aeanol_id=$2
    AND aeacad_referencia=$3
    AND aeroll_id=2;`;
export const insertDocenteAsociacion = `
    -- ASOCIACION ENTRE USUARIO Y LA INSTITUCION
    INSERT INTO engine.aeusuroll(
        aeusuroll_id, 
        aeroll_id, aeusu_id, aeacad_referencia, aeinst_id, aeanol_id, aeusuroll_estado)
    VALUES ((SELECT MAX(aeusuroll_id)+1 FROM engine.aeusuroll),
    $1, $2, $3, $4, $5, $6)RETURNING aeusuroll_id`;
export const updateDocenteAsociacion = `
    -- ASOCIACION ENTRE USUARIO Y LA INSTITUCION
    UPDATE engine.aeusuroll
    SET aeroll_id = $1, aeusu_id=$2, aeacad_referencia=$3, aeinst_id=$4, aeanol_id=$5, aeusuroll_estado=$6
    WHERE aeusu_id=$2 AND aeinst_id=$3 AND aeanol_id=$5 RETURNING aeusuroll_id`;
export const deleteDocenteAsociacion = `
    --ELIMINAR LA ASOCIACION DEL PROFE Y EL COLEGIO
    DELETE FROM data.inst_doce
    WHERE aedocentes_id = $1 
    AND aeinst_id=$2
    AND aeanol_id=$3`;
export default {
  allTeachers: allTeachers,
  insertTeacher: insertTeacher,
  insertTeacherUser: insertTeacherUser,
  inheritAssignations: inheritAssignations,
  inheritAttendances: inheritAttendances,
  getDocenteUnico: getDocenteUnico,
  insertDocenteUnion: insertDocenteUnion,
  updateDocenteUnion: updateDocenteUnion,
  deleteDocenteUnion: deleteDocenteUnion,
  insertDocenteAsociacion: insertDocenteAsociacion,
  updateDocenteAsociacion: updateDocenteAsociacion,
  deleteDocenteAsociacion: deleteDocenteAsociacion
};
