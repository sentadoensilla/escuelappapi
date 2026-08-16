/**
 * notas.routes.js
 * Rutas del módulo de calificaciones SAE (notas, logros, definitivas y promedios).
 */
const express = require('express');
const router = express.Router();
const Controller = require('./notasController');
const Auth = require('../../middlware/jwtoken');

// ===== Notas (public.tabnota) =====
// Listar notas por matrícula y/o asignación-curso.
router.post('/notas/listar', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], Controller.notaListar);
// Registrar una nota.
router.post('/notas/registrar', [Auth.isAuth, Auth.isDirector_and_tecaher], Controller.notaRegistrar);
// Actualizar una nota.
router.post('/notas/actualizar', [Auth.isAuth, Auth.isDirector_and_tecaher], Controller.notaActualizar);
// Borrar (lógico) una nota.
router.post('/notas/borrar', [Auth.isAuth, Auth.isDirector_and_tecaher], Controller.notaBorrar);

// ===== Logros (public.tabcompestu) =====
// Listar logros por matrícula.
router.post('/logros/listar', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], Controller.compestuListar);
// Registrar un logro.
router.post('/logros/registrar', [Auth.isAuth, Auth.isDirector_and_tecaher], Controller.compestuRegistrar);
// Borrar (lógico) un logro.
router.post('/logros/borrar', [Auth.isAuth, Auth.isDirector_and_tecaher], Controller.compestuBorrar);

// ===== Definitivas (public.tabnotadef) =====
// Listar definitivas por matrícula.
router.post('/definitivas/listar', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], Controller.notadefListar);
// Registrar una definitiva.
router.post('/definitivas/registrar', [Auth.isAuth, Auth.isDirector_and_tecaher], Controller.notadefRegistrar);
// Borrar (lógico) una definitiva.
router.post('/definitivas/borrar', [Auth.isAuth, Auth.isDirector_and_tecaher], Controller.notadefBorrar);

// ===== Promedios definitivos (public.tabpromdef) =====
// Listar promedios definitivos por matrícula.
router.post('/promediosdef/listar', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], Controller.promdefListar);
// Registrar un promedio definitivo.
router.post('/promediosdef/registrar', [Auth.isAuth, Auth.isDirector_and_tecaher], Controller.promdefRegistrar);
// Borrar (lógico) un promedio definitivo.
router.post('/promediosdef/borrar', [Auth.isAuth, Auth.isDirector_and_tecaher], Controller.promdefBorrar);

// ===== Promedios por asignatura (public.tabpromasig) =====
// Listar promedios por asignatura de un promedio general.
router.post('/promediosasig/listar', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], Controller.promasigListar);
// Registrar un promedio por asignatura.
router.post('/promediosasig/registrar', [Auth.isAuth, Auth.Admin_academico], Controller.promasigRegistrar);
// Borrar (lógico) un promedio por asignatura.
router.post('/promediosasig/borrar', [Auth.isAuth, Auth.Admin_academico], Controller.promasigBorrar);

// ===== Promedios generales (public.tabpromo) =====
// Listar promedios generales.
router.post('/promedios/listar', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], Controller.promoListar);
// Registrar un promedio general.
router.post('/promedios/registrar', [Auth.isAuth, Auth.Admin_academico], Controller.promoRegistrar);
// Actualizar un promedio general.
router.post('/promedios/actualizar', [Auth.isAuth, Auth.Admin_academico], Controller.promoActualizar);
// Borrar (lógico) un promedio general.
router.post('/promedios/borrar', [Auth.isAuth, Auth.Admin_academico], Controller.promoBorrar);

module.exports = router;
