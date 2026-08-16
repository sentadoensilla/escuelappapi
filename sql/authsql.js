
module.exports = {

	verify: `
		SELECT
			u.aeusu_id,u.aeusu_nick,u.aeusu_llave,
			u.aeroll_id,r.aeroll_nombre
		FROM
			engine.aeusu u, engine.aeroll r, engine.aeusuroll x
		WHERE 
			u.aeusu_nick = $1
			AND u.aeusu_id = x.aeusu_id 
			AND r.aeroll_id = x.aeroll_id;
		`,

	inicio_Docente: `
		SELECT
			d.aedocentes_id, u.aeusu_id, d.aedocentes_nombres || ' ' ||
			d.aedocentes_apellidos as Nombre_Completo,d.aedocentes_fechanacimiento,
			d.aedocentes_genero, d.aedocentes_direccion,d.aedocentes_telefono,
			d.aedocentes_mail,d.aedocentes_titulo,e.aeestados_descripcion,u.aeroll_id,
			d.aedocentes_foto,x.aeinst_id, x.aeusuroll_id, '' as asignatura, x.aeanol_id,
			r.aeroll_nombre, d.aedocentes_identificacion, i.aeinst_nombre, 
			i.aeinst_direccion, i.aeinst_mail, i.aeinst_telefono, i.aeinst_escudo, i.aeinst_lema, '/dashteacher' AS aeroll_index, -- r.aeroll_index,
			(x.aeinst_id ||'|'|| x.aeanol_id ||'|'|| d.aeusu_id ||'|'|| d.aedocentes_id ||'|'|| u.aeusu_nick ||'|'|| u.aeroll_id) AS token
		FROM
			data.aedocentes as d,engine.aeusu u,data.aeestados e, engine.aeusuroll x,
			data.aeinstituciones as i, engine.aeroll as r
		WHERE
			u.aeusu_nick = $1 -- ARGUMENTO USUARIO 
			AND u.aeusu_llave = $2 -- ARGUMENTO CLAVE 
			AND d.aedocentes_estado=1 
			AND u.aeusu_estado=1 
			AND x.aeusuroll_estado=1
			AND u.aeroll_id = $3
			AND u.aeroll_id = x.aeroll_id 
			AND d.aedocentes_estado = e.aeestados_id
			AND d.aedocentes_id = x.aeacad_referencia 
			AND u.aeusu_id=x.aeusu_id  
			AND i.aeinst_id=x.aeinst_id
			AND u.aeroll_id = r.aeroll_id
		GROUP BY
			d.aedocentes_id, u.aeusu_id, Nombre_Completo,d.aedocentes_fechanacimiento,
			d.aedocentes_genero, d.aedocentes_direccion,d.aedocentes_telefono,
			d.aedocentes_mail, u.aeusu_nick, d.aedocentes_titulo, e.aeestados_descripcion, u.aeroll_id,
			d.aedocentes_foto, x.aeinst_id, x.aeusuroll_id, asignatura, x.aeanol_id, r.aeroll_nombre, r.aeroll_index, 
			i.aeinst_nombre, i.aeinst_direccion, i.aeinst_mail, i.aeinst_telefono, i.aeinst_escudo, i.aeinst_lema;`,


	inicio_estudiante: `
		SELECT 
			e.aeestudiantes_id,e.aeinstitucion_id,
			e.aeestudiantes_grupo,e.aeestudiantes_nombres || ' ' || e.aeestudiantes_apellidos as Estudiante,
			e.aeestudiantes_identificacion, e.aeestudiantes_fechanacimiento,
			e.aeestudiantes_genero, e.aeestudiantes_direccion, e.aeestudiantes_telefono,
			u.aeusu_nick, e.aeestudiantes_estado,
			e.aeusu_id, u.aeroll_id, e.aeano_id, r.aeroll_nombre, x.aeinst_nombre, 
			x.aeinst_direccion, x.aeinst_mail,  y.aeusuroll_id,  x.aeinst_telefono, x.aeinst_escudo, x.aeinst_lema, '/dashstudent' AS aeroll_index, -- r.aeroll_index,
			(e.aeinstitucion_id ||'|'|| e.aeano_id ||'|'|| e.aeusu_id ||'|'|| e.aeestudiantes_grupo ||'|'|| e.aeestudiantes_id  ||'|'|| u.aeusu_nick ||'|'|| u.aeroll_id) as token,
			(
			  SELECT row_to_json(u) as conf
			  FROM (
							SELECT aeinstconf_id, c.aeinst_id, aeinstconf_anolectivo, 
							aeinstconf_mobile_comunications_notifier, aeinstconf_mobile_comunications_notifier_text, aeinstconf_mobile_query, 
							aeinstconf_mobile_query_text, aeinstconf_bitacora_comunications_notifier, aeinstconf_bitacora_comunications_notifier_text, 
							aeinstconf_pqr_notifier, aeinstconf_pqr_notifier_text, aeinstconf_comments_receivemail, 
							aeinstconf_pin_char, aeinstconf_pin_number, aeinstconf_excusas_limite, aeinstconf_asistencias_umbralweek
							FROM data.aeinstituciones_conf c
							WHERE c.aeinst_id=x.aeinst_id			
				) u
			) as conf
		FROM 
			data.aeestudiantes e, engine.aeusu u, engine.aeroll r, data.aeinstituciones x, engine.aeusuroll y
		WHERE 
			u.aeusu_nick = $1  -- ARGUMENTO USUARIO
			AND u.aeusu_llave = $2 -- ARGUMENTO CLAVE
			AND u.aeusu_estado=1 AND e.aeestudiantes_estado=1 AND r.aeroll_esta=1 AND y.aeusuroll_estado=1
			AND u.aeroll_id = $3
			AND u.aeusu_id=y.aeusu_id 
			AND e.aeestudiantes_id=y.aeacad_referencia
			AND r.aeroll_id = u.aeroll_id 
			AND e.aeinstitucion_id=x.aeinst_id 
			AND e.aeusu_id=u.aeusu_id
		GROUP BY
		x.aeinst_id,
		e.aeestudiantes_id,e.aeinstitucion_id,
		e.aeestudiantes_grupo,Estudiante,
		e.aeestudiantes_identificacion,e.aeestudiantes_fechanacimiento,
		e.aeestudiantes_genero,e.aeestudiantes_direccion,e.aeestudiantes_telefono,
		u.aeusu_nick,e.aeestudiantes_estado,e.aeusu_id,u.aeroll_id,e.aeano_id, r.aeroll_index, r.aeroll_nombre, x.aeinst_nombre, x.aeinst_direccion, 
		x.aeinst_mail, y.aeusuroll_id, x.aeinst_telefono, x.aeinst_escudo, x.aeinst_lema
	`,


	inicio_institucion: `
		SELECT
			x.aeusuroll_id, i.aeinst_id, u.aeusu_id, i.aeinst_nombre as Nombre_Completo,
			i.aeinst_direccion, i.aeinst_mail, e.aeestados_descripcion, u.aeroll_id,
			i.aeinst_escudo, x.aeinst_id, '' as asignatura, d.aeinstconf_anolectivo,
			r.aeroll_nombre, i.aeinst_nit, i.aeinst_nombre, 
			i.aeinst_direccion, i.aeinst_mail, i.aeinst_telefono, i.aeinst_escudo, i.aeinst_lema, r.aeroll_index,
			(x.aeinst_id ||'|'|| x.aeanol_id ||'|'|| i.aeusu_id ||'|'|| i.aeinst_id ||'|'|| u.aeusu_nick ||'|'|| u.aeroll_id) AS token
		FROM
			data.aeinstituciones as i LEFT JOIN data.aeinstituciones_conf as d
				ON (i.aeinst_id = d.aeinst_id )
			LEFT JOIN engine.aeusuroll x
				ON (i.aeinst_id = x.aeinst_id)
			LEFT JOIN engine.aeusu u
				ON (u.aeusu_id=x.aeusu_id)
			LEFT JOIN engine.aeroll r
				ON (x.aeroll_id = r.aeroll_id
					AND x.aeanol_id=d.aeinstconf_anolectivo
				)
			LEFT JOIN data.aeestados e
				ON (u.aeusu_estado = e.aeestados_id)
		WHERE
			u.aeusu_nick = $1 -- ARGUMENTO USUARIO 
			AND u.aeusu_llave = $2 -- ARGUMENTO CLAVE 
			AND u.aeroll_id = $3 -- EL ROLL DE LOS ADMIN DOCENTES
			AND u.aeusu_estado=1 
			AND x.aeusuroll_estado=1
		GROUP BY
			x.aeusuroll_id, i.aeinst_id, u.aeusu_id, i.aeinst_nombre,
			i.aeinst_direccion, i.aeinst_mail, e.aeestados_descripcion, u.aeroll_id,
			i.aeinst_escudo, x.aeinst_id, d.aeinstconf_anolectivo,
			r.aeroll_nombre, r.aeroll_index, i.aeinst_nit, i.aeinst_nombre, x.aeanol_id, u.aeusu_nick,
			i.aeinst_nombre, i.aeinst_direccion, i.aeinst_mail, i.aeinst_telefono, i.aeinst_escudo, i.aeinst_lema;`,

	inicio_administrador: `
		-- INICIO DE SESION DEL ADMINISTRADOR DE INSTITUCIONES
		SELECT
			u.aeusu_id, u.aeusu_nombre, u.aeusu_nick, u.aeroll_id, r.aeroll_nombre,
			ARRAY_AGG(i.aeinst_id) AS aeinst_id, ARRAY_AGG(i.aeusu_id) AS aeinst_aeusu_id, ARRAY_AGG(i.aeinst_nombre) as aeinst_nombre,
			ARRAY_AGG(i.aeinstconf_anolectivo) AS aeinst_anolectivo, ARRAY_AGG(i.aeinst_direccion) AS aeinst_direccion, 
			ARRAY_AGG(i.aeinst_mail) AS aeinst_mail, ARRAY_AGG(i.aeinst_telefono) AS aeinst_telefono, ARRAY_AGG(i.aeinst_escudo) AS aeinst_escudo,
			ARRAY_AGG(i.aeinst_nit) AS aeinst_nit, ARRAY_AGG(i.aeinst_lema) AS aeinst_lema, ARRAY_AGG(e.aeestados_descripcion) AS aeestados_descripcion,
			'/dashboaradmon' AS aeroll_index, -- r.aeroll_index,
			(u.aeusu_id ||'|'|| u.aeusu_nombre ||'|'|| u.aeusu_nick ||'|'|| u.aeroll_id ||'|'|| r.aeroll_nombre) AS token
		FROM
			(	SELECT 
					ii.aeinst_id, ii.aeusu_id, ii.aeinst_nombre, ii.aeinst_direccion, 
					ii.aeinst_nit, ii.aeinst_mail, ii.aeinst_escudo, d.aeinstconf_anolectivo,
					ii.aeinst_telefono, ii.aeinst_lema
				FROM 
					data.aeinstituciones_conf as d, data.aeinstituciones as ii
				WHERE ii.aeinst_id = d.aeinst_id
				GROUP BY 
					ii.aeinst_id, ii.aeusu_id, ii.aeinst_nombre, ii.aeinst_direccion, 
					ii.aeinst_nit, ii.aeinst_mail, ii.aeinst_escudo, d.aeinstconf_anolectivo,
					ii.aeinst_telefono, ii.aeinst_lema			
			) i, -- INSTITUCIONES QUE ESTAN BAJO LA TUTELA DEL ADMINISTRADOR
			engine.aeusu u, data.aeestados e, engine.aeusuroll x, engine.aeroll r
		WHERE
			u.aeusu_nick = $1 -- ARGUMENTO USUARIO 
			AND u.aeusu_llave = $2 -- ARGUMENTO CLAVE 
			AND u.aeroll_id = $3 -- EL ROLL DE LOS ADMIN DOCENTES
			AND u.aeusu_estado=1 
			AND x.aeusuroll_estado=1
			AND i.aeinst_id=x.aeinst_id
			AND i.aeinstconf_anolectivo=x.aeanol_id
			AND x.aeusu_id=u.aeusu_id
			AND x.aeroll_id = r.aeroll_id
			AND u.aeusu_estado = e.aeestados_id
		GROUP BY
			u.aeusu_id, u.aeusu_nombre, u.aeusu_nick, u.aeroll_id, r.aeroll_index, r.aeroll_nombre;`,

	privilegees: `
	-- MENUS HABILITADOS PARA UN USUARIO SEGUN SU USUARIOID
		SELECT 
		a.aemenu_id, a.aemenu_nombre, a.aemenu_icono,
			json_agg(json_build_object(
					'opcion', b.aeopcmenu_nombre, 
					'enlace', '/' || b.aeopcmenu_enlace, 
					'orden', b.aeopcmenu_orden, 
					'icono', b.aeopcmenu_icono
				)  ORDER BY b.aeopcmenu_orden
			) AS opciones
		FROM 
			engine.aemenu a, engine.aeopcmenu b,
			(
				SELECT S.aeopcmenu_id as id,S.aeopcmenu_enlace as laopcion 
				FROM engine.aeopcmenu S, engine.aeusuopc O 
				WHERE O.aeusu_id=$1 -- ARGUMENTO IDUSUARIO
				AND O.aeusuopc_estado=1 AND S.aeopcmenu_estado=1 
				AND S.aeopcmenu_id=O.aeopcmenu_id	
			UNION
				SELECT S.aeopcmenu_id as id,S.aeopcmenu_enlace as laopcion 
				FROM engine.aeopcmenu S, engine.aerollopc L
				WHERE L.aeroll_id IN (
					SELECT aeroll_id FROM engine.aeusuroll WHERE aeusu_id=$1 -- ARGUMENTO IDUSUARIO
					)
				AND S.aeopcmenu_estado=1 
				AND L.aerollopc_estado=1
				AND S.aeopcmenu_id=L.aeopcmenu_id
			) as x -- privilegios

		WHERE 
			a.aemenu_estado=1 AND b.aeopcmenu_estado=1 AND
			b.aeopcmenu_id = x.id
			AND a.aemenu_id = b.aemenu_id
		GROUP BY a.aemenu_id, a.aemenu_nombre, a.aemenu_icono --, b.aeopcmenu_nombre, b.aeopcmenu_enlace, b.aeopcmenu_orden, b.aeopcmenu_icono
		ORDER BY a.aemenu_orden;	
	`,

	migadepan: `
	-- REGISTRANDO LOS LLAMADOS A LAS FUNCIONES Y LOS DATOS DE LOS USUARIOS
   	INSERT INTO data.aelogdispositivos(
		aelogdispositivos_id, aeusu_id, aelogdispositivos_fecha, aelogdispositivos_target, 
		aelogdispositivos_state, aelogdispositivos_ip, aelogdispositivos_model, aelogdispositivos_platform, 
		aelogdispositivos_uuid, aelogdispositivos_version, aelogdispositivos_serial)
	VALUES ((SELECT COALESCE((MAX(aelogdispositivos_id)+1), 1) FROM data.aelogdispositivos), $1, $2, $3, 
		$4, $5, $6, $7, 
		$8, $9, $10);`
}