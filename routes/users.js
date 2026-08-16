const express = require('express');
const router = express.Router();
const Controller = require('../controllers/AuthController');
const Utilidades = require('../controllers/changePassword');
const Auth = require('../middlware/jwtoken');
const {upload} = require('../middlware/uploadImages');

router.post('/login',upload.none(),Controller.login);
router.post('/resetpass',upload.none(), Utilidades.sendReset);
router.get('/sendmepass',upload.none(), Utilidades.sendReset);
router.post('/rememberpass',upload.none(),[Auth.isAuth,Auth.isDirector_and_tecaher],Utilidades.Sendmail)

module.exports = router 