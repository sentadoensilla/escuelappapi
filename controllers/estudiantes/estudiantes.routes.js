/**
 * estudiantes.routes.js
 * Rutas del módulo de estudiantes SAE (estudiantes, matrícula, acudientes,
 * otros datos, socioeconómicos y pagos).
 */
const express = require('express');
const router = express.Router();
const Controller = require('./estudiantesController');
const Auth = require('../../middlware/jwtoken');

// ===== Estudiantes (public.tabestu) =====
// Listar estudiantes.
router.post('/estudiantes/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.estudianteListar);
// Registrar un estudiante.
router.post('/estudiantes/registrar', [Auth.isAuth, Auth.Admin_academico], Controller.estudianteRegistrar);
// Actualizar un estudiante.
router.post('/estudiantes/actualizar', [Auth.isAuth, Auth.Admin_academico], Controller.estudianteActualizar);
// Borrar (lógico) un estudiante.
router.post('/estudiantes/borrar', [Auth.isAuth, Auth.Admin_academico], Controller.estudianteBorrar);

// ===== Matrícula (public.tabmatr) =====
// Listar matrículas por curso (opcional).
router.post('/matriculas/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.matriculaListar);
// Registrar una matrícula.
router.post('/matriculas/registrar', [Auth.isAuth, Auth.Admin_academico], Controller.matriculaRegistrar);
// Actualizar una matrícula.
router.post('/matriculas/actualizar', [Auth.isAuth, Auth.Admin_academico], Controller.matriculaActualizar);
// Borrar (lógico) una matrícula.
router.post('/matriculas/borrar', [Auth.isAuth, Auth.Admin_academico], Controller.matriculaBorrar);

// ===== Acudientes (public.tabestuacud) =====
// Listar acudientes por matrícula.
router.post('/acudientes/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.acudienteListar);
// Registrar un acudiente.
router.post('/acudientes/registrar', [Auth.isAuth, Auth.Admin_academico], Controller.acudienteRegistrar);
// Borrar (lógico) un acudiente.
router.post('/acudientes/borrar', [Auth.isAuth, Auth.Admin_academico], Controller.acudienteBorrar);

// ===== Otros datos / anexo 6 (public.tabestuotrodato) =====
// Listar otros datos por matrícula.
router.post('/otrosdatos/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.otrodatoListar);
// Registrar otros datos del estudiante.
router.post('/otrosdatos/registrar', [Auth.isAuth, Auth.Admin_academico], Controller.otrodatoRegistrar);

// ===== Datos socioeconómicos (public.tabestusociecon) =====
// Listar datos socioeconómicos por matrícula.
router.post('/socioeconomicos/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.socieconListar);
// Registrar datos socioeconómicos.
router.post('/socioeconomicos/registrar', [Auth.isAuth, Auth.Admin_academico], Controller.socieconRegistrar);

// ===== Pagos (public.tabmatrpago) =====
// Listar pagos por matrícula.
router.post('/pagos/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.pagoListar);
// Registrar un pago.
router.post('/pagos/registrar', [Auth.isAuth, Auth.Admin_academico], Controller.pagoRegistrar);
// Borrar (lógico) un pago.
router.post('/pagos/borrar', [Auth.isAuth, Auth.Admin_academico], Controller.pagoBorrar);

// ===== Promoción masiva =====
// Promover estudiantes de un curso origen a un curso destino (matrícula masiva de promovidos).
router.post('/promover', [Auth.isAuth, Auth.Admin_academico], Controller.promover);

module.exports = router;
