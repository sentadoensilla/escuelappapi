export const docenteListar = `
        SELECT * FROM (
            SELECT DISTINCT ON (d.cdoceid)
                   d.cdoceid AS idregistro, d.cdocenomb AS nombre1, d.cdocenomb2 AS nombre2,
                   d.cdoceapel AS apellido1, d.cdoceapel2 AS apellido2, d.cdocefnac AS fechanacimiento,
                   d.cdocesexo AS idsexo, d.cdocetiposang AS idtiposangre, d.cdocefoto AS foto,
                   d.cdocetipoiden AS idtipodocumento, d.cdoceiden AS identificacion,
                   d.cdocecelu AS celular, d.cdocetele AS telefono, d.cdocedire AS direccion,
                   d.cdoceemai AS email, d.cdocefechingr AS fechaingreso, d.cdocefechregi AS fecharegistro,
                   d.cdocenombrado AS nombrado, d.cdoceesta AS idestado, d.cdocefirm AS firma,
                   c.ccargdesc AS cargo, i.ccargid AS idcargo, i.cjefearea AS jefearea,
                   i.cinstid AS idinstitucion, i.cinstdoceesta AS idestadocontratacion
            FROM public.tabdoce d
            LEFT JOIN public.tabinstdoce i
                   ON (i.cdoceid = d.cdoceid AND i.cinstdoceesta IN (4, 8)
                       AND ($1::integer IS NULL OR i.cinstid = $1))
            LEFT JOIN public.tabcarg c ON (c.ccargid = i.ccargid)
            WHERE ($1::integer IS NULL OR i.cdoceid IS NOT NULL)
            ORDER BY d.cdoceid, i.cinstdoceid DESC
        ) q
        ORDER BY q.apellido1, q.nombre1;`;
// Sincronización de la contratación (cargo y jefe de área) por institución/año.
export const contratacionExiste = `
        SELECT cinstdoceid AS id
        FROM public.tabinstdoce
        WHERE cdoceid = $1 AND cinstid = $2
          AND ($3::integer IS NULL OR canolid = $3)
          AND cinstdoceesta IN (4, 8)
        ORDER BY cinstdoceid DESC
        LIMIT 1;`;
export const contratacionSincronizar = `
        UPDATE public.tabinstdoce SET ccargid = $2, cjefearea = $3
        WHERE cinstdoceid = $1;`;
export const contratacionCrear = `
        INSERT INTO public.tabinstdoce
            (cinstdoceid, cinstid, cdoceid, canolid, ccargid, ctipovincid, cjefearea, cinstdocefechregi, cinstdoceesta)
        VALUES ((SELECT COALESCE(MAX(cinstdoceid)+1, 1) FROM public.tabinstdoce),
             $1, $2, $3, $4, $5, $6, CURRENT_DATE, 8)
        RETURNING cinstdoceid AS id;`;
// Contratación PENDIENTE (auto-gestión): queda a la espera de autorización.
export const contratacionCrearPendiente = `
        INSERT INTO public.tabinstdoce
            (cinstdoceid, cinstid, cdoceid, canolid, ccargid, ctipovincid, cjefearea, cinstdocefechregi, cinstdoceesta)
        VALUES ((SELECT COALESCE(MAX(cinstdoceid)+1, 1) FROM public.tabinstdoce),
             $1, $2, $3, $4, $5, $6, CURRENT_DATE, 4)
        RETURNING cinstdoceid AS id;`;
// Autorización del docente por la institución.
export const contratacionPendienteBuscar = `
        SELECT cinstdoceid AS id
        FROM public.tabinstdoce
        WHERE cdoceid = $1 AND cinstid = $2
          AND ($3::integer IS NULL OR canolid = $3)
          AND cinstdoceesta = 4
        ORDER BY cinstdoceid DESC
        LIMIT 1;`;
export const contratacionActivar = `
        UPDATE public.tabinstdoce SET cinstdoceesta = 8
        WHERE cinstdoceid = $1 RETURNING cinstdoceid AS id;`;
export const docenteActivar = `
        UPDATE public.tabdoce SET cdoceesta = 8
        WHERE cdoceid = $1 RETURNING cdoceid AS id;`;
// Año lectivo vigente (8 = Activo, 7 = Abierto) como respaldo cuando el enlace
// no trae año (p.ej. administrador sin año en la sesión).
export const anoVigente = `
        SELECT canolid FROM public.tabanol
        ORDER BY (canolesta = 8) DESC, (canolesta = 7) DESC, canolid DESC
        LIMIT 1;`;
export const docenteRegistrar = `
        INSERT INTO public.tabdoce
            (cdoceid, cdocenomb, cdocenomb2, cdoceapel, cdoceapel2, cdocefnac, cdocesexo,
             cdocetiposang, cdocefoto, cdocetipoiden, cdoceiden, cdocecelu, cdocetele,
             cdocedire, cdoceemai, cdocefechingr, cdocefechregi, cdocenombrado, cdoceesta, cdocefirm)
        VALUES ((SELECT COALESCE(MAX(cdoceid)+1, 1) FROM public.tabdoce),
             $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, CURRENT_DATE, $16, $17, $18)
        RETURNING cdoceid AS idregistro;`;
export const docenteActualizar = `
        UPDATE public.tabdoce
        SET cdocenomb=$2, cdocenomb2=$3, cdoceapel=$4, cdoceapel2=$5, cdocefnac=$6, cdocesexo=$7,
            cdocetiposang=$8, cdocefoto=$9, cdocetipoiden=$10, cdoceiden=$11, cdocecelu=$12, cdocetele=$13,
            cdocedire=$14, cdoceemai=$15, cdocefechingr=$16, cdocenombrado=$17, cdoceesta=$18, cdocefirm=$19
        WHERE cdoceid=$1
        RETURNING cdoceid AS idregistro;`;
export const docenteBorrar = `
        UPDATE public.tabdoce SET cdoceesta=$2 WHERE cdoceid=$1 RETURNING cdoceid AS idregistro;`;
export const contratacionListar = `
        SELECT i.cinstdoceid AS idregistro, i.cinstid AS idinstitucion, i.cdoceid AS iddocente,
               i.canolid AS idano, i.ccargid AS idcargo, i.ctipovincid AS idtipovinculacion,
               i.cinstdocesala AS salario, i.cinstdoceeps AS ideps, i.cinstdocears AS idars,
               i.cinstdocecaja AS idcaja, i.cinstdocearp AS idarp,
               i.cinstdocefechinic AS fechainicio, i.cinstdocefechfina AS fechafin,
               i.cinstdocefechregi AS fecharegistro, i.cinstdoceesta AS idestado, i.cjefearea AS jefearea,
               d.cdoceapel || ' ' || d.cdocenomb AS docente, c.ccargdesc AS cargo
        FROM public.tabinstdoce i
        LEFT JOIN public.tabdoce d ON (d.cdoceid = i.cdoceid)
        LEFT JOIN public.tabcarg c ON (c.ccargid = i.ccargid)
        WHERE ($1::integer IS NULL OR i.cinstid = $1)
          AND ($2::integer IS NULL OR i.canolid = $2)
        ORDER BY d.cdoceapel;`;
export const contratacionRegistrar = `
        INSERT INTO public.tabinstdoce
            (cinstdoceid, cinstid, cdoceid, canolid, ccargid, ctipovincid, cinstdocesala,
             cinstdoceeps, cinstdocears, cinstdocecaja, cinstdocearp, cinstdocefechinic,
             cinstdocefechfina, cinstdocefechregi, cinstdoceesta, cjefearea)
        VALUES ((SELECT COALESCE(MAX(cinstdoceid)+1, 1) FROM public.tabinstdoce),
             $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_DATE, $13, $14)
        RETURNING cinstdoceid AS idregistro;`;
export const contratacionActualizar = `
        UPDATE public.tabinstdoce
        SET ccargid=$2, ctipovincid=$3, cinstdocesala=$4, cinstdoceeps=$5, cinstdocears=$6,
            cinstdocecaja=$7, cinstdocearp=$8, cinstdocefechinic=$9, cinstdocefechfina=$10,
            cinstdoceesta=$11, cjefearea=$12
        WHERE cinstdoceid=$1
        RETURNING cinstdoceid AS idregistro;`;
export const contratacionBorrar = `
        UPDATE public.tabinstdoce SET cinstdoceesta=$2 WHERE cinstdoceid=$1 RETURNING cinstdoceid AS idregistro;`;
export const asignacionListar = `
        SELECT a.asigcursid AS idregistro, a.casigid AS idasignatura, a.ccursid AS idcurso,
               a.cdoceid AS iddocente, a.casiggradinic AS horainicio, a.casiggradfina AS horafin,
               a.casigcursfechregi AS fecharegistro, a.casigcursesta AS idestado, a.casigdura AS duracion,
               s.casigdesc AS asignatura, c.ccursnomb AS curso,
               d.cdoceapel || ' ' || d.cdocenomb AS docente
        FROM public.asigcurs a
        LEFT JOIN public.tabasig s ON (s.casigid = a.casigid)
        LEFT JOIN public.tabcurs c ON (c.ccursid = a.ccursid)
        LEFT JOIN public.tabdoce d ON (d.cdoceid = a.cdoceid)
        WHERE ($1::integer IS NULL OR a.ccursid = $1)
          AND ($2::integer IS NULL OR a.cdoceid = $2)
        ORDER BY c.ccursnomb, s.casigdesc;`;
export const asignacionRegistrar = `
        INSERT INTO public.asigcurs
            (asigcursid, casigid, ccursid, cdoceid, casiggradinic, casiggradfina, casigcursfechregi, casigcursesta, casigdura)
        VALUES ((SELECT COALESCE(MAX(asigcursid)+1, 1) FROM public.asigcurs),
             $1, $2, $3, $4, $5, CURRENT_DATE, $6, $7)
        RETURNING asigcursid AS idregistro;`;
export const asignacionActualizar = `
        UPDATE public.asigcurs
        SET casigid=$2, ccursid=$3, cdoceid=$4, casiggradinic=$5, casiggradfina=$6, casigcursesta=$7, casigdura=$8
        WHERE asigcursid=$1
        RETURNING asigcursid AS idregistro;`;
export const asignacionBorrar = `
        UPDATE public.asigcurs SET casigcursesta=$2 WHERE asigcursid=$1 RETURNING asigcursid AS idregistro;`;
export default {
  docenteListar: docenteListar,
  docenteRegistrar: docenteRegistrar,
  docenteActualizar: docenteActualizar,
  docenteBorrar: docenteBorrar,
  contratacionExiste: contratacionExiste,
  contratacionSincronizar: contratacionSincronizar,
  contratacionCrear: contratacionCrear,
  contratacionCrearPendiente: contratacionCrearPendiente,
  contratacionPendienteBuscar: contratacionPendienteBuscar,
  contratacionActivar: contratacionActivar,
  docenteActivar: docenteActivar,
  anoVigente: anoVigente,
  contratacionListar: contratacionListar,
  contratacionRegistrar: contratacionRegistrar,
  contratacionActualizar: contratacionActualizar,
  contratacionBorrar: contratacionBorrar,
  asignacionListar: asignacionListar,
  asignacionRegistrar: asignacionRegistrar,
  asignacionActualizar: asignacionActualizar,
  asignacionBorrar: asignacionBorrar
};
/**
 * docentes.sql.js
 * Sentencias SQL del módulo de docentes (public.tabdoce), su contratación
 * por institución (public.tabinstdoce) y la asignación académica (public.asigcurs).
 */
