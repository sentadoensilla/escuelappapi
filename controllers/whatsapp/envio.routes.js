import express from "express";
import Controller from "./envioController.js";
import Auth from "../../middlware/jwtoken.js";
import { whatsappGuard, adminGuard } from "./helpers.js";
const router = express.Router();

// Encolar envío(s) de WhatsApp (valida LID salvo modo test APP_WP_NUMBERTEST).
router.post("/enviar", [Auth.isAuth, whatsappGuard], Controller.enviar);
// Notificar a una audiencia (docentes / estudiantes / grupos / instituciones).
router.post("/notificar", [Auth.isAuth, whatsappGuard], Controller.notificar);
// Listar instituciones (Admin) para elegir destinatarios.
router.post("/instituciones", [Auth.isAuth, adminGuard], Controller.instituciones);
// Validar LID/consentimiento de un destinatario (función independiente).
router.post("/lid/validar", [Auth.isAuth, whatsappGuard], Controller.validar);

export default router;
