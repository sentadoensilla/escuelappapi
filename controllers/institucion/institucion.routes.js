/**
 * institucion.routes.js
 * Rutas del módulo de instituciones SAE (tabinst) y sedes (tabinstsede).
 */
const express = require('express');
const router = express.Router();
const Controller = require('./institucionController');
const Auth = require('../../middlware/jwtoken');

// ===== Instituciones (public.tabinst) =====
// Listar instituciones.
router.post('/instituciones/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.institucionListar);
// Registrar una institución.
router.post('/instituciones/registrar', [Auth.isAuth, Auth.Admin], Controller.institucionRegistrar);
// Actualizar una institución.
router.post('/instituciones/actualizar', [Auth.isAuth, Auth.Admin], Controller.institucionActualizar);
// Borrar (lógico) una institución.
router.post('/instituciones/borrar', [Auth.isAuth, Auth.Admin], Controller.institucionBorrar);

// ===== Sedes (public.tabinstsede) =====
// Listar sedes por institución.
router.post('/sedes/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.sedeListar);
// Registrar una sede.
router.post('/sedes/registrar', [Auth.isAuth, Auth.Admin_academico], Controller.sedeRegistrar);
// Actualizar una sede.
router.post('/sedes/actualizar', [Auth.isAuth, Auth.Admin_academico], Controller.sedeActualizar);
// Borrar una sede.
router.post('/sedes/borrar', [Auth.isAuth, Auth.Admin_academico], Controller.sedeBorrar);

module.exports = router;
