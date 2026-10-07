export const listadoAnolectivo = `
    --LISTADO DE ANO LECTIVO
    SELECT 
        aeano_id as id, aeano_descripcion as descripcion, 
        UPPER(aeano_calendario) as calendario, 
        TO_CHAR(fecha_inicio, 'YYYY-MM-DD') as inicio, 
        TO_CHAR(fecha_fin, 'YYYY-MM-DD') as fin
    FROM 
        data.aeano;
    `;
export const listadoRoll = `
    -- LISTADO DE ROLES DEL SISTEMA
    SELECT * 
    FROM logic.tabroll
    WHERE crollnomb ILIKE $1
    ORDER BY crollnomb;
    `;
export const insertRoll = `
    -- INSERTAR ROLL
        INSERT INTO logic.tabroll(
            crollid, crollnomb, crolldesc, crollpagientr, cenlaid, crollesta)
        VALUES ((SELECT MAX(crollid)+1 FROM logic.tabroll),$1, $2, $3, $4, 8);    
    `;
export const updateRoll = `
        -- UPDATE ROLL
        UPDATE logic.tabroll
        SET crollnomb=$2, crolldesc=$3, crollpagientr=$4, cenlaid=$5
        WHERE crollid=$1;
    `;
export default {
  listadoAnolectivo: listadoAnolectivo,
  listadoRoll: listadoRoll,
  insertRoll: insertRoll,
  updateRoll: updateRoll
};
