/**
 * usuariossae.routes.js
 * Rutas del módulo de usuarios y roles SAE (esquema logic) y enlace académico (tabunio).
 */
const express = require('express');
const router = express.Router();
const Controller = require('./usuariossaeController');
const Auth = require('../../middlware/jwtoken');

// ===== Usuarios (logic.tabusua) =====
// Listar usuarios.
router.post('/usuarios/listar', [Auth.isAuth, Auth.Admin], Controller.usuarioListar);
// Registrar un usuario.
router.post('/usuarios/registrar', [Auth.isAuth, Auth.Admin], Controller.usuarioRegistrar);
// Actualizar un usuario.
router.post('/usuarios/actualizar', [Auth.isAuth, Auth.Admin], Controller.usuarioActualizar);
// Cambiar la clave de un usuario.
router.post('/usuarios/clave', [Auth.isAuth, Auth.Admin], Controller.usuarioClave);
// Borrar (lógico) un usuario.
router.post('/usuarios/borrar', [Auth.isAuth, Auth.Admin], Controller.usuarioBorrar);

// ===== Roles (logic.tabroll) =====
// Listar roles.
router.post('/roles/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.rolListar);
// Registrar un rol.
router.post('/roles/registrar', [Auth.isAuth, Auth.Admin], Controller.rolRegistrar);
// Actualizar un rol.
router.post('/roles/actualizar', [Auth.isAuth, Auth.Admin], Controller.rolActualizar);
// Borrar (lógico) un rol.
router.post('/roles/borrar', [Auth.isAuth, Auth.Admin], Controller.rolBorrar);

// ===== Menús (logic.tabmenu) =====
// Listar menús.
router.post('/menus/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.menuListar);
// Registrar un menú.
router.post('/menus/registrar', [Auth.isAuth, Auth.Admin], Controller.menuRegistrar);
// Actualizar un menú.
router.post('/menus/actualizar', [Auth.isAuth, Auth.Admin], Controller.menuActualizar);
// Borrar (lógico) un menú.
router.post('/menus/borrar', [Auth.isAuth, Auth.Admin], Controller.menuBorrar);

// ===== Opciones de menú (logic.tabopcimenu) =====
// Listar opciones de menú.
router.post('/opciones/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.opcionListar);
// Registrar una opción de menú.
router.post('/opciones/registrar', [Auth.isAuth, Auth.Admin], Controller.opcionRegistrar);
// Actualizar una opción de menú.
router.post('/opciones/actualizar', [Auth.isAuth, Auth.Admin], Controller.opcionActualizar);
// Borrar (lógico) una opción de menú.
router.post('/opciones/borrar', [Auth.isAuth, Auth.Admin], Controller.opcionBorrar);

// ===== Privilegios por rol (logic.tabrollopci) =====
// Listar privilegios de un rol.
router.post('/privilegiosrol/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.rollopciListar);
// Asignar una opción a un rol.
router.post('/privilegiosrol/registrar', [Auth.isAuth, Auth.Admin], Controller.rollopciRegistrar);
// Quitar (lógico) una opción a un rol.
router.post('/privilegiosrol/borrar', [Auth.isAuth, Auth.Admin], Controller.rollopciBorrar);

// ===== Privilegios por usuario (logic.tabusuaopci) =====
// Listar privilegios de un usuario.
router.post('/privilegiosusuario/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.usuaopciListar);
// Asignar una opción a un usuario.
router.post('/privilegiosusuario/registrar', [Auth.isAuth, Auth.Admin], Controller.usuaopciRegistrar);
// Quitar (lógico) una opción a un usuario.
router.post('/privilegiosusuario/borrar', [Auth.isAuth, Auth.Admin], Controller.usuaopciBorrar);

// ===== Enlace usuario-académico (public.tabunio) =====
// Listar enlaces usuario-académico.
router.post('/uniones/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.unioListar);
// Crear un enlace usuario-académico.
router.post('/uniones/registrar', [Auth.isAuth, Auth.Admin], Controller.unioRegistrar);
// Borrar (lógico) un enlace usuario-académico.
router.post('/uniones/borrar', [Auth.isAuth, Auth.Admin], Controller.unioBorrar);

module.exports = router;
