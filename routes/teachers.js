const express = require('express');
const router = express.Router();
const Controller = require('../controllers/TeacherController');
const Masivo = require('../controllers/DocenteMasivo');
const Auth = require('../middlware/jwtoken')
const {upload} = require('../middlware/uploadImages');

router.post('/registro',upload.none(),[Auth.isAuth,Auth.isDirector_and_tecaher],Controller.RegisterTeachers);
router.post('/masivo',upload.none(),[Auth.isAuth,Auth.isDirector_and_tecaher],Masivo.createTeacher);
router.post('/allteachers',upload.none(),[Auth.isAuth,Auth.Admin_academico],Controller.Allteachers);
router.put('/delteachers',upload.none(),[Auth.isAuth,Auth.Admin_academico],Controller.deleteTeachers);
router.put('/UpdateDocents',upload.none(),[Auth.isAuth,Auth.Admin_academico],Controller.updateTeachers);
module.exports = router  