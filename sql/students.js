export const checkUser = `
    -- BUSCAR UN USUARIO CON  EL CORREO
    SELECT aeusu_id,aeusu_nombre FROM engine.aeusu WHERE aeusu_nick LIKE $1;
    `;
export const updateStudentsUser = `
    -- ACTUALIZAR LOS DATOS DE USUARIO DE UN ESTUDIANTE
    UPDATE engine.aeusu SET 
    aeusu_nombre = $1 || ' ' || $2, 
    aeusu_nick=$3
    WHERE aeusu_id=(SELECT aeusu_id FROM data.aeestudiantes
        WHERE aeestudiantes_id=$4)
    RETURNING aeusu_id; `;
export const updateStudentsPersonal = `
    -- ACTUALIZAR DATOS PERSONALES DE ESTUDIANTES
        UPDATE data.aeestudiantes SET
        aeestudiantes_codigo = $1,
        aeestudiantes_grupo = $2,
        aeestudiantes_nombres = $3,
        aeestudiantes_apellidos = $4,
        aeestudiantes_identificacion = $5,
        aeestudiantes_fechanacimiento = $6,
        aeestudiantes_genero = $7,
        aeestudiantes_direccion = $8,
        aeestudiantes_telefono = $9,
        aeestudiantes_mail = $10
        WHERE aeestudiantes_id = $11
        RETURNING aeestudiantes_id
    `;
export const updateStudentsParents = `
    -- ACTUALIZAR DATOS DE LOS ACUDIENTES SEGUN EL ESTUDIANTE
    UPDATE data.aeacudientes SET
    aeestudiantes_idenacudiente = $1,
    aeestudiantes_nombresacudiente = $2,
    aeestudiantes_apellidosacudiente = $3,
    aeestudiantes_generoacudiente = $4,
    aeestudiantes_direccionacudiente = $5,
    aeestudiantes_telefonoacudiente = $6,
    aeestudiantes_mailacudiente = $7
    WHERE aeacudientes_id = (SELECT aeacudientes_id FROM data.aeestudiantes WHERE aeestudiantes_id=$8)
    RETURNING aeacudientes_id
    `;
export const allStudents = `
    -- LISTADO DE ESTUDIANTES DE ESTE ANO EN EL COLEGIO
    SELECT x.aeusuroll_id, e.aeestudiantes_id, e.aeinstitucion_id, e.aeano_id,
    e.aeestudiantes_fecharegistro, u.aeusu_id, e.aeestudiantes_grupo, 
    upper(e.aeestudiantes_apellidos) as aeestudiantes_apellidos, upper(e.aeestudiantes_nombres) as aeestudiantes_nombres,
    upper(a.aeestudiantes_apellidosacudiente) as aeestudiantes_apellidosacudiente, upper(aeestudiantes_nombresacudiente) as aeestudiantes_nombresacudiente,
    e.aeestudiantes_telefono, e.aeestudiantes_mail, e.aeestudiantes_fechanacimiento,
    UPPER(e.aeestudiantes_genero) AS aeestudiantes_genero , e.aeestudiantes_direccion,
    u.aeusu_nick, u.aeusu_llave, e.aeestudiantes_identificacion,
    a.aeestudiantes_idenacudiente, e.aeestudiantes_codigo,
    UPPER(a.aeestudiantes_generoacudiente) AS aeestudiantes_generoacudiente, a.aeestudiantes_direccionacudiente,
    a.aeestudiantes_telefonoacudiente, a.aeestudiantes_mailacudiente,a.aeacudientes_id
    FROM data.aeestudiantes e, data.aeacudientes a, engine.aeusu u, engine.aeusuroll x
    WHERE x.aeinst_id=$1
    AND x.aeanol_id=$2
    AND x.aeroll_id=3
    AND u.aeroll_id=3
    AND e.aeacudientes_id=a.aeacudientes_id
    AND e.aeestudiantes_id=x.aeacad_referencia
    AND u.aeusu_id=x.aeusu_id
    ORDER BY e.aeestudiantes_grupo,aeestudiantes_apellidos,aeestudiantes_nombresacudiente;
    `;
export default {
  checkUser: checkUser,
  updateStudentsUser: updateStudentsUser,
  updateStudentsPersonal: updateStudentsPersonal,
  updateStudentsParents: updateStudentsParents,
  allStudents: allStudents
};
