import Db from "../../database/conex.js";
import token from "../../utils/token.js";
import sql from "./avisos.sql.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
/**
 * avisosController.js
 * Controlador del módulo de avisos institucionales SAE (tabavisroll, tabavisusua,
 * avisrolldest). Equivalente a control.avisos.php del SAE.
 */
require('dotenv').config();
const ESTADO_INACTIVO = 9;
export async function avisorollListar(req, res) {
  try {
    const {
      idautor
    } = req.body || {};
    const cusuaid = idautor ? parseInt(token.decriptar(idautor)) : null;
    const resp = await Db.query({
      text: sql.avisorollListar,
      values: [cusuaid]
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' avisos por rol',
      rows: resp.rows
    });
  } catch (error) {
    console.log('avisorollListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function avisorollRegistrar(req, res) {
  try {
    const b = req.body;
    if (!b.titulo || !b.contenido) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta título o contenido',
      rows: []
    });
    // Adjunto: imagen/archivo subido desde el dispositivo, guardado por uploadAlert en
    // public/archivos/avisos/<idInstitucion>/ y servido en /p/c/<idInstitucion>/<archivo>.
    let imagen = b.imagen || null;
    if (req.files && req.files.length > 0 && req.files[0] && req.files[0].filename) {
      const idInst = b.id_institucion ? parseInt(token.decriptar(b.id_institucion)) : null;
      imagen = 'p/c/' + (idInst || '') + '/' + req.files[0].filename;
    }
    const resp = await Db.query({
      text: sql.avisorollRegistrar,
      values: [b.idautor ? parseInt(token.decriptar(b.idautor)) : null, b.titulo, b.contenido, imagen, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Aviso registrado',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('avisorollRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export async function avisorollActualizar(req, res) {
  try {
    const b = req.body;
    if (!b.idregistro) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el identificador',
      rows: []
    });
    // Adjunto: si viene un archivo nuevo se usa; si no, se conserva el existente (b.imagen).
    let imagen = b.imagen || null;
    if (req.files && req.files.length > 0 && req.files[0] && req.files[0].filename) {
      const idInst = b.id_institucion ? parseInt(token.decriptar(b.id_institucion)) : null;
      imagen = 'p/c/' + (idInst || '') + '/' + req.files[0].filename;
    }
    await Db.query({
      text: sql.avisorollActualizar,
      values: [token.decriptar(b.idregistro), b.titulo, b.contenido, imagen, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Aviso actualizado',
      rows: {}
    });
  } catch (error) {
    console.log('avisorollActualizar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo actualizar',
      rows: []
    });
  }
}
export async function avisorollBorrar(req, res) {
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
      text: sql.avisorollBorrar,
      values: [token.decriptar(idregistro), ESTADO_INACTIVO]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Aviso eliminado',
      rows: {}
    });
  } catch (error) {
    console.log('avisorollBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export async function avisousuaListar(req, res) {
  try {
    const {
      idautor
    } = req.body || {};
    const cusuaid = idautor ? parseInt(token.decriptar(idautor)) : null;
    const resp = await Db.query({
      text: sql.avisousuaListar,
      values: [cusuaid]
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' avisos por usuario',
      rows: resp.rows
    });
  } catch (error) {
    console.log('avisousuaListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function avisousuaRegistrar(req, res) {
  try {
    const b = req.body;
    if (!b.titulo || !b.contenido) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta título o contenido',
      rows: []
    });
    const resp = await Db.query({
      text: sql.avisousuaRegistrar,
      values: [b.idautor ? parseInt(token.decriptar(b.idautor)) : null, b.iddestino ? parseInt(token.decriptar(b.iddestino)) : null, b.titulo, b.contenido, b.imagen || null, b.fechainicio, b.fechafin, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Aviso registrado',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('avisousuaRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export async function avisousuaActualizar(req, res) {
  try {
    const b = req.body;
    if (!b.idregistro) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el identificador',
      rows: []
    });
    await Db.query({
      text: sql.avisousuaActualizar,
      values: [token.decriptar(b.idregistro), b.iddestino ? parseInt(token.decriptar(b.iddestino)) : null, b.titulo, b.contenido, b.imagen || null, b.fechainicio, b.fechafin, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Aviso actualizado',
      rows: {}
    });
  } catch (error) {
    console.log('avisousuaActualizar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo actualizar',
      rows: []
    });
  }
}
export async function avisousuaBorrar(req, res) {
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
      text: sql.avisousuaBorrar,
      values: [token.decriptar(idregistro), ESTADO_INACTIVO]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Aviso eliminado',
      rows: {}
    });
  } catch (error) {
    console.log('avisousuaBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export async function avisodestListar(req, res) {
  try {
    const {
      idaviso
    } = req.body || {};
    const cavisrollid = idaviso ? parseInt(token.decriptar(idaviso)) : null;
    const resp = await Db.query({
      text: sql.avisodestListar,
      values: [cavisrollid]
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' destinos de aviso',
      rows: resp.rows
    });
  } catch (error) {
    console.log('avisodestListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function avisodestRegistrar(req, res) {
  try {
    const b = req.body;
    if (!b.idaviso) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el aviso',
      rows: []
    });
    const resp = await Db.query({
      text: sql.avisodestRegistrar,
      values: [parseInt(token.decriptar(b.idaviso)), b.idrol ? parseInt(token.decriptar(b.idrol)) : null, b.idusuario ? parseInt(token.decriptar(b.idusuario)) : null, b.fechainicio, b.fechafin, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Destino registrado',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('avisodestRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export async function avisodestActualizar(req, res) {
  try {
    const b = req.body;
    if (!b.idregistro) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el identificador',
      rows: []
    });
    await Db.query({
      text: sql.avisodestActualizar,
      values: [token.decriptar(b.idregistro), b.idrol ? parseInt(token.decriptar(b.idrol)) : null, b.idusuario ? parseInt(token.decriptar(b.idusuario)) : null, b.fechainicio, b.fechafin, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Destino actualizado',
      rows: {}
    });
  } catch (error) {
    console.log('avisodestActualizar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo actualizar',
      rows: []
    });
  }
}
export async function avisodestBorrar(req, res) {
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
      text: sql.avisodestBorrar,
      values: [token.decriptar(idregistro), ESTADO_INACTIVO]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Destino eliminado',
      rows: {}
    });
  } catch (error) {
    console.log('avisodestBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export default {
  avisorollListar: avisorollListar,
  avisorollRegistrar: avisorollRegistrar,
  avisorollActualizar: avisorollActualizar,
  avisorollBorrar: avisorollBorrar,
  avisousuaListar: avisousuaListar,
  avisousuaRegistrar: avisousuaRegistrar,
  avisousuaActualizar: avisousuaActualizar,
  avisousuaBorrar: avisousuaBorrar,
  avisodestListar: avisodestListar,
  avisodestRegistrar: avisodestRegistrar,
  avisodestActualizar: avisodestActualizar,
  avisodestBorrar: avisodestBorrar
};
