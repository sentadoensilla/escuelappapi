import express from "express";
import Controller from "./disciplinaController.js";
import Auth from "../../middlware/jwtoken.js";
const router = express.Router();
// ===== Disciplinas (public.tabdisci) =====
router.post('/disciplinas/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.disciplinaListar);
router.post('/disciplinas/registrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.disciplinaRegistrar);
router.post('/disciplinas/actualizar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.disciplinaActualizar);
router.post('/disciplinas/borrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.disciplinaBorrar);

// ===== Disciplina por institución (public.tabdiscinst) =====
router.post('/discinst/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.discinstListar);
router.post('/discinst/registrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.discinstRegistrar);
router.post('/discinst/actualizar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.discinstActualizar);
router.post('/discinst/borrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.discinstBorrar);

// ===== Notas de disciplina (public.tabdiscnota) =====
router.post('/discnotas/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.discnotaListar);
router.post('/discnotas/registrar', [Auth.isAuth, Auth.isDirector_and_tecaher], Controller.discnotaRegistrar);
router.post('/discnotas/actualizar', [Auth.isAuth, Auth.isDirector_and_tecaher], Controller.discnotaActualizar);
router.post('/discnotas/borrar', [Auth.isAuth, Auth.isDirector_and_tecaher], Controller.discnotaBorrar);
export default router;
