import express from "express";
import Controller from "./novedadesController.js";
import Auth from "../../middlware/jwtoken.js";
const router = express.Router();
// Listar novedades por matrícula, asignación y/o tipo.
router.post('/novedades/listar', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], Controller.novedadListar);
// Registrar una novedad.
router.post('/novedades/registrar', [Auth.isAuth, Auth.isDirector_and_tecaher], Controller.novedadRegistrar);
// Actualizar una novedad.
router.post('/novedades/actualizar', [Auth.isAuth, Auth.isDirector_and_tecaher], Controller.novedadActualizar);
// Borrar (lógico) una novedad.
router.post('/novedades/borrar', [Auth.isAuth, Auth.isDirector_and_tecaher], Controller.novedadBorrar);
export default router;
