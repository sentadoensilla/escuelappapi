import Db from "../database/conex.js";
import token from "../utils/token.js";
import * as __mod0 from "../utils/passworGenearte.js";
import alerta from "../utils/notifications/mail/alerta.js";
import moment from "moment";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const {
  generate
} = __mod0;
require('dotenv').config();
const ahora = moment().format('YYYY-MM-DD HH:m:s');
export async function updateToken(req, res) {
  try {
    let {
      elToken,
      idUsuario
    } = req.body;
    if (elToken != "" && idUsuario != "") {
      let consulalerts = `UPDATE engine.aeusu SET aeusu_token=$2 WHERE aeusu_id=$1`;
      let query = {
        text: consulalerts,
        values: [idUsuario, elToken]
      };
      let resp = await Db.query(query);
      let tok = await token.createtoken(resp.rows);
      res.status(200).send({
        status: 'success',
        statusCode: 200,
        message: 'Token actualizado',
        token: tok
      });
    } else {
      res.status(400).send({
        status: 'error',
        statusCode: 400,
        message: 'Argumentos incompletos'
      });
    }
  } catch (error) {
    res.status(400).send(error);
  }
}
export default {
  updateToken: updateToken
};
