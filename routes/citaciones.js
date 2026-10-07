import express from "express";
import Controller from "../controllers/CitacionesController.js";
import Auth from "../middlware/jwtoken.js";
import * as __mod0 from "../middlware/uploadImages.js";
const router = express.Router();
const {
  upload,
  uploadAlert
} = __mod0;
router.post('/citacionesList', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], upload.none(), Controller.citacionesListar);
router.post('/citacionesNew', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], uploadAlert.any(), Controller.citacionesRegistrar);
router.post('/citacionesDelete', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], upload.none(), Controller.citacionesBorrar);
router.post('/citacionesUpdate', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], upload.none(), Controller.citacionesActualizar);
export default router;
