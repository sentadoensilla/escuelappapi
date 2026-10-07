import Db from "../database/conex.js";
import token from "../utils/token.js";
import queryes from "../sql/whatsapp.js";
import global from "../utils/notifications/socket.io/mySockets.js";
import wp from "../utils/notifications/whatsapp/wpRomote.js";
import path from "path";
import moment from "moment";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
require('dotenv').config();
const ahora = moment().format('YYYY-MM-DD HH:mm:ss');
export async function deleteWhatsapp(req, res) {
  try {
    let {
      empresa,
      anolectivo,
      mynumber,
      socketId
    } = req.body;
    console.log('req.body: ', req.body);
    const phoneNumber = mynumber.toString().replace(/[- )(]/g, "");
    let eliminado = ' registro eliminado ',
      tok = null;
    if (phoneNumber.length >= 10) {
      wp.emisorDelete({
        sessionId: phoneNumber
      });
      Db.query({
        text: queryes.getWPInfo,
        values: [phoneNumber]
      }).then(async target => {
        if (target.rowCount > 0) {
          eliminado = 'el registro no se elimino correctamente';
        }
      }).catch(async error => {
        tok = await token.createtoken(`El numero ${phoneNumber} no fue eliminado`);
        res.send({
          status: "error",
          statusCode: 400,
          message: tok
        });
      });
      global.io.to(socketId).emit("nambadeleted", {
        sessionId: phoneNumber,
        message: eliminado
      });
      tok = await token.createtoken(eliminado);
      res.send({
        status: "success",
        statusCode: 200,
        message: eliminado,
        token: tok
      });
    } else {
      tok = await token.createtoken(`El numero ${phoneNumber} no parece un numero correcto`);
      res.send({
        status: "error",
        statusCode: 400,
        message: `El numero ${phoneNumber} no parece un numero correcto`,
        token: tok
      });
    }
  } catch (error) {
    tok = await token.createtoken(`El numero ese no sabe, no responde`);
    console.log('error: ', error);
    res.send({
      status: "error",
      statusCode: 400,
      message: `El numero ese no sabe, no responde`,
      token: tok
    });
  }
}
export default {
  deleteWhatsapp: deleteWhatsapp
};
