/**
 * usuariossaeController.js
 * Controlador del módulo de usuarios y roles SAE (esquema logic) y el enlace
 * usuario-académico (public.tabunio).
 */
require('dotenv').config();
const Db = require('../../database/conex');
const token = require('../../utils/token');
const sql = require('./usuariossae.sql');

const ESTADO_INACTIVO = 9;

module.exports = {

    // ================= USUARIOS =================
    async usuarioListar(req, res) {
        try {
            const resp = await Db.query({ text: sql.usuarioListar, values: [] });
            resp.rows.forEach((f, i) => { resp.rows[i].idregistro = token.encriptar(f.idregistro); });
            res.send({ status: 'success', statusCode: 200, message: resp.rows.length + ' usuarios', rows: resp.rows });
        } catch (error) { console.log('usuarioListar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo consultar', rows: [] }); }
    },
    async usuarioRegistrar(req, res) {
        try {
            const b = req.body;
            if (!b.nick || !b.clave) return res.send({ status: 'error', statusCode: 400, message: 'Falta usuario o clave', rows: [] });
            // NOTA: integrar con la utilidad de cifrado (utils/encrypassword) cuando se una al login SAE.
            const resp = await Db.query({ text: sql.usuarioRegistrar, values: [b.nombre, b.nick, b.clave, b.idrol ? parseInt(token.decriptar(b.idrol)) : null, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8] });
            res.send({ status: 'success', statusCode: 200, message: 'Usuario registrado', rows: { idregistro: token.encriptar(resp.rows[0].idregistro) } });
        } catch (error) { console.log('usuarioRegistrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo registrar', rows: [] }); }
    },
    async usuarioActualizar(req, res) {
        try {
            const b = req.body;
            if (!b.idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.usuarioActualizar, values: [token.decriptar(b.idregistro), b.nombre, b.nick, b.idrol ? parseInt(token.decriptar(b.idrol)) : null, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8] });
            res.send({ status: 'success', statusCode: 200, message: 'Usuario actualizado', rows: {} });
        } catch (error) { console.log('usuarioActualizar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo actualizar', rows: [] }); }
    },
    async usuarioClave(req, res) {
        try {
            const b = req.body;
            if (!b.idregistro || !b.clave) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador o la clave', rows: [] });
            await Db.query({ text: sql.usuarioClave, values: [token.decriptar(b.idregistro), b.clave] });
            res.send({ status: 'success', statusCode: 200, message: 'Clave actualizada', rows: {} });
        } catch (error) { console.log('usuarioClave: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo actualizar la clave', rows: [] }); }
    },
    async usuarioBorrar(req, res) {
        try {
            const { idregistro } = req.body;
            if (!idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.usuarioBorrar, values: [token.decriptar(idregistro), ESTADO_INACTIVO] });
            res.send({ status: 'success', statusCode: 200, message: 'Usuario eliminado', rows: {} });
        } catch (error) { console.log('usuarioBorrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo eliminar', rows: [] }); }
    },

    // ================= ROLES =================
    async rolListar(req, res) {
        try {
            const resp = await Db.query({ text: sql.rolListar, values: [] });
            resp.rows.forEach((f, i) => { resp.rows[i].idregistro = token.encriptar(f.idregistro); });
            res.send({ status: 'success', statusCode: 200, message: resp.rows.length + ' roles', rows: resp.rows });
        } catch (error) { console.log('rolListar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo consultar', rows: [] }); }
    },
    async rolRegistrar(req, res) {
        try {
            const b = req.body;
            if (!b.nombre) return res.send({ status: 'error', statusCode: 400, message: 'Falta el nombre del rol', rows: [] });
            const resp = await Db.query({ text: sql.rolRegistrar, values: [b.nombre, b.descripcion, b.paginaentrada, b.idenlace, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8] });
            res.send({ status: 'success', statusCode: 200, message: 'Rol registrado', rows: { idregistro: token.encriptar(resp.rows[0].idregistro) } });
        } catch (error) { console.log('rolRegistrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo registrar', rows: [] }); }
    },
    async rolActualizar(req, res) {
        try {
            const b = req.body;
            if (!b.idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.rolActualizar, values: [token.decriptar(b.idregistro), b.nombre, b.descripcion, b.paginaentrada, b.idenlace, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8] });
            res.send({ status: 'success', statusCode: 200, message: 'Rol actualizado', rows: {} });
        } catch (error) { console.log('rolActualizar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo actualizar', rows: [] }); }
    },
    async rolBorrar(req, res) {
        try {
            const { idregistro } = req.body;
            if (!idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.rolBorrar, values: [token.decriptar(idregistro), ESTADO_INACTIVO] });
            res.send({ status: 'success', statusCode: 200, message: 'Rol eliminado', rows: {} });
        } catch (error) { console.log('rolBorrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo eliminar', rows: [] }); }
    },

    // ================= MENÚS =================
    async menuListar(req, res) {
        try {
            const resp = await Db.query({ text: sql.menuListar, values: [] });
            resp.rows.forEach((f, i) => { resp.rows[i].idregistro = token.encriptar(f.idregistro); });
            res.send({ status: 'success', statusCode: 200, message: resp.rows.length + ' menús', rows: resp.rows });
        } catch (error) { console.log('menuListar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo consultar', rows: [] }); }
    },
    async menuRegistrar(req, res) {
        try {
            const b = req.body;
            if (!b.nombre) return res.send({ status: 'error', statusCode: 400, message: 'Falta el nombre del menú', rows: [] });
            const resp = await Db.query({ text: sql.menuRegistrar, values: [b.nombre, b.descripcion, b.destino, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8, b.orden] });
            res.send({ status: 'success', statusCode: 200, message: 'Menú registrado', rows: { idregistro: token.encriptar(resp.rows[0].idregistro) } });
        } catch (error) { console.log('menuRegistrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo registrar', rows: [] }); }
    },
    async menuActualizar(req, res) {
        try {
            const b = req.body;
            if (!b.idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.menuActualizar, values: [token.decriptar(b.idregistro), b.nombre, b.descripcion, b.destino, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8, b.orden] });
            res.send({ status: 'success', statusCode: 200, message: 'Menú actualizado', rows: {} });
        } catch (error) { console.log('menuActualizar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo actualizar', rows: [] }); }
    },
    async menuBorrar(req, res) {
        try {
            const { idregistro } = req.body;
            if (!idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.menuBorrar, values: [token.decriptar(idregistro), ESTADO_INACTIVO] });
            res.send({ status: 'success', statusCode: 200, message: 'Menú eliminado', rows: {} });
        } catch (error) { console.log('menuBorrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo eliminar', rows: [] }); }
    },

    // ================= OPCIONES DE MENÚ =================
    async opcionListar(req, res) {
        try {
            const resp = await Db.query({ text: sql.opcionListar, values: [] });
            resp.rows.forEach((f, i) => { resp.rows[i].idregistro = token.encriptar(f.idregistro); });
            res.send({ status: 'success', statusCode: 200, message: resp.rows.length + ' opciones', rows: resp.rows });
        } catch (error) { console.log('opcionListar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo consultar', rows: [] }); }
    },
    async opcionRegistrar(req, res) {
        try {
            const b = req.body;
            if (!b.idmenu || !b.nombre) return res.send({ status: 'error', statusCode: 400, message: 'Falta menú o nombre', rows: [] });
            const resp = await Db.query({ text: sql.opcionRegistrar, values: [parseInt(token.decriptar(b.idmenu)), b.nombre, b.descripcion, b.enlace, b.icono, b.orden, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8] });
            res.send({ status: 'success', statusCode: 200, message: 'Opción registrada', rows: { idregistro: token.encriptar(resp.rows[0].idregistro) } });
        } catch (error) { console.log('opcionRegistrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo registrar', rows: [] }); }
    },
    async opcionActualizar(req, res) {
        try {
            const b = req.body;
            if (!b.idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.opcionActualizar, values: [token.decriptar(b.idregistro), b.idmenu ? parseInt(token.decriptar(b.idmenu)) : null, b.nombre, b.descripcion, b.enlace, b.icono, b.orden, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8] });
            res.send({ status: 'success', statusCode: 200, message: 'Opción actualizada', rows: {} });
        } catch (error) { console.log('opcionActualizar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo actualizar', rows: [] }); }
    },
    async opcionBorrar(req, res) {
        try {
            const { idregistro } = req.body;
            if (!idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.opcionBorrar, values: [token.decriptar(idregistro), ESTADO_INACTIVO] });
            res.send({ status: 'success', statusCode: 200, message: 'Opción eliminada', rows: {} });
        } catch (error) { console.log('opcionBorrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo eliminar', rows: [] }); }
    },

    // ================= PRIVILEGIOS POR ROL =================
    async rollopciListar(req, res) {
        try {
            const { idrol } = req.body || {};
            const crollid = idrol ? parseInt(token.decriptar(idrol)) : null;
            const resp = await Db.query({ text: sql.rollopciListar, values: [crollid] });
            resp.rows.forEach((f, i) => { resp.rows[i].idregistro = token.encriptar(f.idregistro); });
            res.send({ status: 'success', statusCode: 200, message: resp.rows.length + ' privilegios', rows: resp.rows });
        } catch (error) { console.log('rollopciListar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo consultar', rows: [] }); }
    },
    async rollopciRegistrar(req, res) {
        try {
            const b = req.body;
            if (!b.idrol || !b.idopcion) return res.send({ status: 'error', statusCode: 400, message: 'Falta rol u opción', rows: [] });
            const resp = await Db.query({ text: sql.rollopciRegistrar, values: [parseInt(token.decriptar(b.idopcion)), parseInt(token.decriptar(b.idrol)), b.idestado ? parseInt(token.decriptar(b.idestado)) : 1] });
            res.send({ status: 'success', statusCode: 200, message: 'Privilegio de rol registrado', rows: { idregistro: token.encriptar(resp.rows[0].idregistro) } });
        } catch (error) { console.log('rollopciRegistrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo registrar', rows: [] }); }
    },
    async rollopciBorrar(req, res) {
        try {
            const { idregistro } = req.body;
            if (!idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.rollopciBorrar, values: [token.decriptar(idregistro), 0] });
            res.send({ status: 'success', statusCode: 200, message: 'Privilegio de rol eliminado', rows: {} });
        } catch (error) { console.log('rollopciBorrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo eliminar', rows: [] }); }
    },

    // ================= PRIVILEGIOS POR USUARIO =================
    async usuaopciListar(req, res) {
        try {
            const { idusuario } = req.body || {};
            const cusuaid = idusuario ? parseInt(token.decriptar(idusuario)) : null;
            const resp = await Db.query({ text: sql.usuaopciListar, values: [cusuaid] });
            resp.rows.forEach((f, i) => { resp.rows[i].idregistro = token.encriptar(f.idregistro); });
            res.send({ status: 'success', statusCode: 200, message: resp.rows.length + ' privilegios', rows: resp.rows });
        } catch (error) { console.log('usuaopciListar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo consultar', rows: [] }); }
    },
    async usuaopciRegistrar(req, res) {
        try {
            const b = req.body;
            if (!b.idusuario || !b.idopcion) return res.send({ status: 'error', statusCode: 400, message: 'Falta usuario u opción', rows: [] });
            const resp = await Db.query({ text: sql.usuaopciRegistrar, values: [parseInt(token.decriptar(b.idopcion)), parseInt(token.decriptar(b.idusuario)), b.idestado ? parseInt(token.decriptar(b.idestado)) : 1] });
            res.send({ status: 'success', statusCode: 200, message: 'Privilegio de usuario registrado', rows: { idregistro: token.encriptar(resp.rows[0].idregistro) } });
        } catch (error) { console.log('usuaopciRegistrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo registrar', rows: [] }); }
    },
    async usuaopciBorrar(req, res) {
        try {
            const { idregistro } = req.body;
            if (!idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.usuaopciBorrar, values: [token.decriptar(idregistro), 0] });
            res.send({ status: 'success', statusCode: 200, message: 'Privilegio de usuario eliminado', rows: {} });
        } catch (error) { console.log('usuaopciBorrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo eliminar', rows: [] }); }
    },

    // ================= ENLACE USUARIO-ACADÉMICO =================
    async unioListar(req, res) {
        try {
            const { idusuario } = req.body || {};
            const cusuaid = idusuario ? parseInt(token.decriptar(idusuario)) : null;
            const resp = await Db.query({ text: sql.unioListar, values: [cusuaid] });
            resp.rows.forEach((f, i) => { resp.rows[i].idregistro = token.encriptar(f.idregistro); });
            res.send({ status: 'success', statusCode: 200, message: resp.rows.length + ' enlaces', rows: resp.rows });
        } catch (error) { console.log('unioListar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo consultar', rows: [] }); }
    },
    async unioRegistrar(req, res) {
        try {
            const b = req.body;
            if (!b.idusuario || !b.idacademico) return res.send({ status: 'error', statusCode: 400, message: 'Falta usuario o académico', rows: [] });
            const resp = await Db.query({ text: sql.unioRegistrar, values: [parseInt(token.decriptar(b.idusuario)), parseInt(token.decriptar(b.idacademico)), b.idestado ? parseInt(token.decriptar(b.idestado)) : 8] });
            res.send({ status: 'success', statusCode: 200, message: 'Enlace usuario-académico registrado', rows: { idregistro: token.encriptar(resp.rows[0].idregistro) } });
        } catch (error) { console.log('unioRegistrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo registrar', rows: [] }); }
    },
    async unioBorrar(req, res) {
        try {
            const { idregistro } = req.body;
            if (!idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
            await Db.query({ text: sql.unioBorrar, values: [token.decriptar(idregistro), ESTADO_INACTIVO] });
            res.send({ status: 'success', statusCode: 200, message: 'Enlace eliminado', rows: {} });
        } catch (error) { console.log('unioBorrar: ', error); res.send({ status: 'error', statusCode: 400, message: 'No se pudo eliminar', rows: [] }); }
    },
};
