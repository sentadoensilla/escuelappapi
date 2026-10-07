import express from "express";
import Controller from "./cursosController.js";
import Auth from "../../middlware/jwtoken.js";
const router = express.Router();
// Listar cursos de una institución y/o año lectivo.
router.post('/cursos/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.cursoListar);
// Registrar un nuevo curso.
router.post('/cursos/registrar', [Auth.isAuth, Auth.Admin_academico], Controller.cursoRegistrar);
// Actualizar un curso existente.
router.post('/cursos/actualizar', [Auth.isAuth, Auth.Admin_academico], Controller.cursoActualizar);
// Borrar (lógico) un curso.
router.post('/cursos/borrar', [Auth.isAuth, Auth.Admin_academico], Controller.cursoBorrar);
// Listar las sedes de una institución (apoyo de formulario).
router.post('/sedes/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.sedesListar);
export default router;
