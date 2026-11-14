import express from "express";
import Controller from "./catalogosController.js";
import Auth from "../../middlware/jwtoken.js";
const router = express.Router();
// Listar los registros de un catálogo (admin académico o administrador).
router.post('/listar/:tabla', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.catalogosListar);

// Listar un catálogo público (sin login) — solo para el formulario de auto-gestión.
router.post('/publico/listar/:tabla', Controller.catalogosPublicListar);

// Registrar un nuevo registro en un catálogo (admin académico o administrador).
router.post('/registrar/:tabla', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.catalogosRegistrar);

// Actualizar un registro de un catálogo (admin académico o administrador).
router.post('/actualizar/:tabla', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.catalogosActualizar);

// Borrar (lógico) un registro de un catálogo (admin académico o administrador).
router.post('/borrar/:tabla', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.catalogosBorrar);
export default router;
