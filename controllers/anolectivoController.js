import Db from "../database/conex.js";
import token from "../utils/token.js";
import queryes from "../sql/anolectivo.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
// DEFINICIONES E IMPORTACIONES
require('dotenv').config();
export async function listarAno(req, res) {
  try {
    // DEFINICIONES
    let {
      ano_lectivo,
      id_institucion,
      id_academico,
      id_usuario
    } = req.body; // AQUI VA LO QUE ENVIA EL FORMULARIO (VARIABLES)

    ano_lectivo = parseInt(token.decriptar(ano_lectivo));
    id_institucion = parseInt(token.decriptar(id_institucion));
    id_academico = parseInt(token.decriptar(id_academico));
    id_usuario = parseInt(token.decriptar(id_usuario));

    // PROCESOS
    await Db.query({
      text: queryes.listadoAnolectivo,
      values: []
    }).then(result => {
      // USAMOS UN CICLO MAP PARA RECORRER Y ENCRIPTAR EL ID
      result.rows.map((item, i) => {
        result.rows[i].id = token.encriptar(item.id);
      });
      console.log('result: ', result.rows);
      res.send({
        status: "success",
        statusCode: 200,
        message: `Se encontraron ${result.rows.length} resultados`,
        rows: result.rows
      });
    }).catch(error => {
      console.log('El error es tal: ', error);
      res.send({
        status: "error",
        statusCode: 400,
        message: "Los datos no funcionan bien, intente de nuevo mas tarde",
        rows: []
      });
    });

    //RESPUESTAS
  } catch (error) {
    console.log('Error de servidor: ', error);
    res.send({
      status: "error",
      statusCode: 400,
      message: "El servidor tiene dolor de cabeza, intente de nuevo mas tarde",
      rows: []
    });
  }
}
export async function borrarAno(req, res) {}
export async function registrarRoll(req, res) {
  //Datos recuperados del formulario
  let {
    nombre,
    descripcion,
    enlace,
    indice
  } = req.body;
  try {
    nombre = nombre.trim().toString();
    descripcion = descripcion.trim().toString();
    enlace = enlace.trim().toString();
    indice = parseInt(indice.trim());
    if (nombre === '' || descripcion === '') {
      res.send({
        status: 'error',
        statusCode: 400,
        message: 'Los campos no pueden estar vacios',
        rows: []
      });
    } else {
      Db.query({
        text: queryes.insertRoll,
        values: [nombre, descripcion, enlace, indice]
      }).then(result => {
        res.send({
          status: 'success',
          statusCode: 200,
          message: `Se ingresaron ${result.rowCount} registros`,
          rows: result.rows
        });
      }).catch(errordb => {
        console.log('Error de base de datos ', errordb.toString());
        res.send({
          status: 'error',
          statusCode: 400,
          message: 'No fue posible realizar el registro',
          rows: []
        });
      });
    }
  } catch (error) {
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'El sistema no esta disponible',
      rows: []
    });
  }
}
export async function editarAno(req, res) {}
export async function listarRoll(req, res) {
  try {
    Db.query({
      text: queryes.listadoRoll,
      values: ['a%']
    }).then(result => {
      console.log('result: ', result.rows);
      result.rows.map((item, i) => {
        result.rows[i].crollid = token.encriptar(item.crollid);
      });
      res.send({
        status: 'success',
        statusCode: 200,
        message: `Se encontraron ${result.rowCount} registros `,
        rows: result.rows
      });
    }).catch(error => {
      res.send({
        status: 'error',
        statusCode: 400,
        message: error.toString(),
        rows: []
      });
    });
  } catch (error) {
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'El sistema experimenta dificultades, intente de nuevo mas tarde',
      rows: []
    });
  }
}
export default {
  listarAno: listarAno,
  borrarAno: borrarAno,
  registrarRoll: registrarRoll,
  editarAno: editarAno,
  listarRoll: listarRoll
}; //LIBRERIA DE COMANDOS SQL A UTILIZAR
//MODULOS O FUNCIONES QUE RESOLVERAN CADA SITUACION
