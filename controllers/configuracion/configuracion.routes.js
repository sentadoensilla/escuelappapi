/**
 * configuracion.routes.js
 * Rutas del módulo de configuración académica SAE (escalas, SIE, certificados,
 * constancias, paz y salvo y firmas).
 */
const express = require('express');
const router = express.Router();
const Controller = require('./configuracionController');
const Auth = require('../../middlware/jwtoken');

// ===== Escalas de calificación (public.tabesca) =====
// Listar escalas por institución.
router.post('/escalas/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.escalaListar);
// Registrar una escala de calificación.
router.post('/escalas/registrar', [Auth.isAuth, Auth.Admin_academico], Controller.escalaRegistrar);
// Actualizar una escala de calificación.
router.post('/escalas/actualizar', [Auth.isAuth, Auth.Admin_academico], Controller.escalaActualizar);
// Borrar una escala de calificación.
router.post('/escalas/borrar', [Auth.isAuth, Auth.Admin_academico], Controller.escalaBorrar);

// ===== SIE (public.tabsie) =====
// Listar registros SIE por institución.
router.post('/sie/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.sieListar);
// Registrar un SIE.
router.post('/sie/registrar', [Auth.isAuth, Auth.Admin_academico], Controller.sieRegistrar);
// Actualizar un SIE.
router.post('/sie/actualizar', [Auth.isAuth, Auth.Admin_academico], Controller.sieActualizar);

// ===== Certificados (public.tabcerti) =====
// Listar certificados por institución.
router.post('/certificados/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.certificadoListar);
// Registrar un certificado.
router.post('/certificados/registrar', [Auth.isAuth, Auth.Admin_academico], Controller.certificadoRegistrar);
// Actualizar un certificado.
router.post('/certificados/actualizar', [Auth.isAuth, Auth.Admin_academico], Controller.certificadoActualizar);
// Borrar un certificado.
router.post('/certificados/borrar', [Auth.isAuth, Auth.Admin_academico], Controller.certificadoBorrar);

// ===== Constancias (public.tabcons) =====
// Listar constancias por institución.
router.post('/constancias/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.constanciaListar);
// Registrar una constancia.
router.post('/constancias/registrar', [Auth.isAuth, Auth.Admin_academico], Controller.constanciaRegistrar);
// Actualizar una constancia.
router.post('/constancias/actualizar', [Auth.isAuth, Auth.Admin_academico], Controller.constanciaActualizar);
// Borrar una constancia.
router.post('/constancias/borrar', [Auth.isAuth, Auth.Admin_academico], Controller.constanciaBorrar);

// ===== Paz y salvo (public.tabpazsalv) =====
// Listar plantillas de paz y salvo por institución.
router.post('/pazsalvo/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.pazsalvoListar);
// Registrar una plantilla de paz y salvo.
router.post('/pazsalvo/registrar', [Auth.isAuth, Auth.Admin_academico], Controller.pazsalvoRegistrar);
// Actualizar una plantilla de paz y salvo.
router.post('/pazsalvo/actualizar', [Auth.isAuth, Auth.Admin_academico], Controller.pazsalvoActualizar);

// ===== Firmas (public.tabfirm) =====
// Listar firmas por institución.
router.post('/firmas/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.firmaListar);
// Registrar una firma.
router.post('/firmas/registrar', [Auth.isAuth, Auth.Admin_academico], Controller.firmaRegistrar);
// Actualizar una firma.
router.post('/firmas/actualizar', [Auth.isAuth, Auth.Admin_academico], Controller.firmaActualizar);
// Borrar una firma.
router.post('/firmas/borrar', [Auth.isAuth, Auth.Admin_academico], Controller.firmaBorrar);

module.exports = router;
