import express from "express";
import Controller from "../menuController.js";
import Auth from "../../middlware/jwtoken.js";
const router = express.Router();
router.post('/menulist', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], Controller.menuSelect);
router.post('/menuadd', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], Controller.menuInsert); //
router.post('/menudelete', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], Controller.menuDelete);
router.post('/menuupdate', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], Controller.menuUpdate);
export default router;
