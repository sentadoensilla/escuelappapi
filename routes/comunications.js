import express from "express";
import Controller from "../controllers/pusher.js";
import Controllercoms from "../controllers/comunicationController.js";
import * as __mod0 from "../middlware/uploadImages.js";
import Auth from "../middlware/jwtoken.js";
const router = express.Router();
const {
  upload,
  uploadCrono
} = __mod0;
router.post('/avisos', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], upload.none(), Controller.updateToken);
router.post('/listTeachers', [Auth.isAuth, Auth.isAcudiente_and_estudiante], upload.none(), Controllercoms.viewListAssigments);
//CONSULTAS AL DOCENTE
router.post('/askTeachers', [Auth.isAuth, Auth.isAcudiente_and_estudiante], upload.none(), Controllercoms.sendQuestionTeacher);
router.post('/listTeacherQuery', [Auth.isAuth, Auth.isAcudiente_and_estudiante], upload.none(), Controllercoms.getQuestionTeacher);
router.post('/viewComms', [Auth.isAuth, Auth.isAcudiente_and_estudiante], upload.none(), Controllercoms.getQuestionComments);
router.post('/addComms', [Auth.isAuth, Auth.isAcudiente_and_estudiante], upload.none(), Controllercoms.sendQuestionComments);

//============================================= CRONOGRAMA DE EVENTOS ===================================================
//LISTADO DE EVENTOS EN EL CALENDARIO
router.post('/calendarlist', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], upload.none(), Controllercoms.cronogramaList);
//AGREGAR EVENTO EN EL CALENDARIO
router.post('/calendaradd', [Auth.isAuth, Auth.isDirector_and_tecaher], uploadCrono.none(), Controllercoms.cronogramaInsert);
//AGREGAR EVENTOS USANDO UN CSV
router.post('/calendarload', [Auth.isAuth, Auth.isDirector_and_tecaher], uploadCrono.any(), Controllercoms.cronogramaBulk);
//EDITAR EVENTO EN EL CALENDARIO
router.post('/calendaredit', [Auth.isAuth, Auth.isDirector_and_tecaher], uploadCrono.none(), Controllercoms.cronogramaEdit);
//BORRAR EVENTO EN EL CALENDARIO
router.post('/calendardelete', [Auth.isAuth, Auth.isDirector_and_tecaher], upload.none(), Controllercoms.cronogramaDelete);

//AGREGAR COMENTARIO EN UN EVENTO DEL CALENDARIO
router.post('/calendarcomment', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], uploadCrono.none(), Controllercoms.cronogramaComment);
//ELIMINAR COMENTARIO EN UN EVENTO DEL CALENDARIO
router.post('/calendarcommentdelete', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], uploadCrono.none(), Controllercoms.cronogramaCommentDelete);
//LISTAR COMENTARIO EN UN EVENTO DEL CALENDARIO
router.post('/calendarcommentlist', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], uploadCrono.none(), Controllercoms.cronogramaCommentList);
//EDITAR COMENTARIO EN UN EVENTO DEL CALENDARIO
router.post('/calendarcommentedit', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], uploadCrono.none(), Controllercoms.cronogramaCommentEdit);
//AGREGAR COMENTARIO EN UN EVENTO DEL CALENDARIO
//router.post('/calendarcomment', uploadCrono.none(), [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], Controllercoms.cronogramaComment);
//LISTAR UN TIPO DE EVENTO A UTILIZAR EN EL CALENDARIO
router.post('/calendartipoevento', [Auth.isAuth, Auth.isAuth], uploadCrono.none(), Controllercoms.cronogramaTipoEventoList);
export default router;
