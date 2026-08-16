/**
 * observador.routes.js
 * Rutas del módulo de observador del estudiante (esquema observador).
 */
const express = require('express');
const router = express.Router();
const Controller = require('./observadorController');
const Auth = require('../../middlware/jwtoken');

// ===== Plantilla del observador (observador.tabobsplan) =====
// Listar plantilla(s) por institución.
router.post('/plan/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.planListar);
// Registrar la plantilla del observador.
router.post('/plan/registrar', [Auth.isAuth, Auth.Admin_academico], Controller.planRegistrar);
// Actualizar la plantilla del observador.
router.post('/plan/actualizar', [Auth.isAuth, Auth.Admin_academico], Controller.planActualizar);

// ===== Grupos de responsabilidad (observador.tabresp) =====
// Listar grupos de responsabilidad por institución.
router.post('/responsabilidades/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.responsabilidadListar);
// Registrar un grupo de responsabilidad.
router.post('/responsabilidades/registrar', [Auth.isAuth, Auth.Admin_academico], Controller.responsabilidadRegistrar);
// Actualizar un grupo de responsabilidad.
router.post('/responsabilidades/actualizar', [Auth.isAuth, Auth.Admin_academico], Controller.responsabilidadActualizar);
// Borrar (lógico) un grupo de responsabilidad.
router.post('/responsabilidades/borrar', [Auth.isAuth, Auth.Admin_academico], Controller.responsabilidadBorrar);

// ===== Responsabilidades (observador.tabrespsub) =====
// Listar responsabilidades de un grupo.
router.post('/subresponsabilidades/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.subresponsabilidadListar);
// Registrar una responsabilidad.
router.post('/subresponsabilidades/registrar', [Auth.isAuth, Auth.Admin_academico], Controller.subresponsabilidadRegistrar);
// Borrar (lógico) una responsabilidad.
router.post('/subresponsabilidades/borrar', [Auth.isAuth, Auth.Admin_academico], Controller.subresponsabilidadBorrar);

// ===== Observaciones (observador.tabrespobs) =====
// Listar observaciones por matrícula.
router.post('/observaciones/listar', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], Controller.observacionListar);
// Registrar una observación.
router.post('/observaciones/registrar', [Auth.isAuth, Auth.isDirector_and_tecaher], Controller.observacionRegistrar);
// Borrar (lógico) una observación.
router.post('/observaciones/borrar', [Auth.isAuth, Auth.isDirector_and_tecaher], Controller.observacionBorrar);

// ===== Evaluación (observador.tabrespeval) =====
// Listar evaluaciones por matrícula.
router.post('/evaluaciones/listar', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], Controller.evaluacionListar);
// Registrar una evaluación.
router.post('/evaluaciones/registrar', [Auth.isAuth, Auth.isDirector_and_tecaher], Controller.evaluacionRegistrar);

module.exports = router;
