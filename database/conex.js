import * as __mod0 from "pg";
import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
require('dotenv').config();
const {
  Pool
} = __mod0;
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
 * NOTA: PG_HOST=localhost llega a la base por el TÚNEL SSH a sae12.com
 * (ver D:\VENUS\tunel). El servidor PostgreSQL solo escucha en su loopback.
 * =====================================================================
 */

// CONEXIÓN ACTIVA: DESARROLLO LOCAL (sin SSL, a través del túnel SSH)
const config = {
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  database: process.env.PG_DB_NAME,
  password: process.env.PG_PASSWORD,
  ssl: false,
  // El túnel puede cortarse y volver: el pool repone las conexiones caídas
  // en vez de tumbar el proceso (antes era un Client único y un ECONNRESET
  // mataba la API).
  max: parseInt(process.env.PG_POOL_MAX || '10', 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000
};
console.log('DB Client config: ', config);

const Db = new Pool(config);

// Sin este manejador, cualquier error de una conexión inactiva (por ejemplo,
// el túnel SSH reiniciándose) dispara un "Unhandled 'error' event" y tumba el
// proceso. Con esto solo se registra el aviso.
Db.on('error', (err) => {
  console.log('Aviso: error en una conexion inactiva del pool (se repone sola):', err.message);
});

Db.query('SELECT current_database() AS db, current_user AS usuario')
  .then((r) => console.log('Conectado a postgres -> ' + config.host + ':' + r.rows[0].db + ' user ' + r.rows[0].usuario))
  .catch((err) => console.log('error de conexion a la DB', err.stack));

export default Db;
