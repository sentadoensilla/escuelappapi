import express from "express";
import Controller from "../controllers/anolectivoController.js";
import * as __mod0 from "../middlware/uploadImages.js";
import Auth from "../middlware/jwtoken.js";
const router = express.Router();
const {
  upload
} = __mod0;
router.post('/listado', upload.none(), Controller.listarAno);
router.post('/listadoroles', upload.none(), Controller.listarRoll);
router.post('/registrarroles', upload.none(), Controller.registrarRoll);
/* router.post('/horario',upload.none(),[Auth.isAuth,Auth.isAcudiente_and_estudiante_and_institucion],Controller.Horario);
router.post('/horarioseguimiento',upload.none(),[Auth.isAuth,Auth.isAcudiente_and_estudiante_and_institucion],Controller.HorarioSeguimiento);
router.post('/horarioTeachers',upload.none(),[Auth.isAuth,Auth.isTeacher],Controller.HorariTeacher_doc);
router.post('/updateAsignments',upload.none(),[Auth.isAuth,Auth.isDirector_and_tecaher],Controller.UpdateHorario);
router.post('/deleteHorario',upload.none(),[Auth.isAuth,Auth.isDirector_and_tecaher],Controller.DeleteHorario);
 */
export default router;
