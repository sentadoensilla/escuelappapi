import express from "express";
import Controller from "./anolperiodoController.js";
import Auth from "../../middlware/jwtoken.js";
const router = express.Router();
// ===== Año lectivo (public.tabanol) =====
// Listar todos los años lectivos.
router.post('/anos/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.anoListar);
// Registrar un nuevo año lectivo.
router.post('/anos/registrar', [Auth.isAuth, Auth.Admin_academico], Controller.anoRegistrar);
// Actualizar un año lectivo.
router.post('/anos/actualizar', [Auth.isAuth, Auth.Admin_academico], Controller.anoActualizar);
// Borrar (lógico) un año lectivo.
router.post('/anos/borrar', [Auth.isAuth, Auth.Admin_academico], Controller.anoBorrar);

// ===== Periodos (public.tabperi) =====
// Listar los periodos académicos.
router.post('/periodos/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.periodoListar);
// Registrar un periodo académico.
router.post('/periodos/registrar', [Auth.isAuth, Auth.Admin_academico], Controller.periodoRegistrar);
// Actualizar un periodo académico.
router.post('/periodos/actualizar', [Auth.isAuth, Auth.Admin_academico], Controller.periodoActualizar);
// Borrar (lógico) un periodo académico.
router.post('/periodos/borrar', [Auth.isAuth, Auth.Admin_academico], Controller.periodoBorrar);

// ===== Relación institución-año-periodo (public.anolperi) =====
// Listar periodos por institución y/o año lectivo.
router.post('/anolperi/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.anolperiListar);
// Registrar un periodo institucional.
router.post('/anolperi/registrar', [Auth.isAuth, Auth.Admin_academico], Controller.anolperiRegistrar);
// Actualizar un periodo institucional.
router.post('/anolperi/actualizar', [Auth.isAuth, Auth.Admin_academico], Controller.anolperiActualizar);
// Borrar (lógico) un periodo institucional.
router.post('/anolperi/borrar', [Auth.isAuth, Auth.Admin_academico], Controller.anolperiBorrar);

// ===== Valores por periodo (public.tabperival) =====
// Listar valores por periodo.
router.post('/perival/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.perivalListar);
// Registrar un valor por periodo.
router.post('/perival/registrar', [Auth.isAuth, Auth.Admin_academico], Controller.perivalRegistrar);
// Actualizar un valor por periodo.
router.post('/perival/actualizar', [Auth.isAuth, Auth.Admin_academico], Controller.perivalActualizar);
// Borrar (lógico) un valor por periodo.
router.post('/perival/borrar', [Auth.isAuth, Auth.Admin_academico], Controller.perivalBorrar);
export default router;
