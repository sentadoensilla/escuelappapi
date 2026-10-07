import express from "express";
import Controller from "./migracionController.js";
import Auth from "../../middlware/jwtoken.js";
const router = express.Router();
// ===== Instituciones (migracion.map_institucion) =====
router.post('/instituciones/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.mapInstitucionListar);
router.post('/instituciones/guardar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.mapInstitucionUpsert);
router.post('/instituciones/borrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.mapInstitucionBorrar);

// ===== Docentes (migracion.map_docente) =====
router.post('/docentes/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.mapDocenteListar);
router.post('/docentes/guardar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.mapDocenteUpsert);
router.post('/docentes/borrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.mapDocenteBorrar);

// ===== Estudiantes (migracion.map_estudiante) =====
router.post('/estudiantes/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.mapEstudianteListar);
router.post('/estudiantes/guardar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.mapEstudianteUpsert);
router.post('/estudiantes/borrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.mapEstudianteBorrar);

// ===== Roles (migracion.map_rol) =====
router.post('/roles/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.mapRolListar);
router.post('/roles/guardar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.mapRolUpsert);
router.post('/roles/borrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.mapRolBorrar);

// ===== Usuarios (migracion.map_usuario) =====
router.post('/usuarios/listar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.mapUsuarioListar);
router.post('/usuarios/guardar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.mapUsuarioUpsert);
router.post('/usuarios/borrar', [Auth.isAuth, Auth.isDirector_and_tecaher_and_admin], Controller.mapUsuarioBorrar);
export default router;
