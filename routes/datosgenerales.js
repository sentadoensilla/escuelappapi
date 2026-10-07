import express from "express";
import Controller from "../controllers/DatosGeneralesController.js";
import Auth from "../middlware/jwtoken.js";
import * as __mod0 from "../middlware/uploadImages.js";
const router = express.Router();
const {
  upload
} = __mod0;
router.post('/institucioneslistado', upload.none(), [Auth.isAuth, Auth.isAuth], Controller.institucionesList);
router.post('/tipopublicacionlistado', upload.none(), [Auth.isAuth, Auth.isAuth], Controller.tipoPublicacionesList);
export default router;
