import express from "express";
import Controller from "../controllers/linkables.js";
import Auth from "../middlware/jwtoken.js";
const router = express.Router();
router.get('/avisos', [Auth.isAuth, Auth.isAcademico_and_estudiante_and_teacher], Controller.showAviso);
export default router;
