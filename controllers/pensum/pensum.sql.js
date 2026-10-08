export const areaListar = `
        SELECT careaid AS idregistro, careadesc AS descripcion, careacome AS comentario,
               careaesta AS idestado
        FROM public.tabarea WHERE careaesta = 8
        ORDER BY careadesc;`;
export const areaRegistrar = `
        INSERT INTO public.tabarea (careaid, careadesc, careacome, careaesta)
        VALUES ((SELECT COALESCE(MAX(careaid)+1, 1) FROM public.tabarea), $1, $2, $3)
        RETURNING careaid AS idregistro;`;
export const areaActualizar = `
        UPDATE public.tabarea SET careadesc=$2, careacome=$3, careaesta=$4
        WHERE careaid=$1 RETURNING careaid AS idregistro;`;
export const areaBorrar = `
        UPDATE public.tabarea SET careaesta=$2 WHERE careaid=$1 RETURNING careaid AS idregistro;`;
export const asignaturaListar = `
        SELECT a.casigid AS idregistro, a.casigdesc AS descripcion, a.careaid AS idarea,
               a.casigeval AS evaluable, a.casigesta AS idestado, a.casigabre AS abreviatura,
               ar.careadesc AS area
        FROM public.tabasig a
        LEFT JOIN public.tabarea ar ON (ar.careaid = a.careaid)
        ORDER BY a.casigdesc;`;
export const asignaturaRegistrar = `
        INSERT INTO public.tabasig (casigid, casigdesc, careaid, casigeval, casigesta, casigabre)
        VALUES ((SELECT COALESCE(MAX(casigid)+1, 1) FROM public.tabasig), $1, $2, $3, $4, $5)
        RETURNING casigid AS idregistro;`;
export const asignaturaActualizar = `
        UPDATE public.tabasig SET casigdesc=$2, careaid=$3, casigeval=$4, casigesta=$5, casigabre=$6
        WHERE casigid=$1 RETURNING casigid AS idregistro;`;
export const asignaturaBorrar = `
        UPDATE public.tabasig SET casigesta=$2 WHERE casigid=$1 RETURNING casigid AS idregistro;`;
export const instareaListar = `
        SELECT i.cinstareaid AS idregistro, i.cinstid, i.careaid AS idarea,
               i.cinstareafechregi AS fecharegistro, i.cinstareaesta AS idestado,
               ar.careadesc AS area
        FROM public.instarea i
        LEFT JOIN public.tabarea ar ON (ar.careaid = i.careaid)
        WHERE ($1::integer IS NULL OR i.cinstid = $1)
        ORDER BY ar.careadesc;`;
export const instareaRegistrar = `
        INSERT INTO public.instarea (cinstareaid, cinstid, careaid, cinstareafechregi, cinstareaesta)
        VALUES ((SELECT COALESCE(MAX(cinstareaid)+1, 1) FROM public.instarea), $1, $2, CURRENT_DATE, $3)
        RETURNING cinstareaid AS idregistro;`;
export const instareaBorrar = `
        UPDATE public.instarea SET cinstareaesta=$2 WHERE cinstareaid=$1 RETURNING cinstareaid AS idregistro;`;
export const contenidoListar = `
        SELECT c.ccontprogid AS idregistro, c.casigid AS idasignatura, c.ccontprogcodi AS codigo,
               c.ccontprogdesc AS descripcion, c.ccontprogesta AS idestado,
               a.casigdesc AS asignatura
        FROM public.tabcontprog c
        LEFT JOIN public.tabasig a ON (a.casigid = c.casigid)
        WHERE ($1::integer IS NULL OR c.casigid = $1)
        ORDER BY c.ccontprogcodi;`;
export const contenidoRegistrar = `
        INSERT INTO public.tabcontprog (ccontprogid, casigid, ccontprogcodi, ccontprogdesc, ccontprogesta)
        VALUES ((SELECT COALESCE(MAX(ccontprogid)+1, 1) FROM public.tabcontprog), $1, $2, $3, $4)
        RETURNING ccontprogid AS idregistro;`;
export const contenidoActualizar = `
        UPDATE public.tabcontprog SET casigid=$2, ccontprogcodi=$3, ccontprogdesc=$4, ccontprogesta=$5
        WHERE ccontprogid=$1 RETURNING ccontprogid AS idregistro;`;
export const contenidoBorrar = `
        UPDATE public.tabcontprog SET ccontprogesta=$2 WHERE ccontprogid=$1 RETURNING ccontprogid AS idregistro;`;
export const asigcurscontprogListar = `
        SELECT a.asigcurscontprogid AS idregistro, a.asigcursid AS idasigcurs,
               a.ccontprogid AS idcontenido, a.casigcurscontprogfech AS fecha,
               a.asigcurscontprogesta AS idestado, c.ccontprogdesc AS contenido
        FROM public.asigcurscontprog a
        LEFT JOIN public.tabcontprog c ON (c.ccontprogid = a.ccontprogid)
        WHERE ($1::integer IS NULL OR a.asigcursid = $1)
        ORDER BY a.casigcurscontprogfech;`;
export const asigcurscontprogRegistrar = `
        INSERT INTO public.asigcurscontprog
            (asigcurscontprogid, asigcursid, ccontprogid, casigcurscontprogfech, casigcurscontprogfechregi, asigcurscontprogesta)
        VALUES ((SELECT COALESCE(MAX(asigcurscontprogid)+1, 1) FROM public.asigcurscontprog),
             $1, $2, $3, CURRENT_TIMESTAMP, $4)
        RETURNING asigcurscontprogid AS idregistro;`;
export const asigcurscontprogBorrar = `
        UPDATE public.asigcurscontprog SET asigcurscontprogesta=$2
        WHERE asigcurscontprogid=$1 RETURNING asigcurscontprogid AS idregistro;`;
export const areaconfListar = `
        SELECT a.careaconfid AS idregistro, a.canolid AS idano, a.cinstid AS idinstitucion,
               a.casigid AS idasignatura, a.cgradid AS idgrado, a.careaconfvalo AS valor,
               a.careaconfesta AS idestado, s.casigdesc AS asignatura, g.cgraddesc AS grado
        FROM public.tabareaconf a
        LEFT JOIN public.tabasig s ON (s.casigid = a.casigid)
        LEFT JOIN public.tabgrad g ON (g.cgradid = a.cgradid)
        WHERE ($1::integer IS NULL OR a.cinstid = $1)
          AND ($2::integer IS NULL OR a.canolid = $2)
        ORDER BY s.casigdesc;`;
export const areaconfRegistrar = `
        INSERT INTO public.tabareaconf (careaconfid, canolid, cinstid, casigid, cgradid, careaconfvalo, careaconfesta)
        VALUES ((SELECT COALESCE(MAX(careaconfid)+1, 1) FROM public.tabareaconf), $1, $2, $3, $4, $5, $6)
        RETURNING careaconfid AS idregistro;`;
export const areaconfActualizar = `
        UPDATE public.tabareaconf SET casigid=$2, cgradid=$3, careaconfvalo=$4, careaconfesta=$5
        WHERE careaconfid=$1 RETURNING careaconfid AS idregistro;`;
export const areaconfBorrar = `
        UPDATE public.tabareaconf SET careaconfesta=$2 WHERE careaconfid=$1 RETURNING careaconfid AS idregistro;`;
export default {
  areaListar: areaListar,
  areaRegistrar: areaRegistrar,
  areaActualizar: areaActualizar,
  areaBorrar: areaBorrar,
  asignaturaListar: asignaturaListar,
  asignaturaRegistrar: asignaturaRegistrar,
  asignaturaActualizar: asignaturaActualizar,
  asignaturaBorrar: asignaturaBorrar,
  instareaListar: instareaListar,
  instareaRegistrar: instareaRegistrar,
  instareaBorrar: instareaBorrar,
  contenidoListar: contenidoListar,
  contenidoRegistrar: contenidoRegistrar,
  contenidoActualizar: contenidoActualizar,
  contenidoBorrar: contenidoBorrar,
  asigcurscontprogListar: asigcurscontprogListar,
  asigcurscontprogRegistrar: asigcurscontprogRegistrar,
  asigcurscontprogBorrar: asigcurscontprogBorrar,
  areaconfListar: areaconfListar,
  areaconfRegistrar: areaconfRegistrar,
  areaconfActualizar: areaconfActualizar,
  areaconfBorrar: areaconfBorrar
};
/**
 * pensum.sql.js
 * Sentencias SQL del módulo de pensum: áreas, asignaturas, áreas por institución,
 * contenidos programáticos, contenidos por asignación-curso y configuración de áreas.
 */
