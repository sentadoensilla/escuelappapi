const express = require("express");
const router = express.Router();
const Controller = require("../controllers/generalData");
const { upload } = require('../middlware/uploadImages');
// LIST tipocampana REGISTERS ID MASQUERADE
router.get("/getestados", upload.none(), Controller.listEstados);
router.post("/checkemail", upload.none(), Controller.validMails);
router.post('/listGroups',upload.none(),Controller.group);
router.post('/listMotivos',upload.none(),Controller.motivosList);

module.exports = router;