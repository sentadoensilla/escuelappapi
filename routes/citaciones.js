const express = require('express');
const router = express.Router();
const Controller = require('../controllers/CitacionesController');
const Auth = require('../middlware/jwtoken')
const {upload,uploadAlert} = require('../middlware/uploadImages');

router.post('/citacionesList',[Auth.isAuth,Auth.isAcademico_and_estudiante_and_teacher],upload.none(),Controller.citacionesListar);
router.post('/citacionesNew',[Auth.isAuth,Auth.isAcademico_and_estudiante_and_teacher],uploadAlert.any(),Controller.citacionesRegistrar);
router.post('/citacionesDelete',[Auth.isAuth,Auth.isAcademico_and_estudiante_and_teacher],upload.none(),Controller.citacionesBorrar);
router.post('/citacionesUpdate',[Auth.isAuth,Auth.isAcademico_and_estudiante_and_teacher],upload.none(),Controller.citacionesActualizar);

module.exports = router  