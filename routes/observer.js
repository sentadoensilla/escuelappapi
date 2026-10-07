import express from "express";
import Controller from "../controllers/ObservadorController.js";
import * as __mod0 from "../middlware/uploadImages.js";
import Auth from "../middlware/jwtoken.js";
const router = express.Router();
const {
  upload,
  uploadAlert
} = __mod0;
//OBSERVADOR
router.post('/sendObservaciones', [Auth.isAuth, Auth.isDirector_and_tecaher], uploadAlert.any(), Controller.observacionesSend);
router.post('/listObservaciones', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], upload.none(), Controller.observacionesGiveme);
router.post('/observacionesDelete', [Auth.isAuth, Auth.isDirector_and_tecaher], upload.none(), Controller.observacionesDelete);
router.post('/observacionesComms', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], upload.none(), Controller.observacionesComments);
router.post('/observacionesCommsList', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], upload.none(), Controller.observacionesCommentsList);
export default router;
