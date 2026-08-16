const express = require('express');
const router = express.Router();
const Controller = require('../controllers/linkables');
const Auth = require('../middlware/jwtoken');


router.get('/avisos',[Auth.isAuth,Auth.isAcademico_and_estudiante_and_teacher],Controller.showAviso);

module.exports = router 