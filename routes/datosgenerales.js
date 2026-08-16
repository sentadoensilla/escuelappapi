const express = require('express');
const router = express.Router();
const Controller = require('../controllers/DatosGeneralesController');
const Auth = require('../middlware/jwtoken')
const {upload} = require('../middlware/uploadImages');

router.post('/institucioneslistado',upload.none(),[Auth.isAuth,Auth.isAuth],Controller.institucionesList);
router.post('/tipopublicacionlistado',upload.none(),[Auth.isAuth,Auth.isAuth],Controller.tipoPublicacionesList);

module.exports = router  