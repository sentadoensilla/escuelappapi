import Db from "../../database/conex.js";
import token from "../../utils/token.js";
import sql from "./anolperiodo.sql.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
/**
 * anolperiodoController.js
 * Controlador del módulo de configuración académica: años lectivos, periodos,
 * relación institución-año-periodo y valores por periodo.
 */
require('dotenv').config();
// Estado "inactivo/eliminado" usado en los borrados lógicos (tabestagene: 9=Inactivo).
const ESTADO_INACTIVO = 9;
export async function anoListar(req, res) {
  try {
    const resp = await Db.query({
      text: sql.anoListar,
      values: []
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' años encontrados',
      rows: resp.rows
    });
  } catch (error) {
    console.log('anoListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar los años lectivos',
      rows: []
    });
  }
}
export async function anoRegistrar(req, res) {
  try {
    const {
      descripcion,
      fechainicio,
      fechafin,
      idestado
    } = req.body;
    if (!descripcion) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta la descripción del año',
      rows: []
    });
    const estado = idestado ? token.decriptar(idestado) : 8;
    const resp = await Db.query({
      text: sql.anoRegistrar,
      values: [descripcion, fechainicio, fechafin, estado]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Año lectivo registrado',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('anoRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar el año',
      rows: []
    });
  }
}
export async function anoActualizar(req, res) {
  try {
    const {
      idregistro,
      descripcion,
      fechainicio,
      fechafin,
      idestado
    } = req.body;
    if (!idregistro) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el identificador',
      rows: []
    });
    const pk = token.decriptar(idregistro);
    const estado = idestado ? token.decriptar(idestado) : 8;
    await Db.query({
      text: sql.anoActualizar,
      values: [pk, descripcion, fechainicio, fechafin, estado]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Año lectivo actualizado',
      rows: {}
    });
  } catch (error) {
    console.log('anoActualizar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo actualizar el año',
      rows: []
    });
  }
}
export async function anoBorrar(req, res) {
  try {
    const {
      idregistro
    } = req.body;
    if (!idregistro) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el identificador',
      rows: []
    });
    await Db.query({
      text: sql.anoBorrar,
      values: [token.decriptar(idregistro), ESTADO_INACTIVO]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Año lectivo eliminado',
      rows: {}
    });
  } catch (error) {
    console.log('anoBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar el año',
      rows: []
    });
  }
}
export async function periodoListar(req, res) {
  try {
    const resp = await Db.query({
      text: sql.periodoListar,
      values: []
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' periodos encontrados',
      rows: resp.rows
    });
  } catch (error) {
    console.log('periodoListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar los periodos',
      rows: []
    });
  }
}
export async function periodoRegistrar(req, res) {
  try {
    const {
      descripcion,
      nombre,
      idestado
    } = req.body;
    if (!nombre) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el nombre del periodo',
      rows: []
    });
    const estado = idestado ? token.decriptar(idestado) : 8;
    const resp = await Db.query({
      text: sql.periodoRegistrar,
      values: [descripcion, nombre, estado]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Periodo registrado',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('periodoRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar el periodo',
      rows: []
    });
  }
}
export async function periodoActualizar(req, res) {
  try {
    const {
      idregistro,
      descripcion,
      nombre,
      idestado
    } = req.body;
    if (!idregistro) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el identificador',
      rows: []
    });
    const pk = token.decriptar(idregistro);
    const estado = idestado ? token.decriptar(idestado) : 8;
    await Db.query({
      text: sql.periodoActualizar,
      values: [pk, descripcion, nombre, estado]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Periodo actualizado',
      rows: {}
    });
  } catch (error) {
    console.log('periodoActualizar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo actualizar el periodo',
      rows: []
    });
  }
}
export async function periodoBorrar(req, res) {
  try {
    const {
      idregistro
    } = req.body;
    if (!idregistro) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el identificador',
      rows: []
    });
    await Db.query({
      text: sql.periodoBorrar,
      values: [token.decriptar(idregistro), ESTADO_INACTIVO]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Periodo eliminado',
      rows: {}
    });
  } catch (error) {
    console.log('periodoBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar el periodo',
      rows: []
    });
  }
}
export async function anolperiListar(req, res) {
  try {
    const {
      idinstitucion,
      idano
    } = req.body || {};
    const cinstid = idinstitucion ? parseInt(token.decriptar(idinstitucion)) : null;
    const canolid = idano ? parseInt(token.decriptar(idano)) : null;
    const resp = await Db.query({
      text: sql.anolperiListar,
      values: [cinstid, canolid]
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' periodos institucionales',
      rows: resp.rows
    });
  } catch (error) {
    console.log('anolperiListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function anolperiRegistrar(req, res) {
  try {
    const {
      idinstitucion,
      idano,
      idperiodo,
      descripcion,
      fechainicio,
      fechafin,
      valor,
      idestado
    } = req.body;
    if (!idinstitucion || !idano || !idperiodo) {
      return res.send({
        status: 'error',
        statusCode: 400,
        message: 'Falta institución, año o periodo',
        rows: []
      });
    }
    const cinstid = parseInt(token.decriptar(idinstitucion));
    const canolid = parseInt(token.decriptar(idano));
    const cperiid = parseInt(token.decriptar(idperiodo));
    const estado = idestado ? parseInt(token.decriptar(idestado)) : 8;
    const resp = await Db.query({
      text: sql.anolperiRegistrar,
      values: [cinstid, canolid, cperiid, descripcion, fechainicio, fechafin, valor, estado]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Periodo institucional registrado',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('anolperiRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export async function anolperiActualizar(req, res) {
  try {
    const {
      idregistro,
      idperiodo,
      descripcion,
      fechainicio,
      fechafin,
      valor,
      idestado
    } = req.body;
    if (!idregistro) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el identificador',
      rows: []
    });
    const pk = token.decriptar(idregistro);
    const cperiid = idperiodo ? parseInt(token.decriptar(idperiodo)) : null;
    const estado = idestado ? parseInt(token.decriptar(idestado)) : 8;
    await Db.query({
      text: sql.anolperiActualizar,
      values: [pk, cperiid, descripcion, fechainicio, fechafin, valor, estado]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Periodo institucional actualizado',
      rows: {}
    });
  } catch (error) {
    console.log('anolperiActualizar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo actualizar',
      rows: []
    });
  }
}
export async function anolperiBorrar(req, res) {
  try {
    const {
      idregistro
    } = req.body;
    if (!idregistro) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el identificador',
      rows: []
    });
    await Db.query({
      text: sql.anolperiBorrar,
      values: [token.decriptar(idregistro), ESTADO_INACTIVO]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Periodo institucional eliminado',
      rows: {}
    });
  } catch (error) {
    console.log('anolperiBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export async function perivalListar(req, res) {
  try {
    const {
      idanolperi
    } = req.body || {};
    const canolperiid = idanolperi ? parseInt(token.decriptar(idanolperi)) : null;
    const resp = await Db.query({
      text: sql.perivalListar,
      values: [canolperiid]
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' valores encontrados',
      rows: resp.rows
    });
  } catch (error) {
    console.log('perivalListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function perivalRegistrar(req, res) {
  try {
    const {
      descripcion,
      idanolperi,
      idestado
    } = req.body;
    if (!descripcion || !idanolperi) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta información',
      rows: []
    });
    const canolperiid = parseInt(token.decriptar(idanolperi));
    const estado = idestado ? parseInt(token.decriptar(idestado)) : 8;
    const resp = await Db.query({
      text: sql.perivalRegistrar,
      values: [descripcion, canolperiid, estado]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Valor registrado',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('perivalRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export async function perivalActualizar(req, res) {
  try {
    const {
      idregistro,
      descripcion,
      idanolperi,
      idestado
    } = req.body;
    if (!idregistro) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el identificador',
      rows: []
    });
    const pk = token.decriptar(idregistro);
    const canolperiid = idanolperi ? parseInt(token.decriptar(idanolperi)) : null;
    const estado = idestado ? parseInt(token.decriptar(idestado)) : 8;
    await Db.query({
      text: sql.perivalActualizar,
      values: [pk, descripcion, canolperiid, estado]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Valor actualizado',
      rows: {}
    });
  } catch (error) {
    console.log('perivalActualizar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo actualizar',
      rows: []
    });
  }
}
export async function perivalBorrar(req, res) {
  try {
    const {
      idregistro
    } = req.body;
    if (!idregistro) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el identificador',
      rows: []
    });
    await Db.query({
      text: sql.perivalBorrar,
      values: [token.decriptar(idregistro), ESTADO_INACTIVO]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Valor eliminado',
      rows: {}
    });
  } catch (error) {
    console.log('perivalBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export default {
  anoListar: anoListar,
  anoRegistrar: anoRegistrar,
  anoActualizar: anoActualizar,
  anoBorrar: anoBorrar,
  periodoListar: periodoListar,
  periodoRegistrar: periodoRegistrar,
  periodoActualizar: periodoActualizar,
  periodoBorrar: periodoBorrar,
  anolperiListar: anolperiListar,
  anolperiRegistrar: anolperiRegistrar,
  anolperiActualizar: anolperiActualizar,
  anolperiBorrar: anolperiBorrar,
  perivalListar: perivalListar,
  perivalRegistrar: perivalRegistrar,
  perivalActualizar: perivalActualizar,
  perivalBorrar: perivalBorrar
};
