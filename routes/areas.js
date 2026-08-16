const express = require('express');
const router = express.Router();


const Controller = require('../controllers/AreasController');

const Auth = require('../middlware/jwtoken');
const {upload} = require('../middlware/uploadImages');

router.post(
    '/listado',
    upload.none(),
    Controller.areaListado
);



module.exports = router 