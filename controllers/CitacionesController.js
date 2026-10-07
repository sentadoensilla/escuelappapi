import Db from "../database/conex.js";
import token from "../utils/token.js";
import queryes from "../sql/citaciones.js";
import moment from "moment";
import * as __mod0 from "../database/pgpromise.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
require("dotenv").config();
const {
  result
} = __mod0;
export async function citacionesListar(req, res) {
  try {
    // DECLARE
    let {
      fecha,
      reference
    } = req.body;
    let result = {};
    fecha = fecha != "undefined" && fecha != '' && fecha != null ? moment(fecha).format('YYYY-MM-DD') : moment().subtract(8, "days").format('YYYY-MM-DD');
    let idregistro = reference != "undefined" && reference != '' && reference != null ? token.decriptar(reference) : null;
    let ano_lectivo = parseInt(token.decriptar(req.user.usuarioAnoId));
    let id_institucion = parseInt(token.decriptar(req.user.usuarioEmpresaId));
    let id_academico = parseInt(token.decriptar(req.user.academicoId));
    let id_usuario = parseInt(token.decriptar(req.user.usuarioId));
    console.log('reference, idregistro', reference, idregistro);
    // PROCESOS
    if (idregistro == null) {
      result = await Db.query({
        text: queryes.citacionesListar,
        values: [ano_lectivo, id_institucion, fecha]
      });
    } else {
      result = await Db.query({
        text: queryes.citacionesListarOne,
        values: [idregistro]
      });
    }
    console.log('Los argumentos: ', idregistro, ano_lectivo, id_institucion, fecha);

    // USAMOS UN CICLO MAP PARA RECORRER Y ENCRIPTAR EL ID
    result.rows.map((item, i) => {
      result.rows[i].idregistro = token.encriptar(item.idregistro);
    });
    res.send({
      status: "success",
      statusCode: 200,
      message: `Se encontraron ${result.rows.length} resultados`,
      rows: result.rows
    });
  } catch (error) {
    console.log('Try citacionesListar: ', error);
    res.send({
      status: "error",
      statusCode: 400,
      message: "El servidor tiene dolor de cabeza, intente de nuevo mas tarde",
      rows: []
    });
  }
}
export async function citacionesRegistrar(req, res) {
  try {
    let {
      estudiante,
      motivo,
      fecha,
      lugar,
      descripcion
    } = req.body;
    console.log('Lo que llega: ', motivo, fecha, lugar);
    // DECLARE
    fecha = moment(new Date(fecha)).format('YYYY-MM-DD') || moment().format('YYYY-MM-DD');
    estudiante = estudiante.split(',');
    let misEstudiantes = [];
    misEstudiantes = estudiante.map((stu, s) => {
      return parseInt(token.decriptar(stu));
    });
    motivo = parseInt(token.decriptar(motivo));
    let adjunto1 = null;
    let ano_lectivo = parseInt(token.decriptar(req.user.usuarioAnoId));
    let id_institucion = parseInt(token.decriptar(req.user.usuarioEmpresaId));
    let rol = parseInt(token.decriptar(req.user.usuarioRollId));
    let docente = rol == 2 || rol == 202 ? parseInt(token.decriptar(req.user.usuarioId)) : null;

    // PROCESOS
    const DIR = 'p/c/' + id_institucion + '/';
    if (typeof req.files !== 'undefined' && req.files) {
      adjunto1 = `${DIR}${req.files[0].filename}`;
    }
    req.rutaguardar = DIR;
    req.maxSize = 5000000;
    req.referFunction = "file";
    req.fileMax = 1;
    if (misEstudiantes && docente && fecha && motivo) {
      await Db.query({
        text: queryes.citacionesRegistrar,
        values: [ano_lectivo, id_institucion, misEstudiantes, docente, motivo, fecha, lugar, descripcion, adjunto1]
      }).then(async result => {
        // USAMOS UN CICLO MAP PARA RECORRER Y ENCRIPTAR EL ID
        result.rows.map((item, i) => {
          result.rows[i].idregistro = token.encriptar(item.idregistro);
        });

        // SEND NOTIFICATIONS AFTER INSERT
        if (result.rowCount > 0) {
          // SEND WHATSAPP AND MAILS TO PARENTS
        }
        res.send({
          status: "success",
          statusCode: 200,
          message: `Se registró ${result.rowCount} citación para ${misEstudiantes.length} estudiante(s)`,
          rows: result.rows
        });
      });
    } else {
      res.send({
        status: "error",
        statusCode: 400,
        message: "La citación requiere que proporcione todos los datos",
        rows: []
      });
    }
  } catch (error) {
    console.log('Try citacionesRegistrar: ', error);
    res.send({
      status: "error",
      statusCode: 400,
      message: "El servidor tiene dolor de cabeza, intente de nuevo mas tarde",
      rows: []
    });
  }
}
export async function citacionesActualizar(req, res) {
  try {
    let {
      idregistro,
      estudiante,
      docente,
      motivo,
      fecha,
      lugar,
      descripcion
    } = req.body;
    // DECLARE
    idregistro = parseInt(token.decriptar(idregistro));
    fecha = fecha != "undefined" && fecha != '' && fecha != null ? fecha : moment().subtract(8, "days").format('YYYY-MM-DD');
    let misEstudiantes = [];
    misEstudiantes = estudiante.map((stu, s) => {
      return parseInt(token.decriptar(stu));
    });
    docente = docente != "undefined" && docente != '' && docente != null ? parseInt(token.decriptar(docente)) : null;
    motivo = parseInt(token.decriptar(motivo));
    let archivo = null;
    let ano_lectivo = parseInt(token.decriptar(req.user.usuarioAnoId));
    let id_institucion = parseInt(token.decriptar(req.user.usuarioEmpresaId));

    // PROCESOS
    if (idregistro) {
      await Db.query({
        text: queryes.citacionesUpdate,
        values: [idregistro, ano_lectivo, id_institucion, misEstudiantes, docente, motivo, fecha, lugar, descripcion, archivo]
      }).then(async result => {
        // USAMOS UN CICLO MAP PARA RECORRER Y ENCRIPTAR EL ID
        result.rows.map((item, i) => {
          result.rows[i].idregistro = token.encriptar(item.idregistro);
        });

        // SEND NOTIFICATIONS AFTER INSERT
        if (result.rowCount > 0) {
          // SEND WHATSAPP AND MAILS TO PARENTS
        }
        res.send({
          status: "success",
          statusCode: 200,
          message: `${result.rowCount} Citación fué actualizada`,
          rows: result.rows
        });
      });
    } else {
      res.send({
        status: "error",
        statusCode: 400,
        message: "La citación requiere que proporcione todos los datos",
        rows: []
      });
    }
  } catch (error) {
    console.log('Try citacionesRegistrar: ', error);
    res.send({
      status: "error",
      statusCode: 400,
      message: "El servidor tiene dolor de cabeza, intente de nuevo mas tarde",
      rows: []
    });
  }
}
export async function citacionesBorrar(req, res) {
  try {
    // DECLARE
    let idregistro = parseInt(token.decriptar(req.body.reference));
    let ano_lectivo = parseInt(token.decriptar(req.user.usuarioAnoId));
    let id_institucion = parseInt(token.decriptar(req.user.usuarioEmpresaId));

    // PROCESOS
    if (idregistro && ano_lectivo && id_institucion) {
      await Db.query({
        text: queryes.citacionesDelete,
        values: [idregistro, ano_lectivo, id_institucion]
      }).then(async result => {
        // USAMOS UN CICLO MAP PARA RECORRER Y ENCRIPTAR EL ID
        result.rows.map((item, i) => {
          result.rows[i].idregistro = token.encriptar(item.idregistro);
        });

        // SEND NOTIFICATIONS AFTER INSERT
        if (result.rowCount > 0) {
          // SEND WHATSAPP AND MAILS TO PARENTS
        }
        res.send({
          status: "success",
          statusCode: 200,
          message: `La citación fué eliminada, los acudientes serán notificados`,
          rows: result.rows
        });
      });
    } else {
      res.send({
        status: "error",
        statusCode: 400,
        message: "La citación requiere que proporcione todos los datos",
        rows: []
      });
    }
  } catch (error) {
    console.log('Try citacionesRegistrar: ', error);
    res.send({
      status: "error",
      statusCode: 400,
      message: "El servidor tiene dolor de cabeza, intente de nuevo mas tarde",
      rows: []
    });
  }
}
export default {
  citacionesListar: citacionesListar,
  citacionesRegistrar: citacionesRegistrar,
  citacionesActualizar: citacionesActualizar,
  citacionesBorrar: citacionesBorrar
};
