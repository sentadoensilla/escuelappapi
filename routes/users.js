import express from "express";
import Controller from "../controllers/AuthController.js";
import Utilidades from "../controllers/changePassword.js";
import Auth from "../middlware/jwtoken.js";
import * as __mod0 from "../middlware/uploadImages.js";
const router = express.Router();
const {
  upload
} = __mod0;
router.post('/login', upload.none(), Controller.login);
router.post('/resetpass', upload.none(), Utilidades.sendReset);
router.get('/sendmepass', upload.none(), Utilidades.sendReset);
router.post('/rememberpass', upload.none(), [Auth.isAuth, Auth.isDirector_and_tecaher], Utilidades.Sendmail);
export default router;
