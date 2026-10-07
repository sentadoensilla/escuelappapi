import express from "express";
import Controller from "./integrationController.js";
import Auth from "../../middlware/jwtoken.js";
const router = express.Router();
// ===== Adaptadores de identidad (Escuelapp lee SAE) =====
// Dado un acudiente (por identificación), devuelve sus estudiantes SAE.
router.post('/familia/mis-estudiantes', [Auth.isAuth, Auth.isAcudiente_and_estudiante_and_institucion], Controller.misEstudiantes);

// ===== Eventos (disparan la notificación a las familias) =====
// Asistencia/novedad: procesa la notificación desde public.tabnove.
router.post('/eventos/asistencia', [Auth.isAuth, Auth.Admin_academico], Controller.eventoAsistencia);
// Comunicado: procesa la notificación desde public.tabavisroll (o modo demo).
router.post('/eventos/comunicado', [Auth.isAuth, Auth.Admin_academico], Controller.eventoComunicado);

// ===== Enlace seguro (público: el token es la autorización) =====
// El padre abre el enlace → valida, registra acceso y consulta SAE.
router.get('/enlace/:token', Controller.abrirEnlace);

// ===== Configuración institución SAE → emisor WhatsApp =====
// Listar instituciones SAE con su emisor (para configurar).
router.post('/config/instituciones', [Auth.isAuth, Auth.Admin], Controller.institucionesConfig);
// Mapear institución SAE (cinstid) a la institución Escuelapp con cuenta WhatsApp.
router.post('/config/emisor-institucion', [Auth.isAuth, Auth.Admin], Controller.guardarEmisorInstitucion);
export default router;
