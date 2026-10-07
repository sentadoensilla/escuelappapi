import express from "express";
import Controller from "./docentesController.js";
import Auth from "../../middlware/jwtoken.js";
const router = express.Router();
// ===== Docentes (public.tabdoce) =====
// Listar docentes.
router.post('/docentes/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.docenteListar);
// Registrar un docente.
router.post('/docentes/registrar', [Auth.isAuth, Auth.Admin_academico], Controller.docenteRegistrar);
// Actualizar un docente.
router.post('/docentes/actualizar', [Auth.isAuth, Auth.Admin_academico], Controller.docenteActualizar);
// Borrar (lógico) un docente.
router.post('/docentes/borrar', [Auth.isAuth, Auth.Admin_academico], Controller.docenteBorrar);

// ===== Contratación (public.tabinstdoce) =====
// Listar contrataciones por institución/año.
router.post('/contrataciones/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.contratacionListar);
// Registrar la contratación de un docente.
router.post('/contrataciones/registrar', [Auth.isAuth, Auth.Admin_academico], Controller.contratacionRegistrar);
// Actualizar la contratación de un docente.
router.post('/contrataciones/actualizar', [Auth.isAuth, Auth.Admin_academico], Controller.contratacionActualizar);
// Borrar (lógico) una contratación.
router.post('/contrataciones/borrar', [Auth.isAuth, Auth.Admin_academico], Controller.contratacionBorrar);

// ===== Asignación académica (public.asigcurs) =====
// Listar asignaciones académicas por curso y/o docente.
router.post('/asignaciones/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.asignacionListar);
// Registrar una asignación académica.
router.post('/asignaciones/registrar', [Auth.isAuth, Auth.isDirector_and_tecaher], Controller.asignacionRegistrar);
// Actualizar una asignación académica.
router.post('/asignaciones/actualizar', [Auth.isAuth, Auth.isDirector_and_tecaher], Controller.asignacionActualizar);
// Borrar (lógico) una asignación académica.
router.post('/asignaciones/borrar', [Auth.isAuth, Auth.isDirector_and_tecaher], Controller.asignacionBorrar);
export default router;
