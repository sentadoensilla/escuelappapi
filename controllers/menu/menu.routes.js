const express = require('express');
const router = express.Router();
const Controller = require('../menuController');
const Auth = require('../../middlware/jwtoken');


router.post('/menulist',[Auth.isAuth,Auth.isAcademico_and_estudiante_and_teacher], Controller.menuSelect);
router.post('/menuadd', [Auth.isAuth,Auth.isAcademico_and_estudiante_and_teacher], Controller.menuInsert);  //
router.post('/menudelete',[Auth.isAuth,Auth.isAcademico_and_estudiante_and_teacher], Controller.menuDelete);
router.post('/menuupdate',[Auth.isAuth,Auth.isAcademico_and_estudiante_and_teacher], Controller.menuUpdate);

module.exports = router 