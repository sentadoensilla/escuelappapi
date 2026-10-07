export const menuInsert = `
    -- REGISTRAR UN MENU EN EL SISTEMA
        INSERT INTO engine.aemenu
            (aemenu_id, 
                aemenu_nombre, aemenu_descripcion, aemenu_icono, 
                aemenu_estado, aemenu_orden)
        VALUES((SELECT COALESCE((MAX(aemenu_id)+1), 1)  FROM engine.aemenu), 
            $1, $2, $3, $4, $5)
        RETURNING *;
    `;
export const menuUpdate = `
    -- MODIFICAR UN MENU EN EL SISTEMA
        UPDATE engine.aemenu
        SET aemenu_nombre=$2, aemenu_descripcion=$3, aemenu_icono=$4, 
        aemenu_estado=$5, aemenu_orden=$5
        WHERE aemenu_id=$1
        RETURNING *;
    `;
export const menuDelete = `
    -- ELIMINAR UN MENU DEL SISTEMA (LE CAMBIAMOS EL ESTADO)
        UPDATE engine.aemenu
        SET aemenu_estado=0
        WHERE aemenu_id=$1
        RETURNING *;
    `;
export const menuSelect_sae = `
    SELECT anolperiid as idperiodo, cinstid, canolid, cperiid, anolperidesc as descripcion, anolperifechinic AS fechainicio, 
        anolperifechfina AS fechafin, anolperivalo, anolperifechregi, anolperiesta
    FROM anolperi
    LIMIT 100;
    `;
export const menuSelect = `
    -- MOSTRAR TODOS LOS MENUES DEL SISTEMA
        SELECT aemenu_id as idregistro, aemenu_nombre as nombre, aemenu_descripcion as descripcion, 
        aemenu_icono AS icono, aemenu_estado AS idestado, e.aeestados_descripcion as estado, 
        aemenu_orden as orden
        FROM engine.aemenu m LEFT JOIN data.aeestados e
                ON (m.aemenu_estado=e.aeestados_id)
        ORDER BY aemenu_nombre;    
    `;
export default {
  menuInsert: menuInsert,
  menuUpdate: menuUpdate,
  menuDelete: menuDelete,
  menuSelect_sae: menuSelect_sae,
  menuSelect: menuSelect
};
