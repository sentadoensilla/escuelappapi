/**
 * pensum.sql.js
 * Sentencias SQL del módulo de pensum: áreas, asignaturas, áreas por institución,
 * contenidos programáticos, contenidos por asignación-curso y configuración de áreas.
 */
module.exports = {

    // ================= ÁREAS (public.tabarea) =================
    areaListar: `
        SELECT careaid AS idregistro, careadesc AS descripcion, careacome AS comentario,
               careaesta AS idestado
        FROM public.tabarea ORDER BY careadesc;`,
    areaRegistrar: `
        INSERT INTO public.tabarea (careaid, careadesc, careacome, careaesta)
        VALUES ((SELECT COALESCE(MAX(careaid)+1, 1) FROM public.tabarea), $1, $2, $3)
        RETURNING careaid AS idregistro;`,
    areaActualizar: `
        UPDATE public.tabarea SET careadesc=$2, careacome=$3, careaesta=$4
        WHERE careaid=$1 RETURNING careaid AS idregistro;`,
    areaBorrar: `
        UPDATE public.tabarea SET careaesta=$2 WHERE careaid=$1 RETURNING careaid AS idregistro;`,

    // ================= ASIGNATURAS (public.tabasig) =================
    asignaturaListar: `
        SELECT a.casigid AS idregistro, a.casigdesc AS descripcion, a.careaid AS idarea,
               a.casigeval AS evaluable, a.casigesta AS idestado, a.casigabre AS abreviatura,
               ar.careadesc AS area
        FROM public.tabasig a
        LEFT JOIN public.tabarea ar ON (ar.careaid = a.careaid)
        ORDER BY a.casigdesc;`,
    asignaturaRegistrar: `
        INSERT INTO public.tabasig (casigid, casigdesc, careaid, casigeval, casigesta, casigabre)
        VALUES ((SELECT COALESCE(MAX(casigid)+1, 1) FROM public.tabasig), $1, $2, $3, $4, $5)
        RETURNING casigid AS idregistro;`,
    asignaturaActualizar: `
        UPDATE public.tabasig SET casigdesc=$2, careaid=$3, casigeval=$4, casigesta=$5, casigabre=$6
        WHERE casigid=$1 RETURNING casigid AS idregistro;`,
    asignaturaBorrar: `
        UPDATE public.tabasig SET casigesta=$2 WHERE casigid=$1 RETURNING casigid AS idregistro;`,

    // ================= ÁREAS POR INSTITUCIÓN (public.instarea) =================
    instareaListar: `
        SELECT i.cinstareaid AS idregistro, i.cinstid, i.careaid AS idarea,
               i.cinstareafechregi AS fecharegistro, i.cinstareaesta AS idestado,
               ar.careadesc AS area
        FROM public.instarea i
        LEFT JOIN public.tabarea ar ON (ar.careaid = i.careaid)
        WHERE ($1::integer IS NULL OR i.cinstid = $1)
        ORDER BY ar.careadesc;`,
    instareaRegistrar: `
        INSERT INTO public.instarea (cinstareaid, cinstid, careaid, cinstareafechregi, cinstareaesta)
        VALUES ((SELECT COALESCE(MAX(cinstareaid)+1, 1) FROM public.instarea), $1, $2, CURRENT_DATE, $3)
        RETURNING cinstareaid AS idregistro;`,
    instareaBorrar: `
        UPDATE public.instarea SET cinstareaesta=$2 WHERE cinstareaid=$1 RETURNING cinstareaid AS idregistro;`,

    // ================= CONTENIDOS PROGRAMÁTICOS (public.tabcontprog) =================
    contenidoListar: `
        SELECT c.ccontprogid AS idregistro, c.casigid AS idasignatura, c.ccontprogcodi AS codigo,
               c.ccontprogdesc AS descripcion, c.ccontprogesta AS idestado,
               a.casigdesc AS asignatura
        FROM public.tabcontprog c
        LEFT JOIN public.tabasig a ON (a.casigid = c.casigid)
        WHERE ($1::integer IS NULL OR c.casigid = $1)
        ORDER BY c.ccontprogcodi;`,
    contenidoRegistrar: `
        INSERT INTO public.tabcontprog (ccontprogid, casigid, ccontprogcodi, ccontprogdesc, ccontprogesta)
        VALUES ((SELECT COALESCE(MAX(ccontprogid)+1, 1) FROM public.tabcontprog), $1, $2, $3, $4)
        RETURNING ccontprogid AS idregistro;`,
    contenidoActualizar: `
        UPDATE public.tabcontprog SET casigid=$2, ccontprogcodi=$3, ccontprogdesc=$4, ccontprogesta=$5
        WHERE ccontprogid=$1 RETURNING ccontprogid AS idregistro;`,
    contenidoBorrar: `
        UPDATE public.tabcontprog SET ccontprogesta=$2 WHERE ccontprogid=$1 RETURNING ccontprogid AS idregistro;`,

    // ================= CONTENIDO POR ASIGNACIÓN-CURSO (public.asigcurscontprog) =================
    asigcurscontprogListar: `
        SELECT a.asigcurscontprogid AS idregistro, a.asigcursid AS idasigcurs,
               a.ccontprogid AS idcontenido, a.casigcurscontprogfech AS fecha,
               a.asigcurscontprogesta AS idestado, c.ccontprogdesc AS contenido
        FROM public.asigcurscontprog a
        LEFT JOIN public.tabcontprog c ON (c.ccontprogid = a.ccontprogid)
        WHERE ($1::integer IS NULL OR a.asigcursid = $1)
        ORDER BY a.casigcurscontprogfech;`,
    asigcurscontprogRegistrar: `
        INSERT INTO public.asigcurscontprog
            (asigcurscontprogid, asigcursid, ccontprogid, casigcurscontprogfech, casigcurscontprogfechregi, asigcurscontprogesta)
        VALUES ((SELECT COALESCE(MAX(asigcurscontprogid)+1, 1) FROM public.asigcurscontprog),
             $1, $2, $3, CURRENT_TIMESTAMP, $4)
        RETURNING asigcurscontprogid AS idregistro;`,
    asigcurscontprogBorrar: `
        UPDATE public.asigcurscontprog SET asigcurscontprogesta=$2
        WHERE asigcurscontprogid=$1 RETURNING asigcurscontprogid AS idregistro;`,

    // ================= CONFIGURACIÓN DE ÁREAS (public.tabareaconf) =================
    areaconfListar: `
        SELECT a.careaconfid AS idregistro, a.canolid AS idano, a.cinstid AS idinstitucion,
               a.casigid AS idasignatura, a.cgradid AS idgrado, a.careaconfvalo AS valor,
               a.careaconfesta AS idestado, s.casigdesc AS asignatura, g.cgraddesc AS grado
        FROM public.tabareaconf a
        LEFT JOIN public.tabasig s ON (s.casigid = a.casigid)
        LEFT JOIN public.tabgrad g ON (g.cgradid = a.cgradid)
        WHERE ($1::integer IS NULL OR a.cinstid = $1)
          AND ($2::integer IS NULL OR a.canolid = $2)
        ORDER BY s.casigdesc;`,
    areaconfRegistrar: `
        INSERT INTO public.tabareaconf (careaconfid, canolid, cinstid, casigid, cgradid, careaconfvalo, careaconfesta)
        VALUES ((SELECT COALESCE(MAX(careaconfid)+1, 1) FROM public.tabareaconf), $1, $2, $3, $4, $5, $6)
        RETURNING careaconfid AS idregistro;`,
    areaconfActualizar: `
        UPDATE public.tabareaconf SET casigid=$2, cgradid=$3, careaconfvalo=$4, careaconfesta=$5
        WHERE careaconfid=$1 RETURNING careaconfid AS idregistro;`,
    areaconfBorrar: `
        UPDATE public.tabareaconf SET careaconfesta=$2 WHERE careaconfid=$1 RETURNING careaconfid AS idregistro;`,
};
