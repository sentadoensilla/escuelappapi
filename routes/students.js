import express from "express";
import Controller from "../controllers/StudentsControllers.js";
import Masivo from "../controllers/DocenteMasivo.js";
import Auth from "../middlware/jwtoken.js";
import * as __mod0 from "../middlware/uploadImages.js";
const router = express.Router();
const {
  upload
} = __mod0;
router.post('/registro', upload.none(), [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], Controller.Register);
router.post('/allstudents', upload.none(), [Auth.isAuth, Auth.isDirector_and_tecaher], Controller.Allstudents);
router.post('/UpdateStudents', upload.none(), [Auth.isAuth, Auth.isDirector_and_tecaher], Controller.updateStudents);
router.post('/delstudents', upload.none(), [Auth.isAuth, Auth.isDirector_and_tecaher], Controller.deleteStudents);
export default router;
