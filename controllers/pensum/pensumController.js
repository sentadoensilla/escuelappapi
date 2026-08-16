/**
 * pensumController.js
 * Controlador del módulo de pensum: áreas, asignaturas, áreas por institución,
 * contenidos programáticos, contenidos por asignación-curso y configuración de áreas.
 */
require('dotenv').config();
const Db = require('../../database/conex');
const token = require('../../utils/token');
const sql = require('./pensum.sql');

const ESTADO_INACTIVO = 9;

module.exports = {

    // ================= ÁREAS =================
    async areaListar(req, res) {
        try {
            const resp = await Db.query({ text: sql.areaListar, values: [] });
            resp.rows.forEach((f, i) => { resp.rows[i].idregistro = token.encriptar(f.idregistro); });
            res.send({ status: 'success', statusCode: 200, message: resp.rows.length + ' áreas encontradas', rows: resp.rows });
        } catch (error) { console.log('areaListar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo consultar las áreas', rows: [] }); }
    },
    async areaRegistrar(req, res) {
        try {
            const { descripcion, comentario, idestado } = req.body;
            if (!descripcion) return res.send({ status: 'error', statusCode: 400, message: 'Falta la descripción del área', rows: [] });
            const estado = idestado ? parseInt(token.decriptar(idestado)) : 8;
            const resp = await Db.query({ text: sql.areaRegistrar, values: [descripcion, comentario, estado] });
            res.send({ status: 'success', statusCode: 200, message: 'Área registrada', rows: { idregistro: token.encriptar(resp.rows[0].idregistro) } });
        } catch (error) { console.log('areaRegistrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo registrar el área', rows: [] }); }
    },
    async areaActualizar(req, res) {
        try {
            const { idregistro, descripcion, comentario, idestado } = req.body;
            if (!idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            const estado = idestado ? parseInt(token.decriptar(idestado)) : 8;
            await Db.query({ text: sql.areaActualizar, values: [token.decriptar(idregistro), descripcion, comentario, estado] });
            res.send({ status: 'success', statusCode: 200, message: 'Área actualizada', rows: {} });
        } catch (error) { console.log('areaActualizar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo actualizar el área', rows: [] }); }
    },
    async areaBorrar(req, res) {
        try {
            const { idregistro } = req.body;
            if (!idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.areaBorrar, values: [token.decriptar(idregistro), ESTADO_INACTIVO] });
            res.send({ status: 'success', statusCode: 200, message: 'Área eliminada', rows: {} });
        } catch (error) { console.log('areaBorrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo eliminar el área', rows: [] }); }
    },

    // ================= ASIGNATURAS =================
    async asignaturaListar(req, res) {
        try {
            const resp = await Db.query({ text: sql.asignaturaListar, values: [] });
            resp.rows.forEach((f, i) => {
                resp.rows[i].idregistro = token.encriptar(f.idregistro);
            });
            res.send({ status: 'success', statusCode: 200, message: resp.rows.length + ' asignaturas encontradas', rows: resp.rows });
        } catch (error) { console.log('asignaturaListar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo consultar las asignaturas', rows: [] }); }
    },
    async asignaturaRegistrar(req, res) {
        try {
            const { descripcion, idarea, evaluable, idestado, abreviatura } = req.body;
            if (!descripcion) return res.send({ status: 'error', statusCode: 400, message: 'Falta la descripción de la asignatura', rows: [] });
            const careaid = idarea ? parseInt(token.decriptar(idarea)) : null;
            const estado = idestado ? parseInt(token.decriptar(idestado)) : 1;
            const resp = await Db.query({ text: sql.asignaturaRegistrar, values: [descripcion, careaid, evaluable ?? false, estado, abreviatura] });
            res.send({ status: 'success', statusCode: 200, message: 'Asignatura registrada', rows: { idregistro: token.encriptar(resp.rows[0].idregistro) } });
        } catch (error) { console.log('asignaturaRegistrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo registrar la asignatura', rows: [] }); }
    },
    async asignaturaActualizar(req, res) {
        try {
            const { idregistro, descripcion, idarea, evaluable, idestado, abreviatura } = req.body;
            if (!idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            const careaid = idarea ? parseInt(token.decriptar(idarea)) : null;
            const estado = idestado ? parseInt(token.decriptar(idestado)) : 1;
            await Db.query({ text: sql.asignaturaActualizar, values: [token.decriptar(idregistro), descripcion, careaid, evaluable ?? false, estado, abreviatura] });
            res.send({ status: 'success', statusCode: 200, message: 'Asignatura actualizada', rows: {} });
        } catch (error) { console.log('asignaturaActualizar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo actualizar la asignatura', rows: [] }); }
    },
    async asignaturaBorrar(req, res) {
        try {
            const { idregistro } = req.body;
            if (!idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.asignaturaBorrar, values: [token.decriptar(idregistro), 0] });
            res.send({ status: 'success', statusCode: 200, message: 'Asignatura eliminada', rows: {} });
        } catch (error) { console.log('asignaturaBorrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo eliminar la asignatura', rows: [] }); }
    },

    // ================= ÁREAS POR INSTITUCIÓN =================
    async instareaListar(req, res) {
        try {
            const { idinstitucion } = req.body || {};
            const cinstid = idinstitucion ? parseInt(token.decriptar(idinstitucion)) : null;
            const resp = await Db.query({ text: sql.instareaListar, values: [cinstid] });
            resp.rows.forEach((f, i) => { resp.rows[i].idregistro = token.encriptar(f.idregistro); });
            res.send({ status: 'success', statusCode: 200, message: resp.rows.length + ' áreas por institución', rows: resp.rows });
        } catch (error) { console.log('instareaListar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo consultar', rows: [] }); }
    },
    async instareaRegistrar(req, res) {
        try {
            const { idinstitucion, idarea, idestado } = req.body;
            if (!idinstitucion || !idarea) return res.send({ status: 'error', statusCode: 400, message: 'Falta institución o área', rows: [] });
            const cinstid = parseInt(token.decriptar(idinstitucion));
            const careaid = parseInt(token.decriptar(idarea));
            const estado = idestado ? parseInt(token.decriptar(idestado)) : 1;
            const resp = await Db.query({ text: sql.instareaRegistrar, values: [cinstid, careaid, estado] });
            res.send({ status: 'success', statusCode: 200, message: 'Área asignada a la institución', rows: { idregistro: token.encriptar(resp.rows[0].idregistro) } });
        } catch (error) { console.log('instareaRegistrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo registrar', rows: [] }); }
    },
    async instareaBorrar(req, res) {
        try {
            const { idregistro } = req.body;
            if (!idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.instareaBorrar, values: [token.decriptar(idregistro), 0] });
            res.send({ status: 'success', statusCode: 200, message: 'Área retirada de la institución', rows: {} });
        } catch (error) { console.log('instareaBorrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo eliminar', rows: [] }); }
    },

    // ================= CONTENIDOS PROGRAMÁTICOS =================
    async contenidoListar(req, res) {
        try {
            const { idasignatura } = req.body || {};
            const casigid = idasignatura ? parseInt(token.decriptar(idasignatura)) : null;
            const resp = await Db.query({ text: sql.contenidoListar, values: [casigid] });
            resp.rows.forEach((f, i) => { resp.rows[i].idregistro = token.encriptar(f.idregistro); });
            res.send({ status: 'success', statusCode: 200, message: resp.rows.length + ' contenidos encontrados', rows: resp.rows });
        } catch (error) { console.log('contenidoListar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo consultar', rows: [] }); }
    },
    async contenidoRegistrar(req, res) {
        try {
            const { idasignatura, codigo, descripcion, idestado } = req.body;
            if (!idasignatura || !descripcion) return res.send({ status: 'error', statusCode: 400, message: 'Falta información del contenido', rows: [] });
            const casigid = parseInt(token.decriptar(idasignatura));
            const estado = idestado ? parseInt(token.decriptar(idestado)) : 1;
            const resp = await Db.query({ text: sql.contenidoRegistrar, values: [casigid, codigo, descripcion, estado] });
            res.send({ status: 'success', statusCode: 200, message: 'Contenido registrado', rows: { idregistro: token.encriptar(resp.rows[0].idregistro) } });
        } catch (error) { console.log('contenidoRegistrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo registrar', rows: [] }); }
    },
    async contenidoActualizar(req, res) {
        try {
            const { idregistro, idasignatura, codigo, descripcion, idestado } = req.body;
            if (!idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            const casigid = idasignatura ? parseInt(token.decriptar(idasignatura)) : null;
            const estado = idestado ? parseInt(token.decriptar(idestado)) : 1;
            await Db.query({ text: sql.contenidoActualizar, values: [token.decriptar(idregistro), casigid, codigo, descripcion, estado] });
            res.send({ status: 'success', statusCode: 200, message: 'Contenido actualizado', rows: {} });
        } catch (error) { console.log('contenidoActualizar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo actualizar', rows: [] }); }
    },
    async contenidoBorrar(req, res) {
        try {
            const { idregistro } = req.body;
            if (!idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.contenidoBorrar, values: [token.decriptar(idregistro), 0] });
            res.send({ status: 'success', statusCode: 200, message: 'Contenido eliminado', rows: {} });
        } catch (error) { console.log('contenidoBorrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo eliminar', rows: [] }); }
    },

    // ================= CONTENIDO POR ASIGNACIÓN-CURSO =================
    async asigcurscontprogListar(req, res) {
        try {
            const { idasigcurs } = req.body || {};
            const asigcursid = idasigcurs ? parseInt(token.decriptar(idasigcurs)) : null;
            const resp = await Db.query({ text: sql.asigcurscontprogListar, values: [asigcursid] });
            resp.rows.forEach((f, i) => { resp.rows[i].idregistro = token.encriptar(f.idregistro); });
            res.send({ status: 'success', statusCode: 200, message: resp.rows.length + ' contenidos por asignación', rows: resp.rows });
        } catch (error) { console.log('asigcurscontprogListar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo consultar', rows: [] }); }
    },
    async asigcurscontprogRegistrar(req, res) {
        try {
            const { idasigcurs, idcontenido, fecha, idestado } = req.body;
            if (!idasigcurs || !idcontenido) return res.send({ status: 'error', statusCode: 400, message: 'Falta información', rows: [] });
            const asigcursid = parseInt(token.decriptar(idasigcurs));
            const ccontprogid = parseInt(token.decriptar(idcontenido));
            const estado = idestado ? parseInt(token.decriptar(idestado)) : 1;
            const resp = await Db.query({ text: sql.asigcurscontprogRegistrar, values: [asigcursid, ccontprogid, fecha, estado] });
            res.send({ status: 'success', statusCode: 200, message: 'Contenido asignado', rows: { idregistro: token.encriptar(resp.rows[0].idregistro) } });
        } catch (error) { console.log('asigcurscontprogRegistrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo registrar', rows: [] }); }
    },
    async asigcurscontprogBorrar(req, res) {
        try {
            const { idregistro } = req.body;
            if (!idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.asigcurscontprogBorrar, values: [token.decriptar(idregistro), 0] });
            res.send({ status: 'success', statusCode: 200, message: 'Contenido retirado de la asignación', rows: {} });
        } catch (error) { console.log('asigcurscontprogBorrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo eliminar', rows: [] }); }
    },

    // ================= CONFIGURACIÓN DE ÁREAS =================
    async areaconfListar(req, res) {
        try {
            const { idinstitucion, idano } = req.body || {};
            const cinstid = idinstitucion ? parseInt(token.decriptar(idinstitucion)) : null;
            const canolid = idano ? parseInt(token.decriptar(idano)) : null;
            const resp = await Db.query({ text: sql.areaconfListar, values: [cinstid, canolid] });
            resp.rows.forEach((f, i) => { resp.rows[i].idregistro = token.encriptar(f.idregistro); });
            res.send({ status: 'success', statusCode: 200, message: resp.rows.length + ' configuraciones de área', rows: resp.rows });
        } catch (error) { console.log('areaconfListar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo consultar', rows: [] }); }
    },
    async areaconfRegistrar(req, res) {
        try {
            const { idano, idinstitucion, idasignatura, idgrado, valor, idestado } = req.body;
            if (!idano || !idinstitucion || !idasignatura || !idgrado) return res.send({ status: 'error', statusCode: 400, message: 'Falta información', rows: [] });
            const canolid = parseInt(token.decriptar(idano));
            const cinstid = parseInt(token.decriptar(idinstitucion));
            const casigid = parseInt(token.decriptar(idasignatura));
            const cgradid = parseInt(token.decriptar(idgrado));
            const estado = idestado ? parseInt(token.decriptar(idestado)) : 8;
            const resp = await Db.query({ text: sql.areaconfRegistrar, values: [canolid, cinstid, casigid, cgradid, valor, estado] });
            res.send({ status: 'success', statusCode: 200, message: 'Configuración de área registrada', rows: { idregistro: token.encriptar(resp.rows[0].idregistro) } });
        } catch (error) { console.log('areaconfRegistrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo registrar', rows: [] }); }
    },
    async areaconfActualizar(req, res) {
        try {
            const { idregistro, idasignatura, idgrado, valor, idestado } = req.body;
            if (!idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            const casigid = idasignatura ? parseInt(token.decriptar(idasignatura)) : null;
            const cgradid = idgrado ? parseInt(token.decriptar(idgrado)) : null;
            const estado = idestado ? parseInt(token.decriptar(idestado)) : 8;
            await Db.query({ text: sql.areaconfActualizar, values: [token.decriptar(idregistro), casigid, cgradid, valor, estado] });
            res.send({ status: 'success', statusCode: 200, message: 'Configuración de área actualizada', rows: {} });
        } catch (error) { console.log('areaconfActualizar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo actualizar', rows: [] }); }
    },
    async areaconfBorrar(req, res) {
        try {
            const { idregistro } = req.body;
            if (!idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.areaconfBorrar, values: [token.decriptar(idregistro), ESTADO_INACTIVO] });
            res.send({ status: 'success', statusCode: 200, message: 'Configuración de área eliminada', rows: {} });
        } catch (error) { console.log('areaconfBorrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo eliminar', rows: [] }); }
    },
};
