module.exports={
    citacionesListar:`
        -- LISTADO DE CITACIONES
        SELECT 
            c.aecitacion_id AS idregistro, c.aecitacion_fecharegistro AS fecharegistro,
            ARRAY_AGG(e.aeestudiantes_apellidos || ' ' || e.aeestudiantes_nombres) AS estudiante, e.aeestudiantes_grupo AS grupo,
            (d.aedocentes_nombres || ' ' || d.aedocentes_apellidos) AS docente, m.aemotivo_nombre AS motivocitacion, s.aeestados_descripcion AS estado, 
            aecitacion_estado as idestado, TO_CHAR(c.aecitacion_fecha, 'YYYY-MM-DD') AS fechacitacion, c.aecitacion_lugar AS lugar, c.aecitacion_descripcion AS descripcion,
            c.aecitacion_adjunto AS adjunto
        FROM 
            data.aecitaciones c LEFT JOIN data.aeestudiantes e
                ON (e.aeestudiantes_id = ANY(c.aeestudiantes_id))
            LEFT JOIN data.aedocentes d
                ON (c.aedocentes_id=d.aedocentes_id)
            LEFT JOIN data.aemotivo m
                ON (c.aemotivo_id=m.aemotivo_id)
            LEFT JOIN data.aeestados s
                ON (c.aecitacion_estado=s.aeestados_id)
        WHERE 
            c.aeanol_id = $1 AND 
            c.aeinst_id = $2 AND
            c.aecitacion_fecha >= $3 AND
            c.aecitacion_estado<>0
        GROUP BY 
            c.aecitacion_id, c.aecitacion_fecharegistro, e.aeestudiantes_grupo,
            (d.aedocentes_nombres || ' ' || d.aedocentes_apellidos), m.aemotivo_nombre, s.aeestados_descripcion, 
            aecitacion_estado, TO_CHAR(c.aecitacion_fecha, 'YYYY-MM-DD'), c.aecitacion_lugar, c.aecitacion_descripcion,
            c.aecitacion_adjunto
        ORDER BY fechacitacion;
        `,
    citacionesListarOne:`
        -- UNA CITACION ESPECIFICA
        SELECT 
            c.aecitacion_id AS idregistro, c.aecitacion_fecharegistro AS fecharegistro,
            ARRAY_AGG(e.aeestudiantes_apellidos || ' ' || e.aeestudiantes_nombres) AS estudiante, e.aeestudiantes_grupo AS grupo,
            (d.aedocentes_nombres || ' ' || d.aedocentes_apellidos) AS docente, m.aemotivo_nombre AS motivocitacion, s.aeestados_descripcion AS estado, 
            aecitacion_estado as idestado, TO_CHAR(c.aecitacion_fecha, 'YYYY-MM-DD') AS fechacitacion, c.aecitacion_lugar AS lugar, c.aecitacion_descripcion AS descripcion,
            c.aecitacion_adjunto AS adjunto,
            i.aeinst_id AS idinstitucion, i.aeinst_nombre AS nombreinstitucion, i.calendario, 
            i.aeinst_direccion AS direccion, i.aeinst_telefono AS telefono, 
            i.aeinst_mail AS mail, i.aeinst_escudo AS escudo, i.aeinst_facebook AS facebook            
        FROM 
            data.aecitaciones c LEFT JOIN data.aeestudiantes e
                ON (e.aeestudiantes_id = ANY(c.aeestudiantes_id))
            LEFT JOIN data.aedocentes d
                ON (c.aedocentes_id=d.aedocentes_id)
            LEFT JOIN DATA.aeinstituciones i
                ON (c.aeinst_id=i.aeinst_id)
            LEFT JOIN data.aemotivo m
                ON (c.aemotivo_id=m.aemotivo_id)
            LEFT JOIN data.aeestados s
                ON (c.aecitacion_estado=s.aeestados_id)
        WHERE 
            c.aecitacion_id = $1 AND
            c.aecitacion_estado<>0
        GROUP BY 
            c.aecitacion_id, c.aecitacion_fecharegistro, e.aeestudiantes_grupo,
            (d.aedocentes_nombres || ' ' || d.aedocentes_apellidos), m.aemotivo_nombre, s.aeestados_descripcion, 
            aecitacion_estado, TO_CHAR(c.aecitacion_fecha, 'YYYY-MM-DD'), c.aecitacion_lugar, c.aecitacion_descripcion,
            c.aecitacion_adjunto,
            i.aeinst_id, i.aeinst_nombre, i.calendario, 
            i.aeinst_direccion, i.aeinst_telefono, 
            i.aeinst_mail, i.aeinst_escudo, i.aeinst_facebook;
        `,

    citacionesUpdate:`
        -- ACTUALIZAR UNA CITACION POR SU IDREGISTRO
        UPDATE 
            data.aecitaciones
        SET 
            aecitacion_fecharegistro=CURRENT_TIMESTAMP, 
            aeanol_id=$2, aeinst_id=$3, aeestudiantes_id=$4, aedocentes_id=$5,  
            aemotivo_id=$6, aecitacion_estado=1, aecitacion_fecha=$7, aecitacion_lugar=$8, aecitacion_descripcion=$9,
            aecitacion_adjunto=$10
        WHERE 
            aecitacion_id=$1
        RETURNING aecitacion_id AS idregistro;    
        `,
    citacionesDelete:`
        -- "ELIMINAR" UNA CITACION POR SU IDREGISTRO
        UPDATE 
            data.aecitaciones
        SET 
            aecitacion_estado=0
        WHERE 
            aecitacion_id=$1 AND 
            aeanol_id=$2 AND 
            aeinst_id=$3
        RETURNING aecitacion_id AS idregistro, aecitacion_fecharegistro AS fecharegistro,
        aeestudiantes_id AS estudiante, aedocentes_id AS docente, aemotivo_id AS motivocitacion, aecitacion_estado AS estado, 
        aecitacion_fecha AS fechacitacion, aecitacion_lugar AS lugar, aecitacion_descripcion AS descripcion, aecitacion_adjunto AS adjunto;   
        `,
    citacionesRegistrar:`
        -- REGISTRAR UNA CITACION           
        INSERT INTO data.aecitaciones
            (aecitacion_id, aecitacion_fecharegistro, 
            aeanol_id, aeinst_id, aeestudiantes_id, aedocentes_id,  
            aemotivo_id, aecitacion_estado, aecitacion_fecha, aecitacion_lugar, aecitacion_descripcion, aecitacion_adjunto)
        VALUES((SELECT COALESCE(MAX(aecitacion_id)+1, 1) FROM data.aecitaciones), CURRENT_TIMESTAMP, 
            $1, $2, $3, $4, 
            $5, 1, $6, $7, $8, $9)
        RETURNING aecitacion_id AS idregistro;
        `,
}