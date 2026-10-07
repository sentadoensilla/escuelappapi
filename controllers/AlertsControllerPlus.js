import Db from "../database/conex.js";
import token from "../utils/token.js";
import queryes from "../sql/alertsPlus.js";
import generateButton from "../utils/buttons.js";
import generate from "../utils/notifications/mail/alerta.js";
import moment from "moment";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
require('dotenv').config();
const ahora = moment().format('YYYY-MM-DD HH:mm:ss');
export async function Publicaciones(req, res) {
  try {
    let {
      title,
      group,
      student,
      date_init,
      date_finish,
      comunicate,
      file,
      id_usuario,
      ano_lectivo,
      id_institucion,
      tipopublicacion,
      respuestas,
      alcance
    } = req.body;
    let groupsReal,
      groupsRealdata,
      query2,
      lasSedes = [],
      preInst = [],
      groupSearch = [];
    preInst = id_institucion.split(',');
    preInst.map(element => {
      lasSedes.push(parseInt(token.decriptar(element)));
    });
    id_usuario = parseInt(id_usuario);
    ano_lectivo = parseInt(ano_lectivo);
    alcance = parseInt(alcance);
    respuestas = parseInt(respuestas || 1);
    tipopublicacion = parseInt(token.decriptar(tipopublicacion) || 1);

    //0: DOCENTES, 1: DOCENTES Y ESTUDIANTES
    if (alcance == 0) {
      group = ['Docentes'];
      student = [];
    } else {
      if (group.indexOf('Todos') >= 0) {
        groupsRealdata = await Db.query({
          text: queryes.rowsviewGroupsJSON,
          values: [ano_lectivo, id_institucion]
        });
        if (groupsRealdata.rows.length > 0) {
          console.log('Los contactos groupsRealdata: ', groupsRealdata.text);
          group = JSON.stringify(groupsRealdata.rows[0].grupos);
        }
      }
      group = group.replace(/'/g, '"');
      group = JSON.parse(group);
      groupSearch = group.map(g => g + '%');
      student = JSON.parse(student);
      console.log('la cantidad de estudiantes es: ' + student.length, student);
    }
    const DIR = 'p/c/' + id_institucion + '/';
    //console.log('req.files: ', req.files)
    let adjunto1 = null;
    if (req.files[0] != undefined && req.files[0] != null) {
      adjunto1 = `${DIR}${req.files[0].filename}`;
    }
    req.rutaguardar = DIR;
    req.maxSize = 5000000;
    req.referFunction = "file";
    req.fileMax = 1;
    let insertPublicacion = {
      text: queryes.publicacionesInsert,
      values: [id_usuario, lasSedes, ano_lectivo, group, student, date_init, date_finish, title, comunicate, adjunto1, 1, alcance, respuestas, tipopublicacion]
    };
    console.log('la publicacion: ', insertPublicacion);
    await Db.query(insertPublicacion).then(async avisado => {
      if (avisado.rowCount > 0) {
        //console.log('Registro de aviso: ', query)
        let idEncriptado = token.encriptar(avisado.rows[0].aepublicaciones_id);

        //0: DOCENTES, 1: DOCENTES Y ESTUDIANTES
        if (alcance == 0) {
          //GET CONTACT USING GROUP OR SPECIFIC STUDENTS
          query2 = {
            text: queryes.contactListTeachers,
            values: [lasSedes]
          };
        } else {
          //GET CONTACT USING GROUP OR SPECIFIC STUDENTS
          query2 = {
            text: queryes.contactListStudentGroup,
            values: [lasSedes, groupSearch]
          };
        }
        console.log('Los contactos consulta: ', query2);
        await Db.query(query2).then(async resp => {
          let totalMessages = 0,
            totalPush = 0;
          let elBotonComunicado = generateButton.boton({
            type: 'success',
            shape: 'square',
            destination: 'view_post/' + idEncriptado,
            text: ' Ver comunicado '
          });
          let destUsu = [],
            destNames = [],
            destMail = [],
            destToken = [];

          //0: DOCENTES, 1: DOCENTES Y ESTUDIANTES
          if (alcance == 0) {
            resp.rows.map(contacto => {
              if (contacto.aedocentes_mail && contacto.aedocentes_mail.indexOf('@') >= 0) {
                destNames.push(contacto.docente);
                destUsu.push(contacto.aeusu_id);
                destMail.push(contacto.aedocentes_mail);
                destToken.push(contacto.aeusu_token);
              }
            });
          } else {
            console.log('Los contactos rowsCount: ', resp.rows.length);
            resp.rows.map(contacto => {
              // console.log('Los contactos map : ', contacto)
              let losMails = '',
                elToken = null;
              if (contacto.correoestudiante && contacto.correoestudiante.indexOf('@') >= 0) {
                losMails = contacto.correoestudiante;
                losMails += contacto.correoacudiente && contacto.correoacudiente.indexOf('@') >= 0 ? ',' + contacto.correoacudiente : '';
                destMail.push(losMails); //                            
                destNames.push(contacto.estudiante + ',' + contacto.acudiente);
                destUsu.push(contacto.aeusu_id);
                //elToken = (contacto.tokenestudiante.length > 4)? contacto.tokenestudiante : null ;
                destToken.push(contacto.tokenestudiante);
              }
            });
            console.log('Los contacto post map: ', destMail.length);
          }
          console.log('Los contactos destMail: ', destMail);
          //console.log('Los contactos destToken: ', destToken)

          let messagePreview = comunicate.replace(/<[^>]*>/g, '') + ' ... '; // comunicate.replace(/<\/?[^>]+>/ig, " ").substring(0, 50) + ' ... '
          let payload = {
            notification: {
              title: title,
              body: messagePreview,
              extra: elBotonComunicado
            },
            data: {
              route: 'notification?referencia=publicacion',
              index: idEncriptado.toString()
            }
          };
          let notificacionQuery = {
            text: `INSERT INTO data.aenotificaciones(
                                aenotificaciones_id, aenotificaciones_de, aenotificaciones_para, aenotificaciones_fecha, 
                                aenotificaciones_title, aenotificaciones_body, aenotificaciones_ruta, aenotificaciones_referencia, aenotificaciones_data)
                                VALUES ((SELECT COALESCE(MAX(aenotificaciones_id)+1, 1) FROM data.aenotificaciones), $1, $2, current_timestamp, $3, $4, $5, $6, $7) RETURNING aenotificaciones_id`,
            values: [id_usuario, destUsu, title, messagePreview, 'data.aepublicaciones', avisado.rows[0].aepublicaciones_id, payload.data]
          };
          let respnotificacionQuery = await Db.query(notificacionQuery);

          // totalPush = await generatePush.pushSendMessage()
          console.log('totalPush: ', {
            name: destNames,
            tokens: destToken,
            message: payload
          });

          // totalMessages = await generate.send()
          console.log('totalMessages: ', {
            name: destNames,
            email: destMail,
            message: {
              titulo: title,
              message: messagePreview + ' <br/>' + elBotonComunicado
            }
          });
          console.log('Tokens enviados: ', totalPush);
          let tok = await token.createtoken(avisado.rowCount + ' Publicaciones registradas');
          res.send({
            status: 'success',
            statusCode: 200,
            message: avisado.rowCount + ' Publicación registrada, se enviaran los correos y las notificaciones respectivas',
            token: tok
          });
        }).catch(async error => {
          let tok = await token.createtoken(' Publicación registrada, pero no fue posible enviar las notificaciones ' + error.toString());
          res.send({
            status: 'error',
            statusCode: 400,
            message: ' Publicación registrada, pero no fue posible enviar las notificaciones ' + error.toString(),
            token: tok
          });
        });
      } else {
        let tok = await token.createtoken(' No fue posible registrar la publicación ' + error.toString());
        res.send({
          status: 'error',
          statusCode: 400,
          message: ' No fue posible registrar la publicación ' + error.toString(),
          token: tok
        });
      }
    }).catch(async error => {
      let tok = await token.createtoken(' El sistema no pudo registrar la publicación ' + error.toString());
      res.send({
        status: 'error',
        statusCode: 400,
        message: ' El sistema no pudo registrar la publicación ' + error.toString(),
        token: tok
      });
    });
  } catch (error) {
    let tok = await token.createtoken(' El sistema no pudo registrar la publicación');
    res.send({
      status: 'error',
      statusCode: 400,
      message: ' El sistema no pudo registrar la publicación ' + error.toString(),
      token: tok
    });
  }
}
export async function publicacionesComments(req, res) {
  try {
    let {
      comunicate,
      reference,
      id_usuario,
      ano_lectivo,
      id_institucion
    } = req.body;
    let tok = "";
    if (typeof reference != undefined && reference != "") {
      let idEncriptado = reference;
      reference = parseInt(token.decriptar(reference));
      let query = {
        text: `
                    INSERT INTO data.aepublicaciones_comentarios
                    (aepublicacionescomentarios_id, aepublicaciones_id, aeusu_id, aepublicacionescomentarios_fecha, aepublicacionescomentarios_descripcion, aepublicacionescomentarios_estado)
                    VALUES (
                        (SELECT COALESCE(MAX(aepublicacionescomentarios_id)+1, 1) FROM data.aepublicaciones_comentarios), 
                        $1, $2, current_timestamp, $3, 1
                    ) RETURNING aepublicacionescomentarios_id;`,
        values: [reference, id_usuario, comunicate]
      };
      let avisado = await Db.query(query);
      console.log('La insercion: ', avisado);
      let avisadoEnc = await token.createtoken(avisado.rows[0]);
      let query2 = {
        text: `
                    SELECT * FROM engine.contacto_user(
                        -- CONSULTAR LOS ID DE TODOS LOS QUE RECIBEN UN COMUNICADO DE UNA PUBLICACION
                            (SELECT 
                            CASE WHEN (aepublicaciones_estudiantesid IS NULL) THEN 
                                    (SELECT array_agg(e.aeusu_id)
                                    FROM data.aeestudiantes e
                                    WHERE e.aeestudiantes_grupo = ANY (a.aepublicaciones_grupo)) 		
                                ELSE 
                                    (SELECT array_agg(e.aeusu_id)
                                    FROM data.aeestudiantes e
                                    WHERE e.aeestudiantes_id = ANY (a.aepublicaciones_estudiantesid) ) 
                            END AS aeusu_id
                            FROM data.aepublicaciones a
                            WHERE a.aepublicaciones_id = $1
                            )
                        );`,
        values: [reference]
      };
      let resp = await Db.query(query2);
      let totalMessages = 0,
        totalPush = 0;
      let destUsu = [],
        destNames = [],
        destMail = [],
        destToken = [];
      let elBotonComunicado = generateButton.boton({
        type: 'success',
        shape: 'square',
        destination: 'view_post/' + idEncriptado,
        text: ' Ver post '
      });
      resp.rows.map(contacto => {
        let losMails = '',
          elToken = null;
        console.log('Los contactos: ', contacto);
        if (contacto.aeacademicos_correo.indexOf('@') >= 0) {
          //losMails = contacto.aeacademicos_correo
          losMails += contacto.aeacademicos_correo.indexOf('@') >= 0 ? ',' + contacto.aeacademicos_correo : '';
          destMail.push(losMails); //

          destNames.push(contacto.aeacademicos_nombre);
          destUsu.push(contacto.aeusu_id);
          destToken.push(contacto.aeacademicos_token);
        }
      });
      let payload = {
        notification: {
          title: 'Nuevo comentario',
          body: comunicate.replace(/<\/?[^>]+>/ig, " ").substring(0, 30),
          extra: elBotonComunicado
        },
        data: {
          route: 'notification?referencia=publicaciones',
          index: reference.toString()
        }
      };
      if (destUsu.length > 0) {
        let notificacionQuery = {
          text: `INSERT INTO data.aenotificaciones(
                            aenotificaciones_id, aenotificaciones_de, aenotificaciones_para, aenotificaciones_fecha, 
                            aenotificaciones_title, aenotificaciones_body, aenotificaciones_ruta, aenotificaciones_referencia, aenotificaciones_data)
                            VALUES ((SELECT COALESCE(MAX(aenotificaciones_id)+1, 1) FROM data.aenotificaciones), $1, $2, current_timestamp, $3, $4, $5, $6, $7) RETURNING aenotificaciones_id`,
          values: [id_usuario, destUsu, payload.notification.title, payload.notification.body, 'data.aepublicaciones_comentarios', avisado.rows[0].aepublicaciones_id, payload.data]
        };
        let respnotificacionQuery = await Db.query(notificacionQuery);

        // totalPush = await generatePush.pushSendMessage({ name: destNames, tokens: destToken, message: payload })

        totalMessages = await generate.send({
          name: destNames,
          email: destMail,
          message: {
            titulo: payload.notification.title,
            message: payload.notification.body,
            extra: payload.notification.extra
          }
        });
      }
      let tok = await token.createtoken(totalPush);
      res.send({
        status: 'success',
        statusCode: 200,
        message: totalMessages + ' Respuesta enviada, ' + totalMessages,
        token: tok
      });
    } else {
      let tok = await token.createtoken('El comunicado que intenta comentar no esta disponible');
      res.send({
        status: 'error',
        statusCode: 200,
        message: 'El comunicado que intenta comentar no esta disponible',
        token: tok
      });
    }
  } catch (error) {
    console.log(error);
    let tok = await token.createtoken('El sistema no esta disponible');
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'El sistema no esta disponible',
      token: tok
    });
  }
}
export async function listAllPublicaciones(req, res) {
  try {
    let {
      id_usuario,
      ano_lectivo,
      id_institucion,
      rol
    } = req.body;
    let query = {};
    let iconos = ['img/icons/android-chrome-512x512.png', 'img/icons/biblia.png', 'img/icons/vitral.png', 'img/icons/cruzar.png', 'img/icons/iglesia.png'];
    switch (parseInt(rol)) {
      case 1:
        ano_lectivo = parseInt(ano_lectivo);
        id_institucion = parseInt(id_institucion);
        query = {
          text: queryes.publicacionesList
        };
        break;
      case 4:
        ano_lectivo = parseInt(ano_lectivo);
        id_institucion = parseInt(id_institucion);
        query = {
          text: queryes.publicacionesList
        };
        break;
      default:
        id_usuario = parseInt(id_usuario);
        query = {
          text: queryes.publicacionesList
        };
        break;
    }
    let resp = await Db.query(query);
    resp.rows.map((item, i) => {
      resp.rows[i].aepublicaciones_id = token.encriptar(item.aepublicaciones_id);
      resp.rows[i].icono = iconos[parseInt(item.aepublicacionestipo_id || 0)];
    });
    // console.log('la lista de notificaciones: ', resp.rows)

    let tok = await token.createtoken(resp.rows);
    res.send({
      status: 'success',
      statusCode: 200,
      message: ' Publicaciones recibidas',
      token: tok
    });
  } catch (error) {
    let tok = await token.createtoken('No se encontraron resultados');
    res.send({
      status: 'error',
      statusCode: 400,
      message: ' No se encontraron resultados',
      token: tok
    });
  }
}
export async function listOnePublicacion(req, res) {
  try {
    let {
      id_usuario,
      ano_lectivo,
      id_institucion,
      reference
    } = req.body;
    let iconos = ['img/icons/android-chrome-512x512.png', 'img/icons/biblia.png', 'img/icons/vitral.png', 'img/icons/cruzar.png', 'img/icons/iglesia.png'];
    reference = parseInt(token.decriptar(reference));
    let resp = await Db.query({
      text: queryes.publicacionesListOne,
      values: [reference]
    });
    resp.rows.map((item, i) => {
      resp.rows[i].aepublicaciones_id = token.encriptar(item.aepublicaciones_id);
      resp.rows[i].icono = iconos[parseInt(item.aepublicacionestipo_id || 0)];
    });
    let tok = await token.createtoken(resp.rows);
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' Registros econtrados',
      token: tok
    });
  } catch (error) {
    let tok = await token.createtoken([]);
    res.send({
      status: 'error',
      statusCode: 400,
      message: ' No se encontraron registros',
      token: tok
    });
  }
}
export async function commentsPublicaciones(req, res) {
  try {
    let {
      ano_lectivo,
      id_institucion,
      rol,
      id_usuario,
      id_academico,
      reference
    } = req.body;
    if (typeof reference != undefined && reference != "") {
      reference = parseInt(token.decriptar(reference));
      ano_lectivo = parseInt(ano_lectivo);
      id_institucion = parseInt(id_institucion);
      id_academico = parseInt(id_academico);
      id_usuario = parseInt(id_usuario);
      let query = {};
      switch (parseInt(rol)) {
        case 1:
        case 2:
          query = {
            text: queryes.publicacionesViewComments,
            values: [reference]
          };
          break;
        case 3:
        case 6:
        default:
          query = {
            text: queryes.publicacionesViewCommentsStudent,
            values: [reference, id_usuario]
          };
          break;
      }
      let resp = await Db.query(query);
      console.log('Consulta comentarios: ', query);
      let tok = await token.createtoken(resp.rows);
      res.send({
        status: 'success',
        statusCode: 200,
        message: resp.rows.length + ' Comentarios ',
        token: tok
      });
    } else {
      let tok = await token.createtoken('No es posible ver el comunicado');
      res.send({
        status: 'error',
        statusCode: 200,
        message: ' No es posible ver el comunicado ',
        token: tok
      });
    }
  } catch (error) {
    let tok = await token.createtoken('El sistema presenta inconvenientes inesperados');
    res.send({
      status: 'error',
      statusCode: 200,
      message: ' El sistema presenta inconvenientes inesperados ',
      token: tok
    });
  }
}
export async function publicacionesDelete(req, res) {
  try {
    let {
      reference,
      id_usuario,
      ano_lectivo,
      id_institucion
    } = req.body;
    if (typeof reference != undefined && reference != "") {
      reference = parseInt(token.decriptar(reference));
      id_usuario = parseInt(id_usuario);
      await Db.query({
        text: queryes.publicacionDelete,
        values: [reference]
      }).then(async deleted => {
        if (deleted.rowCount > 0) {
          let tok = await token.createtoken({
            state: true,
            message: 'Comunicado eliminado!'
          });
          res.send({
            status: 'success',
            statusCode: 200,
            message: ' Publicación eliminada',
            token: tok
          });
        } else {
          let tok = await token.createtoken({
            state: false,
            message: 'No fue posible eliminar la publicación! ¿Es usted el creador de la publicación?'
          });
          res.send({
            status: 'error',
            statusCode: 200,
            message: 'No fue posible eliminar la publicación! ¿Es usted el creador de la publicación?',
            token: tok
          });
        }
      }).catch(async error => {
        let tok = await token.createtoken({
          state: false,
          message: 'Ocurrio un error eliminando la publicación, cierre sesion e intente nuevamente'
        });
        res.send({
          status: 'error',
          statusCode: 200,
          message: ' Ocurrio un error eliminando la publicación, cierre sesion e intente nuevamente',
          token: tok
        });
      });
    } else {
      let tok = await token.createtoken('Publicación no valida!');
      res.send({
        status: 'success',
        statusCode: 200,
        message: totalMessages + ' Publicación no valida',
        token: tok
      });
    }
  } catch (error) {
    console.log(error);
    let tok = await token.createtoken({
      state: false,
      message: 'Ocurrio un error eliminando la publicación, cierre sesion e intente nuevamente'
    });
    res.send({
      status: 'error',
      statusCode: 200,
      message: ' Ocurrio un error eliminando la publicación, cierre sesion e intente nuevamente',
      token: tok
    });
  }
}
export default {
  Publicaciones: Publicaciones,
  publicacionesComments: publicacionesComments,
  listAllPublicaciones: listAllPublicaciones,
  listOnePublicacion: listOnePublicacion,
  commentsPublicaciones: commentsPublicaciones,
  publicacionesDelete: publicacionesDelete
};
