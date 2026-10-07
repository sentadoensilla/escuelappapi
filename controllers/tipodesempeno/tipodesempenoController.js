import Db from "../../database/conex.js";
import token from "../../utils/token.js";
import queryes from "./tipodesempeno.sql.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
// DEFINICIONES E IMPORTACIONES
require('dotenv').config();
export async function ListarTipoDesempeno(req, res) {
  try {
    Db.query({
      text: queryes.listadoTipoDesempeno,
      values: []
    }).then(result => {
      res.send({
        status: 'success',
        statusCode: '200',
        message: `Se encontraron ${result.rowCount} registros`,
        rows: result.rows
      });
    });
  } catch (error) {
    console.log(error.toString());
    res.send({
      status: 'error',
      statusCode: '400',
      message: error.toString(),
      rows: []
    });
  }
}
export async function InsertarTipoDesempeno(req, res) {
  //Datos recuperados del formulario
  let {
    nombre
  } = req.body;
  try {
    //Formateo de datos
    nombre = nombre.trim().toString();

    //Validación de datos vacíos
    if (nombre === '') {
      res.send({
        status: 'error',
        statusCode: 400,
        message: 'Los campos no pueden estar vacios',
        rows: []
      });
    } else {
      Db.query({
        text: queryes.InserTipoDesempeno,
        values: [nombre]
      }).then(result => {
        res.send({
          status: 'success',
          statusCode: '200',
          message: `Se ingresaron ${result.rowCount} registros`,
          rows: result.rows
        });
      }).catch(error => {
        console.log("Algo salió mal.", error.toString());
      });
    }
  } catch (error) {
    res.send({
      status: 'error',
      statusCode: '400',
      message: error.toString(),
      rows: []
    });
  }
}
export async function ActualizarTipoDesempeno(req, res) {
  //Datos recuperados del formulario
  let {
    idregistro,
    nombre,
    estado
  } = req.body;
  try {
    //Formateo de datos
    idregistro = parseInt(token.decriptar(idregistro.toString()));
    nombre = nombre.trim().toString();
    estado = parseInt(estado.trim());

    //Validación de datos vacíos
    if (idregistro === null || nombre === '' || estado === null) {
      res.send({
        status: 'error',
        statusCode: 400,
        message: 'Los campos no pueden estar vacios',
        rows: []
      });
    } else {
      Db.query({
        text: queryes.UpdateTipoDesempeno,
        values: [idregistro, nombre, estado]
      }).then(result => {
        res.send({
          status: 'success',
          statusCode: '200',
          message: `Se actualizaron ${result.rowCount} registros`,
          rows: result.rows
        });
      }).catch(error => {
        console.log("Algo salió mal.", error.toString());
      });
    }
  } catch (error) {
    res.send({
      status: 'error',
      statusCode: '400',
      message: error.toString(),
      rows: []
    });
  }
}
export async function EliminarTipoDesempeno(req, res) {
  //Datos recuperados del formulario
  let {
    reference
  } = req.body;
  try {
    //Formateo de datos y desencriptado
    reference = parseInt(token.decriptar(reference.toString()));

    //Validación de datos vacíos
    if (reference === null || reference === '') {
      res.send({
        status: 'error',
        statusCode: 400,
        message: 'El valor de referencia es inválido',
        rows: []
      });
    } else {
      Db.query({
        text: queryes.DeleteTipoDesempeno,
        values: [reference]
      }).then(result => {
        res.send({
          status: 'success',
          statusCode: '200',
          message: `Se eliminaron ${result.rowCount} registros`,
          rows: result.rows
        });
      }).catch(error => {
        console.log("Algo salió mal.", error.toString());
      });
    }
  } catch (error) {
    res.send({
      status: 'error',
      statusCode: '400',
      message: error.toString(),
      rows: []
    });
  }
}
export async function FalsoEliminarTipoDesempeno(req, res) {
  //Datos recuperados del formulario
  let {
    reference
  } = req.body;
  try {
    //Formateo de datos
    reference = parseInt(token.decriptar(reference));

    //Validación de datos vacíos
    if (reference === null || reference === '') {
      res.send({
        status: 'error',
        statusCode: 400,
        message: 'El valor de referencia es inválido',
        rows: []
      });
    } else {
      Db.query({
        text: queryes.FalsoDeleteTipoDesempeno,
        values: [reference]
      }).then(result => {
        res.send({
          status: 'success',
          statusCode: '200',
          message: `Se actualizaron ${result.rowCount} registros`,
          rows: result.rows
        });
      }).catch(error => {
        console.log("Algo salió mal.", error.toString());
      });
    }
  } catch (error) {
    res.send({
      status: 'error',
      statusCode: '400',
      message: error.toString(),
      rows: []
    });
  }
}
export default {
  ListarTipoDesempeno: ListarTipoDesempeno,
  InsertarTipoDesempeno: InsertarTipoDesempeno,
  ActualizarTipoDesempeno: ActualizarTipoDesempeno,
  EliminarTipoDesempeno: EliminarTipoDesempeno,
  FalsoEliminarTipoDesempeno: FalsoEliminarTipoDesempeno
}; //LIBRERIA DE COMANDOS SQL A UTILIZAR
//const { error } = require('console')
//MODULOS O FUNCIONES QUE RESOLVERAN CADA SITUACION
