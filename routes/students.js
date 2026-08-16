const express = require('express');
const router = express.Router();
const Controller = require('../controllers/StudentsControllers');
const Masivo = require('../controllers/DocenteMasivo');
const Auth = require('../middlware/jwtoken')
const {upload} = require('../middlware/uploadImages');


router.post('/registro',upload.none(),[Auth.isAuth,Auth.isAcademico_and_estudiante_and_teacher],Controller.Register);
router.post('/allstudents',upload.none(),[Auth.isAuth,Auth.isDirector_and_tecaher],Controller.Allstudents);
router.post('/UpdateStudents',upload.none(),[Auth.isAuth,Auth.isDirector_and_tecaher],Controller.updateStudents);
router.post('/delstudents',upload.none(),[Auth.isAuth,Auth.isDirector_and_tecaher],Controller.deleteStudents);

module.exports = router  