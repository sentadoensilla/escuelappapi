import express from "express";
import Controller from "../controllers/AcademicController.js";
import ControllerExport from "../controllers/AcademicControllerExport.js";
import * as __mod0 from "../middlware/uploadImages.js";
import Auth from "../middlware/jwtoken.js";
const router = express.Router();
const {
  upload,
  uploadPath,
  uploadResponse,
  uploadExcusa
} = __mod0;
//EXAMS
//VER EL EXAMEN, LAS PREGUNTAS Y OPCIONES
router.post('/consultExams', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], upload.none(), Controller.exams);
router.post('/addExam', [Auth.isAuth, Auth.isDirector_and_tecaher], upload.single('file'), Controller.createExam);
router.post('/DeleteExams', [Auth.isAuth, Auth.isDirector_and_tecaher], upload.none(), Controller.Deleteexams);
//ESTUDIANTE TERMINA EL EXAMEN Y EL SISTEMA CALIFICA
router.post('/calificate', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], upload.none(), Controller.Calification);
//DOCENTES PUEDEN CAMBIAR O CALIFICAR EXAMENES
router.post('/rate_Exams', [Auth.isAuth, Auth.isDirector_and_tecaher], upload.none(), Controller.showExamsResults);
router.post('/view_Exam', [Auth.isAuth, Auth.isAuth], upload.none(), Controller.showExams);
router.post('/save_rateExams', [Auth.isAuth, Auth.isAuth], upload.none(), Controller.saveExamsResults);
//GET ANSWER EXAM TO TEAHCER,STUNDENT,ADMIN, WHEN IT TRY VERIFY IT
router.post('/examsResult', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], upload.none(), Controller.examsResult);
router.post('/consultGroups', [Auth.isAuth, Auth.isDirector_and_tecaher], upload.none(), Controller.group);
router.post('/consultGroupsFilter', [Auth.isAuth, Auth.isDirector_and_tecaher], upload.none(), Controller.groupFilter);
router.post('/getStudentsParent', [Auth.isAuth, Auth.isAcudiente_and_estudiante], upload.none(), Controller.listStudentsParent);
router.post('/listStudent', [Auth.isAuth, Auth.isDirector_and_tecaher], upload.none(), Controller.listStudentsGroup);
router.post('/listSedes', [Auth.isAuth, Auth.isDirector_and_tecaher], upload.none(), Controller.listaSedes);

//EXPORTAR ASISTENCIAS
router.get('/listAttendanceExport', [Auth.isAuth, Auth.isDirector_and_tecaher], upload.none(), ControllerExport.listAttendance);
router.get('/listAttendanceAdminExport', [Auth.isAuth, Auth.isDirector_and_tecaher], upload.none(), ControllerExport.listAttendanceAdmin);
router.get('/listAttendanceExportDetail', [Auth.isAuth, Auth.isDirector_and_tecaher], upload.none(), ControllerExport.listAttendanceDetail);
router.post('/listUnnattendance', [Auth.isAuth, Auth.isDirector_and_tecaher], upload.none(), Controller.reviewAttendance);
router.post('/listUnnattendanceGroup', [Auth.isAuth, Auth.isDirector_and_tecaher], upload.none(), Controller.reviewAttendanceGroup);
//AUSENTISMO EN COLEGIOS
router.post('/listUnnattendanceGlobal', [Auth.isAuth, Auth.isDirector_and_tecaher], upload.none(), Controller.reviewAttendanceGlobal);
router.post('/listUnnattendanceGroupGlobal', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], upload.none(), Controller.reviewAttendanceGroupGlobal);
router.post('/listAttendanceMe', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], upload.none(), Controller.listAttendancePersonal);
router.post('/getAsigments', [Auth.isAuth, Auth.isDirector_and_tecaher], upload.none(), Controller.asigmentsTeachersUnique);
router.post('/getAsigmentsStudent', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], upload.none(), Controller.getListAssigments);
router.get('/typeIntento', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], upload.none(), Controller.typeInt);
router.post('/consulExamsbyId', [Auth.isAuth, Auth.isDirector_and_tecaher], upload.none(), Controller.examsbyid);
router.post('/examsAdmin', [Auth.isAuth, Auth.Admin_academico], upload.none(), Controller.examAdmin);
router.get('/typePre', [Auth.isAuth, Auth.isDirector_and_tecaher], upload.none(), Controller.tyPre);
router.post('/add_questions', [Auth.isAuth, Auth.isDirector_and_tecaher], upload.none(), Controller.addQuestions);
router.get('/ano_lectivo', [Auth.isAuth, Auth.isDirector_and_tecaher], upload.none(), Controller.anoLectivo);
router.post('/Schools', [Auth.isAuth, Auth.isDirector_and_tecaher], upload.none(), Controller.Schools);
router.put('/changePassword', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], upload.none(), Controller.changepass);
router.post('/asigments', [Auth.isAuth, Auth.isDirector_and_tecaher], upload.none(), Controller.Asigments);
router.post('/edit_exam', [Auth.isAuth, Auth.isDirector_and_tecaher], upload.single('file'), Controller.updateExams);
router.post('/delete_tasks', [Auth.isAuth, Auth.isDirector_and_tecaher], upload.single('file'), Controller.DeleteTaks);
router.post('/deleteQuestions', upload.none(), Controller.deleteQuestion);
router.post('/editQuestion', upload.none(), Controller.upateQuestions);

//TASK 
router.post('/add_task', [Auth.isAuth, Auth.isDirector_and_tecaher], uploadPath.any(), Controller.CreateTask);
router.post('/view_Homework', [Auth.isAuth, Auth.isAuth], upload.none(), Controller.showHomework);
router.post('/rate_Homework', [Auth.isAuth, Auth.isAuth], upload.none(), Controller.showHomeworkResults);
router.post('/save_rateHomework', [Auth.isAuth, Auth.isAuth], upload.none(), Controller.saveHomeworkResults);
//router.post('/answer_Homework',uploadResponse.any(),[Auth.isAuth,Auth.isAuth],Controller.AnswerTask);
router.post('/answer_Homework', [Auth.isAuth, Auth.isAuth], uploadResponse.array('file', 3), Controller.AnswerTask);
router.post('/taskStudents', [Auth.isAuth, Auth.isAcudiente_and_estudiante], upload.none(), Controller.taskStudents);
router.post('/taskDocents', [Auth.isAuth, Auth.isDirector_and_tecaher], upload.none(), Controller.taskDocents);
router.post('/update_task', [Auth.isAuth, Auth.isDirector_and_tecaher], uploadPath.any(), Controller.UpdateTask);
//router.post('/update_task',uploadAll.array('file',3),[Auth.isAuth,Auth.isDirector_and_tecaher],Controller.UpdateTask);

//EXCUSAS
router.post('/sendExcusa', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], uploadExcusa.array('file', 3), Controller.sendExcuse);
router.post('/listExcusa', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], upload.none(), Controller.listExcuse);
router.post('/listExcusaOpen', [], upload.none(), Controller.listExcuseOpen);
router.post('/deleteExcusa', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], upload.none(), Controller.deleteExcuse);
router.post('/listExcusaGroup', [Auth.isAuth, Auth.isDirector_and_tecaher], upload.none(), Controller.listExcuseGroup);
router.post('/consultTipoExcusa', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], upload.none(), Controller.listTipoExcusa);
router.post('/answerExcusa', [Auth.isAuth, Auth.isAuth], upload.none(), Controller.excusasComments);

//################################################  FOR ADMINS #############################################################
//AUSENTISMO EN COLEGIOS
//router.post('/listUnnattendanceGlobal',upload.none(),[Auth.isAuth,Auth.isDirector_and_tecaher],Controller.reviewAttendanceGlobal);
//router.post('/listUnnattendanceGroupGlobal',upload.none(),[Auth.isAuth,Auth.isDirector_and_tecaher],Controller.reviewAttendanceGroupGlobal);
export default router;
