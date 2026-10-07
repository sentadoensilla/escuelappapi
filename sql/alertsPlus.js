export const rowsviewGroupsJSON = `
    -- GRUPOS DE UNA INSTITUCION EN UN ANO LECTIVO
    SELECT array_agg (g.aeestudiantes_grupo) AS grupos
    FROM data.aegrupos g
    WHERE g.aeinstitucion_id=$2
    AND g.aeano_id=$1;`;
export default {
  rowsviewGroupsJSON: rowsviewGroupsJSON
};
