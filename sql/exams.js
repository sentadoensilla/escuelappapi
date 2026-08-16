module.exports={
    consulexams:  `SELECT row_to_json(u)
    FROM (
      SELECT c.aecue_id as idcuestionario, 
      c.aecue_nombre as nombre, 
      c.aecue_descripcion as descripcion,
      c.aecue_imagen as imagen,
      c.aecue_asignatura as asignatura,
      (SELECT COUNT(p.aepre_id) 
      FROM data.aepre p 
      WHERE p.aecue_id=c.aecue_id 
      ) as preguntas,
      (SELECT COUNT(o.aeopcres_id) 
      FROM data.aeopcres o, data.aepre p 
      WHERE p.aecue_id=c.aecue_id
      AND o.aepre_id=p.aepre_id ) as opciones,
      (
      SELECT array_agg(aeinst_cue_id)
      FROM data.inst_cue t
      WHERE t.aecue_id=c.aecue_id
      ) as idprogramacion,
      (
      SELECT array_agg(aeestudiantes_grupo)
      FROM data.inst_cue t
      WHERE t.aecue_id=c.aecue_id
      ) as grupos,
      x.aeinst_cue_fechaini,
      x.aeinst_cue_fechafin,
      x.aeinst_cue_duracion,
      x.aeinst_cue_intentos,
      x.aeinst_cue_tipointento,
      ti.aetipint_descripcion as tipointento,
      x.aeinst_cue_ordenado,
      x.aeinst_cue_resultadominimo,
      (SELECT count(y.inst_cue_res_id) as cantidad
      FROM data.inst_cue p, data.inst_cue_res y
      WHERE p.aecue_id=c.aecue_id  -- ID DEL CUESTIONARIO
      AND y.aeinst_cue_id=p.aeinst_cue_id
      ) as intentosrealizados,
      (
        SELECT
          array_to_json(array_agg(y))
        FROM (
          SELECT 
            e.aecue_id, e.aecue_nombre, e.aecue_descripcion, 
            p.aepre_id, p.aetippre_id, p.aepre_descripcion, p.aepre_orden,
            (
            SELECT
              array_to_json(array_agg(o))
            FROM (
              SELECT aeopcres_id, aeopcres_descripcion, aeopcres_valor,aepre_id 
              FROM data.aeopcres 
              WHERE aepre_id= p.aepre_id -- AQUI VA EL ID DE LA PREGUNTA
              AND aeopcres_estado=true 
              ORDER BY aeopcres_orden
            ) o
            ) as opciones,
          (
            SELECT
              array_agg(r)
            FROM (
              SELECT COUNT(r.aeres_id) as respuestas
              FROM data.aeres r
              WHERE r.aepre_id=p.aepre_id -- AQUI VA EL ID DE LA PREGUNTA
            ) r
          ) as respuestas
          FROM 
            data.aecue e, data.aepre p, data.aetippre t
          WHERE e.aecue_id  = c.aecue_id -- AQUI VA EL ID DEL CUESTIONARIO
            AND e.aecue_id = p.aecue_id 
            AND p.aetippre_id = t.aetippre_id
          ORDER BY p.aepre_orden, p.aepre_id
        ) y
      ) as detalles
      FROM data.aecue c, data.inst_cue x, data.aetipint ti
      WHERE x.aeusu_id = $1 -- ID DEL USUARIO
      AND x.aeinst_cue_estado=1
      AND c.aecue_id=x.aecue_id
      AND x.aeinst_cue_tipointento=ti.aetipint_id
      GROUP BY c.aecue_id, x.aeinst_cue_fechaini,
      x.aeinst_cue_fechafin, x.aeinst_cue_duracion,
      x.aeinst_cue_intentos, x.aeinst_cue_tipointento,
      ti.aetipint_descripcion, x.aeinst_cue_ordenado,
      x.aeinst_cue_resultadominimo
    ) u;`, 
   
    consulexams_reference:  `SELECT row_to_json(u)
    FROM (
      SELECT c.aecue_id as idcuestionario, 
      c.aecue_nombre as nombre, 
      c.aecue_descripcion as descripcion,
      c.aecue_imagen as imagen,
      c.aecue_asignatura as asignatura,
      (d.aedocentes_nombres || ' ' || d.aedocentes_apellidos) AS docente,
      (SELECT COUNT(p.aepre_id) 
      FROM data.aepre p 
      WHERE p.aecue_id=c.aecue_id 
      ) as preguntas,
      (SELECT COUNT(o.aeopcres_id) 
      FROM data.aeopcres o, data.aepre p 
      WHERE p.aecue_id=c.aecue_id
      AND o.aepre_id=p.aepre_id ) as opciones,
      (
      SELECT array_agg(aeinst_cue_id)
      FROM data.inst_cue t
      WHERE t.aecue_id=c.aecue_id
      ) as idprogramacion,
      (
      SELECT array_agg(aeestudiantes_grupo)
      FROM data.inst_cue t
      WHERE t.aecue_id=c.aecue_id
      ) as grupos,
      x.aeinst_cue_fechaini,
      x.aeinst_cue_fechafin,
      x.aeinst_cue_duracion,
      x.aeinst_cue_intentos,
      x.aeinst_cue_tipointento,
      ti.aetipint_descripcion as tipointento,
      x.aeinst_cue_ordenado,
      x.aeinst_cue_resultadominimo,
      (SELECT count(y.inst_cue_res_id) as cantidad
      FROM data.inst_cue p, data.inst_cue_res y
      WHERE p.aecue_id=c.aecue_id  -- ID DEL CUESTIONARIO
      AND y.aeinst_cue_id=p.aeinst_cue_id
      ) as intentosrealizados,
      (
        SELECT
          array_to_json(array_agg(y))
        FROM (
          SELECT 
            e.aecue_id, e.aecue_nombre, e.aecue_descripcion, 
            p.aepre_id, p.aetippre_id, p.aepre_descripcion, p.aepre_orden,
            (
            SELECT
              array_to_json(array_agg(o))
            FROM (
              SELECT aeopcres_id, aeopcres_descripcion, aeopcres_valor,aepre_id 
              FROM data.aeopcres 
              WHERE aepre_id= p.aepre_id -- AQUI VA EL ID DE LA PREGUNTA
              AND aeopcres_estado=true 
              ORDER BY aeopcres_orden
            ) o
            ) as opciones,
          (
            SELECT
              array_agg(r)
            FROM (
              SELECT COUNT(r.aeres_id) as respuestas
              FROM data.aeres r
              WHERE r.aepre_id=p.aepre_id -- AQUI VA EL ID DE LA PREGUNTA
            ) r
          ) as respuestas
          FROM 
            data.aecue e, data.aepre p, data.aetippre t
          WHERE e.aecue_id  = c.aecue_id -- AQUI VA EL ID DEL CUESTIONARIO
            AND e.aecue_id = p.aecue_id 
            AND p.aetippre_id = t.aetippre_id
          ORDER BY p.aepre_orden, p.aepre_id
        ) y
      ) as detalles
      FROM data.aecue c, data.inst_cue x, data.aedocentes d, data.aetipint ti
      WHERE x.aeinst_cue_id = $1  -- ID DE LA PROGRAMACION
      AND x.aeinst_cue_estado=1
      AND c.aecue_id=x.aecue_id
      AND x.aeusu_id = d.aeusu_id
      AND x.aeinst_cue_tipointento=ti.aetipint_id
      GROUP BY c.aecue_id, x.aeinst_cue_fechaini,
      d.aedocentes_nombres || ' ' || d.aedocentes_apellidos,
      x.aeinst_cue_fechafin, x.aeinst_cue_duracion,
      x.aeinst_cue_intentos, x.aeinst_cue_tipointento,
      ti.aetipint_descripcion, x.aeinst_cue_ordenado,
      x.aeinst_cue_resultadominimo
    ) u;`, 

  consulallexam : `SELECT row_to_json(u)
  FROM (
    SELECT c.aecue_id as idcuestionario, 
    c.aecue_nombre as nombre, 
    c.aecue_descripcion as descripcion,
    c.aecue_imagen as imagen,
    c.aecue_asignatura as asignatura,
    (SELECT COUNT(p.aepre_id) 
    FROM data.aepre p 
    WHERE p.aecue_id=c.aecue_id 
    ) as preguntas,
    (SELECT COUNT(o.aeopcres_id) 
    FROM data.aeopcres o, data.aepre p 
    WHERE p.aecue_id=c.aecue_id
    AND o.aepre_id=p.aepre_id ) as opciones,
    (
    SELECT array_agg(aeinst_cue_id)
    FROM data.inst_cue t
    WHERE t.aecue_id=c.aecue_id
    ) as idprogramacion,
    (
    SELECT array_agg(aeestudiantes_grupo)
    FROM data.inst_cue t
    WHERE t.aecue_id=c.aecue_id
    ) as grupos,
    x.aeinst_cue_fechaini,
    x.aeinst_cue_fechafin,
    x.aeinst_cue_duracion,
    x.aeinst_cue_intentos,
    x.aeinst_cue_tipointento,
    ti.aetipint_descripcion as tipointento,
    x.aeinst_cue_ordenado,
    x.aeinst_cue_resultadominimo,		
    (
      SELECT
        array_to_json(array_agg(y))
      FROM (
        SELECT 
          e.aecue_id, e.aecue_nombre, e.aecue_descripcion, 
          p.aepre_id, p.aetippre_id, p.aepre_descripcion, p.aepre_orden,
          (
        SELECT
          array_to_json(array_agg(o))
        FROM (
          SELECT aeopcres_id, aeopcres_descripcion, aeopcres_valor,aepre_id 
          FROM data.aeopcres 
          WHERE aepre_id= p.aepre_id -- AQUI VA EL ID DE LA PREGUNTA
          AND aeopcres_estado=true 
          ORDER BY aeopcres_orden
        ) o
          ) as opciones
        FROM 
          data.aecue e, data.aepre p, data.aetippre t
        WHERE e.aecue_id  = c.aecue_id -- AQUI VA EL ID DEL CUESTIONARIO
          AND e.aecue_id = p.aecue_id 
          AND p.aetippre_id = t.aetippre_id
        ORDER BY p.aepre_orden, p.aepre_id
      ) y
    ) as detalles
    FROM data.aecue c, data.inst_cue x, data.aetipint ti
    WHERE x.aeinst_id = $1 -- ID institucion
    AND x.aeano_id = $2
    AND x.aeestudiantes_grupo LIKE $3 -- grupo
    AND x.aeinst_cue_estado=1
    AND c.aecue_estado=true
    AND TO_CHAR(current_date, 'YYYY-MM-DD HH24:MI:SS') 
    BETWEEN TO_CHAR(x.aeinst_cue_fechaini, 'YYYY-MM-DD HH24:MI:SS') 
    AND TO_CHAR(x.aeinst_cue_fechafin, 'YYYY-MM-DD HH24:MI:SS')  -- ESTE ARGUMENTO ES IMPORTANTE, LA FECHA ACTUAL                 
        AND c.aecue_id=x.aecue_id
        AND x.aeinst_cue_tipointento=ti.aetipint_id
        GROUP BY c.aecue_id, c.aecue_imagen,
        x.aeinst_cue_fechaini,
        x.aeinst_cue_fechafin, x.aeinst_cue_duracion,
        x.aeinst_cue_intentos, x.aeinst_cue_tipointento,
        ti.aetipint_descripcion, x.aeinst_cue_ordenado,
        x.aeinst_cue_resultadominimo
        ORDER BY c.aecue_id
      ) u;`,
                
  
  
  consulExamsAdmin:`SELECT row_to_json(u)
	FROM (
		SELECT c.aecue_id as idcuestionario, 
		c.aecue_nombre as nombre, 
		c.aecue_descripcion as descripcion,
		c.aecue_imagen as imagen,
		(SELECT aedocentes_nombres || ' ' || aedocentes_apellidos
		FROM data.aedocentes 
		WHERE aeusu_id=x.aeusu_id) as docente,
		(SELECT COUNT(p.aepre_id) 
		FROM data.aepre p 
		WHERE p.aecue_id=c.aecue_id 
		) as preguntas,
		(SELECT COUNT(o.aeopcres_id) 
		FROM data.aeopcres o, data.aepre p 
		WHERE p.aecue_id=c.aecue_id
		AND o.aepre_id=p.aepre_id ) as opciones,
		(
		SELECT array_agg(aeinst_cue_id)
		FROM data.inst_cue t
		WHERE t.aecue_id=c.aecue_id
		) as idprogramacion,
		(
		SELECT array_agg(aeestudiantes_grupo)
		FROM data.inst_cue t
		WHERE t.aecue_id=c.aecue_id
		) as grupos,
		x.aeinst_cue_fechaini,
		x.aeinst_cue_fechafin,
		x.aeinst_cue_duracion,
		x.aeinst_cue_intentos,
		x.aeinst_cue_tipointento,
		ti.aetipint_descripcion as tipointento,
		x.aeinst_cue_ordenado,
		x.aeinst_cue_resultadominimo,		
		(
		SELECT
			array_to_json(array_agg(y))
		FROM (
			SELECT 
			e.aecue_id, e.aecue_nombre, e.aecue_descripcion, 
			p.aepre_id, p.aetippre_id, p.aepre_descripcion, p.aepre_orden,
			(
			SELECT
			array_to_json(array_agg(o))
			FROM (
			SELECT aeopcres_id, aeopcres_descripcion, aeopcres_valor,aepre_id 
			FROM data.aeopcres 
			WHERE aepre_id= p.aepre_id -- AQUI VA EL ID DE LA PREGUNTA
			AND aeopcres_estado=true 
			ORDER BY aeopcres_orden
			) o
			) as opciones
			FROM 
			data.aecue e, data.aepre p, data.aetippre t
			WHERE e.aecue_id  = c.aecue_id -- AQUI VA EL ID DEL CUESTIONARIO
			AND e.aecue_id = p.aecue_id 
			AND p.aetippre_id = t.aetippre_id
			ORDER BY p.aepre_orden, p.aepre_id
		) y
		) as detalles
		FROM data.aecue c, data.inst_cue x, data.aetipint ti
		WHERE x.aeinst_id = $1 -- ID institucion
		AND x.aeano_id = $2 -- ID anolectivo
		AND x.aeinst_cue_estado=1
		AND c.aecue_estado=true
		AND x.aeinst_cue_fechaini >= (current_date - INTERVAL '60 DAYS') -- ESTE ARGUMENTO ES IMPORTANTE, LA FECHA ACTUAL
		AND x.aeinst_cue_fechafin <= (current_date + INTERVAL '60 DAYS') -- ESTE ARGUMENTO ES IMPORTANTE, LA FECHA ACTUAL                   
		AND c.aecue_id=x.aecue_id
		AND x.aeinst_cue_tipointento=ti.aetipint_id
		GROUP BY c.aecue_id, c.aecue_imagen, x.aeusu_id,
		x.aeinst_cue_fechaini,
		x.aeinst_cue_fechafin, x.aeinst_cue_duracion,
		x.aeinst_cue_intentos, x.aeinst_cue_tipointento,
		ti.aetipint_descripcion, x.aeinst_cue_ordenado,
		x.aeinst_cue_resultadominimo
		ORDER BY c.aecue_id
	) u;`,

  programation:`SELECT x.aeinst_cue_fechacreacion, x.aeinst_cue_fechaini, x.aeinst_cue_fechafin, 
                x.aeinst_cue_duracion, x.aeinst_cue_intentos, x.aeinst_cue_tipointento, x.aeinst_cue_resultadominimo,
                c.aecue_nombre, c.aecue_descripcion, c.aecue_asignatura
                FROM data.inst_cue x, data.aecue c 
                WHERE x.aeinst_cue_id = $1  --TENIENDO EL ID (DE LA PROGRAMACION) SALE UN SOLO RESULTADO                
                AND x.aecue_id=$2 --EL ID DEL CUESTIONARIO PUEDEN SALIR MAS DE UN RESULTADO
                AND x.aecue_id=c.aecue_id
                AND x.aeinst_cue_estado=1;`,

  allintentos : `SELECT inst_cue_res_id, c.aeinst_cue_id, i.aeusu_id, inst_cue_res_resultado, 
                  inst_cue_res_fechaini, inst_cue_res_fechafin, inst_cue_res_duracion, 
                  inst_cue_res_fechaintento, inst_cue_res_estado,
                  c.aeinst_cue_fechacreacion as programacionfecha,
                  c.aeinst_cue_fechaini,
                  c.aeinst_cue_fechafin,
                  c.aeinst_cue_duracion,
                  c.aeinst_cue_resultadominimo as notaminima,
                  i.inst_cue_res_aprobacion as aprobado
                  FROM data.inst_cue_res i, data.inst_cue c
                  WHERE c.aecue_id=$1 -- AQUI EL ID DEL CUESTIONARIO
                  AND i.aeusu_id= $2-- AQUI EL ID DEL USUARIO (OSEA EL ESTUDIANTE)
                  AND c.aeinst_cue_estado=1
                  AND i.inst_cue_res_estado=1
                  AND i.aeinst_cue_id=c.aeinst_cue_id;`,   
 
  consul: `SELECT aeopcres_id, aeopcres_descripcion, aeopcres_valor,aepre_id 
            FROM data.aeopcres 
            WHERE aepre_id=$1  -- AQUI VA EL ID DE LA PREGUNTA
            AND aeopcres_estado=true 
            ORDER BY aeopcres_orden`, 
  
  
  respuestas: `INSERT INTO data.aeres(
                aeres_id, inst_cue_res_id, aepre_id, aeopcres_id, aeresp_abierta)
                VALUES ((SELECT MAX(aeres_id)+1 FROM data.aeres),$1, $2, $3, $4)`,


   intentos: `INSERT INTO data.inst_cue_res(
                inst_cue_res_id, aeinst_cue_id, aeusu_id, inst_cue_res_resultado, 
                inst_cue_res_fechaini, inst_cue_res_fechafin, inst_cue_res_duracion, 
                inst_cue_res_fechaintento,inst_cue_res_aprobacion,inst_cue_res_estado)
                VALUES ((SELECT COALESCE(MAX(inst_cue_res_id)+1, 1) FROM data.inst_cue_res),$1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING inst_cue_res_id`,   


   taskDocs: `SELECT row_to_json(u)
   FROM (
     SELECT 
     t.aetar_id as idtarea, t.aetar_estado as estadotarea,  
     array_agg(p.aetar_pro_id) as idprogramacion, array_agg(p.aetar_pro_estado) estadoprogramacion,
     array_agg(p.aeestudiantes_grupo) as aeestudiantes_grupo, 
     t.aetar_nombre as nombre, t.aetar_descripcion as descripcion,
     t.aetar_fechacreacion, p.aetar_pro_fechalimite,
     p.aeasignaciones_asignatura,
     d.aedocentes_nombres || ' ' || d.aedocentes_apellidos as docente,
     t.aetar_adjunto1, t.aetar_adjunto2, t.aetar_adjunto3,
     (
       SELECT COUNT(aetar_res_id) AS RESPUESTAS
       FROM data.aetar_res x, data.aetar_pro y
       WHERE x.aetar_pro_id=y.aetar_pro_id
       AND y.aetar_id=t.aetar_id
     ) as respuestas
     FROM data.aetar t, data.aetar_pro p, data.aedocentes d
     WHERE p.aedocentes_id=$1 --ID DOCENTE
     AND p.aeanol_id=$2 -- ANO LECTIVO
     AND p.aeinst_id=$3
     AND t.aetar_id=p.aetar_id
     AND p.aedocentes_id=d.aedocentes_id
     GROUP BY t.aetar_id, t.aetar_estado, 
     t.aetar_nombre, t.aetar_descripcion,
     t.aetar_fechacreacion, p.aetar_pro_fechalimite,
     p.aeasignaciones_asignatura,
     d.aedocentes_nombres || ' ' || d.aedocentes_apellidos,
     t.aetar_adjunto1, t.aetar_adjunto2, t.aetar_adjunto3
     ORDER BY t.aetar_fechacreacion DESC 
   ) u;`,
   
   TaskStudents: `SELECT row_to_json(u)
   FROM (
     SELECT 
     t.aetar_id as idtarea, t.aetar_estado as estadotarea,  
     array_agg(p.aetar_pro_id) as idprogramacion, array_agg(p.aetar_pro_estado) estadoprogramacion,
     array_agg(p.aeestudiantes_grupo) as aeestudiantes_grupo, 
     t.aetar_nombre as nombre, t.aetar_descripcion as descripcion,
     t.aetar_fechacreacion, p.aetar_pro_fechalimite,
     p.aeasignaciones_asignatura,
     d.aedocentes_nombres || ' ' || d.aedocentes_apellidos as docente,
     t.aetar_adjunto1, t.aetar_adjunto2, t.aetar_adjunto3,
     (
      SELECT COUNT(aetar_res_id) AS RESPUESTAS
      FROM data.aetar_res x, data.aetar_pro y
      WHERE y.aetar_pro_estado<>0
      AND x.aetar_pro_id=y.aetar_pro_id
      AND y.aetar_id=t.aetar_id
    ) as respuestas
     FROM data.aetar t, data.aetar_pro p, data.aedocentes d
     WHERE p.aeestudiantes_grupo=$1 --GRUPO DEL ESTUDIANTE
     AND t.aetar_estado<>0
     AND p.aeanol_id=$2 -- ANO LECTIVO
     AND p.aeinst_id=$3 -- ID INSTITUCION
     AND t.aetar_id=p.aetar_id
     AND p.aedocentes_id=d.aedocentes_id
     GROUP BY t.aetar_id, t.aetar_estado, 
     t.aetar_nombre, t.aetar_descripcion,
     t.aetar_fechacreacion, p.aetar_pro_fechalimite,
     p.aeasignaciones_asignatura,
     d.aedocentes_nombres || ' ' || d.aedocentes_apellidos,
     t.aetar_adjunto1, t.aetar_adjunto2, t.aetar_adjunto3
     ORDER BY t.aetar_fechacreacion DESC 
   ) u;`,
   
   showTaskStudents: `SELECT row_to_json(u)
   FROM (
     SELECT 
     t.aetar_id as idtarea, t.aetar_estado as estadotarea,  
     array_agg(p.aetar_pro_id) as idprogramacion, array_agg(p.aetar_pro_estado) estadoprogramacion,
     array_agg(p.aeestudiantes_grupo) as aeestudiantes_grupo, 
     t.aetar_nombre as nombre, t.aetar_descripcion as descripcion,
     TO_CHAR(t.aetar_fechacreacion, 'YYYY-MM-DD HH:mi') as aetar_fechacreacion, 
     TO_CHAR(p.aetar_pro_fechalimite, 'YYYY-MM-DD HH:mi') as aetar_pro_fechalimite,
     p.aeasignaciones_asignatura,
     d.aedocentes_nombres || ' ' || d.aedocentes_apellidos as docente,
     array_remove(array[t.aetar_adjunto1, t.aetar_adjunto2, t.aetar_adjunto3], NULL) as adjunto,
    (
      SELECT COUNT(aetar_res_id) AS RESPUESTAS
      FROM data.aetar_res x, data.aetar_pro y
      WHERE x.aetar_pro_id=y.aetar_pro_id
      AND y.aetar_id=t.aetar_id
    ) as respuestas,
    (
        SELECT row_to_json(R) as aetar_res
        FROM (
          SELECT e.aeestudiantes_id, e.aeestudiantes_grupo, e.aeestudiantes_apellidos || ' ' || e.aeestudiantes_nombres as estudiante,
          COALESCE(
            (
              SELECT json_build_object(
                        'aetar_res_id', r.aetar_res_id, 
                        'aetar_res_resultado', r.aetar_res_resultado,
                        'aetar_res_fechaentrega', r.aetar_res_fechaentrega,
                        'aetar_res_descripcion', r.aetar_res_descripcion,
                        'aetar_res_adjunto', array_remove(array[r.aetar_res_adjunto1, r.aetar_res_adjunto2, r.aetar_res_adjunto3], NULL),
                        'aetar_res_aprobacion', r.aetar_res_aprobacion,
                        'aetar_res_estado', r.aetar_res_estado
                      )		   
              FROM data.aetar_res r
              WHERE r.aetar_pro_id = ANY( $2 )
              AND r.aetar_res_estado=1
              AND r.aeestudiantes_id=e.aeestudiantes_id
            ), '{}'::JSON
        ) AS aetar_res_data
        FROM data.aeestudiantes e
        WHERE e.aeestudiantes_id = $5
        AND e.aeinstitucion_id=$4
        AND e.aeano_id=$3
        ORDER BY e.aeestudiantes_grupo, estudiante
      ) r		
    ) as detalles,
    (
      SELECT SUM(aetar_res_resultado) AS RESULTADOS
      FROM data.aetar_res x, data.aetar_pro y
      WHERE x.aetar_pro_id=y.aetar_pro_id
      AND y.aetar_id=t.aetar_id
    ) as resultados
     FROM data.aetar t, data.aetar_pro p, data.aedocentes d
     WHERE  p.aetar_pro_id = $1 -- ID DE LA TAREA -> reference
     AND t.aetar_id=p.aetar_id
     AND p.aedocentes_id=d.aedocentes_id
     GROUP BY t.aetar_id, t.aetar_estado, 
     t.aetar_nombre, t.aetar_descripcion,
     TO_CHAR(t.aetar_fechacreacion, 'YYYY-MM-DD HH:mi'), 
     TO_CHAR(p.aetar_pro_fechalimite, 'YYYY-MM-DD HH:mi'),
     p.aeasignaciones_asignatura,
     d.aedocentes_nombres || ' ' || d.aedocentes_apellidos,
     array[t.aetar_adjunto1, t.aetar_adjunto2, t.aetar_adjunto3]
     ORDER BY t.aetar_fechacreacion DESC 
   ) u;`,

   showTaskTeachers: `SELECT row_to_json(u)
   FROM (
     SELECT 
     t.aetar_id as idtarea, t.aetar_estado as estadotarea,  
     array_agg(p.aetar_pro_id) as idprogramacion, array_agg(p.aetar_pro_estado) estadoprogramacion,
     array_agg(p.aeestudiantes_grupo) as aeestudiantes_grupo, 
     t.aetar_nombre as nombre, t.aetar_descripcion as descripcion,
     TO_CHAR(t.aetar_fechacreacion, 'YYYY-MM-DD HH:mi') as aetar_fechacreacion, 
     TO_CHAR(p.aetar_pro_fechalimite, 'YYYY-MM-DD HH:mi') as aetar_pro_fechalimite,
     p.aeasignaciones_asignatura,
     d.aedocentes_nombres || ' ' || d.aedocentes_apellidos as docente,
     array_remove(array[t.aetar_adjunto1, t.aetar_adjunto2, t.aetar_adjunto3], NULL) as adjunto,
    (
      SELECT COUNT(aetar_res_id) AS RESPUESTAS
      FROM data.aetar_res x, data.aetar_pro y
      WHERE x.aetar_pro_id=y.aetar_pro_id
      AND y.aetar_id=t.aetar_id
    ) as respuestas,
    (
      SELECT SUM(aetar_res_resultado) AS RESULTADOS
      FROM data.aetar_res x, data.aetar_pro y
      WHERE x.aetar_pro_id=y.aetar_pro_id
      AND y.aetar_id=t.aetar_id
    ) as resultados,
    (
		  SELECT row_to_json(R) as aetar_res
		  FROM (
			SELECT e.aeestudiantes_id, e.aeestudiantes_grupo, e.aeestudiantes_apellidos || ' ' || e.aeestudiantes_nombres as estudiante,
			  COALESCE((
			  SELECT json_build_object('aetar_res_id', r.aetar_res_id, 
									   'aetar_res_resultado', r.aetar_res_resultado,
									   'aetar_res_fechaentrega', r.aetar_res_fechaentrega,
									   'aetar_res_descripcion', r.aetar_res_descripcion,
									   'aetar_res_adjunto', array_remove(array[r.aetar_res_adjunto1, r.aetar_res_adjunto2, r.aetar_res_adjunto3], NULL),
									   'aetar_res_aprobacion', r.aetar_res_aprobacion,
									   'aetar_res_estado', r.aetar_res_estado
									  )		   
			  FROM data.aetar_res r
			  WHERE r.aetar_pro_id = ANY( $2 )
			  AND r.aetar_res_estado=1
			  AND r.aeestudiantes_id=e.aeestudiantes_id
			), '{}'::JSON) AS aetar_res_data
			FROM data.aeestudiantes e
			WHERE e.aeestudiantes_id = $5
			AND e.aeinstitucion_id=$4
			AND e.aeano_id=$3
			ORDER BY e.aeestudiantes_grupo, estudiante
		) r		
	) as detalles
     FROM data.aetar t, data.aetar_pro p, data.aedocentes d
     WHERE  t.aetar_id = $1 -- ID DE LA TAREA -> reference
     AND t.aetar_id=p.aetar_id
     AND p.aedocentes_id=d.aedocentes_id
     GROUP BY t.aetar_id, t.aetar_estado, 
     t.aetar_nombre, t.aetar_descripcion,
     TO_CHAR(t.aetar_fechacreacion, 'YYYY-MM-DD HH:mi'), 
     TO_CHAR(p.aetar_pro_fechalimite, 'YYYY-MM-DD HH:mi'),
     p.aeasignaciones_asignatura,
     d.aedocentes_nombres || ' ' || d.aedocentes_apellidos,
     array[t.aetar_adjunto1, t.aetar_adjunto2, t.aetar_adjunto3]
     ORDER BY t.aetar_fechacreacion DESC 
   ) u;`,

   showTaskStudents_responses:`SELECT row_to_json(u)
   FROM (
     SELECT *
     FROM data.aetar_res r
     WHERE r.aetar_pro_id IN (SELECT aetar_pro_id FROM data.aetar WHERE aetar_id=$1 ) 
     AND r.aeestudiantes_id= $2
   ) u;`,

   showTaskResults: `
   SELECT row_to_json(u) as data
   FROM (
    SELECT e.aeestudiantes_id, e.aeestudiantes_grupo, e.aeestudiantes_apellidos || ' ' || e.aeestudiantes_nombres as estudiante,
      COALESCE((
      SELECT json_build_object('aetar_res_id', r.aetar_res_id, 'aetar_res_resultado', r.aetar_res_resultado)		   
      FROM data.aetar_res r
      WHERE r.aetar_pro_id = ANY( $4 )
      AND r.aetar_res_estado=1
      AND r.aeestudiantes_id=e.aeestudiantes_id
    ), '{}'::JSON) AS aetar_res_data
    FROM data.aeestudiantes e
    WHERE e.aeestudiantes_grupo = ANY( $3 )
    AND e.aeinstitucion_id=$2
    AND e.aeano_id=$1
    ORDER BY e.aeestudiantes_grupo, estudiante
  ) u;`,
 
  showExamsResults: `
  SELECT row_to_json(u) as data
  FROM (
    SELECT e.aeestudiantes_id, e.aeusu_id, e.aeestudiantes_grupo, e.aeestudiantes_apellidos || ' ' || e.aeestudiantes_nombres as estudiante,
      COALESCE((
      SELECT json_build_object(
        'inst_cue_res_id', r.inst_cue_res_id, 
        'inst_cue_res_resultado', r.inst_cue_res_resultado,
        'inst_cue_res_fechaini', inst_cue_res_fechaini,
        'inst_cue_res_fechafin', inst_cue_res_fechafin,
        'inst_cue_res_duracion', inst_cue_res_duracion,
        'inst_cue_res_fechaintento', inst_cue_res_fechaintento,
        'inst_cue_res_aprobacion', inst_cue_res_aprobacion
        )		   
      FROM data.inst_cue_res r
      WHERE r.aeinst_cue_id = ANY( $4 )
      AND r.inst_cue_res_estado=1
      AND r.aeusu_id=e.aeusu_id
      ORDER BY inst_cue_res_fechaintento DESC
      LIMIT 1
    ), '{}'::JSON) AS aeacu_res_data
    FROM data.aeestudiantes e
    WHERE e.aeestudiantes_grupo = ANY( $3 )
    AND e.aeinstitucion_id=$2
    AND e.aeano_id=$1
    ORDER BY e.aeestudiantes_grupo, estudiante
  ) u;`,

  showExamsAnswers: ` 
  SELECT 
	x.aeinst_cue_id AS programacion, x.inst_cue_res_id AS intento, x.inst_cue_res_fechaintento AS fecha, x.inst_cue_res_duracion AS duracion,
	x.inst_cue_res_fechaini AS fechainicio, x.inst_cue_res_fechafin AS fechafin, x.inst_cue_res_resultado AS resultado,
array_to_json(array_agg(r)) AS respuestas
FROM data.inst_cue_res x, (
	 SELECT x.aeinst_cue_id AS programacion, r.inst_cue_res_id AS intento,
	 r.aepre_id AS idpregunta, r.aeopcres_id AS idrespuesta, r.aeresp_abierta AS abierta
	 FROM data.aeres r, data.inst_cue_res x
	 WHERE x.aeinst_cue_id=$1
	 AND x.inst_cue_res_id=r.inst_cue_res_id
 ) AS r
 WHERE x.aeinst_cue_id=$1
 AND x.aeusu_id=$2
 AND x.inst_cue_res_id=r.intento
 GROUP BY 
	x.aeinst_cue_id, x.inst_cue_res_id, x.inst_cue_res_fechaintento, x.inst_cue_res_duracion,
	x.inst_cue_res_fechaini, x.inst_cue_res_fechafin, x.inst_cue_res_resultado;`

}