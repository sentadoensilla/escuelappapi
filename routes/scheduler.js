const express = require('express');
const router = express.Router();
const Controller = require('../scheduler/controllers/scheduler.controller');
const {upload,uploadAlert} = require('../middlware/uploadImages');
const Auth = require('../middlware/jwtoken');

//OBSERVADOR
router.post('/getData',[Auth.isAuth,Auth.isAcademico_and_estudiante_and_teacher],uploadAlert.none(),Controller.getData);
router.post('/crudActions',[Auth.isAuth,Auth.isAcademico_and_estudiante_and_teacher],upload.none(),Controller.crudActions);

module.exports = router;