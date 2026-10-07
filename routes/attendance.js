import express from "express";
import Controller from "../controllers/asistenciasController.js";
import ControllerExport from "../controllers/AsistenciasControllerExport.js";
import ControllerAdmin from "../controllers/AcademicControllerAdmin.js";
import * as __mod0 from "../middlware/uploadImages.js";
import Auth from "../middlware/jwtoken.js";
const router = express.Router();
const {
  upload,
  uploadPath,
  uploadResponse,
  uploadExcusa
} = __mod0;
//ASISTENCIAS
router.post('/attendacelistgroup', upload.none(), [Auth.isAuth, Auth.isDirector_and_tecaher], Controller.listStudentsGroup);
router.post('/attendancesave', upload.none(), [Auth.isAuth, Auth.isDirector_and_tecaher], Controller.saveAttendance);
router.post('/listAttendance', upload.none(), [Auth.isAuth, Auth.isDirector_and_tecaher], Controller.listAttendancePersonal);
router.post('/listAttendancegroup', upload.none(), [Auth.isAuth, Auth.isDirector_and_tecaher], Controller.listAttendanceAdmin);
router.post('/deleteAttendance', upload.none(), [Auth.isAuth, Auth.isDirector_and_tecaher], Controller.deleteAttendance);
// APOYO A LAS ASISTENCIAS
router.post('/litstiponovedad', upload.none(), [Auth.isAuth, Auth.isDirector_and_tecaher], Controller.listTipoNovedad);
router.post('/getAsigments', upload.none(), [Auth.isAuth, Auth.isDirector_and_tecaher], Controller.asigmentsTeachersUnique);
router.post('/getAsigmentsStudent', upload.none(), [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], Controller.getListAssigments);
router.post('/getExcusesDate', upload.none(), [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], Controller.listExcusesXGroupDate);

//ASISTENCIAS PARA ADMINISTRADORES
router.post('/listAttendanceAdmin', upload.none(), [Auth.isAuth, Auth.isDirector_and_tecaher], ControllerAdmin.listAttendanceAdmin);
router.post('/listAttendanceAdminDetail', upload.none(), [Auth.isAuth, Auth.isDirector_and_tecaher], ControllerAdmin.listAttendanceAdminAssigment);

//EXPORTAR ASISTENCIAS
router.post('/listAttendanceAdminExport', upload.none(), [Auth.isAuth, Auth.isDirector_and_tecaher], ControllerExport.listAttendanceAdminToXLS);
//router.get('/listAttendanceExport',upload.none(),[Auth.isAuth,Auth.isDirector_and_tecaher],ControllerExport.listAttendanceAdminToXLS);
// router.get('/listAttendanceAdminDetailExport',upload.none(),[Auth.isAuth,Auth.isDirector_and_tecaher],ControllerExport.listAttendanceAdminAssigment);

//router.get('/listAttendanceExportDetail',upload.none(),[Auth.isAuth,Auth.isDirector_and_tecaher],ControllerExport.listAttendanceDetail);
// AUSENTISMO
// router.post('/listUnnattendance',upload.none(),[Auth.isAuth,Auth.isDirector_and_tecaher],Controller.reviewAttendance);
// router.post('/listUnnattendanceGroup',upload.none(),[Auth.isAuth,Auth.isDirector_and_tecaher],Controller.reviewAttendanceGroup);
export default router;
