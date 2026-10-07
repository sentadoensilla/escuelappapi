import Db from "../../database/conex.js";
import token from "../../utils/token.js";
import sql from "./estudiantes.sql.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
/**
 * estudiantesController.js
 * Controlador del módulo de estudiantes SAE: estudiantes, matrícula, acudientes,
 * otros datos (anexo 6), datos socioeconómicos y pagos.
 */
require('dotenv').config();
const ESTADO_INACTIVO = 9;
export async function estudianteListar(req, res) {
  try {
    const resp = await Db.query({
      text: sql.estudianteListar,
      values: []
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' estudiantes',
      rows: resp.rows
    });
  } catch (error) {
    console.log('estudianteListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function estudianteRegistrar(req, res) {
  try {
    const b = req.body;
    if (!b.identificacion) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta la identificación',
      rows: []
    });
    const resp = await Db.query({
      text: sql.estudianteRegistrar,
      values: [b.idtipodocumento ? parseInt(token.decriptar(b.idtipodocumento)) : null, b.identificacion, b.muniexpedicion, b.departamentoexpedicion, b.nombre1, b.nombre2, b.apellido1, b.apellido2, b.fechanacimiento, b.idtiposangre ? parseInt(token.decriptar(b.idtiposangre)) : null, b.foto, b.telefono, b.direccion, b.departamentonacimiento, b.municipionacimiento, b.idgenero ? parseInt(token.decriptar(b.idgenero)) : null, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8, b.email]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Estudiante registrado',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('estudianteRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export async function estudianteActualizar(req, res) {
  try {
    const b = req.body;
    if (!b.idregistro) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el identificador',
      rows: []
    });
    await Db.query({
      text: sql.estudianteActualizar,
      values: [token.decriptar(b.idregistro), b.idtipodocumento ? parseInt(token.decriptar(b.idtipodocumento)) : null, b.identificacion, b.nombre1, b.nombre2, b.apellido1, b.apellido2, b.fechanacimiento, b.idtiposangre ? parseInt(token.decriptar(b.idtiposangre)) : null, b.foto, b.telefono, b.direccion, b.idgenero ? parseInt(token.decriptar(b.idgenero)) : null, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8, b.email]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Estudiante actualizado',
      rows: {}
    });
  } catch (error) {
    console.log('estudianteActualizar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo actualizar',
      rows: []
    });
  }
}
export async function estudianteBorrar(req, res) {
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
      text: sql.estudianteBorrar,
      values: [token.decriptar(idregistro), ESTADO_INACTIVO]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Estudiante eliminado',
      rows: {}
    });
  } catch (error) {
    console.log('estudianteBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export async function matriculaListar(req, res) {
  try {
    const {
      idcurso
    } = req.body || {};
    const ccursid = idcurso ? parseInt(token.decriptar(idcurso)) : null;
    const resp = await Db.query({
      text: sql.matriculaListar,
      values: [ccursid]
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' matrículas',
      rows: resp.rows
    });
  } catch (error) {
    console.log('matriculaListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function matriculaRegistrar(req, res) {
  try {
    const b = req.body;
    if (!b.idestudiante || !b.idcurso || !b.idinstitucion) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta estudiante, curso o institución',
      rows: []
    });
    const resp = await Db.query({
      text: sql.matriculaRegistrar,
      values: [parseInt(token.decriptar(b.idestudiante)), parseInt(token.decriptar(b.idcurso)), parseInt(token.decriptar(b.idinstitucion)), b.nuevo ?? false, b.repitente ?? false, b.idestadoanterior ? parseInt(token.decriptar(b.idestadoanterior)) : null, b.valorinscripcion ?? 0, b.valorpension ?? 0, b.descuento ?? 0, b.idestado ? parseInt(token.decriptar(b.idestado)) : 13, b.idestadocondicional ? parseInt(token.decriptar(b.idestadocondicional)) : null]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Matrícula registrada',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('matriculaRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export async function matriculaActualizar(req, res) {
  try {
    const b = req.body;
    if (!b.idregistro) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el identificador',
      rows: []
    });
    await Db.query({
      text: sql.matriculaActualizar,
      values: [token.decriptar(b.idregistro), b.idcurso ? parseInt(token.decriptar(b.idcurso)) : null, b.nuevo ?? false, b.repitente ?? false, b.idestadoanterior ? parseInt(token.decriptar(b.idestadoanterior)) : null, b.valorinscripcion ?? 0, b.valorpension ?? 0, b.descuento ?? 0, b.idestado ? parseInt(token.decriptar(b.idestado)) : 13, b.idestadocondicional ? parseInt(token.decriptar(b.idestadocondicional)) : null]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Matrícula actualizada',
      rows: {}
    });
  } catch (error) {
    console.log('matriculaActualizar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo actualizar',
      rows: []
    });
  }
}
export async function matriculaBorrar(req, res) {
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
      text: sql.matriculaBorrar,
      values: [token.decriptar(idregistro), 9]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Matrícula eliminada',
      rows: {}
    });
  } catch (error) {
    console.log('matriculaBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export async function acudienteListar(req, res) {
  try {
    const {
      idmatricula
    } = req.body || {};
    const cmatrid = idmatricula ? parseInt(token.decriptar(idmatricula)) : null;
    const resp = await Db.query({
      text: sql.acudienteListar,
      values: [cmatrid]
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' acudientes',
      rows: resp.rows
    });
  } catch (error) {
    console.log('acudienteListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function acudienteRegistrar(req, res) {
  try {
    const b = req.body;
    if (!b.idmatricula) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta la matrícula',
      rows: []
    });
    const resp = await Db.query({
      text: sql.acudienteRegistrar,
      values: [parseInt(token.decriptar(b.idmatricula)), b.identificacion, b.nombre, b.telefono, b.direccion, b.email, b.idparentesco ? parseInt(token.decriptar(b.idparentesco)) : null, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Acudiente registrado',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('acudienteRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export async function acudienteBorrar(req, res) {
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
      text: sql.acudienteBorrar,
      values: [token.decriptar(idregistro), ESTADO_INACTIVO]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Acudiente eliminado',
      rows: {}
    });
  } catch (error) {
    console.log('acudienteBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export async function otrodatoListar(req, res) {
  try {
    const {
      idmatricula
    } = req.body || {};
    const cmatrid = idmatricula ? parseInt(token.decriptar(idmatricula)) : null;
    const resp = await Db.query({
      text: sql.otrodatoListar,
      values: [cmatrid]
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' registros',
      rows: resp.rows
    });
  } catch (error) {
    console.log('otrodatoListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function otrodatoRegistrar(req, res) {
  try {
    const b = req.body;
    if (!b.idmatricula) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta la matrícula',
      rows: []
    });
    const resp = await Db.query({
      text: sql.otrodatoRegistrar,
      values: [parseInt(token.decriptar(b.idmatricula)), b.provpriv ?? 'N', b.subsidio ?? 'N', b.madrecabezahogar ?? 'N', b.hijomadrecabezahogar ?? 'N', b.iddiscapacidad ? parseInt(token.decriptar(b.iddiscapacidad)) : null, b.idcapacidad ? parseInt(token.decriptar(b.idcapacidad)) : null, b.idetnia ? parseInt(token.decriptar(b.idetnia)) : null, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8, b.idfuenterecursos ? parseInt(token.decriptar(b.idfuenterecursos)) : null, b.idicbf ? parseInt(token.decriptar(b.idicbf)) : 1]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Otros datos registrados',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('otrodatoRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export async function socieconListar(req, res) {
  try {
    const {
      idmatricula
    } = req.body || {};
    const cmatrid = idmatricula ? parseInt(token.decriptar(idmatricula)) : null;
    const resp = await Db.query({
      text: sql.socieconListar,
      values: [cmatrid]
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' registros',
      rows: resp.rows
    });
  } catch (error) {
    console.log('socieconListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function socieconRegistrar(req, res) {
  try {
    const b = req.body;
    if (!b.idmatricula) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta la matrícula',
      rows: []
    });
    const resp = await Db.query({
      text: sql.socieconRegistrar,
      values: [parseInt(token.decriptar(b.idmatricula)), b.idzonaresidencia ? parseInt(token.decriptar(b.idzonaresidencia)) : null, b.idestrato ? parseInt(token.decriptar(b.idestrato)) : null, b.idsisben ? parseInt(token.decriptar(b.idsisben)) : null, b.iddepartamento ? parseInt(token.decriptar(b.iddepartamento)) : null, b.idmunicipio ? parseInt(token.decriptar(b.idmunicipio)) : null, b.idconflicto ? parseInt(token.decriptar(b.idconflicto)) : null, b.idmunicipioprocedencia ? parseInt(token.decriptar(b.idmunicipioprocedencia)) : null, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Datos socioeconómicos registrados',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('socieconRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export async function pagoListar(req, res) {
  try {
    const {
      idmatricula
    } = req.body || {};
    const cmatrid = idmatricula ? parseInt(token.decriptar(idmatricula)) : null;
    const resp = await Db.query({
      text: sql.pagoListar,
      values: [cmatrid]
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' pagos',
      rows: resp.rows
    });
  } catch (error) {
    console.log('pagoListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function pagoRegistrar(req, res) {
  try {
    const b = req.body;
    if (!b.idmatricula || !b.periodo) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta matrícula o periodo',
      rows: []
    });
    const resp = await Db.query({
      text: sql.pagoRegistrar,
      values: [parseInt(token.decriptar(b.idmatricula)), b.periodo, b.fecha, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Pago registrado',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('pagoRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export async function pagoBorrar(req, res) {
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
      text: sql.pagoBorrar,
      values: [token.decriptar(idregistro), 0]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Pago eliminado',
      rows: {}
    });
  } catch (error) {
    console.log('pagoBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export async function promover(req, res) {
  try {
    const {
      idorigen,
      iddestino
    } = req.body;
    if (!idorigen || !iddestino) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta curso origen o destino',
      rows: []
    });
    const origen = parseInt(token.decriptar(idorigen));
    const destino = parseInt(token.decriptar(iddestino));

    // 1) Crear las nuevas matrículas en el curso destino.
    const resp = await Db.query({
      text: sql.promoverMatriculas,
      values: [origen, destino]
    });
    const cantidad = resp.rowCount || 0;

    // 2) Marcar las matrículas del origen como trasladadas.
    await Db.query({
      text: sql.matricularOrigenTraslado,
      values: [origen]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: cantidad + ' estudiantes promovidos',
      rows: {
        promovidos: cantidad
      }
    });
  } catch (error) {
    console.log('promover: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo realizar la promoción',
      rows: []
    });
  }
}
export default {
  estudianteListar: estudianteListar,
  estudianteRegistrar: estudianteRegistrar,
  estudianteActualizar: estudianteActualizar,
  estudianteBorrar: estudianteBorrar,
  matriculaListar: matriculaListar,
  matriculaRegistrar: matriculaRegistrar,
  matriculaActualizar: matriculaActualizar,
  matriculaBorrar: matriculaBorrar,
  acudienteListar: acudienteListar,
  acudienteRegistrar: acudienteRegistrar,
  acudienteBorrar: acudienteBorrar,
  otrodatoListar: otrodatoListar,
  otrodatoRegistrar: otrodatoRegistrar,
  socieconListar: socieconListar,
  socieconRegistrar: socieconRegistrar,
  pagoListar: pagoListar,
  pagoRegistrar: pagoRegistrar,
  pagoBorrar: pagoBorrar,
  promover: promover
};
