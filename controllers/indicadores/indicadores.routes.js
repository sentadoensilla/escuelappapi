import express from "express";
import Controller from "./indicadoresController.js";
import Auth from "../../middlware/jwtoken.js";
const router = express.Router();
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
export default router;
