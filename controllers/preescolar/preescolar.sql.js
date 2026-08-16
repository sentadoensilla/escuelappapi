/**
 * preescolar.sql.js
 * Sentencias SQL del módulo de preescolar (esquema preescolar):
 * ámbitos (tabpreambi), dimensiones (tabpredime), asignaciones (tabpreasig),
 * notas (tabprenota) y novedades (tabprenove).
 */
module.exports = {

    // ================= ÁMBITOS (preescolar.tabpreambi) =================
    ambitoListar: `
        SELECT cambiid AS idregistro, cambicode AS codigo, cambidesc AS descripcion,
               cambicome AS comentario, cambiesta AS idestado
        FROM preescolar.tabpreambi ORDER BY cambidesc;`,
    ambitoRegistrar: `
        INSERT INTO preescolar.tabpreambi (cambiid, cambicode, cambidesc, cambicome, cambiesta)
        VALUES ((SELECT COALESCE(MAX(cambiid)+1, 1) FROM preescolar.tabpreambi), $1, $2, $3, $4)
        RETURNING cambiid AS idregistro;`,
    ambitoActualizar: `
        UPDATE preescolar.tabpreambi SET cambicode=$2, cambidesc=$3, cambicome=$4, cambiesta=$5
        WHERE cambiid=$1 RETURNING cambiid AS idregistro;`,
    ambitoBorrar: `
        UPDATE preescolar.tabpreambi SET cambiesta=$2 WHERE cambiid=$1 RETURNING cambiid AS idregistro;`,

    // ================= DIMENSIONES (preescolar.tabpredime) =================
    dimensionListar: `
        SELECT cdimeid AS idregistro, cdimecode AS codigo, cdimedesc AS descripcion,
               cdimecome AS comentario, cdimeabre AS abreviatura, cdimeesta AS idestado
        FROM preescolar.tabpredime ORDER BY cdimedesc;`,
    dimensionRegistrar: `
        INSERT INTO preescolar.tabpredime (cdimeid, cdimecode, cdimedesc, cdimecome, cdimeabre, cdimeesta)
        VALUES ((SELECT COALESCE(MAX(cdimeid)+1, 1) FROM preescolar.tabpredime), $1, $2, $3, $4, $5)
        RETURNING cdimeid AS idregistro;`,
    dimensionActualizar: `
        UPDATE preescolar.tabpredime SET cdimecode=$2, cdimedesc=$3, cdimecome=$4, cdimeabre=$5, cdimeesta=$6
        WHERE cdimeid=$1 RETURNING cdimeid AS idregistro;`,
    dimensionBorrar: `
        UPDATE preescolar.tabpredime SET cdimeesta=$2 WHERE cdimeid=$1 RETURNING cdimeid AS idregistro;`,

    // ================= ASIGNACIONES (preescolar.tabpreasig) =================
    asignacionListar: `
        SELECT a.cpreasigid AS idregistro, a.cambiid AS idambito, a.cdimeid AS iddimension,
               a.ccursid AS idcurso, a.cdoceid AS iddocente, a.cpreasigfechregi AS fecharegistro,
               a.casigdura AS duracion, a.cpreasigsesta AS idestado,
               b.cambidesc AS ambito, d.cdimedesc AS dimension, c.ccursnomb AS curso,
               doc.cdoceapel || ' ' || doc.cdocenomb AS docente
        FROM preescolar.tabpreasig a
        LEFT JOIN preescolar.tabpreambi b ON (b.cambiid = a.cambiid)
        LEFT JOIN preescolar.tabpredime d ON (d.cdimeid = a.cdimeid)
        LEFT JOIN public.tabcurs c ON (c.ccursid = a.ccursid)
        LEFT JOIN public.tabdoce doc ON (doc.cdoceid = a.cdoceid)
        ORDER BY b.cambidesc, d.cdimedesc;`,
    asignacionRegistrar: `
        INSERT INTO preescolar.tabpreasig (cpreasigid, cambiid, cdimeid, ccursid, cdoceid, cpreasigfechregi, casigdura, cpreasigsesta)
        VALUES ((SELECT COALESCE(MAX(cpreasigid)+1, 1) FROM preescolar.tabpreasig), $1, $2, $3, $4, CURRENT_DATE, $5, $6)
        RETURNING cpreasigid AS idregistro;`,
    asignacionActualizar: `
        UPDATE preescolar.tabpreasig SET cambiid=$2, cdimeid=$3, ccursid=$4, cdoceid=$5, casigdura=$6, cpreasigsesta=$7
        WHERE cpreasigid=$1 RETURNING cpreasigid AS idregistro;`,
    asignacionBorrar: `
        UPDATE preescolar.tabpreasig SET cpreasigsesta=$2 WHERE cpreasigid=$1 RETURNING cpreasigid AS idregistro;`,

    // ================= NOTAS (preescolar.tabprenota) =================
    notaListar: `
        SELECT n.cprenotaid AS idregistro, n.cpreasigid AS idasignacion, n.ccompid AS idcompetencia,
               n.cperiid AS idperiodo, n.cmatrid AS idmatricula, n.cprenotavalo AS valor,
               n.cprenotafech AS fecha, n.cprenotaobse AS observacion, n.cprenotaesta AS idestado,
               e.cestuapel || ' ' || e.cestunomb AS estudiante
        FROM preescolar.tabprenota n
        LEFT JOIN public.tabmatr m ON (m.cmatrid = n.cmatrid)
        LEFT JOIN public.tabestu e ON (e.cestuid = m.cestuid)
        WHERE ($1::integer IS NULL OR n.cmatrid = $1)
        ORDER BY n.cprenotafech DESC;`,
    notaRegistrar: `
        INSERT INTO preescolar.tabprenota (cprenotaid, cpreasigid, ccompid, cperiid, cmatrid, cprenotavalo, cprenotafech, cprenotafechregi, cprenotaobse, cprenotaesta)
        VALUES ((SELECT COALESCE(MAX(cprenotaid)+1, 1) FROM preescolar.tabprenota), $1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, $7, $8)
        RETURNING cprenotaid AS idregistro;`,
    notaBorrar: `
        UPDATE preescolar.tabprenota SET cprenotaesta=$2 WHERE cprenotaid=$1 RETURNING cprenotaid AS idregistro;`,

    // ================= NOVEDADES (preescolar.tabprenove) =================
    novedadListar: `
        SELECT n.cprenoveid AS idregistro, n.cpreasigid AS idasignacion, n.cperiid AS idperiodo,
               n.cmatrid AS idmatricula, n.cprenovefech AS fecha, n.cprenoveobse AS observacion,
               n.cpretiponoveid AS idtiponovedad, n.cprenoveesta AS idestado,
               e.cestuapel || ' ' || e.cestunomb AS estudiante, t.ctiponovedesc AS tiponovedad
        FROM preescolar.tabprenove n
        LEFT JOIN public.tabmatr m ON (m.cmatrid = n.cmatrid)
        LEFT JOIN public.tabestu e ON (e.cestuid = m.cestuid)
        LEFT JOIN public.tabtiponove t ON (t.ctiponoveid = n.cpretiponoveid)
        WHERE ($1::integer IS NULL OR n.cmatrid = $1)
        ORDER BY n.cprenovefech DESC;`,
    novedadRegistrar: `
        INSERT INTO preescolar.tabprenove (cprenoveid, cpreasigid, cperiid, cmatrid, cprenovefech, cprenovefechregi, cprenoveobse, cpretiponoveid, cprenoveesta)
        VALUES ((SELECT COALESCE(MAX(cprenoveid)+1, 1) FROM preescolar.tabprenove), $1, $2, $3, $4, CURRENT_TIMESTAMP, $5, $6, $7)
        RETURNING cprenoveid AS idregistro;`,
    novedadBorrar: `
        UPDATE preescolar.tabprenove SET cprenoveesta=$2 WHERE cprenoveid=$1 RETURNING cprenoveid AS idregistro;`,
};
