import Db from "../../database/conex.js";
import token from "../../utils/token.js";
import sql from "./templates.sql.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
/**
 * templatesController.js
 * Controlador del módulo de plantillas de mensajería (esquema contact).
 */
require('dotenv').config();
const ESTADO_INACTIVO = 9;
export async function tipoListar(req, res) {
  try {
    const resp = await Db.query({
      text: sql.tipoListar,
      values: []
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' tipos de plantilla',
      rows: resp.rows
    });
  } catch (error) {
    console.log('tipoListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function tipoRegistrar(req, res) {
  try {
    const b = req.body;
    if (!b.nombre) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el nombre',
      rows: []
    });
    const resp = await Db.query({
      text: sql.tipoRegistrar,
      values: [b.nombre, b.idestado ? parseInt(token.decriptar(b.idestado)) : 1]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Tipo registrado',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('tipoRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export async function tipoActualizar(req, res) {
  try {
    const b = req.body;
    if (!b.idregistro) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el identificador',
      rows: []
    });
    await Db.query({
      text: sql.tipoActualizar,
      values: [token.decriptar(b.idregistro), b.nombre, b.idestado ? parseInt(token.decriptar(b.idestado)) : 1]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Tipo actualizado',
      rows: {}
    });
  } catch (error) {
    console.log('tipoActualizar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo actualizar',
      rows: []
    });
  }
}
export async function tipoBorrar(req, res) {
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
      text: sql.tipoBorrar,
      values: [token.decriptar(idregistro), ESTADO_INACTIVO]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Tipo eliminado',
      rows: {}
    });
  } catch (error) {
    console.log('tipoBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export async function varListar(req, res) {
  try {
    const resp = await Db.query({
      text: sql.varListar,
      values: []
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' variables',
      rows: resp.rows
    });
  } catch (error) {
    console.log('varListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function varRegistrar(req, res) {
  try {
    const b = req.body;
    if (!b.nombre) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el nombre',
      rows: []
    });
    const resp = await Db.query({
      text: sql.varRegistrar,
      values: [b.nombre, b.comentario || null, b.idestado ? parseInt(token.decriptar(b.idestado)) : 1]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Variable registrada',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('varRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export async function varActualizar(req, res) {
  try {
    const b = req.body;
    if (!b.idregistro) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el identificador',
      rows: []
    });
    await Db.query({
      text: sql.varActualizar,
      values: [token.decriptar(b.idregistro), b.nombre, b.comentario || null, b.idestado ? parseInt(token.decriptar(b.idestado)) : 1]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Variable actualizada',
      rows: {}
    });
  } catch (error) {
    console.log('varActualizar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo actualizar',
      rows: []
    });
  }
}
export async function varBorrar(req, res) {
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
      text: sql.varBorrar,
      values: [token.decriptar(idregistro), ESTADO_INACTIVO]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Variable eliminada',
      rows: {}
    });
  } catch (error) {
    console.log('varBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export async function plantillaListar(req, res) {
  try {
    const {
      idtipo
    } = req.body || {};
    const type = idtipo ? parseInt(token.decriptar(idtipo)) : null;
    const resp = await Db.query({
      text: sql.plantillaListar,
      values: [type]
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
    console.log('plantillaListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function plantillaRegistrar(req, res) {
  try {
    const b = req.body;
    if (!b.texto) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el texto',
      rows: []
    });
    const resp = await Db.query({
      text: sql.plantillaRegistrar,
      values: [b.idtipo ? parseInt(token.decriptar(b.idtipo)) : null, b.texto, b.guia || null, b.idestado ? parseInt(token.decriptar(b.idestado)) : 1]
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
    console.log('plantillaRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export async function plantillaActualizar(req, res) {
  try {
    const b = req.body;
    if (!b.idregistro) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el identificador',
      rows: []
    });
    await Db.query({
      text: sql.plantillaActualizar,
      values: [token.decriptar(b.idregistro), b.idtipo ? parseInt(token.decriptar(b.idtipo)) : null, b.texto, b.guia || null, b.idestado ? parseInt(token.decriptar(b.idestado)) : 1]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Plantilla actualizada',
      rows: {}
    });
  } catch (error) {
    console.log('plantillaActualizar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo actualizar',
      rows: []
    });
  }
}
export async function plantillaBorrar(req, res) {
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
      text: sql.plantillaBorrar,
      values: [token.decriptar(idregistro), ESTADO_INACTIVO]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Plantilla eliminada',
      rows: {}
    });
  } catch (error) {
    console.log('plantillaBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export async function plantillasedeListar(req, res) {
  try {
    const {
      idinstitucion
    } = req.body || {};
    const aeinstid = idinstitucion ? parseInt(token.decriptar(idinstitucion)) : null;
    const resp = await Db.query({
      text: sql.plantillasedeListar,
      values: [aeinstid]
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' plantillas por sede',
      rows: resp.rows
    });
  } catch (error) {
    console.log('plantillasedeListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function plantillasedeRegistrar(req, res) {
  try {
    const b = req.body;
    if (!b.idtipo || !b.idinstitucion) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta tipo o institución',
      rows: []
    });
    const resp = await Db.query({
      text: sql.plantillasedeRegistrar,
      values: [parseInt(token.decriptar(b.idtipo)), b.idestado ? parseInt(token.decriptar(b.idestado)) : 1, parseInt(token.decriptar(b.idinstitucion)), b.guia || null, b.texto || null]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Plantilla por sede registrada',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('plantillasedeRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export async function plantillasedeActualizar(req, res) {
  try {
    const b = req.body;
    if (!b.idregistro) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el identificador',
      rows: []
    });
    await Db.query({
      text: sql.plantillasedeActualizar,
      values: [token.decriptar(b.idregistro), b.idtipo ? parseInt(token.decriptar(b.idtipo)) : null, b.idestado ? parseInt(token.decriptar(b.idestado)) : 1, b.idinstitucion ? parseInt(token.decriptar(b.idinstitucion)) : null, b.guia || null, b.texto || null]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Plantilla por sede actualizada',
      rows: {}
    });
  } catch (error) {
    console.log('plantillasedeActualizar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo actualizar',
      rows: []
    });
  }
}
export async function plantillasedeBorrar(req, res) {
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
      text: sql.plantillasedeBorrar,
      values: [token.decriptar(idregistro), ESTADO_INACTIVO]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Plantilla por sede eliminada',
      rows: {}
    });
  } catch (error) {
    console.log('plantillasedeBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export default {
  tipoListar: tipoListar,
  tipoRegistrar: tipoRegistrar,
  tipoActualizar: tipoActualizar,
  tipoBorrar: tipoBorrar,
  varListar: varListar,
  varRegistrar: varRegistrar,
  varActualizar: varActualizar,
  varBorrar: varBorrar,
  plantillaListar: plantillaListar,
  plantillaRegistrar: plantillaRegistrar,
  plantillaActualizar: plantillaActualizar,
  plantillaBorrar: plantillaBorrar,
  plantillasedeListar: plantillasedeListar,
  plantillasedeRegistrar: plantillasedeRegistrar,
  plantillasedeActualizar: plantillasedeActualizar,
  plantillasedeBorrar: plantillasedeBorrar
};
