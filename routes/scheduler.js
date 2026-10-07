import express from "express";
import Controller from "../scheduler/controllers/scheduler.controller.js";
import * as __mod0 from "../middlware/uploadImages.js";
import Auth from "../middlware/jwtoken.js";
const router = express.Router();
const {
  upload,
  uploadAlert
} = __mod0;
//OBSERVADOR
router.post('/getData', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], uploadAlert.none(), Controller.getData);
router.post('/crudActions', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], upload.none(), Controller.crudActions);
export default router;
