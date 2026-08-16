/**
 * docentesController.js
 * Controlador del módulo de docentes: datos del docente (tabdoce),
 * contratación por institución (tabinstdoce) y asignación académica (asigcurs).
 */
require('dotenv').config();
const Db = require('../../database/conex');
const token = require('../../utils/token');
const sql = require('./docentes.sql');

const ESTADO_INACTIVO = 9;

module.exports = {

    // ================= DOCENTES =================
    /** Listar docentes. */
    async docenteListar(req, res) {
        try {
            const resp = await Db.query({ text: sql.docenteListar, values: [] });
            resp.rows.forEach((f, i) => { resp.rows[i].idregistro = token.encriptar(f.idregistro); });
            res.send({ status: 'success', statusCode: 200, message: resp.rows.length + ' docentes encontrados', rows: resp.rows });
        } catch (error) { console.log('docenteListar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo consultar los docentes', rows: [] }); }
    },

    /** Registrar un docente. */
    async docenteRegistrar(req, res) {
        try {
            const b = req.body;
            if (!b.identificacion) return res.send({ status: 'error', statusCode: 400, message: 'Falta la identificación del docente', rows: [] });
            const resp = await Db.query({
                text: sql.docenteRegistrar,
                values: [b.nombre1, b.nombre2, b.apellido1, b.apellido2, b.fechanacimiento,
                    b.idsexo ? parseInt(token.decriptar(b.idsexo)) : null,
                    b.idtiposangre ? parseInt(token.decriptar(b.idtiposangre)) : null,
                    b.foto, b.idtipodocumento ? parseInt(token.decriptar(b.idtipodocumento)) : null,
                    b.identificacion, b.celular, b.telefono, b.direccion, b.email, b.fechaingreso,
                    b.nombrado ?? false, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8, b.firma]
            });
            res.send({ status: 'success', statusCode: 200, message: 'Docente registrado', rows: { idregistro: token.encriptar(resp.rows[0].idregistro) } });
        } catch (error) { console.log('docenteRegistrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo registrar el docente', rows: [] }); }
    },

    /** Actualizar un docente. */
    async docenteActualizar(req, res) {
        try {
            const b = req.body;
            if (!b.idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({
                text: sql.docenteActualizar,
                values: [token.decriptar(b.idregistro), b.nombre1, b.nombre2, b.apellido1, b.apellido2, b.fechanacimiento,
                    b.idsexo ? parseInt(token.decriptar(b.idsexo)) : null,
                    b.idtiposangre ? parseInt(token.decriptar(b.idtiposangre)) : null,
                    b.foto, b.idtipodocumento ? parseInt(token.decriptar(b.idtipodocumento)) : null,
                    b.identificacion, b.celular, b.telefono, b.direccion, b.email, b.fechaingreso,
                    b.nombrado ?? false, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8, b.firma]
            });
            res.send({ status: 'success', statusCode: 200, message: 'Docente actualizado', rows: {} });
        } catch (error) { console.log('docenteActualizar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo actualizar el docente', rows: [] }); }
    },

    /** Borrar (lógico) un docente. */
    async docenteBorrar(req, res) {
        try {
            const { idregistro } = req.body;
            if (!idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.docenteBorrar, values: [token.decriptar(idregistro), ESTADO_INACTIVO] });
            res.send({ status: 'success', statusCode: 200, message: 'Docente eliminado', rows: {} });
        } catch (error) { console.log('docenteBorrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo eliminar el docente', rows: [] }); }
    },

    // ================= CONTRATACIÓN =================
    /** Listar contrataciones por institución/año. */
    async contratacionListar(req, res) {
        try {
            const { idinstitucion, idano } = req.body || {};
            const cinstid = idinstitucion ? parseInt(token.decriptar(idinstitucion)) : null;
            const canolid = idano ? parseInt(token.decriptar(idano)) : null;
            const resp = await Db.query({ text: sql.contratacionListar, values: [cinstid, canolid] });
            resp.rows.forEach((f, i) => { resp.rows[i].idregistro = token.encriptar(f.idregistro); });
            res.send({ status: 'success', statusCode: 200, message: resp.rows.length + ' contrataciones', rows: resp.rows });
        } catch (error) { console.log('contratacionListar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo consultar', rows: [] }); }
    },

    /** Registrar la contratación de un docente en una institución. */
    async contratacionRegistrar(req, res) {
        try {
            const b = req.body;
            if (!b.idinstitucion || !b.iddocente || !b.idano) return res.send({ status: 'error', statusCode: 400, message: 'Falta institución, docente o año', rows: [] });
            const resp = await Db.query({
                text: sql.contratacionRegistrar,
                values: [parseInt(token.decriptar(b.idinstitucion)), parseInt(token.decriptar(b.iddocente)),
                    parseInt(token.decriptar(b.idano)), b.idcargo ? parseInt(token.decriptar(b.idcargo)) : null,
                    b.idtipovinculacion ? parseInt(token.decriptar(b.idtipovinculacion)) : null,
                    b.salario, b.ideps ? parseInt(token.decriptar(b.ideps)) : null,
                    b.idars ? parseInt(token.decriptar(b.idars)) : null, b.idcaja ? parseInt(token.decriptar(b.idcaja)) : null,
                    b.idarp ? parseInt(token.decriptar(b.idarp)) : null, b.fechainicio, b.fechafin,
                    b.idestado ? parseInt(token.decriptar(b.idestado)) : 8, b.jefearea ?? 0]
            });
            res.send({ status: 'success', statusCode: 200, message: 'Contratación registrada', rows: { idregistro: token.encriptar(resp.rows[0].idregistro) } });
        } catch (error) { console.log('contratacionRegistrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo registrar', rows: [] }); }
    },

    /** Actualizar la contratación de un docente. */
    async contratacionActualizar(req, res) {
        try {
            const b = req.body;
            if (!b.idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({
                text: sql.contratacionActualizar,
                values: [token.decriptar(b.idregistro), b.idcargo ? parseInt(token.decriptar(b.idcargo)) : null,
                    b.idtipovinculacion ? parseInt(token.decriptar(b.idtipovinculacion)) : null,
                    b.salario, b.ideps ? parseInt(token.decriptar(b.ideps)) : null,
                    b.idars ? parseInt(token.decriptar(b.idars)) : null, b.idcaja ? parseInt(token.decriptar(b.idcaja)) : null,
                    b.idarp ? parseInt(token.decriptar(b.idarp)) : null, b.fechainicio, b.fechafin,
                    b.idestado ? parseInt(token.decriptar(b.idestado)) : 8, b.jefearea ?? 0]
            });
            res.send({ status: 'success', statusCode: 200, message: 'Contratación actualizada', rows: {} });
        } catch (error) { console.log('contratacionActualizar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo actualizar', rows: [] }); }
    },

    /** Borrar (lógico) una contratación. */
    async contratacionBorrar(req, res) {
        try {
            const { idregistro } = req.body;
            if (!idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.contratacionBorrar, values: [token.decriptar(idregistro), ESTADO_INACTIVO] });
            res.send({ status: 'success', statusCode: 200, message: 'Contratación eliminada', rows: {} });
        } catch (error) { console.log('contratacionBorrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo eliminar', rows: [] }); }
    },

    // ================= ASIGNACIÓN ACADÉMICA =================
    /** Listar asignaciones académicas por curso y/o docente. */
    async asignacionListar(req, res) {
        try {
            const { idcurso, iddocente } = req.body || {};
            const ccursid = idcurso ? parseInt(token.decriptar(idcurso)) : null;
            const cdoceid = iddocente ? parseInt(token.decriptar(iddocente)) : null;
            const resp = await Db.query({ text: sql.asignacionListar, values: [ccursid, cdoceid] });
            resp.rows.forEach((f, i) => { resp.rows[i].idregistro = token.encriptar(f.idregistro); });
            res.send({ status: 'success', statusCode: 200, message: resp.rows.length + ' asignaciones', rows: resp.rows });
        } catch (error) { console.log('asignacionListar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo consultar', rows: [] }); }
    },

    /** Registrar una asignación académica. */
    async asignacionRegistrar(req, res) {
        try {
            const b = req.body;
            if (!b.idasignatura || !b.idcurso || !b.iddocente) return res.send({ status: 'error', statusCode: 400, message: 'Falta asignatura, curso o docente', rows: [] });
            const resp = await Db.query({
                text: sql.asignacionRegistrar,
                values: [parseInt(token.decriptar(b.idasignatura)), parseInt(token.decriptar(b.idcurso)),
                    parseInt(token.decriptar(b.iddocente)), b.horainicio, b.horafin,
                    b.idestado ? parseInt(token.decriptar(b.idestado)) : 1, b.duracion]
            });
            res.send({ status: 'success', statusCode: 200, message: 'Asignación registrada', rows: { idregistro: token.encriptar(resp.rows[0].idregistro) } });
        } catch (error) { console.log('asignacionRegistrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo registrar', rows: [] }); }
    },

    /** Actualizar una asignación académica. */
    async asignacionActualizar(req, res) {
        try {
            const b = req.body;
            if (!b.idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({
                text: sql.asignacionActualizar,
                values: [token.decriptar(b.idregistro),
                    b.idasignatura ? parseInt(token.decriptar(b.idasignatura)) : null,
                    b.idcurso ? parseInt(token.decriptar(b.idcurso)) : null,
                    b.iddocente ? parseInt(token.decriptar(b.iddocente)) : null,
                    b.horainicio, b.horafin, b.idestado ? parseInt(token.decriptar(b.idestado)) : 1, b.duracion]
            });
            res.send({ status: 'success', statusCode: 200, message: 'Asignación actualizada', rows: {} });
        } catch (error) { console.log('asignacionActualizar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo actualizar', rows: [] }); }
    },

    /** Borrar (lógico) una asignación académica. */
    async asignacionBorrar(req, res) {
        try {
            const { idregistro } = req.body;
            if (!idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.asignacionBorrar, values: [token.decriptar(idregistro), 0] });
            res.send({ status: 'success', statusCode: 200, message: 'Asignación eliminada', rows: {} });
        } catch (error) { console.log('asignacionBorrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo eliminar', rows: [] }); }
    },
};
