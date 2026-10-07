export const viewAsigments = `
  --LISTADO DE ASIGNATURAS DE UN GRUPO PARA QUE EL PADRE DE FAMILIA CONSULTE A ESE DOCENTE
    SELECT row_to_json(u) as listaasignaturas
      FROM (
        SELECT  
          a.aedocentes_id, d.aedocentes_nombres || ' ' || d.aedocentes_apellidos as aedocente, 
          a.aeasignaciones_asignatura, a.aeasignaciones_enlace
        FROM data.aeasignaciones a, data.aedocentes d
        WHERE a.aeanol_id=$1
        AND a.aeinst_id=$2
        AND lower(a.aeasignaciones_grupo) LIKE lower($3)
        AND a.aeasignaciones_estado=1
        AND a.aedocentes_id = d.aedocentes_id
        GROUP BY a.aedocentes_id, a.aeasignaciones_asignatura, 
        d.aedocentes_nombres || ' ' || d.aedocentes_apellidos, a.aeasignaciones_enlace
        ORDER BY a.aeasignaciones_asignatura,aedocente
    ) u`;
export const insertAskTeacher = `
    --INSERTAR CONSULTA HECHA POR UN ACUDIENTE A UN DOCENTE DE SU ELECCION
    INSERT INTO data.aeconsultasdocentes(
      aeconsultasdocentes_id, aeconsultasdocentes_fecha, aeestudiantes_id, aeasignaciones_asignatura, 
      aedocente_id, aeinst_id, aeanol_id, aeconsultasdocentes_descripcion, 
      aeconsultasdocentes_visibilidad, aeconsultasdocentes_estado)
    VALUES ((SELECT COALESCE((MAX(aeconsultasdocentes_id)+1), 1)  FROM data.aeconsultasdocentes), $1, $2, $3, $4, $5, $6, $7, false, 1)RETURNING aeconsultasdocentes_id;`;
export const listAskTeacher = `
    -- LISTADO DE CONSULTAS AL DOCENTE
    SELECT row_to_json(u) as list
      FROM (
      SELECT c.aeconsultasdocentes_id, TO_CHAR(c.aeconsultasdocentes_fecha, 'YYYY-MM-DD, HH:mi:ss') as aeconsultasdocentes_fecha,
        c.aeconsultasdocentes_descripcion, c.aeasignaciones_asignatura,
        initcap(lower(d.aedocentes_nombres || ' ' || d.aedocentes_apellidos)) as docente,
        (e.aeestudiantes_apellidos || ' ' || e.aeestudiantes_nombres)as estudiante,
        (SELECT f.aeestudiantes_nombresacudiente || ' ' || f.aeestudiantes_apellidosacudiente
        FROM data.aeacudientes f
        WHERE f.aeacudientes_id=e.aeacudientes_id) as acudiente,
        c.aeconsultasdocentes_estado, c.aeconsultasdocentes_visibilidad,
        (SELECT COUNT(m.aeconsultasdocentescomentarios_id)
        FROM data.aeconsultasdocentes_comentarios m
        WHERE m.aeconsultasdocentes_id=c.aeconsultasdocentes_id) as comentarios        
      FROM data.aeconsultasdocentes c, data.aedocentes d, data.aeestudiantes e
      WHERE c.aeanol_id=$1
      AND c.aeinst_id=$2
      AND c.aeestudiantes_id IN ($3)
      AND TO_CHAR(c.aeconsultasdocentes_fecha, 'YYYY-MM-DD') BETWEEN TO_CHAR((current_date - interval '180 days'), 'YYYY-MM-DD') AND TO_CHAR(current_date, 'YYYY-MM-DD')
      AND c.aedocente_id=d.aedocentes_id
      AND c.aeestudiantes_id=e.aeestudiantes_id
      ORDER BY c.aeconsultasdocentes_fecha DESC
    ) u`;
export const listAskTeacherComments = `
    -- COMENTARIOS DE UNA CONSULTA A UN DOCENTE
    SELECT row_to_json(u) as list 
    FROM(
      SELECT TO_CHAR(x.aeconsultasdocentescomentarios_fecha, 'YYYY-MM-DD, HH:mi:ss') as comment_fecha, 
      u.aeusu_nombre as comment_nombre, x.aeconsultasdocentescomentarios_descripcion as comment_desc 
      FROM data.aeconsultasdocentes c, data.aeconsultasdocentes_comentarios x, engine.aeusu u
      WHERE x.aeconsultasdocentes_id=$1
      AND x.aeconsultasdocentescomentarios_estado=1
      AND c.aeconsultasdocentes_id=x.aeconsultasdocentes_id
      AND x.aeusu_id=u.aeusu_id
      ORDER BY x.aeconsultasdocentescomentarios_fecha ASC
    ) u`;
export const insertAskTeacherComments = `
    INSERT INTO data.aeconsultasdocentes_comentarios(
      aeconsultasdocentescomentarios_id, aeconsultasdocentes_id, aeusu_id, aeconsultasdocentescomentarios_fecha, 
      aeconsultasdocentescomentarios_descripcion, aeconsultasdocentescomentarios_estado)
    VALUES ((SELECT COALESCE((MAX(aeconsultasdocentescomentarios_id)+1), 1)  FROM data.aeconsultasdocentes_comentarios), 
          $1, $2, $3, $4, 1);  
    `;
export const cronogramaSelect = `
    -- CRONOGRAMA DE EVENTOS EN UNA INSTITUCION DURANTE FECHAS ESPECIFICAS
    SELECT 
    c.aecronograma_id, c.aeinst_id, c.aeano_id, t.aecronogramatipoevento_descripcion, t.aecronogramatipoevento_color, c.aecronograma_grupo, 
    c.aeusu_id, c.aecronograma_fecharegistro, c.aecronograma_fechainicio, c.aecronograma_fechafin, 
    c.aecronograma_titulo, c.aecronograma_descripcion, c.aecronograma_adjunto, c.aecronograma_responsables,
    (
      SELECT COUNT(x.aecronogramacomentario_id)
      FROM data.aecronograma_comentarios x
      WHERE x.aecronograma_id=c.aecronograma_id
    ) as aecronograma_comentarios
    FROM data.aecronograma c, data.aecronograma_tipoevento t
    WHERE c.aeinst_id=$2
    AND c.aeano_id=$1
    AND c.aecronograma_estado = 1
    AND (
      c.aecronograma_grupo = '{}'
      OR $5 = ANY(c.aecronograma_grupo)
    )
    AND (
      c.aecronograma_fechainicio BETWEEN $3 AND $4
      OR c.aecronograma_fechafin BETWEEN $3 AND $4
    )
    AND c.aecronogramatipoevento_id=t.aecronogramatipoevento_id
    ORDER BY c.aecronograma_fechainicio, c.aecronogramatipoevento_id`;
export const cronogramaInsert = `
    -- REGISTRO DE CRONOGRAMA PARA EL COLEGIO
    INSERT INTO data.aecronograma
    (aecronograma_id, aeinst_id, aeano_id, aecronogramatipoevento_id, 
      aecronograma_grupo, aeusu_id, aecronograma_estado, aecronograma_fecharegistro, 
      aecronograma_fechainicio, aecronograma_fechafin, aecronograma_titulo, 
      aecronograma_descripcion, aecronograma_responsables, aecronograma_adjunto)     
    VALUES(
      (SELECT COALESCE((MAX(aecronograma_id)+1), 1) FROM data.aecronograma), $1, $2, $3, 
      $4, $5, 1, CURRENT_TIMESTAMP, 
      $6, $7, $8, 
      $9, $11, $10) RETURNING aecronograma_id;`;
export const cronogramaUpdate = `
    -- UPDATE DE CRONOGRAMA PARA EL COLEGIO
    UPDATE data.aecronograma
    SET aeano_id=$2, aeinst_id=$3, aeusu_id=$4, aecronograma_grupo=$5,
    aecronograma_fecharegistro=CURRENT_TIMESTAMP, aecronograma_fechainicio=$6, aecronograma_fechafin=$7, 
    aecronograma_titulo=$8, aecronograma_descripcion=$9, aecronograma_adjunto=$10
    WHERE aecronograma_id=$1;`;
export const cronogramaDelete = `
    -- ELIMINAR UN CRONOGRAMA
    UPDATE data.aecronograma 
    SET aecronograma_estado=0
    WHERE aecronograma_id=$1 
    AND (aeusu_id=$2 OR 1 = $3 );`;
export const cronogramaAlertinsert = `
    -- INSERTAR ALERTAS PARA UN EVENTO EN EL CRONOGRAMA
    INSERT INTO data.aecronograma_alerta
    (aecronogramaalerta_id, aecronograma_id, aecronogramaalerta_fecha)
    VALUES((SELECT COALESCE((MAX(aecronogramaalerta_id)+1), 1) FROM data.aecronograma_alerta), 
    $1, $2) RETURNING aecronogramaalerta_id;`;
export const cronogramaAlertDelete = `
    -- ELIMINAR ALERTAS DE UN CRONOGRAMA
    DELETE FROM data.aecronograma_alerta WHERE aecronograma_id=$1;`;
export const cronogramaCommentInsert = `
    -- INSERTAR COMENTARIOS EN UN EVENTO EN EL CRONOGRAMA
    INSERT INTO data.aecronograma_comentarios
    (aecronogramacomentario_id, aecronograma_id, aeusu_id, aecronogramacomentario_descripcion, aecronogramacomentario_fecha)
    VALUES((SELECT COALESCE((MAX(aecronogramacomentario_id)+1), 1) FROM data.aecronograma_comentarios),
    $1, $2, $3, CURRENT_TIMESTAMP) RETURNING aecronogramacomentario_id;`;
export const cronogramaCommentUpdate = `
    -- CAMBIAR COMENTARIOS EN UN EVENTO EN EL CRONOGRAMA
    UPDATE data.aecronograma_comentarios
    SET aecronograma_id=$2, aeusu_id=$3, aecronogramacomentario_descripcion=$4, 
    aecronogramacomentario_fecha=CURRENT_TIMESTAMP
    WHERE aecronogramacomentario_id=$1;`;
export const cronogramaCommentDelete = `
    -- ELIMINAR COMENTARIOS DE UN CRONOGRAMA
    DELETE FROM data.aecronograma_comentarios WHERE aecronograma_id=$1;`;
export const cronogramaCommentSelect = `
    -- VER COMENTARIOS EN UN CRONOGRAMA
    SELECT row_to_json(u) as list
    FROM (    
		  SELECT  
	      aecronogramacomentario_id, aecronograma_id, aeusu_id,
	      aecronogramacomentario_descripcion, aecronogramacomentario_fecha
	    FROM data.aecronograma_comentarios 
	    WHERE aecronograma_id=$1
	    ORDER BY aecronogramacomentario_fecha DESC
   	) u;`;
export const cronogramaTipoEventoSelect = `
    -- VER LOS TIPOS DE EVENTO PARA EL CRONOGRAMA
    SELECT  
      aecronogramatipoevento_id as id, aecronogramatipoevento_descripcion as descripcion, aecronogramatipoevento_color as color
    FROM data.aecronograma_tipoevento 
    WHERE aecronogramatipoevento_estado=$1
    ORDER BY aecronogramatipoevento_descripcion;`;
export default {
  viewAsigments: viewAsigments,
  insertAskTeacher: insertAskTeacher,
  listAskTeacher: listAskTeacher,
  listAskTeacherComments: listAskTeacherComments,
  insertAskTeacherComments: insertAskTeacherComments,
  cronogramaSelect: cronogramaSelect,
  cronogramaInsert: cronogramaInsert,
  cronogramaUpdate: cronogramaUpdate,
  cronogramaDelete: cronogramaDelete,
  cronogramaAlertinsert: cronogramaAlertinsert,
  cronogramaAlertDelete: cronogramaAlertDelete,
  cronogramaCommentInsert: cronogramaCommentInsert,
  cronogramaCommentUpdate: cronogramaCommentUpdate,
  cronogramaCommentDelete: cronogramaCommentDelete,
  cronogramaCommentSelect: cronogramaCommentSelect,
  cronogramaTipoEventoSelect: cronogramaTipoEventoSelect
};
