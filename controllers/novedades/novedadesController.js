import Db from "../../database/conex.js";
import token from "../../utils/token.js";
import sql from "./novedades.sql.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
/**
 * novedadesController.js
 * Controlador del módulo de novedades/asistencias SAE (public.tabnove).
 */
require('dotenv').config();
const ESTADO_INACTIVO = 9;
export async function novedadListar(req, res) {
  try {
    const {
      idmatricula,
      idasigcurs,
      idtiponovedad
    } = req.body || {};
    const cmatrid = idmatricula ? parseInt(token.decriptar(idmatricula)) : null;
    const asigcursid = idasigcurs ? parseInt(token.decriptar(idasigcurs)) : null;
    const ctiponoveid = idtiponovedad ? parseInt(token.decriptar(idtiponovedad)) : null;
    const resp = await Db.query({
      text: sql.novedadListar,
      values: [cmatrid, asigcursid, ctiponoveid]
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' novedades',
      rows: resp.rows
    });
  } catch (error) {
    console.log('novedadListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function novedadRegistrar(req, res) {
  try {
    const b = req.body;
    if (!b.idmatricula || !b.observacion) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta matrícula u observación',
      rows: []
    });
    const resp = await Db.query({
      text: sql.novedadRegistrar,
      values: [b.idasigcurs ? parseInt(token.decriptar(b.idasigcurs)) : null, b.idperiodo ? parseInt(token.decriptar(b.idperiodo)) : null, parseInt(token.decriptar(b.idmatricula)), b.fecha || null, b.observacion, b.idtiponovedad ? parseInt(token.decriptar(b.idtiponovedad)) : null, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Novedad registrada',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('novedadRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export async function novedadActualizar(req, res) {
  try {
    const b = req.body;
    if (!b.idregistro) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el identificador',
      rows: []
    });
    await Db.query({
      text: sql.novedadActualizar,
      values: [token.decriptar(b.idregistro), b.idasigcurs ? parseInt(token.decriptar(b.idasigcurs)) : null, b.idperiodo ? parseInt(token.decriptar(b.idperiodo)) : null, b.idmatricula ? parseInt(token.decriptar(b.idmatricula)) : null, b.fecha || null, b.observacion, b.idtiponovedad ? parseInt(token.decriptar(b.idtiponovedad)) : null, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Novedad actualizada',
      rows: {}
    });
  } catch (error) {
    console.log('novedadActualizar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo actualizar',
      rows: []
    });
  }
}
export async function novedadBorrar(req, res) {
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
      text: sql.novedadBorrar,
      values: [token.decriptar(idregistro), ESTADO_INACTIVO]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Novedad eliminada',
      rows: {}
    });
  } catch (error) {
    console.log('novedadBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export default {
  novedadListar: novedadListar,
  novedadRegistrar: novedadRegistrar,
  novedadActualizar: novedadActualizar,
  novedadBorrar: novedadBorrar
};
