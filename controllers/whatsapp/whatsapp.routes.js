import express from "express";
import emisores from "./emisores.routes.js";
import configuracion from "./configuracion.routes.js";
import colas from "./colas.routes.js";
import mensajes from "./mensajes.routes.js";
import vinculacion from "./vinculacion.routes.js";

// Router agregado del módulo WhatsApp. Se monta en /whatsapp desde routes/index.js.
const router = express.Router();
router.use("/", emisores);
router.use("/", configuracion);
router.use("/", colas);
router.use("/", mensajes);
router.use("/", vinculacion);

export default router;
