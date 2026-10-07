import express from "express";
import Controller from "../controllers/AlertsController.js";
import ControllerPlus from "../controllers/AlertsControllerPlus.js";
import * as __mod0 from "../middlware/uploadImages.js";
import Auth from "../middlware/jwtoken.js";
const router = express.Router();
const {
  upload,
  uploadAll,
  uploadPath,
  uploadResponse,
  uploadAlert
} = __mod0;
router.post('/listAlert', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], upload.none(), Controller.giveMeAlerts);
router.post('/listConsultas', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], upload.none(), Controller.giveMeConsultas);
router.post('/listcommentsAlert', [Auth.isAuth, Auth.isAuth], upload.none(), Controller.commentsAlerts);
router.post('/listcommentsConsultas', [Auth.isAuth, Auth.isAuth], upload.none(), Controller.commentsConsultas);
router.post('/createAlert', [Auth.isAuth, Auth.isDirector_and_tecaher], uploadAlert.any(), Controller.ALerts);
router.post('/editAlert', [Auth.isAuth, Auth.isDirector_and_tecaher], uploadAlert.any(), Controller.ALertsEdit);
router.post('/deleteAlert', [Auth.isAuth, Auth.isDirector_and_tecaher], upload.none(), Controller.ALertsDelete);
router.post('/answerAlert', [Auth.isAuth, Auth.isAuth], upload.none(), Controller.alertComments);
router.post('/answerConsulta', [Auth.isAuth, Auth.isAuth], upload.none(), Controller.consultaComments);
router.post('/viewAlerts', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], upload.none(), Controller.listAllAlerts);
router.post('/viewOneAlerts', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], upload.none(), Controller.ALertsFind);

// PUBALICACIONES DEL PLUS DEL COLEGIO
router.post('/createAlertPlus', [Auth.isAuth, Auth.isDirector_and_tecaher], uploadAlert.any(), ControllerPlus.Publicaciones);
router.post('/listAlertPlus', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], upload.none(), ControllerPlus.listAllPublicaciones);
router.post('/viewAlertPlus', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], upload.none(), ControllerPlus.listOnePublicacion);
router.post('/answerAlertPlus', [Auth.isAuth, Auth.isAuth], upload.none(), ControllerPlus.publicacionesComments);
router.post('/listcommentsAlertPlus', [Auth.isAuth, Auth.isAuth], upload.none(), ControllerPlus.commentsPublicaciones);
router.post('/deleteAlertPlus', [Auth.isAuth, Auth.isDirector_and_tecaher], upload.none(), ControllerPlus.publicacionesDelete);
export default router;
