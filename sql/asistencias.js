module.exports = {
    listSubjects:`
    -- LISTADO DE ASIGNATURAS PREVIAS
    SELECT * FROM 
    DATA.aeasistencias a
    WHERE a.aeasistencias_docente = $2
    AND aeestudiantes_grupo = $3
    AND aeasignaciones_asignatura = $4
    AND aeasistencias_fecha = $1;`,

    listTipoNovedad:`
    SELECT ctiponoveid as idtiponovedad, ctiponovedesc as tiponovedaddescripcion,
    ctiponoveabre as tiponovedadabreviatura
    FROM public.tabtiponove
    WHERE ctiponoveid NOT IN (2,3,4,5) AND ctiponoveesta=8
    ORDER BY ctiponovedesc;   
    `,

    listStudents:`
    -- LISTA DE ESTUDIANTES EN UN GRUPO, DE UNA INSTITUCION EN UN ANOLECTIVO
    SELECT 
        aeestudiantes_id as idestudiante,aeusu_id as idusuario, 
        (aeestudiantes_apellidos || ' ' || aeestudiantes_nombres) as nombreestudiante, 
        aeestudiantes_grupo as grupoestudiante
    FROM 
        data.aeestudiantes
    WHERE 
        aeestudiantes_grupo=$3
        AND aeinstitucion_id=$1
        AND aeano_id=$2
        AND aeestudiantes_estado=1
    ORDER BY aeestudiantes_grupo,nombreestudiante;  
    `,

    listAssigments:`
    -- LISTADO UNICO DE ASIGNATURAS DE UN DOCENTE
    SELECT 
        e.aeasignaciones_asignatura AS asignatura
    FROM 
        data.aeasignaciones e LEFT JOIN data.aeinstituciones a
            ON (e.aeinst_id=a.aeinst_id)
    WHERE 
        e.aeinst_id = $1 -- ID INSTITUCION
        AND e.aeanol_id=$2 -- ID ANOLECTIVO
        AND e.aedocentes_id=$3 -- ID DOCENTE
    GROUP BY e.aeasignaciones_asignatura
    ORDER BY e.aeasignaciones_asignatura;`,

    listExcusasDate:`
    -- EXCUSAS EN UN GRUPO Y UNA FECHA DETERMINADA
    -- $1: anolectivo $2: idinstitucion $3: group $4 date
    SELECT 
        e.aeexcusas_id AS idexcusa, s.aeestudiantes_grupo AS grupo, e.aeestudiantes_id AS idestudiante, 
        (s.aeestudiantes_apellidos || ' ' || s.aeestudiantes_nombres) as nombreestudiante,
        e.aeexcusas_fecha AS fecharegistro, e.aeexcusas_desde AS excusadesde, e.aeexcusas_hasta AS excusahasta, 
        t.aetipoexcusa_nombre AS tipoexcusa, e.aeexcusas_mensaje AS excusamensaje, 
        e.aeexcusas_archivoadjunto AS excusaadjunto, e.aeexcusas_estado AS excusaestado
    FROM 
        data.aeexcusas e LEFT JOIN data.aeestudiantes s
            ON (e.aeestudiantes_id=s.aeestudiantes_id)
        INNER JOIN data.aetipoexcusas t
            ON (e.aetipoexcusa_id=t.aetipoexcusa_id)
    WHERE 
        s.aeestudiantes_grupo LIKE $3 AND 
        e.aeanol_id=$1 AND 
        e.aeinst_id=$2 AND 
        t.aetipoexcusa_id<>0 AND 
        $4::date BETWEEN e.aeexcusas_desde AND e.aeexcusas_hasta 
        -- TO_CHAR($4::date, 'MM') = TO_CHAR(e.aeexcusas_desde, 'MM')
    ORDER BY nombreestudiante;`,

    deleteAttendanceDate:`
        DELETE FROM data.aeasistencias
        WHERE aeasistencias_docente = $3
        AND aeestudiantes_grupo = $2
        AND aeasignaciones_asignatura = $4
        AND aeasistencias_fecha = $1;   
    `,
}