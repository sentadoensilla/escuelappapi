/**
 * catalogos.routes.js
 * Rutas del CRUD genérico de catálogos SAE.
 *
 * Parámetro :tabla (clave del catálogo). Valores válidos:
 *   grados, jornadas, sexos, parentescos, tiposdocumento, tiposnovedad,
 *   tiposnota, tiposdesempeno, tiposvinculacion, tipossangre, tipossubsidio,
 *   cargos, estadoscurso, estadosgrado, estadosgenerales, estratos, sisben,
 *   zonasresidencia, etnias, resguardos, discapacidades, capacidades, conflictos,
 *   fuentesrecursos, caracter, especialidades, metodosinstitucionales,
 *   escalanacional, escalacualitativa, empresas, icbf, departamentos, ciudades.
 */
const express = require('express');
const router = express.Router();
const Controller = require('./catalogosController');
const Auth = require('../../middlware/jwtoken');

// Listar los registros de un catálogo (admin académico o administrador).
router.post('/listar/:tabla', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.catalogosListar);

// Registrar un nuevo registro en un catálogo (admin académico o administrador).
router.post('/registrar/:tabla', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.catalogosRegistrar);

// Actualizar un registro de un catálogo (admin académico o administrador).
router.post('/actualizar/:tabla', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.catalogosActualizar);

// Borrar (lógico) un registro de un catálogo (admin académico o administrador).
router.post('/borrar/:tabla', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.catalogosBorrar);

module.exports = router;
