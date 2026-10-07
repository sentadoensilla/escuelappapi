export const planListar = `
        SELECT cobsplanid AS idregistro, cinstid AS idinstitucion, ctituobsplan AS titulo,
               cparrobsplan1 AS parrafo1, cparrobsplan2 AS parrafo2, cestaobsplan AS idestado
        FROM observador.tabobsplan
        WHERE ($1::integer IS NULL OR cinstid = $1);`;
export const planRegistrar = `
        INSERT INTO observador.tabobsplan (cobsplanid, cinstid, ctituobsplan, cparrobsplan1, cparrobsplan2, cestaobsplan)
        VALUES ((SELECT COALESCE(MAX(cobsplanid)+1, 1) FROM observador.tabobsplan), $1, $2, $3, $4, $5)
        RETURNING cobsplanid AS idregistro;`;
export const planActualizar = `
        UPDATE observador.tabobsplan SET ctituobsplan=$2, cparrobsplan1=$3, cparrobsplan2=$4, cestaobsplan=$5
        WHERE cobsplanid=$1 RETURNING cobsplanid AS idregistro;`;
export const responsabilidadListar = `
        SELECT crespid AS idregistro, cinstid AS idinstitucion, cpespnomb AS nombre,
               cpespdesc AS descripcion, crespesta AS idestado
        FROM observador.tabresp
        WHERE ($1::integer IS NULL OR cinstid = $1)
        ORDER BY cpespnomb;`;
export const responsabilidadRegistrar = `
        INSERT INTO observador.tabresp (crespid, cinstid, cpespnomb, cpespdesc, crespesta)
        VALUES ((SELECT COALESCE(MAX(crespid)+1, 1) FROM observador.tabresp), $1, $2, $3, $4)
        RETURNING crespid AS idregistro;`;
export const responsabilidadActualizar = `
        UPDATE observador.tabresp SET cpespnomb=$2, cpespdesc=$3, crespesta=$4
        WHERE crespid=$1 RETURNING crespid AS idregistro;`;
export const responsabilidadBorrar = `
        UPDATE observador.tabresp SET crespesta=$2 WHERE crespid=$1 RETURNING crespid AS idregistro;`;
export const subresponsabilidadListar = `
        SELECT crespsubid AS idregistro, crespid AS idresponsabilidad, crespsubnomb AS nombre,
               crespsubdesc AS descripcion, crespsubesta AS idestado
        FROM observador.tabrespsub
        WHERE ($1::integer IS NULL OR crespid = $1)
        ORDER BY crespsubnomb;`;
export const subresponsabilidadRegistrar = `
        INSERT INTO observador.tabrespsub (crespsubid, crespid, crespsubnomb, crespsubdesc, crespsubesta)
        VALUES ((SELECT COALESCE(MAX(crespsubid)+1, 1) FROM observador.tabrespsub), $1, $2, $3, $4)
        RETURNING crespsubid AS idregistro;`;
export const subresponsabilidadBorrar = `
        UPDATE observador.tabrespsub SET crespsubesta=$2 WHERE crespsubid=$1 RETURNING crespsubid AS idregistro;`;
export const observacionListar = `
        SELECT o.crespobsid AS idregistro, o.crespid AS idresponsabilidad, o.cperiid AS idperiodo,
               o.cmatrid AS idmatricula, o.crespobsdesc AS descripcion, o.crespobsfech AS fecha,
               o.crespobshist AS historial, o.crespobsesta AS idestado,
               e.cestuapel || ' ' || e.cestunomb AS estudiante
        FROM observador.tabrespobs o
        LEFT JOIN public.tabmatr m ON (m.cmatrid = o.cmatrid)
        LEFT JOIN public.tabestu e ON (e.cestuid = m.cestuid)
        WHERE ($1::integer IS NULL OR o.cmatrid = $1)
        ORDER BY o.crespobsfech DESC;`;
export const observacionRegistrar = `
        INSERT INTO observador.tabrespobs (crespobsid, crespid, cperiid, cmatrid, crespobsdesc, crespobsfech, crespobshist, crespobsesta)
        VALUES ((SELECT COALESCE(MAX(crespobsid)+1, 1) FROM observador.tabrespobs), $1, $2, $3, $4, $5, $6, $7)
        RETURNING crespobsid AS idregistro;`;
export const observacionBorrar = `
        UPDATE observador.tabrespobs SET crespobsesta=$2 WHERE crespobsid=$1 RETURNING crespobsid AS idregistro;`;
export const evaluacionListar = `
        SELECT e.crespevalid AS idregistro, e.cperiid AS idperiodo, e.cmatrid AS idmatricula,
               e.crespsubid AS idresponsabilidad, e.cevalsubid AS idcriterio,
               e.crespevalfech AS fecha, e.crespevalhist AS historial, e.crespevalesta AS idestado,
               s.crespsubnomb AS responsabilidad
        FROM observador.tabrespeval e
        LEFT JOIN observador.tabrespsub s ON (s.crespsubid = e.crespsubid)
        WHERE ($1::integer IS NULL OR e.cmatrid = $1)
        ORDER BY e.crespevalfech;`;
export const evaluacionRegistrar = `
        INSERT INTO observador.tabrespeval (crespevalid, cperiid, cmatrid, crespsubid, cevalsubid, crespevalfech, crespevalhist, crespevalesta)
        VALUES ((SELECT COALESCE(MAX(crespevalid)+1, 1) FROM observador.tabrespeval), $1, $2, $3, $4, $5, $6, $7)
        RETURNING crespevalid AS idregistro;`;
export default {
  planListar: planListar,
  planRegistrar: planRegistrar,
  planActualizar: planActualizar,
  responsabilidadListar: responsabilidadListar,
  responsabilidadRegistrar: responsabilidadRegistrar,
  responsabilidadActualizar: responsabilidadActualizar,
  responsabilidadBorrar: responsabilidadBorrar,
  subresponsabilidadListar: subresponsabilidadListar,
  subresponsabilidadRegistrar: subresponsabilidadRegistrar,
  subresponsabilidadBorrar: subresponsabilidadBorrar,
  observacionListar: observacionListar,
  observacionRegistrar: observacionRegistrar,
  observacionBorrar: observacionBorrar,
  evaluacionListar: evaluacionListar,
  evaluacionRegistrar: evaluacionRegistrar
};
/**
 * observador.sql.js
 * Sentencias SQL del módulo de observador del estudiante (esquema observador):
 * grupos de responsabilidades (tabresp), responsabilidades (tabrespsub),
 * observaciones (tabrespobs), evaluación (tabrespeval) y plantilla (tabobsplan).
 */
