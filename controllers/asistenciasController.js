import Db from "../database/conex.js";
import path from "path";
import token from "../utils/token.js";
import queryes from "../sql/asistencias.js";
import consultasAcademicas from "../sql/academics.js";
import generateButton from "../utils/buttons.js";
import * as __mod0 from "../utils/passworGenearte.js";
import alerta from "../utils/notifications/mail/alerta.js";
import fs from "fs";
import util from "util";
import wpSender from "../utils/notifications/whatsapp/wpRomote.js";
import wpQueryes from "../sql/whatsapp.js";
import * as __mod1 from "whatsapp-web.js";
import moment from "moment-timezone";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
import { fileURLToPath } from "url";
const __dirname = fileURLToPath(new URL(".", import.meta.url));
require('dotenv').config();
const {
  generate
} = __mod0;
const {
  MessageMedia
} = __mod1;
// const { MessageMedia } = require('whatsapp-web.js');

//const { resolve } = require('path/posix');
moment.tz.setDefault("America/Bogota");
//const ahora = moment().format('YYYY-MM-DD HH:mm:ss');
const ahora = moment().format();
export async function listTipoNovedad(req, res) {
  try {
    if (req.user.usuarioId) {
      // console.log('encriptando el cero: ', token.encriptar('0'))

      let resp = await Db.query(queryes.listTipoNovedad);
      resp.rows.map((item, i) => {
        resp.rows[i].idtiponovedad = token.encriptar(item.idtiponovedad.toString());
      });
      res.send({
        status: 'success',
        statusCode: 200,
        message: resp.rows.length + ' Consultas ',
        rows: resp.rows
      });
    } else {
      res.send({
        status: 'error',
        statusCode: 400,
        message: ' El sistema no puede encontrar lo que busca',
        rows: []
      });
    }
  } catch (error) {
    console.log('listTipoexcusas catch: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: ' El sistema experimenta errores inesperados ',
      rows: []
    });
  }
}
export async function listStudentsGroup(req, res) {
  let {
    id_academico,
    rol,
    group,
    header
  } = req.body;
  let id_institucion = parseInt(token.decriptar(req.user.usuarioEmpresaId));
  let ano_lectivo = parseInt(token.decriptar(req.user.usuarioAnoId));
  header = typeof header != "undefined" && header != 'false' ? true : false;
  // console.log('Header: ', header, id_institucion, ano_lectivo)

  try {
    let toditos = [],
      toditosUsuarios = [];
    let resp = await Db.query({
      text: queryes.listStudents,
      values: [id_institucion, ano_lectivo, group]
    });
    if (resp.rows.length > 0) {
      resp.rows.forEach((item, i) => {
        resp.rows[i].idestudiante = token.encriptar(item.idestudiante);
        resp.rows[i].idusuario = token.encriptar(item.idusuario);
      });

      //IF header is true ADD 'Todos' TO RESPONSE GROUP LIST 
      //let resul = (resp.rows.length > 0)? [{aeestudiantes_id:,aeestudiantes_nombre:'Todos'}] : [{}] ;
      if (header) {
        resp.rows.forEach(item => {
          toditos.push(item.idestudiante);
          toditosUsuarios.push(item.idusuario);
        });
        resp.rows.unshift({
          aeestudiantes_id: toditos,
          aeusu_id: toditosUsuarios,
          aeestudiantes_nombre: 'Todos'
        });
      }
    }
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' Estudiantes encontrados ',
      rows: resp.rows
    });
  } catch (error) {
    console.log(error.toString());
    res.send({
      status: 'error',
      statusCode: 400,
      message: ' El sistema presenta un error inesperado ',
      rows: []
    });
  }
}
export async function listExcusesXGroupDate(req, res) {
  try {
    let {
      fecha,
      rol,
      group
    } = req.body;
    console.log('Ingresando a la lista de excusas: ');
    let id_institucion = parseInt(token.decriptar(req.user.usuarioEmpresaId));
    let ano_lectivo = parseInt(token.decriptar(req.user.usuarioAnoId));
    if (fecha && group && ano_lectivo && id_institucion) {
      let resp = await Db.query({
        text: queryes.listExcusasDate,
        values: [ano_lectivo, id_institucion, group, fecha]
      });
      console.log('listExcusesXGroupDate; ', [ano_lectivo, id_institucion, group, fecha]);
      resp.rows.map((item, i) => {
        resp.rows[i].idexcusa = token.encriptar(item.idexcusa);
        resp.rows[i].idestudiante = token.encriptar(item.idestudiante);
      });
      res.send({
        status: 'success',
        statusCode: 200,
        message: resp.rows.length + ' registros encontrados',
        rows: resp.rows
      });
    } else {
      res.send({
        status: 'error',
        statusCode: 400,
        message: ' El sistema no puede determinar la identidad del usuario',
        rows: []
      });
    }
  } catch (error) {
    console.log('listExcusesXGroupDate catch: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: ' El sistema experimenta errores inesperados',
      rows: []
    });
  }
}
export async function asigmentsTeachersUnique(req, res) {
  try {
    let id_institucion = parseInt(token.decriptar(req.user.usuarioEmpresaId));
    let ano_lectivo = parseInt(token.decriptar(req.user.usuarioAnoId));
    let id_docente = parseInt(token.decriptar(req.user.academicoId));
    if (id_institucion && ano_lectivo && id_docente) {
      let resp = await Db.query({
        text: queryes.listAssigments,
        values: [id_institucion, ano_lectivo, id_docente]
      });
      res.send({
        status: 'success',
        statusCode: 200,
        message: resp.rows.length + ' registros encontrados',
        rows: resp.rows
      });
    } else {
      res.send({
        status: 'error',
        statusCode: 400,
        message: ' El sistema no puede determinar la identidad del usuario',
        rows: []
      });
    }
  } catch (error) {
    console.log('asigmentsTeachersUnique catch: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: ' El sistema experimenta errores inesperados',
      rows: []
    });
  }
}
export async function getListAssigments(req, res) {
  try {
    //diasemana start with 0, in database is 1 more
    let {
      ano_lectivo,
      id_institucion,
      grupo,
      diasemana
    } = req.body;
    let query = {
      text: `SELECT  
                a.aedocentes_id, d.aedocentes_nombres || ' ' || d.aedocentes_apellidos as aedocente, 
                a.aeasignaciones_asignatura, a.aeasignaciones_enlace
                FROM data.aeasignaciones a, data.aedocentes d
                WHERE a.aeanol_id=$1
                AND a.aeinst_id=$2
                AND lower(a.aeasignaciones_grupo) LIKE lower($3)
                -- AND aeasignaciones_dia=$4
                AND a.aeasignaciones_estado=1
                AND a.aedocentes_id = d.aedocentes_id
                GROUP BY a.aedocentes_id, a.aeasignaciones_asignatura, 
                d.aedocentes_nombres || ' ' || d.aedocentes_apellidos, a.aeasignaciones_enlace
                ORDER BY a.aeasignaciones_asignatura,aedocente`,
      values: [parseInt(ano_lectivo), parseInt(id_institucion), grupo]
    };
    let resp = await Db.query(query);
    let resul = [],
      codes = [];
    resp.rows.map(item => {
      codes.push(item.aeasignaciones_asignatura.trim());
      resul.push({
        code: item.aeasignaciones_asignatura.trim(),
        label: item.aeasignaciones_asignatura.trim()
      });
    });
    if (resp.rows.length > 1) {
      resul.unshift({
        code: codes.join(','),
        label: 'Todas'
      });
    }
    //console.log('las asignaturas: ', resul)
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' asignaturas encontradas',
      token: tok
    });
  } catch (error) {
    res.status(400).send(error.toString());
  }
}
export async function saveAttendance(req, res) {
  // IN THIS caseToNotify CATH novedades WILL SEND NOTIFICATIONS TO PARENTS
  let caseToNotify = [0, 7, 8];
  let {
    fecha,
    grupo,
    asignatura,
    estudiantes,
    novedades
  } = req.body;
  let id_institucion = parseInt(token.decriptar(req.user.usuarioEmpresaId));
  let ano_lectivo = parseInt(token.decriptar(req.user.usuarioAnoId));
  let id_docente = parseInt(token.decriptar(req.user.academicoId));
  let id_usuario = parseInt(token.decriptar(req.user.usuarioId));
  fecha = moment(fecha).format('YYYY-MM-DD');
  let catalogoNovedades = [];
  let badStudent = [],
    goodStudent = [],
    elCommand = ``;
  let listContactoEstudiantes = [];
  let elTipo = 1,
    elStudent = 0;
  try {
    const asistenciasQueryes = queryes;

    // NOT REPEAT ATTENDANCE: CHECKIN PREVIOUS ATTENDANCE FOR GROUP IN DATE AND TEACHER
    await Db.query({
      text: asistenciasQueryes.listSubjects,
      values: [fecha, id_docente, grupo, asignatura]
    }).then(async previos => {
      if (previos.rows.length <= 0) {
        // MAKE A LIST OF NOVEDADES TO SEND NOTIFICATIONS COMPARING WITH novedades
        await Db.query(queryes.listTipoNovedad).then(result => {
          result.rows.map((item, t) => {
            catalogoNovedades[item.idtiponovedad] = {
              id: item.idtiponovedad,
              descripcion: item.tiponovedaddescripcion
            };
          });
        });

        // FROM STUDENST ARRAY FILL OTHER ARRAYS, INSERT ATTENDANCE AND SEND NOTIFICATIONS
        estudiantes.map((item, s) => {
          elTipo = parseInt(token.decriptar(novedades[s]));
          elStudent = parseInt(token.decriptar(item));

          // INSERT SENTENCE FOR ATTENDANCE
          elCommand += `INSERT INTO data.aeasistencias(
                            aeasistencia_id, aeasistencias_docente, aeestudiantes_grupo, aeasignaciones_asignatura, 
                            aeestudiantes_id, aeasistencias_fecha, aeasistencias_fecharegistro, aeasistencias_llego, aeasistencias_estado)
                            VALUES ((SELECT COALESCE((MAX(aeasistencia_id)+1), 1)  FROM data.aeasistencias), 
                            ${id_docente}, '${grupo}', '${asignatura}', ${elStudent}, 
                            '${fecha}', CURRENT_TIMESTAMP, ${elTipo}, 1);
                        `;

          // CHECK TIPE OF NOVEDAD, FILL STUDENTS TO SEND NOTIFICATIONS
          if (caseToNotify.indexOf(elTipo) >= 0) {
            badStudent.push({
              idestudiante: elStudent,
              novedadcodigo: elTipo,
              novedaddescripcion: catalogoNovedades[elTipo].descripcion
            });
          }
        });
        // ONLY idestudiantes FROM badStudents
        let noVinieron = badStudent.map(({
          idestudiante
        }) => idestudiante);
        let asistenciasRegistradas = 0;

        // console.table(badStudent)
        // console.info('noVinieron: ', noVinieron)
        // console.info('SQL: ', elCommand)                    

        await Db.query({
          text: elCommand,
          values: []
        }).then(resp => {
          resp.map(({
            rowCount
          }) => {
            asistenciasRegistradas += parseInt(rowCount);
          });
          // console.info('inasistencias registradas: ', asistenciasRegistradas)
        });
        let botonEntrar = generateButton.boton({
          type: 'error',
          shape: 'square',
          destination: 'attendance',
          text: ' Ingresar '
        });
        let botonExcusa = generateButton.boton({
          type: 'success',
          shape: 'square',
          destination: 'excusas',
          text: ' Enviar excusa '
        });
        let contactoEstudiantes = {
          text: `SELECT * FROM engine.contacto_student_one($1, $2, $3);`,
          values: [ano_lectivo, id_institucion, noVinieron]
        };
        ////console.log('La query contactos: ', contactoEstudiantes)
        listContactoEstudiantes = await Db.query(contactoEstudiantes);

        ////console.log('Los contactos: ', listContactoEstudiantes)
        let totalMessages = 0,
          totalPush = 0;
        let destUsu = [],
          destNames = [],
          destStudent = [],
          destStudentId = [],
          destMail = [],
          destToken = [];
        let payload = {
          notification: {
            title: 'Inasistencia a clases',
            body: 'Una inasistencia fue registrada en ' + asignatura + ', ingrese a colarqui para más detalles ',
            extra: botonEntrar + ' ' + botonExcusa
          },
          data: {
            route: 'notification?referencia=inasistencias',
            index: 'inasistencias'
          }
        };
        let elText = '',
          avisados = 0;
        for (let i in listContactoEstudiantes.rows) {
          destNames.push(listContactoEstudiantes.rows[i].acudiente);
          destStudent.push(listContactoEstudiantes.rows[i].estudiante);
          destStudentId.push(listContactoEstudiantes.rows[i].aeestudiantes_id);
          destUsu.push(listContactoEstudiantes.rows[i].aeusu_id);
          destMail.push(listContactoEstudiantes.rows[i].correoestudiante); //
          destToken.push(listContactoEstudiantes.rows[i].contactos);
          let notificacionQuery = {
            text: wpQueryes.saveNotifications,
            values: [id_usuario, destUsu, ahora, payload.notification.title, payload.notification.body, 'data.aeasistencias', listContactoEstudiantes.rows[i].aeusu_id, payload.data]
          };
          let respnotificacionQuery = await Db.query(notificacionQuery);
          avisados += parseInt(respnotificacionQuery.rowCount);
        }

        //LIST DATABASE EMISOR
        await Db.query({
          text: wpQueryes.myWPSessionsExtend,
          values: [ano_lectivo, [id_institucion]]
        }).then(async elEmisor => {
          elEmisor.rows[0].emisorlist.map(async (esteEmisor, e) => {
            if (esteEmisor != null && esteEmisor != "") {
              let enlace = 'https://colarqui.edu.co';
              let preLogo = path.join(__dirname, '../', '/public/images/android-chrome-512x512.png');
              const miLogo = MessageMedia.fromFilePath(preLogo);
              destToken.map(async (preContact, p) => {
                preContact[0].map(async (contact, c) => {
                  console.log('esteEmisor - contact: ', esteEmisor, contact);
                  if (contact.length > 9) {
                    await wpSender.isRegistered({
                      emisor: esteEmisor,
                      number: contact
                    }).then(async verificado => {
                      if (verificado._serialized !== "" && verificado._serialized !== null && typeof verificado._serialized !== "undefined") {
                        console.log('id_institucion - verificado._serialized: ', id_institucion, verificado._serialized);
                        await wpSender.sendLinkOne({
                          emisor: esteEmisor,
                          sessionId: esteEmisor,
                          idcosa: id_docente,
                          idvotantes: destStudentId[p],
                          number: verificado._serialized,
                          message: `${payload.notification.title} para ${destStudent[p]} \n${payload.notification.body} \n\nMensaje enviado por el servidor de colarqui.edu.co, no lo responda, mejor ingresar a colarqui.edu.co para agregar la excusa correspondiente -> ${enlace}`,
                          type: 2,
                          image: miLogo,
                          campana: id_institucion,
                          link: enlace
                        });
                      }
                    });
                  }
                });
              });
            }
          });
        }).catch(async erroreo => {
          console.log('Error myWPSessionsExtend: ', erroreo);
        });
        totalMessages = await alerta.send({
          name: destNames,
          email: destMail,
          message: {
            titulo: payload.notification.title,
            message: payload.notification.body,
            extra: payload.notification.extra
          }
        });

        //let tok = await token.createtoken(notificacionQuery)
        ////console.log('las notificacionQuery: ', notificacionQuery);

        res.send({
          status: 'success',
          statusCode: 200,
          message: `Las ${asistenciasRegistradas} asistencias fueron registradas, ${avisados} acudientes recibirán el aviso`,
          rows: []
        });
      } else {
        res.send({
          status: 'error',
          statusCode: 400,
          message: `Ya tienes registros de asistencias en ${asignatura}, de ${grupo} en la fecha ${fecha}, Si quieres registrar esto, primero debe eliminar el registro existente`,
          token: []
        });
      }
    }).catch(async error => {
      console.log('error en el asistenciasQueryes.listSubjects: ', error);
      res.send({
        status: 'error',
        statusCode: 400,
        message: 'El sistema experimenta fallas temporalmente, por favor intenta de nuevo dentro de un rato',
        rows: []
      });
    });
  } catch (error) {
    console.log('error en el try: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'El sistema se niega tajantemente a hacer eso',
      rows: []
    });
  }
}
export async function listAttendancePersonal(req, res) {
  try {
    let {
      id_usuario,
      id_academico,
      ano_lectivo,
      id_institucion,
      grupo
    } = req.body;
    id_usuario = parseInt(id_usuario);
    id_academico = parseInt(id_academico);
    id_institucion = parseInt(id_institucion);
    ano_lectivo = parseInt(ano_lectivo);
    let inicio = moment().format('YYYY-MM-DD'); //(fechainicial!='' && fechainicial!=null)? fechainicial : moment().format('YYYY-MM-DD')
    let fin = moment().subtract(3, "months").format('YYYY-MM-DD'); //(fechafinal!='' && fechafinal!=null)? fechafinal :  moment().subtract(3, "months").format('YYYY-MM-DD')
    //FECHA LIMITE PARA LAS EXCUSAS SEGUN LA INSTITUCION DONDE ESTA EL ESTUDIANTE
    let confs = {
      text: `SELECT COALESCE(aeinstconf_excusas_limite, 1) as limiteexcusas 
                FROM data.aeinstituciones_conf 
                WHERE aeinst_id=$1 AND aeinstconf_anolectivo=$2`,
      values: [id_institucion, ano_lectivo]
    };
    let limitExcusa = await Db.query(confs);
    let query = {
      text: consultasAcademicas.listAsistenciasEstudiante,
      values: [id_academico, moment(inicio).format('YYYY-MM-DD'), moment(fin).format('YYYY-MM-DD'), parseInt(limitExcusa.rows[0].limiteexcusas)] //ano_lectivo,id_institucion,id_docente,grupo,asignatura
    };
    //console.log('consulta: ', query)

    let resp = await Db.query(query);
    //console.log('Datos: ', resp.rows)

    let tok = await token.createtoken(resp.rows);
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'asistencias',
      token: tok
    });
  } catch (error) {
    res.send(error.toString());
  }
}
export async function listAttendanceAdmin(req, res) {
  try {
    let {
      grupo,
      mode,
      mes,
      asignatura
    } = req.body;
    const id_institucion = parseInt(token.decriptar(req.user.usuarioEmpresaId));
    const ano_lectivo = parseInt(token.decriptar(req.user.usuarioAnoId));
    const id_academico = parseInt(token.decriptar(req.user.academicoId));
    let laCuery = {};
    if (asignatura === null || asignatura === "[]") {
      laCuery = {
        name: 'asistencia',
        text: consultasAcademicas.attendanceMonth,
        values: [ano_lectivo, id_institucion, grupo, mes] //ano_lectivo,id_institucion,id_docente,grupo,asignatura
      };
    } else {
      laCuery = {
        name: 'asistenciasede',
        text: consultasAcademicas.attendanceMontAssigment,
        values: [ano_lectivo, id_institucion, grupo, mes, asignatura, id_academico] //ano_lectivo,id_institucion,id_docente,grupo,asignatura
      };
    }

    //FORMULAS  OF TABLE BOTTOM
    await Db.query(laCuery).then(async results => {
      console.log('Results: ', results.rows);
      res.send({
        status: 'success',
        statusCode: 200,
        message: results.rows.length + ' Asistencias encontradas',
        rows: results.rows
      });
    }).catch(error => {
      console.log('error dB: ', error);
      res.send({
        status: 'error',
        statusCode: 400,
        message: ' Los datos no fueron encontrados, intente de nuevo mas tarde ' + error.toString(),
        rows: []
      });
    });
  } catch (error) {
    console.log('Errores en la consulta: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: ' El sistema experimenta dificultades',
      rows: []
    });
  }
}
export async function listAttendanceToXLS(req, res, next) {
  try {
    //console.log('Lo que llega: ', req)
    let {
      id_usuario,
      ano_lectivo,
      id_institucion,
      id_academico,
      group,
      mode,
      mes,
      mesnombre,
      escudo,
      nombre_sede
    } = req.query;
    let meses = {};
    id_usuario = parseInt(id_usuario);
    id_academico = parseInt(id_academico);
    id_institucion = parseInt(id_institucion);
    ano_lectivo = parseInt(ano_lectivo);
    // mesNombre=meses[mes]
    let fillEncabezado = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: {
        argb: '2C7695'
      }
    }; //bgColor: {argb: 'FFFFFF'},
    let styleEncabezado = {
      name: 'Trebuchet MS',
      size: 11,
      bold: true,
      color: {
        argb: 'FFFFFF'
      }
    };
    let styleHeading = {
      name: 'Trebuchet MS',
      size: 12,
      bold: true
    };
    let styleBorder = {
      top: {
        style: 'thin'
      },
      left: {
        style: 'thin'
      },
      bottom: {
        style: 'thin'
      },
      right: {
        style: 'thin'
      }
    };
    let InicioY = 8,
      InicioX = 0;
    let alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const book = new lotus.Workbook();
    book.creator = nombre_sede || process.env.APP_API_FRONT;
    book.lastModifiedBy = nombre_sede || process.env.APP_API_FRONT;
    book.created = moment();
    book.modified = moment();
    book.views = [{
      x: 0,
      y: 0,
      width: 1500,
      height: 20000,
      firstSheet: 0,
      activeTab: 1,
      visibility: 'visible'
    }];
    var elEscudo = book.addImage({
      filename: 'public/' + escudo,
      extension: 'png'
    });
    var elEscudoRight = book.addImage({
      filename: 'public/archivos/instituciones/logo_arquidiocesanos.png',
      extension: 'png'
    });
    let columnas = [],
      columnasNombre = [];
    columnas.push({
      'key': 'aeestudiantes_codigo'
    }, {
      'key': 'aeestudiantes_grupo'
    }, {
      'key': 'aeestudiantes_nombres'
      //'header': 'INASISTENCIAS ESTUDIANTES de '+grupo+' '+asignatura
    });
    columnasNombre = ['CODIGO', 'GRUPO', 'ESTUDIANTES '];
    for (d = 1; d <= 31; d++) {
      //ADD HEADER FOR MATCH IN XLSX TABLE
      if (d < 10) {
        columnasNombre.push('0' + d);
        columnas.push({
          'key': '0' + d
        });
      } else {
        columnas.push({
          'key': d.toString()
        });
        columnasNombre.push(d.toString());
      }
    }
    console.log('columnasNombre: ', columnas, columnasNombre);

    //FORMULAS  OF TABLE BOTTOM
    let resp = await Db.query({
      text: consultasAcademicas.attendanceMonth,
      values: [ano_lectivo, id_institucion, group, mes] //ano_lectivo,id_institucion,id_docente,grupo,asignatura
    });
    // console.log('Punto: ', resp.rows)

    var sheet = book.addWorksheet('asistencias-' + mesnombre + '-' + group);
    /****************************************************************************/
    //HEADING
    //MERGE CELLS 
    sheet.mergeCells('C2', 'G2');
    sheet.getCell('C2').font = styleHeading;
    sheet.getCell('C2').value = nombre_sede;
    sheet.mergeCells('C3', 'G3');
    sheet.getCell('C3').font = styleHeading;
    sheet.getCell('C3').value = 'Grupo ' + group;
    sheet.mergeCells('C4', 'G4');
    sheet.getCell('C4').font = styleHeading;
    sheet.getCell('C4').value = mesnombre;
    sheet.mergeCells('C5', 'G5');
    sheet.getCell('C5').font = styleHeading;
    sheet.getCell('C5').value = 'Reporte de asistencias por grupo';
    /****************************************************************************/
    sheet.addImage(elEscudo, {
      tl: {
        col: 0,
        row: 0
      },
      ext: {
        width: 130,
        height: 130
      }
    });
    sheet.addImage(elEscudoRight, {
      tl: {
        col: 7,
        row: 0
      },
      ext: {
        width: 130,
        height: 130
      }
    });
    sheet.getRow(InicioY).values = columnasNombre;
    //FORMAT AND STYLE CELLS
    sheet.getRow(InicioY).eachCell({
      includeEmpty: true
    }, function (cell) {
      sheet.getCell(cell.address).fill = fillEncabezado;
      sheet.getCell(cell.address).font = styleEncabezado;
    });
    sheet.columns = columnas;
    sheet.addRows(resp.rows);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader("Content-Disposition", "attachment; filename=Asistencia.xlsx");

    //book.commit()
    book.xlsx.write(res).then(function () {
      res.status(200).end();
      //console.log('File write done........');
    });
  } catch (error) {
    res.send(error.toString());
  }
}
export async function deleteAttendance(req, res) {
  try {
    let {
      fecha,
      grupo,
      asignatura
    } = req.body;
    let id_institucion = parseInt(token.decriptar(req.user.usuarioEmpresaId));
    let ano_lectivo = parseInt(token.decriptar(req.user.usuarioAnoId));
    let id_docente = parseInt(token.decriptar(req.user.academicoId));
    let id_usuario = parseInt(token.decriptar(req.user.usuarioId));
    fecha = moment(fecha).format('YYYY-MM-DD');
    let tok = '';
    let deleted = await Db.query({
      text: queryes.deleteAttendanceDate,
      values: [fecha, grupo, id_docente, asignatura]
    }).then(async eliminados => {
      if (eliminados.rowCount > 0) {
        res.send({
          status: 'success',
          statusCode: 200,
          message: `${eliminados.rowCount} Asistencias eliminadas para ${asignatura}, ${grupo} en la fecha ${fecha}. NO SE PUEDE DESHACER`,
          rows: []
        });
      } else {
        res.send({
          status: 'success',
          statusCode: 200,
          message: `No hubo registros a eliminar para ${asignatura}, ${grupo} en la fecha ${fecha}`,
          rows: []
        });
      }
    }).catch(async error => {
      console.log('error en el Db.query: ', error);
      res.send({
        status: 'error',
        statusCode: 400,
        message: 'El sistema esta experimentando dificultades para eliminar la asistencia, intente de nuevo más tarde',
        rows: []
      });
    });
  } catch (error) {
    console.log('error en el try: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'El sistema lo intenta, pero no ha sido posible',
      rows: []
    });
  }
}
export default {
  listTipoNovedad: listTipoNovedad,
  listStudentsGroup: listStudentsGroup,
  listExcusesXGroupDate: listExcusesXGroupDate,
  asigmentsTeachersUnique: asigmentsTeachersUnique,
  getListAssigments: getListAssigments,
  saveAttendance: saveAttendance,
  listAttendancePersonal: listAttendancePersonal,
  listAttendanceAdmin: listAttendanceAdmin,
  listAttendanceToXLS: listAttendanceToXLS,
  deleteAttendance: deleteAttendance
};
