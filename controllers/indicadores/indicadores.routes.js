/**
 * indicadores.routes.js
 * Rutas del módulo de indicadores de desempeño (competencias).
 */
const express = require('express');
const router = express.Router();
const Controller = require('./indicadoresController');
const Auth = require('../../middlware/jwtoken');

// ===== Competencias (public.tabcomp) =====
// Listar competencias por área y/o grado.
router.post('/competencias/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.competenciaListar);
// Registrar una competencia.
router.post('/competencias/registrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.competenciaRegistrar);
// Actualizar una competencia.
router.post('/competencias/actualizar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.competenciaActualizar);
// Borrar (lógico) una competencia.
router.post('/competencias/borrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.competenciaBorrar);

// ===== Competencia por asignación-curso (public.asigcurscomp) =====
// Listar competencias de una asignación-curso.
router.post('/asigcurscomp/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.asigcurscompListar);
// Asignar una competencia a una asignación-curso.
router.post('/asigcurscomp/registrar', [Auth.isAuth, Auth.isDirector_and_tecaher], Controller.asigcurscompRegistrar);
// Retirar (lógico) una competencia de una asignación-curso.
router.post('/asigcurscomp/borrar', [Auth.isAuth, Auth.isDirector_and_tecaher], Controller.asigcurscompBorrar);

module.exports = router;
