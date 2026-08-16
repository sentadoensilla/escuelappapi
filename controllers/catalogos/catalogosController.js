/**
 * catalogosController.js
 * CRUD genérico para los catálogos SAE definidos en catalogos.sql.js.
 * Operaciones: listar, registrar, actualizar y borrar (lógico) por catálogo.
 * Los IDs devueltos se encriptan (token.encriptar) y los recibidos se desencriptan.
 */
require('dotenv').config();
const Db = require('../../database/conex');
const token = require('../../utils/token');
const { catalogos, buildSelect, buildInsert, buildUpdate, buildDelete } = require('./catalogos.sql');

/**
 * Resuelve la configuración de un catálogo a partir de su clave (req.params.tabla).
 * @param {string} tabla clave del catálogo
 * @returns {object|null} entrada del mapa catalogos o null si no existe
 */
const resolverConfig = (tabla) => (catalogos[tabla] ? catalogos[tabla] : null);

/**
 * decriptarFks: desencripta las columnas marcadas como clave foránea (config.fk)
 * para que se almacenen con su valor numérico real.
 * @param {object} config entrada del mapa catalogos
 * @param {object} body objeto con los campos recibidos del frontend
 * @returns {object} body con las FKs desencriptadas
 */
const decriptarFks = (config, body) => {
    const campos = { ...body };
    if (Array.isArray(config.fk)) {
        config.fk.forEach((col) => {
            if (campos[col] !== undefined && campos[col] !== null && campos[col] !== '') {
                campos[col] = token.decriptar(campos[col]);
            }
        });
    }
    return campos;
};

module.exports = {

    /**
     * catalogosListar: lista los registros de un catálogo.
     * @param {*} req params: tabla (clave del catálogo)
     * @param {*} res {status, statusCode, message, rows}
     */
    async catalogosListar(req, res) {
        const resultadoFinal = {};
        const config = resolverConfig(req.params.tabla);
        if (!config) {
            return res.send({ status: 'error', statusCode: 400, message: 'Catálogo no reconocido: ' + req.params.tabla, rows: [] });
        }
        try {
            const resp = await Db.query(buildSelect(config));
            // Encriptar la pk para el frontend
            resp.rows.forEach((fila, i) => { resp.rows[i].idregistro = token.encriptar(fila.idregistro); });
            res.send({ status: 'success', statusCode: 200, message: resp.rows.length + ' filas encontradas', rows: resp.rows });
        } catch (error) {
            console.log('catalogosListar: ', error);
            res.send({ status: 'error', statusCode: 400, message: 'No se pudo consultar el catálogo', rows: [] });
        }
    },

    /**
     * catalogosRegistrar: inserta un registro en un catálogo.
     * @param {*} req params: tabla; body: columnas del catálogo (p.ej. cgraddesc)
     * @param {*} res {status, statusCode, message, rows}
     */
    async catalogosRegistrar(req, res) {
        const config = resolverConfig(req.params.tabla);
        if (!config) {
            return res.send({ status: 'error', statusCode: 400, message: 'Catálogo no reconocido: ' + req.params.tabla, rows: [] });
        }
        try {
            // Desencriptar las columnas que son claves foráneas (enmascaradas por el frontend).
            const campos = decriptarFks(config, req.body);
            const query = buildInsert(config, campos);
            if (!query) {
                return res.send({ status: 'error', statusCode: 400, message: 'Falta información para registrar', rows: [] });
            }
            const resp = await Db.query(query);
            const idNuevo = token.encriptar(resp.rows[0].idregistro);
            res.send({ status: 'success', statusCode: 200, message: 'Registro creado correctamente', rows: { idregistro: idNuevo } });
        } catch (error) {
            console.log('catalogosRegistrar: ', error);
            res.send({ status: 'error', statusCode: 400, message: 'No se pudo registrar el dato', rows: [] });
        }
    },

    /**
     * catalogosActualizar: modifica un registro de un catálogo.
     * @param {*} req params: tabla; body: idregistro (encriptado) + columnas a cambiar
     * @param {*} res {status, statusCode, message, rows}
     */
    async catalogosActualizar(req, res) {
        const config = resolverConfig(req.params.tabla);
        if (!config) {
            return res.send({ status: 'error', statusCode: 400, message: 'Catálogo no reconocido: ' + req.params.tabla, rows: [] });
        }
        try {
            const { idregistro, ...campos } = req.body;
            if (!idregistro) {
                return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador del registro', rows: [] });
            }
            const pk = token.decriptar(idregistro);
            const query = buildUpdate(config, pk, decriptarFks(config, campos));
            if (!query) {
                return res.send({ status: 'error', statusCode: 400, message: 'No hay campos para actualizar', rows: [] });
            }
            await Db.query(query);
            res.send({ status: 'success', statusCode: 200, message: 'Registro actualizado correctamente', rows: {} });
        } catch (error) {
            console.log('catalogosActualizar: ', error);
            res.send({ status: 'error', statusCode: 400, message: 'No se pudo actualizar el dato', rows: [] });
        }
    },

    /**
     * catalogosBorrar: borrado lógico (cambia estado a inactivo) de un catálogo.
     * @param {*} req params: tabla; body: idregistro (encriptado)
     * @param {*} res {status, statusCode, message, rows}
     */
    async catalogosBorrar(req, res) {
        const config = resolverConfig(req.params.tabla);
        if (!config) {
            return res.send({ status: 'error', statusCode: 400, message: 'Catálogo no reconocido: ' + req.params.tabla, rows: [] });
        }
        if (!config.estado) {
            return res.send({ status: 'error', statusCode: 400, message: 'Este catálogo no permite borrado lógico', rows: [] });
        }
        try {
            const { idregistro } = req.body;
            if (!idregistro) {
                return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador del registro', rows: [] });
            }
            const pk = token.decriptar(idregistro);
            await Db.query(buildDelete(config, pk));
            res.send({ status: 'success', statusCode: 200, message: 'Registro eliminado correctamente', rows: {} });
        } catch (error) {
            console.log('catalogosBorrar: ', error);
            res.send({ status: 'error', statusCode: 400, message: 'No se pudo eliminar el dato', rows: [] });
        }
    },
};
