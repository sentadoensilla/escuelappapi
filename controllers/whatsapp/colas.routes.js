import express from "express";
import Controller from "./colasController.js";
import Auth from "../../middlware/jwtoken.js";
import { whatsappGuard } from "./helpers.js";
const router = express.Router();

router.post("/colas/pausar", [Auth.isAuth, whatsappGuard], Controller.colaPausar);
router.post("/colas/reanudar", [Auth.isAuth, whatsappGuard], Controller.colaReanudar);
router.post("/colas/detener", [Auth.isAuth, whatsappGuard], Controller.colaDetener);
router.post("/colas/eliminar", [Auth.isAuth, whatsappGuard], Controller.colaEliminar);

export default router;
