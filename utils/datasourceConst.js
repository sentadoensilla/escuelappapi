import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
require('dotenv').config();
/*
 * =====================================================================
 * CONEXIÓN A LA BASE DE DATOS (bdsae2)
 * =====================================================================
 * SEGMENTO PARA PRODUCCIÓN (conexión SSL con certificados):
 * Descomentar este bloque al desplegar en el servidor de producción.
 * ---------------------------------------------------------------------
 * const connParams = {
 *     host: process.env.PG_HOST,
 *     port: process.env.PG_PORT,
 *     user: process.env.PG_USER,
 *     database: process.env.PG_DB_NAME,
 *     password: process.env.PG_PASSWORD,
 *     max: 50,
 *     connectionTimeoutMillis: 15000,
 *     idleTimeoutMillis: 30000,
 *     ssl: {
 *         rejectUnauthorized: false,
 *         ca: fs.readFileSync(process.env.PG_CERT).toString(),
 *     }
 * }
 * =====================================================================
 * SEGMENTO PARA DESARROLLO LOCAL (conexión sin SSL a localhost):
 * ---------------------------------------------------------------------
 * const connParams = {
 *     host: process.env.PG_HOST,
 *     port: process.env.PG_PORT,
 *     user: process.env.PG_USER,
 *     database: process.env.PG_DB_NAME,
 *     password: process.env.PG_PASSWORD,
 *     max: 50,
 *     connectionTimeoutMillis: 15000,
 *     idleTimeoutMillis: 30000,
 *     ssl: false,
 * }
 * =====================================================================
 */

// CONEXIÓN ACTIVA: DESARROLLO LOCAL (sin SSL)
const connParams = {
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  database: process.env.PG_DB_NAME,
  password: process.env.PG_PASSWORD,
  max: 50,
  // max number of clients in the pool
  connectionTimeoutMillis: 15000,
  idleTimeoutMillis: 30000,
  ssl: false
};
export { connParams };
export default {
  connParams: connParams
};
