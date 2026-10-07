export const estudianteListar = `
        SELECT cestuid AS idregistro, ctipodocuid AS idtipodocumento, cestuiden AS identificacion,
               cestunomb AS nombre1, cestunomb2 AS nombre2, cestuapel AS apellido1, cestuapel2 AS apellido2,
               cestufechnaci AS fechanacimiento, cestutiposang AS idtiposangre, cestufoto AS foto,
               cestutele AS telefono, cestudire AS direccion, cestugene AS idgenero,
               cestuesta AS idestado, cestuemai AS email
        FROM public.tabestu
        ORDER BY cestuapel, cestunomb;`;
export const estudianteRegistrar = `
        INSERT INTO public.tabestu
            (cestuid, ctipodocuid, cestuiden, cestuidenexpemuni, cestuidenexpedepa, cestunomb, cestunomb2,
             cestuapel, cestuapel2, cestufechnaci, cestutiposang, cestufoto, cestutele, cestudire,
             cestuluganacidepa, cestuluganacimuni, cestugene, cestuesta, cestuemai)
        VALUES ((SELECT COALESCE(MAX(cestuid)+1, 1) FROM public.tabestu),
             $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING cestuid AS idregistro;`;
export const estudianteActualizar = `
        UPDATE public.tabestu
        SET ctipodocuid=$2, cestuiden=$3, cestunomb=$4, cestunomb2=$5, cestuapel=$6, cestuapel2=$7,
            cestufechnaci=$8, cestutiposang=$9, cestufoto=$10, cestutele=$11, cestudire=$12,
            cestugene=$13, cestuesta=$14, cestuemai=$15
        WHERE cestuid=$1
        RETURNING cestuid AS idregistro;`;
export const estudianteBorrar = `
        UPDATE public.tabestu SET cestuesta=$2 WHERE cestuid=$1 RETURNING cestuid AS idregistro;`;
export const matriculaListar = `
        SELECT m.cmatrid AS idregistro, m.cestuid AS idestudiante, m.ccursid AS idcurso,
               m.cmatrinst AS idinstitucion, m.cmatrfech AS fecha, m.cmatrnuevestu AS nuevo,
               m.cmatrirepi AS repitente, m.cmatrianopasasitu AS idestadoanterior,
               m.cmatrvaloinsc AS valorinscripcion, m.cmatrvalopens AS valorpension,
               m.cmatrdesc AS descuento, m.cmatresta AS idestado, m.cmatrianopasacond AS idestadocondicional,
               e.cestuapel || ' ' || e.cestunomb AS estudiante, c.ccursnomb AS curso
        FROM public.tabmatr m
        LEFT JOIN public.tabestu e ON (e.cestuid = m.cestuid)
        LEFT JOIN public.tabcurs c ON (c.ccursid = m.ccursid)
        WHERE ($1::integer IS NULL OR m.ccursid = $1)
        ORDER BY e.cestuapel;`;
export const matriculaRegistrar = `
        INSERT INTO public.tabmatr
            (cmatrid, cestuid, ccursid, cmatrinst, cmatrfech, cmatrnuevestu, cmatrirepi,
             cmatrianopasasitu, cmatrvaloinsc, cmatrvalopens, cmatrdesc, cmatresta, cmatrianopasacond)
        VALUES ((SELECT COALESCE(MAX(cmatrid)+1, 1) FROM public.tabmatr),
             $1, $2, $3, CURRENT_DATE, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING cmatrid AS idregistro;`;
export const matriculaActualizar = `
        UPDATE public.tabmatr
        SET ccursid=$2, cmatrnuevestu=$3, cmatrirepi=$4, cmatrianopasasitu=$5,
            cmatrvaloinsc=$6, cmatrvalopens=$7, cmatrdesc=$8, cmatresta=$9, cmatrianopasacond=$10
        WHERE cmatrid=$1
        RETURNING cmatrid AS idregistro;`;
export const matriculaBorrar = `
        UPDATE public.tabmatr SET cmatresta=$2 WHERE cmatrid=$1 RETURNING cmatrid AS idregistro;`;
export const acudienteListar = `
        SELECT a.cestuacudid AS idregistro, a.cmatrid AS idmatricula, a.cestuacudiden AS identificacion,
               a.cestuacudnomb AS nombre, a.cestuacudtele AS telefono, a.cestuacuddire AS direccion,
               a.cestuacudemai AS email, a.cestuacudpare AS idparentesco, a.cestuacudesta AS idestado
        FROM public.tabestuacud a
        WHERE ($1::integer IS NULL OR a.cmatrid = $1)
        ORDER BY a.cestuacudnomb;`;
export const acudienteRegistrar = `
        INSERT INTO public.tabestuacud
            (cestuacudid, cmatrid, cestuacudiden, cestuacudnomb, cestuacudtele, cestuacuddire, cestuacudemai, cestuacudpare, cestuacudesta)
        VALUES ((SELECT COALESCE(MAX(cestuacudid)+1, 1) FROM public.tabestuacud),
             $1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING cestuacudid AS idregistro;`;
export const acudienteBorrar = `
        UPDATE public.tabestuacud SET cestuacudesta=$2 WHERE cestuacudid=$1 RETURNING cestuacudid AS idregistro;`;
export const otrodatoListar = `
        SELECT cestuotrodatoid AS idregistro, cmatrid AS idmatricula,
               cestuotrodatoprovpriv AS provpriv, cestuotrodatosubs AS subsidio,
               cestuotrodatomadrhoga AS madrecabezahogar, cestuotrodatodisc AS iddiscapacidad,
               cestuotrodatocapa AS idcapacidad, cestuotrodatoetni AS idetnia,
               cestuotrodatofuerec AS idfuenterecursos, cestuotrodatonomicbf AS idicbf,
               cestuotrodatoesta AS idestado
        FROM public.tabestuotrodato
        WHERE ($1::integer IS NULL OR cmatrid = $1);`;
export const otrodatoRegistrar = `
        INSERT INTO public.tabestuotrodato
            (cestuotrodatoid, cmatrid, cestuotrodatoprovpriv, cestuotrodatosubs,
             cestuotrodatomadrhoga, cestuotrodatohijomadrhoga, cestuotrodatodisc,
             cestuotrodatocapa, cestuotrodatoetni, cestuotrodatoesta, cestuotrodatofuerec, cestuotrodatonomicbf)
        VALUES ((SELECT COALESCE(MAX(cestuotrodatoid)+1, 1) FROM public.tabestuotrodato),
             $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING cestuotrodatoid AS idregistro;`;
export const socieconListar = `
        SELECT cestusocieconid AS idregistro, cmatrid AS idmatricula,
               cestusocieconzonaresi AS idzonaresidencia, cestusocieconestr AS idestrato,
               cestusocieconsisb AS idsisben, cestusociecondeparesi AS iddepartamento,
               cestusocieconmuniresi AS idmunicipio, cestusocieconvictconf AS idconflicto,
               cestusocieconmuniprov AS idmunicipioprocedencia, cestusocieconesta AS idestado
        FROM public.tabestusociecon
        WHERE ($1::integer IS NULL OR cmatrid = $1);`;
export const socieconRegistrar = `
        INSERT INTO public.tabestusociecon
            (cestusocieconid, cmatrid, cestusocieconzonaresi, cestusocieconestr, cestusocieconsisb,
             cestusociecondeparesi, cestusocieconmuniresi, cestusocieconvictconf, cestusocieconmuniprov, cestusocieconesta)
        VALUES ((SELECT COALESCE(MAX(cestusocieconid)+1, 1) FROM public.tabestusociecon),
             $1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING cestusocieconid AS idregistro;`;
export const pagoListar = `
        SELECT cmatrpagoid AS idregistro, cmatrid AS idmatricula, cmatrpagoperi AS periodo,
               cmatrpagofech AS fecha, cmatrpagoesta AS idestado
        FROM public.tabmatrpago
        WHERE ($1::integer IS NULL OR cmatrid = $1)
        ORDER BY cmatrpagofech;`;
export const pagoRegistrar = `
        INSERT INTO public.tabmatrpago (cmatrpagoid, cmatrid, cmatrpagoperi, cmatrpagofech, cmatrpagoesta)
        VALUES ((SELECT COALESCE(MAX(cmatrpagoid)+1, 1) FROM public.tabmatrpago), $1, $2, $3, $4)
        RETURNING cmatrpagoid AS idregistro;`;
export const pagoBorrar = `
        UPDATE public.tabmatrpago SET cmatrpagoesta=$2 WHERE cmatrpagoid=$1 RETURNING cmatrpagoid AS idregistro;`;
export const promoverMatriculas = `
        INSERT INTO public.tabmatr
            (cmatrid, cestuid, ccursid, cmatrinst, cmatrfech, cmatrnuevestu, cmatrirepi,
             cmatrianopasasitu, cmatrvaloinsc, cmatrvalopens, cmatrdesc, cmatresta, cmatrianopasacond)
        SELECT (SELECT COALESCE(MAX(m.cmatrid), 0) FROM public.tabmatr m) + ROW_NUMBER() OVER (ORDER BY t.cmatrid),
               t.cestuid, $2, t.cmatrinst, CURRENT_DATE, false, false,
               t.cmatrianopasasitu, 0, 0, 0, 13, NULL
        FROM public.tabmatr t
        WHERE t.ccursid = $1 AND t.cmatresta = 13
        RETURNING cmatrid;`;
export const matricularOrigenTraslado = `
        UPDATE public.tabmatr SET cmatresta = 14 WHERE ccursid = $1 AND cmatresta = 13;`;
export default {
  estudianteListar: estudianteListar,
  estudianteRegistrar: estudianteRegistrar,
  estudianteActualizar: estudianteActualizar,
  estudianteBorrar: estudianteBorrar,
  matriculaListar: matriculaListar,
  matriculaRegistrar: matriculaRegistrar,
  matriculaActualizar: matriculaActualizar,
  matriculaBorrar: matriculaBorrar,
  acudienteListar: acudienteListar,
  acudienteRegistrar: acudienteRegistrar,
  acudienteBorrar: acudienteBorrar,
  otrodatoListar: otrodatoListar,
  otrodatoRegistrar: otrodatoRegistrar,
  socieconListar: socieconListar,
  socieconRegistrar: socieconRegistrar,
  pagoListar: pagoListar,
  pagoRegistrar: pagoRegistrar,
  pagoBorrar: pagoBorrar,
  promoverMatriculas: promoverMatriculas,
  matricularOrigenTraslado: matricularOrigenTraslado
};
/**
 * estudiantes.sql.js
 * Sentencias SQL del módulo de estudiantes SAE: estudiantes (tabestu), matrícula
 * (tabmatr), acudientes (tabestuacud), otros datos (tabestuotrodato),
 * datos socioeconómicos (tabestusociecon) y pagos (tabmatrpago).
 */
