import express from "express";
import Controller from "./estadisticassaeController.js";
import Auth from "../../middlware/jwtoken.js";
const router = express.Router();
// Total de matrículas activas (por institución opcional).
router.post('/matriculatotal', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.matriculaTotal);
// Matrículas agrupadas por sexo.
router.post('/porsexo', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.matriculaPorSexo);
// Matrículas agrupadas por etnia.
router.post('/poretnia', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.matriculaPorEtnia);
// Matrículas agrupadas por grado.
router.post('/porgrado', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.matriculaPorGrado);
// Resumen general del dashboard.
router.post('/resumen', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.resumen);
export default router;
