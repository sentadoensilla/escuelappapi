import Db from "../database/conex.js";
import path from "path";
import token from "../utils/token.js";
import queryes from "../sql/asistencias.js";
import consultasAcademicas from "../sql/academics.js";
import xlsxStyles from "../utils/spreadSheetStyles.js";
import lotus from "exceljs";
import fs from "fs";
import util from "util";
import moment from "moment-timezone";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
require('dotenv').config();
//const { resolve } = require('path/posix');
moment.tz.setDefault("America/Bogota");
//const ahora = moment().format('YYYY-MM-DD HH:mm:ss');
const ahora = moment().format();
const meses = [{
  value: '01',
  label: 'ENERO'
}, {
  value: '02',
  label: 'FEBRERO'
}, {
  value: '03',
  label: 'MARZO'
}, {
  value: '04',
  label: 'ABRIL'
}, {
  value: '05',
  label: 'MAYO'
}, {
  value: '06',
  label: 'JUNIO'
}, {
  value: '07',
  label: 'JULIO'
}, {
  value: '08',
  label: 'AGOSTO'
}, {
  value: '09',
  label: 'SEPTIEMBRE'
}, {
  value: '10',
  label: 'OCTUBRE'
}, {
  value: '11',
  label: 'NOVIEMBRE'
}, {
  value: '12',
  label: 'DICIEMBRE'
}];
const dias = [' 01', ' 02', ' 03', ' 04', ' 05', ' 06', ' 07', ' 08', ' 09', ' 10', ' 11', ' 12', ' 13', ' 14', ' 15', ' 16', ' 17', ' 18', ' 19', ' 20', ' 21', ' 22', ' 23', ' 24', ' 25', ' 26', ' 27', ' 28', ' 29', ' 30', ' 31'];
export async function listAttendanceAdminToXLS(req, res) {
  try {
    let {
      grupo,
      mode,
      mes,
      asignatura
    } = req.body;
    let laCuery = {},
      listName = '',
      reporteNombre = 'Reporte de asistencias por grupo',
      mesnombre = meses.find(mimes => mimes.value == mes);
    let id_usuario = parseInt(token.decriptar(req.user.usuarioId));
    let id_academico = parseInt(token.decriptar(req.user.academicoId));
    let escudo = req.user.empresaEscudo;
    let nombre_sede = req.user.usuarioInstitucionNombre;
    let id_institucion = parseInt(token.decriptar(req.user.usuarioEmpresaId));
    let ano_lectivo = parseInt(token.decriptar(req.user.usuarioAnoId));
    let fillStripe = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: {
        argb: 'ffffff'
      }
    }; //bgColor: {argb: 'FFFFFF'},
    let fillStripeOdd = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: {
        argb: 'f2f2f2'
      }
    }; //bgColor: {argb: 'FFFFFF'},
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
      bold: true,
      alignment: {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true
      }
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
      InicioX = 0,
      columnWidth = 8,
      FormulaInicio = 'D',
      FormulaFin = 'AH',
      FormulaRow = {};
    let alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    // GETTING TIPO NOVEDAD TO SHOW AS TOTAL X STUDENT
    let tiponovedad = await Db.query(queryes.listTipoNovedad);
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
      key: 'codigo'
    }, {
      key: 'grupo'
    }, {
      key: 'estudiante'
    });
    columnasNombre = ['CODIGO', 'GRUPO', 'ESTUDIANTES '];
    if (asignatura === null || asignatura === "[]") {
      laCuery = {
        name: 'asistencia',
        text: consultasAcademicas.attendanceMonth,
        values: [ano_lectivo, id_institucion, grupo, mes] //ano_lectivo,id_institucion,id_docente,grupo,asignatura                    
      };
      listName = `Asistencias_${grupo}-${mes}`;
    } else {
      laCuery = {
        name: 'asistenciasede',
        text: consultasAcademicas.attendanceMontAssigment,
        values: [ano_lectivo, id_institucion, grupo, mes, asignatura, id_academico] //ano_lectivo,id_institucion,id_docente,grupo,asignatura                    
      };
      FormulaInicio = 'E';
      FormulaFin = 'AI';
      columnasNombre.push('ASIGNATURA');
      columnas.push({
        key: 'asignatura'
      });
      listName = `Asistencias_${mes}-${asignatura}-${grupo}`;
      reporteNombre = 'Reporte de asistencias por grupo y asignatura';
    }
    dias.map((dia, i) => {
      columnasNombre.push(dia);
      columnas.push({
        // header: dia,
        key: dia,
        width: dia.length < 8 ? 8 : dia.length
      });
    });
    tiponovedad.rows.map((item, i) => {
      columnasNombre.push(`${item.tiponovedadabreviatura}: ${item.tiponovedaddescripcion}`);
      columnas.push({
        // header: `${item.tiponovedadabreviatura}: ${item.tiponovedaddescripcion}`, 
        key: item.tiponovedadabreviatura,
        width: item.tiponovedadabreviatura.length + item.tiponovedaddescripcion.length < columnWidth ? columnWidth : item.tiponovedaddescripcion.length
      });
    });

    //FORMULAS  OF TABLE BOTTOM
    let resp = await Db.query(laCuery);
    var sheet = book.addWorksheet('asistencias-' + mesnombre.label + '-' + grupo);
    /****************************************************************************/
    //HEADING
    //MERGE CELLS 
    sheet.mergeCells('C2', 'G2');
    sheet.getCell('C2').font = styleHeading;
    sheet.getCell('C2').value = nombre_sede;
    sheet.mergeCells('C3', 'G3');
    sheet.getCell('C3').font = styleHeading;
    sheet.getCell('C3').value = 'Grupo ' + grupo;
    sheet.mergeCells('C4', 'G4');
    sheet.getCell('C4').font = styleHeading;
    sheet.getCell('C4').value = mesnombre.label;
    sheet.mergeCells('C5', 'G5');
    sheet.getCell('C5').font = styleHeading;
    sheet.getCell('C5').value = reporteNombre;
    sheet.mergeCells('C6', 'G6');
    sheet.getCell('C6').value = 'Generado el ' + moment().format('Do MMMM YYYY, h:mm:ss a');
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
    }, function (cell, i) {
      sheet.getCell(cell.address).fill = fillEncabezado;
      sheet.getCell(cell.address).font = styleEncabezado;
      sheet.getCell(cell.address).border = styleBorder;
    });
    sheet.columns = columnas;
    resp.rows.map((rou, r) => {
      // BUILD FORMULA USING TIPONOVEDAD TO TOTALIZE INCIDENTS
      tiponovedad.rows.map(tiponove => {
        FormulaRow[tiponove.tiponovedadabreviatura] = {
          formula: `COUNTIF(${FormulaInicio}${InicioY + r + 1}:${FormulaFin}${InicioY + r + 1},"=${tiponove.tiponovedadabreviatura}")`
        };
      });
      sheet.addRow({
        ...rou,
        ...FormulaRow
      });
      sheet.getRow(InicioY + r + 1).eachCell({
        includeEmpty: true
      }, function (cell) {
        sheet.getCell(cell.address).width = cell.value ? cell.value.length : columnWidth;
        sheet.getCell(cell.address).fill = r % 2 == 0 ? fillStripe : fillStripeOdd;
        sheet.getCell(cell.address).border = styleBorder;
      });
    });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader("Content-Disposition", "attachment; filename=Asistencia.xlsx");

    //book.commit()
    book.xlsx.write(res).then(function () {
      res.status(200).end();
      //console.log('File write done........');
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
export async function listAttendanceAdmin(req, res, next) {
  try {
    //console.log('Lo que llega: ', req)
    let {
      group,
      mode,
      mes,
      mesnombre,
      escudo,
      nombre_sede
    } = req.query;
    let meses = {};
    let id_usuario = parseInt(token.decriptar(req.user.usuarioId));
    let id_academico = parseInt(token.decriptar(req.user.academicoId));
    let id_institucion = parseInt(token.decriptar(req.user.usuarioEmpresaId));
    let ano_lectivo = parseInt(token.decriptar(req.user.usuarioAnoId));
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
      key: 'aeestudiantes_codigo'
    }, {
      key: 'aeestudiantes_grupo'
    }, {
      key: 'aeestudiantes_nombres'
      //header: 'INASISTENCIAS ESTUDIANTES de '+grupo+' '+asignatura
    });
    columnasNombre = ['CODIGO', 'GRUPO', 'ESTUDIANTES '];
    for (d = 1; d <= 31; d++) {
      //ADD HEADER FOR MATCH IN XLSX TABLE
      if (d < 10) {
        columnasNombre.push('0' + d);
        columnas.push({
          key: '0' + d
        });
      } else {
        columnas.push({
          key: d.toString()
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
export default {
  listAttendanceAdminToXLS: listAttendanceAdminToXLS,
  listAttendanceAdmin: listAttendanceAdmin
};
