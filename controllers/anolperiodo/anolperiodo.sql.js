export const anoListar = `
        SELECT canolid AS idregistro, canoldesc AS descripcion, canolinic AS fechainicio,
               canolfina AS fechafin, canolesta AS idestado
        FROM public.tabanol
        ORDER BY canolid DESC;`;
export const anoRegistrar = `
        INSERT INTO public.tabanol (canolid, canoldesc, canolinic, canolfina, canolesta)
        VALUES ((SELECT COALESCE(MAX(canolid)+1, 1) FROM public.tabanol), $1, $2, $3, $4)
        RETURNING canolid AS idregistro;`;
export const anoActualizar = `
        UPDATE public.tabanol
        SET canoldesc=$2, canolinic=$3, canolfina=$4, canolesta=$5
        WHERE canolid=$1
        RETURNING canolid AS idregistro;`;
export const anoBorrar = `
        UPDATE public.tabanol SET canolesta=$2 WHERE canolid=$1 RETURNING canolid AS idregistro;`;
export const periodoListar = `
        SELECT cperiid AS idregistro, cperidesc AS descripcion, cperinomb AS nombre,
               cperiesta AS idestado
        FROM public.tabperi
        ORDER BY cperiid;`;
export const periodoRegistrar = `
        INSERT INTO public.tabperi (cperiid, cperidesc, cperinomb, cperiesta)
        VALUES ((SELECT COALESCE(MAX(cperiid)+1, 1) FROM public.tabperi), $1, $2, $3)
        RETURNING cperiid AS idregistro;`;
export const periodoActualizar = `
        UPDATE public.tabperi SET cperidesc=$2, cperinomb=$3, cperiesta=$4
        WHERE cperiid=$1 RETURNING cperiid AS idregistro;`;
export const periodoBorrar = `
        UPDATE public.tabperi SET cperiesta=$2 WHERE cperiid=$1 RETURNING cperiid AS idregistro;`;
export const anolperiListar = `
        SELECT a.anolperiid AS idregistro, a.cinstid, a.canolid, a.cperiid,
               a.anolperidesc AS descripcion, a.anolperifechinic AS fechainicio,
               a.anolperifechfina AS fechafin, a.anolperivalo AS valor,
               a.anolperifechregi AS fecharegistro, a.anolperiesta AS idestado,
               an.canoldesc AS ano, p.cperinomb AS periodo
        FROM public.anolperi a
        LEFT JOIN public.tabanol an ON (an.canolid = a.canolid)
        LEFT JOIN public.tabperi p ON (p.cperiid = a.cperiid)
        WHERE ($1::integer IS NULL OR a.cinstid = $1)
          AND ($2::integer IS NULL OR a.canolid = $2)
        ORDER BY a.anolperifechinic;`;
export const anolperiListarPorInstitucion = `
        SELECT a.anolperiid AS idregistro, a.cinstid, a.canolid, a.cperiid,
               a.anolperidesc AS descripcion, a.anolperifechinic AS fechainicio,
               a.anolperifechfina AS fechafin, a.anolperivalo AS valor,
               a.anolperiesta AS idestado, p.cperinomb AS periodo
        FROM public.anolperi a
        LEFT JOIN public.tabperi p ON (p.cperiid = a.cperiid)
        WHERE a.cinstid = $1 AND a.canolid = $2
        ORDER BY a.anolperifechinic;`;
export const anolperiRegistrar = `
        INSERT INTO public.anolperi
            (anolperiid, cinstid, canolid, cperiid, anolperidesc, anolperifechinic,
             anolperifechfina, anolperivalo, anolperifechregi, anolperiesta)
        VALUES ((SELECT COALESCE(MAX(anolperiid)+1, 1) FROM public.anolperi),
             $1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, $8)
        RETURNING anolperiid AS idregistro;`;
export const anolperiActualizar = `
        UPDATE public.anolperi
        SET cperiid=$2, anolperidesc=$3, anolperifechinic=$4, anolperifechfina=$5,
            anolperivalo=$6, anolperiesta=$7
        WHERE anolperiid=$1
        RETURNING anolperiid AS idregistro;`;
export const anolperiBorrar = `
        UPDATE public.anolperi SET anolperiesta=$2 WHERE anolperiid=$1 RETURNING anolperiid AS idregistro;`;
export const perivalListar = `
        SELECT cperivalid AS idregistro, cperivaldesc AS descripcion, canolperiid,
               cperivalesta AS idestado
        FROM public.tabperival
        WHERE ($1::integer IS NULL OR canolperiid = $1)
        ORDER BY cperivalid;`;
export const perivalRegistrar = `
        INSERT INTO public.tabperival (cperivalid, cperivaldesc, canolperiid, cperivalesta)
        VALUES ((SELECT COALESCE(MAX(cperivalid)+1, 1) FROM public.tabperival), $1, $2, $3)
        RETURNING cperivalid AS idregistro;`;
export const perivalActualizar = `
        UPDATE public.tabperival SET cperivaldesc=$2, canolperiid=$3, cperivalesta=$4
        WHERE cperivalid=$1 RETURNING cperivalid AS idregistro;`;
export const perivalBorrar = `
        UPDATE public.tabperival SET cperivalesta=$2 WHERE cperivalid=$1 RETURNING cperivalid AS idregistro;`;
export default {
  anoListar: anoListar,
  anoRegistrar: anoRegistrar,
  anoActualizar: anoActualizar,
  anoBorrar: anoBorrar,
  periodoListar: periodoListar,
  periodoRegistrar: periodoRegistrar,
  periodoActualizar: periodoActualizar,
  periodoBorrar: periodoBorrar,
  anolperiListar: anolperiListar,
  anolperiListarPorInstitucion: anolperiListarPorInstitucion,
  anolperiRegistrar: anolperiRegistrar,
  anolperiActualizar: anolperiActualizar,
  anolperiBorrar: anolperiBorrar,
  perivalListar: perivalListar,
  perivalRegistrar: perivalRegistrar,
  perivalActualizar: perivalActualizar,
  perivalBorrar: perivalBorrar
};
/**
 * anolperiodo.sql.js
 * Sentencias SQL del módulo de configuración: años lectivos, periodos,
 * relación institución-año-periodo y valores por periodo.
 */
