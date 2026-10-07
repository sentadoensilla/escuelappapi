import express from "express";
import Controller from "./templatesController.js";
import Auth from "../../middlware/jwtoken.js";
const router = express.Router();
// ===== Tipos de plantilla (contact.aetempmesstype) =====
router.post('/tipos/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.tipoListar);
router.post('/tipos/registrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.tipoRegistrar);
router.post('/tipos/actualizar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.tipoActualizar);
router.post('/tipos/borrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.tipoBorrar);

// ===== Variables (contact.aetempmessvars) =====
router.post('/variables/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.varListar);
router.post('/variables/registrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.varRegistrar);
router.post('/variables/actualizar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.varActualizar);
router.post('/variables/borrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.varBorrar);

// ===== Plantillas (contact.aetempmess) =====
router.post('/plantillas/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.plantillaListar);
router.post('/plantillas/registrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.plantillaRegistrar);
router.post('/plantillas/actualizar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.plantillaActualizar);
router.post('/plantillas/borrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.plantillaBorrar);

// ===== Plantillas por sede (contact.aetempmesssede) =====
router.post('/plantillasede/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.plantillasedeListar);
router.post('/plantillasede/registrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.plantillasedeRegistrar);
router.post('/plantillasede/actualizar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.plantillasedeActualizar);
router.post('/plantillasede/borrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.plantillasedeBorrar);
export default router;
