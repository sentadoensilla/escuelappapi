import express from "express";
import Controller from "./avisosController.js";
import Auth from "../../middlware/jwtoken.js";
import * as __mod0 from "../../middlware/uploadImages.js";
const router = express.Router();
const {
  upload,
  uploadAlert
} = __mod0;
// ===== Avisos por rol (public.tabavisroll) =====
router.post('/avisosrol/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], upload.none(), Controller.avisorollListar);
router.post('/avisosrol/registrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], uploadAlert.any(), Controller.avisorollRegistrar);
router.post('/avisosrol/actualizar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], uploadAlert.any(), Controller.avisorollActualizar);
router.post('/avisosrol/borrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], upload.none(), Controller.avisorollBorrar);

// ===== Avisos por usuario (public.tabavisusua) =====
router.post('/avisosusua/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], upload.none(), Controller.avisousuaListar);
router.post('/avisosusua/registrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], uploadAlert.any(), Controller.avisousuaRegistrar);
router.post('/avisosusua/actualizar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], uploadAlert.any(), Controller.avisousuaActualizar);
router.post('/avisosusua/borrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], upload.none(), Controller.avisousuaBorrar);

// ===== Destinos de aviso por rol (public.avisrolldest) =====
router.post('/avisodest/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], upload.none(), Controller.avisodestListar);
router.post('/avisodest/registrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], uploadAlert.any(), Controller.avisodestRegistrar);
router.post('/avisodest/actualizar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], uploadAlert.any(), Controller.avisodestActualizar);
router.post('/avisodest/borrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], upload.none(), Controller.avisodestBorrar);
export default router;
