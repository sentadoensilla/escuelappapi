import Db from "../database/conex.js";
import token from "../utils/token.js";
import queryes from "../sql/datosGenerales.js";
import generate from "../utils/notifications/mail/alerta.js";
import generateButton from "../utils/buttons.js";
import moment from "moment";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
require('dotenv').config();
const ahora = moment().format('YYYY-MM-DD HH:mm:ss');
let tok = "";
export async function institucionesList(req, res) {
  try {
    let {
      criterio
    } = req.body;
    criterio = criterio != "" && criterio != "undefined" ? criterio : '%@arquidiocesanos.edu.co';
    await Db.query({
      text: queryes.institucionesList,
      values: [criterio]
    }).then(async resultados => {
      //MASQUERADE ID
      resultados.rows.map((elResultado, r) => {
        resultados.rows[r].institucion_id = token.encriptar(elResultado.institucion_id);
      });
      tok = await token.createtoken(resultados.rows);
      res.send({
        status: 'success',
        statusCode: 200,
        message: resultados.rows.length + ' Instituciones encontradas ',
        token: tok
      });
    }).catch(async error => {
      tok = await token.createtoken('Los datos experimentan errores inesperados');
      res.send({
        status: 'error',
        statusCode: 400,
        message: 'Los datos experimentan errores inesperados',
        token: tok
      });
    });
  } catch (error) {
    tok = await token.createtoken('El sistema experimenta errores inesperados');
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'El sistema experimenta errores inesperados',
      token: tok
    });
  }
}
export async function tipoPublicacionesList(req, res) {
  try {
    await Db.query({
      text: queryes.tipopublicacionesList
    }).then(async resultados => {
      //MASQUERADE ID
      resultados.rows.map((elResultado, r) => {
        resultados.rows[r].aepublicacionestipo_id = token.encriptar(elResultado.aepublicacionestipo_id);
      });
      tok = await token.createtoken(resultados.rows);
      res.send({
        status: 'success',
        statusCode: 200,
        message: resultados.rows.length + ' Datos encontradoss ',
        token: tok
      });
    }).catch(async error => {
      tok = await token.createtoken('Los datos experimentan errores inesperados');
      res.send({
        status: 'error',
        statusCode: 400,
        message: 'Los datos experimentan errores inesperados',
        token: tok
      });
    });
  } catch (error) {
    tok = await token.createtoken('El sistema experimenta errores inesperados');
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'El sistema experimenta errores inesperados',
      token: tok
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
        token: resultados.rows
      });
    }).catch(async error => {
      res.send({
        status: 'error',
        statusCode: 400,
        message: 'Los datos experimentan errores inesperados',
        token: []
      });
    });
  } catch (error) {
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'El sistema experimenta errores inesperados',
      token: []
    });
  }
}
export default {
  institucionesList: institucionesList,
  tipoPublicacionesList: tipoPublicacionesList,
  motivosList: motivosList
};
