/**
 * preescolarController.js
 * Controlador del módulo de preescolar (esquema preescolar).
 */
require('dotenv').config();
const Db = require('../../database/conex');
const token = require('../../utils/token');
const sql = require('./preescolar.sql');

const ESTADO_INACTIVO = 9;

module.exports = {

    // ================= ÁMBITOS =================
    async ambitoListar(req, res) {
        try {
            const resp = await Db.query({ text: sql.ambitoListar, values: [] });
            resp.rows.forEach((f, i) => { resp.rows[i].idregistro = token.encriptar(f.idregistro); });
            res.send({ status: 'success', statusCode: 200, message: resp.rows.length + ' ámbitos', rows: resp.rows });
        } catch (error) { console.log('ambitoListar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo consultar', rows: [] }); }
    },
    async ambitoRegistrar(req, res) {
        try {
            const b = req.body;
            if (!b.descripcion) return res.send({ status: 'error', statusCode: 400, message: 'Falta la descripción', rows: [] });
            const resp = await Db.query({ text: sql.ambitoRegistrar, values: [b.codigo, b.descripcion, b.comentario, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8] });
            res.send({ status: 'success', statusCode: 200, message: 'Ámbito registrado', rows: { idregistro: token.encriptar(resp.rows[0].idregistro) } });
        } catch (error) { console.log('ambitoRegistrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo registrar', rows: [] }); }
    },
    async ambitoActualizar(req, res) {
        try {
            const b = req.body;
            if (!b.idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.ambitoActualizar, values: [token.decriptar(b.idregistro), b.codigo, b.descripcion, b.comentario, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8] });
            res.send({ status: 'success', statusCode: 200, message: 'Ámbito actualizado', rows: {} });
        } catch (error) { console.log('ambitoActualizar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo actualizar', rows: [] }); }
    },
    async ambitoBorrar(req, res) {
        try {
            const { idregistro } = req.body;
            if (!idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.ambitoBorrar, values: [token.decriptar(idregistro), ESTADO_INACTIVO] });
            res.send({ status: 'success', statusCode: 200, message: 'Ámbito eliminado', rows: {} });
        } catch (error) { console.log('ambitoBorrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo eliminar', rows: [] }); }
    },

    // ================= DIMENSIONES =================
    async dimensionListar(req, res) {
        try {
            const resp = await Db.query({ text: sql.dimensionListar, values: [] });
            resp.rows.forEach((f, i) => { resp.rows[i].idregistro = token.encriptar(f.idregistro); });
            res.send({ status: 'success', statusCode: 200, message: resp.rows.length + ' dimensiones', rows: resp.rows });
        } catch (error) { console.log('dimensionListar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo consultar', rows: [] }); }
    },
    async dimensionRegistrar(req, res) {
        try {
            const b = req.body;
            if (!b.descripcion) return res.send({ status: 'error', statusCode: 400, message: 'Falta la descripción', rows: [] });
            const resp = await Db.query({ text: sql.dimensionRegistrar, values: [b.codigo, b.descripcion, b.comentario, b.abreviatura, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8] });
            res.send({ status: 'success', statusCode: 200, message: 'Dimensión registrada', rows: { idregistro: token.encriptar(resp.rows[0].idregistro) } });
        } catch (error) { console.log('dimensionRegistrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo registrar', rows: [] }); }
    },
    async dimensionActualizar(req, res) {
        try {
            const b = req.body;
            if (!b.idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.dimensionActualizar, values: [token.decriptar(b.idregistro), b.codigo, b.descripcion, b.comentario, b.abreviatura, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8] });
            res.send({ status: 'success', statusCode: 200, message: 'Dimensión actualizada', rows: {} });
        } catch (error) { console.log('dimensionActualizar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo actualizar', rows: [] }); }
    },
    async dimensionBorrar(req, res) {
        try {
            const { idregistro } = req.body;
            if (!idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.dimensionBorrar, values: [token.decriptar(idregistro), ESTADO_INACTIVO] });
            res.send({ status: 'success', statusCode: 200, message: 'Dimensión eliminada', rows: {} });
        } catch (error) { console.log('dimensionBorrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo eliminar', rows: [] }); }
    },

    // ================= ASIGNACIONES =================
    async asignacionListar(req, res) {
        try {
            const resp = await Db.query({ text: sql.asignacionListar, values: [] });
            resp.rows.forEach((f, i) => { resp.rows[i].idregistro = token.encriptar(f.idregistro); });
            res.send({ status: 'success', statusCode: 200, message: resp.rows.length + ' asignaciones', rows: resp.rows });
        } catch (error) { console.log('asignacionListar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo consultar', rows: [] }); }
    },
    async asignacionRegistrar(req, res) {
        try {
            const b = req.body;
            if (!b.idambito || !b.iddimension || !b.idcurso || !b.iddocente) return res.send({ status: 'error', statusCode: 400, message: 'Falta información', rows: [] });
            const resp = await Db.query({ text: sql.asignacionRegistrar, values: [parseInt(token.decriptar(b.idambito)), parseInt(token.decriptar(b.iddimension)), parseInt(token.decriptar(b.idcurso)), parseInt(token.decriptar(b.iddocente)), b.duracion, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8] });
            res.send({ status: 'success', statusCode: 200, message: 'Asignación registrada', rows: { idregistro: token.encriptar(resp.rows[0].idregistro) } });
        } catch (error) { console.log('asignacionRegistrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo registrar', rows: [] }); }
    },
    async asignacionActualizar(req, res) {
        try {
            const b = req.body;
            if (!b.idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.asignacionActualizar, values: [token.decriptar(b.idregistro), b.idambito ? parseInt(token.decriptar(b.idambito)) : null, b.iddimension ? parseInt(token.decriptar(b.iddimension)) : null, b.idcurso ? parseInt(token.decriptar(b.idcurso)) : null, b.iddocente ? parseInt(token.decriptar(b.iddocente)) : null, b.duracion, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8] });
            res.send({ status: 'success', statusCode: 200, message: 'Asignación actualizada', rows: {} });
        } catch (error) { console.log('asignacionActualizar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo actualizar', rows: [] }); }
    },
    async asignacionBorrar(req, res) {
        try {
            const { idregistro } = req.body;
            if (!idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.asignacionBorrar, values: [token.decriptar(idregistro), ESTADO_INACTIVO] });
            res.send({ status: 'success', statusCode: 200, message: 'Asignación eliminada', rows: {} });
        } catch (error) { console.log('asignacionBorrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo eliminar', rows: [] }); }
    },

    // ================= NOTAS =================
    async notaListar(req, res) {
        try {
            const { idmatricula } = req.body || {};
            const cmatrid = idmatricula ? parseInt(token.decriptar(idmatricula)) : null;
            const resp = await Db.query({ text: sql.notaListar, values: [cmatrid] });
            resp.rows.forEach((f, i) => { resp.rows[i].idregistro = token.encriptar(f.idregistro); });
            res.send({ status: 'success', statusCode: 200, message: resp.rows.length + ' notas', rows: resp.rows });
        } catch (error) { console.log('notaListar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo consultar', rows: [] }); }
    },
    async notaRegistrar(req, res) {
        try {
            const b = req.body;
            if (!b.idasignacion || !b.idmatricula || b.valor === undefined) return res.send({ status: 'error', statusCode: 400, message: 'Falta información', rows: [] });
            const resp = await Db.query({ text: sql.notaRegistrar, values: [parseInt(token.decriptar(b.idasignacion)), b.idcompetencia ? parseInt(token.decriptar(b.idcompetencia)) : null, b.idperiodo ? parseInt(token.decriptar(b.idperiodo)) : null, parseInt(token.decriptar(b.idmatricula)), b.valor, b.fecha, b.observacion, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8] });
            res.send({ status: 'success', statusCode: 200, message: 'Nota registrada', rows: { idregistro: token.encriptar(resp.rows[0].idregistro) } });
        } catch (error) { console.log('notaRegistrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo registrar', rows: [] }); }
    },
    async notaBorrar(req, res) {
        try {
            const { idregistro } = req.body;
            if (!idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.notaBorrar, values: [token.decriptar(idregistro), ESTADO_INACTIVO] });
            res.send({ status: 'success', statusCode: 200, message: 'Nota eliminada', rows: {} });
        } catch (error) { console.log('notaBorrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo eliminar', rows: [] }); }
    },

    // ================= NOVEDADES =================
    async novedadListar(req, res) {
        try {
            const { idmatricula } = req.body || {};
            const cmatrid = idmatricula ? parseInt(token.decriptar(idmatricula)) : null;
            const resp = await Db.query({ text: sql.novedadListar, values: [cmatrid] });
            resp.rows.forEach((f, i) => { resp.rows[i].idregistro = token.encriptar(f.idregistro); });
            res.send({ status: 'success', statusCode: 200, message: resp.rows.length + ' novedades', rows: resp.rows });
        } catch (error) { console.log('novedadListar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo consultar', rows: [] }); }
    },
    async novedadRegistrar(req, res) {
        try {
            const b = req.body;
            if (!b.idasignacion || !b.idmatricula || !b.idtiponovedad) return res.send({ status: 'error', statusCode: 400, message: 'Falta información', rows: [] });
            const resp = await Db.query({ text: sql.novedadRegistrar, values: [parseInt(token.decriptar(b.idasignacion)), b.idperiodo ? parseInt(token.decriptar(b.idperiodo)) : null, parseInt(token.decriptar(b.idmatricula)), b.fecha, b.observacion, parseInt(token.decriptar(b.idtiponovedad)), b.idestado ? parseInt(token.decriptar(b.idestado)) : 1] });
            res.send({ status: 'success', statusCode: 200, message: 'Novedad registrada', rows: { idregistro: token.encriptar(resp.rows[0].idregistro) } });
        } catch (error) { console.log('novedadRegistrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo registrar', rows: [] }); }
    },
    async novedadBorrar(req, res) {
        try {
            const { idregistro } = req.body;
            if (!idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.novedadBorrar, values: [token.decriptar(idregistro), 0] });
            res.send({ status: 'success', statusCode: 200, message: 'Novedad eliminada', rows: {} });
        } catch (error) { console.log('novedadBorrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo eliminar', rows: [] }); }
    },
};
