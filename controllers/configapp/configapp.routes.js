import express from "express";
import Controller from "./configappController.js";
import Auth from "../../middlware/jwtoken.js";
const router = express.Router();
// ===== Ayuda (data.aeayuda) =====
router.post('/ayuda/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.ayudaListar);
router.post('/ayuda/registrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.ayudaRegistrar);
router.post('/ayuda/actualizar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.ayudaActualizar);
router.post('/ayuda/borrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.ayudaBorrar);

// ===== Condiciones (data.aecondiciones) =====
router.post('/condiciones/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.condicionListar);
router.post('/condiciones/registrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.condicionRegistrar);
router.post('/condiciones/borrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.condicionBorrar);

// ===== Solicitudes (data.aesolicitud) =====
router.post('/solicitudes/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.solicitudListar);
router.post('/solicitudes/registrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.solicitudRegistrar);
router.post('/solicitudes/actualizar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.solicitudActualizar);
router.post('/solicitudes/borrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.solicitudBorrar);

// ===== Mediciones (data.aemediciones) =====
router.post('/mediciones/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.medicionListar);
router.post('/mediciones/registrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.medicionRegistrar);
router.post('/mediciones/actualizar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.medicionActualizar);
router.post('/mediciones/borrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.medicionBorrar);

// ===== Tipos de certificado (data.aetipo_certificado) =====
router.post('/tiposcertificado/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.tipocertificadoListar);
router.post('/tiposcertificado/registrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.tipocertificadoRegistrar);
router.post('/tiposcertificado/actualizar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.tipocertificadoActualizar);
router.post('/tiposcertificado/borrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.tipocertificadoBorrar);

// ===== Avisos internos (data.aeavisosinternal) =====
router.post('/avisosinternos/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.avisointernoListar);
router.post('/avisosinternos/registrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.avisointernoRegistrar);
router.post('/avisosinternos/actualizar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.avisointernoActualizar);
router.post('/avisosinternos/borrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.avisointernoBorrar);

// ===== Comentarios de avisos internos (data.aeavisosinternal_comentarios) =====
router.post('/avisosinternos/comentarios/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.avisointcomentarioListar);
router.post('/avisosinternos/comentarios/registrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.avisointcomentarioRegistrar);
router.post('/avisosinternos/comentarios/borrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.avisointcomentarioBorrar);

// ===== Alertas de publicación (data.aepublicaciones_alerta) =====
router.post('/pubalertas/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.pubalertaListar);
router.post('/pubalertas/registrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.pubalertaRegistrar);
router.post('/pubalertas/borrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.pubalertaBorrar);

// ===== Tipos de citación (data.tipo_citacion) =====
router.post('/tiposcitacion/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.tipocitacionListar);
router.post('/tiposcitacion/registrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.tipocitacionRegistrar);
router.post('/tiposcitacion/actualizar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.tipocitacionActualizar);
router.post('/tiposcitacion/borrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.tipocitacionBorrar);
export default router;
