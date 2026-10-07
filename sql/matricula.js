export const listaSedes = `SELECT i.aeinst_id, u.aeusu_id, i.aeinst_nombre, i.aeinst_nit, i.aeinst_mail, 
    i.aeinst_direccion, i.aeinst_telefono, i.aeinst_escudo, i.coordx, i.coordy, i.aeinst_facebook,
    -- c.aeinstconf_anolectivo
    12 AS idanolectivo, a.aeano_descripcion AS anolectivo, i.codigo_cg1
    FROM data.aeinstituciones i, data.aeinstituciones_conf c, engine.aeusu u, data.aeano a
    WHERE i.aeinst_mail LIKE $1
    AND i.calendario LIKE $2
    AND u.aeusu_id=i.aeusu_id
    AND c.aeinst_id=i.aeinst_id
    AND c.aeinstconf_anolectivo=a.aeano_id
    ORDER BY aeinst_nombre;`;
export const listaEPS = `SELECT aeeps_id, aeeps_nombre
    FROM data.aeeps e
    WHERE aeeps_estado=$2 AND aeeps_tipo=$1
    ORDER BY aeeps_nombre;`;
export const listaGrados = `SELECT aegrados_id, aegrados_codigo, aegrados_descripcion
    FROM data.aegrados g
    WHERE aegrados_estado=$1
    ORDER BY aegrados_codigo;`;
export const listaSangre = `SELECT aegruposanguineo_id, aegruposanguineo_descripcion
    FROM data.aegruposanguineo g
    WHERE aegruposanguineo_estado=$1
    ORDER BY aegruposanguineo_descripcion;`;
export const listaPaises = `SELECT aeterritorios_id, aeterritorios_code, aeterritorios_descripcion
    FROM data.aeterritorios_paises g
    WHERE aeterritorios_estado=$1
    ORDER BY aeterritorios_descripcion;`;
export const listaProvincias = `SELECT aeterritoriosprovincias_id, aeterritoriosprovincias_descripcion
    FROM data.aeterritorios_provincias g
    WHERE aeterritorios_id=$1 AND aeterritoriosprovincias_estado=$2
    ORDER BY aeterritoriosprovincias_descripcion;`;
export const listaMupios = `SELECT aeterritoriosmupios_id, aeterritoriosmupios_descripcion
    FROM data.aeterritorios_mupios
    WHERE aeterritoriosprovincias_id=$1 AND aeterritoriosmupios_estado=$2
    ORDER BY aeterritoriosmupios_descripcion;`;
export const listaTipodocumento = `SELECT aetipodocumento_id, aetipodocumento_sigla, aetipodocumento_descripcion
    FROM data.aetipodocumento
    WHERE aetipodocumento_estado=$1
    ORDER BY aetipodocumento_sigla;`;
export const listaTipoempresa = `SELECT aetipoempresa_id, aetipoempresa_descripcion
    FROM data.aetipoempresa
    WHERE aetipoempresa_estado=$1
    ORDER BY aetipoempresa_descripcion;`;
export const listaEtnias = `SELECT aeetnias_id, aeetnias_descripcion
    FROM data.aeetnias
    WHERE aeetnias_estado=$1
    ORDER BY aeetnias_id, aeetnias_descripcion;`;
export const listaParentezco = `SELECT aeparentezco_id, aeparentezco_descripcion
    FROM data.aeparentezco
    WHERE aeparentezco_estado=$1
    ORDER BY aeparentezco_id, aeparentezco_descripcion;`;
export const insertarParentezco = `INSERT INTO data.aeparentezco
    (aeparentezco_descripcion, aeparentezco_estado)
    SELECT $1, 1 AS aeparentezco_estado
    WHERE 
      NOT EXISTS (
        SELECT aeparentezco_descripcion 
        FROM data.aeparentezco 
        WHERE aeparentezco_descripcion LIKE INITCAP($1)
      ) RETURNING aeparentezco_id;`;
export const listaCaracter = `SELECT aecaracter_id, aecaracter_descripcion
    FROM data.aecaracter
    WHERE aecaracter_estado=$1
    ORDER BY aecaracter_descripcion;`;
export const listaConocer = `SELECT aeconocer_id, aeconocer_descripcion
    FROM data.aeconocer
    WHERE aeconocer_estado=$1
    ORDER BY aeconocer_id;`;
export const listaJornada = `SELECT aejornada_id, aejornada_descripcion
    FROM data.aejornada
    WHERE aejornada_estado=$1
    ORDER BY aejornada_id;`;
export const listaDiscapacidades = `SELECT aediscapacidades_id, aediscapacidades_descripcion
    FROM data.aediscapacidades
    WHERE aediscapacidades_estado=$1
    ORDER BY aediscapacidades_id;`;
export const buscarMuchacho = `SELECT 
            e.aeinstitucion_id as sede, e.aeano_id as anolectivo, e.aeestudiantes_identificacion as estudianteidentificacion,
            e.aeestudiantes_mail as estudiantecorreo,  e.aeestudiantes_nombres as estudiantenombres, e.aeestudiantes_apellidos as estudianteapellidos,  
            e.aeestudiantes_telefono as estudiantetelefono, e.aeestudiantes_fechanacimiento as estudiantenacimiento, 
            e.aeusu_id as usuario, e.aeestudiantes_id as estudiante, a.aeacudientes_id as acudiente,
            a.aeestudiantes_mailacudiente as acudientecorreo, a.aeestudiantes_idenacudiente as acudienteidentificacion,
            a.aeestudiantes_nombresacudiente as acudientenombres, a.aeestudiantes_apellidosacudiente as acudienteapellidos,
            a.aeestudiantes_telefonoacudiente as acudientetelefono		
        FROM 
            data.aeestudiantes e, engine.aeusu u, engine.aeroll r, data.aeinstituciones x, engine.aeusuroll y,
            data.aeacudientes a
        WHERE 
            ($1)
        -- AND u.aeusu_estado=1 AND e.aeestudiantes_estado=1 
        AND u.aeroll_id = 3 AND y.aeroll_id=3
        AND u.aeusu_id=y.aeusu_id AND e.aeestudiantes_id=y.aeacad_referencia
        AND e.aeacudientes_id=a.aeacudientes_id
        AND r.aeroll_id = u.aeroll_id AND e.aeinstitucion_id=x.aeinst_id AND e.aeusu_id=u.aeusu_id`;
export const inscripcionEstudiante = `SELECT aeestudiantes_id as idestudiante, aeinstitucion_id as institucion, aeano_id as anolectivo, aeusu_id as usuario, 
    aeacudientes_id as acudiente, aeestudiantes_fecharegistro as fecharegistro, aeestudiantes_estado as estado, aeestudiantes_grado as grado, 
    aeestudiantes_grupo as grupo, aeestudiantes_nombres as nombres, aeestudiantes_apellidos as apellidos, aeestudiantes_tipodocumento as tipodocumento, 
    aeestudiantes_identificacion as identificacion, TO_CHAR(aeestudiantes_fechanacimiento, 'YYYY-MM-DD') as fechanacimiento, aeestudiantes_genero as genero, aeestudiantes_direccion as direccion, 
    aeestudiantes_telefono as telefono, aeestudiantes_mail as mail, aeestudiantes_codigo as codigo, aeestudiantes_jornada as jornada
    FROM data.aematriculas_estudiantes
    WHERE aeestudiantes_id=$1;`;
export const inscripcionEstudianteAcademico = `SELECT aeestudiantesacademia_id as idacademia, aeestudiantes_id as idestudiante, aeestudiantesacademia_nuevo as nuevo, aeestudiantesacademia_colegio_caracter as caracter, 
    aeestudiantesacademia_colegio_pais as pais, aeestudiantesacademia_colegio_provincia as provincia, aeestudiantesacademia_colegio_ciudad as ciudad, aeestudiantesacademia_gradomatricula as grado, 
    aeestudiantesacademia_repitente as repitente, aeestudiantesacademia_conocernos as conocernos, aeestudiantesacademia_conocernos_otro as conocernosotro
    FROM data.aematriculas_academia
    WHERE aeestudiantes_id=$1;`;
export const inscripcionEstudianteDemografico = `SELECT aeestudiantesdemografia_id as iddemografia, aeestudiantes_id as idestudiante, aeestudiantesdemografia_fecharegistro as fecharegistro, aeestudiantesdemografia_talla as talla, 
    aeestudiantesdemografia_peso as peso, aeestudiantesdemografia_gruposanguineo as gruposanguineo, aeestudiantesdemografia_rh as rh, aeestudiantesdemografia_discapacidad as discapacidad, 
    aeestudiantesdemografia_discapacidad_otra as discapacidadotra, aeestudiantesdemografia_sisben as sisben, aeestudiantesdemografia_sisbennivel as sisbennivel, aeestudiantesdemografia_eps as eps, 
    aeestudiantesdemografia_direccion as direccion, aeestudiantesdemografia_barrio as barrio, aeestudiantesdemografia_comuna as comuna, aeestudiantesdemografia_estrato as estrato, 
    aeestudiantesdemografia_mupionacimiento as mupionacimiento, aeestudiantesdemografia_deptonacimiento as deptonacimiento, aeestudiantesdemografia_paisnacimiento as paisnacimiento, aeestudiantesdemografia_desplazado as desplazado, 
    aeestudiantesdemografia_cantidadhermanos as cantidadhermanos, aeestudiantesdemografia_cantidadhermanas as cantidadhermanas, aeestudiantesdemografia_cirugias as cirugias, aeestudiantesdemografia_cirugias_cual as cirugiascual, 
    aeestudiantesdemografia_tratamientoterapia as tratamientoterapia, aeestudiantesdemografia_tratamientoterapia_cual as tratamientoterapiacual, aeestudiantesdemografia_etnia as etnia
    FROM data.aematriculas_demografia
    WHERE aeestudiantes_id=$1;`;
export const inscripcionEstudianteAdjuntos = `SELECT aeadjuntos_id as idadjunto, aeestudiantes_id as idestudiante, aeadjuntos_fecharegistro as fecharegistro, aeadjuntos_documentoestudiante as documentoestudiante, 
    aeadjuntos_documentootroestudiante as documentootroestudiante, aeadjuntos_documentoacudiente as documentoacudiente, aeadjuntos_documentoresponsable as documentoresponsable, aeadjuntos_fotoestudiante as fotoestudiante, 
    aeadjuntos_fotoacudiente as fotoacudiente, aeadjuntos_fotorespfinanciero as fotorespfinanciero, aeadjuntos_facturaservicios as facturaservicios, adjuntos_certificadomedico as certificadomedico, 
    aeadjuntos_vacunas as vacunas, aeadjuntos_epsafiliacion as epsafiliacion, aeadjuntos_pagadamatricula as pagadamatricula, aeadjuntos_pagadaotroscostos as pagadaotroscostos, 
    aeadjuntos_contrato as contrato, aeadjuntos_pagare as pagare, aeadjuntos_cartalaboral as cartalaboral
    FROM data.aematriculas_adjuntos
    WHERE aeestudiantes_id=$1;`;
export const inscripcionEstudianteAcudiente = `SELECT a.aeacudientes_id as idacudiente, a.aeusu_id as usuario, a.aeacudientes_nombres as nombres, a.aeacudientes_apellidos as apellidos, 
    a.aeacudientes_tipoidentificacion as tipoidentificacion, a.aeacudientes_identificacion as identificacion, a.aeacudientes_telresidencia as telresidencia, a.aeacudientes_celpersonal as celpersonal, 
    a.aeacudientes_empresatelefono as empresatelefono, a.aeacudientes_mail as mail, a.aeacudientes_empresa as empresa, a.aeacudientes_empresacargo as empresacargo, 
    a.aeacudientes_empresadireccion as empresadireccion, a.aeacudientes_empresario as empresario, a.aeacudientes_empresariotipo as empresariotipo, a.aeacudientes_parentezcootro as parentezcootro,
    x.aeestuacu_id, x.aeestuacu_fecharegistro as fecharegistro, x.aeestudiantes_id, x.aeacudientes_id, 
    x.aeestuacu_parentezco as parentezco, x.aeestuacu_presente as presente, x.aeestuacu_acudiente as esacudiente, 
    x.aeestuacu_responsablefinanciero as esresponsablefinanciero, x.aeestuacu_estado
    FROM data.estudiantes_acudientes x, data.aematriculas_acudientes a
    WHERE x.aeestudiantes_id=$1
    AND x.aeacudientes_id=a.aeacudientes_id;`;
export const inscripcionBuscarDeuda = `SELECT p.aeporcobrar_estudiante AS estudiante, p.aeporcobrar_deuda AS deuda 
    FROM cartera.aeporcobrar p
    WHERE p.aeporcobrar_codigo LIKE $1
    ORDER BY LENGTH(p.aeporcobrar_estudiante);`;
export const inscripcionBuscarCostos = `SELECT x.aecostosconceptos_descripcion AS concepto,
    cast(c.aecostosacademicos_valor AS money) AS valor,
    c.aecostosacademicos_fecha AS fecha
    FROM cartera.aecostosacademicos c, cartera.aecostosconceptos x
    WHERE c.aeanol_id = $1
    AND c.aeinst_id = $2
    AND c.aegrados_id = $3
    AND c.aeestudiante_nuevo = $4
    AND c.aecostosconceptos_id = x.aecostosconceptos_id
    ORDER BY fecha;`;
export default {
  listaSedes: listaSedes,
  listaEPS: listaEPS,
  listaGrados: listaGrados,
  listaSangre: listaSangre,
  listaPaises: listaPaises,
  listaProvincias: listaProvincias,
  listaMupios: listaMupios,
  listaTipodocumento: listaTipodocumento,
  listaTipoempresa: listaTipoempresa,
  listaEtnias: listaEtnias,
  listaParentezco: listaParentezco,
  insertarParentezco: insertarParentezco,
  listaCaracter: listaCaracter,
  listaConocer: listaConocer,
  listaJornada: listaJornada,
  listaDiscapacidades: listaDiscapacidades,
  buscarMuchacho: buscarMuchacho,
  inscripcionEstudiante: inscripcionEstudiante,
  inscripcionEstudianteAcademico: inscripcionEstudianteAcademico,
  inscripcionEstudianteDemografico: inscripcionEstudianteDemografico,
  inscripcionEstudianteAdjuntos: inscripcionEstudianteAdjuntos,
  inscripcionEstudianteAcudiente: inscripcionEstudianteAcudiente,
  inscripcionBuscarDeuda: inscripcionBuscarDeuda,
  inscripcionBuscarCostos: inscripcionBuscarCostos
};
