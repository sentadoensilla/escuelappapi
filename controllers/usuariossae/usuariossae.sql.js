export const usuarioListar = `
        SELECT u.cusuaid AS idregistro, u.cusuanomb AS nombre, u.cusuanick AS nick,
               u.cusuaroll AS idrol, u.cusuaesta AS idestado, r.crollnomb AS rol
        FROM logic.tabusua u
        LEFT JOIN logic.tabroll r ON (r.crollid = u.cusuaroll)
        ORDER BY u.cusuanick;`;
export const usuarioRegistrar = `
        INSERT INTO logic.tabusua (cusuaid, cusuanomb, cusuanick, cusuallave, cusuaroll, cusuaesta)
        VALUES ((SELECT COALESCE(MAX(cusuaid)+1, 1) FROM logic.tabusua), $1, $2, $3, $4, $5)
        RETURNING cusuaid AS idregistro;`;
export const usuarioActualizar = `
        UPDATE logic.tabusua SET cusuanomb=$2, cusuanick=$3, cusuaroll=$4, cusuaesta=$5
        WHERE cusuaid=$1 RETURNING cusuaid AS idregistro;`;
export const usuarioClave = `
        UPDATE logic.tabusua SET cusuallave=$2 WHERE cusuaid=$1 RETURNING cusuaid AS idregistro;`;
export const usuarioBorrar = `
        UPDATE logic.tabusua SET cusuaesta=$2 WHERE cusuaid=$1 RETURNING cusuaid AS idregistro;`;
export const rolListar = `
        SELECT crollid AS idregistro, crollnomb AS nombre, crolldesc AS descripcion,
               crollpagientr AS paginaentrada, cenlaid AS idenlace, crollesta AS idestado
        FROM logic.tabroll
        ORDER BY crollid;`;
export const rolRegistrar = `
        INSERT INTO logic.tabroll (crollid, crollnomb, crolldesc, crollpagientr, cenlaid, crollesta)
        VALUES ((SELECT COALESCE(MAX(crollid)+1, 1) FROM logic.tabroll), $1, $2, $3, $4, $5)
        RETURNING crollid AS idregistro;`;
export const rolActualizar = `
        UPDATE logic.tabroll SET crollnomb=$2, crolldesc=$3, crollpagientr=$4, cenlaid=$5, crollesta=$6
        WHERE crollid=$1 RETURNING crollid AS idregistro;`;
export const rolBorrar = `
        UPDATE logic.tabroll SET crollesta=$2 WHERE crollid=$1 RETURNING crollid AS idregistro;`;
export const menuListar = `
        SELECT cmenuid AS idregistro, cmenunomb AS nombre, cmenudesc AS descripcion,
               cmenudest AS destino, cmenuesta AS idestado, cmenuorde AS orden
        FROM logic.tabmenu
        ORDER BY cmenuorde;`;
export const menuRegistrar = `
        INSERT INTO logic.tabmenu (cmenuid, cmenunomb, cmenudesc, cmenudest, cmenuesta, cmenuorde)
        VALUES ((SELECT COALESCE(MAX(cmenuid)+1, 1) FROM logic.tabmenu), $1, $2, $3, $4, $5)
        RETURNING cmenuid AS idregistro;`;
export const menuActualizar = `
        UPDATE logic.tabmenu SET cmenunomb=$2, cmenudesc=$3, cmenudest=$4, cmenuesta=$5, cmenuorde=$6
        WHERE cmenuid=$1 RETURNING cmenuid AS idregistro;`;
export const menuBorrar = `
        UPDATE logic.tabmenu SET cmenuesta=$2 WHERE cmenuid=$1 RETURNING cmenuid AS idregistro;`;
export const opcionListar = `
        SELECT o.copcimenuid AS idregistro, o.copcimenumenu AS idmenu, o.copcimenunomb AS nombre,
               o.copcimenudesc AS descripcion, o.copcimenuenla AS enlace, o.copcimenuicon AS icono,
               o.copcimenuorde AS orden, o.copcimenuesta AS idestado, m.cmenunomb AS menu
        FROM logic.tabopcimenu o
        LEFT JOIN logic.tabmenu m ON (m.cmenuid = o.copcimenumenu)
        ORDER BY o.copcimenuorde;`;
export const opcionRegistrar = `
        INSERT INTO logic.tabopcimenu
            (copcimenuid, copcimenumenu, copcimenunomb, copcimenudesc, copcimenuenla, copcimenuicon, copcimenuorde, copcimenuesta)
        VALUES ((SELECT COALESCE(MAX(copcimenuid)+1, 1) FROM logic.tabopcimenu), $1, $2, $3, $4, $5, $6, $7)
        RETURNING copcimenuid AS idregistro;`;
export const opcionActualizar = `
        UPDATE logic.tabopcimenu SET copcimenumenu=$2, copcimenunomb=$3, copcimenudesc=$4,
            copcimenuenla=$5, copcimenuicon=$6, copcimenuorde=$7, copcimenuesta=$8
        WHERE copcimenuid=$1 RETURNING copcimenuid AS idregistro;`;
export const opcionBorrar = `
        UPDATE logic.tabopcimenu SET copcimenuesta=$2 WHERE copcimenuid=$1 RETURNING copcimenuid AS idregistro;`;
export const rollopciListar = `
        SELECT crollopciid AS idregistro, copcimenuid AS idopcion, crollid AS idrol, crollopciesta AS idestado
        FROM logic.tabrollopci
        WHERE ($1::integer IS NULL OR crollid = $1)
        ORDER BY crollopciid;`;
export const rollopciRegistrar = `
        INSERT INTO logic.tabrollopci (crollopciid, copcimenuid, crollid, crollopciesta)
        VALUES ((SELECT COALESCE(MAX(crollopciid)+1, 1) FROM logic.tabrollopci), $1, $2, $3)
        RETURNING crollopciid AS idregistro;`;
export const rollopciBorrar = `
        UPDATE logic.tabrollopci SET crollopciesta=$2 WHERE crollopciid=$1 RETURNING crollopciid AS idregistro;`;
export const usuaopciListar = `
        SELECT cusuaopciid AS idregistro, cusuaopciopcimenu AS idopcion, cusuaopciusua AS idusuario, cusuaopciesta AS idestado
        FROM logic.tabusuaopci
        WHERE ($1::integer IS NULL OR cusuaopciusua = $1)
        ORDER BY cusuaopciid;`;
export const usuaopciRegistrar = `
        INSERT INTO logic.tabusuaopci (cusuaopciid, cusuaopciopcimenu, cusuaopciusua, cusuaopciesta)
        VALUES ((SELECT COALESCE(MAX(cusuaopciid)+1, 1) FROM logic.tabusuaopci), $1, $2, $3)
        RETURNING cusuaopciid AS idregistro;`;
export const usuaopciBorrar = `
        UPDATE logic.tabusuaopci SET cusuaopciesta=$2 WHERE cusuaopciid=$1 RETURNING cusuaopciid AS idregistro;`;
export const unioListar = `
        SELECT cunioid AS idregistro, cusuaid AS idusuario, cacadid AS idacademico, cunioesta AS idestado
        FROM public.tabunio
        WHERE ($1::integer IS NULL OR cusuaid = $1)
        ORDER BY cunioid;`;
export const unioRegistrar = `
        INSERT INTO public.tabunio (cunioid, cusuaid, cacadid, cunioesta)
        VALUES ((SELECT COALESCE(MAX(cunioid)+1, 1) FROM public.tabunio), $1, $2, $3)
        RETURNING cunioid AS idregistro;`;
export const unioBorrar = `
        UPDATE public.tabunio SET cunioesta=$2 WHERE cunioid=$1 RETURNING cunioid AS idregistro;`;
export default {
  usuarioListar: usuarioListar,
  usuarioRegistrar: usuarioRegistrar,
  usuarioActualizar: usuarioActualizar,
  usuarioClave: usuarioClave,
  usuarioBorrar: usuarioBorrar,
  rolListar: rolListar,
  rolRegistrar: rolRegistrar,
  rolActualizar: rolActualizar,
  rolBorrar: rolBorrar,
  menuListar: menuListar,
  menuRegistrar: menuRegistrar,
  menuActualizar: menuActualizar,
  menuBorrar: menuBorrar,
  opcionListar: opcionListar,
  opcionRegistrar: opcionRegistrar,
  opcionActualizar: opcionActualizar,
  opcionBorrar: opcionBorrar,
  rollopciListar: rollopciListar,
  rollopciRegistrar: rollopciRegistrar,
  rollopciBorrar: rollopciBorrar,
  usuaopciListar: usuaopciListar,
  usuaopciRegistrar: usuaopciRegistrar,
  usuaopciBorrar: usuaopciBorrar,
  unioListar: unioListar,
  unioRegistrar: unioRegistrar,
  unioBorrar: unioBorrar
};
/**
 * usuariossae.sql.js
 * Sentencias SQL del módulo de usuarios y roles SAE (esquema logic) y el enlace
 * usuario-académico (public.tabunio).
 */
