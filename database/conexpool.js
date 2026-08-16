require('dotenv').config()
const fs = require("fs")
const Sequelize = require("sequelize");

/*
 * =====================================================================
 * CONEXIÓN A LA BASE DE DATOS (bdsae2) - Sequelize (scheduler)
 * =====================================================================
 * SEGMENTO PARA PRODUCCIÓN (conexión SSL con certificados):
 * Descomentar este bloque al desplegar en el servidor de producción.
 * ---------------------------------------------------------------------
 * const sequelize = new Sequelize(process.env.PG_DB_NAME, process.env.PG_USER, process.env.PG_PASSWORD,
 * {
 *     host: process.env.PG_HOST,
 *     dialect: process.env.PG_DIALECT,
 *     operatorsAliases: 0,
 *     pool: {
 *         max: process.env.PG_POOL_MAX,
 *         min: process.env.PG_POOL_MIN,
 *         acquire: process.env.PG_POOL_ACQUIRE,
 *         idle: process.env.PG_POOL_IDLE
 *     },
 *     ssl: {
 *         rejectUnauthorized: false,
 *         ca: fs.readFileSync(`${process.env.PG_CERT}`).toString(),
 *         key: fs.readFileSync(`${process.env.PG_CERT_KEY}`).toString(),
 *     },
 * });
 * =====================================================================
 * SEGMENTO PARA DESARROLLO LOCAL (conexión sin SSL a localhost):
 * ---------------------------------------------------------------------
 * const sequelize = new Sequelize(process.env.PG_DB_NAME, process.env.PG_USER, process.env.PG_PASSWORD,
 * {
 *     host: process.env.PG_HOST,
 *     dialect: process.env.PG_DIALECT,
 *     operatorsAliases: 0,
 *     pool: { max, min, acquire, idle },
 *     ssl: false,
 * });
 * =====================================================================
 */

// CONEXIÓN ACTIVA: DESARROLLO LOCAL (sin SSL)
const sequelize = new Sequelize(process.env.PG_DB_NAME, process.env.PG_USER, process.env.PG_PASSWORD,
{
    host: process.env.PG_HOST,
    dialect: process.env.PG_DIALECT,
    operatorsAliases: 0,
    pool: {
        max: process.env.PG_POOL_MAX,
        min: process.env.PG_POOL_MIN,
        acquire: process.env.PG_POOL_ACQUIRE,
        idle: process.env.PG_POOL_IDLE
    },
    ssl: false,
});
var db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
// MODEL FOR SCHEDULE
db.scheduler = require("../scheduler/models/model")(sequelize, Sequelize);
module.exports = db;