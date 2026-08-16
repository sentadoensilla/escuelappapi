module.exports = {
    areasList:`
        -- LISTADO DE AREAS EN SAE
        SELECT 
            careaid AS areaid, careadesc AS areadescripcion, 
            careacome AS areacomentario, careaesta AS areaestado
        FROM public.tabarea
        ORDER BY careadesc;`,
    areasInsert:"",
    areasUpdate:"",
    areasDelete:"",
}