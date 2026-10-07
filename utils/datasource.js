import * as __mod0 from "pg";
import fs from "fs";
import __req1 from "./datasourceConst.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
require('dotenv').config();
const {
  Pool
} = __mod0;
const connParams = __req1.connParams;
const client = new Pool(connParams);
client.connect().then(() => console.log(' postgres -> ' + client.options.host + ':' + client.options.database + ' user ' + client.options.user)).catch(err => console.log('error de conexion a la DB: ', err.stack));
const Db = client;
export default Db;
