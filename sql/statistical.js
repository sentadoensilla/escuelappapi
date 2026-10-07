export const grupos = `SELECT g.aeestudiantes_grupo, COALESCE(NULLIF(regexp_replace(g.aeestudiantes_grupo, '[^0-9]*','','g'), '')::NUMERIC, 0) as orden
    FROM data.aegrupos g
    WHERE g.aeano_id=$1
    AND g.aeinstitucion_id=$2
    ORDER BY orden, aeestudiantes_grupo`;
export const teacherIngresos = `
    --ULTIMO INGRESO POR DOCENTE (TODOS LOS DOCENTES)
    SELECT d.aedocentes_id, (u.aeusu_nombre) AS docente,
    MAX(CASE WHEN(d.aeusu_id=l.aeusu_id) THEN TO_CHAR(l.aelogdispositivos_fecha, 'YYYY-MM-DD HH:mm:ss') ELSE NULL END ) as fechaingreso,
    COUNT(CASE WHEN(d.aeusu_id=l.aeusu_id) THEN l.aelogdispositivos_fecha ELSE NULL END ) as interacciones
    FROM (
        SELECT *
        FROM data.aelogdispositivos r
        WHERE r.aelogdispositivos_fecha BETWEEN $1 AND $2
    ) l, engine.aeusu u, engine.aeusuroll x, data.aedocentes d, engine.aeroll r
    WHERE x.aeinst_id = $4
    AND x.aeanol_id = $3
    AND (x.aeroll_id = 2 OR x.aeroll_id = 1)
    AND u.aeusu_id=x.aeusu_id
    AND x.aeusu_id=d.aeusu_id
    AND x.aeacad_referencia=d.aedocentes_id
    AND x.aeroll_id=r.aeroll_id
    GROUP BY d.aedocentes_id, (u.aeusu_nombre)
    ORDER BY docente, FECHAINGRESO DESC;`;
export const studentIngresos = `
    --ULTIMO INGRESO POR ESTUDIANTE Y GRUPO (TODOS LOS ESTUDIANTES)
    SELECT e.aeestudiantes_id, e.aeestudiantes_grupo AS grupo,
    (e.aeestudiantes_nombres || ' ' || e.aeestudiantes_apellidos) AS estudiante,
    MAX(CASE WHEN(e.aeusu_id=l.aeusu_id) THEN TO_CHAR(l.aelogdispositivos_fecha, 'YYYY-MM-DD HH:mm:ss') ELSE NULL END ) as fechaingreso,
    COUNT(CASE WHEN(e.aeusu_id=l.aeusu_id) THEN l.aelogdispositivos_fecha ELSE NULL END ) as interacciones
    FROM (
        SELECT *
        FROM data.aelogdispositivos r
        WHERE r.aelogdispositivos_fecha BETWEEN $1 AND $2 
    ) l, engine.aeusu u, engine.aeusuroll x, DATA.aeestudiantes e, engine.aeroll r
    WHERE x.aeinst_id = $4
    AND x.aeanol_id = $3    
    AND x.aeroll_id = 3 
    AND e.aeestudiantes_grupo LIKE $5
    AND u.aeusu_id=x.aeusu_id
    AND x.aeusu_id=e.aeusu_id
    AND x.aeacad_referencia=e.aeestudiantes_id
    AND x.aeroll_id=r.aeroll_id
    GROUP BY e.aeestudiantes_id, e.aeestudiantes_grupo, (e.aeestudiantes_nombres || ' ' || e.aeestudiantes_apellidos)
    ORDER BY e.aeestudiantes_grupo, estudiante, FECHAINGRESO DESC;`;
export default {
  grupos: grupos,
  teacherIngresos: teacherIngresos,
  studentIngresos: studentIngresos
};
