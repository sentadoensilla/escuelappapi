import Db from "../../database/conex.js";
import token from "../../utils/token.js";
import sql from "./notas.sql.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
/**
 * notasController.js
 * Controlador del módulo de calificaciones SAE.
 */
require('dotenv').config();
export async function notaListar(req, res) {
  try {
    const {
      idmatricula,
      idasigcurs
    } = req.body || {};
    const cmatrid = idmatricula ? parseInt(token.decriptar(idmatricula)) : null;
    const asigcursid = idasigcurs ? parseInt(token.decriptar(idasigcurs)) : null;
    const resp = await Db.query({
      text: sql.notaListar,
      values: [cmatrid, asigcursid]
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' notas',
      rows: resp.rows
    });
  } catch (error) {
    console.log('notaListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function notaRegistrar(req, res) {
  try {
    const b = req.body;
    if (!b.idasigcurs || !b.idcompetencia || !b.idmatricula || b.valor === undefined) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta información de la nota',
      rows: []
    });
    const resp = await Db.query({
      text: sql.notaRegistrar,
      values: [parseInt(token.decriptar(b.idasigcurs)), parseInt(token.decriptar(b.idcompetencia)), b.idperiodo ? parseInt(token.decriptar(b.idperiodo)) : null, parseInt(token.decriptar(b.idmatricula)), b.valor, b.fecha, b.observacion, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Nota registrada',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('notaRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export async function notaActualizar(req, res) {
  try {
    const b = req.body;
    if (!b.idregistro) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el identificador',
      rows: []
    });
    await Db.query({
      text: sql.notaActualizar,
      values: [token.decriptar(b.idregistro), b.idcompetencia ? parseInt(token.decriptar(b.idcompetencia)) : null, b.valor, b.fecha, b.observacion, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Nota actualizada',
      rows: {}
    });
  } catch (error) {
    console.log('notaActualizar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo actualizar',
      rows: []
    });
  }
}
export async function notaBorrar(req, res) {
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
      text: sql.notaBorrar,
      values: [token.decriptar(idregistro), 9]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Nota eliminada',
      rows: {}
    });
  } catch (error) {
    console.log('notaBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export async function compestuListar(req, res) {
  try {
    const {
      idmatricula
    } = req.body || {};
    const cmatrid = idmatricula ? parseInt(token.decriptar(idmatricula)) : null;
    const resp = await Db.query({
      text: sql.compestuListar,
      values: [cmatrid]
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' logros',
      rows: resp.rows
    });
  } catch (error) {
    console.log('compestuListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function compestuRegistrar(req, res) {
  try {
    const b = req.body;
    if (!b.idasigcurscomp || !b.idmatricula) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta información',
      rows: []
    });
    const resp = await Db.query({
      text: sql.compestuRegistrar,
      values: [parseInt(token.decriptar(b.idasigcurscomp)), b.idperiodo ? parseInt(token.decriptar(b.idperiodo)) : null, parseInt(token.decriptar(b.idmatricula)), b.idestado ? parseInt(token.decriptar(b.idestado)) : 8]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Logro registrado',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('compestuRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export async function compestuBorrar(req, res) {
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
      text: sql.compestuBorrar,
      values: [token.decriptar(idregistro), 9]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Logro eliminado',
      rows: {}
    });
  } catch (error) {
    console.log('compestuBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export async function notadefListar(req, res) {
  try {
    const {
      idmatricula
    } = req.body || {};
    const cmatrid = idmatricula ? parseInt(token.decriptar(idmatricula)) : null;
    const resp = await Db.query({
      text: sql.notadefListar,
      values: [cmatrid]
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' definitivas',
      rows: resp.rows
    });
  } catch (error) {
    console.log('notadefListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function notadefRegistrar(req, res) {
  try {
    const b = req.body;
    if (!b.idmatricula || !b.idasigcurs || b.valor === undefined) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta información',
      rows: []
    });
    const resp = await Db.query({
      text: sql.notadefRegistrar,
      values: [parseInt(token.decriptar(b.idmatricula)), parseInt(token.decriptar(b.idasigcurs)), b.idperiodo ? parseInt(token.decriptar(b.idperiodo)) : null, b.idtipodesempeno ? parseInt(token.decriptar(b.idtipodesempeno)) : null, b.valor, b.observacion, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Definitiva registrada',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('notadefRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export async function notadefBorrar(req, res) {
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
      text: sql.notadefBorrar,
      values: [token.decriptar(idregistro), 9]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Definitiva eliminada',
      rows: {}
    });
  } catch (error) {
    console.log('notadefBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export async function promdefListar(req, res) {
  try {
    const {
      idmatricula
    } = req.body || {};
    const cmatrid = idmatricula ? parseInt(token.decriptar(idmatricula)) : null;
    const resp = await Db.query({
      text: sql.promdefListar,
      values: [cmatrid]
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' promedios',
      rows: resp.rows
    });
  } catch (error) {
    console.log('promdefListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function promdefRegistrar(req, res) {
  try {
    const b = req.body;
    if (!b.idmatricula || b.valor === undefined) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta información',
      rows: []
    });
    const resp = await Db.query({
      text: sql.promdefRegistrar,
      values: [parseInt(token.decriptar(b.idmatricula)), b.idperiodo ? parseInt(token.decriptar(b.idperiodo)) : null, b.idtipopromedio ? parseInt(token.decriptar(b.idtipopromedio)) : null, b.valor, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Promedio registrado',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('promdefRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export async function promdefBorrar(req, res) {
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
      text: sql.promdefBorrar,
      values: [token.decriptar(idregistro), 9]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Promedio eliminado',
      rows: {}
    });
  } catch (error) {
    console.log('promdefBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export async function promasigListar(req, res) {
  try {
    const {
      idpromedio
    } = req.body || {};
    const cpromoid = idpromedio ? parseInt(token.decriptar(idpromedio)) : null;
    const resp = await Db.query({
      text: sql.promasigListar,
      values: [cpromoid]
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' promedios por asignatura',
      rows: resp.rows
    });
  } catch (error) {
    console.log('promasigListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function promasigRegistrar(req, res) {
  try {
    const b = req.body;
    if (!b.idpromedio || !b.idano || !b.idasigcurs) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta información',
      rows: []
    });
    const resp = await Db.query({
      text: sql.promasigRegistrar,
      values: [parseInt(token.decriptar(b.idpromedio)), parseInt(token.decriptar(b.idano)), b.ponderacion, b.idarea ? parseInt(token.decriptar(b.idarea)) : null, parseInt(token.decriptar(b.idasigcurs)), b.promedio, b.idestado ? parseInt(token.decriptar(b.idestado)) : 1]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Promedio por asignatura registrado',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('promasigRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export async function promasigBorrar(req, res) {
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
      text: sql.promasigBorrar,
      values: [token.decriptar(idregistro), 0]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Promedio por asignatura eliminado',
      rows: {}
    });
  } catch (error) {
    console.log('promasigBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export async function promoListar(req, res) {
  try {
    const resp = await Db.query({
      text: sql.promoListar,
      values: []
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' promedios generales',
      rows: resp.rows
    });
  } catch (error) {
    console.log('promoListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function promoRegistrar(req, res) {
  try {
    const b = req.body;
    if (b.promediofinal === undefined) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el promedio final',
      rows: []
    });
    const resp = await Db.query({
      text: sql.promoRegistrar,
      values: [b.promediofinal, b.definitivo ?? false, b.gradodesde, b.gradopara, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Promedio general registrado',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('promoRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export async function promoActualizar(req, res) {
  try {
    const b = req.body;
    if (!b.idregistro) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el identificador',
      rows: []
    });
    await Db.query({
      text: sql.promoActualizar,
      values: [token.decriptar(b.idregistro), b.promediofinal, b.definitivo ?? false, b.gradodesde, b.gradopara, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Promedio general actualizado',
      rows: {}
    });
  } catch (error) {
    console.log('promoActualizar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo actualizar',
      rows: []
    });
  }
}
export async function promoBorrar(req, res) {
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
      text: sql.promoBorrar,
      values: [token.decriptar(idregistro), 9]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Promedio general eliminado',
      rows: {}
    });
  } catch (error) {
    console.log('promoBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export default {
  notaListar: notaListar,
  notaRegistrar: notaRegistrar,
  notaActualizar: notaActualizar,
  notaBorrar: notaBorrar,
  compestuListar: compestuListar,
  compestuRegistrar: compestuRegistrar,
  compestuBorrar: compestuBorrar,
  notadefListar: notadefListar,
  notadefRegistrar: notadefRegistrar,
  notadefBorrar: notadefBorrar,
  promdefListar: promdefListar,
  promdefRegistrar: promdefRegistrar,
  promdefBorrar: promdefBorrar,
  promasigListar: promasigListar,
  promasigRegistrar: promasigRegistrar,
  promasigBorrar: promasigBorrar,
  promoListar: promoListar,
  promoRegistrar: promoRegistrar,
  promoActualizar: promoActualizar,
  promoBorrar: promoBorrar
};
