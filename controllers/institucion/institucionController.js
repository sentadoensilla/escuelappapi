import Db from "../../database/conex.js";
import token from "../../utils/token.js";
import sql from "./institucion.sql.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
/**
 * institucionController.js
 * Controlador del módulo de instituciones SAE (tabinst) y sedes (tabinstsede).
 */
require('dotenv').config();
const ESTADO_INACTIVO = 9;
export async function institucionListar(req, res) {
  try {
    const resp = await Db.query({
      text: sql.institucionListar,
      values: []
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' instituciones',
      rows: resp.rows
    });
  } catch (error) {
    console.log('institucionListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function institucionRegistrar(req, res) {
  try {
    const b = req.body;
    if (!b.nombre) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el nombre de la institución',
      rows: []
    });
    const resp = await Db.query({
      text: sql.institucionRegistrar,
      values: [b.idzona ? parseInt(token.decriptar(b.idzona)) : null, b.idmetodo ? parseInt(token.decriptar(b.idmetodo)) : null, b.direccion, b.idespecialidad ? parseInt(token.decriptar(b.idespecialidad)) : null, b.nombre, b.codigodane, b.idpadre ? parseInt(token.decriptar(b.idpadre)) : null, b.idciudad ? parseInt(token.decriptar(b.idciudad)) : null, b.iddepartamento ? parseInt(token.decriptar(b.iddepartamento)) : null, b.escudo, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8, b.telefono, b.email, b.lema, b.nit, b.idcaracter ? parseInt(token.decriptar(b.idcaracter)) : null, b.firma, b.reconocimiento, b.himno, b.resolrector, b.manualconvivencia, b.calendario, b.coordx ? parseFloat(b.coordx) : null, b.coordy ? parseFloat(b.coordy) : null, b.facebook, b.instagram, b.youtube, b.tiktok, b.twitter]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Institución registrada',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('institucionRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export async function institucionActualizar(req, res) {
  try {
    const b = req.body;
    if (!b.idregistro) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el identificador',
      rows: []
    });
    await Db.query({
      text: sql.institucionActualizar,
      values: [token.decriptar(b.idregistro), b.nombre, b.codigodane, b.nit, b.direccion, b.telefono, b.email, b.lema, b.escudo, b.idcaracter ? parseInt(token.decriptar(b.idcaracter)) : null, b.idciudad ? parseInt(token.decriptar(b.idciudad)) : null, b.iddepartamento ? parseInt(token.decriptar(b.iddepartamento)) : null, b.idespecialidad ? parseInt(token.decriptar(b.idespecialidad)) : null, b.idmetodo ? parseInt(token.decriptar(b.idmetodo)) : null, b.idzona ? parseInt(token.decriptar(b.idzona)) : null, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8, b.reconocimiento, b.himno, b.resolrector, b.manualconvivencia, b.calendario, b.coordx ? parseFloat(b.coordx) : null, b.coordy ? parseFloat(b.coordy) : null, b.facebook, b.instagram, b.youtube, b.tiktok, b.twitter]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Institución actualizada',
      rows: {}
    });
  } catch (error) {
    console.log('institucionActualizar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo actualizar',
      rows: []
    });
  }
}
export async function institucionBorrar(req, res) {
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
      text: sql.institucionBorrar,
      values: [token.decriptar(idregistro), ESTADO_INACTIVO]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Institución eliminada',
      rows: {}
    });
  } catch (error) {
    console.log('institucionBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export async function sedeListar(req, res) {
  try {
    const {
      idinstitucion
    } = req.body || {};
    const cinstid = idinstitucion ? parseInt(token.decriptar(idinstitucion)) : null;
    const resp = await Db.query({
      text: sql.sedeListar,
      values: [cinstid]
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' sedes',
      rows: resp.rows
    });
  } catch (error) {
    console.log('sedeListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function sedeRegistrar(req, res) {
  try {
    const b = req.body;
    if (!b.idinstitucion || !b.nombre) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta institución o nombre',
      rows: []
    });
    const resp = await Db.query({
      text: sql.sedeRegistrar,
      values: [parseInt(token.decriptar(b.idinstitucion)), b.nombre]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Sede registrada',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('sedeRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export async function sedeActualizar(req, res) {
  try {
    const b = req.body;
    if (!b.idregistro) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el identificador',
      rows: []
    });
    await Db.query({
      text: sql.sedeActualizar,
      values: [token.decriptar(b.idregistro), b.nombre]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Sede actualizada',
      rows: {}
    });
  } catch (error) {
    console.log('sedeActualizar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo actualizar',
      rows: []
    });
  }
}
export async function sedeBorrar(req, res) {
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
      text: sql.sedeBorrar,
      values: [token.decriptar(idregistro)]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Sede eliminada',
      rows: {}
    });
  } catch (error) {
    console.log('sedeBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export default {
  institucionListar: institucionListar,
  institucionRegistrar: institucionRegistrar,
  institucionActualizar: institucionActualizar,
  institucionBorrar: institucionBorrar,
  sedeListar: sedeListar,
  sedeRegistrar: sedeRegistrar,
  sedeActualizar: sedeActualizar,
  sedeBorrar: sedeBorrar
};
