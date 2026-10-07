import Db from "../../database/conex.js";
import token from "../../utils/token.js";
import sql from "./migracion.sql.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
/**
 * migracionController.js
 * Controlador del módulo de mapeo de identidad SAE <-> Escuelapp (esquema migracion).
 * Permite consultar y mantener el mapeo de IDs entre ambos sistemas.
 */
require('dotenv').config();
export async function mapInstitucionListar(req, res) {
  try {
    const resp = await Db.query({
      text: sql.mapInstitucionListar,
      values: []
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' mapeos de institución',
      rows: resp.rows
    });
  } catch (error) {
    console.log('mapInstitucionListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function mapInstitucionUpsert(req, res) {
  try {
    const b = req.body;
    if (b.cinstid === undefined || b.aeinst_id === undefined) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Faltan cinstid o aeinst_id',
      rows: []
    });
    const cinstid = isNaN(Number(b.cinstid)) ? parseInt(token.decriptar(b.cinstid)) : parseInt(b.cinstid);
    const aeinstid = isNaN(Number(b.aeinst_id)) ? parseInt(token.decriptar(b.aeinst_id)) : parseInt(b.aeinst_id);
    const resp = await Db.query({
      text: sql.mapInstitucionUpsert,
      values: [cinstid, aeinstid]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Mapeo de institución guardado',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('mapInstitucionUpsert: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo guardar',
      rows: []
    });
  }
}
export async function mapInstitucionBorrar(req, res) {
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
    const cinstid = isNaN(Number(idregistro)) ? parseInt(token.decriptar(idregistro)) : parseInt(idregistro);
    await Db.query({
      text: sql.mapInstitucionBorrar,
      values: [cinstid]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Mapeo de institución eliminado',
      rows: {}
    });
  } catch (error) {
    console.log('mapInstitucionBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export async function mapDocenteListar(req, res) {
  try {
    const resp = await Db.query({
      text: sql.mapDocenteListar,
      values: []
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' mapeos de docente',
      rows: resp.rows
    });
  } catch (error) {
    console.log('mapDocenteListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function mapDocenteUpsert(req, res) {
  try {
    const b = req.body;
    if (b.aedocentes_id === undefined || b.cdoceid === undefined) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Faltan aedocentes_id o cdoceid',
      rows: []
    });
    const aeid = isNaN(Number(b.aedocentes_id)) ? parseFloat(token.decriptar(b.aedocentes_id)) : parseFloat(b.aedocentes_id);
    const cdoceid = isNaN(Number(b.cdoceid)) ? parseInt(token.decriptar(b.cdoceid)) : parseInt(b.cdoceid);
    const resp = await Db.query({
      text: sql.mapDocenteUpsert,
      values: [aeid, cdoceid]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Mapeo de docente guardado',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('mapDocenteUpsert: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo guardar',
      rows: []
    });
  }
}
export async function mapDocenteBorrar(req, res) {
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
    const aeid = isNaN(Number(idregistro)) ? parseFloat(token.decriptar(idregistro)) : parseFloat(idregistro);
    await Db.query({
      text: sql.mapDocenteBorrar,
      values: [aeid]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Mapeo de docente eliminado',
      rows: {}
    });
  } catch (error) {
    console.log('mapDocenteBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export async function mapEstudianteListar(req, res) {
  try {
    const resp = await Db.query({
      text: sql.mapEstudianteListar,
      values: []
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' mapeos de estudiante',
      rows: resp.rows
    });
  } catch (error) {
    console.log('mapEstudianteListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function mapEstudianteUpsert(req, res) {
  try {
    const b = req.body;
    if (b.aeestudiantes_id === undefined || b.cestuid === undefined) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Faltan aeestudiantes_id o cestuid',
      rows: []
    });
    const aeid = isNaN(Number(b.aeestudiantes_id)) ? parseInt(token.decriptar(b.aeestudiantes_id)) : parseInt(b.aeestudiantes_id);
    const cestuid = isNaN(Number(b.cestuid)) ? parseInt(token.decriptar(b.cestuid)) : parseInt(b.cestuid);
    const resp = await Db.query({
      text: sql.mapEstudianteUpsert,
      values: [aeid, cestuid]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Mapeo de estudiante guardado',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('mapEstudianteUpsert: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo guardar',
      rows: []
    });
  }
}
export async function mapEstudianteBorrar(req, res) {
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
    const aeid = isNaN(Number(idregistro)) ? parseInt(token.decriptar(idregistro)) : parseInt(idregistro);
    await Db.query({
      text: sql.mapEstudianteBorrar,
      values: [aeid]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Mapeo de estudiante eliminado',
      rows: {}
    });
  } catch (error) {
    console.log('mapEstudianteBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export async function mapRolListar(req, res) {
  try {
    const resp = await Db.query({
      text: sql.mapRolListar,
      values: []
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' mapeos de rol',
      rows: resp.rows
    });
  } catch (error) {
    console.log('mapRolListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function mapRolUpsert(req, res) {
  try {
    const b = req.body;
    if (b.crollid === undefined || b.aeroll_id === undefined) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Faltan crollid o aeroll_id',
      rows: []
    });
    const crollid = isNaN(Number(b.crollid)) ? parseInt(token.decriptar(b.crollid)) : parseInt(b.crollid);
    const aerollid = isNaN(Number(b.aeroll_id)) ? parseInt(token.decriptar(b.aeroll_id)) : parseInt(b.aeroll_id);
    const resp = await Db.query({
      text: sql.mapRolUpsert,
      values: [crollid, aerollid]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Mapeo de rol guardado',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('mapRolUpsert: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo guardar',
      rows: []
    });
  }
}
export async function mapRolBorrar(req, res) {
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
    const crollid = isNaN(Number(idregistro)) ? parseInt(token.decriptar(idregistro)) : parseInt(idregistro);
    await Db.query({
      text: sql.mapRolBorrar,
      values: [crollid]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Mapeo de rol eliminado',
      rows: {}
    });
  } catch (error) {
    console.log('mapRolBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export async function mapUsuarioListar(req, res) {
  try {
    const resp = await Db.query({
      text: sql.mapUsuarioListar,
      values: []
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' mapeos de usuario',
      rows: resp.rows
    });
  } catch (error) {
    console.log('mapUsuarioListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function mapUsuarioUpsert(req, res) {
  try {
    const b = req.body;
    if (b.cusuaid === undefined || b.aeusu_id === undefined) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Faltan cusuaid o aeusu_id',
      rows: []
    });
    const cusuaid = isNaN(Number(b.cusuaid)) ? parseInt(token.decriptar(b.cusuaid)) : parseInt(b.cusuaid);
    const aeusuid = isNaN(Number(b.aeusu_id)) ? parseFloat(token.decriptar(b.aeusu_id)) : parseFloat(b.aeusu_id);
    const resp = await Db.query({
      text: sql.mapUsuarioUpsert,
      values: [cusuaid, aeusuid]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Mapeo de usuario guardado',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('mapUsuarioUpsert: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo guardar',
      rows: []
    });
  }
}
export async function mapUsuarioBorrar(req, res) {
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
    const cusuaid = isNaN(Number(idregistro)) ? parseInt(token.decriptar(idregistro)) : parseInt(idregistro);
    await Db.query({
      text: sql.mapUsuarioBorrar,
      values: [cusuaid]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Mapeo de usuario eliminado',
      rows: {}
    });
  } catch (error) {
    console.log('mapUsuarioBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export default {
  mapInstitucionListar: mapInstitucionListar,
  mapInstitucionUpsert: mapInstitucionUpsert,
  mapInstitucionBorrar: mapInstitucionBorrar,
  mapDocenteListar: mapDocenteListar,
  mapDocenteUpsert: mapDocenteUpsert,
  mapDocenteBorrar: mapDocenteBorrar,
  mapEstudianteListar: mapEstudianteListar,
  mapEstudianteUpsert: mapEstudianteUpsert,
  mapEstudianteBorrar: mapEstudianteBorrar,
  mapRolListar: mapRolListar,
  mapRolUpsert: mapRolUpsert,
  mapRolBorrar: mapRolBorrar,
  mapUsuarioListar: mapUsuarioListar,
  mapUsuarioUpsert: mapUsuarioUpsert,
  mapUsuarioBorrar: mapUsuarioBorrar
};
