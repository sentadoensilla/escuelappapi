import express from "express";
import Controller from "../controllers/EmisorController.js";
import Auth from "../middlware/jwtoken.js";
import * as __mod0 from "../middlware/uploadImages.js";
const router = express.Router();
const {
  upload
} = __mod0;
router.post('/deleteemisor', upload.none(), [Auth.isAuth, Auth.Admin_academico], Controller.deleteWhatsapp);
export default router;
