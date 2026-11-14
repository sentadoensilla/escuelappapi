import express from "express";
import Controller from "./configuracionController.js";
import Auth from "../../middlware/jwtoken.js";
import { whatsappGuard, adminGuard } from "./helpers.js";
const router = express.Router();

// Consultar configuración de velocidad del emisor.
router.post("/config/consultar", [Auth.isAuth, whatsappGuard], Controller.configConsultar);
// Actualizar configuración (velocidad + modo pruebas). Admin apunta por idemisor; Institución la suya.
router.post("/config/actualizar", [Auth.isAuth, whatsappGuard], Controller.configActualizar);
// Activar/desactivar modo de pruebas.
router.post("/pruebas/cambiar", [Auth.isAuth, adminGuard], Controller.pruebasCambiar);

export default router;
