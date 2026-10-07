export const cursoListar = `
        SELECT c.ccursid AS idregistro, c.cinstid, c.cgradid, c.cjornid, c.canolid,
               c.ccursnomb AS nombre, c.ccurslimiestu AS limiteestudiantes,
               c.ccursdire AS iddirector, c.ccurscoor AS idcoordinador,
               c.ccursesta AS idestado, c.csedeid AS idsede,
               g.cgraddesc AS grado, j.cjorndesc AS jornada, an.canoldesc AS ano
        FROM public.tabcurs c
        LEFT JOIN public.tabgrad g ON (g.cgradid = c.cgradid)
        LEFT JOIN public.tabjorn j ON (j.cjornid = c.cjornid)
        LEFT JOIN public.tabanol an ON (an.canolid = c.canolid)
        WHERE ($1::integer IS NULL OR c.cinstid = $1)
          AND ($2::integer IS NULL OR c.canolid = $2)
        ORDER BY c.ccursnomb;`;
export const cursoRegistrar = `
        INSERT INTO public.tabcurs
            (ccursid, cinstid, cgradid, cjornid, canolid, ccursnomb, ccurslimiestu,
             ccursdire, ccurscoor, ccursesta, csedeid)
        VALUES ((SELECT COALESCE(MAX(ccursid)+1, 1) FROM public.tabcurs),
             $1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING ccursid AS idregistro;`;
export const cursoActualizar = `
        UPDATE public.tabcurs
        SET cgradid=$2, cjornid=$3, ccursnomb=$4, ccurslimiestu=$5,
            ccursdire=$6, ccurscoor=$7, ccursesta=$8, csedeid=$9
        WHERE ccursid=$1
        RETURNING ccursid AS idregistro;`;
export const cursoBorrar = `
        UPDATE public.tabcurs SET ccursesta=$2 WHERE ccursid=$1 RETURNING ccursid AS idregistro;`;
export const sedesListar = `
        SELECT csedeid AS idregistro, cinstid, csedenomb AS nombre
        FROM public.tabinstsede
        WHERE ($1::integer IS NULL OR cinstid = $1)
        ORDER BY csedenomb;`;
export default {
  cursoListar: cursoListar,
  cursoRegistrar: cursoRegistrar,
  cursoActualizar: cursoActualizar,
  cursoBorrar: cursoBorrar,
  sedesListar: sedesListar
};
/**
 * cursos.sql.js
 * Sentencias SQL del módulo de gestión de cursos (public.tabcurs).
 */
