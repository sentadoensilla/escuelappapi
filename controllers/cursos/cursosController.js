import Db from "../../database/conex.js";
import token from "../../utils/token.js";
import sql from "./cursos.sql.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
/**
 * cursosController.js
 * Controlador del módulo de gestión de cursos (public.tabcurs).
 */
require('dotenv').config();
const ESTADO_INACTIVO = 9;
export async function cursoListar(req, res) {
  try {
    const {
      idinstitucion,
      idano
    } = req.body || {};
    const cinstid = idinstitucion ? parseInt(token.decriptar(idinstitucion)) : null;
    const canolid = idano ? parseInt(token.decriptar(idano)) : null;
    const resp = await Db.query({
      text: sql.cursoListar,
      values: [cinstid, canolid]
    });
    // Convención: sólo el PK (idregistro) se encripta; las FKs se devuelven crudas
    // para que el frontend las enmascare con tool.encriptar() antes de reenviarlas.
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' cursos encontrados',
      rows: resp.rows
    });
  } catch (error) {
    console.log('cursoListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar los cursos',
      rows: []
    });
  }
}
export async function cursoRegistrar(req, res) {
  try {
    const {
      idinstitucion,
      idgrado,
      idjornada,
      idano,
      nombre,
      limiteestudiantes,
      iddirector,
      idcoordinador,
      idestado,
      idsede
    } = req.body;
    if (!idinstitucion || !idgrado || !idano || !nombre) {
      return res.send({
        status: 'error',
        statusCode: 400,
        message: 'Falta información del curso',
        rows: []
      });
    }
    const cinstid = parseInt(token.decriptar(idinstitucion));
    const cgradid = parseInt(token.decriptar(idgrado));
    const cjornid = idjornada ? parseInt(token.decriptar(idjornada)) : null;
    const canolid = parseInt(token.decriptar(idano));
    const ccursdire = iddirector ? parseInt(token.decriptar(iddirector)) : null;
    const ccurscoor = idcoordinador ? parseInt(token.decriptar(idcoordinador)) : 0;
    const csedeid = idsede ? parseInt(token.decriptar(idsede)) : 0;
    const estado = idestado ? parseInt(token.decriptar(idestado)) : 8;
    const resp = await Db.query({
      text: sql.cursoRegistrar,
      values: [cinstid, cgradid, cjornid, canolid, nombre, limiteestudiantes, ccursdire, ccurscoor, estado, csedeid]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Curso registrado',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('cursoRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar el curso',
      rows: []
    });
  }
}
export async function cursoActualizar(req, res) {
  try {
    const {
      idregistro,
      idgrado,
      idjornada,
      nombre,
      limiteestudiantes,
      iddirector,
      idcoordinador,
      idestado,
      idsede
    } = req.body;
    if (!idregistro) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el identificador',
      rows: []
    });
    const pk = token.decriptar(idregistro);
    const cgradid = idgrado ? parseInt(token.decriptar(idgrado)) : null;
    const cjornid = idjornada ? parseInt(token.decriptar(idjornada)) : null;
    const ccursdire = iddirector ? parseInt(token.decriptar(iddirector)) : null;
    const ccurscoor = idcoordinador ? parseInt(token.decriptar(idcoordinador)) : 0;
    const csedeid = idsede ? parseInt(token.decriptar(idsede)) : 0;
    const estado = idestado ? parseInt(token.decriptar(idestado)) : 8;
    await Db.query({
      text: sql.cursoActualizar,
      values: [pk, cgradid, cjornid, nombre, limiteestudiantes, ccursdire, ccurscoor, estado, csedeid]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Curso actualizado',
      rows: {}
    });
  } catch (error) {
    console.log('cursoActualizar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo actualizar el curso',
      rows: []
    });
  }
}
export async function cursoBorrar(req, res) {
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
      text: sql.cursoBorrar,
      values: [token.decriptar(idregistro), ESTADO_INACTIVO]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Curso eliminado',
      rows: {}
    });
  } catch (error) {
    console.log('cursoBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar el curso',
      rows: []
    });
  }
}
export async function sedesListar(req, res) {
  try {
    const {
      idinstitucion
    } = req.body || {};
    const cinstid = idinstitucion ? parseInt(token.decriptar(idinstitucion)) : null;
    const resp = await Db.query({
      text: sql.sedesListar,
      values: [cinstid]
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' sedes encontradas',
      rows: resp.rows
    });
  } catch (error) {
    console.log('sedesListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar las sedes',
      rows: []
    });
  }
}
export default {
  cursoListar: cursoListar,
  cursoRegistrar: cursoRegistrar,
  cursoActualizar: cursoActualizar,
  cursoBorrar: cursoBorrar,
  sedesListar: sedesListar
};
