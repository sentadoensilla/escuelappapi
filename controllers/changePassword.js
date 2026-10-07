import db from "../database/pgpromise.js";
import Db from "../database/conex.js";
import token from "../utils/token.js";
import mailer from "../utils/notifications/mail/resetPassword.js";
import userWelcome from "../utils/notifications/mail/welcome.js";
import cripto from "../utils/encrypassword.js";
import moment from "moment";
import sql from "../sql/authsql.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
require('dotenv').config();
function sendReset(req, res) {
  let {
    type,
    who
  } = req.body;
  switch (type) {
    case '0':
      if (who.indexOf('@') >= 0) {
        db.task(async t => {
          return t.oneOrNone(`SELECT u.aeusu_id, u.aeusu_nick, u.aeusu_llave
                    FROM engine.aeusu u WHERE u.aeusu_nick = $1 AND u.aeusu_estado=1`, [who]).then(async existe => {
            //console.log('Existe: ', existe)
            if (existe) {
              //TIEMPOS PARA EL REGISTRO Y EL VENCIMIENTO DEL RESET
              const ahora = moment().format('YYYY-MM-DD HH:m:s');
              const ahorasystem = moment(ahora);
              const espera = moment(ahorasystem).add(process.env.TIME_WAIT_GENERAL, 'hours');
              let elArreglo = [existe.aeusu_id, existe.aeusu_llave, null, ahora, espera, null, null, 8];
              return t.one(`INSERT INTO engine.aeusuresetpass(
                                aeusures_id, aeusu_id, aeusures_llavepre, aeusures_llavenew, 
                                aeusures_fechageneracion, aeusures_fechavence, aeusures_fechalink, 
                                aeusures_dirip, aeusures_estado)
                                VALUES ( (SELECT COALESCE(MAX(aeusures_id)::integer+1, 1) FROM engine.aeusuresetpass),  
                                $1, $2, $3, $4, $5, $6, $7, $8) RETURNING * `, elArreglo).then(async laReseteada => {
                console.log('entreeeeee');
                if (laReseteada.aeusures_id != 0) {
                  //ENVIAMOS EL MENSAJE CON EL ENLACE PARA RESETEAR
                  elIddisfrazado = await cripto.pass(existe.aeusu_id);
                  const elEnlace = 'user/sendmepass/?type=1&who=' + elIddisfrazado;
                  const mail = await mailer.sendLink({
                    usuario: who,
                    id: existe.aeusu_id,
                    email: existe.aeusu_nick,
                    fecha: ahora,
                    enlace: elEnlace
                  }).then(sendeado => {
                    return mail;
                  }).catch(error => {
                    return error;
                  });
                }
              });
            }
          }).catch(error => {
            console.log('Errores', error);
          });
        }).then(events => {
          return {
            status: 'success',
            statusCode: 200,
            message: ' Debe ingresar a ' + who + 'para cambiar la clave'
          };
        }).catch(error => {
          return {
            status: 'error',
            statusCode: 400,
            message: ' Docentes registrados'
          };
        });
      } else {
        return {
          status: 'error',
          statusCode: 500,
          message: who + ' No se encuentra en nuestros registros'
        };
      }
      break;
    case '1':
      if (who != "") {
        const idRegistro = parseInt(cripto.decryp(who));
        const ahora = moment().format('YYYY-MM-DD HH:m:s');
        db.task(async t => {
          return t.oneOrNone(`
                        SELECT r.aeusures_id, r.aeusu_id, u.aeusu_nick,
                        r.aeusures_fechageneracion, r.aeusures_fechavence
                        FROM engine.aeusuresetpass r, engine.aeusu u
                        WHERE aeusures_id=$2
                        AND r.aeusures_fechavence <= $1
                        AND u.aeusu_estado=1
                        AND r.aeusures_estado=8
                        AND r.aeusu_id=u.aeusu_id`, [ahora, idRegistro]).then(async existe => {
            //console.log('Existe: ', existe)
            if (existe.aeusures_id != "") {
              //TIEMPOS PARA EL REGISTRO, CAMBIO DE ESTADO Y EL VENCIMIENTO DEL RESET
              const nuevaClave = moment().format('sHHDDMMmYY');
              const laIP = req.headers['x-forwarder-for'] || req.socket.remoteAddress || null;
              let elArreglo = [existe.aeusu_id, nuevaClave, ahora, laIP, 6];
              return t.one(`
                            UPDATE engine.aeusuresetpass
                            SET aeusures_llavenew=$2, aeusures_fechalink=$3, 
                                aeusures_dirip=$4, aeusures_estado=$5
                            WHERE aeusures_id=$1 RETURNING * `, elArreglo).then(async laReseteada => {
                if (laReseteada.aeusures_id != 0) {
                  //ENVIAMOS EL MENSAJE CON LA NUEVA CLAVE

                  const mail = await mailer.sendPass({
                    usuario: who,
                    id: existe.aeusu_id,
                    email: existe.aeusu_nick,
                    fecha: ahora,
                    clave: nuevaClave
                  }).then(sendeado => {
                    res.status(200).send({
                      status: "success",
                      StatusCode: 200,
                      message: 'Ingrese al buzon de ' + existe.aeusu_nick + ' para ver la nueva clave'
                    });
                  }).catch(error => {
                    res.status(201).send({
                      status: "fail",
                      StatusCode: 201,
                      message: 'La clave fue generada ' + nuevaClave + ', pero no fue posible enviar el correo'
                    });
                  });
                }
              });
            } else {
              res.status(201).send({
                status: "fail",
                StatusCode: 201,
                message: 'La solicitud de cambio de clave no esta disponible'
              });
            }
          }).catch(error => {
            res.status(201).send({
              status: "fail",
              StatusCode: 201,
              message: 'La solicitud de cambio de clave no esta disponible'
            });
          });
        }).then(events => {
          res.status(200).send({
            status: "success",
            StatusCode: 200,
            message: 'Ingrese al buzon de ' + existe.aeusu_nick + ' para ver la nueva clave'
          });
        }).catch(error => {
          return {
            status: 'error',
            statusCode: 400,
            message: ' Docentes registrados'
          };
        });
      } else {
        res.status(201).send({
          status: "fail",
          StatusCode: 201,
          message: 'El enlace para cambiar la clave es incorrecto'
        });
      }
      break;
    default:
      res.status(201).send({
        status: "fail",
        StatusCode: 201,
        message: ' Bad choice'
      });
      break;
  }
}
async function Sendmail(req, res) {
  try {
    let {
      id_usuario
    } = req.body;
    id_usuario = parseInt(id_usuario);
    let elMensaje = '';
    // await cripto.decryp();

    let query = {
      text: `SELECT
             u.aeusu_nick,u.aeusu_llave,u.aeusu_nombre
             FROM engine.aeusu u
             WHERE u.aeusu_id = $1`,
      values: [id_usuario]
    };
    let resp = await Db.query(query);
    if (resp.rows.length > 0) {
      let men = await userWelcome.send(resp.rows[0].aeusu_nombre, resp.rows[0].aeusu_nick, resp.rows[0].aeusu_llave);
      elMensaje = ' El recordatorio de clave fue enviado al correo ' + resp.rows[0].aeusu_nick;
    } else {
      elMensaje = ' El recordatorio No fue enviado, por favor intente nuevamente ';
    }
    let tok = await token.createtoken(elMensaje);
    res.status(200).send({
      status: 'success',
      statusCode: 200,
      message: elMensaje,
      token: tok
    });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
}
export { sendReset };
export { Sendmail };
export default {
  sendReset: sendReset,
  Sendmail: Sendmail
};
