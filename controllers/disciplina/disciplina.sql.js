export const disciplinaListar = `
        SELECT cdisciid AS idregistro, cdiscnomb AS nombre, cdiscabre AS abreviatura, cdiscesta AS idestado
        FROM public.tabdisci
        ORDER BY cdiscnomb;`;
export const disciplinaRegistrar = `
        INSERT INTO public.tabdisci (cdisciid, cdiscnomb, cdiscabre, cdiscesta)
        VALUES ((SELECT COALESCE(MAX(cdisciid)+1, 1) FROM public.tabdisci), $1, $2, $3)
        RETURNING cdisciid AS idregistro;`;
export const disciplinaActualizar = `
        UPDATE public.tabdisci SET cdiscnomb=$2, cdiscabre=$3, cdiscesta=$4
        WHERE cdisciid=$1 RETURNING cdisciid AS idregistro;`;
export const disciplinaBorrar = `
        UPDATE public.tabdisci SET cdiscesta=$2 WHERE cdisciid=$1 RETURNING cdisciid AS idregistro;`;
export const discinstListar = `
        SELECT i.cdiscinstid AS idregistro, i.cdisciid AS iddisciplina, i.cinstid AS idinstitucion,
               i.cestainstdisc AS idestado, d.cdiscnomb AS disciplina, t.cinstnomb AS institucion
        FROM public.tabdiscinst i
        LEFT JOIN public.tabdisci d ON (d.cdisciid = i.cdisciid)
        LEFT JOIN public.tabinst t ON (t.cinstid = i.cinstid)
        WHERE ($1::integer IS NULL OR i.cinstid = $1)
        ORDER BY d.cdiscnomb;`;
export const discinstRegistrar = `
        INSERT INTO public.tabdiscinst (cdiscinstid, cdisciid, cinstid, cestainstdisc)
        VALUES ((SELECT COALESCE(MAX(cdiscinstid)+1, 1) FROM public.tabdiscinst), $1, $2, $3)
        RETURNING cdiscinstid AS idregistro;`;
export const discinstActualizar = `
        UPDATE public.tabdiscinst SET cdisciid=$2, cinstid=$3, cestainstdisc=$4
        WHERE cdiscinstid=$1 RETURNING cdiscinstid AS idregistro;`;
export const discinstBorrar = `
        UPDATE public.tabdiscinst SET cestainstdisc=$2 WHERE cdiscinstid=$1 RETURNING cdiscinstid AS idregistro;`;
export const discnotaListar = `
        SELECT n.cdiscnotaid AS idregistro, n.cdiscinstid AS iddiscinst, n.cmatrid AS idmatricula,
               n.cperiid AS idperiodo, n.cdiscnotavalo AS valor, n.cdiscnotafech AS fecha,
               n.cdiscnotafechregi AS fecharegistro, n.cdiscnotaobse AS observacion,
               n.cestadiscnota AS idestado,
               d.cdiscnomb AS disciplina, e.cestuapel || ' ' || e.cestunomb AS estudiante
        FROM public.tabdiscnota n
        LEFT JOIN public.tabdiscinst i ON (i.cdiscinstid = n.cdiscinstid)
        LEFT JOIN public.tabdisci d ON (d.cdisciid = i.cdisciid)
        LEFT JOIN public.tabmatr m ON (m.cmatrid = n.cmatrid)
        LEFT JOIN public.tabestu e ON (e.cestuid = m.cestuid)
        WHERE ($1::integer IS NULL OR n.cmatrid = $1)
          AND ($2::integer IS NULL OR n.cdiscinstid = $2)
        ORDER BY n.cdiscnotafech DESC;`;
export const discnotaRegistrar = `
        INSERT INTO public.tabdiscnota
            (cdiscnotaid, cdiscinstid, cmatrid, cperiid, cdiscnotavalo, cdiscnotafech,
             cdiscnotafechregi, cdiscnotaobse, cestadiscnota)
        VALUES ((SELECT COALESCE(MAX(cdiscnotaid)+1, 1) FROM public.tabdiscnota),
             $1, $2, $3, $4, $5, CURRENT_DATE, $6, $7)
        RETURNING cdiscnotaid AS idregistro;`;
export const discnotaActualizar = `
        UPDATE public.tabdiscnota
        SET cdiscinstid=$2, cmatrid=$3, cperiid=$4, cdiscnotavalo=$5, cdiscnotafech=$6,
            cdiscnotaobse=$7, cestadiscnota=$8
        WHERE cdiscnotaid=$1
        RETURNING cdiscnotaid AS idregistro;`;
export const discnotaBorrar = `
        UPDATE public.tabdiscnota SET cestadiscnota=$2 WHERE cdiscnotaid=$1 RETURNING cdiscnotaid AS idregistro;`;
export default {
  disciplinaListar: disciplinaListar,
  disciplinaRegistrar: disciplinaRegistrar,
  disciplinaActualizar: disciplinaActualizar,
  disciplinaBorrar: disciplinaBorrar,
  discinstListar: discinstListar,
  discinstRegistrar: discinstRegistrar,
  discinstActualizar: discinstActualizar,
  discinstBorrar: discinstBorrar,
  discnotaListar: discnotaListar,
  discnotaRegistrar: discnotaRegistrar,
  discnotaActualizar: discnotaActualizar,
  discnotaBorrar: discnotaBorrar
};
/**
 * disciplina.sql.js
 * Sentencias SQL del módulo de disciplina SAE (public.tabdisci, public.tabdiscinst,
 * public.tabdiscnota). Corresponden a control.calificardisciplina.php del SAE.
 */
