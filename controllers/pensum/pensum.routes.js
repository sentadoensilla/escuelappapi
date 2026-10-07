import express from "express";
import Controller from "./pensumController.js";
import Auth from "../../middlware/jwtoken.js";
const router = express.Router();
// ===== Áreas (public.tabarea) =====
// Listar áreas del saber.
router.post('/areas/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.areaListar);
// Registrar un área del saber.
router.post('/areas/registrar', [Auth.isAuth, Auth.Admin_academico], Controller.areaRegistrar);
// Actualizar un área del saber.
router.post('/areas/actualizar', [Auth.isAuth, Auth.Admin_academico], Controller.areaActualizar);
// Borrar (lógico) un área del saber.
router.post('/areas/borrar', [Auth.isAuth, Auth.Admin_academico], Controller.areaBorrar);

// ===== Asignaturas (public.tabasig) =====
// Listar asignaturas.
router.post('/asignaturas/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.asignaturaListar);
// Registrar una asignatura.
router.post('/asignaturas/registrar', [Auth.isAuth, Auth.Admin_academico], Controller.asignaturaRegistrar);
// Actualizar una asignatura.
router.post('/asignaturas/actualizar', [Auth.isAuth, Auth.Admin_academico], Controller.asignaturaActualizar);
// Borrar (lógico) una asignatura.
router.post('/asignaturas/borrar', [Auth.isAuth, Auth.Admin_academico], Controller.asignaturaBorrar);

// ===== Áreas por institución (public.instarea) =====
// Listar las áreas habilitadas para una institución.
router.post('/instarea/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.instareaListar);
// Asignar un área a una institución.
router.post('/instarea/registrar', [Auth.isAuth, Auth.Admin_academico], Controller.instareaRegistrar);
// Retirar un área de una institución (lógico).
router.post('/instarea/borrar', [Auth.isAuth, Auth.Admin_academico], Controller.instareaBorrar);

// ===== Contenidos programáticos (public.tabcontprog) =====
// Listar contenidos programáticos (por asignatura opcional).
router.post('/contenidos/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.contenidoListar);
// Registrar un contenido programático.
router.post('/contenidos/registrar', [Auth.isAuth, Auth.Admin_academico], Controller.contenidoRegistrar);
// Actualizar un contenido programático.
router.post('/contenidos/actualizar', [Auth.isAuth, Auth.Admin_academico], Controller.contenidoActualizar);
// Borrar (lógico) un contenido programático.
router.post('/contenidos/borrar', [Auth.isAuth, Auth.Admin_academico], Controller.contenidoBorrar);

// ===== Contenido por asignación-curso (public.asigcurscontprog) =====
// Listar contenidos de una asignación-curso.
router.post('/asigcurscontprog/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.asigcurscontprogListar);
// Asignar un contenido a una asignación-curso.
router.post('/asigcurscontprog/registrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.asigcurscontprogRegistrar);
// Retirar un contenido de una asignación-curso (lógico).
router.post('/asigcurscontprog/borrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.asigcurscontprogBorrar);

// ===== Configuración de áreas (public.tabareaconf) =====
// Listar configuraciones de área por institución/año.
router.post('/areaconf/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.areaconfListar);
// Registrar una configuración de área (ponderación).
router.post('/areaconf/registrar', [Auth.isAuth, Auth.Admin_academico], Controller.areaconfRegistrar);
// Actualizar una configuración de área.
router.post('/areaconf/actualizar', [Auth.isAuth, Auth.Admin_academico], Controller.areaconfActualizar);
// Borrar (lógico) una configuración de área.
router.post('/areaconf/borrar', [Auth.isAuth, Auth.Admin_academico], Controller.areaconfBorrar);
export default router;
