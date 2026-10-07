import Db from "../../database/conex.js";
import token from "../../utils/token.js";
import sql from "./disciplina.sql.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
/**
 * disciplinaController.js
 * Controlador del módulo de disciplina SAE (tabdisci, tabdiscinst, tabdiscnota).
 */
require('dotenv').config();
const ESTADO_INACTIVO = 9;
export async function disciplinaListar(req, res) {
  try {
    const resp = await Db.query({
      text: sql.disciplinaListar,
      values: []
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' disciplinas',
      rows: resp.rows
    });
  } catch (error) {
    console.log('disciplinaListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function disciplinaRegistrar(req, res) {
  try {
    const b = req.body;
    if (!b.nombre) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el nombre',
      rows: []
    });
    const resp = await Db.query({
      text: sql.disciplinaRegistrar,
      values: [b.nombre, b.abreviatura || null, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Disciplina registrada',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('disciplinaRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export async function disciplinaActualizar(req, res) {
  try {
    const b = req.body;
    if (!b.idregistro) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el identificador',
      rows: []
    });
    await Db.query({
      text: sql.disciplinaActualizar,
      values: [token.decriptar(b.idregistro), b.nombre, b.abreviatura || null, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Disciplina actualizada',
      rows: {}
    });
  } catch (error) {
    console.log('disciplinaActualizar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo actualizar',
      rows: []
    });
  }
}
export async function disciplinaBorrar(req, res) {
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
      text: sql.disciplinaBorrar,
      values: [token.decriptar(idregistro), ESTADO_INACTIVO]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Disciplina eliminada',
      rows: {}
    });
  } catch (error) {
    console.log('disciplinaBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export async function discinstListar(req, res) {
  try {
    const {
      idinstitucion
    } = req.body || {};
    const cinstid = idinstitucion ? parseInt(token.decriptar(idinstitucion)) : null;
    const resp = await Db.query({
      text: sql.discinstListar,
      values: [cinstid]
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' disciplinas por institución',
      rows: resp.rows
    });
  } catch (error) {
    console.log('discinstListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function discinstRegistrar(req, res) {
  try {
    const b = req.body;
    if (!b.iddisciplina || !b.idinstitucion) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta disciplina o institución',
      rows: []
    });
    const resp = await Db.query({
      text: sql.discinstRegistrar,
      values: [parseInt(token.decriptar(b.iddisciplina)), parseInt(token.decriptar(b.idinstitucion)), b.idestado ? parseInt(token.decriptar(b.idestado)) : 8]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Disciplina asignada a institución',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('discinstRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export async function discinstActualizar(req, res) {
  try {
    const b = req.body;
    if (!b.idregistro) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el identificador',
      rows: []
    });
    await Db.query({
      text: sql.discinstActualizar,
      values: [token.decriptar(b.idregistro), b.iddisciplina ? parseInt(token.decriptar(b.iddisciplina)) : null, b.idinstitucion ? parseInt(token.decriptar(b.idinstitucion)) : null, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Asignación actualizada',
      rows: {}
    });
  } catch (error) {
    console.log('discinstActualizar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo actualizar',
      rows: []
    });
  }
}
export async function discinstBorrar(req, res) {
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
      text: sql.discinstBorrar,
      values: [token.decriptar(idregistro), ESTADO_INACTIVO]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Asignación eliminada',
      rows: {}
    });
  } catch (error) {
    console.log('discinstBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export async function discnotaListar(req, res) {
  try {
    const {
      idmatricula,
      iddiscinst
    } = req.body || {};
    const cmatrid = idmatricula ? parseInt(token.decriptar(idmatricula)) : null;
    const cdiscinstid = iddiscinst ? parseInt(token.decriptar(iddiscinst)) : null;
    const resp = await Db.query({
      text: sql.discnotaListar,
      values: [cmatrid, cdiscinstid]
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' notas de disciplina',
      rows: resp.rows
    });
  } catch (error) {
    console.log('discnotaListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function discnotaRegistrar(req, res) {
  try {
    const b = req.body;
    if (!b.iddiscinst || !b.idmatricula || b.valor === undefined) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta información',
      rows: []
    });
    const resp = await Db.query({
      text: sql.discnotaRegistrar,
      values: [parseInt(token.decriptar(b.iddiscinst)), parseInt(token.decriptar(b.idmatricula)), b.idperiodo ? parseInt(token.decriptar(b.idperiodo)) : null, b.valor, b.fecha || null, b.observacion || null, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Nota de disciplina registrada',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('discnotaRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export async function discnotaActualizar(req, res) {
  try {
    const b = req.body;
    if (!b.idregistro) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el identificador',
      rows: []
    });
    await Db.query({
      text: sql.discnotaActualizar,
      values: [token.decriptar(b.idregistro), b.iddiscinst ? parseInt(token.decriptar(b.iddiscinst)) : null, b.idmatricula ? parseInt(token.decriptar(b.idmatricula)) : null, b.idperiodo ? parseInt(token.decriptar(b.idperiodo)) : null, b.valor, b.fecha || null, b.observacion || null, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Nota de disciplina actualizada',
      rows: {}
    });
  } catch (error) {
    console.log('discnotaActualizar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo actualizar',
      rows: []
    });
  }
}
export async function discnotaBorrar(req, res) {
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
      text: sql.discnotaBorrar,
      values: [token.decriptar(idregistro), ESTADO_INACTIVO]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Nota de disciplina eliminada',
      rows: {}
    });
  } catch (error) {
    console.log('discnotaBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export default {
  disciplinaListar: disciplinaListar,
  disciplinaRegistrar: disciplinaRegistrar,
  disciplinaActualizar: disciplinaActualizar,
  disciplinaBorrar: disciplinaBorrar,
  discinstListar: discinstListar,
  discinstRegistrar: discinstRegistrar,
  discinstActualizar: discinstActualizar,
  discinstBorrar: discinstBorrar,
  discnotaListar: discnotaListar,
  discnotaRegistrar: discnotaRegistrar,
  discnotaActualizar: discnotaActualizar,
  discnotaBorrar: discnotaBorrar
};
