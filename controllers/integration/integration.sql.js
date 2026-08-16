/**
 * integration.sql.js — Consultas del Integration Layer.
 * Lee entidades de SAE (source of truth) para Escuelapp y registra
 * accesos/envíos de comunicación.
 */
module.exports = {

    // ================= ADAPTERS DE IDENTIDAD =================
    // Acudiente → sus estudiantes (vía matrícula) + curso + contacto.
    identidadAcudiente: `
        SELECT a.cestuacudid, a.cestuacudnomb AS acudiente, a.cestuacudtele AS telefono,
               a.cestuacudemai AS email, a.cestuacudpare,
               m.cmatrid, m.cmatrinst AS idinstitucion, m.ccursid AS idcurso,
               e.cestuid, e.cestuiden AS identificacion,
               e.cestunomb || ' ' || e.cestuapel AS estudiante,
               c.ccursnomb AS curso
        FROM public.tabestuacud a
        JOIN public.tabmatr m ON (m.cmatrid = a.cmatrid)
        JOIN public.tabestu e ON (e.cestuid = m.cestuid)
        LEFT JOIN public.tabcurs c ON (c.ccursid = m.ccursid)
        WHERE a.cestuacudiden = $1
          AND a.cestuacudesta = 8
        ORDER BY e.cestuapel;`,

    // Destinatarios de una novedad/asistencia (tabnove) → acudientes con contacto.
    destinatariosNovedad: `
        SELECT n.cnoveid, n.cnovefech, n.cnoveobse, t.ctiponovedesc AS tiponovedad,
               m.cmatrid, m.cmatrinst AS idinstitucion, m.ccursid AS idcurso,
               e.cestuid, e.cestuiden AS identificacion,
               e.cestunomb || ' ' || e.cestuapel AS estudiante,
               a.cestuacudid, a.cestuacudnomb AS acudiente, a.cestuacudtele AS telefono,
               a.cestuacudemai AS email
        FROM public.tabnove n
        JOIN public.tabmatr m ON (m.cmatrid = n.cmatrid)
        JOIN public.tabestu e ON (e.cestuid = m.cestuid)
        JOIN public.tabestuacud a ON (a.cmatrid = m.cmatrid AND a.cestuacudesta = 8)
        LEFT JOIN public.tabtiponove t ON (t.ctiponoveid = n.ctiponoveid)
        WHERE n.cnoveid = $1
          AND (a.cestuacudtele IS NOT NULL AND a.cestuacudtele <> '');`,

    // Datos de la novedad (para la consulta posterior del enlace).
    datoNovedad: `
        SELECT n.cnoveid, n.cnovefech, n.cnoveobse, t.ctiponovedesc AS tiponovedad,
               e.cestuid, e.cestuiden AS identificacion,
               e.cestunomb || ' ' || e.cestuapel AS estudiante,
               c.ccursnomb AS curso, m.cmatrinst AS idinstitucion
        FROM public.tabnove n
        JOIN public.tabmatr m ON (m.cmatrid = n.cmatrid)
        JOIN public.tabestu e ON (e.cestuid = m.cestuid)
        LEFT JOIN public.tabcurs c ON (c.ccursid = m.ccursid)
        LEFT JOIN public.tabtiponove t ON (t.ctiponoveid = n.ctiponoveid)
        WHERE n.cnoveid = $1;`,

    // Datos del aviso/comunicado (tabavisroll).
    datoAviso: `
        SELECT cavisrollid, cavisorollusua AS usuario, cavisrolltitu AS titulo,
               cavisrollcont AS contenido, cavisrollfechregi AS fecharegistro,
               cavisrollesta AS estado
        FROM public.tabavisroll
        WHERE cavisrollid = $1;`,

    // Roles destino de un aviso (avisrolldest → logic.tabroll).
    rolesAviso: `
        SELECT d.crollid, r.crollnomb AS rol, d.cavisusuafechinic, d.cavisusuafechfina
        FROM public.avisrolldest d
        LEFT JOIN logic.tabroll r ON (r.crollid = d.crollid)
        WHERE d.cavisrollid = $1;`,

    // Acudientes demo (para probar el flujo de comunicado cuando no hay avisos).
    acudientesDemo: `
        SELECT a.cestuacudid, a.cestuacudnomb AS acudiente, a.cestuacudtele AS telefono,
               a.cestuacudemai AS email, m.cmatrid, m.cmatrinst AS idinstitucion,
               e.cestuid, e.cestunomb || ' ' || e.cestuapel AS estudiante
        FROM public.tabestuacud a
        JOIN public.tabmatr m ON (m.cmatrid = a.cmatrid)
        JOIN public.tabestu e ON (e.cestuid = m.cestuid)
        WHERE a.cestuacudesta = 8
          AND a.cestuacudtele ~ '^[0-9+]{7,}$'
        ORDER BY a.cestuacudid
        LIMIT $1;`,

    // ================= READ_MODEL (consulta posterior del enlace) =================
    // Notas del estudiante por periodo (tabnota → matrícula).
    consultarNotasEstudiante: `
        SELECT n.cnotaid, n.cnotavalo AS valor, n.cnotafech, n.cnotaobse,
               c.ccompdesc AS competencia, p.anolperidesc AS periodo
        FROM public.tabnota n
        LEFT JOIN public.tabcomp c ON (c.ccompid = n.ccompid)
        LEFT JOIN public.anolperi p ON (p.anolperiid = n.cperiid)
        WHERE n.cmatrid = $1
        ORDER BY n.cnotafech DESC
        LIMIT 50;`,

    // Asistencias del estudiante (novedades por matrícula).
    consultarNovedadesEstudiante: `
        SELECT n.cnoveid, n.cnovefech, n.cnoveobse, t.ctiponovedesc AS tiponovedad
        FROM public.tabnove n
        LEFT JOIN public.tabtiponove t ON (t.ctiponoveid = n.ctiponoveid)
        WHERE n.cmatrid = $1
        ORDER BY n.cnovefech DESC
        LIMIT 50;`,

    // ================= REGISTRO DE ACCESO (estadistica.tabhistvis) =================
    registrarAcceso: `
        INSERT INTO estadistica.tabhistvis (chistid, cusuatip, cusuaid, chistpage, chistfech, chisesta)
        VALUES ((SELECT COALESCE(MAX(chistid)+1, 1) FROM estadistica.tabhistvis), $1, $2, $3, CURRENT_TIMESTAMP, 8)
        RETURNING chistid;`,

    // ================= EMISOR WHATSAPP POR INSTITUCIÓN SAE =================
    // Resuelve el número de WhatsApp de la institución SAE (cinstid) mediante el
    // mapeo migracion.map_institucion → data.aeinstituciones → contact.emisor.
    resolverEmisor: `
        SELECT e.emisor AS numero, e.token, e.estado
        FROM migracion.map_institucion m
        JOIN contact.emisor e ON (e.idempresa = m.aeinst_id)
        WHERE m.cinstid = $1
        LIMIT 1;`,

    // Lista de instituciones SAE con su emisor mapeado (para configurar).
    institucionesConEmisor: `
        SELECT t.cinstid, t.cinstnomb AS nombre,
               m.aeinst_id,
               e.emisor AS numero_whatsapp, e.estado AS estado_emisor
        FROM public.tabinst t
        LEFT JOIN migracion.map_institucion m ON (m.cinstid = t.cinstid)
        LEFT JOIN contact.emisor e ON (e.idempresa = m.aeinst_id)
        ORDER BY t.cinstnomb
        LIMIT $1;`,

    // Actualiza el mapeo institución SAE <-> institución Escuelapp.
    upsertMapInstitucion: `
        INSERT INTO migracion.map_institucion (cinstid, aeinst_id)
        VALUES ($1, $2)
        ON CONFLICT (cinstid) DO UPDATE SET aeinst_id = EXCLUDED.aeinst_id;`,

    // ================= DETECCIÓN DE EVENTOS (proceso) =================
    // Novedades recientes aún no notificadas (sin registro en aelog_envios tipo 2).
    novedadesSinNotificar: `
        SELECT n.cnoveid, n.cmatrid, n.cnovefech, n.cnoveobse, t.ctiponovedesc AS tiponovedad,
               m.cmatrinst AS idinstitucion, e.cestuid, e.cestuiden AS identificacion,
               e.cestunomb || ' ' || e.cestuapel AS estudiante, c.ccursnomb AS curso
        FROM public.tabnove n
        JOIN public.tabmatr m ON (m.cmatrid = n.cmatrid)
        JOIN public.tabestu e ON (e.cestuid = m.cestuid)
        LEFT JOIN public.tabcurs c ON (c.ccursid = m.ccursid)
        LEFT JOIN public.tabtiponove t ON (t.ctiponoveid = n.ctiponoveid)
        WHERE n.cnoveesta = 8
          AND n.cnovefech >= ($1::timestamp - $2::interval)
          AND NOT EXISTS (SELECT 1 FROM data.aelog_envios l WHERE l.tipo = 2 AND l.idreferencia = n.cnoveid)
        ORDER BY n.cnoveid
        LIMIT $3;`,

    // Acudientes con contacto de una matrícula.
    acudientesDeMatricula: `
        SELECT a.cestuacudid, a.cestuacudnomb AS acudiente, a.cestuacudtele AS telefono,
               a.cestuacudemai AS email, a.cmatrid
        FROM public.tabestuacud a
        WHERE a.cmatrid = $1 AND a.cestuacudesta = 8
          AND (a.cestuacudtele IS NOT NULL AND a.cestuacudtele <> '');`,

    // Avisos recientes aún no notificados (sin registro en aelog_envios tipo 1).
    avisosSinNotificar: `
        SELECT cavisrollid AS idaviso, cavisrolltitu AS titulo, cavisrollcont AS contenido,
               cavisrollfechregi AS fecharegistro
        FROM public.tabavisroll
        WHERE cavisrollesta = 1
          AND NOT EXISTS (SELECT 1 FROM data.aelog_envios l WHERE l.tipo = 1 AND l.idreferencia = cavisrollid)
        ORDER BY cavisrollid
        LIMIT $1;`,
};
