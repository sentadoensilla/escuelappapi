import express from "express";
import Controller from "../controllers/TeacherController.js";
import Masivo from "../controllers/DocenteMasivo.js";
import Auth from "../middlware/jwtoken.js";
import * as __mod0 from "../middlware/uploadImages.js";
const router = express.Router();
const {
  upload
} = __mod0;
router.post('/registro', upload.none(), [Auth.isAuth, Auth.isDirector_and_tecaher], Controller.RegisterTeachers);
router.post('/masivo', upload.none(), [Auth.isAuth, Auth.isDirector_and_tecaher], Masivo.createTeacher);
router.post('/allteachers', upload.none(), [Auth.isAuth, Auth.Admin_academico], Controller.Allteachers);
router.put('/delteachers', upload.none(), [Auth.isAuth, Auth.Admin_academico], Controller.deleteTeachers);
router.put('/UpdateDocents', upload.none(), [Auth.isAuth, Auth.Admin_academico], Controller.updateTeachers);
export default router;
