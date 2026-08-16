module.exports = {
    institucionesList:`
    --LISTADO DE INSTITUCIONES 
    SELECT 
        i.aeinst_id AS institucion_id, 
        u.aeusu_id AS usuario_id, 
        aeinst_nombre AS institucion_nombre
    FROM 
        data.aeinstituciones i, data.aeinstituciones_conf c, engine.aeusu u
    WHERE 
        u.aeusu_nick LIKE $1
        AND u.aeusu_estado=1
        AND u.aeusu_id=i.aeusu_id
        AND c.aeinst_id=i.aeinst_id
    ORDER BY 
        calendario, aeinst_nombre;`,

    tipopublicacionesList:`
    -- LISTADO DE TIPO DE PUBLICACIONES
    SELECT 
        aepublicacionestipo_id, aepublicacionestipo_estado, 
        aepublicacionestipo_descripcion, aepublicacionestipo_color
    FROM data.aepublicaciones_tipo
    ORDER BY 
        aepublicacionestipo_descripcion;`,

    listEstados:`
        -- LISTADO DE ESTADOS 
        SELECT 
            aeestados_id AS idestado, INITCAP(aeestados_descripcion) AS descripcion
        FROM 
            data.aeestados 
        ORDER BY 
            aeestados_descripcion;`,

    listGroups:`
        -- LISTADO DE GRUPOS EN UN COLEGIO Y UN ANO LECTIVO
        SELECT g.aeestudiantes_grupo, NULLIF(regexp_replace(g.aeestudiantes_grupo, '[^0-9]*','','g'), '')::numeric as orden
        FROM DATA.aeestudiantes g
        WHERE g.aeinstitucion_id=$1
        AND g.aeano_id=$2
        GROUP BY aeestudiantes_grupo, orden
        ORDER BY orden, aeestudiantes_grupo;
        
        -- SELECT g.aeestudiantes_grupo, NULLIF(regexp_replace(g.aeestudiantes_grupo, '[^0-9]*','','g'), '')::numeric as orden
        -- FROM data.aegrupos g
        -- WHERE g.aeinstitucion_id=$1
        -- AND g.aeano_id=$2
        -- ORDER BY orden, aeestudiantes_grupo
        `,

    listMotivos: `
        -- LISTADO DE MOTIVOS PARA CITACION
        SELECT 
            aemotivo_id AS idregistro, aemotivo_nombre AS descripcion
        FROM 
            data.aemotivo
        WHERE 
            aeestados_id<>0
        ORDER BY 
            aemotivo_nombre;`,
}