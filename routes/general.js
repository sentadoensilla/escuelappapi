import express from "express";
import Controller from "../controllers/generalData.js";
import * as __mod0 from "../middlware/uploadImages.js";
const router = express.Router();
const {
  upload
} = __mod0;
// LIST tipocampana REGISTERS ID MASQUERADE
router.get("/getestados", upload.none(), Controller.listEstados);
router.post("/checkemail", upload.none(), Controller.validMails);
router.post('/listGroups', upload.none(), Controller.group);
router.post('/listMotivos', upload.none(), Controller.motivosList);
export default router;
