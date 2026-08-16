/**
 * notasController.js
 * Controlador del módulo de calificaciones SAE.
 */
require('dotenv').config();
const Db = require('../../database/conex');
const token = require('../../utils/token');
const sql = require('./notas.sql');

module.exports = {

    // ================= NOTAS =================
    async notaListar(req, res) {
        try {
            const { idmatricula, idasigcurs } = req.body || {};
            const cmatrid = idmatricula ? parseInt(token.decriptar(idmatricula)) : null;
            const asigcursid = idasigcurs ? parseInt(token.decriptar(idasigcurs)) : null;
            const resp = await Db.query({ text: sql.notaListar, values: [cmatrid, asigcursid] });
            resp.rows.forEach((f, i) => { resp.rows[i].idregistro = token.encriptar(f.idregistro); });
            res.send({ status: 'success', statusCode: 200, message: resp.rows.length + ' notas', rows: resp.rows });
        } catch (error) { console.log('notaListar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo consultar', rows: [] }); }
    },
    async notaRegistrar(req, res) {
        try {
            const b = req.body;
            if (!b.idasigcurs || !b.idcompetencia || !b.idmatricula || b.valor === undefined) return res.send({ status: 'error', statusCode: 400, message: 'Falta información de la nota', rows: [] });
            const resp = await Db.query({
                text: sql.notaRegistrar,
                values: [parseInt(token.decriptar(b.idasigcurs)), parseInt(token.decriptar(b.idcompetencia)),
                    b.idperiodo ? parseInt(token.decriptar(b.idperiodo)) : null, parseInt(token.decriptar(b.idmatricula)),
                    b.valor, b.fecha, b.observacion, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8]
            });
            res.send({ status: 'success', statusCode: 200, message: 'Nota registrada', rows: { idregistro: token.encriptar(resp.rows[0].idregistro) } });
        } catch (error) { console.log('notaRegistrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo registrar', rows: [] }); }
    },
    async notaActualizar(req, res) {
        try {
            const b = req.body;
            if (!b.idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({
                text: sql.notaActualizar,
                values: [token.decriptar(b.idregistro), b.idcompetencia ? parseInt(token.decriptar(b.idcompetencia)) : null,
                    b.valor, b.fecha, b.observacion, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8]
            });
            res.send({ status: 'success', statusCode: 200, message: 'Nota actualizada', rows: {} });
        } catch (error) { console.log('notaActualizar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo actualizar', rows: [] }); }
    },
    async notaBorrar(req, res) {
        try {
            const { idregistro } = req.body;
            if (!idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.notaBorrar, values: [token.decriptar(idregistro), 9] });
            res.send({ status: 'success', statusCode: 200, message: 'Nota eliminada', rows: {} });
        } catch (error) { console.log('notaBorrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo eliminar', rows: [] }); }
    },

    // ================= LOGROS =================
    async compestuListar(req, res) {
        try {
            const { idmatricula } = req.body || {};
            const cmatrid = idmatricula ? parseInt(token.decriptar(idmatricula)) : null;
            const resp = await Db.query({ text: sql.compestuListar, values: [cmatrid] });
            resp.rows.forEach((f, i) => { resp.rows[i].idregistro = token.encriptar(f.idregistro); });
            res.send({ status: 'success', statusCode: 200, message: resp.rows.length + ' logros', rows: resp.rows });
        } catch (error) { console.log('compestuListar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo consultar', rows: [] }); }
    },
    async compestuRegistrar(req, res) {
        try {
            const b = req.body;
            if (!b.idasigcurscomp || !b.idmatricula) return res.send({ status: 'error', statusCode: 400, message: 'Falta información', rows: [] });
            const resp = await Db.query({ text: sql.compestuRegistrar, values: [parseInt(token.decriptar(b.idasigcurscomp)), b.idperiodo ? parseInt(token.decriptar(b.idperiodo)) : null, parseInt(token.decriptar(b.idmatricula)), b.idestado ? parseInt(token.decriptar(b.idestado)) : 8] });
            res.send({ status: 'success', statusCode: 200, message: 'Logro registrado', rows: { idregistro: token.encriptar(resp.rows[0].idregistro) } });
        } catch (error) { console.log('compestuRegistrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo registrar', rows: [] }); }
    },
    async compestuBorrar(req, res) {
        try {
            const { idregistro } = req.body;
            if (!idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.compestuBorrar, values: [token.decriptar(idregistro), 9] });
            res.send({ status: 'success', statusCode: 200, message: 'Logro eliminado', rows: {} });
        } catch (error) { console.log('compestuBorrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo eliminar', rows: [] }); }
    },

    // ================= DEFINITIVAS =================
    async notadefListar(req, res) {
        try {
            const { idmatricula } = req.body || {};
            const cmatrid = idmatricula ? parseInt(token.decriptar(idmatricula)) : null;
            const resp = await Db.query({ text: sql.notadefListar, values: [cmatrid] });
            resp.rows.forEach((f, i) => { resp.rows[i].idregistro = token.encriptar(f.idregistro); });
            res.send({ status: 'success', statusCode: 200, message: resp.rows.length + ' definitivas', rows: resp.rows });
        } catch (error) { console.log('notadefListar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo consultar', rows: [] }); }
    },
    async notadefRegistrar(req, res) {
        try {
            const b = req.body;
            if (!b.idmatricula || !b.idasigcurs || b.valor === undefined) return res.send({ status: 'error', statusCode: 400, message: 'Falta información', rows: [] });
            const resp = await Db.query({
                text: sql.notadefRegistrar,
                values: [parseInt(token.decriptar(b.idmatricula)), parseInt(token.decriptar(b.idasigcurs)),
                    b.idperiodo ? parseInt(token.decriptar(b.idperiodo)) : null,
                    b.idtipodesempeno ? parseInt(token.decriptar(b.idtipodesempeno)) : null,
                    b.valor, b.observacion, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8]
            });
            res.send({ status: 'success', statusCode: 200, message: 'Definitiva registrada', rows: { idregistro: token.encriptar(resp.rows[0].idregistro) } });
        } catch (error) { console.log('notadefRegistrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo registrar', rows: [] }); }
    },
    async notadefBorrar(req, res) {
        try {
            const { idregistro } = req.body;
            if (!idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.notadefBorrar, values: [token.decriptar(idregistro), 9] });
            res.send({ status: 'success', statusCode: 200, message: 'Definitiva eliminada', rows: {} });
        } catch (error) { console.log('notadefBorrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo eliminar', rows: [] }); }
    },

    // ================= PROMEDIOS DEFINITIVOS =================
    async promdefListar(req, res) {
        try {
            const { idmatricula } = req.body || {};
            const cmatrid = idmatricula ? parseInt(token.decriptar(idmatricula)) : null;
            const resp = await Db.query({ text: sql.promdefListar, values: [cmatrid] });
            resp.rows.forEach((f, i) => { resp.rows[i].idregistro = token.encriptar(f.idregistro); });
            res.send({ status: 'success', statusCode: 200, message: resp.rows.length + ' promedios', rows: resp.rows });
        } catch (error) { console.log('promdefListar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo consultar', rows: [] }); }
    },
    async promdefRegistrar(req, res) {
        try {
            const b = req.body;
            if (!b.idmatricula || b.valor === undefined) return res.send({ status: 'error', statusCode: 400, message: 'Falta información', rows: [] });
            const resp = await Db.query({ text: sql.promdefRegistrar, values: [parseInt(token.decriptar(b.idmatricula)), b.idperiodo ? parseInt(token.decriptar(b.idperiodo)) : null, b.idtipopromedio ? parseInt(token.decriptar(b.idtipopromedio)) : null, b.valor, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8] });
            res.send({ status: 'success', statusCode: 200, message: 'Promedio registrado', rows: { idregistro: token.encriptar(resp.rows[0].idregistro) } });
        } catch (error) { console.log('promdefRegistrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo registrar', rows: [] }); }
    },
    async promdefBorrar(req, res) {
        try {
            const { idregistro } = req.body;
            if (!idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.promdefBorrar, values: [token.decriptar(idregistro), 9] });
            res.send({ status: 'success', statusCode: 200, message: 'Promedio eliminado', rows: {} });
        } catch (error) { console.log('promdefBorrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo eliminar', rows: [] }); }
    },

    // ================= PROMEDIOS POR ASIGNATURA =================
    async promasigListar(req, res) {
        try {
            const { idpromedio } = req.body || {};
            const cpromoid = idpromedio ? parseInt(token.decriptar(idpromedio)) : null;
            const resp = await Db.query({ text: sql.promasigListar, values: [cpromoid] });
            resp.rows.forEach((f, i) => { resp.rows[i].idregistro = token.encriptar(f.idregistro); });
            res.send({ status: 'success', statusCode: 200, message: resp.rows.length + ' promedios por asignatura', rows: resp.rows });
        } catch (error) { console.log('promasigListar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo consultar', rows: [] }); }
    },
    async promasigRegistrar(req, res) {
        try {
            const b = req.body;
            if (!b.idpromedio || !b.idano || !b.idasigcurs) return res.send({ status: 'error', statusCode: 400, message: 'Falta información', rows: [] });
            const resp = await Db.query({ text: sql.promasigRegistrar, values: [parseInt(token.decriptar(b.idpromedio)), parseInt(token.decriptar(b.idano)), b.ponderacion, b.idarea ? parseInt(token.decriptar(b.idarea)) : null, parseInt(token.decriptar(b.idasigcurs)), b.promedio, b.idestado ? parseInt(token.decriptar(b.idestado)) : 1] });
            res.send({ status: 'success', statusCode: 200, message: 'Promedio por asignatura registrado', rows: { idregistro: token.encriptar(resp.rows[0].idregistro) } });
        } catch (error) { console.log('promasigRegistrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo registrar', rows: [] }); }
    },
    async promasigBorrar(req, res) {
        try {
            const { idregistro } = req.body;
            if (!idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.promasigBorrar, values: [token.decriptar(idregistro), 0] });
            res.send({ status: 'success', statusCode: 200, message: 'Promedio por asignatura eliminado', rows: {} });
        } catch (error) { console.log('promasigBorrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo eliminar', rows: [] }); }
    },

    // ================= PROMEDIOS GENERALES =================
    async promoListar(req, res) {
        try {
            const resp = await Db.query({ text: sql.promoListar, values: [] });
            resp.rows.forEach((f, i) => { resp.rows[i].idregistro = token.encriptar(f.idregistro); });
            res.send({ status: 'success', statusCode: 200, message: resp.rows.length + ' promedios generales', rows: resp.rows });
        } catch (error) { console.log('promoListar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo consultar', rows: [] }); }
    },
    async promoRegistrar(req, res) {
        try {
            const b = req.body;
            if (b.promediofinal === undefined) return res.send({ status: 'error', statusCode: 400, message: 'Falta el promedio final', rows: [] });
            const resp = await Db.query({ text: sql.promoRegistrar, values: [b.promediofinal, b.definitivo ?? false, b.gradodesde, b.gradopara, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8] });
            res.send({ status: 'success', statusCode: 200, message: 'Promedio general registrado', rows: { idregistro: token.encriptar(resp.rows[0].idregistro) } });
        } catch (error) { console.log('promoRegistrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo registrar', rows: [] }); }
    },
    async promoActualizar(req, res) {
        try {
            const b = req.body;
            if (!b.idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.promoActualizar, values: [token.decriptar(b.idregistro), b.promediofinal, b.definitivo ?? false, b.gradodesde, b.gradopara, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8] });
            res.send({ status: 'success', statusCode: 200, message: 'Promedio general actualizado', rows: {} });
        } catch (error) { console.log('promoActualizar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo actualizar', rows: [] }); }
    },
    async promoBorrar(req, res) {
        try {
            const { idregistro } = req.body;
            if (!idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.promoBorrar, values: [token.decriptar(idregistro), 9] });
            res.send({ status: 'success', statusCode: 200, message: 'Promedio general eliminado', rows: {} });
        } catch (error) { console.log('promoBorrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo eliminar', rows: [] }); }
    },
};
