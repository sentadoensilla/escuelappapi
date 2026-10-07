import express from "express";
import Controller from "../controllers/StatisticsController.js";
import ControllerEXPORT from "../controllers/AcademicControllerExport.js";
import * as __mod0 from "../middlware/uploadImages.js";
import Auth from "../middlware/jwtoken.js";
const router = express.Router();
const {
  upload,
  uploadInscripcion
} = __mod0;
router.post('/logdocentes', upload.none(), [Auth.isAuth, Auth.isDirector_and_tecaher], Controller.teacherIngresos);
router.post('/logestudiantes', upload.none(), [Auth.isAuth, Auth.isDirector_and_tecaher], Controller.studentIngresos);
router.post('/logasistencias', upload.none(), [Auth.isAuth, Auth.isDirector_and_tecaher], Controller.teacherAttendances);
router.post('/logasistenciasGrupos', upload.none(), [Auth.isAuth, Auth.isDirector_and_tecaher], Controller.studentAttendances);
//EXPORT ASISTENCIAS X DOCENTE
router.get('/logasistenciasExport', upload.none(), [Auth.isAuth, Auth.isDirector_and_tecaher], ControllerEXPORT.teacherAttendances);
//EXPORT ASISTENCIAS X GRUPO DETALLADO
router.get('/logasistenciasExportDetail', upload.none(), [Auth.isAuth, Auth.isDirector_and_tecaher], ControllerEXPORT.listAttendanceDetail);
//EXPORT ASISTENCIAS X ESTUDIANTE
router.get('/logasistenciasGruposExport', upload.none(), [Auth.isAuth, Auth.isDirector_and_tecaher], ControllerEXPORT.studentAttendances);
export default router;
