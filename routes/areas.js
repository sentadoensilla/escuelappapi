import express from "express";
import Controller from "../controllers/AreasController.js";
import Auth from "../middlware/jwtoken.js";
import * as __mod0 from "../middlware/uploadImages.js";
const router = express.Router();
const {
  upload
} = __mod0;
router.post('/listado', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], upload.none(), Controller.areaListado);
export default router;
