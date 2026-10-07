export const areasList = `
        -- LISTADO DE AREAS EN SAE
        SELECT 
            careaid AS areaid, careadesc AS areadescripcion, 
            careacome AS areacomentario, careaesta AS areaestado
        FROM public.tabarea
        ORDER BY careadesc;`;
export const areasInsert = "";
export const areasUpdate = "";
export const areasDelete = "";
export default {
  areasList: areasList,
  areasInsert: areasInsert,
  areasUpdate: areasUpdate,
  areasDelete: areasDelete
};
