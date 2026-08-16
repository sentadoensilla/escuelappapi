const express = require('express');
const router = express.Router();
const Controller = require('../controllers/horarioController');
const {upload} = require('../middlware/uploadImages');
const Auth = require('../middlware/jwtoken');



router.post('/registro',upload.none(),[Auth.isAuth,Auth.isDirector_and_tecaher],Controller.Create);
router.post('/horario',upload.none(),[Auth.isAuth,Auth.isAcudiente_and_estudiante_and_institucion],Controller.Horario);
router.post('/horarioseguimiento',upload.none(),[Auth.isAuth,Auth.isAcudiente_and_estudiante_and_institucion],Controller.HorarioSeguimiento);
router.post('/horarioTeachers',upload.none(),[Auth.isAuth,Auth.isTeacher],Controller.HorariTeacher_doc);
router.post('/updateAsignments',upload.none(),[Auth.isAuth,Auth.isDirector_and_tecaher],Controller.UpdateHorario);
router.post('/deleteHorario',upload.none(),[Auth.isAuth,Auth.isDirector_and_tecaher],Controller.DeleteHorario);

module.exports = router  