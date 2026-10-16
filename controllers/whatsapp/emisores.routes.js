import express from "express";
import Controller from "./emisoresController.js";
import Auth from "../../middlware/jwtoken.js";
import { whatsappGuard } from "./helpers.js";
const router = express.Router();

// Listar emisores (Admin: todos; Institución: los suyos).
router.post("/emisores/listar", [Auth.isAuth, whatsappGuard], Controller.emisorListar);
// Vincular el número del emisor de la institución.
router.post("/emisores/vincular", [Auth.isAuth, whatsappGuard], Controller.emisorVincular);
// QR vigente de la sesión del emisor.
router.post("/emisores/qr", [Auth.isAuth, whatsappGuard], Controller.emisorQr);
// Eliminar emisor (conserva historial de mensajes).
router.post("/emisores/eliminar", [Auth.isAuth, whatsappGuard], Controller.emisorEliminar);

export default router;
