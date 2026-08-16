/**
 * estadisticassaeController.js
 * Controlador del módulo de reportes/estadísticas SAE (solo lectura).
 */
require('dotenv').config();
const Db = require('../../database/conex');
const token = require('../../utils/token');
const sql = require('./estadisticassae.sql');

module.exports = {

    /** Matrículas totales (activas). */
    async matriculaTotal(req, res) {
        try {
            const { idinstitucion } = req.body || {};
            const cinstid = idinstitucion ? parseInt(token.decriptar(idinstitucion)) : null;
            const resp = await Db.query({ text: sql.matriculaTotal, values: [cinstid] });
            res.send({ status: 'success', statusCode: 200, message: 'Total calculado', rows: resp.rows });
        } catch (error) { console.log('matriculaTotal: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo consultar', rows: [] }); }
    },

    /** Matrículas por sexo. */
    async matriculaPorSexo(req, res) {
        try {
            const resp = await Db.query({ text: sql.matriculaPorSexo, values: [] });
            res.send({ status: 'success', statusCode: 200, message: resp.rows.length + ' grupos', rows: resp.rows });
        } catch (error) { console.log('matriculaPorSexo: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo consultar', rows: [] }); }
    },

    /** Matrículas por etnia. */
    async matriculaPorEtnia(req, res) {
        try {
            const resp = await Db.query({ text: sql.matriculaPorEtnia, values: [] });
            res.send({ status: 'success', statusCode: 200, message: resp.rows.length + ' grupos', rows: resp.rows });
        } catch (error) { console.log('matriculaPorEtnia: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo consultar', rows: [] }); }
    },

    /** Matrículas por grado. */
    async matriculaPorGrado(req, res) {
        try {
            const resp = await Db.query({ text: sql.matriculaPorGrado, values: [] });
            res.send({ status: 'success', statusCode: 200, message: resp.rows.length + ' grados', rows: resp.rows });
        } catch (error) { console.log('matriculaPorGrado: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo consultar', rows: [] }); }
    },

    /** Resumen general del dashboard SAE. */
    async resumen(req, res) {
        try {
            const { idinstitucion } = req.body || {};
            const cinstid = idinstitucion ? parseInt(token.decriptar(idinstitucion)) : null;
            const resp = await Db.query({ text: sql.resumen, values: [cinstid] });
            res.send({ status: 'success', statusCode: 200, message: 'Resumen generado', rows: resp.rows });
        } catch (error) { console.log('resumen: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo consultar', rows: [] }); }
    },
};
