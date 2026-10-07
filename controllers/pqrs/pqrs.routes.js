import express from "express";
import Controller from "./pqrsController.js";
import Auth from "../../middlware/jwtoken.js";
const router = express.Router();
// ===== Tipos de solicitud (data.aepqr_tiposolicitud) =====
router.post('/tiposolicitud/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.tiposolicitudListar);
router.post('/tiposolicitud/registrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.tiposolicitudRegistrar);
router.post('/tiposolicitud/actualizar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.tiposolicitudActualizar);
router.post('/tiposolicitud/borrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.tiposolicitudBorrar);

// ===== PQRS (data.aepqr) =====
router.post('/pqrs/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.pqrListar);
router.post('/pqrs/registrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.pqrRegistrar);
router.post('/pqrs/actualizar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.pqrActualizar);
router.post('/pqrs/borrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.pqrBorrar);

// ===== Respuestas PQRS (data.aepqr_respuesta) =====
router.post('/respuestas/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.respuestaListar);
router.post('/respuestas/registrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.respuestaRegistrar);
router.post('/respuestas/actualizar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.respuestaActualizar);
router.post('/respuestas/borrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.respuestaBorrar);
export default router;
