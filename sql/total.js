module.exports ={
    totalTeacherAttendance:`
    --ASISTENCIAS: % PORCENTAJE DE DOCENTES HACIENDO ASISTENCIAS
    -- $1 IDINSTITUCION
    SELECT i.aeinst_id as id_institucion, i.aeinst_nombre as sede, i.calendario,
        COUNT(DISTINCT a.aeasistencias_docente) AS marcando,
        (
            SELECT COUNT(DISTINCT t.aedocentes_id)
            FROM data.inst_doce t
            WHERE t.aeinst_id = i.aeinst_id
        ) AS totales
    FROM data.aeasistencias a, data.aedocentes d, 
    (
        SELECT x.aedocentes_id, x.aeinst_id, x.aeanol_id, x.inst_doce_estado
        FROM data.inst_doce x 
        WHERE x.aeinst_id = $1
    ) AS x,
    DATA.aeinstituciones i
    WHERE a.aeasistencias_docente = d.aedocentes_id
    AND a.aeasistencias_docente = x.aedocentes_id
    AND x.aeinst_id = i.aeinst_id
    GROUP BY i.aeinst_id, i.aeinst_nombre, i.calendario
    ORDER BY id_institucion;    
    `,

    totalTeacherAttendanceByDay:`
    -- DOCENTES REGISTRANDO ASISTENCIAS ULTIMOS DIAS
    -- $1 IDINSTITUCION, $2 FECHAINICIAL, $3 FECHAFINAL,
    SELECT i.aeinst_id, i.aeinst_nombre, i.calendario,
    TO_CHAR(a.aeasistencias_fecharegistro, 'YYYY-MM-DD') AS fecha,
    TO_CHAR(a.aeasistencias_fecharegistro, 'DD') AS dia,
    COUNT(DISTINCT a.aeasistencias_docente) AS docentesregistrantes
    FROM data.aeasistencias a, data.aedocentes d, 
    (
        SELECT x.aedocentes_id, x.aeinst_id, x.aeanol_id, x.inst_doce_estado
        FROM data.inst_doce x 
        WHERE x.aeinst_id = $1 
    ) AS x,
    DATA.aeinstituciones i
    WHERE TO_CHAR(a.aeasistencias_fecha, 'YYYY-MM-DD') BETWEEN $2 AND $3
    AND a.aeasistencias_docente = d.aedocentes_id
    AND a.aeasistencias_docente = x.aedocentes_id
    AND x.aeinst_id = i.aeinst_id
    GROUP BY i.aeinst_id, i.aeinst_nombre, i.calendario,
    TO_CHAR(a.aeasistencias_fecharegistro, 'YYYY-MM-DD'), 
    TO_CHAR(a.aeasistencias_fecharegistro, 'DD')
    ORDER BY fecha DESC, i.aeinst_id;
    `,   

    attendanceCount:`
      -- TOTAL AUSENTISMO POR GRUPO EN EL COLEGIO
      SELECT aeestudiantes_grupo AS grupo, COUNT(aeestudiantes_grupo) AS CANTIDAD
      FROM (
        SELECT initcap(lower(e.aeestudiantes_apellidos)) || ' ' || initcap(lower(e.aeestudiantes_nombres)) AS aeestudiantes_nombres,
        a.aeestudiantes_grupo, e.aeestudiantes_mail, e.aeestudiantes_telefono,
        (
            SELECT array_agg(aeestudiantes_telefonoacudiente)
            FROM data.aeacudientes c
            WHERE c.aeacudientes_id=e.aeacudientes_id
        ) AS aeacudientes_telefono,
        COUNT(DISTINCT a.aeasistencias_fecha) AS INASISTENCIAS
        FROM 
	        data.aeestudiantes e, (
			   -- VER POR ESTUDIANTE, CUANTAS FALLAS O ASISTENCIAS TIENE REGISTRADAS EN EL DIA
			   SELECT x.aeasistencias_fecha, x.aeestudiantes_id, x.aeestudiantes_grupo, 
			   COUNT(CASE WHEN (x.aeasistencias_llego=1) THEN x.aeasistencia_id END  ) AS VINO,
			   COUNT(CASE WHEN (x.aeasistencias_llego=0) THEN x.aeasistencia_id END  ) AS NOVINO
			   FROM data.aeasistencias x
			   WHERE x.aeasistencias_fecha BETWEEN $3 AND $4
			   AND x.aeasistencias_estado<>0 
				AND x.aeestudiantes_grupo IN (
					-- LISTA DE GRUPOS DE UN DOCENTE, GRUPOS DONDE DA CLASES
					SELECT DISTINCT aeasignaciones_grupo
					FROM data.aeasignaciones h
					WHERE h.aeanol_id=$1 -- anolectivo
					AND h.aeinst_id=$2 -- institucion   
				)   
			   GROUP BY x.aeasistencias_fecha, x.aeestudiantes_id, x.aeestudiantes_grupo
			) AS a
        WHERE 
	        e.aeano_id = $1 AND e.aeinstitucion_id = $2
	        AND e.aeestudiantes_estado <> 0
	        AND (a.vino=0 AND a.novino>0) -- FECHAS DONDE SOLO TIENEN FALTAS
	        AND e.aeestudiantes_id=a.aeestudiantes_id
        GROUP BY 
	        initcap(lower(aeestudiantes_apellidos)) || ' ' || initcap(lower(aeestudiantes_nombres)),
	        a.aeestudiantes_grupo, e.aeestudiantes_mail, e.aeacudientes_id, e.aeestudiantes_telefono,
	        a.vino, a.novino
	        HAVING (COUNT(DISTINCT a.aeasistencias_fecha) > $5)
      ) au
      GROUP BY aeestudiantes_grupo
      ORDER BY CANTIDAD DESC; 
    `,

    attendanceCountXTeacher:`
    -- TOTAL AUSENTISMO POR GRUPO SEGUN LAS ASIGNACIONES DE UN MAESTRO
    -- ARGUMENTOS -> $1 ano_lectivo, $2 id_institucion, $3 inicio, $4 fin, $5 umbralinasistencias, $6 id_academico
    SELECT aeestudiantes_grupo AS grupo, COUNT(aeestudiantes_grupo) AS CANTIDAD
    FROM (
      SELECT initcap(lower(e.aeestudiantes_apellidos)) || ' ' || initcap(lower(e.aeestudiantes_nombres)) AS aeestudiantes_nombres,
      a.aeestudiantes_grupo, e.aeestudiantes_mail, e.aeestudiantes_telefono,
      (
          SELECT array_agg(aeestudiantes_telefonoacudiente)
          FROM data.aeacudientes c
          WHERE c.aeacudientes_id=e.aeacudientes_id
      ) AS aeacudientes_telefono,
      COUNT(DISTINCT a.aeasistencias_fecha) AS INASISTENCIAS
      FROM 
          data.aeestudiantes e, (
            -- VER POR ESTUDIANTE, CUANTAS FALLAS O ASISTENCIAS TIENE REGISTRADAS EN EL DIA
            SELECT 
                x.aeasistencias_fecha, x.aeestudiantes_id, x.aeestudiantes_grupo, 
                COUNT(CASE WHEN (x.aeasistencias_llego=1) THEN x.aeasistencia_id END  ) AS VINO,
                COUNT(CASE WHEN (x.aeasistencias_llego=0) THEN x.aeasistencia_id END  ) AS NOVINO
            FROM 
                data.aeasistencias x
            WHERE 
                x.aeasistencias_fecha BETWEEN $3 AND $4
                AND x.aeasistencias_estado<>0 
                AND x.aeestudiantes_grupo IN (
                    -- LISTA DE GRUPOS DE UN DOCENTE, GRUPOS DONDE DA CLASES
                    SELECT DISTINCT aeasignaciones_grupo
                    FROM data.aeasignaciones h
                    WHERE h.aedocentes_id=$6 --iddocente, idacademico
                    AND h.aeanol_id=$1 -- anolectivo
                    AND h.aeinst_id=$2 -- institucion   
                )   
            GROUP BY x.aeasistencias_fecha, x.aeestudiantes_id, x.aeestudiantes_grupo
          ) AS a
      WHERE 
          e.aeano_id = $1 AND e.aeinstitucion_id = $2
          AND e.aeestudiantes_estado <> 0
          AND (a.vino=0 AND a.novino>0) -- FECHAS DONDE SOLO TIENEN FALTAS
          AND e.aeestudiantes_id=a.aeestudiantes_id
      GROUP BY 
          initcap(lower(aeestudiantes_apellidos)) || ' ' || initcap(lower(aeestudiantes_nombres)),
          a.aeestudiantes_grupo, e.aeestudiantes_mail, e.aeacudientes_id, e.aeestudiantes_telefono,
          a.vino, a.novino
          HAVING (COUNT(DISTINCT a.aeasistencias_fecha) > $5)
    ) au
    GROUP BY aeestudiantes_grupo
    ORDER BY CANTIDAD DESC; 
    `,

    totalStudentsAttendance:`
    -- ESTUDIANTES CON INASISTENCIAS HOY, SEMANA, MES
    -- $1 ANOLECTIVO, $2 IDINSTITUCION, $3 FECHAINICIAL, $4 FECHAFINAL, $5 '10' MES LITERAL
    SELECT 
    COUNT(DISTINCT 
    	CASE WHEN(TO_CHAR(a.aeasistencias_fecha, 'YYYY-MM-DD')=TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD')
    		AND (a.novino>0 AND a.vino=0) 
    	) THEN a.aeestudiantes_id END) AS hoy, 
    COUNT(DISTINCT 
    	CASE WHEN(a.aeasistencias_fecha BETWEEN date_trunc('week', current_date) AND (date_trunc('week', current_date) + interval '6 day') 
    		AND (a.novino>0 AND a.vino=0) 
    	) THEN a.aeestudiantes_id END) AS semana,
    COUNT(DISTINCT 
    	CASE WHEN(TO_CHAR(a.aeasistencias_fecha, 'MM')=$5
    		AND (a.novino>0 AND a.vino=0)
    	) THEN a.aeestudiantes_id END) AS mes
    FROM (
        SELECT 
            DISTINCT x.aeestudiantes_id, TO_CHAR(x.aeasistencias_fecha, 'YYYY-MM-DD')::DATE AS aeasistencias_fecha,
            x.vino, x.novino
        FROM 
	        (
	            -- VER POR ESTUDIANTE, CUANTAS FALLAS O ASISTENCIAS TIENE REGISTRADAS EN EL DIA
			   SELECT a.aeasistencias_fecha, a.aeestudiantes_id, a.aeestudiantes_grupo, 
			   COUNT(CASE WHEN (a.aeasistencias_llego=1) THEN a.aeasistencia_id END  ) AS VINO,
			   COUNT(CASE WHEN (a.aeasistencias_llego=0) THEN a.aeasistencia_id END  ) AS NOVINO
			   FROM data.aeasistencias a
			   WHERE a.aeasistencias_fecha BETWEEN $3 AND $4
			   AND aeasistencias_estado<>0
				AND a.aeestudiantes_grupo IN (
					-- LISTA DE GRUPOS DE UN DOCENTE, GRUPOS DONDE DA CLASES
					SELECT DISTINCT aeasignaciones_grupo
					FROM data.aeasignaciones a
					WHERE a.aeanol_id=$1 -- anolectivo
					AND a.aeinst_id=$2 -- institucion    
				)   
			   GROUP BY a.aeasistencias_fecha, a.aeestudiantes_id, a.aeestudiantes_grupo	        
	        ) AS x 
	        	LEFT JOIN engine.aeusuroll r
	        		ON (r.aeacad_referencia=x.aeestudiantes_id)
        WHERE r.aeroll_id=3
        AND r.aeinst_id = $2
        AND r.aeanol_id = $1
        AND r.aeusuroll_estado = 1
    ) a 
    LEFT JOIN data.aeestudiantes e
    	ON (e.aeestudiantes_id=a.aeestudiantes_id)
   WHERE e.aeano_id = $1 
   AND e.aeinstitucion_id = $2;   
    `,

    totalStudentsAttendanceXTeacher:`
    -- ESTUDIANTES CON INASISTENCIAS HOY, SEMANA, MES SEGUN EL MAESTRO
    -- $1 ANOLECTIVO, $2 IDINSTITUCION, $3 FECHAINICIAL, $4 FECHAFINAL, $5 '10' MES LITERAL, $6 IDACADEMICO
        SELECT 
        COUNT(DISTINCT 
            CASE WHEN(TO_CHAR(a.aeasistencias_fecha, 'YYYY-MM-DD')=TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD')
                AND (a.novino>0 AND a.vino=0) 
            ) THEN a.aeestudiantes_id END) AS hoy, 
        COUNT(DISTINCT 
            CASE WHEN(a.aeasistencias_fecha BETWEEN date_trunc('week', current_date) AND (date_trunc('week', current_date) + interval '6 day') 
                AND (a.novino>0 AND a.vino=0) 
            ) THEN a.aeestudiantes_id END) AS semana,
        COUNT(DISTINCT 
            CASE WHEN(TO_CHAR(a.aeasistencias_fecha, 'MM')=$5
                AND (a.novino>0 AND a.vino=0)
            ) THEN a.aeestudiantes_id END) AS mes
        FROM (
            SELECT 
                DISTINCT x.aeestudiantes_id, TO_CHAR(x.aeasistencias_fecha, 'YYYY-MM-DD')::DATE AS aeasistencias_fecha,
                x.vino, x.novino
            FROM 
                (
                    -- VER POR ESTUDIANTE, CUANTAS FALLAS O ASISTENCIAS TIENE REGISTRADAS EN EL DIA
                   SELECT a.aeasistencias_fecha, a.aeestudiantes_id, a.aeestudiantes_grupo, 
                   COUNT(CASE WHEN (a.aeasistencias_llego=1) THEN a.aeasistencia_id END  ) AS VINO,
                   COUNT(CASE WHEN (a.aeasistencias_llego=0) THEN a.aeasistencia_id END  ) AS NOVINO
                   FROM data.aeasistencias a
                   WHERE a.aeasistencias_fecha BETWEEN $3 AND $4
                   AND aeasistencias_estado<>0
                    AND a.aeestudiantes_grupo IN (
                        -- LISTA DE GRUPOS DE UN DOCENTE, GRUPOS DONDE DA CLASES
                        SELECT DISTINCT aeasignaciones_grupo
                        FROM data.aeasignaciones a
                        WHERE a.aedocentes_id=$6 --iddocente, idacademico
                        AND a.aeanol_id=$1 -- anolectivo
                        AND a.aeinst_id=$2 -- institucion    
                    )   
                   GROUP BY a.aeasistencias_fecha, a.aeestudiantes_id, a.aeestudiantes_grupo
                
                ) AS x 
                    LEFT JOIN engine.aeusuroll r
                        ON (r.aeacad_referencia=x.aeestudiantes_id)
            WHERE r.aeroll_id=3
            AND r.aeinst_id = $2
            AND r.aeanol_id = $1
            AND r.aeusuroll_estado = 1
        ) a 
        LEFT JOIN data.aeestudiantes e
            ON (e.aeestudiantes_id=a.aeestudiantes_id)
       WHERE e.aeano_id = $1 
       AND e.aeinstitucion_id = $2;
    `,

    totalStudentsAttendanceByDay:`
    -- ESTUDIANTES INASISTENTES POR DIA EN MI COLEGIO
    -- $1 ANOLECTIVO, $2 INSTITUCION, $3 FECHAINICIO, $4 FECHAFIN
    SELECT 
    TO_CHAR(x.aeasistencias_fecha, 'YYYY-MM-DD') AS FECHA,
    TO_CHAR(x.aeasistencias_fecha, 'DD') AS DIA,
    CASE 
        WHEN (TO_CHAR(x.aeasistencias_fecha, 'D') = '1') THEN 'D'
        WHEN (TO_CHAR(x.aeasistencias_fecha, 'D') = '2') THEN 'L'
        WHEN (TO_CHAR(x.aeasistencias_fecha, 'D') = '3') THEN 'Ma'
        WHEN (TO_CHAR(x.aeasistencias_fecha, 'D') = '4') THEN 'Mi'
        WHEN (TO_CHAR(x.aeasistencias_fecha, 'D') = '5') THEN 'J'
        WHEN (TO_CHAR(x.aeasistencias_fecha, 'D') = '6') THEN 'V'
        WHEN (TO_CHAR(x.aeasistencias_fecha, 'D') = '7') THEN 'S'
    END AS DIANOMBRE,
    COUNT(DISTINCT
        CASE WHEN ( (x.novino>0 AND x.vino=0)) THEN
            x.aeestudiantes_id
        END 
        ) AS inasistentes
    FROM 
        engine.aeusuroll r LEFT JOIN 
        (
            -- VER POR ESTUDIANTE, CUANTAS FALLAS O ASISTENCIAS TIENE REGISTRADAS EN EL DIA
            SELECT 
                a.aeasistencias_fecha, a.aeestudiantes_id, a.aeestudiantes_grupo, 
                COUNT(CASE WHEN (a.aeasistencias_llego=1) THEN a.aeasistencia_id END  ) AS VINO,
                COUNT(CASE WHEN (a.aeasistencias_llego=0) THEN a.aeasistencia_id END  ) AS NOVINO
            FROM 
                data.aeasistencias a INNER JOIN data.aeestudiantes f
                    ON (a.aeestudiantes_id=f.aeestudiantes_id
                        AND f.aeinstitucion_id=$2
                        AND f.aeano_id=$1)
            WHERE 
                TO_CHAR(a.aeasistencias_fecha, 'MM')=TO_CHAR(CURRENT_DATE, 'MM')
                AND a.aeasistencias_estado<>0  
            GROUP BY a.aeasistencias_fecha, a.aeestudiantes_id, a.aeestudiantes_grupo
        ) AS x
        ON (r.aeacad_referencia=x.aeestudiantes_id            
            AND TO_CHAR(x.aeasistencias_fecha, 'YYYY-MM-DD') BETWEEN $3 AND $4
        )
    WHERE 
        r.aeinst_id = $2
        AND (r.aeroll_id=203 OR r.aeroll_id=3)
        AND r.aeanol_id = $1
        AND r.aeusuroll_estado = 1
    GROUP BY 
        r.aeinst_id, TO_CHAR(x.aeasistencias_fecha, 'YYYY-MM-DD'),
        TO_CHAR(x.aeasistencias_fecha, 'DD'), TO_CHAR(x.aeasistencias_fecha, 'D')
    ORDER BY FECHA DESC;        
    `,

    totalStudentsAttendanceByDayXTeacher:`
    -- ESTUDIANTES INASISTENTES POR DIA EN MI COLEGIO
    -- $1 ANOLECTIVO, $2 INSTITUCION, $3 FECHAINICIO, $4 FECHAFIN, $5: IDACADEMICO
    SELECT 
    TO_CHAR(x.aeasistencias_fecha, 'YYYY-MM-DD') AS FECHA,
    TO_CHAR(x.aeasistencias_fecha, 'DD') AS DIA,
    CASE 
        WHEN (TO_CHAR(x.aeasistencias_fecha, 'D') = '1') THEN 'D'
        WHEN (TO_CHAR(x.aeasistencias_fecha, 'D') = '2') THEN 'L'
        WHEN (TO_CHAR(x.aeasistencias_fecha, 'D') = '3') THEN 'Ma'
        WHEN (TO_CHAR(x.aeasistencias_fecha, 'D') = '4') THEN 'Mi'
        WHEN (TO_CHAR(x.aeasistencias_fecha, 'D') = '5') THEN 'J'
        WHEN (TO_CHAR(x.aeasistencias_fecha, 'D') = '6') THEN 'V'
        WHEN (TO_CHAR(x.aeasistencias_fecha, 'D') = '7') THEN 'S'
    END AS DIANOMBRE,
    COUNT(DISTINCT
        CASE WHEN ( (x.novino>0 AND x.vino=0)) THEN
            x.aeestudiantes_id
        END 
        ) AS inasistentes
    FROM 
        engine.aeusuroll r LEFT JOIN 
        (
            -- VER POR ESTUDIANTE, CUANTAS FALLAS O ASISTENCIAS TIENE REGISTRADAS EN EL DIA
            SELECT 
                a.aeasistencias_fecha, a.aeestudiantes_id, a.aeestudiantes_grupo, 
                COUNT(CASE WHEN (a.aeasistencias_llego>0) THEN a.aeasistencia_id END  ) AS VINO,
                COUNT(CASE WHEN (a.aeasistencias_llego<=0) THEN a.aeasistencia_id END  ) AS NOVINO
            FROM 
                data.aeasistencias a INNER JOIN data.aeestudiantes f
                    ON (a.aeestudiantes_id=f.aeestudiantes_id
                        AND f.aeinstitucion_id=$2
                        AND f.aeano_id=$1
                        AND f.aeestudiantes_grupo IN (
                                -- LISTA DE GRUPOS DE UN DOCENTE, GRUPOS DONDE DA CLASES
                                SELECT DISTINCT aeasignaciones_grupo
                                FROM data.aeasignaciones a
                                WHERE a.aedocentes_id=$5 --iddocente, idacademico
                                AND a.aeanol_id=$1 -- anolectivo
                                AND a.aeinst_id=$2 -- institucion   
                            ) 
                        )
            WHERE 
                TO_CHAR(a.aeasistencias_fecha, 'MM')=TO_CHAR(CURRENT_DATE, 'MM')
                AND a.aeasistencias_estado<>0  
            GROUP BY a.aeasistencias_fecha, a.aeestudiantes_id, a.aeestudiantes_grupo
        ) AS x
        ON (r.aeacad_referencia=x.aeestudiantes_id            
            AND TO_CHAR(x.aeasistencias_fecha, 'YYYY-MM-DD') BETWEEN $3 AND $4
        )
    WHERE 
        r.aeinst_id = $2
        AND (r.aeroll_id=3 OR r.aeroll_id=203)
        AND r.aeanol_id = $1
        AND r.aeusuroll_estado = 1
    GROUP BY 
        r.aeinst_id, TO_CHAR(x.aeasistencias_fecha, 'YYYY-MM-DD'),
        TO_CHAR(x.aeasistencias_fecha, 'DD'), TO_CHAR(x.aeasistencias_fecha, 'D')
    ORDER BY FECHA DESC;        
    `,

    totalHomeworks:`
    -- TAREAS HOY, SEMANA, MES
    -- $1 ANOLECTIVO, $2 IDINSTITUCION, $3 '11' MES LITERAL
    SELECT 
        -- t.aetar_id, t.aetar_nombre, t.aetar_fechacreacion, tp.aeestudiantes_grupo, tp.aeasignaciones_asignatura
        COUNT(CASE WHEN(TO_CHAR(t.aetar_fechacreacion, 'YYYY-MM-DD')=TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD')) THEN t.aetar_id END) AS HOY,
        COUNT(CASE WHEN(t.aetar_fechacreacion BETWEEN date_trunc('week', current_date) AND (date_trunc('week', current_date) + interval '6 day') ) THEN t.aetar_id END) AS SEMANA,
        COUNT(CASE WHEN(TO_CHAR(t.aetar_fechacreacion, 'MM')=$3) THEN t.aetar_id END) AS MES
        FROM data.aetar_pro tp, data.aetar t
    WHERE tp.aeanol_id=$1
    AND tp.aeinst_id=$2
    AND tp.aetar_pro_estado <> 0
    AND t.aetar_estado <> 0
    AND tp.aetar_id = t.aetar_id;    
    `,

    totalHomeworksXTeacher:`
    -- TAREAS HOY, SEMANA, MES
    -- $1 ANOLECTIVO, $2 IDINSTITUCION, $3 '11' MES LITERAL, $4 IDACADEMICO
    SELECT 
        -- t.aetar_id, t.aetar_nombre, t.aetar_fechacreacion, tp.aeestudiantes_grupo, tp.aeasignaciones_asignatura
        COUNT(CASE WHEN(TO_CHAR(t.aetar_fechacreacion, 'YYYY-MM-DD')=TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD')) THEN t.aetar_id END) AS HOY,
        COUNT(CASE WHEN(t.aetar_fechacreacion BETWEEN date_trunc('week', current_date) AND (date_trunc('week', current_date) + interval '6 day') ) THEN t.aetar_id END) AS SEMANA,
        COUNT(CASE WHEN(TO_CHAR(t.aetar_fechacreacion, 'MM')=$3) THEN t.aetar_id END) AS MES
        FROM data.aetar_pro tp, data.aetar t
    WHERE tp.aeanol_id=$1
    AND tp.aeinst_id=$2
    AND tp.aeestudiantes_grupo IN (
        -- LISTA DE GRUPOS DE UN DOCENTE, GRUPOS DONDE DA CLASES
        SELECT DISTINCT aeasignaciones_grupo
        FROM data.aeasignaciones h
        WHERE h.aedocentes_id=$4 --iddocente, idacademico
        AND h.aeanol_id=$1 -- anolectivo
        AND h.aeinst_id=$2 -- institucion           
    )
    AND tp.aetar_pro_estado <> 0
    AND t.aetar_estado <> 0
    AND tp.aetar_id = t.aetar_id;    
    `,

    totalExams:`
    -- EVALUACIONES HOY, SEMANA, MES
    -- $1 ANOLECTIVO, $2 IDINSTITUCION, $3 '11' MES LITERAL
    SELECT 
        COUNT(CASE WHEN(TO_CHAR(x.aeinst_cue_fechacreacion, 'YYYY-MM-DD')=TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD')) THEN c.aecue_id END) AS HOY,
        COUNT(CASE WHEN(x.aeinst_cue_fechacreacion BETWEEN date_trunc('week', current_date) AND (date_trunc('week', current_date) + interval '6 day') ) THEN c.aecue_id END) AS SEMANA,
        COUNT(CASE WHEN(TO_CHAR(x.aeinst_cue_fechacreacion, 'MM')=$3) THEN c.aecue_id END) AS MES	
    FROM data.inst_cue x, data.aecue c
    WHERE x.aeano_id = $1
    AND x.aeinst_id = $2
    AND x.aeinst_cue_estado <> 0
    AND c.aecue_estado <> false
    AND x.aecue_id = c.aecue_id;    
    `,

    totalExamsXTeacher:`
    -- EVALUACIONES HOY, SEMANA, MES
    -- $1 ANOLECTIVO, $2 IDINSTITUCION, $3 '11' MES LITERAL, $4 IDACADEMICO
    SELECT 
        COUNT(CASE WHEN(TO_CHAR(x.aeinst_cue_fechacreacion, 'YYYY-MM-DD')=TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD')) THEN c.aecue_id END) AS HOY,
        COUNT(CASE WHEN(x.aeinst_cue_fechacreacion BETWEEN date_trunc('week', current_date) AND (date_trunc('week', current_date) + interval '6 day') ) THEN c.aecue_id END) AS SEMANA,
        COUNT(CASE WHEN(TO_CHAR(x.aeinst_cue_fechacreacion, 'MM')=$3) THEN c.aecue_id END) AS MES	
    FROM 
        data.inst_cue x, data.aecue c
    WHERE 
        x.aeano_id = $1
        AND x.aeinst_id = $2
        AND x.aeestudiantes_grupo IN (
            -- LISTA DE GRUPOS DE UN DOCENTE, GRUPOS DONDE DA CLASES
            SELECT DISTINCT aeasignaciones_grupo
            FROM data.aeasignaciones h
            WHERE h.aedocentes_id=$4 --iddocente, idacademico
            AND h.aeanol_id=$1 -- anolectivo
            AND h.aeinst_id=$2 -- institucion           
        )
        AND x.aeinst_cue_estado <> 0
        AND c.aecue_estado <> false
        AND x.aecue_id = c.aecue_id;    
    `,

    totalQuestionsTeachers:`
    -- CONSULTAS A DOCENTES HOY, SEMANA, MES
    -- $1 ANOLECTIVO, $2 IDINSTITUCION, $3 '11' MES LITERAL
    SELECT 
        COUNT(DISTINCT CASE WHEN(TO_CHAR(x.aeconsultasdocentes_fecha, 'YYYY-MM-DD')=TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD')) THEN x.aeconsultasdocentes_id END) AS HOY,
        COUNT(DISTINCT CASE WHEN(x.aeconsultasdocentes_fecha BETWEEN date_trunc('week', current_date) AND (date_trunc('week', current_date) + interval '6 day') ) THEN x.aeconsultasdocentes_id END) AS SEMANA,
        COUNT(DISTINCT CASE WHEN(TO_CHAR(x.aeconsultasdocentes_fecha, 'MM')=$3) THEN x.aeconsultasdocentes_id END) AS MES,	
        COUNT(DISTINCT CASE WHEN(TO_CHAR(x.aeconsultasdocentes_fecha, 'MM')=$3 AND x.aeusu_id=d.aeusu_id AND LENGTH (x.aeconsultasdocentescomentarios_descripcion)>5 ) THEN x.aeconsultasdocentes_id END) AS RESPONDIDAS	
    FROM (
            SELECT xx.aeconsultasdocentes_id, xx.aeconsultasdocentes_fecha, xx.aeestudiantes_id, 
            xx.aeasignaciones_asignatura, xx.aedocente_id, xx.aeinst_id, xx.aeanol_id, 
            xx.aeconsultasdocentes_descripcion, xx.aeconsultasdocentes_visibilidad, xx.aeconsultasdocentes_estado,
            c.aeconsultasdocentescomentarios_id, c.aeconsultasdocentes_id AS docenteconsultado, 
            c.aeusu_id, c.aeconsultasdocentescomentarios_fecha, c.aeconsultasdocentescomentarios_descripcion, 
            c.aeconsultasdocentescomentarios_estado
            FROM data.aeconsultasdocentes xx LEFT JOIN data.aeconsultasdocentes_comentarios c
                ON (xx.aeconsultasdocentes_id=c.aeconsultasdocentes_id)
            WHERE xx.aeanol_id = $1
            AND xx.aeinst_id = $2
            AND xx.aeconsultasdocentes_estado <> 0
        ) x, data.aedocentes d
    WHERE x.aeanol_id = $1
    AND x.aeinst_id = $2
    AND x.aeconsultasdocentes_estado <> 0
    AND x.aedocente_id = d.aedocentes_id;
    `,

    totalQuestionsTeachersSpecific:`
    -- CONSULTAS A DOCENTES HOY, SEMANA, MES
    -- $1 ANOLECTIVO, $2 IDINSTITUCION, $3 '11' MES LITERAL, $4: IDACADEMICO
    SELECT 
        COUNT(DISTINCT CASE WHEN(TO_CHAR(x.aeconsultasdocentes_fecha, 'YYYY-MM-DD')=TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD')) THEN x.aeconsultasdocentes_id END) AS HOY,
        COUNT(DISTINCT CASE WHEN(x.aeconsultasdocentes_fecha BETWEEN date_trunc('week', current_date) AND (date_trunc('week', current_date) + interval '6 day') ) THEN x.aeconsultasdocentes_id END) AS SEMANA,
        COUNT(DISTINCT CASE WHEN(TO_CHAR(x.aeconsultasdocentes_fecha, 'MM')=$3) THEN x.aeconsultasdocentes_id END) AS MES,	
        COUNT(DISTINCT CASE WHEN(TO_CHAR(x.aeconsultasdocentes_fecha, 'MM')=$3 AND x.aeusu_id=d.aeusu_id AND LENGTH (x.aeconsultasdocentescomentarios_descripcion)>5 ) THEN x.aeconsultasdocentes_id END) AS RESPONDIDAS	
    FROM (
            SELECT xx.aeconsultasdocentes_id, xx.aeconsultasdocentes_fecha, xx.aeestudiantes_id, 
            xx.aeasignaciones_asignatura, xx.aedocente_id, xx.aeinst_id, xx.aeanol_id, 
            xx.aeconsultasdocentes_descripcion, xx.aeconsultasdocentes_visibilidad, xx.aeconsultasdocentes_estado,
            c.aeconsultasdocentescomentarios_id, c.aeconsultasdocentes_id AS docenteconsultado, 
            c.aeusu_id, c.aeconsultasdocentescomentarios_fecha, c.aeconsultasdocentescomentarios_descripcion, 
            c.aeconsultasdocentescomentarios_estado
            FROM data.aeconsultasdocentes xx LEFT JOIN data.aeconsultasdocentes_comentarios c
                ON (xx.aeconsultasdocentes_id=c.aeconsultasdocentes_id)
            WHERE xx.aeanol_id = $1
            AND xx.aeinst_id = $2
            AND xx.aedocente_id = $4
            AND xx.aeconsultasdocentes_estado <> 0
        ) x, data.aedocentes d
    WHERE x.aeanol_id = $1
    AND x.aeinst_id = $2
    AND x.aedocente_id = $4
    AND x.aeconsultasdocentes_estado <> 0
    AND x.aedocente_id = d.aedocentes_id;
    `,

    topTeachersRequested:`
    -- TOP 3 DOCENTES MAS CONSULTADOS ESTE MES
    -- $1 ANOLECTIVO, $2 IDINSTITUCION, $3 '11' MES LITERAL, $4 TOPE
    SELECT x.aedocente_id, INITCAP(LOWER(d.aedocentes_nombres || ' ' || d.aedocentes_apellidos))  AS docente,
    COUNT(x.aeconsultasdocentes_id) AS consultas,
    COUNT(DISTINCT CASE WHEN(TO_CHAR(x.aeconsultasdocentes_fecha, 'MM')=$3 AND x.aeusu_id=d.aeusu_id AND LENGTH (x.aeconsultasdocentescomentarios_descripcion)>5 ) THEN x.aeconsultasdocentes_id END) AS RESPONDIDAS
    FROM (
            SELECT xx.aeconsultasdocentes_id, xx.aeconsultasdocentes_fecha, xx.aeestudiantes_id, 
            xx.aeasignaciones_asignatura, xx.aedocente_id, xx.aeinst_id, xx.aeanol_id, 
            xx.aeconsultasdocentes_descripcion, xx.aeconsultasdocentes_visibilidad, xx.aeconsultasdocentes_estado,
            c.aeconsultasdocentescomentarios_id, c.aeconsultasdocentes_id AS docenteconsultado, 
            c.aeusu_id, c.aeconsultasdocentescomentarios_fecha, c.aeconsultasdocentescomentarios_descripcion, 
            c.aeconsultasdocentescomentarios_estado
            FROM data.aeconsultasdocentes xx LEFT JOIN data.aeconsultasdocentes_comentarios c
                ON (xx.aeconsultasdocentes_id=c.aeconsultasdocentes_id)
            WHERE xx.aeanol_id = $1
            AND xx.aeinst_id = $2
            AND TO_CHAR(xx.aeconsultasdocentes_fecha, 'MM')=$3
            AND xx.aeconsultasdocentes_estado <> 0
        ) x, data.aedocentes d
    WHERE x.aedocente_id = d.aedocentes_id
    GROUP BY x.aedocente_id, d.aedocentes_nombres || ' ' || d.aedocentes_apellidos
    ORDER BY CONSULTAS DESC
    LIMIT $4;
    `,

    last5RequestedTeachers:`
    -- LAST 5 CONSULTAS PARA UN DOCENTE
    -- $1 ANOLECTIVO, $2 IDINSTITUCION, $3 '11' MES LITERAL, $4 TOPE, $5: IDDOCENTE
    SELECT x.aeestudiantes_id, INITCAP(LOWER(e.aeestudiantes_apellidos || ' ' || e.aeestudiantes_nombres))  AS estudiante,
    COUNT(x.aeconsultasdocentes_id) AS consultas,
    COUNT(DISTINCT CASE WHEN(TO_CHAR(x.aeconsultasdocentes_fecha, 'MM')=$3 AND x.aeusu_id=d.aeusu_id AND LENGTH (x.aeconsultasdocentescomentarios_descripcion)>5 ) THEN x.aeconsultasdocentes_id END) AS RESPONDIDAS
    FROM (
            SELECT xx.aeconsultasdocentes_id, xx.aeconsultasdocentes_fecha, xx.aeestudiantes_id, 
            xx.aeasignaciones_asignatura, xx.aedocente_id, xx.aeinst_id, xx.aeanol_id, 
            xx.aeconsultasdocentes_descripcion, xx.aeconsultasdocentes_visibilidad, xx.aeconsultasdocentes_estado,
            c.aeconsultasdocentescomentarios_id, c.aeconsultasdocentes_id AS docenteconsultado, 
            c.aeusu_id, c.aeconsultasdocentescomentarios_fecha, c.aeconsultasdocentescomentarios_descripcion, 
            c.aeconsultasdocentescomentarios_estado
            FROM data.aeconsultasdocentes xx LEFT JOIN data.aeconsultasdocentes_comentarios c
                ON (xx.aeconsultasdocentes_id=c.aeconsultasdocentes_id)
            WHERE xx.aeanol_id = $1
            AND xx.aeinst_id = $2
            AND xx.aedocente_id = $5
            AND TO_CHAR(xx.aeconsultasdocentes_fecha, 'MM')=$3
            AND xx.aeconsultasdocentes_estado <> 0
        ) x, data.aeestudiantes e, data.aedocentes d
    WHERE x.aeestudiantes_id = e.aeestudiantes_id
    AND x.aedocente_id=d.aedocentes_id
    GROUP BY x.aeestudiantes_id, e.aeestudiantes_apellidos || ' ' || e.aeestudiantes_nombres
    ORDER BY CONSULTAS DESC
    LIMIT $4;
    `,

    totalAlerts:`
        -- COMUNICADOS HOY, SEMANA, MES
        -- $1 ANOLECTIVO, $2 IDINSTITUCION, $3 '11' MES LITERAL, $4 TOPE
        SELECT 
            COUNT(CASE WHEN(TO_CHAR(x.aeavisos_fecha, 'YYYY-MM-DD')=TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD')) THEN x.aeavisos_id END) AS HOY,
            COUNT(CASE WHEN(x.aeavisos_fecha BETWEEN date_trunc('week', current_date) AND (date_trunc('week', current_date) + interval '6 day') ) THEN x.aeavisos_id END) AS SEMANA,
            COUNT(CASE WHEN(TO_CHAR(x.aeavisos_fecha, 'MM')=$3) THEN x.aeavisos_id END) AS MES	
        FROM data.aeavisos x
        WHERE x.aeanol_id = $1
        AND x.aeinst_id = $2
        AND x.aeavisos_estado<>0;    
    `,

    totalAlertsDocente:`
        -- COMUNICADOS HOY, SEMANA, MES
        -- $1 ANOLECTIVO, $2 IDINSTITUCION, $3 '11' MES LITERAL, $4 IDDOCENTE
        SELECT 
            COUNT(CASE WHEN(TO_CHAR(x.aeavisos_fecha, 'YYYY-MM-DD')=TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD')) THEN x.aeavisos_id END) AS HOY,
            COUNT(CASE WHEN(x.aeavisos_fecha BETWEEN date_trunc('week', current_date) AND (date_trunc('week', current_date) + interval '6 day') ) THEN x.aeavisos_id END) AS SEMANA,
            COUNT(CASE WHEN(TO_CHAR(x.aeavisos_fecha, 'MM')=$3) THEN x.aeavisos_id END) AS MES	
        FROM data.aeavisos x
        WHERE x.aeanol_id = $1
        AND x.aeinst_id = $2
        AND x.aeavisos_alcance=1 -- ALCANCE PUBLICO
        AND x.aeavisos_grupo = ANY(
            -- LISTA DE GRUPOS DE UN DOCENTE, GRUPOS DONDE DA CLASES
            SELECT array_agg(DISTINCT aeasignaciones_grupo)
            FROM data.aeasignaciones a
            WHERE a.aedocentes_id=$4 --iddocente, idacademico
            AND a.aeanol_id=$1 -- anolectivo
            AND a.aeinst_id=$2 -- institucion
        )
        AND x.aeavisos_estado<>0;    
    `,

    totalExcusesToDayTeacher:`
    -- EXCUSAS LOS GRUPOS DE UN DOCENTE SEGUN EL DIA ORDERNADAS DE MAS RECIENTE A MAS ANTIGUA
    -- $1 ANOLECTIVO, $2 IDINSTITUCION, $3 '2023-11-26' HOY LITERAL, $4 IDDOCENTE
        SELECT 
            e.aeexcusas_id AS idexcusas, e.aeinst_id AS idinstitucion, e.aeanol_id AS idanolectivo, e.aeestudiantes_id AS idestudiante, 
            (s.aeestudiantes_apellidos || ' ' || s.aeestudiantes_nombres) as estudiante,
            e.aeexcusas_fecha AS fecharegistro, 
            TO_CHAR(e.aeexcusas_desde, 'YY-MM-DD') AS fechadesde, 
            TO_CHAR(e.aeexcusas_hasta, 'YY-MM-DD') AS fechahasta, 
            t.aetipoexcusa_nombre AS tipoexcusa, 
            e.aeexcusas_mensaje AS mensaje, e.aeexcusas_archivoadjunto AS adjunto, e.aeexcusas_estado AS estado
        FROM data.aeestudiantes s, data.aeexcusas e, data.aetipoexcusas t
        WHERE e.aeanol_id=$1
        AND e.aeinst_id=$2
        AND $3::timestamp BETWEEN aeexcusas_desde AND aeexcusas_hasta
        AND s.aeestudiantes_grupo IN (
            -- LISTA DE GRUPOS DE UN DOCENTE, GRUPOS DONDE DA CLASES
            SELECT DISTINCT aeasignaciones_grupo
            FROM data.aeasignaciones a
            WHERE a.aedocentes_id=$4 --iddocente, idacademico
            AND a.aeanol_id=$1 -- anolectivo
            AND a.aeinst_id=$2 -- institucion
        )
        AND t.aetipoexcusa_id<>0
        AND e.aetipoexcusa_id=t.aetipoexcusa_id
        AND e.aeestudiantes_id=s.aeestudiantes_id
        ORDER BY e.aeexcusas_fecha DESC;
    `,

    totalWarnings:`
    -- OBSERVACIONES HOY, SEMANA, MES
    -- $1 ANOLECTIVO, $2 IDINSTITUCION, $3 '11' MES LITERAL
    SELECT 
        COUNT(CASE WHEN(TO_CHAR(x.aebitacora_fecha, 'YYYY-MM-DD')=TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD')) THEN x.aebitacora_id END) AS HOY,
        COUNT(CASE WHEN(x.aebitacora_fecha BETWEEN date_trunc('week', current_date) AND (date_trunc('week', current_date) + interval '6 day') ) THEN x.aebitacora_id END) AS SEMANA,
        COUNT(CASE WHEN(TO_CHAR(x.aebitacora_fecha, 'MM')=$3) THEN x.aebitacora_id END) AS MES	
    FROM data.aebitacora x
    WHERE x.aeanol_id = $1
    AND x.aeinst_id = $2;    
    `,

    totalWarningsXTeacher:`
    -- OBSERVACIONES HOY, SEMANA, MES
    -- $1 ANOLECTIVO, $2 IDINSTITUCION, $3 '11' MES LITERAL
    SELECT 
        COUNT(CASE WHEN(TO_CHAR(x.aebitacora_fecha, 'YYYY-MM-DD')=TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD')) THEN x.aebitacora_id END) AS HOY,
        COUNT(CASE WHEN(x.aebitacora_fecha BETWEEN date_trunc('week', current_date) AND (date_trunc('week', current_date) + interval '6 day') ) THEN x.aebitacora_id END) AS SEMANA,
        COUNT(CASE WHEN(TO_CHAR(x.aebitacora_fecha, 'MM')=$3) THEN x.aebitacora_id END) AS MES	
    FROM data.aebitacora x
    WHERE x.aeanol_id = $1
    AND x.aeinst_id = $2
    AND x.aebitacora_grupo = ANY(
		-- LISTA DE GRUPOS DE UN DOCENTE, GRUPOS DONDE DA CLASES
		SELECT array_agg(DISTINCT aeasignaciones_grupo)
		FROM data.aeasignaciones a
		WHERE a.aedocentes_id=$4 --iddocente, idacademico
		AND a.aeanol_id=$1 -- anolectivo
		AND a.aeinst_id=$2 -- institucion  
    );    
    `,

    topWarningsByGroups:`
    -- GRUPOS CON MAS OBSERVACIONES
    -- $1 ANOLECTIVO, $2 IDINSTITUCION, $3 '11' MES LITERAL, $4 TOPE
    SELECT e.aeestudiantes_id, e.aeestudiantes_apellidos  || ' ' || e.aeestudiantes_nombres AS LOSMALOS,
    COUNT(x.aebitacora_id) AS CONSULTAS
    FROM data.aebitacora x, data.aeestudiantes e
    WHERE x.aeanol_id = $1
    AND x.aeinst_id = $2
    AND TO_CHAR(x.aebitacora_fecha, 'MM')=$3
    AND x.aeinst_id = e.aeinstitucion_id 
    AND x.aeanol_id = e.aeano_id
    AND e.aeestudiantes_id = ANY(x.aebitacora_estudiantesid)
    GROUP BY e.aeestudiantes_id, e.aeestudiantes_apellidos  || ' ' || e.aeestudiantes_nombres
    ORDER BY CONSULTAS DESC
    LIMIT $4;    
    `,

    resumeStudentsByGroup:`
    -- GRUPOS Y SUS ESTUDIANTES
    -- $1 ANOLECTIVO, $2 IDINSTITUCION
    SELECT e.aeestudiantes_grupo as grupo, 
    COUNT(DISTINCT CASE WHEN (e.aeestudiantes_estado=1) THEN e.aeestudiantes_id END) AS ACTIVOS,
    COUNT(DISTINCT CASE WHEN (e.aeestudiantes_estado=22) THEN e.aeestudiantes_id END) AS INACTIVOS,
    COUNT(DISTINCT CASE WHEN (e.aeestudiantes_grupo=x.aeestudiantes_grupo 
        AND x.aeasistencias_fecha=CURRENT_DATE 
        AND (x.novino>0 AND x.vino=0) ) THEN x.aeestudiantes_id END ) AS NOVINOHOY,
    COUNT(DISTINCT CASE WHEN (e.aeestudiantes_grupo=x.aeestudiantes_grupo 
        AND TO_CHAR(x.aeasistencias_fecha, 'MM')=TO_CHAR(CURRENT_DATE, 'MM')
        AND (x.novino>0 AND x.vino=0) 
        ) THEN x.aeestudiantes_id END ) AS NOVINOMES
    FROM 
        data.aeestudiantes e LEFT JOIN (
            -- VER POR ESTUDIANTE, CUANTAS FALLAS O ASISTENCIAS TIENE REGISTRADAS EN EL DIA
            SELECT a.aeasistencias_fecha, a.aeestudiantes_id, a.aeestudiantes_grupo, 
            COUNT(CASE WHEN (a.aeasistencias_llego=1) THEN a.aeasistencia_id END  ) AS VINO,
            COUNT(CASE WHEN (a.aeasistencias_llego=0) THEN a.aeasistencia_id END  ) AS NOVINO
            FROM data.aeasistencias a
            WHERE TO_CHAR(a.aeasistencias_fecha, 'MM')=TO_CHAR(CURRENT_DATE, 'MM')
                AND a.aeestudiantes_grupo IN (
                    -- LISTA DE GRUPOS DE UN DOCENTE, GRUPOS DONDE DA CLASES
                    SELECT DISTINCT aeasignaciones_grupo
                    FROM data.aeasignaciones a
                    WHERE a.aeanol_id=$1 -- anolectivo
                    AND a.aeinst_id=$2 -- institucion
                )   
            GROUP BY a.aeasistencias_fecha, a.aeestudiantes_id, a.aeestudiantes_grupo    
    ) AS x
        ON (e.aeestudiantes_id=x.aeestudiantes_id)
    WHERE e.aeinstitucion_id = $2
    AND aeano_id = $1
    GROUP BY e.aeestudiantes_grupo
    ORDER BY COALESCE(NULLIF(regexp_replace(e.aeestudiantes_grupo, '[^0-9]*','','g'), '')::NUMERIC, 0);    
    `,

    resumeStudentsByGroupTeacher:`
        -- GRUPOS Y SUS ESTUDIANTES
        -- $1 ANOLECTIVO, $2 IDINSTITUCION, $3 IDACADEMICO
        SELECT e.aeestudiantes_grupo as grupo, 
        COUNT(DISTINCT CASE WHEN (e.aeestudiantes_estado=1) THEN e.aeestudiantes_id END) AS ACTIVOS,
        COUNT(DISTINCT CASE WHEN (e.aeestudiantes_estado=22) THEN e.aeestudiantes_id END) AS INACTIVOS,
        COUNT(DISTINCT CASE WHEN (e.aeestudiantes_grupo=x.aeestudiantes_grupo 
            AND x.aeasistencias_fecha=CURRENT_DATE 
            AND (x.novino>0 AND x.vino=0) ) THEN x.aeestudiantes_id END ) AS NOVINOHOY,
        COUNT(DISTINCT CASE WHEN (e.aeestudiantes_grupo=x.aeestudiantes_grupo 
            AND TO_CHAR(x.aeasistencias_fecha, 'MM')=TO_CHAR(CURRENT_DATE, 'MM')
            AND (x.novino>0 AND x.vino=0) 
            ) THEN x.aeestudiantes_id END ) AS NOVINOMES
        FROM 
            data.aeestudiantes e LEFT JOIN (
            -- VER POR ESTUDIANTE, CUANTAS FALLAS O ASISTENCIAS TIENE REGISTRADAS EN EL DIA
            SELECT a.aeasistencias_fecha, a.aeestudiantes_id, a.aeestudiantes_grupo, 
            COUNT(CASE WHEN (a.aeasistencias_llego=1) THEN a.aeasistencia_id END  ) AS VINO,
            COUNT(CASE WHEN (a.aeasistencias_llego=0) THEN a.aeasistencia_id END  ) AS NOVINO
            FROM data.aeasistencias a
            WHERE TO_CHAR(a.aeasistencias_fecha, 'MM')=TO_CHAR(CURRENT_DATE, 'MM')
                AND a.aeestudiantes_grupo IN (
                    -- LISTA DE GRUPOS DE UN DOCENTE, GRUPOS DONDE DA CLASES
                    SELECT DISTINCT aeasignaciones_grupo
                    FROM data.aeasignaciones a
                    WHERE a.aedocentes_id=$3 --iddocente, idacademico
                    AND a.aeanol_id=$1 -- anolectivo
                    AND a.aeinst_id=$2 -- institucion    
                )   
            GROUP BY a.aeasistencias_fecha, a.aeestudiantes_id, a.aeestudiantes_grupo    
        ) AS x
            ON (e.aeestudiantes_id=x.aeestudiantes_id)
        WHERE e.aeinstitucion_id = $2
        AND e.aeano_id = $1
        AND e.aeestudiantes_grupo IN (
            -- LISTA DE GRUPOS DE UN DOCENTE, GRUPOS DONDE DA CLASES
            SELECT DISTINCT aeasignaciones_grupo
            FROM data.aeasignaciones a
            WHERE a.aedocentes_id=$3 --iddocente, idacademico
            AND a.aeanol_id=$1 -- anolectivo
            AND a.aeinst_id=$2 -- institucion    
        )
        GROUP BY e.aeestudiantes_grupo
        ORDER BY COALESCE(NULLIF(regexp_replace(e.aeestudiantes_grupo, '[^0-9]*','','g'), '')::NUMERIC, 0);
    `,

    resumeWPMessageSent:`
    -- WHATSAPP: ESTADO DE LA CONEXION Y MENSAJES ENVIADOS, HOY Y ESTE MES
    -- $1 IDINSTITUCION
    SELECT 
    t.aetipoenvio_id AS tipo, t.aetipoenvio_descripcion AS descripcion,
    SUM(CASE WHEN (TO_CHAR(l.fecharegistro, 'YYYY-MM-DD')=TO_CHAR(CURRENT_TIMESTAMP, 'YYYY-MM-DD')) THEN 1 ELSE 0 END) AS ENVIADOSHOY,
    SUM(CASE WHEN (TO_CHAR(l.fecharegistro, 'YYYY-MM')=TO_CHAR(CURRENT_TIMESTAMP, 'YYYY-MM')) THEN 1 ELSE 0 END) AS ENVIADOSMES,
    COUNT(l.idlogenvios) AS ENVIADOSTOTAL
    FROM data.aetipo_envio t 
    LEFT JOIN data.aelog_envios l ON 
            (t.aetipoenvio_id = l.tipo
            AND l.idempresa=$1
            AND l.sent=true)
    GROUP BY t.aetipoenvio_id, t.aetipoenvio_descripcion
    ORDER BY tipo;    
    `,

    resumeWPMessageStatus:`
    -- WHATSAPP: ESTADO DEL EMISOR Y DATOS DE LA EMPRESA
    -- $1 IDINSTITUCION
    SELECT i.aeinst_id as empresaid, i.aeinst_nombre as empresanombre,
    e.idemisor, e.emisor, e.estado AS idestado, CASE WHEN (e.estado=6) THEN 'CONECTADO' ELSE 'DESCONECTADO' END AS estado
    FROM data.aeinstituciones i
        LEFT JOIN contact.emisor e ON 
        (i.aeinst_id=e.idempresa)
    WHERE i.aeinst_id=$1;   
    `,
}