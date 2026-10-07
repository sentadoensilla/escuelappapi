import Db from "../../database/conex.js";
import token from "../../utils/token.js";
import sql from "./observador.sql.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
/**
 * observadorController.js
 * Controlador del módulo de observador del estudiante (esquema observador).
 */
require('dotenv').config();
const ESTADO_INACTIVO = 9;
export async function planListar(req, res) {
  try {
    const {
      idinstitucion
    } = req.body || {};
    const cinstid = idinstitucion ? parseInt(token.decriptar(idinstitucion)) : null;
    const resp = await Db.query({
      text: sql.planListar,
      values: [cinstid]
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' plantillas',
      rows: resp.rows
    });
  } catch (error) {
    console.log('planListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function planRegistrar(req, res) {
  try {
    const b = req.body;
    if (!b.idinstitucion) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta la institución',
      rows: []
    });
    const resp = await Db.query({
      text: sql.planRegistrar,
      values: [parseInt(token.decriptar(b.idinstitucion)), b.titulo, b.parrafo1, b.parrafo2, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Plantilla registrada',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('planRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export async function planActualizar(req, res) {
  try {
    const b = req.body;
    if (!b.idregistro) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el identificador',
      rows: []
    });
    await Db.query({
      text: sql.planActualizar,
      values: [token.decriptar(b.idregistro), b.titulo, b.parrafo1, b.parrafo2, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Plantilla actualizada',
      rows: {}
    });
  } catch (error) {
    console.log('planActualizar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo actualizar',
      rows: []
    });
  }
}
export async function responsabilidadListar(req, res) {
  try {
    const {
      idinstitucion
    } = req.body || {};
    const cinstid = idinstitucion ? parseInt(token.decriptar(idinstitucion)) : null;
    const resp = await Db.query({
      text: sql.responsabilidadListar,
      values: [cinstid]
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' grupos',
      rows: resp.rows
    });
  } catch (error) {
    console.log('responsabilidadListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function responsabilidadRegistrar(req, res) {
  try {
    const b = req.body;
    if (!b.idinstitucion || !b.nombre) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta información',
      rows: []
    });
    const resp = await Db.query({
      text: sql.responsabilidadRegistrar,
      values: [parseInt(token.decriptar(b.idinstitucion)), b.nombre, b.descripcion, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Grupo registrado',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('responsabilidadRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export async function responsabilidadActualizar(req, res) {
  try {
    const b = req.body;
    if (!b.idregistro) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el identificador',
      rows: []
    });
    await Db.query({
      text: sql.responsabilidadActualizar,
      values: [token.decriptar(b.idregistro), b.nombre, b.descripcion, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Grupo actualizado',
      rows: {}
    });
  } catch (error) {
    console.log('responsabilidadActualizar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo actualizar',
      rows: []
    });
  }
}
export async function responsabilidadBorrar(req, res) {
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
      text: sql.responsabilidadBorrar,
      values: [token.decriptar(idregistro), ESTADO_INACTIVO]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Grupo eliminado',
      rows: {}
    });
  } catch (error) {
    console.log('responsabilidadBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export async function subresponsabilidadListar(req, res) {
  try {
    const {
      idresponsabilidad
    } = req.body || {};
    const crespid = idresponsabilidad ? parseInt(token.decriptar(idresponsabilidad)) : null;
    const resp = await Db.query({
      text: sql.subresponsabilidadListar,
      values: [crespid]
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' responsabilidades',
      rows: resp.rows
    });
  } catch (error) {
    console.log('subresponsabilidadListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function subresponsabilidadRegistrar(req, res) {
  try {
    const b = req.body;
    if (!b.idresponsabilidad || !b.nombre) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta información',
      rows: []
    });
    const resp = await Db.query({
      text: sql.subresponsabilidadRegistrar,
      values: [parseInt(token.decriptar(b.idresponsabilidad)), b.nombre, b.descripcion, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Responsabilidad registrada',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('subresponsabilidadRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export async function subresponsabilidadBorrar(req, res) {
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
      text: sql.subresponsabilidadBorrar,
      values: [token.decriptar(idregistro), ESTADO_INACTIVO]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Responsabilidad eliminada',
      rows: {}
    });
  } catch (error) {
    console.log('subresponsabilidadBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export async function observacionListar(req, res) {
  try {
    const {
      idmatricula
    } = req.body || {};
    const cmatrid = idmatricula ? parseInt(token.decriptar(idmatricula)) : null;
    const resp = await Db.query({
      text: sql.observacionListar,
      values: [cmatrid]
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' observaciones',
      rows: resp.rows
    });
  } catch (error) {
    console.log('observacionListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function observacionRegistrar(req, res) {
  try {
    const b = req.body;
    if (!b.idresponsabilidad || !b.idmatricula || !b.descripcion) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta información',
      rows: []
    });
    const resp = await Db.query({
      text: sql.observacionRegistrar,
      values: [parseInt(token.decriptar(b.idresponsabilidad)), b.idperiodo ? parseInt(token.decriptar(b.idperiodo)) : null, parseInt(token.decriptar(b.idmatricula)), b.descripcion, b.fecha, b.historial, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Observación registrada',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('observacionRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export async function observacionBorrar(req, res) {
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
      text: sql.observacionBorrar,
      values: [token.decriptar(idregistro), ESTADO_INACTIVO]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Observación eliminada',
      rows: {}
    });
  } catch (error) {
    console.log('observacionBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export async function evaluacionListar(req, res) {
  try {
    const {
      idmatricula
    } = req.body || {};
    const cmatrid = idmatricula ? parseInt(token.decriptar(idmatricula)) : null;
    const resp = await Db.query({
      text: sql.evaluacionListar,
      values: [cmatrid]
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' evaluaciones',
      rows: resp.rows
    });
  } catch (error) {
    console.log('evaluacionListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function evaluacionRegistrar(req, res) {
  try {
    const b = req.body;
    if (!b.idmatricula || !b.idresponsabilidad || !b.idcriterio) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta información',
      rows: []
    });
    const resp = await Db.query({
      text: sql.evaluacionRegistrar,
      values: [b.idperiodo ? parseInt(token.decriptar(b.idperiodo)) : null, parseInt(token.decriptar(b.idmatricula)), parseInt(token.decriptar(b.idresponsabilidad)), parseInt(token.decriptar(b.idcriterio)), b.fecha, b.historial, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Evaluación registrada',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('evaluacionRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export default {
  planListar: planListar,
  planRegistrar: planRegistrar,
  planActualizar: planActualizar,
  responsabilidadListar: responsabilidadListar,
  responsabilidadRegistrar: responsabilidadRegistrar,
  responsabilidadActualizar: responsabilidadActualizar,
  responsabilidadBorrar: responsabilidadBorrar,
  subresponsabilidadListar: subresponsabilidadListar,
  subresponsabilidadRegistrar: subresponsabilidadRegistrar,
  subresponsabilidadBorrar: subresponsabilidadBorrar,
  observacionListar: observacionListar,
  observacionRegistrar: observacionRegistrar,
  observacionBorrar: observacionBorrar,
  evaluacionListar: evaluacionListar,
  evaluacionRegistrar: evaluacionRegistrar
};
