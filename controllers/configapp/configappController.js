import Db from "../../database/conex.js";
import token from "../../utils/token.js";
import sql from "./configapp.sql.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
/**
 * configappController.js
 * Controlador del módulo de configuración/ayuda de Escuelapp: ayuda, condiciones,
 * solicitudes, mediciones, tipos de certificado, avisos internos (+comentarios),
 * alertas de publicación y tipos de citación.
 */
require('dotenv').config();
const ESTADO_INACTIVO = 9;
export async function ayudaListar(req, res) {
  try {
    const resp = await Db.query({
      text: sql.ayudaListar,
      values: []
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' ayudas',
      rows: resp.rows
    });
  } catch (error) {
    console.log('ayudaListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function ayudaRegistrar(req, res) {
  try {
    const b = req.body;
    if (!b.titulo) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el título',
      rows: []
    });
    const resp = await Db.query({
      text: sql.ayudaRegistrar,
      values: [b.par || [], b.idestado ? parseInt(token.decriptar(b.idestado)) : 8, b.tipointerface || null, b.titulo, b.enlace || null, b.descripcion || null, b.version || null]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Ayuda registrada',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('ayudaRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export async function ayudaActualizar(req, res) {
  try {
    const b = req.body;
    if (!b.idregistro) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el identificador',
      rows: []
    });
    await Db.query({
      text: sql.ayudaActualizar,
      values: [token.decriptar(b.idregistro), b.par || [], b.idestado ? parseInt(token.decriptar(b.idestado)) : 8, b.tipointerface || null, b.titulo, b.enlace || null, b.descripcion || null, b.version || null, b.vistas ?? 0]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Ayuda actualizada',
      rows: {}
    });
  } catch (error) {
    console.log('ayudaActualizar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo actualizar',
      rows: []
    });
  }
}
export async function ayudaBorrar(req, res) {
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
      text: sql.ayudaBorrar,
      values: [token.decriptar(idregistro), ESTADO_INACTIVO]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Ayuda eliminada',
      rows: {}
    });
  } catch (error) {
    console.log('ayudaBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export async function condicionListar(req, res) {
  try {
    const resp = await Db.query({
      text: sql.condicionListar,
      values: []
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' condiciones',
      rows: resp.rows
    });
  } catch (error) {
    console.log('condicionListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function condicionRegistrar(req, res) {
  try {
    const b = req.body;
    if (!b.acudiente) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el acudiente',
      rows: []
    });
    const resp = await Db.query({
      text: sql.condicionRegistrar,
      values: [b.acudiente, b.modelo || null, b.plataforma || null, b.uuid || null, b.version || null, b.serial || null]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Condición registrada',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('condicionRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export async function condicionBorrar(req, res) {
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
      text: sql.condicionBorrar,
      values: [token.decriptar(idregistro)]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Condición eliminada',
      rows: {}
    });
  } catch (error) {
    console.log('condicionBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export async function solicitudListar(req, res) {
  try {
    const {
      idinstitucion
    } = req.body || {};
    const aeinstid = idinstitucion ? parseInt(token.decriptar(idinstitucion)) : null;
    const resp = await Db.query({
      text: sql.solicitudListar,
      values: [aeinstid]
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' solicitudes',
      rows: resp.rows
    });
  } catch (error) {
    console.log('solicitudListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function solicitudRegistrar(req, res) {
  try {
    const b = req.body;
    if (!b.mensaje) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el mensaje',
      rows: []
    });
    const resp = await Db.query({
      text: sql.solicitudRegistrar,
      values: [b.idano ? parseInt(token.decriptar(b.idano)) : null, b.idinstitucion ? parseInt(token.decriptar(b.idinstitucion)) : null, b.idusuario ? parseInt(token.decriptar(b.idusuario)) : null, b.idtipocertificado ? parseInt(token.decriptar(b.idtipocertificado)) : null, b.mensaje, b.destino || null, b.idestado ? parseInt(token.decriptar(b.idestado)) : 1]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Solicitud registrada',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('solicitudRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export async function solicitudActualizar(req, res) {
  try {
    const b = req.body;
    if (!b.idregistro) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el identificador',
      rows: []
    });
    await Db.query({
      text: sql.solicitudActualizar,
      values: [token.decriptar(b.idregistro), b.idtipocertificado ? parseInt(token.decriptar(b.idtipocertificado)) : null, b.mensaje, b.destino || null, b.idestado ? parseInt(token.decriptar(b.idestado)) : 1]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Solicitud actualizada',
      rows: {}
    });
  } catch (error) {
    console.log('solicitudActualizar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo actualizar',
      rows: []
    });
  }
}
export async function solicitudBorrar(req, res) {
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
      text: sql.solicitudBorrar,
      values: [token.decriptar(idregistro), ESTADO_INACTIVO]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Solicitud eliminada',
      rows: {}
    });
  } catch (error) {
    console.log('solicitudBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export async function medicionListar(req, res) {
  try {
    const resp = await Db.query({
      text: sql.medicionListar,
      values: []
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' mediciones',
      rows: resp.rows
    });
  } catch (error) {
    console.log('medicionListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function medicionRegistrar(req, res) {
  try {
    const b = req.body;
    if (!b.concepto || b.valor === undefined) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta concepto o valor',
      rows: []
    });
    const resp = await Db.query({
      text: sql.medicionRegistrar,
      values: [b.idusuarios || null, b.concepto, b.idestudiante ? parseFloat(token.decriptar(b.idestudiante)) : null, b.grupo || null, b.valor]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Medición registrada',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('medicionRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export async function medicionActualizar(req, res) {
  try {
    const b = req.body;
    if (!b.idregistro) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el identificador',
      rows: []
    });
    await Db.query({
      text: sql.medicionActualizar,
      values: [token.decriptar(b.idregistro), b.idusuarios || null, b.concepto, b.idestudiante ? parseFloat(token.decriptar(b.idestudiante)) : null, b.grupo || null, b.valor]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Medición actualizada',
      rows: {}
    });
  } catch (error) {
    console.log('medicionActualizar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo actualizar',
      rows: []
    });
  }
}
export async function medicionBorrar(req, res) {
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
      text: sql.medicionBorrar,
      values: [token.decriptar(idregistro)]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Medición eliminada',
      rows: {}
    });
  } catch (error) {
    console.log('medicionBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export async function tipocertificadoListar(req, res) {
  try {
    const resp = await Db.query({
      text: sql.tipocertificadoListar,
      values: []
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' tipos de certificado',
      rows: resp.rows
    });
  } catch (error) {
    console.log('tipocertificadoListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function tipocertificadoRegistrar(req, res) {
  try {
    const b = req.body;
    if (!b.nombre) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el nombre',
      rows: []
    });
    const resp = await Db.query({
      text: sql.tipocertificadoRegistrar,
      values: [b.nombre, b.descripcion || null, b.idestado ? parseInt(token.decriptar(b.idestado)) : 1]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Tipo de certificado registrado',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('tipocertificadoRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export async function tipocertificadoActualizar(req, res) {
  try {
    const b = req.body;
    if (!b.idregistro) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el identificador',
      rows: []
    });
    await Db.query({
      text: sql.tipocertificadoActualizar,
      values: [token.decriptar(b.idregistro), b.nombre, b.descripcion || null, b.idestado ? parseInt(token.decriptar(b.idestado)) : 1]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Tipo de certificado actualizado',
      rows: {}
    });
  } catch (error) {
    console.log('tipocertificadoActualizar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo actualizar',
      rows: []
    });
  }
}
export async function tipocertificadoBorrar(req, res) {
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
      text: sql.tipocertificadoBorrar,
      values: [token.decriptar(idregistro)]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Tipo de certificado eliminado',
      rows: {}
    });
  } catch (error) {
    console.log('tipocertificadoBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export async function avisointernoListar(req, res) {
  try {
    const {
      idinstitucion
    } = req.body || {};
    const aeinstid = idinstitucion ? parseInt(token.decriptar(idinstitucion)) : null;
    const resp = await Db.query({
      text: sql.avisointernoListar,
      values: [aeinstid]
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' avisos internos',
      rows: resp.rows
    });
  } catch (error) {
    console.log('avisointernoListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function avisointernoRegistrar(req, res) {
  try {
    const b = req.body;
    if (!b.titulo) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el título',
      rows: []
    });
    const resp = await Db.query({
      text: sql.avisointernoRegistrar,
      values: [b.idusuario ? parseFloat(token.decriptar(b.idusuario)) : null, b.idinstitucion ? parseFloat(token.decriptar(b.idinstitucion)) : null, b.idano ? parseFloat(token.decriptar(b.idano)) : null, b.iddocentes || [], b.fechapublicacion || null, b.fechafinalizacion || null, b.titulo, b.descripcion || null, b.adjunto || null, b.idestado ? parseInt(token.decriptar(b.idestado)) : 1]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Aviso interno registrado',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('avisointernoRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export async function avisointernoActualizar(req, res) {
  try {
    const b = req.body;
    if (!b.idregistro) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el identificador',
      rows: []
    });
    await Db.query({
      text: sql.avisointernoActualizar,
      values: [token.decriptar(b.idregistro), b.iddocentes || [], b.fechapublicacion || null, b.fechafinalizacion || null, b.titulo, b.descripcion || null, b.adjunto || null, b.idestado ? parseInt(token.decriptar(b.idestado)) : 1]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Aviso interno actualizado',
      rows: {}
    });
  } catch (error) {
    console.log('avisointernoActualizar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo actualizar',
      rows: []
    });
  }
}
export async function avisointernoBorrar(req, res) {
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
      text: sql.avisointernoBorrar,
      values: [token.decriptar(idregistro), ESTADO_INACTIVO]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Aviso interno eliminado',
      rows: {}
    });
  } catch (error) {
    console.log('avisointernoBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export async function avisointcomentarioListar(req, res) {
  try {
    const {
      idaviso
    } = req.body || {};
    const id = idaviso ? parseFloat(token.decriptar(idaviso)) : null;
    const resp = await Db.query({
      text: sql.avisointcomentarioListar,
      values: [id]
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' comentarios',
      rows: resp.rows
    });
  } catch (error) {
    console.log('avisointcomentarioListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function avisointcomentarioRegistrar(req, res) {
  try {
    const b = req.body;
    if (!b.idaviso || !b.descripcion) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta aviso o descripción',
      rows: []
    });
    const resp = await Db.query({
      text: sql.avisointcomentarioRegistrar,
      values: [parseFloat(token.decriptar(b.idaviso)), b.idusuario ? parseFloat(token.decriptar(b.idusuario)) : null, b.descripcion, b.idestado ? parseInt(token.decriptar(b.idestado)) : 1]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Comentario registrado',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('avisointcomentarioRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export async function avisointcomentarioBorrar(req, res) {
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
      text: sql.avisointcomentarioBorrar,
      values: [token.decriptar(idregistro), ESTADO_INACTIVO]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Comentario eliminado',
      rows: {}
    });
  } catch (error) {
    console.log('avisointcomentarioBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export async function pubalertaListar(req, res) {
  try {
    const {
      idpublicacion
    } = req.body || {};
    const id = idpublicacion ? parseInt(token.decriptar(idpublicacion)) : null;
    const resp = await Db.query({
      text: sql.pubalertaListar,
      values: [id]
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' alertas de publicación',
      rows: resp.rows
    });
  } catch (error) {
    console.log('pubalertaListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function pubalertaRegistrar(req, res) {
  try {
    const b = req.body;
    if (!b.idpublicacion) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta la publicación',
      rows: []
    });
    const resp = await Db.query({
      text: sql.pubalertaRegistrar,
      values: [parseInt(token.decriptar(b.idpublicacion))]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Alerta registrada',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('pubalertaRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export async function pubalertaBorrar(req, res) {
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
      text: sql.pubalertaBorrar,
      values: [token.decriptar(idregistro)]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Alerta eliminada',
      rows: {}
    });
  } catch (error) {
    console.log('pubalertaBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export async function tipocitacionListar(req, res) {
  try {
    const resp = await Db.query({
      text: sql.tipocitacionListar,
      values: []
    });
    resp.rows.forEach((f, i) => {
      resp.rows[i].idregistro = token.encriptar(f.idregistro);
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' tipos de citación',
      rows: resp.rows
    });
  } catch (error) {
    console.log('tipocitacionListar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function tipocitacionRegistrar(req, res) {
  try {
    const b = req.body;
    if (!b.nombre) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el nombre',
      rows: []
    });
    const resp = await Db.query({
      text: sql.tipocitacionRegistrar,
      values: [b.nombre, b.idestado ? parseInt(token.decriptar(b.idestado)) : 1]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Tipo de citación registrado',
      rows: {
        idregistro: token.encriptar(resp.rows[0].idregistro)
      }
    });
  } catch (error) {
    console.log('tipocitacionRegistrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo registrar',
      rows: []
    });
  }
}
export async function tipocitacionActualizar(req, res) {
  try {
    const b = req.body;
    if (!b.idregistro) return res.send({
      status: 'error',
      statusCode: 400,
      message: 'Falta el identificador',
      rows: []
    });
    await Db.query({
      text: sql.tipocitacionActualizar,
      values: [token.decriptar(b.idregistro), b.nombre, b.idestado ? parseInt(token.decriptar(b.idestado)) : 1]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Tipo de citación actualizado',
      rows: {}
    });
  } catch (error) {
    console.log('tipocitacionActualizar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo actualizar',
      rows: []
    });
  }
}
export async function tipocitacionBorrar(req, res) {
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
      text: sql.tipocitacionBorrar,
      values: [token.decriptar(idregistro), ESTADO_INACTIVO]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Tipo de citación eliminado',
      rows: {}
    });
  } catch (error) {
    console.log('tipocitacionBorrar: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo eliminar',
      rows: []
    });
  }
}
export default {
  ayudaListar: ayudaListar,
  ayudaRegistrar: ayudaRegistrar,
  ayudaActualizar: ayudaActualizar,
  ayudaBorrar: ayudaBorrar,
  condicionListar: condicionListar,
  condicionRegistrar: condicionRegistrar,
  condicionBorrar: condicionBorrar,
  solicitudListar: solicitudListar,
  solicitudRegistrar: solicitudRegistrar,
  solicitudActualizar: solicitudActualizar,
  solicitudBorrar: solicitudBorrar,
  medicionListar: medicionListar,
  medicionRegistrar: medicionRegistrar,
  medicionActualizar: medicionActualizar,
  medicionBorrar: medicionBorrar,
  tipocertificadoListar: tipocertificadoListar,
  tipocertificadoRegistrar: tipocertificadoRegistrar,
  tipocertificadoActualizar: tipocertificadoActualizar,
  tipocertificadoBorrar: tipocertificadoBorrar,
  avisointernoListar: avisointernoListar,
  avisointernoRegistrar: avisointernoRegistrar,
  avisointernoActualizar: avisointernoActualizar,
  avisointernoBorrar: avisointernoBorrar,
  avisointcomentarioListar: avisointcomentarioListar,
  avisointcomentarioRegistrar: avisointcomentarioRegistrar,
  avisointcomentarioBorrar: avisointcomentarioBorrar,
  pubalertaListar: pubalertaListar,
  pubalertaRegistrar: pubalertaRegistrar,
  pubalertaBorrar: pubalertaBorrar,
  tipocitacionListar: tipocitacionListar,
  tipocitacionRegistrar: tipocitacionRegistrar,
  tipocitacionActualizar: tipocitacionActualizar,
  tipocitacionBorrar: tipocitacionBorrar
};
