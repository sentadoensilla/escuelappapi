import Db from "../database/conex.js";
import token from "../utils/token.js";
import * as __mod0 from "../utils/passworGenearte.js";
import alerta from "../utils/notifications/mail/alerta.js";
import moment from "moment";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
require('dotenv').config();
const {
  generate
} = __mod0;
const ahora = moment().format('YYYY-MM-DD HH:m:s');
export async function showAviso(req, res) {}
export default {
  showAviso: showAviso
};
