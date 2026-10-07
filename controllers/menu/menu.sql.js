export const menuInsert = `
    -- REGISTRAR UN MENU EN EL SISTEMA (SAE: logic.tabmenu)
        INSERT INTO logic.tabmenu
            (cmenuid,
                cmenunomb, cmenudesc, cmenudest,
                cmenuesta, cmenuorde)
        VALUES((SELECT COALESCE((MAX(cmenuid)+1), 1)  FROM logic.tabmenu),
            $1, $2, $3, $4, $5)
        RETURNING *;
    `;
export const menuUpdate = `
    -- MODIFICAR UN MENU EN EL SISTEMA (SAE: logic.tabmenu)
        UPDATE logic.tabmenu
        SET cmenunomb=$2, cmenudesc=$3, cmenudest=$4,
        cmenuesta=$5, cmenuorde=$6
        WHERE cmenuid=$1
        RETURNING *;
    `;
export const menuDelete = `
    -- ELIMINAR UN MENU DEL SISTEMA (LE CAMBIAMOS EL ESTADO)
        UPDATE logic.tabmenu
        SET cmenuesta=2
        WHERE cmenuid=$1
        RETURNING *;
    `;
export const menuSelect_sae = `
    SELECT anolperiid as idperiodo, cinstid, canolid, cperiid, anolperidesc as descripcion, anolperifechinic AS fechainicio,
        anolperifechfina AS fechafin, anolperivalo, anolperifechregi, anolperiesta
    FROM public.anolperi
    LIMIT 100;
    `;
export const menuSelect = `
    -- MOSTRAR TODOS LOS MENUES DEL SISTEMA (SAE: logic.tabmenu)
        SELECT cmenuid as idregistro, cmenunomb as nombre, cmenudesc as descripcion,
        cmenudest AS destino, cmenuesta AS idestado, COALESCE(cmenuorde, 0) as orden
        FROM logic.tabmenu
        ORDER BY COALESCE(cmenuorde, 0), cmenuid;
    `;
export default {
  menuInsert: menuInsert,
  menuUpdate: menuUpdate,
  menuDelete: menuDelete,
  menuSelect_sae: menuSelect_sae,
  menuSelect: menuSelect
};
