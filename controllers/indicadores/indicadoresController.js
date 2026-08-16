/**
 * indicadoresController.js
 * Controlador del módulo de indicadores de desempeño (competencias).
 */
require('dotenv').config();
const Db = require('../../database/conex');
const token = require('../../utils/token');
const sql = require('./indicadores.sql');

module.exports = {

    // ================= COMPETENCIAS =================
    /** Listar competencias por área y/o grado. */
    async competenciaListar(req, res) {
        try {
            const { idarea, idgrado } = req.body || {};
            const careaid = idarea ? parseInt(token.decriptar(idarea)) : null;
            const cgradid = idgrado ? token.decriptar(idgrado) : null;
            const resp = await Db.query({ text: sql.competenciaListar, values: [careaid, cgradid] });
            resp.rows.forEach((f, i) => { resp.rows[i].idregistro = token.encriptar(f.idregistro); });
            res.send({ status: 'success', statusCode: 200, message: resp.rows.length + ' competencias', rows: resp.rows });
        } catch (error) { console.log('competenciaListar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo consultar', rows: [] }); }
    },

    /** Registrar una competencia. */
    async competenciaRegistrar(req, res) {
        try {
            const b = req.body;
            if (!b.idarea || !b.descripcion) return res.send({ status: 'error', statusCode: 400, message: 'Falta área o descripción', rows: [] });
            const resp = await Db.query({
                text: sql.competenciaRegistrar,
                values: [parseInt(token.decriptar(b.idarea)), b.idgrado ? token.decriptar(b.idgrado) : null, b.codigo,
                    b.descripcion, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8,
                    b.idinstitucion ? parseInt(token.decriptar(b.idinstitucion)) : 0,
                    b.idasignatura ? parseInt(token.decriptar(b.idasignatura)) : 0,
                    b.idtipo ? parseInt(token.decriptar(b.idtipo)) : 1, b.observacion]
            });
            res.send({ status: 'success', statusCode: 200, message: 'Competencia registrada', rows: { idregistro: token.encriptar(resp.rows[0].idregistro) } });
        } catch (error) { console.log('competenciaRegistrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo registrar', rows: [] }); }
    },

    /** Actualizar una competencia. */
    async competenciaActualizar(req, res) {
        try {
            const b = req.body;
            if (!b.idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({
                text: sql.competenciaActualizar,
                values: [token.decriptar(b.idregistro), b.idarea ? parseInt(token.decriptar(b.idarea)) : null,
                    b.idgrado ? token.decriptar(b.idgrado) : null, b.codigo, b.descripcion,
                    b.idestado ? parseInt(token.decriptar(b.idestado)) : 8,
                    b.idinstitucion ? parseInt(token.decriptar(b.idinstitucion)) : 0,
                    b.idasignatura ? parseInt(token.decriptar(b.idasignatura)) : 0,
                    b.idtipo ? parseInt(token.decriptar(b.idtipo)) : 1, b.observacion]
            });
            res.send({ status: 'success', statusCode: 200, message: 'Competencia actualizada', rows: {} });
        } catch (error) { console.log('competenciaActualizar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo actualizar', rows: [] }); }
    },

    /** Borrar (lógico) una competencia. */
    async competenciaBorrar(req, res) {
        try {
            const { idregistro } = req.body;
            if (!idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.competenciaBorrar, values: [token.decriptar(idregistro), 9] });
            res.send({ status: 'success', statusCode: 200, message: 'Competencia eliminada', rows: {} });
        } catch (error) { console.log('competenciaBorrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo eliminar', rows: [] }); }
    },

    // ================= COMPETENCIA POR ASIGNACIÓN-CURSO =================
    /** Listar competencias de una asignación-curso. */
    async asigcurscompListar(req, res) {
        try {
            const { idasigcurs } = req.body || {};
            const asigcursid = idasigcurs ? parseInt(token.decriptar(idasigcurs)) : null;
            const resp = await Db.query({ text: sql.asigcurscompListar, values: [asigcursid] });
            resp.rows.forEach((f, i) => { resp.rows[i].idregistro = token.encriptar(f.idregistro); });
            res.send({ status: 'success', statusCode: 200, message: resp.rows.length + ' competencias por asignación', rows: resp.rows });
        } catch (error) { console.log('asigcurscompListar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo consultar', rows: [] }); }
    },

    /** Asignar una competencia a una asignación-curso. */
    async asigcurscompRegistrar(req, res) {
        try {
            const b = req.body;
            if (!b.idasigcurs || !b.idcompetencia) return res.send({ status: 'error', statusCode: 400, message: 'Falta asignación o competencia', rows: [] });
            const resp = await Db.query({ text: sql.asigcurscompRegistrar, values: [parseInt(token.decriptar(b.idasigcurs)), parseInt(token.decriptar(b.idcompetencia)), b.idestado ? parseInt(token.decriptar(b.idestado)) : 1] });
            res.send({ status: 'success', statusCode: 200, message: 'Competencia asignada', rows: { idregistro: token.encriptar(resp.rows[0].idregistro) } });
        } catch (error) { console.log('asigcurscompRegistrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo registrar', rows: [] }); }
    },

    /** Retirar (lógico) una competencia de una asignación-curso. */
    async asigcurscompBorrar(req, res) {
        try {
            const { idregistro } = req.body;
            if (!idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.asigcurscompBorrar, values: [token.decriptar(idregistro), 0] });
            res.send({ status: 'success', statusCode: 200, message: 'Competencia retirada de la asignación', rows: {} });
        } catch (error) { console.log('asigcurscompBorrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo eliminar', rows: [] }); }
    },
};
