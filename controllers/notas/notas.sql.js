export const notaListar = `
        SELECT n.cnotaid AS idregistro, n.asigcursid AS idasigcurs, n.ccompid AS idcompetencia,
               n.cperiid AS idperiodo, n.cmatrid AS idmatricula, n.cnotavalo AS valor,
               n.cnotafech AS fecha, n.cnotaobse AS observacion, n.cnotaesta AS idestado,
               c.ccompdesc AS competencia, e.cestuapel || ' ' || e.cestunomb AS estudiante
        FROM public.tabnota n
        LEFT JOIN public.tabcomp c ON (c.ccompid = n.ccompid)
        LEFT JOIN public.tabmatr m ON (m.cmatrid = n.cmatrid)
        LEFT JOIN public.tabestu e ON (e.cestuid = m.cestuid)
        WHERE ($1::integer IS NULL OR n.cmatrid = $1)
          AND ($2::integer IS NULL OR n.asigcursid = $2)
        ORDER BY n.cnotafech DESC;`;
export const notaRegistrar = `
        INSERT INTO public.tabnota
            (cnotaid, asigcursid, ccompid, cperiid, cmatrid, cnotavalo, cnotafech, cnotafechregi, cnotaobse, cnotaesta)
        VALUES ((SELECT COALESCE(MAX(cnotaid)+1, 1) FROM public.tabnota),
             $1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, $7, $8)
        RETURNING cnotaid AS idregistro;`;
export const notaActualizar = `
        UPDATE public.tabnota SET ccompid=$2, cnotavalo=$3, cnotafech=$4, cnotaobse=$5, cnotaesta=$6
        WHERE cnotaid=$1 RETURNING cnotaid AS idregistro;`;
export const notaBorrar = `
        UPDATE public.tabnota SET cnotaesta=$2 WHERE cnotaid=$1 RETURNING cnotaid AS idregistro;`;
export const compestuListar = `
        SELECT c.ccompestuid AS idregistro, c.asigcurscompid AS idasigcurscomp, c.cperiid AS idperiodo,
               c.cmatrid AS idmatricula, c.ccompestufechregi AS fecharegistro, c.ccompestuesta AS idestado
        FROM public.tabcompestu c
        WHERE ($1::integer IS NULL OR c.cmatrid = $1)
        ORDER BY c.ccompestufechregi;`;
export const compestuRegistrar = `
        INSERT INTO public.tabcompestu (ccompestuid, asigcurscompid, cperiid, cmatrid, ccompestufechregi, ccompestuesta)
        VALUES ((SELECT COALESCE(MAX(ccompestuid)+1, 1) FROM public.tabcompestu), $1, $2, $3, CURRENT_TIMESTAMP, $4)
        RETURNING ccompestuid AS idregistro;`;
export const compestuBorrar = `
        UPDATE public.tabcompestu SET ccompestuesta=$2 WHERE ccompestuid=$1 RETURNING ccompestuid AS idregistro;`;
export const notadefListar = `
        SELECT n.cnotadefid AS idregistro, n.cmatrid AS idmatricula, n.asigcursid AS idasigcurs,
               n.cperiid AS idperiodo, n.ctipodeseid AS idtipodesempeno, n.cnotadefvalo AS valor,
               n.cnotadeffech AS fecha, n.cnotadefobse AS observacion, n.cnotadefesta AS idestado,
               t.cdesctipodese AS desempeno
        FROM public.tabnotadef n
        LEFT JOIN public.tabtipodese t ON (t.ctipodeseid = n.ctipodeseid)
        WHERE ($1::integer IS NULL OR n.cmatrid = $1)
        ORDER BY n.cnotadeffech;`;
export const notadefRegistrar = `
        INSERT INTO public.tabnotadef
            (cnotadefid, cmatrid, asigcursid, cperiid, ctipodeseid, cnotadefvalo, cnotadeffech, cnotadeffechregi, cnotadefobse, cnotadefesta)
        VALUES ((SELECT COALESCE(MAX(cnotadefid)+1, 1) FROM public.tabnotadef),
             $1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_DATE, $6, $7)
        RETURNING cnotadefid AS idregistro;`;
export const notadefBorrar = `
        UPDATE public.tabnotadef SET cnotadefesta=$2 WHERE cnotadefid=$1 RETURNING cnotadefid AS idregistro;`;
export const promdefListar = `
        SELECT cpromdefid AS idregistro, cmatrid AS idmatricula, cperiid AS idperiodo,
               ctipopromid AS idtipopromedio, cpromdefvalo AS valor, cpromdefesta AS idestado
        FROM public.tabpromdef
        WHERE ($1::integer IS NULL OR cmatrid = $1)
        ORDER BY cpromdefid;`;
export const promdefRegistrar = `
        INSERT INTO public.tabpromdef (cpromdefid, cmatrid, cperiid, ctipopromid, cpromdefvalo, cpromdefesta)
        VALUES ((SELECT COALESCE(MAX(cpromdefid)+1, 1) FROM public.tabpromdef), $1, $2, $3, $4, $5)
        RETURNING cpromdefid AS idregistro;`;
export const promdefBorrar = `
        UPDATE public.tabpromdef SET cpromdefesta=$2 WHERE cpromdefid=$1 RETURNING cpromdefid AS idregistro;`;
export const promasigListar = `
        SELECT cpromasigid AS idregistro, cpromoid AS idpromedio, canolid AS idano,
               cpromasigpond AS ponderacion, careaid AS idarea, asigcursid AS idasigcurs,
               cpromasigprom AS promedio, cpromasigesta AS idestado
        FROM public.tabpromasig
        WHERE ($1::integer IS NULL OR cpromoid = $1)
        ORDER BY cpromasigid;`;
export const promasigRegistrar = `
        INSERT INTO public.tabpromasig (cpromasigid, cpromoid, canolid, cpromasigpond, careaid, asigcursid, cpromasigprom, cpromasigesta)
        VALUES ((SELECT COALESCE(MAX(cpromasigid)+1, 1) FROM public.tabpromasig), $1, $2, $3, $4, $5, $6, $7)
        RETURNING cpromasigid AS idregistro;`;
export const promasigBorrar = `
        UPDATE public.tabpromasig SET cpromasigesta=$2 WHERE cpromasigid=$1 RETURNING cpromasigid AS idregistro;`;
export const promoListar = `
        SELECT cpromoid AS idregistro, cpromfin AS promediofinal, cpromdef AS definitivo,
               cgradodesde AS gradodesde, cgradopara AS gradopara, cpromoesta AS idestado
        FROM public.tabpromo
        ORDER BY cpromoid;`;
export const promoRegistrar = `
        INSERT INTO public.tabpromo (cpromoid, cpromfin, cpromdef, cgradodesde, cgradopara, cpromoesta)
        VALUES ((SELECT COALESCE(MAX(cpromoid)+1, 1) FROM public.tabpromo), $1, $2, $3, $4, $5)
        RETURNING cpromoid AS idregistro;`;
export const promoActualizar = `
        UPDATE public.tabpromo SET cpromfin=$2, cpromdef=$3, cgradodesde=$4, cgradopara=$5, cpromoesta=$6
        WHERE cpromoid=$1 RETURNING cpromoid AS idregistro;`;
export const promoBorrar = `
        UPDATE public.tabpromo SET cpromoesta=$2 WHERE cpromoid=$1 RETURNING cpromoid AS idregistro;`;
export default {
  notaListar: notaListar,
  notaRegistrar: notaRegistrar,
  notaActualizar: notaActualizar,
  notaBorrar: notaBorrar,
  compestuListar: compestuListar,
  compestuRegistrar: compestuRegistrar,
  compestuBorrar: compestuBorrar,
  notadefListar: notadefListar,
  notadefRegistrar: notadefRegistrar,
  notadefBorrar: notadefBorrar,
  promdefListar: promdefListar,
  promdefRegistrar: promdefRegistrar,
  promdefBorrar: promdefBorrar,
  promasigListar: promasigListar,
  promasigRegistrar: promasigRegistrar,
  promasigBorrar: promasigBorrar,
  promoListar: promoListar,
  promoRegistrar: promoRegistrar,
  promoActualizar: promoActualizar,
  promoBorrar: promoBorrar
};
/**
 * notas.sql.js
 * Sentencias SQL del módulo de calificaciones: notas (tabnota), logros por estudiante
 * (tabcompestu), definitivas (tabnotadef), promedios definitivos (tabpromdef),
 * promedios por asignatura (tabpromasig) y promedios generales (tabpromo).
 */
