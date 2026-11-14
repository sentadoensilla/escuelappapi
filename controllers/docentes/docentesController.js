import Db from "../../database/conex.js";
import token from "../../utils/token.js";
import sql from "./docentes.sql.js";
import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
/**
 * docentesController.js
 * Controlador del módulo de docentes: datos del docente (tabdoce),
 * contratación por institución (tabinstdoce) y asignación académica (asigcurs).
 */
require('dotenv').config();
const ESTADO_INACTIVO = 9;

// Guarda la foto del docente. El frontend manda la imagen en base64 (data URL);
// aquí se escribe como archivo y se guarda la RUTA en cdocefoto (varchar(100)).
// Si ya llega una ruta (no base64), se devuelve tal cual.
async function guardarFoto(foto) {
  if (!foto) return null;
  if (!/^data:image\//.test(foto)) return foto;
  try {
    const esPng = /^data:image\/png/i.test(foto);
    const base64 = foto.replace(/^data:image\/[a-z+]+;base64,/, '');
    const ext = esPng ? 'png' : 'jpg';
    const nombre = `docente_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const carpeta = path.join(__dirname, '..', '..', 'public', 'archivos', 'docentes');
    fs.mkdirSync(carpeta, { recursive: true });
    fs.writeFileSync(path.join(carpeta, nombre), Buffer.from(base64, 'base64'));
    return `archivos/docentes/${nombre}`;
  } catch (error) {
    console.log('guardarFoto: ', error);
    return null;
  }
}

// Institución de la sesión activa (encriptada en el JWT) -> id crudo.
// Devuelve null cuando el rol no tiene institución (p.ej. administrador).
function institucionSesion(req) {
  const valor = req.user && req.user.usuarioEmpresaId ? parseInt(token.decriptar(req.user.usuarioEmpresaId)) : null;
  return Number.isInteger(valor) ? valor : null;
}

// Año lectivo vigente como respaldo cuando la sesión/enlace no trae año.
async function anoVigente() {
  try {
    const r = await Db.query(sql.anoVigente);
    return r.rows[0] ? parseInt(r.rows[0].canolid) : null;
  } catch (error) {
    return null;
  }
}

// Crea/actualiza la contratación (tabinstdoce) del docente con cargo y jefe de área.
// canolid/ccargid/ctipovincid son NOT NULL en tabinstdoce: se resuelven con el año
// vigente, "Por Asignar" (ccargid 0) y un tipo de vinculación por defecto (1).
async function sincronizarContratacionConDatos(cdoceid, cinstid, canolid, idcargo, jefearea) {
  if (!cinstid) return;
  let anio = Number.isInteger(canolid) ? canolid : null;
  if (!anio) anio = await anoVigente();
  const cargoFinal = Number.isInteger(idcargo) ? idcargo : 0;
  const existe = await Db.query({
    text: sql.contratacionExiste,
    values: [cdoceid, cinstid, anio]
  });
  if (existe.rows[0]) {
    await Db.query({ text: sql.contratacionSincronizar, values: [existe.rows[0].id, cargoFinal, jefearea] });
  } else {
    await Db.query({
      text: sql.contratacionCrear,
      values: [cinstid, cdoceid, anio, cargoFinal, 1, jefearea]
    });
  }
}

// Crea/actualiza la contratación para la institución/año de la sesión activa.
// No es crítico: si no hay institución (admin) simplemente se omite.
async function sincronizarContratacion(cdoceid, req, b) {
  try {
    const cinstid = institucionSesion(req);
    if (!cinstid) return;
    const canolid = req.user && req.user.usuarioAnoId ? parseInt(token.decriptar(req.user.usuarioAnoId)) : null;
    const idcargo = b.cargo ? parseInt(token.decriptar(b.cargo)) : null;
    const jefearea = (b.jefearea === '1' || b.jefearea === 1 || b.jefearea === true) ? 1 : 0;
    await sincronizarContratacionConDatos(cdoceid, cinstid, canolid, idcargo, jefearea);
  } catch (error) {
    console.log('sincronizarContratacion: ', error);
  }
}

export async function docenteListar(req, res) {
  try {
    const cinstid = institucionSesion(req);
    const resp = await Db.query({
      text: sql.docenteListar,
      values: [cinstid]
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' docentes encontrados',
      rows: resp.rows
    });
  } catch (error) {
    console.log('docenteListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar los docentes',
      rows: []
    });
  }
}
export async function docenteRegistrar(req, res) {
  try {
    const b = req.body;
    if (!b.identificacion) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta la identificación del docente',
      rows: []
    });
    const foto = await guardarFoto(b.foto);
    const resp = await Db.query({
      text: sql.docenteRegistrar,
      values: [b.nombre1, b.nombre2, b.apellido1, b.apellido2, b.fechanacimiento, b.idsexo ? parseInt(token.decriptar(b.idsexo)) : null, b.idtiposangre ? parseInt(token.decriptar(b.idtiposangre)) : null, foto, b.idtipodocumento ? parseInt(token.decriptar(b.idtipodocumento)) : null, b.identificacion, b.celular, b.telefono, b.direccion, b.email, b.fechaingreso, (b.nombrado === true || b.nombrado === 1 || b.nombrado === '1') ? 1 : 0, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8, b.firma]
    });
    // Cargo / jefe de área (contratación por institución y año de la sesión).
    await sincronizarContratacion(resp.rows[0].idregistro, req, b);
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Docente registrado',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('docenteRegistrar: ', error);
    const duplicado = error && (error.constraint === 'unicaccdocente' || error.code === '23505');
    res.send({
      status: 'error',
      statusCode: 400,
      message: duplicado ? 'Ya existe un docente con esa identificación' : 'No se pudo registrar el docente',
      rows: []
    });
  }
}
export async function docenteActualizar(req, res) {
  try {
    const b = req.body;
    if (!b.idregistro) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el identificador',
      rows: []
    });
    const foto = await guardarFoto(b.foto);
    await Db.query({
      text: sql.docenteActualizar,
      values: [token.decriptar(b.idregistro), b.nombre1, b.nombre2, b.apellido1, b.apellido2, b.fechanacimiento, b.idsexo ? parseInt(token.decriptar(b.idsexo)) : null, b.idtiposangre ? parseInt(token.decriptar(b.idtiposangre)) : null, foto, b.idtipodocumento ? parseInt(token.decriptar(b.idtipodocumento)) : null, b.identificacion, b.celular, b.telefono, b.direccion, b.email, b.fechaingreso, (b.nombrado === true || b.nombrado === 1 || b.nombrado === '1') ? 1 : 0, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8, b.firma]
    });
    // Cargo / jefe de área (contratación por institución y año de la sesión).
    await sincronizarContratacion(parseInt(token.decriptar(b.idregistro)), req, b);
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Docente actualizado',
      rows: {}
    });
  } catch (error) {
    console.log('docenteActualizar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo actualizar el docente',
      rows: []
    });
  }
}
// Auto-gestión del docente: registro público (sin login) de sus datos personales.
// La institución y el año vienen ENCRIPTADOS en el enlace (query string del QR):
//   idinstitucion = token.encriptar(cinstid), idano = token.encriptar(canolid).
// El docente queda en estado PENDIENTE (4) y su contratación también PENDIENTE (4);
// la institución debe autorizarlo (docenteAutorizar) para activarlo (estado 8).
export async function docenteAutoregistro(req, res) {
  try {
    const b = req.body;
    const faltantes = [];
    if (!b.identificacion) faltantes.push('identificación');
    if (!b.nombre1) faltantes.push('primer nombre');
    if (!b.apellido1) faltantes.push('primer apellido');
    if (faltantes.length) {
      return res.send({
        status: 'error',
        statusCode: 400,
        message: 'Faltan datos obligatorios: ' + faltantes.join(', '),
        rows: []
      });
    }
    // Estado 4 = Pendiente (public.tabestagene); se activa al autorizar.
    const foto = await guardarFoto(b.foto);
    const resp = await Db.query({
      text: sql.docenteRegistrar,
      values: [b.nombre1, b.nombre2, b.apellido1, b.apellido2, b.fechanacimiento, b.idsexo ? parseInt(token.decriptar(b.idsexo)) : null, b.idtiposangre ? parseInt(token.decriptar(b.idtiposangre)) : null, foto, b.idtipodocumento ? parseInt(token.decriptar(b.idtipodocumento)) : null, b.identificacion, b.celular, b.telefono, b.direccion, b.email, b.fechaingreso, 0, 4, b.firma]
    });

    // Vincula al docente con la institución/año del enlace (contratación PENDIENTE).
    const cinstid = b.idinstitucion ? parseInt(token.decriptar(b.idinstitucion)) : null;
    let canolid = b.idano ? parseInt(token.decriptar(b.idano)) : null;
    if (!Number.isInteger(canolid)) canolid = await anoVigente();
    if (Number.isInteger(cinstid)) {
      await Db.query({
        text: sql.contratacionCrearPendiente,
        values: [cinstid, resp.rows[0].idregistro, canolid, 0, 1, 0]
      });
    }

    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Docente registrado. Queda pendiente de autorización por la institución.',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('docenteAutoregistro: ', error);
    const duplicado = error && (error.constraint === 'unicaccdocente' || error.code === '23505');
    res.send({
      status: 'error',
      statusCode: 400,
      message: duplicado ? 'Ya existe un docente con esa identificación' : 'No se pudo registrar el docente',
      rows: []
    });
  }
}
// Autorización por el rol institución: activa la contratación pendiente del
// docente para la institución/año de la sesión (estado 4 -> 8) y el docente.
export async function docenteAutorizar(req, res) {
  try {
    const { idregistro } = req.body;
    if (!idregistro) return res.send({ status: 'error', statusCode: 400, message: 'Falta el identificador', rows: [] });
    const cinstid = institucionSesion(req);
    if (!cinstid) return res.send({ status: 'error', statusCode: 400, message: 'No se pudo determinar la institución de la sesión', rows: [] });
    let canolid = req.user && req.user.usuarioAnoId ? parseInt(token.decriptar(req.user.usuarioAnoId)) : null;
    if (!Number.isInteger(canolid)) canolid = await anoVigente();
    const cdoceid = parseInt(token.decriptar(idregistro));

    const pendiente = await Db.query({
      text: sql.contratacionPendienteBuscar,
      values: [cdoceid, cinstid, canolid]
    });
    if (pendiente.rows[0]) {
      await Db.query({ text: sql.contratacionActivar, values: [pendiente.rows[0].id] });
    }
    await Db.query({ text: sql.docenteActivar, values: [cdoceid] });

    res.send({ status: 'success', statusCode: 200, message: 'Docente autorizado y activado', rows: {} });
  } catch (error) {
    console.log('docenteAutorizar: ', error);
    res.send({ status: 'error', statusCode: 400, message: 'No se pudo autorizar el docente', rows: [] });
  }
}
export async function docenteBorrar(req, res) {
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
      text: sql.docenteBorrar,
      values: [token.decriptar(idregistro), ESTADO_INACTIVO]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Docente eliminado',
      rows: {}
    });
  } catch (error) {
    console.log('docenteBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar el docente',
      rows: []
    });
  }
}
export async function contratacionListar(req, res) {
  try {
    const {
      idinstitucion,
      idano
    } = req.body || {};
    const cinstid = idinstitucion ? parseInt(token.decriptar(idinstitucion)) : null;
    const canolid = idano ? parseInt(token.decriptar(idano)) : null;
    const resp = await Db.query({
      text: sql.contratacionListar,
      values: [cinstid, canolid]
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' contrataciones',
      rows: resp.rows
    });
  } catch (error) {
    console.log('contratacionListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function contratacionRegistrar(req, res) {
  try {
    const b = req.body;
    if (!b.idinstitucion || !b.iddocente || !b.idano) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta institución, docente o año',
      rows: []
    });
    const resp = await Db.query({
      text: sql.contratacionRegistrar,
      values: [parseInt(token.decriptar(b.idinstitucion)), parseInt(token.decriptar(b.iddocente)), parseInt(token.decriptar(b.idano)), b.idcargo ? parseInt(token.decriptar(b.idcargo)) : null, b.idtipovinculacion ? parseInt(token.decriptar(b.idtipovinculacion)) : null, b.salario, b.ideps ? parseInt(token.decriptar(b.ideps)) : null, b.idars ? parseInt(token.decriptar(b.idars)) : null, b.idcaja ? parseInt(token.decriptar(b.idcaja)) : null, b.idarp ? parseInt(token.decriptar(b.idarp)) : null, b.fechainicio, b.fechafin, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8, b.jefearea ?? 0]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Contratación registrada',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('contratacionRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export async function contratacionActualizar(req, res) {
  try {
    const b = req.body;
    if (!b.idregistro) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el identificador',
      rows: []
    });
    await Db.query({
      text: sql.contratacionActualizar,
      values: [token.decriptar(b.idregistro), b.idcargo ? parseInt(token.decriptar(b.idcargo)) : null, b.idtipovinculacion ? parseInt(token.decriptar(b.idtipovinculacion)) : null, b.salario, b.ideps ? parseInt(token.decriptar(b.ideps)) : null, b.idars ? parseInt(token.decriptar(b.idars)) : null, b.idcaja ? parseInt(token.decriptar(b.idcaja)) : null, b.idarp ? parseInt(token.decriptar(b.idarp)) : null, b.fechainicio, b.fechafin, b.idestado ? parseInt(token.decriptar(b.idestado)) : 8, b.jefearea ?? 0]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Contratación actualizada',
      rows: {}
    });
  } catch (error) {
    console.log('contratacionActualizar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo actualizar',
      rows: []
    });
  }
}
export async function contratacionBorrar(req, res) {
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
      text: sql.contratacionBorrar,
      values: [token.decriptar(idregistro), ESTADO_INACTIVO]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Contratación eliminada',
      rows: {}
    });
  } catch (error) {
    console.log('contratacionBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export async function asignacionListar(req, res) {
  try {
    const {
      idcurso,
      iddocente
    } = req.body || {};
    const ccursid = idcurso ? parseInt(token.decriptar(idcurso)) : null;
    const cdoceid = iddocente ? parseInt(token.decriptar(iddocente)) : null;
    const resp = await Db.query({
      text: sql.asignacionListar,
      values: [ccursid, cdoceid]
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' asignaciones',
      rows: resp.rows
    });
  } catch (error) {
    console.log('asignacionListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function asignacionRegistrar(req, res) {
  try {
    const b = req.body;
    if (!b.idasignatura || !b.idcurso || !b.iddocente) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta asignatura, curso o docente',
      rows: []
    });
    const resp = await Db.query({
      text: sql.asignacionRegistrar,
      values: [parseInt(token.decriptar(b.idasignatura)), parseInt(token.decriptar(b.idcurso)), parseInt(token.decriptar(b.iddocente)), b.horainicio, b.horafin, b.idestado ? parseInt(token.decriptar(b.idestado)) : 1, b.duracion]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Asignación registrada',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('asignacionRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export async function asignacionActualizar(req, res) {
  try {
    const b = req.body;
    if (!b.idregistro) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el identificador',
      rows: []
    });
    await Db.query({
      text: sql.asignacionActualizar,
      values: [token.decriptar(b.idregistro), b.idasignatura ? parseInt(token.decriptar(b.idasignatura)) : null, b.idcurso ? parseInt(token.decriptar(b.idcurso)) : null, b.iddocente ? parseInt(token.decriptar(b.iddocente)) : null, b.horainicio, b.horafin, b.idestado ? parseInt(token.decriptar(b.idestado)) : 1, b.duracion]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Asignación actualizada',
      rows: {}
    });
  } catch (error) {
    console.log('asignacionActualizar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo actualizar',
      rows: []
    });
  }
}
export async function asignacionBorrar(req, res) {
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
      text: sql.asignacionBorrar,
      values: [token.decriptar(idregistro), 0]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Asignación eliminada',
      rows: {}
    });
  } catch (error) {
    console.log('asignacionBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export default {
  docenteListar: docenteListar,
  docenteRegistrar: docenteRegistrar,
  docenteActualizar: docenteActualizar,
  docenteAutoregistro: docenteAutoregistro,
  docenteAutorizar: docenteAutorizar,
  docenteBorrar: docenteBorrar,
  contratacionListar: contratacionListar,
  contratacionRegistrar: contratacionRegistrar,
  contratacionActualizar: contratacionActualizar,
  contratacionBorrar: contratacionBorrar,
  asignacionListar: asignacionListar,
  asignacionRegistrar: asignacionRegistrar,
  asignacionActualizar: asignacionActualizar,
  asignacionBorrar: asignacionBorrar
};
