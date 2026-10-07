export const competenciaListar = `
        SELECT c.ccompid AS idregistro, c.careaid AS idarea, c.cgradid AS idgrado,
               c.ccompcodi AS codigo, c.ccompdesc AS descripcion, c.ccompesta AS idestado,
               c.cinstid AS idinstitucion, c.casigid AS idasignatura, c.ccomptipid AS idtipo,
               c.ccompobse AS observacion, ar.careadesc AS area, s.casigdesc AS asignatura
        FROM public.tabcomp c
        LEFT JOIN public.tabarea ar ON (ar.careaid = c.careaid)
        LEFT JOIN public.tabasig s ON (s.casigid = c.casigid)
        WHERE ($1::integer IS NULL OR c.careaid = $1)
          AND ($2::text IS NULL OR c.cgradid = $2)
        ORDER BY c.ccompcodi;`;
export const competenciaRegistrar = `
        INSERT INTO public.tabcomp
            (ccompid, careaid, cgradid, ccompcodi, ccompdesc, ccompesta, cinstid, casigid, ccomptipid, ccompobse)
        VALUES ((SELECT COALESCE(MAX(ccompid)+1, 1) FROM public.tabcomp),
             $1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING ccompid AS idregistro;`;
export const competenciaActualizar = `
        UPDATE public.tabcomp
        SET careaid=$2, cgradid=$3, ccompcodi=$4, ccompdesc=$5, ccompesta=$6,
            cinstid=$7, casigid=$8, ccomptipid=$9, ccompobse=$10
        WHERE ccompid=$1
        RETURNING ccompid AS idregistro;`;
export const competenciaBorrar = `
        UPDATE public.tabcomp SET ccompesta=$2 WHERE ccompid=$1 RETURNING ccompid AS idregistro;`;
export const asigcurscompListar = `
        SELECT a.asigcurscompid AS idregistro, a.asigcursid AS idasigcurs, a.ccompid AS idcompetencia,
               a.asigcurscompesta AS idestado, c.ccompdesc AS competencia
        FROM public.asigcurscomp a
        LEFT JOIN public.tabcomp c ON (c.ccompid = a.ccompid)
        WHERE ($1::integer IS NULL OR a.asigcursid = $1)
        ORDER BY c.ccompdesc;`;
export const asigcurscompRegistrar = `
        INSERT INTO public.asigcurscomp (asigcurscompid, asigcursid, ccompid, asigcurscompesta)
        VALUES ((SELECT COALESCE(MAX(asigcurscompid)+1, 1) FROM public.asigcurscomp), $1, $2, $3)
        RETURNING asigcurscompid AS idregistro;`;
export const asigcurscompBorrar = `
        UPDATE public.asigcurscomp SET asigcurscompesta=$2 WHERE asigcurscompid=$1 RETURNING asigcurscompid AS idregistro;`;
export default {
  competenciaListar: competenciaListar,
  competenciaRegistrar: competenciaRegistrar,
  competenciaActualizar: competenciaActualizar,
  competenciaBorrar: competenciaBorrar,
  asigcurscompListar: asigcurscompListar,
  asigcurscompRegistrar: asigcurscompRegistrar,
  asigcurscompBorrar: asigcurscompBorrar
};
/**
 * indicadores.sql.js
 * Sentencias SQL del módulo de indicadores de desempeño (competencias):
 * public.tabcomp (competencia) y public.asigcurscomp (competencia por asignación-curso).
 */
