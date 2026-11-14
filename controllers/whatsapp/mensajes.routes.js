import express from "express";
import Controller from "./mensajesController.js";
import Auth from "../../middlware/jwtoken.js";
import { whatsappGuard } from "./helpers.js";
const router = express.Router();

// Consulta de mensajes: Admin ve todos (puede filtrar por idempresa); Institución solo los suyos.
router.post("/mensajes/consultar", [Auth.isAuth, whatsappGuard], Controller.mensajesConsultar);
// Estadísticas de mensajes por día (gráfico).
router.post("/mensajes/estadisticas", [Auth.isAuth, whatsappGuard], Controller.mensajesEstadisticas);

export default router;
