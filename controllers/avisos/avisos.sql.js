export const avisorollListar = `
        SELECT a.cavisrollid AS idregistro, a.cavisorollusua AS idautor, a.cavisrolltitu AS titulo,
               a.cavisrollcont AS contenido, a.cavisrollimag AS imagen,
               a.cavisrollfechregi AS fecharegistro, a.cavisrollesta AS idestado,
               u.cusuanomb AS autor
        FROM public.tabavisroll a
        LEFT JOIN logic.tabusua u ON (u.cusuaid = a.cavisorollusua)
        WHERE ($1::integer IS NULL OR a.cavisorollusua = $1)
        ORDER BY a.cavisrollfechregi DESC;`;
export const avisorollRegistrar = `
        INSERT INTO public.tabavisroll
            (cavisrollid, cavisorollusua, cavisrolltitu, cavisrollcont, cavisrollimag, cavisrollfechregi, cavisrollesta)
        VALUES ((SELECT COALESCE(MAX(cavisrollid)+1, 1) FROM public.tabavisroll),
             $1, $2, $3, $4, CURRENT_TIMESTAMP, $5)
        RETURNING cavisrollid AS idregistro;`;
export const avisorollActualizar = `
        UPDATE public.tabavisroll
        SET cavisrolltitu=$2, cavisrollcont=$3, cavisrollimag=$4, cavisrollesta=$5
        WHERE cavisrollid=$1
        RETURNING cavisrollid AS idregistro;`;
export const avisorollBorrar = `
        UPDATE public.tabavisroll SET cavisrollesta=$2 WHERE cavisrollid=$1 RETURNING cavisrollid AS idregistro;`;
export const avisousuaListar = `
        SELECT a.cavisusuaid AS idregistro, a.cavisorollusua AS idautor, a.cavisusuadest AS iddestino,
               a.cavisusuatitu AS titulo, a.cavisusuacont AS contenido, a.cavisusuaimag AS imagen,
               a.cavisusuafechinic AS fechainicio, a.cavisusuafechfina AS fechafin,
               a.cavisusuafechregi AS fecharegistro, a.cavisusuaesta AS idestado,
               u.cusuanomb AS autor, d.cusuanomb AS destino
        FROM public.tabavisusua a
        LEFT JOIN logic.tabusua u ON (u.cusuaid = a.cavisorollusua)
        LEFT JOIN logic.tabusua d ON (d.cusuaid = a.cavisusuadest)
        WHERE ($1::integer IS NULL OR a.cavisorollusua = $1)
        ORDER BY a.cavisusuafechregi DESC;`;
export const avisousuaRegistrar = `
        INSERT INTO public.tabavisusua
            (cavisusuaid, cavisorollusua, cavisusuadest, cavisusuatitu, cavisusuacont,
             cavisusuaimag, cavisusuafechinic, cavisusuafechfina, cavisusuafechregi, cavisusuaesta)
        VALUES ((SELECT COALESCE(MAX(cavisusuaid)+1, 1) FROM public.tabavisusua),
             $1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, $8)
        RETURNING cavisusuaid AS idregistro;`;
export const avisousuaActualizar = `
        UPDATE public.tabavisusua
        SET cavisusuadest=$2, cavisusuatitu=$3, cavisusuacont=$4, cavisusuaimag=$5,
            cavisusuafechinic=$6, cavisusuafechfina=$7, cavisusuaesta=$8
        WHERE cavisusuaid=$1
        RETURNING cavisusuaid AS idregistro;`;
export const avisousuaBorrar = `
        UPDATE public.tabavisusua SET cavisusuaesta=$2 WHERE cavisusuaid=$1 RETURNING cavisusuaid AS idregistro;`;
export const avisodestListar = `
        SELECT d.cavisrolldestid AS idregistro, d.cavisrollid AS idaviso, d.crollid AS idrol,
               d.cavisusuadest AS idusuario, d.cavisusuafechinic AS fechainicio,
               d.cavisusuafechfina AS fechafin, d.cavisusuafechregi AS fecharegistro,
               d.cavisrolldestesta AS idestado,
               r.crollnomb AS rol, a.cavisrolltitu AS aviso
        FROM public.avisrolldest d
        LEFT JOIN logic.tabroll r ON (r.crollid = d.crollid)
        LEFT JOIN public.tabavisroll a ON (a.cavisrollid = d.cavisrollid)
        WHERE ($1::integer IS NULL OR d.cavisrollid = $1)
        ORDER BY d.cavisusuafechregi DESC;`;
export const avisodestRegistrar = `
        INSERT INTO public.avisrolldest
            (cavisrolldestid, cavisrollid, crollid, cavisusuadest, cavisusuafechinic,
             cavisusuafechfina, cavisusuafechregi, cavisrolldestesta)
        VALUES ((SELECT COALESCE(MAX(cavisrolldestid)+1, 1) FROM public.avisrolldest),
             $1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6)
        RETURNING cavisrolldestid AS idregistro;`;
export const avisodestActualizar = `
        UPDATE public.avisrolldest
        SET crollid=$2, cavisusuadest=$3, cavisusuafechinic=$4, cavisusuafechfina=$5, cavisrolldestesta=$6
        WHERE cavisrolldestid=$1
        RETURNING cavisrolldestid AS idregistro;`;
export const avisodestBorrar = `
        UPDATE public.avisrolldest SET cavisrolldestesta=$2 WHERE cavisrolldestid=$1 RETURNING cavisrolldestid AS idregistro;`;
export default {
  avisorollListar: avisorollListar,
  avisorollRegistrar: avisorollRegistrar,
  avisorollActualizar: avisorollActualizar,
  avisorollBorrar: avisorollBorrar,
  avisousuaListar: avisousuaListar,
  avisousuaRegistrar: avisousuaRegistrar,
  avisousuaActualizar: avisousuaActualizar,
  avisousuaBorrar: avisousuaBorrar,
  avisodestListar: avisodestListar,
  avisodestRegistrar: avisodestRegistrar,
  avisodestActualizar: avisodestActualizar,
  avisodestBorrar: avisodestBorrar
};
/**
 * avisos.sql.js
 * Sentencias SQL del módulo de avisos institucionales SAE (public.tabavisroll,
 * public.tabavisusua y public.avisrolldest).
 * Corresponden a control.avisos.php y control.configuracion_institucion.php del SAE.
 */
