require('dotenv').config()
const { Client } = require('pg')
const fs = require("fs")

/*
 * =====================================================================
 * CONEXIÓN A LA BASE DE DATOS (bdsae2)
 * =====================================================================
 * SEGMENTO PARA PRODUCCIÓN (conexión SSL con certificados):
 * Descomentar este bloque al desplegar en el servidor de producción.
 * ---------------------------------------------------------------------
 * const config = {
 *     host: process.env.PG_HOST,
 *     port: process.env.PG_PORT,
 *     user: process.env.PG_USER,
 *     database: process.env.PG_DB_NAME,
 *     password: process.env.PG_PASSWORD,
 *     ssl: {
 *         rejectUnauthorized: false,
 *         ca: fs.readFileSync(process.env.PG_CERT_CA).toString(),
 *         cert: fs.readFileSync(process.env.PG_CERT).toString(),
 *         key: fs.readFileSync(process.env.PG_CERT_KEY).toString(),
 *     },
 * }
 * =====================================================================
 * SEGMENTO PARA DESARROLLO LOCAL (conexión sin SSL a localhost):
 * ---------------------------------------------------------------------
 * const config = {
 *     host: process.env.PG_HOST,
 *     port: process.env.PG_PORT,
 *     user: process.env.PG_USER,
 *     database: process.env.PG_DB_NAME,
 *     password: process.env.PG_PASSWORD,
 *     ssl: false,
 * }
 * =====================================================================
 */

// CONEXIÓN ACTIVA: DESARROLLO LOCAL (sin SSL)
const config = {
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    user: process.env.PG_USER,
    database: process.env.PG_DB_NAME,
    password: process.env.PG_PASSWORD,
    ssl: false,
}
console.log('DB Client config: ', config)
const client = new Client(config)

client.connect()
    .then(() => console.log('Conectado a postgres -> ' + client.host + ':' + client.database + ' user ' + client.user))
    .catch(err => console.log('error de conexion a la DB', err.stack))

const Db = client;

module.exports = Db