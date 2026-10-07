import Db from "../../database/conex.js";
import token from "../../utils/token.js";
import sql from "./estadisticassae.sql.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
/**
 * estadisticassaeController.js
 * Controlador del módulo de reportes/estadísticas SAE (solo lectura).
 */
require('dotenv').config();
export async function matriculaTotal(req, res) {
  try {
    const {
      idinstitucion
    } = req.body || {};
    const cinstid = idinstitucion ? parseInt(token.decriptar(idinstitucion)) : null;
    const resp = await Db.query({
      text: sql.matriculaTotal,
      values: [cinstid]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Total calculado',
      rows: resp.rows
    });
  } catch (error) {
    console.log('matriculaTotal: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function matriculaPorSexo(req, res) {
  try {
    const resp = await Db.query({
      text: sql.matriculaPorSexo,
      values: []
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' grupos',
      rows: resp.rows
    });
  } catch (error) {
    console.log('matriculaPorSexo: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function matriculaPorEtnia(req, res) {
  try {
    const resp = await Db.query({
      text: sql.matriculaPorEtnia,
      values: []
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' grupos',
      rows: resp.rows
    });
  } catch (error) {
    console.log('matriculaPorEtnia: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function matriculaPorGrado(req, res) {
  try {
    const resp = await Db.query({
      text: sql.matriculaPorGrado,
      values: []
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' grados',
      rows: resp.rows
    });
  } catch (error) {
    console.log('matriculaPorGrado: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function resumen(req, res) {
  try {
    const {
      idinstitucion
    } = req.body || {};
    const cinstid = idinstitucion ? parseInt(token.decriptar(idinstitucion)) : null;
    const resp = await Db.query({
      text: sql.resumen,
      values: [cinstid]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Resumen generado',
      rows: resp.rows
    });
  } catch (error) {
    console.log('resumen: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export default {
  matriculaTotal: matriculaTotal,
  matriculaPorSexo: matriculaPorSexo,
  matriculaPorEtnia: matriculaPorEtnia,
  matriculaPorGrado: matriculaPorGrado,
  resumen: resumen
};
