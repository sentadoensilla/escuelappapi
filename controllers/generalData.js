import Db from "../database/conex.js";
import token from "../utils/token.js";
import queryes from "../sql/datosGenerales.js";
import alerta from "../utils/notifications/mail/alerta.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
require("dotenv").config();
export async function listEstados(req, res) {
  console.log('estados: ', req.user);
  try {
    let tok = "",
      listaFinal = [];
    await Db.query({
      text: queryes.listEstados
    }).then(resultado => {
      if (resultado.rows.length > 0) {
        resultado.rows.map(resultadoDetalle => {
          listaFinal.push({
            id: token.encriptar(resultadoDetalle.idestado.toString()),
            descripcion: resultadoDetalle.descripcion
          });
        });
      }
      res.send({
        status: "success",
        statusCode: 200,
        message: listaFinal,
        token: tok
      });
    }).catch(error => {
      res.send({
        status: "success",
        statusCode: 200,
        message: error.toString(),
        token: tok
      });
    });
  } catch (error) {
    res.send({
      status: "success",
      statusCode: 200,
      message: error.toString(),
      token: tok
    });
  }
}
export async function validMails(req, res, next) {
  try {
    let {
      email
    } = req.body;
    let frase = token.randomString(6);
    //console.log('Este es el email: ', token.validEmail(email))
    if (token.validEmail(email) != null) {
      totalMessages = await alerta.send({
        name: 'Cliente escuelapp.co',
        email: email,
        message: {
          titulo: 'Escuelapp, verificando tu email ',
          message: `
            <div style="padding:5%;width:100%;text-align:center;">
                <h4 style="color:#DA4453;text-align:center;">
                Frase de verificación para<br> ${email}
                </h4>
                <div style="padding:5%;width:100%;font-size:36pt;font-family:Roboto,georgia,serif;text-align:center;"> 
                ${frase}
                </div>
                <p style="padding:5pt;width:100%;color:#2C7695;font-size:15pt;text-align:center;">
                La anterior frase de verificacion debes escribir la en el formulario de creación, justo debajo de ${email} 
                </p>
            </div>`,
          extra: `<br>`
        }
      });
      res.send({
        status: 'success',
        statusCode: 200,
        message: ' Frase enviada al correo ' + email,
        token: token.encriptarHash(frase)
      });
    } else {
      res.status(200).send({
        status: 'success',
        statusCode: 200,
        message: ' El email es invalido ',
        token: ''
      });
    }
  } catch (error) {
    console.log(error.toString());
    res.status(400).send(error.toString());
  }
}
export async function group(req, res) {
  try {
    let {
      id_institucion,
      ano_lectivo,
      rol
    } = req.body;
    id_institucion = parseInt(token.decriptar(id_institucion));
    ano_lectivo = parseInt(token.decriptar(ano_lectivo));
    rol = parseInt(token.decriptar(rol));
    let resp = await Db.query({
      text: queryes.listGroups,
      values: [id_institucion, ano_lectivo]
    });
    let resul = [],
      codes = [];
    resp.rows.map(item => {
      codes.push(item.aeestudiantes_grupo);
      resul.push({
        code: item.aeestudiantes_grupo,
        grupo: item.aeestudiantes_grupo
      });
    });
    //ADD 'Todos' TO RESPONSE GROUP LIST WHEN ROL IS DIRECTOR OR ADMIN SCHOOL
    if (rol == 1) {
      if (resp.rows.length > 0) {
        resul.unshift({
          code: codes.join(','),
          grupo: 'Todos'
        });
      }
    }
    res.send({
      status: "success",
      statusCode: 200,
      message: resp.rows.length + ' Registros encontrados',
      rows: resul
    });
  } catch (error) {
    console.log('List groups', error);
    res.send({
      status: "error",
      statusCode: 400,
      message: 'El sistema experimenta un error inesperado',
      rows: []
    });
  }
}
export async function motivosList(req, res) {
  try {
    await Db.query({
      text: queryes.listMotivos
    }).then(async resultados => {
      //MASQUERADE ID
      resultados.rows.map((elResultado, r) => {
        resultados.rows[r].idregistro = token.encriptar(elResultado.idregistro);
      });
      res.send({
        status: 'success',
        statusCode: 200,
        message: resultados.rows.length + ' Datos encontradoss ',
        rows: resultados.rows
      });
    }).catch(async error => {
      res.send({
        status: 'error',
        statusCode: 400,
        message: 'Los datos experimentan errores inesperados',
        rows: []
      });
    });
  } catch (error) {
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'El sistema experimenta errores inesperados',
      rows: []
    });
  }
}
export default {
  listEstados: listEstados,
  validMails: validMails,
  group: group,
  motivosList: motivosList
};
