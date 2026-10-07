export const observacionAdd = `
    -- REGISTRAR UNA OBSERVACION
    INSERT INTO data.aebitacora(
        aebitacora_id, aebitacora_fecha, aeusu_id, aeinst_id, 
        aeanol_id, aebitacora_grupo, aebitacora_estudiantesid, aebitacora_asignatura, aebitacora_aviso, 
        aebitacora_descripcion)
        VALUES ((SELECT COALESCE((MAX(aebitacora_id)+1), 1)  FROM data.aebitacora), $1, $2, $3, 
        $4, $5, $6, $7, $8, $9) RETURNING aebitacora_id;
    `;
export const notificationAdd = `
    -- AGREGAR NOTIFICACION ENVIADA AL USUARIO
    INSERT INTO data.aenotificaciones(
        aenotificaciones_id, aenotificaciones_de, aenotificaciones_para, aenotificaciones_fecha, 
        aenotificaciones_title, aenotificaciones_body, aenotificaciones_ruta, aenotificaciones_referencia, aenotificaciones_data)
    VALUES ((SELECT COALESCE(MAX(aenotificaciones_id)+1, 1) FROM data.aenotificaciones), $1, $2, $3, $4, $5, $6, $7, $8);`;
export const contactoStudentOne = `
    -- DATOS DE CONTACTO DE UN ESTUDIANTE
        SELECT * FROM engine.contacto_student_one($1, $2, $3);
        `;
export const contactoStudent = `
    -- DATOS DE CONTACTO DE UN ESTUDIANTE
        SELECT * FROM engine.contacto_student($1, $2, $3);
    `;
export const observacionesListOne = `
    -- UNA OBSERVACION CON TODAS SUS PROPIEDADES
        SELECT 
            aebitacora_id as idregistro, TO_CHAR(b.aebitacora_fecha, 'YYYY-MM-DD') AS fechaobservacion,
            aeusu_nombre as usuarioregistrador, b.aeanol_id AS idanolectivo, y.aeano_descripcion as anolectivo, 
            aebitacora_grupo as grupo, aebitacora_asignatura AS asignatura, 
            b.aebitacora_estudiantesid as idestudiantes, x.nombresestudiantes, 
            aebitacora_aviso as aviso, aebitacora_descripcion as descripcion,
            (SELECT COUNT(*) FROM data.aebitacora_comentarios WHERE aebitacora_id=$1 ) AS comentarios,
            i.aeinst_id AS idinstitucion, i.aeinst_nombre AS nombreinstitucion, i.calendario, 
            i.aeinst_direccion AS direccion, i.aeinst_telefono AS telefono, 
            i.aeinst_mail AS mail, i.aeinst_escudo AS escudo, i.aeinst_facebook AS facebook 
        FROM 
            data.aebitacora b LEFT JOIN LATERAL -- NOMBRES DE LOS ESTUDIANTES INVOLUCRADOS EN LA OBSERVACION, SIN LOOPS
	            (
	            	SELECT b.aebitacora_estudiantesid, array_agg(TRIM(e.aeestudiantes_apellidos || ' ' || e.aeestudiantes_nombres)) AS nombresestudiantes 
	            	FROM data.aeestudiantes e
	            	WHERE e.aeestudiantes_id = ANY(b.aebitacora_estudiantesid)
	            	GROUP BY b.aebitacora_estudiantesid 
	            ) x 
	            ON (x.aebitacora_estudiantesid=x.aebitacora_estudiantesid)            
            LEFT JOIN engine.aeusu u
                ON (b.aeusu_id=u.aeusu_id)
            LEFT JOIN DATA.aeinstituciones i
                ON (b.aeinst_id=i.aeinst_id)
            LEFT JOIN DATA.aeano y
                ON (b.aeanol_id = y.aeano_id)
        WHERE 
            aebitacora_id = $1
    `;
export const observacionesListTeachers = `
    -- LISTA DE OBSERVACIONES PARA DOCENTES
        SELECT 
            aebitacora_id AS idregistro, TO_CHAR(b.aebitacora_fecha, 'YYYY-MM-DD') AS fechaobservacion, 
            aeusu_nombre as usuarioregistrador, aeinst_id as idinstitucion, aeanol_id as idanolectivo, 
            aebitacora_grupo as grupo, aebitacora_asignatura AS asignatura, 
            b.aebitacora_estudiantesid as idestudiantes, x.nombresestudiantes,
            aebitacora_aviso as aviso, aebitacora_descripcion as descripcion,
            (SELECT COUNT(*) FROM data.aebitacora_comentarios WHERE aebitacora_id=b.aebitacora_id ) AS comentarios
        FROM 
            data.aebitacora b LEFT JOIN LATERAL -- NOMBRES DE LOS ESTUDIANTES INVOLUCRADOS EN LA OBSERVACION, SIN LOOPS
	            (
	            	SELECT b.aebitacora_estudiantesid, array_agg(TRIM(e.aeestudiantes_apellidos || ' ' || e.aeestudiantes_nombres)) AS nombresestudiantes 
	            	FROM data.aeestudiantes e
	            	WHERE e.aeestudiantes_id = ANY(b.aebitacora_estudiantesid)
	            	GROUP BY b.aebitacora_estudiantesid 
	            ) x 
	            ON (x.aebitacora_estudiantesid=x.aebitacora_estudiantesid)             
            LEFT JOIN engine.aeusu u
                ON (b.aeusu_id=u.aeusu_id)
        WHERE 
            aeanol_id = $1
            AND aeinst_id = $2
            AND b.aeusu_id= $3
            AND b.aebitacora_fecha 
                BETWEEN TO_DATE($4, 'YYYY-MM-DD') 
                    AND TO_DATE($5, 'YYYY-MM-DD')
        ORDER BY fechaobservacion DESC;
    `;
export const observacionesListStudents = `
    -- LISTA DE OBSERVACIONES PARA DOCENTES
        SELECT 
            aebitacora_id AS idregistro, TO_CHAR(b.aebitacora_fecha, 'YYYY-MM-DD') AS fechaobservacion, 
            aeusu_nombre as usuarioregistrador, aeinst_id as idinstitucion, aeanol_id as idanolectivo, 
            aebitacora_grupo as grupo, aebitacora_asignatura AS asignatura, 
            b.aebitacora_estudiantesid as idestudiantes, x.nombresestudiantes,
            aebitacora_aviso as aviso, aebitacora_descripcion as descripcion,
            (SELECT COUNT(*) FROM data.aebitacora_comentarios WHERE aebitacora_id=b.aebitacora_id ) AS comentarios
        FROM 
            data.aebitacora b LEFT JOIN LATERAL -- NOMBRES DE LOS ESTUDIANTES INVOLUCRADOS EN LA OBSERVACION, SIN LOOPS
	            (
	            	SELECT b.aebitacora_estudiantesid, array_agg(TRIM(e.aeestudiantes_apellidos || ' ' || e.aeestudiantes_nombres)) AS nombresestudiantes 
	            	FROM data.aeestudiantes e
	            	WHERE e.aeestudiantes_id = ANY(b.aebitacora_estudiantesid)
	            	GROUP BY b.aebitacora_estudiantesid 
	            ) x 
	            ON (x.aebitacora_estudiantesid=x.aebitacora_estudiantesid)            
            LEFT JOIN engine.aeusu u
                ON (b.aeusu_id=u.aeusu_id)
        WHERE 
            aeanol_id = $1
            AND aeinst_id = $2
            AND $3 = ANY(b.aebitacora_estudiantesid)
            AND b.aebitacora_fecha 
                BETWEEN TO_DATE($4, 'YYYY-MM-DD') 
                    AND TO_DATE($5, 'YYYY-MM-DD')
        ORDER BY fechaobservacion DESC;
    `;
export const observacionesListAdmins = `
    -- LISTA DE OBSERVACIONES PARA ADMINISTRATIVOS
        SELECT 
            aebitacora_id AS idregistro, TO_CHAR(b.aebitacora_fecha, 'YYYY-MM-DD') AS fechaobservacion, 
            aeusu_nombre as usuarioregistrador, aeinst_id as idinstitucion, aeanol_id as idanolectivo, 
            aebitacora_grupo as grupo, aebitacora_asignatura AS asignatura, 
            b.aebitacora_estudiantesid as idestudiantes, x.nombresestudiantes, 
            aebitacora_aviso as aviso, aebitacora_descripcion as descripcion,
            (SELECT COUNT(*) FROM data.aebitacora_comentarios WHERE aebitacora_id=b.aebitacora_id ) AS comentarios
        FROM 
            data.aebitacora b LEFT JOIN LATERAL -- NOMBRES DE LOS ESTUDIANTES INVOLUCRADOS EN LA OBSERVACION, SIN LOOPS
                (
                    SELECT b.aebitacora_estudiantesid, array_agg(TRIM(e.aeestudiantes_apellidos || ' ' || e.aeestudiantes_nombres)) AS nombresestudiantes 
                    FROM data.aeestudiantes e
                    WHERE e.aeestudiantes_id = ANY(b.aebitacora_estudiantesid)
                    GROUP BY b.aebitacora_estudiantesid 
                ) x 
                ON (x.aebitacora_estudiantesid=x.aebitacora_estudiantesid)            
            LEFT JOIN engine.aeusu u
                ON (b.aeusu_id=u.aeusu_id)
        WHERE 
            aeanol_id = $1
            AND aeinst_id = $2
            AND b.aebitacora_fecha 
                BETWEEN TO_DATE($3, 'YYYY-MM-DD') 
                    AND TO_DATE($4, 'YYYY-MM-DD')
        ORDER BY fechaobservacion DESC;
    `;
export const observacionesListComments = `
    -- COMENTARIOS DE UNA OBSERVACION HECHA POR UN DOCENTE
      SELECT TO_CHAR(x.aebitacoracomentarios_fecha, 'YYYY-MM-DD, HH:mi:ss') as comment_fecha, 
      u.aeusu_nombre as comment_nombre, x.aebitacoracomentarios_descripcion as comment_desc 
      FROM data.aebitacora c, data.aebitacora_comentarios x, engine.aeusu u
      WHERE x.aebitacora_id=$1
      AND x.aebitacoracomentarios_estado=1
      AND c.aebitacora_id=x.aebitacora_id
      AND x.aeusu_id=u.aeusu_id
      ORDER BY x.aebitacoracomentarios_fecha ASC`;
export const observacionesInsertComments = `
        INSERT INTO data.aebitacora_comentarios(
        aebitacoracomentarios_id, aebitacora_id, aeusu_id, aebitacoracomentarios_fecha, 
        aebitacoracomentarios_descripcion, aebitacoracomentarios_estado)
        VALUES ((SELECT COALESCE((MAX(aebitacoracomentarios_id)+1), 1)  FROM data.aebitacora_comentarios), 
            $1, $2, $3, $4, 1);`;
export const observacionesDelete = `
    -- DELETE A OBSERVACION (aebitacora no posee columna estado; se elimina el registro y sus comentarios)
        WITH borrada AS (
            DELETE FROM data.aebitacora
            WHERE 
                aebitacora_id=$1
                AND aeanol_id=$2
                AND aeinst_id=$3
                AND (aeusu_id=$4 OR 1=$5)
            RETURNING aebitacora_id
        )
        DELETE FROM data.aebitacora_comentarios WHERE aebitacora_id IN (SELECT aebitacora_id FROM borrada);
    `;
export default {
  observacionAdd: observacionAdd,
  notificationAdd: notificationAdd,
  contactoStudentOne: contactoStudentOne,
  contactoStudent: contactoStudent,
  observacionesListOne: observacionesListOne,
  observacionesListTeachers: observacionesListTeachers,
  observacionesListStudents: observacionesListStudents,
  observacionesListAdmins: observacionesListAdmins,
  observacionesListComments: observacionesListComments,
  observacionesInsertComments: observacionesInsertComments,
  observacionesDelete: observacionesDelete
};
