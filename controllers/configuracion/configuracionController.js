/**
 * configuracionController.js
 * Controlador del módulo de configuración académica SAE: escalas, SIE,
 * certificados, constancias, paz y salvo y firmas.
 */
require('dotenv').config();
const Db = require('../../database/conex');
const token = require('../../utils/token');
const sql = require('./configuracion.sql');

module.exports = {

    // ================= ESCALAS =================
    async escalaListar(req, res) {
        try {
            const { idinstitucion } = req.body || {};
            const cinstid = idinstitucion ? parseInt(token.decriptar(idinstitucion)) : null;
            const resp = await Db.query({ text: sql.escalaListar, values: [cinstid] });
            resp.rows.forEach((f, i) => { resp.rows[i].idregistro = token.encriptar(f.idregistro); });
            res.send({ status: 'success', statusCode: 200, message: resp.rows.length + ' escalas', rows: resp.rows });
        } catch (error) { console.log('escalaListar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo consultar', rows: [] }); }
    },
    async escalaRegistrar(req, res) {
        try {
            const b = req.body;
            if (!b.idinstitucion || !b.idano || !b.idescalanacional || !b.idescalacualitativa) return res.send({ status: 'error', statusCode: 400, message: 'Falta información de la escala', rows: [] });
            const resp = await Db.query({ text: sql.escalaRegistrar, values: [parseInt(token.decriptar(b.idinstitucion)), parseInt(token.decriptar(b.idano)), parseInt(token.decriptar(b.idescalanacional)), parseInt(token.decriptar(b.idescalacualitativa)), b.desde, b.hasta] });
            res.send({ status: 'success', statusCode: 200, message: 'Escala registrada', rows: { idregistro: token.encriptar(resp.rows[0].idregistro) } });
        } catch (error) { console.log('escalaRegistrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo registrar', rows: [] }); }
    },
    async escalaActualizar(req, res) {
        try {
            const b = req.body;
            if (!b.idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.escalaActualizar, values: [token.decriptar(b.idregistro), b.idescalanacional ? parseInt(token.decriptar(b.idescalanacional)) : null, b.idescalacualitativa ? parseInt(token.decriptar(b.idescalacualitativa)) : null, b.desde, b.hasta] });
            res.send({ status: 'success', statusCode: 200, message: 'Escala actualizada', rows: {} });
        } catch (error) { console.log('escalaActualizar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo actualizar', rows: [] }); }
    },
    async escalaBorrar(req, res) {
        try {
            const { idregistro } = req.body;
            if (!idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.escalaBorrar, values: [token.decriptar(idregistro)] });
            res.send({ status: 'success', statusCode: 200, message: 'Escala eliminada', rows: {} });
        } catch (error) { console.log('escalaBorrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo eliminar', rows: [] }); }
    },

    // ================= SIE =================
    async sieListar(req, res) {
        try {
            const { idinstitucion } = req.body || {};
            const cinstid = idinstitucion ? parseInt(token.decriptar(idinstitucion)) : null;
            const resp = await Db.query({ text: sql.sieListar, values: [cinstid] });
            resp.rows.forEach((f, i) => { resp.rows[i].idregistro = token.encriptar(f.idregistro); });
            res.send({ status: 'success', statusCode: 200, message: resp.rows.length + ' registros SIE', rows: resp.rows });
        } catch (error) { console.log('sieListar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo consultar', rows: [] }); }
    },
    async sieRegistrar(req, res) {
        try {
            const b = req.body;
            if (!b.idinstitucion || !b.idano) return res.send({ status: 'error', statusCode: 400, message: 'Falta institución o año', rows: [] });
            const resp = await Db.query({ text: sql.sieRegistrar, values: [b.idtipodesempeno ? parseInt(token.decriptar(b.idtipodesempeno)) : null, parseInt(token.decriptar(b.idinstitucion)), parseInt(token.decriptar(b.idano)), b.valorpromocion, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8, b.libre || '0'] });
            res.send({ status: 'success', statusCode: 200, message: 'SIE registrado', rows: { idregistro: token.encriptar(resp.rows[0].idregistro) } });
        } catch (error) { console.log('sieRegistrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo registrar', rows: [] }); }
    },
    async sieActualizar(req, res) {
        try {
            const b = req.body;
            if (!b.idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.sieActualizar, values: [token.decriptar(b.idregistro), b.idtipodesempeno ? parseInt(token.decriptar(b.idtipodesempeno)) : null, b.valorpromocion, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8, b.libre || '0'] });
            res.send({ status: 'success', statusCode: 200, message: 'SIE actualizado', rows: {} });
        } catch (error) { console.log('sieActualizar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo actualizar', rows: [] }); }
    },

    // ================= CERTIFICADOS =================
    async certificadoListar(req, res) {
        try {
            const { idinstitucion } = req.body || {};
            const cinstid = idinstitucion ? parseInt(token.decriptar(idinstitucion)) : null;
            const resp = await Db.query({ text: sql.certificadoListar, values: [cinstid] });
            resp.rows.forEach((f, i) => { resp.rows[i].idregistro = token.encriptar(f.idregistro); });
            res.send({ status: 'success', statusCode: 200, message: resp.rows.length + ' certificados', rows: resp.rows });
        } catch (error) { console.log('certificadoListar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo consultar', rows: [] }); }
    },
    async certificadoRegistrar(req, res) {
        try {
            const b = req.body;
            if (!b.idinstitucion) return res.send({ status: 'error', statusCode: 400, message: 'Falta la institución', rows: [] });
            const resp = await Db.query({ text: sql.certificadoRegistrar, values: [parseInt(token.decriptar(b.idinstitucion)), b.titulo, b.parrafo1, b.parrafo2] });
            res.send({ status: 'success', statusCode: 200, message: 'Certificado registrado', rows: { idregistro: token.encriptar(resp.rows[0].idregistro) } });
        } catch (error) { console.log('certificadoRegistrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo registrar', rows: [] }); }
    },
    async certificadoActualizar(req, res) {
        try {
            const b = req.body;
            if (!b.idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.certificadoActualizar, values: [token.decriptar(b.idregistro), b.titulo, b.parrafo1, b.parrafo2] });
            res.send({ status: 'success', statusCode: 200, message: 'Certificado actualizado', rows: {} });
        } catch (error) { console.log('certificadoActualizar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo actualizar', rows: [] }); }
    },
    async certificadoBorrar(req, res) {
        try {
            const { idregistro } = req.body;
            if (!idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.certificadoBorrar, values: [token.decriptar(idregistro)] });
            res.send({ status: 'success', statusCode: 200, message: 'Certificado eliminado', rows: {} });
        } catch (error) { console.log('certificadoBorrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo eliminar', rows: [] }); }
    },

    // ================= CONSTANCIAS =================
    async constanciaListar(req, res) {
        try {
            const { idinstitucion } = req.body || {};
            const cinstid = idinstitucion ? parseInt(token.decriptar(idinstitucion)) : null;
            const resp = await Db.query({ text: sql.constanciaListar, values: [cinstid] });
            resp.rows.forEach((f, i) => { resp.rows[i].idregistro = token.encriptar(f.idregistro); });
            res.send({ status: 'success', statusCode: 200, message: resp.rows.length + ' constancias', rows: resp.rows });
        } catch (error) { console.log('constanciaListar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo consultar', rows: [] }); }
    },
    async constanciaRegistrar(req, res) {
        try {
            const b = req.body;
            if (!b.idinstitucion) return res.send({ status: 'error', statusCode: 400, message: 'Falta la institución', rows: [] });
            const resp = await Db.query({ text: sql.constanciaRegistrar, values: [parseInt(token.decriptar(b.idinstitucion)), b.titulo, b.parrafo1, b.parrafo2] });
            res.send({ status: 'success', statusCode: 200, message: 'Constancia registrada', rows: { idregistro: token.encriptar(resp.rows[0].idregistro) } });
        } catch (error) { console.log('constanciaRegistrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo registrar', rows: [] }); }
    },
    async constanciaActualizar(req, res) {
        try {
            const b = req.body;
            if (!b.idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.constanciaActualizar, values: [token.decriptar(b.idregistro), b.titulo, b.parrafo1, b.parrafo2] });
            res.send({ status: 'success', statusCode: 200, message: 'Constancia actualizada', rows: {} });
        } catch (error) { console.log('constanciaActualizar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo actualizar', rows: [] }); }
    },
    async constanciaBorrar(req, res) {
        try {
            const { idregistro } = req.body;
            if (!idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.constanciaBorrar, values: [token.decriptar(idregistro)] });
            res.send({ status: 'success', statusCode: 200, message: 'Constancia eliminada', rows: {} });
        } catch (error) { console.log('constanciaBorrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo eliminar', rows: [] }); }
    },

    // ================= PAZ Y SALVO =================
    async pazsalvoListar(req, res) {
        try {
            const { idinstitucion } = req.body || {};
            const cinstid = idinstitucion ? parseInt(token.decriptar(idinstitucion)) : null;
            const resp = await Db.query({ text: sql.pazsalvoListar, values: [cinstid] });
            resp.rows.forEach((f, i) => { resp.rows[i].idregistro = token.encriptar(f.idregistro); });
            res.send({ status: 'success', statusCode: 200, message: resp.rows.length + ' plantillas de paz y salvo', rows: resp.rows });
        } catch (error) { console.log('pazsalvoListar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo consultar', rows: [] }); }
    },
    async pazsalvoRegistrar(req, res) {
        try {
            const b = req.body;
            if (!b.idinstitucion) return res.send({ status: 'error', statusCode: 400, message: 'Falta la institución', rows: [] });
            const resp = await Db.query({ text: sql.pazsalvoRegistrar, values: [parseInt(token.decriptar(b.idinstitucion)), b.titulo1, b.titulo2, b.parrafo1, b.parrafo2, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8] });
            res.send({ status: 'success', statusCode: 200, message: 'Plantilla de paz y salvo registrada', rows: { idregistro: token.encriptar(resp.rows[0].idregistro) } });
        } catch (error) { console.log('pazsalvoRegistrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo registrar', rows: [] }); }
    },
    async pazsalvoActualizar(req, res) {
        try {
            const b = req.body;
            if (!b.idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.pazsalvoActualizar, values: [token.decriptar(b.idregistro), b.titulo1, b.titulo2, b.parrafo1, b.parrafo2, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8] });
            res.send({ status: 'success', statusCode: 200, message: 'Plantilla de paz y salvo actualizada', rows: {} });
        } catch (error) { console.log('pazsalvoActualizar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo actualizar', rows: [] }); }
    },

    // ================= FIRMAS =================
    async firmaListar(req, res) {
        try {
            const { idinstitucion } = req.body || {};
            const cinstid = idinstitucion ? parseInt(token.decriptar(idinstitucion)) : null;
            const resp = await Db.query({ text: sql.firmaListar, values: [cinstid] });
            resp.rows.forEach((f, i) => { resp.rows[i].idregistro = token.encriptar(f.idregistro); });
            res.send({ status: 'success', statusCode: 200, message: resp.rows.length + ' firmas', rows: resp.rows });
        } catch (error) { console.log('firmaListar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo consultar', rows: [] }); }
    },
    async firmaRegistrar(req, res) {
        try {
            const b = req.body;
            if (!b.idinstitucion || !b.iddocente) return res.send({ status: 'error', statusCode: 400, message: 'Falta institución o docente', rows: [] });
            const resp = await Db.query({ text: sql.firmaRegistrar, values: [parseInt(token.decriptar(b.idinstitucion)), parseInt(token.decriptar(b.iddocente)), b.cargo, b.tipo, b.orden, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8] });
            res.send({ status: 'success', statusCode: 200, message: 'Firma registrada', rows: { idregistro: token.encriptar(resp.rows[0].idregistro) } });
        } catch (error) { console.log('firmaRegistrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo registrar', rows: [] }); }
    },
    async firmaActualizar(req, res) {
        try {
            const b = req.body;
            if (!b.idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.firmaActualizar, values: [token.decriptar(b.idregistro), b.iddocente ? parseInt(token.decriptar(b.iddocente)) : null, b.cargo, b.tipo, b.orden, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8] });
            res.send({ status: 'success', statusCode: 200, message: 'Firma actualizada', rows: {} });
        } catch (error) { console.log('firmaActualizar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo actualizar', rows: [] }); }
    },
    async firmaBorrar(req, res) {
        try {
            const { idregistro } = req.body;
            if (!idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.firmaBorrar, values: [token.decriptar(idregistro)] });
            res.send({ status: 'success', statusCode: 200, message: 'Firma eliminada', rows: {} });
        } catch (error) { console.log('firmaBorrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo eliminar', rows: [] }); }
    },
};
