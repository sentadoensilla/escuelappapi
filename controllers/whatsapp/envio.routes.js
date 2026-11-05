import express from "express";
import Controller from "./envioController.js";
import Auth from "../../middlware/jwtoken.js";
import { whatsappGuard } from "./helpers.js";
const router = express.Router();

// Encolar envío(s) de WhatsApp (valida LID salvo modo test APP_WP_NUMBERTEST).
router.post("/enviar", [Auth.isAuth, whatsappGuard], Controller.enviar);
// Validar LID/consentimiento de un destinatario (función independiente).
router.post("/lid/validar", [Auth.isAuth, whatsappGuard], Controller.validar);

export default router;
