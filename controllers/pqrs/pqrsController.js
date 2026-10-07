import Db from "../../database/conex.js";
import token from "../../utils/token.js";
import sql from "./pqrs.sql.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
/**
 * pqrsController.js
 * Controlador del módulo PQRS de Escuelapp (data.aepqr, data.aepqr_respuesta,
 * data.aepqr_tiposolicitud).
 */
require('dotenv').config();
const ESTADO_INACTIVO = 9;
export async function tiposolicitudListar(req, res) {
  try {
    const resp = await Db.query({
      text: sql.tiposolicitudListar,
      values: []
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' tipos de solicitud',
      rows: resp.rows
    });
  } catch (error) {
    console.log('tiposolicitudListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function tiposolicitudRegistrar(req, res) {
  try {
    const b = req.body;
    if (!b.descripcion) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta la descripción',
      rows: []
    });
    const resp = await Db.query({
      text: sql.tiposolicitudRegistrar,
      values: [b.descripcion, b.vencimiento ?? null]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Tipo de solicitud registrado',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('tiposolicitudRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export async function tiposolicitudActualizar(req, res) {
  try {
    const b = req.body;
    if (!b.idregistro) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el identificador',
      rows: []
    });
    await Db.query({
      text: sql.tiposolicitudActualizar,
      values: [token.decriptar(b.idregistro), b.descripcion, b.vencimiento ?? null]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Tipo de solicitud actualizado',
      rows: {}
    });
  } catch (error) {
    console.log('tiposolicitudActualizar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo actualizar',
      rows: []
    });
  }
}
export async function tiposolicitudBorrar(req, res) {
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
      text: sql.tiposolicitudBorrar,
      values: [token.decriptar(idregistro)]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Tipo de solicitud eliminado',
      rows: {}
    });
  } catch (error) {
    console.log('tiposolicitudBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export async function pqrListar(req, res) {
  try {
    const {
      idinstitucion
    } = req.body || {};
    const aeinstid = idinstitucion ? parseInt(token.decriptar(idinstitucion)) : null;
    const resp = await Db.query({
      text: sql.pqrListar,
      values: [aeinstid]
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' PQRS',
      rows: resp.rows
    });
  } catch (error) {
    console.log('pqrListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function pqrRegistrar(req, res) {
  try {
    const b = req.body;
    if (!b.nombre || !b.contenido) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta nombre o contenido',
      rows: []
    });
    const resp = await Db.query({
      text: sql.pqrRegistrar,
      values: [b.nombre, b.telefono || null, b.email || null, b.idusuario ? parseInt(token.decriptar(b.idusuario)) : null, b.idtiposolicitud ? parseInt(token.decriptar(b.idtiposolicitud)) : null, b.contenido, b.idinstitucion ? parseInt(token.decriptar(b.idinstitucion)) : null, b.adjunto || null, b.idano ? parseInt(token.decriptar(b.idano)) : null, b.idestado ? parseInt(token.decriptar(b.idestado)) : 1]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'PQRS registrada',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('pqrRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export async function pqrActualizar(req, res) {
  try {
    const b = req.body;
    if (!b.idregistro) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el identificador',
      rows: []
    });
    await Db.query({
      text: sql.pqrActualizar,
      values: [token.decriptar(b.idregistro), b.nombre, b.telefono || null, b.email || null, b.idtiposolicitud ? parseInt(token.decriptar(b.idtiposolicitud)) : null, b.contenido, b.adjunto || null, b.idestado ? parseInt(token.decriptar(b.idestado)) : 1]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'PQRS actualizada',
      rows: {}
    });
  } catch (error) {
    console.log('pqrActualizar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo actualizar',
      rows: []
    });
  }
}
export async function pqrBorrar(req, res) {
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
      text: sql.pqrBorrar,
      values: [token.decriptar(idregistro), ESTADO_INACTIVO]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'PQRS eliminada',
      rows: {}
    });
  } catch (error) {
    console.log('pqrBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export async function respuestaListar(req, res) {
  try {
    const {
      idpqr
    } = req.body || {};
    const aepqr_id = idpqr ? parseInt(token.decriptar(idpqr)) : null;
    const resp = await Db.query({
      text: sql.respuestaListar,
      values: [aepqr_id]
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' respuestas',
      rows: resp.rows
    });
  } catch (error) {
    console.log('respuestaListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function respuestaRegistrar(req, res) {
  try {
    const b = req.body;
    if (!b.idpqr || !b.mensaje) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta PQRS o mensaje',
      rows: []
    });
    const resp = await Db.query({
      text: sql.respuestaRegistrar,
      values: [parseInt(token.decriptar(b.idpqr)), b.mensaje, b.adjunto || null]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Respuesta registrada',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('respuestaRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export async function respuestaActualizar(req, res) {
  try {
    const b = req.body;
    if (!b.idregistro) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el identificador',
      rows: []
    });
    await Db.query({
      text: sql.respuestaActualizar,
      values: [token.decriptar(b.idregistro), b.mensaje, b.adjunto || null]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Respuesta actualizada',
      rows: {}
    });
  } catch (error) {
    console.log('respuestaActualizar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo actualizar',
      rows: []
    });
  }
}
export async function respuestaBorrar(req, res) {
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
      text: sql.respuestaBorrar,
      values: [token.decriptar(idregistro)]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Respuesta eliminada',
      rows: {}
    });
  } catch (error) {
    console.log('respuestaBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export default {
  tiposolicitudListar: tiposolicitudListar,
  tiposolicitudRegistrar: tiposolicitudRegistrar,
  tiposolicitudActualizar: tiposolicitudActualizar,
  tiposolicitudBorrar: tiposolicitudBorrar,
  pqrListar: pqrListar,
  pqrRegistrar: pqrRegistrar,
  pqrActualizar: pqrActualizar,
  pqrBorrar: pqrBorrar,
  respuestaListar: respuestaListar,
  respuestaRegistrar: respuestaRegistrar,
  respuestaActualizar: respuestaActualizar,
  respuestaBorrar: respuestaBorrar
};
