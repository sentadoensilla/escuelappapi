import Db from "../database/conex.js";
import token from "../utils/token.js";
import queryes from "../sql/exams.js";
import consultasAcademicas from "../sql/academics.js";
import generateButton from "../utils/buttons.js";
import alerta from "../utils/notifications/mail/alerta.js";
import moment from "moment-timezone";
import * as __mod0 from "console";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
require('dotenv').config();
const {
  error
} = __mod0;
//const { resolve } = require('path/posix');
moment.tz.setDefault("America/Bogota");
//const ahora = moment().format('YYYY-MM-DD HH:mm:ss');
const ahora = moment().format();
export async function listAttendanceAdmin(req, res) {
  try {
    let {
      grupo,
      mode,
      mes
    } = req.body;
    const id_institucion = parseInt(token.decriptar(req.user.usuarioEmpresaId));
    const ano_lectivo = parseInt(token.decriptar(req.user.usuarioAnoId));

    //FORMULAS  OF TABLE BOTTOM
    await Db.query({
      text: consultasAcademicas.attendanceMonth,
      values: [ano_lectivo, id_institucion, grupo, mes] //ano_lectivo,id_institucion,id_docente,grupo,asignatura
    }).then(async results => {
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
export async function listAttendanceAdminAssigment(req, res, next) {
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
    // console.log('columnasNombre: ', columnas, columnasNombre)

    //CONSULTAMOS TODAS LAS ASIGNATURAS DE UN GRUPO Y 
    //ANIDAMOS LA ASISTENCIA DEL MES COMPLETO, POR CADA ASIGNATURA EN UN MAP
    await Db.query({
      text: consultasAcademicas.asigmentsByGroup,
      values: [ano_lectivo, id_institucion, group]
    }).then(async results => {
      let ciclo = 0;
      results.rows.map(async (elDato, r) => {
        //FORMULAS  OF TABLE BOTTOM
        await Db.query({
          text: consultasAcademicas.attendanceMonthAsignature,
          values: [ano_lectivo, id_institucion, group, mes, elDato.asignatura, elDato.aedocentes_id] //ano_lectivo,id_institucion,id_docente,grupo,asignatura
        }).then(resp => {
          // console.log('Punto: ', r, resp.rows.length, [ano_lectivo,id_institucion,group,mes,elDato.asignatura,elDato.aedocentes_id])
          //CREATE SHEET
          let sheet = book.addWorksheet(elDato.asignatura.replaceAll(' ', '_'), {
            state: 'visible'
          });
          /****************************************************************************/
          //HEADING
          //MERGE CELLS 
          sheet.mergeCells('C2', 'G2');
          sheet.getCell('C2').font = styleHeading;
          sheet.getCell('C2').value = nombre_sede;
          sheet.mergeCells('C3', 'G3');
          sheet.getCell('C3').font = styleHeading;
          sheet.getCell('C3').value = `Grupo ${group}, Asignatura: ${elDato.asignatura}, Docente:  ${elDato.docente}`;
          sheet.mergeCells('C4', 'G4');
          sheet.getCell('C4').font = styleHeading;
          sheet.getCell('C4').value = mesnombre;
          sheet.mergeCells('C5', 'G5');
          sheet.getCell('C5').font = styleHeading;
          sheet.getCell('C5').value = 'Reporte de asistencias por asignatura';
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
          sheet.state = 'visible';
          //UNA VEZ TERMINADO EL CICLO DE CONSULTAS, PODEMOS STREAMEAR
          if (r + 1 >= results.rows.length) {
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader("Content-Disposition", "attachment; filename=Asistencia.xlsx");

            //book.commit()
            book.xlsx.write(res).then(function () {
              // console.log('File write done........');
              res.status(200).end();
            }).catch(error => {
              console.err(`File: ${filename} save failed: `, error);
            });
          }
        }).catch(error => {
          console.log('Error En las consultas: ', error);
        });
      });
    }).catch(async error => {
      console.log('Error generando el excel: ', error);
    });
  } catch (error) {
    res.send(error.toString());
  }
}
export default {
  listAttendanceAdmin: listAttendanceAdmin,
  listAttendanceAdminAssigment: listAttendanceAdminAssigment
};
