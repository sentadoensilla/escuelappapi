module.exports={
  attendanceCountGlobal:`
  -- TOTAL AUSENTISMO POR INSTITUCION: AUSENTISMO GLOBAL
  SELECT aeinst_id, aeinst_nombre, aeinstconf_anolectivo, 
  array_agg(aeestudiantes_id) AS aeestudiantes_id, 
  COUNT(aeestudiantes_nombres) AS AUSENTISMO, SUM(aeexcusas) AS EXCUSAS
  FROM (
      SELECT i.aeinst_id, i.aeinst_nombre, c.aeinstconf_anolectivo, c.aeinstconf_asistencias_umbralweek,
      e.aeestudiantes_id, initcap(lower(e.aeestudiantes_apellidos)) || ' ' || initcap(lower(e.aeestudiantes_nombres)) AS aeestudiantes_nombres,
      a.aeestudiantes_grupo, e.aeestudiantes_mail,
      (
          SELECT array_agg(aeestudiantes_mailacudiente)
          FROM data.aeacudientes c
          WHERE c.aeacudientes_id=e.aeacudientes_id
      ) AS aeacudientes_mail,
      e.aeestudiantes_telefono,
      (
          SELECT array_agg(aeestudiantes_telefonoacudiente)
          FROM data.aeacudientes c
          WHERE c.aeacudientes_id=e.aeacudientes_id
      ) AS aeacudientes_telefono,
      COUNT(DISTINCT a.aeasistencias_fecha) AS INASISTENCIAS,
	  (
	      SELECT COUNT(DISTINCT x.aeestudiantes_id) AS estudiantes
	      FROM data.aeexcusas x
	      WHERE (
	      	($3 BETWEEN TO_CHAR(x.aeexcusas_desde, 'YYYY-MM-DD') AND TO_CHAR(x.aeexcusas_hasta, 'YYYY-MM-DD') )
	      	OR ($4 BETWEEN TO_CHAR(x.aeexcusas_desde, 'YYYY-MM-DD') AND TO_CHAR(x.aeexcusas_hasta, 'YYYY-MM-DD') )
	      	)
	      AND x.aeexcusas_estado <> 0
	      AND x.aeestudiantes_id = e.aeestudiantes_id      
	      AND x.aeinst_id = i.aeinst_id
		  AND x.aeanol_id = c.aeinstconf_anolectivo
	  ) AS aeexcusas      
      FROM data.aeasistencias a, data.aeestudiantes e, data.aeinstituciones i, data.aeinstituciones_conf c
      WHERE e.aeano_id = ANY ($1)
      AND TO_CHAR(a.aeasistencias_fecha, 'YYYY-MM-DD') BETWEEN $3 AND $4
      AND e.aeestudiantes_estado <> 0
      AND a.aeasistencias_llego=0
      AND e.aeinstitucion_id = ANY ($2)
      AND e.aeestudiantes_id=a.aeestudiantes_id
      AND e.aeinstitucion_id = i.aeinst_id
      AND i.aeinst_id = c.aeinst_id
      GROUP BY i.aeinst_id, i.aeinst_nombre, c.aeinstconf_anolectivo, c.aeinstconf_asistencias_umbralweek,
      e.aeestudiantes_id, initcap(lower(aeestudiantes_apellidos)) || ' ' || initcap(lower(aeestudiantes_nombres)),
      a.aeestudiantes_grupo, e.aeestudiantes_mail, e.aeacudientes_id, e.aeestudiantes_telefono
      HAVING COUNT(DISTINCT a.aeasistencias_fecha) > c.aeinstconf_asistencias_umbralweek
  ) au
  GROUP BY aeinst_id, aeinst_nombre, aeinstconf_anolectivo
  ORDER BY aeinst_nombre;`,

  attendanceCountGlobal_old:`
  -- TOTAL AUSENTISMO POR INSTITUCION
  SELECT aeinst_id, aeinst_nombre, aeinstconf_anolectivo, COUNT(aeestudiantes_grupo) AS CANTIDAD
  FROM (
      SELECT i.aeinst_id, i.aeinst_nombre, c.aeinstconf_anolectivo, initcap(lower(e.aeestudiantes_apellidos)) || ' ' || initcap(lower(e.aeestudiantes_nombres)) AS aeestudiantes_nombres,
      a.aeestudiantes_grupo, e.aeestudiantes_mail, e.aeestudiantes_telefono,
      (
          SELECT array_agg(aeestudiantes_telefonoacudiente)
          FROM data.aeacudientes c
          WHERE c.aeacudientes_id=e.aeacudientes_id
      ) AS aeacudientes_telefono,
      COUNT(DISTINCT a.aeasistencias_fecha) AS INASISTENCIAS
      FROM data.aeasistencias a, data.aeestudiantes e, data.aeinstituciones i, data.aeinstituciones_conf c
      WHERE e.aeano_id = $1
      AND a.aeasistencias_fecha BETWEEN $3 AND $4
      AND e.aeestudiantes_estado <> 0
      AND a.aeasistencias_llego=0
      AND e.aeinstitucion_id = ANY ($2)
      AND e.aeestudiantes_id=a.aeestudiantes_id
      AND e.aeinstitucion_id = i.aeinst_id
      AND i.aeinst_id = c.aeinst_id
      GROUP BY i.aeinst_id, i.aeinst_nombre, c.aeinstconf_anolectivo, initcap(lower(aeestudiantes_apellidos)) || ' ' || initcap(lower(aeestudiantes_nombres)),
      a.aeestudiantes_grupo, e.aeestudiantes_mail, e.aeacudientes_id, e.aeestudiantes_telefono
      HAVING COUNT(DISTINCT a.aeasistencias_fecha) > $5
  ) au
  GROUP BY aeinst_id, aeinst_nombre, aeinstconf_anolectivo
  ORDER BY aeinst_nombre;`,

  attendanceCount:`
    -- TOTAL AUSENTISMO POR GRUPO
      SELECT row_to_json(u) as datos
      FROM (
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
          FROM data.aeasistencias a, data.aeestudiantes e
          WHERE e.aeano_id = $1 AND e.aeinstitucion_id = $2
          AND e.aeestudiantes_estado <> 0
          AND a.aeasistencias_fecha BETWEEN $3 AND $4
          AND a.aeasistencias_llego=0
          AND e.aeestudiantes_id=a.aeestudiantes_id
          GROUP BY initcap(lower(aeestudiantes_apellidos)) || ' ' || initcap(lower(aeestudiantes_nombres)),
          a.aeestudiantes_grupo, e.aeestudiantes_mail, e.aeacudientes_id, e.aeestudiantes_telefono
          HAVING COUNT(DISTINCT a.aeasistencias_fecha) > $5
        ) au
        GROUP BY aeestudiantes_grupo
        ORDER BY COALESCE(NULLIF(regexp_replace(aeestudiantes_grupo, '[^0-9]*','','g'), '')::NUMERIC, 0)
      ) u;  
      `,

  attendanceMonth:`
  -- ASISTENCIA POR GRUPO EN UN MES DETERMINADO
  -- SELECT row_to_json(u) as datos
  -- FROM (
      SELECT t.aeestudiantes_grupo "grupo", t.aeestudiantes_codigo "codigo", t.aeestudiantes_nombres "estudiante",
      MAX(CASE 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '01' AND t.aeasistencias_llego > 0 ) THEN 'A'
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '01' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa <= 0 ) THEN 'F' 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '01' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa > 0 ) THEN 'E'
        END) AS " 01",
      MAX(CASE 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '02' AND t.aeasistencias_llego > 0 ) THEN 'A'
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '02' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa <= 0 ) THEN 'F' 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '02' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa > 0 ) THEN 'E'
        END) AS " 02",	
      MAX(CASE 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '03' AND t.aeasistencias_llego > 0 ) THEN 'A'
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '03' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa <= 0 ) THEN 'F' 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '03' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa > 0 ) THEN 'E'
        END) AS " 03",
      MAX(CASE 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '04' AND t.aeasistencias_llego > 0 ) THEN 'A'
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '04' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa <= 0 ) THEN 'F' 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '04' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa > 0 ) THEN 'E'
        END) AS " 04",	
      MAX(CASE 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '05' AND t.aeasistencias_llego > 0 ) THEN 'A'
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '05' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa <= 0 ) THEN 'F' 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '05' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa > 0 ) THEN 'E'
        END) AS " 05",
      MAX(CASE 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '06' AND t.aeasistencias_llego > 0 ) THEN 'A'
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '06' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa <= 0 ) THEN 'F' 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '06' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa > 0 ) THEN 'E'
        END) AS " 06",	
      MAX(CASE 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '07' AND t.aeasistencias_llego > 0 ) THEN 'A'
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '07' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa <= 0 ) THEN 'F' 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '07' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa > 0 ) THEN 'E'
        END) AS " 07",	
      MAX(CASE 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '08' AND t.aeasistencias_llego > 0 ) THEN 'A'
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '08' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa <= 0 ) THEN 'F' 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '08' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa > 0 ) THEN 'E'
        END) AS " 08",	
      MAX(CASE 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '09' AND t.aeasistencias_llego > 0 ) THEN 'A'
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '09' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa <= 0 ) THEN 'F' 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '09' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa > 0 ) THEN 'E'
        END) AS " 09",	
      MAX(CASE 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '10' AND t.aeasistencias_llego > 0 ) THEN 'A'
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '10' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa <= 0 ) THEN 'F' 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '10' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa > 0 ) THEN 'E'
        END) AS " 10",
      MAX(CASE 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '11' AND t.aeasistencias_llego > 0 ) THEN 'A'
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '11' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa <= 0 ) THEN 'F' 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '11' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa > 0 ) THEN 'E'
        END) AS " 11",	
      MAX(CASE 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '12' AND t.aeasistencias_llego > 0 ) THEN 'A'
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '12' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa <= 0 ) THEN 'F' 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '12' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa > 0 ) THEN 'E'
        END) AS " 12",	
      MAX(CASE 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '13' AND t.aeasistencias_llego > 0 ) THEN 'A'
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '13' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa <= 0 ) THEN 'F' 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '13' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa > 0 ) THEN 'E'
        END) AS " 13",
      MAX(CASE 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '14' AND t.aeasistencias_llego > 0 ) THEN 'A'
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '14' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa <= 0 ) THEN 'F' 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '14' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa > 0 ) THEN 'E'
        END) AS " 14",	
      MAX(CASE 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '15' AND t.aeasistencias_llego > 0 ) THEN 'A'
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '15' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa <= 0 ) THEN 'F' 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '15' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa > 0 ) THEN 'E'
        END) AS " 15",
      MAX(CASE 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '16' AND t.aeasistencias_llego > 0 ) THEN 'A'
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '16' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa <= 0 ) THEN 'F' 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '16' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa > 0 ) THEN 'E'
        END) AS " 16",	
      MAX(CASE 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '17' AND t.aeasistencias_llego > 0 ) THEN 'A'
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '17' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa <= 0 ) THEN 'F' 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '17' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa > 0 ) THEN 'E'
        END) AS " 17",	
      MAX(CASE 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '18' AND t.aeasistencias_llego > 0 ) THEN 'A'
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '18' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa <= 0 ) THEN 'F' 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '18' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa > 0 ) THEN 'E'
        END) AS " 18",	
      MAX(CASE 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '19' AND t.aeasistencias_llego > 0 ) THEN 'A'
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '19' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa <= 0 ) THEN 'F' 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '19' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa > 0 ) THEN 'E'
        END) AS " 19",	
      MAX(CASE 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '20' AND t.aeasistencias_llego > 0 ) THEN 'A'
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '20' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa <= 0 ) THEN 'F' 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '20' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa > 0 ) THEN 'E'
        END) AS " 20",
      MAX(CASE 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '21' AND t.aeasistencias_llego > 0 ) THEN 'A'
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '21' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa <= 0 ) THEN 'F' 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '21' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa > 0 ) THEN 'E'
        END) AS " 21",	
      MAX(CASE 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '22' AND t.aeasistencias_llego > 0 ) THEN 'A'
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '22' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa <= 0 ) THEN 'F' 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '22' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa > 0 ) THEN 'E'
        END) AS " 22",	
      MAX(CASE 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '23' AND t.aeasistencias_llego > 0 ) THEN 'A'
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '23' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa <= 0 ) THEN 'F' 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '23' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa > 0 ) THEN 'E'
        END) AS " 23",
      MAX(CASE 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '24' AND t.aeasistencias_llego > 0 ) THEN 'A'
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '24' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa <= 0 ) THEN 'F' 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '24' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa > 0 ) THEN 'E'
        END) AS " 24",	
      MAX(CASE 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '25' AND t.aeasistencias_llego > 0 ) THEN 'A'
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '25' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa <= 0 ) THEN 'F' 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '25' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa > 0 ) THEN 'E'
        END) AS " 25",
      MAX(CASE 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '26' AND t.aeasistencias_llego > 0 ) THEN 'A'
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '26' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa <= 0 ) THEN 'F' 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '26' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa > 0 ) THEN 'E'
        END) AS " 26",	
      MAX(CASE 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '27' AND t.aeasistencias_llego > 0 ) THEN 'A'
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '27' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa <= 0 ) THEN 'F' 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '27' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa > 0 ) THEN 'E'
        END) AS " 27",	
      MAX(CASE 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '28' AND t.aeasistencias_llego > 0 ) THEN 'A'
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '28' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa <= 0 ) THEN 'F' 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '28' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa > 0 ) THEN 'E'
        END) AS " 28",	
      MAX(CASE 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '29' AND t.aeasistencias_llego > 0 ) THEN 'A'
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '29' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa <= 0 ) THEN 'F' 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '29' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa > 0 ) THEN 'E'
        END) AS " 29",	
      MAX(CASE 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '30' AND t.aeasistencias_llego > 0 ) THEN 'A'
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '30' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa <= 0 ) THEN 'F' 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '30' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa > 0 ) THEN 'E'
        END) AS " 30",	
      MAX(CASE 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '31' AND t.aeasistencias_llego > 0 ) THEN 'A'
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '31' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa <= 0 ) THEN 'F' 
          WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '31' AND t.aeasistencias_llego <= 0 AND t.aeasistencia_excusa > 0 ) THEN 'E'
        END) AS " 31"
      FROM (
          -- ASISTENCIAS Y EXCUSAS DE CADA ESTUDIANTE EN UN PERIODO DE TIEMPO
          SELECT 
            a.aeasistencias_fecha,
            e.aeestudiantes_codigo,
            a.aeestudiantes_grupo, 
            initcap(lower(e.aeestudiantes_apellidos)) || ' ' || initcap(lower(e.aeestudiantes_nombres)) AS aeestudiantes_nombres,
            SUM(a.aeasistencias_llego::integer) AS aeasistencias_llego,
            COUNT( CASE WHEN 
              (x.aeestudiantes_id = a.aeestudiantes_id
              AND a.aeasistencias_fecha BETWEEN aeexcusas_desde AND aeexcusas_hasta ) 
              THEN 
                aeexcusas_id
              END
            ) AS aeasistencia_excusa
          FROM 
            data.aeestudiantes e LEFT JOIN data.aeasistencias a
              ON (a.aeestudiantes_id = e.aeestudiantes_id
                AND e.aeestudiantes_grupo = a.aeestudiantes_grupo)
            LEFT JOIN data.aeexcusas x
              ON (e.aeinstitucion_id = x.aeinst_id
                AND e.aeano_id = x.aeanol_id )
          WHERE TO_CHAR(a.aeasistencias_fecha, 'MM') = $4
            AND e.aeinstitucion_id = $2
            AND e.aeano_id = $1
            AND e.aeestudiantes_grupo LIKE $3
          GROUP BY 
            a.aeasistencias_fecha,
            e.aeestudiantes_codigo,
            a.aeestudiantes_grupo,
            initcap(lower(e.aeestudiantes_apellidos)) || ' ' || initcap(lower(e.aeestudiantes_nombres))
        ) t
      GROUP BY 
        t.aeestudiantes_grupo, t.aeestudiantes_codigo, t.aeestudiantes_nombres
      ORDER BY estudiante;
  -- ) u;
  `,

  attendanceMontAssigment:`
  -- ASISTENCIA POR GRUPO EN UN MES DETERMINADO
  -- SELECT row_to_json(u) as datos
  -- FROM (
    SELECT t.aeestudiantes_codigo "codigo", t.aeestudiantes_grupo "grupo", t.aeasignaciones_asignatura "asignatura", t.aeestudiantes_nombres "estudiante", 
    MAX(CASE 
        WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '01' AND t.aeasistencias_llego IS NOT NULL ) THEN t.ctiponoveabre 
        WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '01' AND t.aeasistencia_excusa > 0 ) THEN 'E'
      END) AS " 01",
    MAX(CASE 
        WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '02' AND t.aeasistencias_llego IS NOT NULL ) THEN t.ctiponoveabre
        WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '02' AND t.aeasistencia_excusa > 0 ) THEN 'E'
      END) AS " 02",	
    MAX(CASE 
        WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '03' AND t.aeasistencias_llego IS NOT NULL ) THEN t.ctiponoveabre
        WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '03' AND t.aeasistencia_excusa > 0 ) THEN 'E'
      END) AS " 03",
    MAX(CASE 
        WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '04' AND t.aeasistencias_llego IS NOT NULL ) THEN t.ctiponoveabre
        WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '04' AND t.aeasistencia_excusa > 0 ) THEN 'E'
      END) AS " 04",	
    MAX(CASE 
      WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '05' AND t.aeasistencias_llego IS NOT NULL ) THEN t.ctiponoveabre
        WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '05' AND t.aeasistencia_excusa > 0 ) THEN 'E'      
      END) AS " 05",
    MAX(CASE 
      WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '06' AND t.aeasistencias_llego IS NOT NULL ) THEN t.ctiponoveabre
        WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '06' AND t.aeasistencia_excusa > 0 ) THEN 'E'
      END) AS " 06",	
    MAX(CASE 
      WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '07' AND t.aeasistencias_llego IS NOT NULL ) THEN t.ctiponoveabre
        WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '07' AND t.aeasistencia_excusa > 0 ) THEN 'E'
      END) AS " 07",	
    MAX(CASE 
      WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '08' AND t.aeasistencias_llego IS NOT NULL ) THEN t.ctiponoveabre
        WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '08' AND t.aeasistencia_excusa > 0 ) THEN 'E'
      END) AS " 08",	
    MAX(CASE 
      WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '09' AND t.aeasistencias_llego IS NOT NULL ) THEN t.ctiponoveabre
        WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '09' AND t.aeasistencia_excusa > 0 ) THEN 'E'
      END) AS " 09",	
    MAX(CASE 
      WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '10' AND t.aeasistencias_llego IS NOT NULL ) THEN t.ctiponoveabre
        WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '10' AND t.aeasistencia_excusa > 0 ) THEN 'E'
      END) AS " 10",
    MAX(CASE  
      WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '11' AND t.aeasistencias_llego IS NOT NULL ) THEN t.ctiponoveabre
        WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '11' AND t.aeasistencia_excusa > 0 ) THEN 'E'
      END) AS " 11",	
    MAX(CASE 
      WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '12' AND t.aeasistencias_llego IS NOT NULL ) THEN t.ctiponoveabre
        WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '12' AND t.aeasistencia_excusa > 0 ) THEN 'E'
      END) AS " 12",	
    MAX(CASE 
      WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '13' AND t.aeasistencias_llego IS NOT NULL ) THEN t.ctiponoveabre
        WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '13' AND t.aeasistencia_excusa > 0 ) THEN 'E'
      END) AS " 13",
    MAX(CASE 
      WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '14' AND t.aeasistencias_llego IS NOT NULL ) THEN t.ctiponoveabre
        WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '14' AND t.aeasistencia_excusa > 0 ) THEN 'E'
      END) AS " 14",	
    MAX(CASE 
      WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '15' AND t.aeasistencias_llego IS NOT NULL ) THEN t.ctiponoveabre
        WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '15' AND t.aeasistencia_excusa > 0 ) THEN 'E'
      END) AS " 15",
    MAX(CASE 
      WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '16' AND t.aeasistencias_llego IS NOT NULL ) THEN t.ctiponoveabre
        WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '16' AND t.aeasistencia_excusa > 0 ) THEN 'E'
      END) AS " 16",	
    MAX(CASE 
      WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '17' AND t.aeasistencias_llego IS NOT NULL ) THEN t.ctiponoveabre
        WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '17' AND t.aeasistencia_excusa > 0 ) THEN 'E'
      END) AS " 17",	
    MAX(CASE  
      WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '18' AND t.aeasistencias_llego IS NOT NULL ) THEN t.ctiponoveabre
        WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '18' AND t.aeasistencia_excusa > 0 ) THEN 'E'
      END) AS " 18",	
    MAX(CASE 
      WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '19' AND t.aeasistencias_llego IS NOT NULL ) THEN t.ctiponoveabre
        WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '19' AND t.aeasistencia_excusa > 0 ) THEN 'E'
      END) AS " 19",	
    MAX(CASE 
      WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '20' AND t.aeasistencias_llego IS NOT NULL ) THEN t.ctiponoveabre
        WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '20' AND t.aeasistencia_excusa > 0 ) THEN 'E'
      END) AS " 20",
    MAX(CASE 
      WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '21' AND t.aeasistencias_llego IS NOT NULL ) THEN t.ctiponoveabre
        WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '21' AND t.aeasistencia_excusa > 0 ) THEN 'E'
      END) AS " 21",	
    MAX(CASE 
      WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '22' AND t.aeasistencias_llego IS NOT NULL ) THEN t.ctiponoveabre
        WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '22' AND t.aeasistencia_excusa > 0 ) THEN 'E'
      END) AS " 22",	
    MAX(CASE 
      WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '23' AND t.aeasistencias_llego IS NOT NULL ) THEN t.ctiponoveabre
        WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '23' AND t.aeasistencia_excusa > 0 ) THEN 'E'
      END) AS " 23",
    MAX(CASE 
      WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '24' AND t.aeasistencias_llego IS NOT NULL ) THEN t.ctiponoveabre
        WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '24' AND t.aeasistencia_excusa > 0 ) THEN 'E'
      END) AS " 24",	
    MAX(CASE 
      WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '25' AND t.aeasistencias_llego IS NOT NULL ) THEN t.ctiponoveabre
        WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '25' AND t.aeasistencia_excusa > 0 ) THEN 'E'
      END) AS " 25",
    MAX(CASE 
      WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '26' AND t.aeasistencias_llego IS NOT NULL ) THEN t.ctiponoveabre
        WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '26' AND t.aeasistencia_excusa > 0 ) THEN 'E'
      END) AS " 26",	
    MAX(CASE 
      WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '27' AND t.aeasistencias_llego IS NOT NULL ) THEN t.ctiponoveabre
        WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '27' AND t.aeasistencia_excusa > 0 ) THEN 'E'
      END) AS " 27",	
    MAX(CASE 
      WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '28' AND t.aeasistencias_llego IS NOT NULL ) THEN t.ctiponoveabre
        WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '28' AND t.aeasistencia_excusa > 0 ) THEN 'E'
      END) AS " 28",	
    MAX(CASE 
      WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '29' AND t.aeasistencias_llego IS NOT NULL ) THEN t.ctiponoveabre
        WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '29' AND t.aeasistencia_excusa > 0 ) THEN 'E'
      END) AS " 29",	
    MAX(CASE 
      WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '30' AND t.aeasistencias_llego IS NOT NULL ) THEN t.ctiponoveabre
        WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '30' AND t.aeasistencia_excusa > 0 ) THEN 'E'
      END) AS " 30",	
    MAX(CASE 
      WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '31' AND t.aeasistencias_llego IS NOT NULL ) THEN t.ctiponoveabre
        WHEN(TO_CHAR(t.aeasistencias_fecha, 'DD') = '31' AND t.aeasistencia_excusa > 0 ) THEN 'E'
      END) AS " 31"
    FROM (
        -- ASISTENCIAS Y EXCUSAS DE CADA ESTUDIANTE EN UN PERIODO DE TIEMPO
        SELECT 
          a.aeasistencias_fecha, e.aeestudiantes_codigo,         
          a.aeestudiantes_grupo, a.aeasignaciones_asignatura,         
          initcap(lower(e.aeestudiantes_apellidos)) || ' ' || initcap(lower(e.aeestudiantes_nombres)) AS aeestudiantes_nombres,
          a.aeasistencias_llego, tn.ctiponoveabre,        
          COUNT( CASE WHEN 
            (x.aeestudiantes_id = a.aeestudiantes_id
            AND a.aeasistencias_fecha BETWEEN aeexcusas_desde AND aeexcusas_hasta ) 
            THEN 
              aeexcusas_id
            END
          ) AS aeasistencia_excusa
        FROM 
          data.aeestudiantes e LEFT JOIN data.aeasistencias a
            ON (a.aeestudiantes_id = e.aeestudiantes_id
              AND e.aeestudiantes_grupo = a.aeestudiantes_grupo)
          LEFT JOIN public.tabtiponove tn
            ON (a.aeasistencias_llego=tn.ctiponoveid)
          LEFT JOIN data.aeexcusas x
            ON (e.aeinstitucion_id = x.aeinst_id
              AND e.aeano_id = x.aeanol_id )      
        WHERE 
          TO_CHAR(a.aeasistencias_fecha, 'MM') = $4
          AND e.aeinstitucion_id = $2
          AND e.aeano_id = $1
          AND e.aeestudiantes_grupo LIKE $3
          AND a.aeasignaciones_asignatura LIKE $5
          AND a.aeasistencias_docente = $6
        GROUP BY 
          a.aeasistencias_fecha, e.aeestudiantes_codigo, a.aeestudiantes_grupo,
          a.aeasignaciones_asignatura, a.aeasistencias_llego, tn.ctiponoveabre,
          initcap(lower(e.aeestudiantes_apellidos)) || ' ' || initcap(lower(e.aeestudiantes_nombres))
      ) t
    GROUP BY 
      t.aeestudiantes_codigo, t.aeestudiantes_grupo, t.aeasignaciones_asignatura, t.aeestudiantes_nombres
    ORDER BY t.aeestudiantes_nombres;
  -- ) u;
  `,
  
  rowsviewGroups:`
    -- GRUPOS DE UNA INSTITUCION EN UN ANO LECTIVO
    SELECT g.aeestudiantes_grupo, COALESCE(NULLIF(regexp_replace(g.aeestudiantes_grupo, '[^0-9]*','','g'), '')::NUMERIC, 0) as orden
    FROM data.aegrupos g
    WHERE g.aeinstitucion_id=$2
    AND g.aeano_id=$1
    ORDER BY orden, aeestudiantes_grupo;`,
    
  listaSedes: `
    -- LISTA DE INSTITUCIONES EDUCATIVAS 
    SELECT i.aeinst_id, u.aeusu_id, i.aeinst_nombre, i.aeinst_nit, i.aeinst_mail, 
    i.aeinst_direccion, i.aeinst_telefono, i.aeinst_escudo, i.coordx, i.coordy, i.aeinst_facebook,    
    c.aeinstconf_anolectivo AS idanolectivo, a.aeano_descripcion AS anolectivo, i.codigo_cg1
    FROM data.aeinstituciones i, data.aeinstituciones_conf c, engine.aeusu u, data.aeano a
    WHERE i.aeinst_mail LIKE $1
    AND u.aeusu_id=i.aeusu_id
    AND c.aeinst_id=i.aeinst_id
    AND c.aeinstconf_anolectivo=a.aeano_id
    ORDER BY aeinst_nombre;`,

  rowsviewAsigments:`
    --LISTADO DE ASIGNATURAS DE UN GRUPO CON DOCENTE QUE LA DICTA
    SELECT  
      a.aeasignaciones_asignatura, --aeasignaciones_dia, aeasignaciones_hora, aeasignaciones_horafin,
      a.aedocentes_id, d.aedocentes_nombres || ' ' || d.aedocentes_apellidos as aedocente, a.aeasignaciones_enlace
    FROM data.aeasignaciones a, data.aedocentes d
    WHERE a.aeanol_id=$1
    AND a.aeinst_id=$2
    AND lower(a.aeasignaciones_grupo) LIKE lower($3)
    AND a.aeasignaciones_estado=1
    AND a.aedocentes_id = d.aedocentes_id
    GROUP BY a.aedocentes_id, a.aeasignaciones_asignatura, -- aeasignaciones_dia, aeasignaciones_hora, aeasignaciones_horafin, 
    d.aedocentes_nombres || ' ' || d.aedocentes_apellidos, a.aeasignaciones_enlace
    ORDER BY a.aeasignaciones_asignatura,aedocente`,

  viewAsigments:`
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
      ) u`,
  insertAskTeacher:`
    --INSERTAR CONSULTA HECHA POR UN ACUDIENTE A UN DOCENTE DE SU ELECCION
    INSERT INTO data.aeconsultasdocentes(
      aeconsultasdocentes_id, aeconsultasdocentes_fecha, aeestudiantes_id, aeasignaciones_asignatura, 
      aedocente_id, aeinst_id, aeanol_id, aeconsultasdocentes_descripcion, 
      aeconsultasdocentes_visibilidad, aeconsultasdocentes_estado)
    VALUES ((SELECT COALESCE((MAX(aeconsultasdocentes_id)+1), 1)  FROM data.aeconsultasdocentes), $1, $2, $3, $4, $5, $6, $7, false, 1)RETURNING aeconsultasdocentes_id;`,
    
  listAsistenciasEstudiante:`
      --LISTA DE INASISTENCIAS PARA UN ESTUDIANTE ESPECIFICO, LOS ULTIMOS MESES
      SELECT row_to_json(u) as datos
      FROM (
          SELECT a.aeasistencia_id, a.aeasistencias_fecha,
          initcap(lower(aeestudiantes_apellidos)) || ' ' || initcap(lower(aeestudiantes_nombres)) AS aeestudiantes_nombre,
          a.aeestudiantes_grupo, a.aeasignaciones_asignatura,
          initcap(lower(aedocentes_nombres)) || ' ' || initcap(lower(aedocentes_apellidos)) AS aedocentes_nombre,
          CASE WHEN ( date_part('day',age(current_date, a.aeasistencias_fecha)) <= $4 ) THEN true ELSE false END AS aeasistencia_vigencia
          FROM data.aeasistencias a, data.aeestudiantes e, data.aedocentes d
          WHERE a.aeestudiantes_id = $1
          AND a.aeasistencias_llego = 0
          AND a.aeasistencias_estado = 1
          AND TO_CHAR(a.aeasistencias_fecha, 'YYYY-MM-DD') BETWEEN $3 AND $2
          AND e.aeestudiantes_id=a.aeestudiantes_id
          AND a.aeasistencias_docente=d.aedocentes_id
          ORDER BY a.aeasistencias_fecharegistro DESC
      ) u;`,
    

    
  excusasInsert:`
    INSERT INTO data.aeexcusas(
      aeexcusas_id, aeinst_id, aeanol_id, aeestudiantes_id, aeexcusas_fecha, 
      aeexcusas_desde, aeexcusas_hasta, aetipoexcusa_id, aeexcusas_asignatura,
      aeexcusas_mensaje, aeexcusas_archivoadjunto, aeexcusas_estado)
    VALUES ((SELECT COALESCE((MAX(aeexcusas_id)+1), 1) FROM data.aeexcusas), 
      $1, $2, $3, $4, $5, $6, $7, $10, $8, $9, 1)RETURNING aeexcusas_id;`,
    
  excusasInsertComments:`
    -- INSERTAR COMENTARIO EN LA EXCUSA
    -- aeexcusasrespuestas_tipo: 1: Visto, 2: comentario
    INSERT INTO data.aeexcusas_respuestas(
      aeexcusasrespuestas_id, aeexcusas_id, aeusu_id, aeexcusasrespuestas_tipo, aeexcusasrespuestas_descripcion)
    VALUES ((SELECT COALESCE((MAX(aeexcusasrespuestas_id)+1), 1)  FROM data.aeexcusas_respuestas), 
        $1, $2, $3, $4) RETURNING aeexcusasrespuestas_id;`,
  
  excusasList:`
      SELECT 
        e.aeexcusas_id, e.aeinst_id, e.aeanol_id, e.aeestudiantes_id, (s.aeestudiantes_apellidos || ' ' || s.aeestudiantes_nombres) as aeestudiantes_nombre,
        e.aeexcusas_fecha, e.aeexcusas_desde, e.aeexcusas_hasta, t.aetipoexcusa_nombre, 
        e.aeexcusas_asignatura, e.aeexcusas_mensaje, e.aeexcusas_archivoadjunto, e.aeexcusas_estado,
        (
          SELECT COUNT(r.aeexcusasrespuestas_id)
          FROM data.aeexcusas_respuestas R
          WHERE r.aeexcusas_id = e.aeexcusas_id      
        ) AS interacciones
      FROM data.aeestudiantes s, data.aeexcusas e, data.aetipoexcusas t
      WHERE e.aeanol_id=$1
      AND e.aeinst_id=$2
      AND s.aeestudiantes_grupo LIKE $3
      AND t.aetipoexcusa_id<>0
      AND e.aetipoexcusa_id=t.aetipoexcusa_id
      AND e.aeestudiantes_id=s.aeestudiantes_id
      ORDER BY e.aeexcusas_fecha;`,

  excusasDelete:`
  -- DELETE EXCUSA ENVIADA POR UN ACUDIENTE
  UPDATE data.aeexcusas
  SET aeexcusas_estado=0
  WHERE aeexcusas_id=$1
  AND (aeestudiantes_id=$2 OR $3=1);
  `,
}