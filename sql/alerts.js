module.exports={
  rowsviewGroupsJSON:`
  -- GRUPOS DE UNA INSTITUCION EN UN ANO LECTIVO
  SELECT array_agg (g.aeestudiantes_grupo) AS grupos
  FROM data.aegrupos g
  WHERE g.aeinstitucion_id=$2
  AND g.aeano_id=$1;`,
  rowsviewGroups:`
  -- GRUPOS DE UNA INSTITUCION EN UN ANO LECTIVO
  SELECT g.aeestudiantes_grupo, COALESCE(NULLIF(regexp_replace(g.aeestudiantes_grupo, '[^0-9]*','','g'), '')::NUMERIC, 0) as orden
  FROM data.aegrupos g
  WHERE g.aeinstitucion_id=$2
  AND g.aeano_id=$1
  ORDER BY orden, aeestudiantes_grupo;`,
  consulalerts: `
  -- VIEW ALERTS FOR ANOLECTIVO AND INSTITUCION
  SELECT row_to_json(u)
    FROM (
      SELECT a.aeavisos_id, aeusu_id, aeavisos_titulo, aeavisos_descripcion, 
      aeavisos_grupo, aeavisos_estudiantesid, aeavisos_adjunto,
      aeavisos_fecha, aeavisos_fechapublicacion, aeavisos_fechafinalizacion, e.aeestados_descripcion as estado
      FROM data.aeavisos a, data.aeestados e
      WHERE a.aeinst_id=$1
      AND a.aeanol_id=$2
      AND a.aeavisos_estado=e.aeestados_id
  ) u`,

  viewComments:`
  --LISTADO DE COMENTARIOS EN UN AVISO
    SELECT 
    'a las ' || TO_CHAR(aeavisoscomentarios_fecha, 'HH24:MI')
    || ' del ' ||
    CASE 
      WHEN (TO_CHAR(aeavisoscomentarios_fecha, 'D') = '1') THEN 'Dom'
      WHEN (TO_CHAR(aeavisoscomentarios_fecha, 'D') = '2') THEN 'Lun'
      WHEN (TO_CHAR(aeavisoscomentarios_fecha, 'D') = '3') THEN 'Mar'
      WHEN (TO_CHAR(aeavisoscomentarios_fecha, 'D') = '3') THEN 'Mié'
      WHEN (TO_CHAR(aeavisoscomentarios_fecha, 'D') = '3') THEN 'Jue'
      WHEN (TO_CHAR(aeavisoscomentarios_fecha, 'D') = '3') THEN 'Vie'
      WHEN (TO_CHAR(aeavisoscomentarios_fecha, 'D') = '3') THEN 'Sáb'
    END    
    || TO_CHAR(aeavisoscomentarios_fecha, ', DD-mon-YYYY') AS fecha, 
    aeusu_nombre as usuario, 
    aeavisoscomentarios_descripcion as descripcion,
    CASE 
      WHEN (u.aeroll_id = 1) THEN 'danger'
      WHEN (u.aeroll_id = 2) THEN 'warning'
      WHEN (u.aeroll_id = 3) THEN 'primary'
    END
    AS rol
    FROM 
      data.aeavisos_comentarios c LEFT JOIN engine.aeusu u
        ON (c.aeusu_id=u.aeusu_id)
    WHERE 
      aeavisos_id = $1
    ORDER BY aeavisoscomentarios_fecha DESC`,

  viewCommentsStudent:`
  --LISTADO DE COMENTARIOS EN UN AVISO PARA UN ACUDIENTE
    SELECT 
    'a las ' || TO_CHAR(aeavisoscomentarios_fecha, 'HH24:MI')
    || ' del ' ||
    CASE 
      WHEN (TO_CHAR(aeavisoscomentarios_fecha, 'D') = '1') THEN 'Dom'
      WHEN (TO_CHAR(aeavisoscomentarios_fecha, 'D') = '2') THEN 'Lun'
      WHEN (TO_CHAR(aeavisoscomentarios_fecha, 'D') = '3') THEN 'Mar'
      WHEN (TO_CHAR(aeavisoscomentarios_fecha, 'D') = '4') THEN 'Mié'
      WHEN (TO_CHAR(aeavisoscomentarios_fecha, 'D') = '5') THEN 'Jue'
      WHEN (TO_CHAR(aeavisoscomentarios_fecha, 'D') = '6') THEN 'Vie'
      WHEN (TO_CHAR(aeavisoscomentarios_fecha, 'D') = '7') THEN 'Sáb'
    END    
    || TO_CHAR(aeavisoscomentarios_fecha, ', DD-mon-YYYY') AS fecha, 
    aeusu_nombre AS usuario, 
    aeavisoscomentarios_descripcion AS descripcion,
    CASE 
      WHEN (u.aeroll_id = 1) THEN 'danger'
      WHEN (u.aeroll_id = 2) THEN 'warning'
      WHEN (u.aeroll_id = 3) THEN 'primary'
      ELSE 'secondary'
    END AS rol
    FROM 
      data.aeavisos_comentarios c LEFT JOIN engine.aeusu u
        ON (c.aeusu_id=u.aeusu_id)
    WHERE aeavisos_id = $1
    AND c.aeusu_id=$2
    ORDER BY aeavisoscomentarios_fecha DESC`,

  alertsFind: `
    -- VIEW ALERTS FOR reference
    SELECT 
      aeavisos_id AS idregistro, a.aeusu_id as idusuario, u.aeusu_nombre AS emisor,
      aeavisos_titulo AS title, aeavisos_descripcion AS comunicate, 
      aeavisos_grupo AS group, aeavisos_estudiantesid as student, aeavisos_adjunto as file,
      TO_CHAR(aeavisos_fecha, 'YYYY-MM-DD HH24:MI') AS dateregistro, TO_CHAR(aeavisos_fechapublicacion, 'YYYY-MM-DD HH24:MI') AS date_init, 
      TO_CHAR(aeavisos_fechafinalizacion, 'YYYY-MM-DD HH24:MI') AS date_finish, aeavisos_estado AS idestado, 
      aeavisos_alcance AS alcance, aeavisos_aceptarespuestas AS respuestas,
      i.aeinst_id AS idinstitucion, i.aeinst_nombre AS nombreinstitucion, i.calendario, 
      i.aeinst_direccion AS direccion, i.aeinst_telefono AS telefono, 
      i.aeinst_mail AS mail, i.aeinst_escudo AS escudo, i.aeinst_facebook AS facebook
    FROM 
      data.aeavisos a LEFT JOIN engine.aeusu u
        ON (a.aeusu_id=u.aeusu_id)
      LEFT JOIN DATA.aeinstituciones i
        ON (a.aeinst_id=i.aeinst_id)
      LEFT JOIN data.aeestados e
        ON (a.aeavisos_estado=e.aeestados_id)
    WHERE 
      aeavisos_id=$1
      AND aeavisos_estado<>0
      AND CURRENT_TIMESTAMP <= aeavisos_fechafinalizacion;`,

  alertsDelete: `
  -- DELETE AN ALERT, SEND _estado TO 0
    UPDATE data.aeavisos
    SET aeavisos_estado = 0
    WHERE aeavisos_id = $1
    AND aeanol_id=$2
    AND aeinst_id=$3
    AND (aeusu_id=$4 OR 1=$5)`,

  alertsEdit:`
  -- CHANGE AN ALERT, SOME COLUMNS OFF QUERY
  UPDATE data.aeavisos
  SET 
      aeavisos_grupo=$2, aeavisos_estudiantesid=$3, aeavisos_fecha=$4, aeavisos_fechafinalizacion=$5, 
      aeavisos_titulo=$6, aeavisos_descripcion=$7, aeavisos_adjunto=$8, aeavisos_estado=$9,
      aeavisos_alcance=$10, aeavisos_aceptarespuestas=$11
  WHERE aeavisos_id=$1 RETURNING aeavisos_id`,

  //VER LAS NOTIFICACIONES REGISTRADAS PARA UN aeusu_id
  notificationUser:`
  -- CONSULTAR NOTIFICACIONES DE MI USUARIO DESDE HACE ALGUN TIEMPO
  SELECT n.aenotificaciones_id, u.aeusu_nombre, n.aenotificaciones_para, TO_CHAR(n.aenotificaciones_fecha, 'YYYY-MM-DD, HH:mi') as aenotificaciones_fecha, 
  n.aenotificaciones_title, n.aenotificaciones_body, n.aenotificaciones_ruta, 
  n.aenotificaciones_referencia, n.aenotificaciones_data, 
  n.aenotificaciones_estado, e.aeestados_descripcion, e.aeestados_icons , e.aeestados_style
  FROM data.aenotificaciones n, engine.aeusu u, data.aeestados e
  WHERE $1 = ANY(n.aenotificaciones_para)
  AND TO_CHAR(n.aenotificaciones_fecha, 'MM') >= TO_CHAR((CURRENT_DATE - INTERVAL '3 months'), 'MM')
  AND n.aenotificaciones_de=u.aeusu_id
  AND n.aenotificaciones_estado = e.aeestados_id
  ORDER BY n.aenotificaciones_fecha DESC, n.aenotificaciones_title;`,

  //VER LAS NOTIFICACIONES REGISTRADAS PARA UN aeinst_id y un aeanol_id
  notificationGlobal:`
  -- CONSULTAR NOTIFICACIONES DE LOS DOCENTES DE MI INSTITUCION DESDE HACE ALGUN TIEMPO
  SELECT n.aenotificaciones_id, u.aeusu_nombre, n.aenotificaciones_para, TO_CHAR(n.aenotificaciones_fecha, 'YYYY-MM-DD, HH:mi') as aenotificaciones_fecha, 
  n.aenotificaciones_title, n.aenotificaciones_body, n.aenotificaciones_ruta, 
  n.aenotificaciones_referencia, n.aenotificaciones_data,
  n.aenotificaciones_estado, e.aeestados_descripcion, e.aeestados_icons , e.aeestados_style 
  FROM data.aenotificaciones n, engine.aeusu u, data.aeestados e
  WHERE TO_CHAR(n.aenotificaciones_fecha, 'MM') >= TO_CHAR((CURRENT_DATE - INTERVAL '3 months'), 'MM')
  AND n.aenotificaciones_para <@  (
      SELECT array_agg(aeusu_id::DOUBLE PRECISION) AS aeusu_id 
      FROM engine.aeusuroll
      WHERE aeinst_id = $2
      AND aeanol_id = $1
      AND aeroll_id = 2 OR aeroll_id = 1
  )
  AND n.aenotificaciones_de=u.aeusu_id
  AND n.aenotificaciones_estado = e.aeestados_id
  ORDER BY n.aenotificaciones_fecha DESC, n.aenotificaciones_title;`,

  notificationUser:`
  -- LISTAR UN COMUNICADO PARA VERLO SI NO ESTA ELIMINADO

  `,

  answerComunicado:`
  -- RESPUESTA A UN COMUNICADO POR PARTE DE UN USUARIO AUTENTICADO
  INSERT INTO data.aeavisos_comentarios(
    aeavisoscomentarios_id, aeavisos_id, aeusu_id, aeavisoscomentarios_fecha, aeavisoscomentarios_descripcion, aeavisoscomentarios_estado)
  VALUES ((SELECT COALESCE(MAX(aeavisoscomentarios_id)+1, 1) FROM data.aeavisos_comentarios), $1, $2, current_timestamp, $3, 1)
  RETURNING aeavisoscomentarios_id;`,

  comunicadoRegisterNotification:`
  -- REGISTRAR LA NOTIFICACION CUANDO SE ENVIA UN COMUNICADO
  INSERT INTO data.aenotificaciones(
      aenotificaciones_id, aenotificaciones_de, aenotificaciones_para, aenotificaciones_fecha, 
      aenotificaciones_title, aenotificaciones_body, aenotificaciones_ruta, aenotificaciones_referencia, aenotificaciones_data)
  VALUES ((SELECT COALESCE(MAX(aenotificaciones_id)+1, 1) FROM data.aenotificaciones), $1, $2, current_timestamp, $3, $4, $5, $6, $7) 
  RETURNING aenotificaciones_id`,


  comunicadoDestinatarios:`
  -- CONSULTAR LOS ID DE TODOS LOS QUE RECIBEN UN COMUNICADO DEL COLEGIO O DE UN PROFESOR
  SELECT * FROM engine.contacto_user(
      (SELECT 
      CASE WHEN (aeavisos_estudiantesid  = '{}') THEN 
              (SELECT array_agg(e.aeusu_id)
              FROM data.aeestudiantes e
              WHERE e.aeestudiantes_grupo = ANY (a.aeavisos_grupo)) 		
          ELSE 
              (SELECT array_agg(e.aeusu_id)
              FROM data.aeestudiantes e
              WHERE e.aeestudiantes_id = ANY (a.aeavisos_estudiantesid) ) 
      END AS aeusu_id
      FROM data.aeavisos a
      WHERE a.aeavisos_id= $1
      )
  );`,
}
