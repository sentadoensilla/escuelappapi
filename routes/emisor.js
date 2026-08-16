const express = require('express');
const router = express.Router();
const Controller = require('../controllers/EmisorController')
const Auth = require('../middlware/jwtoken')
const { upload } = require('../middlware/uploadImages');


router.post('/deleteemisor', upload.none(), [Auth.isAuth,Auth.Admin_academico], Controller.deleteWhatsapp);

module.exports = router 