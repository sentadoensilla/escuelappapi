import Db from "../database/conex.js";
import path from "path";
import token from "../utils/token.js";
import observacionesQueryes from "../sql/observaciones.js";
import consultasAcademicas from "../sql/academics.js";
import generateButton from "../utils/buttons.js";
import alerta from "../utils/notifications/mail/alerta.js";
import fs from "fs";
import util from "util";
import wpSender from "../utils/notifications/whatsapp/wpRomote.js";
import wpQueryes from "../sql/whatsapp.js";
import * as __mod0 from "whatsapp-web.js";
import moment from "moment-timezone";
import * as __mod1 from "console";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
import { fileURLToPath } from "url";
const __dirname = fileURLToPath(new URL(".", import.meta.url));
require('dotenv').config();
const {
  MessageMedia
} = __mod0;
// const { MessageMedia } = require('whatsapp-web.js');

const {
  Console
} = __mod1;
//const { resolve } = require('path/posix');
moment.tz.setDefault("America/Bogota");
//const ahora = moment().format('YYYY-MM-DD HH:mm:ss');
const ahora = moment().format();
export async function observacionesSend(req, res) {
  let tok = null;
  let {
    grupo,
    asignatura,
    estudiantes,
    aviso,
    observacion,
    fecha,
    file
  } = req.body;

  // fs.writeFileSync('./observacionesSend.json', util.inspect(req), 'utf-8');

  try {
    tok = 'La observación no fue registrada, cierre sesion e intente de nuevo';
    const frontRoutesVeiwObservation = process.env.APP_API_FRONT + '/observadorshow/';
    aviso = aviso === 'true'; //CONVERTIR EN BOOLEAN
    const id_usuario = parseInt(token.decriptar(req.user.usuarioId));
    const id_institucion = parseInt(token.decriptar(req.user.usuarioEmpresaId));
    const id_docente = parseInt(token.decriptar(req.user.academicoId));
    const ano_lectivo = parseInt(token.decriptar(req.user.usuarioAnoId));
    fecha = moment(new Date(fecha)).format('YYYY-MM-DD HH:mm:ss') || moment().format('YYYY-MM-DD HH:mm:ss');
    let misEstudiantes = [];
    estudiantes.split(',').map((item, e) => {
      misEstudiantes.push(parseInt(token.decriptar(item)));
    });
    let misGrupos = grupo.length > 0 ? grupo.split(',').map(String) : null;
    if (id_usuario && id_institucion && ano_lectivo && estudiantes.length > 0) {
      const DIR = 'p/c/' + id_institucion + '/';
      //console.log('req.files: ', req.files)
      let adjunto1 = null;
      if (typeof req.files !== 'undefined' && req.files) {
        adjunto1 = `${DIR}${req.files[0].filename}`;
      }
      req.rutaguardar = DIR;
      req.maxSize = 5000000;
      req.referFunction = "file";
      req.fileMax = 1;
      let resp = await Db.query({
        text: observacionesQueryes.observacionAdd,
        values: [fecha, id_usuario, id_institucion, ano_lectivo, misGrupos, misEstudiantes, asignatura, aviso, observacion]
      });
      if (aviso) {
        // console.log('La aviso: ', typeof aviso, aviso)
        //ANYWAY students or groups
        let contactoEstudiantes = {};
        if (misEstudiantes != null && typeof misEstudiantes !== undefined && misEstudiantes != null) {
          contactoEstudiantes = {
            text: observacionesQueryes.contactoStudentOne,
            values: [ano_lectivo, id_institucion, misEstudiantes]
          };
        } else {
          contactoEstudiantes = {
            text: observacionesQueryes.contactoStudent,
            values: [ano_lectivo, id_institucion, misGrupos]
          };
        }

        // console.log('definition contactoEstudiantes: ', contactoEstudiantes)

        // ESTUDIANTES DESTINATARIOS DE LA OBSERVACION
        let listContactoEstudiantes = [];
        await Db.query(contactoEstudiantes).then(async resultado => {
          // console.log('then resultado: ', resultado.rows)
          listContactoEstudiantes = resultado;
          tok = resultado.rows[0].contactos.length > 0 ? `La observación fue registrada, al menos ${resultado.rows[0].contactos.length} acudientes recibieron el aviso` : 'La observación fue registrada, no se envio notificación alguna por falta de contactos';
        }).catch(async error => {
          // console.log('error en listContactoEstudiantes: ', error)
          tok = 'La observación fue registrada, sin enviar avisos, tal vez faltan los datos de contacto del estudiante ';
        });

        //LIST DATABASE EMISOR
        await Db.query({
          text: wpQueryes.myWPSessionsExtend,
          values: [ano_lectivo, [id_institucion]]
        }).then(async elEmisor => {
          elEmisor.rows[0].emisorlist.map(async (esteEmisor, e) => {
            if (esteEmisor != null && esteEmisor != "") {
              // console.log('esteEmisor: ', esteEmisor, contactoEstudiantes)                                      

              let totalMessages = 0,
                totalPush = 0;
              let destUsu = [],
                destNames = [],
                destMail = [],
                destToken = [];
              let preLogo = path.join(__dirname, '../', '/public/images/android-chrome-512x512.png');
              const miLogo = MessageMedia.fromFilePath(preLogo);
              const enlace = frontRoutesVeiwObservation + resp.rows[0].aebitacora_id;
              let payload = {};
              let elText = '',
                avisados = 0;
              listContactoEstudiantes.rows.map(async (esteEstudiante, i) => {
                // console.log('listContactoEstudiantes: ', listContactoEstudiantes.rows) 
                payload = {
                  notification: {
                    title: 'Observacion ',
                    body: `Se acaba de registrar una observacion en ${asignatura} para ${listContactoEstudiantes.rows[i].estudiante} \n${token.noHTML(observacion)} \nPara responder ingrese a: ${enlace} \n\nUsuario: el correo del estudiante \nClave: documento del estudiante \n\nEste mensaje es enviado por la agenda escolar colarqui, no responda a este whatsapp, ingrese a la agenda`,
                    extra: generateButton.boton({
                      type: 'warn',
                      shape: 'square',
                      destination: 'observaciones',
                      text: ' Ingresar '
                    })
                  },
                  data: {
                    route: 'notification?referencia=observaciones',
                    index: resp.rows[0].aebitacora_id
                  }
                };
                destNames.push(esteEstudiante.acudiente);
                destUsu.push(esteEstudiante.aeusu_id);
                destMail.push(esteEstudiante.correoestudiante); //
                if (esteEstudiante.tokenestudiante != null && esteEstudiante.tokenestudiante != "") {
                  destToken.push(esteEstudiante.tokenestudiante);
                }
                // SEND WHATSAPP NOTIFICATION
                // console.log('Contactos del estudiante: ', esteEstudiante.contactos)

                esteEstudiante.contactos[0].map(async contact => {
                  if (contact.length > 9) {
                    await wpSender.isRegistered({
                      emisor: esteEmisor,
                      number: contact
                    }).then(async verificado => {
                      // console.log('verificado._serialized: ', contact, verificado._serialized)
                      if (verificado._serialized !== "" && verificado._serialized !== null && typeof verificado._serialized !== "undefined") {
                        await wpSender.sendLinkOne({
                          emisor: esteEmisor,
                          sessionId: esteEmisor,
                          idcosa: resp.rows[0].aebitacora_id,
                          idvotantes: esteEstudiante.aeestudiantes_id,
                          number: verificado._serialized,
                          message: payload.notification.body,
                          type: 10,
                          image: miLogo,
                          campana: id_institucion,
                          link: enlace
                        });
                      }
                    });
                  }
                });
                let notificacionQuery = {
                  text: observacionesQueryes.notificationAdd,
                  values: [id_usuario, destUsu, ahora, payload.notification.title, payload.notification.body, 'data.aebitacora', esteEstudiante.aeusu_id, payload.data]
                };
                let respnotificacionQuery = await Db.query(notificacionQuery);
                avisados += parseInt(respnotificacionQuery.rowCount);
              });
              if (destMail.length > 0) {
                totalMessages = await alerta.send({
                  name: destNames,
                  email: destMail,
                  message: {
                    titulo: payload.notification.title,
                    subject: payload.notification.title,
                    message: payload.notification.body,
                    extra: payload.notification.extra
                  }
                });
              }

              //let tok = await token.createtoken(notificacionQuery)
              ////console.log('las notificacionQuery: ', notificacionQuery);                            
            } else {
              tok = 'La observación fue registrada, no se enviaron mensajes, porque el whatsapp del colegio no esta conectado, por favor avise a su secretaria';
            }
          });
        }).catch(async erroreo => {
          tok = 'La observación fue registrada, no se enviaron mensajes, porque el whatsapp del colegio no esta conectado, por favor avise a su secretaria';
        });
      } else {
        tok = 'La observación fue registrada, no se enviaron mensajes';
      }
      res.send({
        status: 'success',
        statusCode: 200,
        message: tok,
        rows: []
      });
    } else {
      res.send({
        status: 'error',
        statusCode: 400,
        message: tok,
        rows: []
      });
    }
  } catch (error) {
    console.log('El sistema experimenta dificultades: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'El sistema experimenta dificultades ',
      rows: []
    });
  }
}
export async function observacionesGiveme(req, res) {
  try {
    let {
      reference,
      group,
      fecha,
      fechahasta
    } = req.body;
    const date = new Date();
    let consultasdocentes,
      query = {},
      criterios = ``;
    const ano_lectivo = parseInt(token.decriptar(req.user.usuarioAnoId));
    const id_institucion = parseInt(token.decriptar(req.user.usuarioEmpresaId));
    const id_academico = parseInt(token.decriptar(req.user.academicoId));
    const id_usuario = parseInt(token.decriptar(req.user.usuarioId));
    const rol = parseInt(token.decriptar(req.user.usuarioRollId));
    fecha = !fecha ? new Date(date.getFullYear(), date.getMonth(), 1) : fecha;
    fechahasta = !fechahasta ? new Date(date.getFullYear(), date.getMonth() + 1, 0) : fechahasta;
    if (typeof reference !== "undefined" && reference != "") {
      reference = parseInt(token.decriptar(reference));
      query = {
        text: observacionesQueryes.observacionesListOne,
        values: [reference]
      };
    } else {
      switch (rol) {
        case 201:
          query = {
            text: observacionesQueryes.observacionesListAdmins,
            values: [ano_lectivo, id_institucion, fecha, fechahasta]
          };
          break;
        case 202:
          query = {
            text: observacionesQueryes.observacionesListTeachers,
            values: [ano_lectivo, id_institucion, id_usuario, fecha, fechahasta]
          };
          break;
        case 203:
          query = {
            text: observacionesQueryes.observacionesListStudents,
            values: [ano_lectivo, id_institucion, id_academico, fecha, fechahasta]
          };
          break;
      }
    }
    console.log('query rol: ', rol, query);
    let resp = await Db.query(query);
    resp.rows.map((item, i) => {
      resp.rows[i].idregistro = token.encriptar(item.idregistro.toString());
      resp.rows[i].idinstitucion = token.encriptar(item.idinstitucion.toString());
      resp.rows[i].idanolectivo = token.encriptar(item.idanolectivo.toString());
    });
    console.log('Registros: ', resp.rows);
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' Observaciones ',
      rows: resp.rows
    });
  } catch (error) {
    console.log('ERROR: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: ' Ocurrió un error inesperado ',
      rows: []
    });
  }
}
export async function observacionesComments(req, res) {
  try {
    let {
      reference,
      comunicate
    } = req.body;
    const id_usuario = parseInt(token.decriptar(req.user.usuarioId));
    reference = parseInt(token.decriptar(reference));
    let query = {
      text: consultasAcademicas.observacionesInsertComments,
      values: [reference, id_usuario, ahora, comunicate]
    };
    let listQueries = await Db.query(query);
    if (listQueries.rowCount > 0) {
      res.send({
        status: 'success',
        statusCode: 200,
        message: ' Comentario registrado',
        rows: []
      });
    } else {
      res.send({
        status: 'success',
        statusCode: 200,
        message: ' Comentario no registrado',
        rows: []
      });
    }
  } catch (error) {
    res.send({
      status: 'error',
      statusCode: 400,
      message: ' Ocurrió un error inesperado ',
      rows: []
    });
  }
}
export async function observacionesCommentsList(req, res) {
  try {
    let {
      reference
    } = req.body;
    reference = parseInt(token.decriptar(reference));
    let query = {
      text: observacionesQueryes.observacionesListComments,
      values: [reference]
    };
    let listQueries = await Db.query(query);
    res.send({
      status: 'success',
      statusCode: 200,
      message: listQueries.rows.length + ' Comentarios en la observacion',
      rows: listQueries.rows
    });
  } catch (error) {
    console.log('observacionesCommentsList: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: ' Ocurrió un error inesperado ',
      rows: []
    });
  }
}
export async function observacionesDelete(req, res) {
  try {
    let {
      reference
    } = req.body;
    if (reference) {
      reference = parseInt(token.decriptar(reference));
      const ano_lectivo = parseInt(token.decriptar(req.user.usuarioAnoId));
      const id_institucion = parseInt(token.decriptar(req.user.usuarioEmpresaId));
      const id_usuario = parseInt(token.decriptar(req.user.usuarioId));
      const rol = parseInt(token.decriptar(req.user.usuarioRollId));
      let query = {
        text: observacionesQueryes.observacionesDelete,
        values: [reference, ano_lectivo, id_institucion, id_usuario, rol]
      };
      let listQueries = await Db.query(query);
      res.send({
        status: 'success',
        statusCode: 200,
        message: listQueries.rowCount + ' Observación eliminada',
        rows: listQueries.rowCount
      });
    } else {
      res.send({
        status: 'error',
        statusCode: 400,
        message: ' El registro al que se refiere, no ha sido encontrado',
        rows: []
      });
    }
  } catch (error) {
    console.log('observacionesDelete: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: ' Ocurrió un error inesperado ',
      rows: []
    });
  }
}
export default {
  observacionesSend: observacionesSend,
  observacionesGiveme: observacionesGiveme,
  observacionesComments: observacionesComments,
  observacionesCommentsList: observacionesCommentsList,
  observacionesDelete: observacionesDelete
};
