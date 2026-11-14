import express from "express";
import Controller from "./vinculacionController.js";
import Auth from "../../middlware/jwtoken.js";
import { whatsappGuard } from "./helpers.js";
const router = express.Router();

// Generar QR/link de vinculación (código de un solo uso).
router.post("/vinculacion/generar", [Auth.isAuth, whatsappGuard], Controller.vinculacionGenerar);
// Consultar estado de vinculación de una persona.
router.post("/vinculacion/estado", [Auth.isAuth, whatsappGuard], Controller.vinculacionEstado);
// Revocar consentimiento.
router.post("/vinculacion/revocar", [Auth.isAuth, whatsappGuard], Controller.vinculacionRevocar);

export default router;
