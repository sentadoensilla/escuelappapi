export const verify = `
	-- VERIFICAR CREDENCIALES DEL USUARIO (SAE: logic.tabusua + logic.tabroll + public.tabunio)
		SELECT
			u.cusuaid, u.cusuanomb, u.cusuanick, u.cusuallave,
			u.cusuaroll, r.crollnomb, r.crollpagientr,
			t.cacadid, t.cunioid
		FROM
			logic.tabusua u
			JOIN logic.tabroll r ON (r.crollid = u.cusuaroll)
			LEFT JOIN public.tabunio t ON (t.cusuaid = u.cusuaid AND t.cunioesta = 8)
		WHERE
			u.cusuanick = $1
			AND u.cusuaesta = 8
			AND r.crollesta = 8;
		`;
export const inicio_Docente = `
	-- INICIO DE SESION DE DOCENTES, COORDINADORES Y SECRETARIAS (SAE: public.tabdoce + public.tabinstdoce)
		SELECT
			d.cdoceid, d.cdocenomb || ' ' || COALESCE(d.cdocenomb2,'') || ' ' || d.cdoceapel || ' ' || COALESCE(d.cdoceapel2,'') AS Nombre_Completo,
			d.cdoceiden, d.cdocetele, d.cdoceemai, d.cdocefoto,
			i.cinstid, i.cinstnomb, i.cinstnit, i.cinstlema, i.cinstescu, i.cinsttele, i.cinstemai, i.cinstdire,
			u.cusuaid, u.cusuanick, u.cusuanomb, u.cusuaroll, r.crollnomb,
			a.canolid, a.canoldesc, ap.anolperiid, ap.anolperidesc,
			'/dashteacher' AS aeroll_index
		FROM
			logic.tabusua u
			JOIN logic.tabroll r ON (r.crollid = u.cusuaroll)
			JOIN public.tabunio t ON (t.cusuaid = u.cusuaid AND t.cunioesta = 8)
			JOIN public.tabdoce d ON (d.cdoceid = t.cacadid)
			JOIN public.tabinstdoce id ON (id.cdoceid = d.cdoceid AND id.cinstdoceesta = 8)
			JOIN public.tabinst i ON (i.cinstid = id.cinstid)
			LEFT JOIN public.anolperi ap ON (ap.cinstid = i.cinstid AND ap.anolperiesta = 7)
			LEFT JOIN public.tabanol a ON (a.canolid = ap.canolid)
		WHERE
			u.cusuanick = $1 -- ARGUMENTO USUARIO
			AND u.cusuaroll = $2 -- ARGUMENTO ROL (2 docente, 6 coordinador, 7 secretaria)
			AND u.cusuaesta = 8 AND r.crollesta = 8 AND d.cdoceesta = 8 AND i.cinstesta = 8
		ORDER BY id.cinstdocefechregi DESC, ap.anolperiid DESC
		LIMIT 1;
	`;
export const inicio_estudiante = `
	-- INICIO DE SESION DE ESTUDIANTES (SAE: public.tabestu + public.tabmatr + public.tabcurs)
		SELECT
			e.cestuid, e.cestunomb || ' ' || COALESCE(e.cestunomb2,'') || ' ' || e.cestuapel || ' ' || COALESCE(e.cestuapel2,'') AS Estudiante,
			e.cestuiden, e.cestufechnaci, e.cestutele, e.cestuemai,
			g.cgradid, g.cgraddesc, c.ccursnomb,
			i.cinstid, i.cinstnomb, i.cinstnit, i.cinstlema, i.cinstescu, i.cinsttele, i.cinstemai, i.cinstdire,
			u.cusuaid, u.cusuanick, u.cusuanomb, u.cusuaroll, r.crollnomb,
			a.canolid, a.canoldesc, ap.anolperiid, ap.anolperidesc,
			'/dashstudent' AS aeroll_index
		FROM
			logic.tabusua u
			JOIN logic.tabroll r ON (r.crollid = u.cusuaroll)
			JOIN public.tabunio t ON (t.cusuaid = u.cusuaid AND t.cunioesta = 8)
			JOIN public.tabestu e ON (e.cestuid = t.cacadid)
			JOIN public.tabmatr m ON (m.cestuid = e.cestuid AND m.cmatresta = 13)
			JOIN public.tabcurs c ON (c.ccursid = m.ccursid)
			JOIN public.tabgrad g ON (g.cgradid = c.cgradid)
			JOIN public.tabinst i ON (i.cinstid = m.cmatrinst)
			LEFT JOIN public.anolperi ap ON (ap.cinstid = i.cinstid AND ap.anolperiesta = 7)
			LEFT JOIN public.tabanol a ON (a.canolid = ap.canolid)
		WHERE
			u.cusuanick = $1 -- ARGUMENTO USUARIO
			AND u.cusuaroll = $2 -- ARGUMENTO ROL (1 estudiante)
			AND u.cusuaesta = 8 AND r.crollesta = 8 AND e.cestuesta = 8 AND i.cinstesta = 8
		ORDER BY ap.anolperiid DESC, m.cmatrid DESC
		LIMIT 1;
	`;
export const inicio_institucion = `
	-- INICIO DE SESION DE LA INSTITUCION (SAE: public.tabinst)
		SELECT
			i.cinstid, i.cinstnomb, i.cinstnit, i.cinstlema, i.cinstescu, i.cinsttele, i.cinstemai, i.cinstdire,
			u.cusuaid, u.cusuanick, u.cusuanomb, u.cusuaroll, r.crollnomb,
			a.canolid, a.canoldesc, ap.anolperiid, ap.anolperidesc,
			'/academic' AS aeroll_index
		FROM
			logic.tabusua u
			JOIN logic.tabroll r ON (r.crollid = u.cusuaroll)
			JOIN public.tabunio t ON (t.cusuaid = u.cusuaid AND t.cunioesta = 8)
			JOIN public.tabinst i ON (i.cinstid = t.cacadid)
			LEFT JOIN public.anolperi ap ON (ap.cinstid = i.cinstid AND ap.anolperiesta = 7)
			LEFT JOIN public.tabanol a ON (a.canolid = ap.canolid)
		WHERE
			u.cusuanick = $1 -- ARGUMENTO USUARIO
			AND u.cusuaroll = $2 -- ARGUMENTO ROL (3 institucion)
			AND u.cusuaesta = 8 AND r.crollesta = 8 AND i.cinstesta = 8
		ORDER BY ap.anolperiid DESC
		LIMIT 1;
	`;
export const inicio_acudiente = `
	-- INICIO DE SESION DE ACUDIENTES (SAE: public.tabestuacud + public.tabmatr)
		SELECT
			a.cestuacudid, a.cestuacudnomb AS Nombre_Completo, a.cestuacudiden, a.cestuacudtele, a.cestuacuddire, a.cestuacudemai,
			i.cinstid, i.cinstnomb, i.cinstnit, i.cinstlema, i.cinstescu, i.cinsttele, i.cinstemai, i.cinstdire,
			u.cusuaid, u.cusuanick, u.cusuanomb, u.cusuaroll, r.crollnomb,
			al.canolid, al.canoldesc, ap.anolperiid, ap.anolperidesc,
			'/dashstudent' AS aeroll_index
		FROM
			logic.tabusua u
			JOIN logic.tabroll r ON (r.crollid = u.cusuaroll)
			JOIN public.tabunio t ON (t.cusuaid = u.cusuaid AND t.cunioesta = 8)
			JOIN public.tabestuacud a ON (a.cestuacudid = t.cacadid)
			JOIN public.tabmatr m ON (m.cmatrid = a.cmatrid)
			JOIN public.tabinst i ON (i.cinstid = m.cmatrinst)
			LEFT JOIN public.anolperi ap ON (ap.cinstid = i.cinstid AND ap.anolperiesta = 7)
			LEFT JOIN public.tabanol al ON (al.canolid = ap.canolid)
		WHERE
			u.cusuanick = $1 -- ARGUMENTO USUARIO
			AND u.cusuaroll = $2 -- ARGUMENTO ROL (4 acudiente)
			AND u.cusuaesta = 8 AND r.crollesta = 8 AND a.cestuacudesta = 8 AND i.cinstesta = 8
		ORDER BY ap.anolperiid DESC, a.cestuacudid DESC
		LIMIT 1;
	`;
export const inicio_administrador = `
	-- INICIO DE SESION DEL ADMINISTRADOR DE SISTEMA (SAE: logic.tabusua rol 0)
		SELECT
			u.cusuaid, u.cusuanomb, u.cusuanick, u.cusuaroll, r.crollnomb,
			a.canolid, a.canoldesc,
			'/dashboardadmon' AS aeroll_index
		FROM
			logic.tabusua u
			JOIN logic.tabroll r ON (r.crollid = u.cusuaroll)
			LEFT JOIN LATERAL (
				SELECT x.canolid, x.canoldesc FROM public.tabanol x WHERE x.canolesta = 7 LIMIT 1
			) a ON true
		WHERE
			u.cusuanick = $1 -- ARGUMENTO USUARIO
			AND u.cusuaroll = $2 -- ARGUMENTO ROL (0 administrador)
			AND u.cusuaesta = 8 AND r.crollesta = 8
		LIMIT 1;
	`;
export const privilegees = `
	-- MENUS HABILITADOS PARA UN USUARIO SEGUN SU USUARIOID (SAE)
	-- Fuente: logic.tabmenu + logic.tabopcimenu + logic.tabrollopci (privilegios por rol) + logic.tabusuaopci (privilegios por usuario).
	-- Replica la lógica de la función get_keys() del SAE original.
		SELECT
			a.cmenuid AS aemenu_id, a.cmenunomb AS aemenu_nombre,
			COALESCE((
				SELECT b0.copcimenuicon FROM logic.tabopcimenu b0
				WHERE b0.copcimenumenu = a.cmenuid AND b0.copcimenuesta <> 2
				ORDER BY b0.copcimenuorde, b0.copcimenuid
				LIMIT 1
			), 'fa fa-folder-open') AS aemenu_icono,
			json_agg(json_build_object(
					'opcion', b.copcimenunomb,
					'enlace', '/' || b.copcimenuenla,
					'orden', b.copcimenuorde,
					'icono', b.copcimenuicon
				) ORDER BY b.copcimenuorde, b.copcimenuid
			) AS opciones
		FROM
			logic.tabmenu a, logic.tabopcimenu b,
			(
				-- Privilegios por rol (logic.tabrollopci) menos las opciones negadas al usuario
				SELECT p.copcimenuid AS id
				FROM logic.tabopcimenu p, logic.tabrollopci rp, logic.tabroll ro, logic.tabusua u
				WHERE u.cusuaid = $1 AND u.cusuaroll = ro.crollid AND ro.crollesta <> 2
					AND rp.crollopciesta <> 2 AND p.copcimenuesta <> 2
					AND p.copcimenuid = rp.copcimenuid AND ro.crollid = rp.crollid
				EXCEPT
				SELECT p.copcimenuid AS id
				FROM logic.tabopcimenu p, logic.tabusuaopci up, logic.tabusua u
				WHERE u.cusuaid = $1 AND p.copcimenuesta <> 2
					AND up.cusuaopciesta = 2 AND u.cusuaesta <> 2
					AND p.copcimenuid = up.cusuaopciopcimenu AND u.cusuaid = up.cusuaopciusua
			UNION
				-- Privilegios por usuario (logic.tabusuaopci) menos las opciones negadas al rol
				SELECT p.copcimenuid AS id
				FROM logic.tabopcimenu p, logic.tabusuaopci up, logic.tabusua u
				WHERE u.cusuaid = $1 AND p.copcimenuesta <> 2
					AND up.cusuaopciesta <> 2 AND u.cusuaesta <> 2
					AND p.copcimenuid = up.cusuaopciopcimenu AND u.cusuaid = up.cusuaopciusua
				EXCEPT
				SELECT p.copcimenuid AS id
				FROM logic.tabopcimenu p, logic.tabrollopci rp, logic.tabroll ro, logic.tabusua u
				WHERE u.cusuaid = $1 AND p.copcimenuesta = 2
					AND rp.crollopciesta <> 2 AND ro.crollesta <> 2
					AND p.copcimenuid = rp.copcimenuid AND ro.crollid = rp.crollid
					AND u.cusuaroll = ro.crollid
			) as x -- privilegios

		WHERE
			a.cmenuesta = 1 AND b.copcimenuesta = 1 AND
			b.copcimenuid = x.id
			AND a.cmenuid = b.copcimenumenu
		GROUP BY a.cmenuid, a.cmenunomb, a.cmenuorde
		ORDER BY COALESCE(a.cmenuorde, 0), a.cmenuid;
	`;
export const migadepan = `
	-- REGISTRANDO LOS LLAMADOS A LAS FUNCIONES Y LOS DATOS DE LOS USUARIOS
   	INSERT INTO data.aelogdispositivos(
		aelogdispositivos_id, aeusu_id, aelogdispositivos_fecha, aelogdispositivos_target,
		aelogdispositivos_state, aelogdispositivos_ip, aelogdispositivos_model, aelogdispositivos_platform,
		aelogdispositivos_uuid, aelogdispositivos_version, aelogdispositivos_serial)
	VALUES ((SELECT COALESCE((MAX(aelogdispositivos_id)+1), 1) FROM data.aelogdispositivos), $1, $2, $3,
		$4, $5, $6, $7,
		$8, $9, $10);`;
export default {
  verify: verify,
  inicio_Docente: inicio_Docente,
  inicio_estudiante: inicio_estudiante,
  inicio_institucion: inicio_institucion,
  inicio_acudiente: inicio_acudiente,
  inicio_administrador: inicio_administrador,
  privilegees: privilegees,
  migadepan: migadepan
};
