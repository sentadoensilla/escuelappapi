/**
 * preescolar.routes.js
 * Rutas del módulo de preescolar (esquema preescolar).
 */
const express = require('express');
const router = express.Router();
const Controller = require('./preescolarController');
const Auth = require('../../middlware/jwtoken');

// ===== Ámbitos (preescolar.tabpreambi) =====
// Listar ámbitos de preescolar.
router.post('/ambitos/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.ambitoListar);
// Registrar un ámbito.
router.post('/ambitos/registrar', [Auth.isAuth, Auth.Admin_academico], Controller.ambitoRegistrar);
// Actualizar un ámbito.
router.post('/ambitos/actualizar', [Auth.isAuth, Auth.Admin_academico], Controller.ambitoActualizar);
// Borrar (lógico) un ámbito.
router.post('/ambitos/borrar', [Auth.isAuth, Auth.Admin_academico], Controller.ambitoBorrar);

// ===== Dimensiones (preescolar.tabpredime) =====
// Listar dimensiones.
router.post('/dimensiones/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.dimensionListar);
// Registrar una dimensión.
router.post('/dimensiones/registrar', [Auth.isAuth, Auth.Admin_academico], Controller.dimensionRegistrar);
// Actualizar una dimensión.
router.post('/dimensiones/actualizar', [Auth.isAuth, Auth.Admin_academico], Controller.dimensionActualizar);
// Borrar (lógico) una dimensión.
router.post('/dimensiones/borrar', [Auth.isAuth, Auth.Admin_academico], Controller.dimensionBorrar);

// ===== Asignaciones (preescolar.tabpreasig) =====
// Listar asignaciones de preescolar.
router.post('/asignaciones/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.asignacionListar);
// Registrar una asignación.
router.post('/asignaciones/registrar', [Auth.isAuth, Auth.Admin_academico], Controller.asignacionRegistrar);
// Actualizar una asignación.
router.post('/asignaciones/actualizar', [Auth.isAuth, Auth.Admin_academico], Controller.asignacionActualizar);
// Borrar (lógico) una asignación.
router.post('/asignaciones/borrar', [Auth.isAuth, Auth.Admin_academico], Controller.asignacionBorrar);

// ===== Notas (preescolar.tabprenota) =====
// Listar notas de preescolar por matrícula.
router.post('/notas/listar', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], Controller.notaListar);
// Registrar una nota de preescolar.
router.post('/notas/registrar', [Auth.isAuth, Auth.isDirector_and_tecaher], Controller.notaRegistrar);
// Borrar (lógico) una nota de preescolar.
router.post('/notas/borrar', [Auth.isAuth, Auth.isDirector_and_tecaher], Controller.notaBorrar);

// ===== Novedades (preescolar.tabprenove) =====
// Listar novedades de preescolar por matrícula.
router.post('/novedades/listar', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], Controller.novedadListar);
// Registrar una novedad de preescolar.
router.post('/novedades/registrar', [Auth.isAuth, Auth.isDirector_and_tecaher], Controller.novedadRegistrar);
// Borrar (lógico) una novedad de preescolar.
router.post('/novedades/borrar', [Auth.isAuth, Auth.isDirector_and_tecaher], Controller.novedadBorrar);

module.exports = router;
