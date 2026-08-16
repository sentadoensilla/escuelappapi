const express = require('express');
const router = express.Router();
const Controller = require('../controllers/StatisticsController');
const ControllerEXPORT = require('../controllers/AcademicControllerExport');

const {upload,uploadInscripcion} = require('../middlware/uploadImages');
const Auth = require('../middlware/jwtoken');

router.post('/logdocentes',upload.none(),[Auth.isAuth,Auth.isDirector_and_tecaher],Controller.teacherIngresos);
router.post('/logestudiantes',upload.none(),[Auth.isAuth,Auth.isDirector_and_tecaher],Controller.studentIngresos);
router.post('/logasistencias',upload.none(),[Auth.isAuth,Auth.isDirector_and_tecaher],Controller.teacherAttendances);
router.post('/logasistenciasGrupos',upload.none(),[Auth.isAuth,Auth.isDirector_and_tecaher],Controller.studentAttendances);
//EXPORT ASISTENCIAS X DOCENTE
router.get('/logasistenciasExport',upload.none(),[Auth.isAuth,Auth.isDirector_and_tecaher],ControllerEXPORT.teacherAttendances);
//EXPORT ASISTENCIAS X GRUPO DETALLADO
router.get('/logasistenciasExportDetail',upload.none(),[Auth.isAuth,Auth.isDirector_and_tecaher],ControllerEXPORT.listAttendanceDetail);
//EXPORT ASISTENCIAS X ESTUDIANTE
router.get('/logasistenciasGruposExport',upload.none(),[Auth.isAuth,Auth.isDirector_and_tecaher],ControllerEXPORT.studentAttendances);



module.exports = router;