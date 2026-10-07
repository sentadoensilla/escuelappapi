export const novedadListar = `
        SELECT n.cnoveid AS idregistro, n.asigcursid AS idasigcurs, n.cperiid AS idperiodo,
               n.cmatrid AS idmatricula, n.cnovefech AS fecha, n.cnovefechregi AS fecharegistro,
               n.cnoveobse AS observacion, n.ctiponoveid AS idtiponovedad, n.cnoveesta AS idestado,
               t.ctiponovedesc AS tiponovedad,
               e.cestuapel || ' ' || e.cestunomb AS estudiante, c.ccursnomb AS curso
        FROM public.tabnove n
        LEFT JOIN public.tabtiponove t ON (t.ctiponoveid = n.ctiponoveid)
        LEFT JOIN public.tabmatr m ON (m.cmatrid = n.cmatrid)
        LEFT JOIN public.tabestu e ON (e.cestuid = m.cestuid)
        LEFT JOIN public.tabcurs c ON (c.ccursid = m.ccursid)
        WHERE ($1::integer IS NULL OR n.cmatrid = $1)
          AND ($2::integer IS NULL OR n.asigcursid = $2)
          AND ($3::integer IS NULL OR n.ctiponoveid = $3)
        ORDER BY n.cnovefech DESC;`;
export const novedadRegistrar = `
        INSERT INTO public.tabnove
            (cnoveid, asigcursid, cperiid, cmatrid, cnovefech, cnovefechregi, cnoveobse, ctiponoveid, cnoveesta)
        VALUES ((SELECT COALESCE(MAX(cnoveid)+1, 1) FROM public.tabnove),
             $1, $2, $3, $4, CURRENT_TIMESTAMP, $5, $6, $7)
        RETURNING cnoveid AS idregistro;`;
export const novedadActualizar = `
        UPDATE public.tabnove
        SET asigcursid=$2, cperiid=$3, cmatrid=$4, cnovefech=$5, cnoveobse=$6,
            ctiponoveid=$7, cnoveesta=$8
        WHERE cnoveid=$1
        RETURNING cnoveid AS idregistro;`;
export const novedadBorrar = `
        UPDATE public.tabnove SET cnoveesta=$2 WHERE cnoveid=$1 RETURNING cnoveid AS idregistro;`;
export default {
  novedadListar: novedadListar,
  novedadRegistrar: novedadRegistrar,
  novedadActualizar: novedadActualizar,
  novedadBorrar: novedadBorrar
};
/**
 * novedades.sql.js
 * Sentencias SQL del módulo de novedades/asistencias SAE (public.tabnove).
 * Corresponden a control.inasistencias*.php, control.observaciones.php y
 * control.faltasestudiantes.php del SAE.
 */
