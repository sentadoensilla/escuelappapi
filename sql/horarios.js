
module.exports={
    horarios:`
    -- MOSTRAMOS EL HORARIO DE UN SALON DE CLASES
    SELECT row_to_json(u)
    FROM (
        SELECT y.aeasignaciones_hora,
        (
            SELECT
                array_to_json(array_agg(x))
            FROM (
                SELECT a.aeasignaciones_dia, a.aeasignaciones_id, a.aeasignaciones_asignatura,
                a.aedocentes_id, 
                lower(d.aedocentes_nombres || ' ' || d.aedocentes_apellidos) as docente, 
                a.aeasignaciones_enlace, a.aeasignaciones_grupo
                FROM data.aeasignaciones a, data.aedocentes d
                WHERE a.aeanol_id = $1 -- ID ANOLECTIVO
                AND a.aeinst_id=$2 -- ID INSTITUCION
                AND a.aeasignaciones_hora = y.aeasignaciones_hora
                AND a.aeasignaciones_estado=1 
                AND a.aedocentes_id=d.aedocentes_id
                AND a.aeasignaciones_grupo=y.aeasignaciones_grupo
                ORDER BY aeasignaciones_dia, aeasignaciones_hora
            ) x
        ) as detalles
        FROM data.aeasignaciones y
        WHERE y.aeasignaciones_grupo LIKE $3 -- GRUPO
        AND y.aeanol_id=$1 -- ID ANOLECTIVO
        AND y.aeinst_id=$2 -- ID INSTITUCION
        GROUP BY y.aeasignaciones_hora, y.aeasignaciones_grupo
        ORDER BY aeasignaciones_hora
    ) u`,
    horariosSeguimiento:`
    -- MUESTRA LAS ASISTENCIAS MARCADAS EN EL HORARIO DE CLASES
    SELECT row_to_json(u) AS data
    FROM (
               SELECT y.aeasignaciones_hora AS hora,
               (
                       SELECT 
                           array_to_json(array_agg(w))
                       FROM (
                           SELECT
                               x.aeasignaciones_dia AS dia, x.aeasignaciones_asignatura AS asignatura,
                               x.aedocentes_id as iddocente, x.docente, x.aeasignaciones_enlace AS enlace, x.aeasignaciones_grupo AS grupo,
                               z.asistieron, z.faltaron
                           FROM (
                               SELECT a.aeasignaciones_dia, a.aeasignaciones_asignatura,
                               a.aedocentes_id, 
                               lower(d.aedocentes_nombres || ' ' || d.aedocentes_apellidos) as docente, 
                               a.aeasignaciones_enlace, a.aeasignaciones_grupo
                               FROM data.aeasignaciones a, data.aedocentes d
                               WHERE a.aeanol_id = $1 -- ID ANOLECTIVO
                               AND a.aeinst_id = $2 -- ID INSTITUCION
                               AND a.aeasignaciones_hora = y.aeasignaciones_hora
                               AND a.aeasignaciones_estado=1 
                               AND a.aedocentes_id=d.aedocentes_id
                               AND a.aeasignaciones_grupo=y.aeasignaciones_grupo
                               ORDER BY aeasignaciones_dia, aeasignaciones_hora
                           ) x LEFT JOIN
                           (
                                   SELECT v.aeasistencias_docente, v.aeestudiantes_grupo, v.aeasignaciones_asignatura,
                                   (EXTRACT('DOW' FROM v.aeasistencias_fecha)+1) AS dia,
                                   COUNT(CASE WHEN (v.aeasistencias_llego<>0) THEN aeestudiantes_id END) AS asistieron,
                                   COUNT(CASE WHEN (v.aeasistencias_llego=0) THEN aeestudiantes_id END) AS faltaron
                                   FROM data.aeasistencias v
                                   WHERE v.aeasistencias_fecha BETWEEN $4 AND $5
                                   AND v.aeestudiantes_grupo=y.aeasignaciones_grupo
                                   AND v.aeasistencias_estado=1
                                   GROUP BY v.aeasistencias_docente, v.aeestudiantes_grupo, 
                                   (EXTRACT('DOW' FROM v.aeasistencias_fecha)+1), v.aeasignaciones_asignatura,
                                   v.aeasignaciones_asignatura
                           ) z
                           ON 
                               x.aedocentes_id=z.aeasistencias_docente
                               AND x.aeasignaciones_grupo=z.aeestudiantes_grupo
                               AND x.aeasignaciones_asignatura=z.aeasignaciones_asignatura
                               AND x.aeasignaciones_dia=z.dia
                           GROUP BY 
                               x.aeasignaciones_dia, x.aeasignaciones_asignatura,
                               x.aedocentes_id, x.docente, x.aeasignaciones_enlace, x.aeasignaciones_grupo,
                               z.asistieron, z.faltaron
                     ) w
               ) as detalles
               FROM data.aeasignaciones y
               WHERE y.aeasignaciones_grupo LIKE $3 -- GRUPO
               AND y.aeanol_id = $1 -- ID ANOLECTIVO
               AND y.aeinst_id = $2 -- ID INSTITUCION
               GROUP BY y.aeasignaciones_hora, y.aeasignaciones_grupo
               ORDER BY aeasignaciones_hora
      ) u
    `,
    horariosSendPapas_nueva:`
        -- LA NUEVA    
        -- HORARIOS POR DIAS, PARA ENVIAR A LOS ACUDIENTES EN TAREA PROGRAMADA
        SELECT 
        a.aeasignaciones_dia AS DIA, a.aeasignaciones_grupo AS GRUPO, 
        ARRAY_AGG (TO_CHAR(a.aeasignaciones_hora, 'HH24:MI') || ' ' || UPPER(a.aeasignaciones_asignatura) 
        ORDER BY a.aeasignaciones_hora ) AS ASIGNATURAS,
        (
          SELECT ARRAY_AGG(DISTINCT x.whatsapp)
          FROM (      
		            SELECT e.aeano_id, e.aeinstitucion_id, e.aeestudiantes_grupo, p.aeestudiantes_telefonoacudiente AS whatsapp
		            FROM data.aeestudiantes e LEFT JOIN data.aeacudientes p
		                 ON (e.aeestudiantes_id =p.aeestudiantes_id)
		            WHERE e.aeinstitucion_id = 49
        				AND e.aeano_id = $1
		            GROUP BY e.aeano_id, e.aeinstitucion_id, e.aeestudiantes_grupo, p.aeestudiantes_telefonoacudiente
	            UNION 
		            SELECT e.aeano_id, e.aeinstitucion_id, e.aeestudiantes_grupo, e.aeestudiantes_telefono AS whatsapp
		            FROM data.aeestudiantes e LEFT JOIN data.aeacudientes p
		                 ON (e.aeestudiantes_id =p.aeestudiantes_id)
		            WHERE e.aeinstitucion_id = 49
        				AND e.aeano_id = 15
		            GROUP BY e.aeano_id, e.aeinstitucion_id, e.aeestudiantes_grupo, e.aeestudiantes_telefono 
	           ) x
	       WHERE x.aeano_id=a.aeanol_id
	       AND x.aeinstitucion_id=a.aeinst_id
	       AND x.aeestudiantes_grupo=a.aeasignaciones_grupo
        ) AS CONTACTOS
        FROM data.aeasignaciones a
        WHERE a.aeinst_id = 49
        AND a.aeanol_id = 15
        -- AQUI ENCAJAMOS EL DIA DE MANANA CON EL HORARIO RESTANDO PORQUE EN EL HORARIO SE REGISTRA MAL
        AND (a.aeasignaciones_dia-1)=extract(dow from (CURRENT_DATE + INTERVAL '1 day')) 
        GROUP BY a.aeanol_id, a.aeinst_id, a.aeasignaciones_dia, a.aeasignaciones_grupo
        ORDER BY NULLIF(regexp_replace(a.aeasignaciones_grupo, '[^0-9]*','','g'), '')::numeric;
        `,
}