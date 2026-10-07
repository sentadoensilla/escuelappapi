import Db from "../database/conex.js";
import token from "../utils/token.js";
import queryes from "../sql/exams.js";
import queryesStats from "../sql/statistical.js";
import consultasAcademicas from "../sql/academics.js";
import generateButton from "../utils/buttons.js";
import * as __mod0 from "../utils/passworGenearte.js";
import lotus from "exceljs";
import moment from "moment-timezone";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
require('dotenv').config();
const {
  generate
} = __mod0;
//const lotus = require('../utils/exports/excel');

moment.tz.setDefault("America/Bogota");
//const ahora = moment().format('YYYY-MM-DD HH:mm:ss');
const ahora = moment().format();
export async function listAttendance(req, res, next) {
  try {
    //console.log('Lo que llega: ', req)
    let {
      id_usuario,
      ano_lectivo,
      id_institucion,
      id_docente,
      nombre_docente,
      grupo,
      asignatura,
      fechainicial,
      fechafinal,
      escudo,
      nombre_sede
    } = req.query;
    id_usuario = parseInt(id_usuario);
    id_institucion = parseInt(id_institucion);
    id_docente = parseInt(id_docente);
    ano_lectivo = parseInt(ano_lectivo);
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
    book.creator = nombre_docente || process.env.APP_API_FRONT;
    book.lastModifiedBy = nombre_docente || process.env.APP_API_FRONT;
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
    let d = moment();
    let inicio = fechainicial != '' && fechainicial != null ? fechainicial : moment().format('YYYY-MM-DD');
    let fin = fechafinal != '' && fechafinal != null ? fechafinal : moment().subtract(7, "days").format('YYYY-MM-DD');
    let columnas = [],
      columnasNombre = [];
    columnas.push({
      'key': 'aeestudiantes_codigo'
      //'header': 'CODIGO'
    }, {
      'key': 'estudiante'
      //'header': 'INASISTENCIAS ESTUDIANTES de '+grupo+' '+asignatura
    });
    columnasNombre = ['CODIGO', 'INASISTENCIAS ESTUDIANTES de ' + grupo + ' ' + asignatura];
    let diasAsistidos = ``,
      e = 0;
    d = moment(fin);
    //console.log('Punto ciclo: '+d+' diferencia: '+(d.diff(inicio, 'days')))
    for (d = moment(fin); d.diff(inicio, 'days') >= 0; d.subtract(1, 'days')) {
      columnas.push({
        'key': `asistencia${d.format('YYYYMMDD')}`
        //'header': d.format('YYYY-MM-DD')
      });
      columnasNombre.push(d.format('YYYY-MM-DD'));
      diasAsistidos += `
              SUM(CASE WHEN(aeasistencias_fecha = '` + d.format('YYYY-MM-DD') + `')THEN (NOT aeasistencias_llego)::INTEGER END)::INTEGER AS asistencia` + d.format('YYYYMMDD') + `,`;

      //ADD HEADER FOR SUM
      if (0 == parseInt(d.diff(inicio, 'days'))) {
        columnasNombre.push('TOTAL INASISTENCIAS');
        columnasNombre.push('% INASISTENCIAS');
      }
    }
    let query = {
      text: `
                SELECT 
                  *
                FROM (
                  SELECT aeestudiantes_codigo,initcap(lower(aeestudiantes_apellidos)) || ' ' || initcap(lower(aeestudiantes_nombres)) AS ESTUDIANTE,
                  ` + diasAsistidos.slice(0, -1) + `
                  -- aeasistencias_llego
                  FROM data.aeasistencias a, data.aeestudiantes e
                  WHERE a.aeasistencias_docente = ` + id_docente + `
                    AND a.aeasignaciones_asignatura = '` + asignatura + `'
                    AND a.aeasistencias_fecha BETWEEN '` + inicio + `' AND '` + fin + `'
                    AND a.aeestudiantes_grupo = '` + grupo + `'
                    AND e.aeestudiantes_estado = 1
                    AND e.aeestudiantes_id=a.aeestudiantes_id
                  GROUP BY aeestudiantes_codigo,initcap(lower(aeestudiantes_apellidos)) || ' ' || initcap(lower(aeestudiantes_nombres))
                  ORDER BY ESTUDIANTE) u;`,
      values: [] //ano_lectivo,id_institucion,id_docente,grupo,asignatura
    };
    //console.log('consulta: ', query)

    //FORMULAS  OF TABLE BOTTOM
    let resp = await Db.query(query);
    console.log('Punto: ', resp.rows);
    var sheet = book.addWorksheet('inasistencias-' + grupo);
    /****************************************************************************/
    //HEADING
    //MERGE CELLS 
    sheet.mergeCells('C2', 'G2');
    sheet.getCell('C2').font = styleHeading;
    sheet.getCell('C2').value = nombre_sede;
    sheet.mergeCells('C3', 'G3');
    sheet.getCell('C3').font = styleHeading;
    sheet.getCell('C3').value = asignatura + ' - ' + grupo;
    sheet.mergeCells('C4', 'G4');
    sheet.getCell('C4').font = styleHeading;
    sheet.getCell('C4').value = nombre_docente;
    sheet.mergeCells('C5', 'G5');
    sheet.getCell('C5').font = styleHeading;
    sheet.getCell('C5').value = 'Reporte de inasistencias';
    sheet.mergeCells('C6', 'G6');
    sheet.getCell('C6').font = styleHeading;
    sheet.getCell('C6').value = 'Reporte desde ' + fechainicial + ' hasta ' + fechafinal;
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

    //ITERATE EACH ROW TO SHOW HEADER AND CALCULATE RESULT
    d = moment(fin);
    InicioCol = 2;
    for (r = 0; r < resp.rows.length; r++) {
      rowInit = r + (InicioY + 1);
      rowEnd = resp.rows.length + (InicioY + 1);
      formulaFrom = sheet.getRow(rowInit).getCell(InicioCol + 1).address;
      formulaTo = sheet.getRow(rowInit).getCell(d.diff(inicio, 'days') + InicioCol + 1).address;
      formulaCell = sheet.getRow(rowInit).getCell(d.diff(inicio, 'days') + InicioCol + 2).address;

      //THE RESULT SHOULD BE CALCULATED BECAUSE exceljs DO NOT 
      let o = 0,
        e = 0;
      let inasistencias = 0;
      //TOTALIZE UNATTEND NOT OF NULL
      for (item in resp.rows[r]) {
        if (o++ > 1) {
          if (resp.rows[r][item] != null) {
            inasistencias += parseInt(resp.rows[r][item]);
            e++; // GETTIN DAYS WITH ATTENDANCE REGISTRY
          }
        }
      }
      //LEAVE ONE AND TWO COLUMN: ID AND NAME FOR STUDENT
      o = o - 2;
      //console.log('las sumatorias inasistencias: ', inasistencias)
      //console.log('las cantidad de dias: ', e)

      //TOTALCELL = SUM(INITCELL : ENDCELL)
      sheet.getCell(sheet.getRow(rowInit).getCell(d.diff(inicio, 'days') + InicioCol + 2).address).value = {
        formula: "=SUM(" + formulaFrom + ":" + formulaTo + ")",
        result: inasistencias
      };
      //% = (INASISTENCIAS / TOTALDIAS)
      sheet.getCell(sheet.getRow(rowInit).getCell(d.diff(inicio, 'days') + InicioCol + 3).address).numFmt = '0.00%';
      sheet.getCell(sheet.getRow(rowInit).getCell(d.diff(inicio, 'days') + InicioCol + 3).address).value = {
        formula: "=" + formulaCell + "/" + e + ")",
        result: inasistencias / e
      };
    }
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
export async function listAttendanceAdmin(req, res, next) {
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
export async function teacherAttendances(req, res, next) {
  try {
    let {
      fecha_inicio,
      fecha_fin,
      id_institucion,
      ano_lectivo,
      nombre_docente,
      escudo,
      nombre_sede
    } = req.query;
    let columnas = [],
      columnasNombre = [];
    fecha_inicio = fecha_inicio == null || fecha_inicio == "undefined" || fecha_inicio == "" ? moment().startOf('month').format('YYYY-MM-DD') : fecha_inicio;
    fecha_fin = fecha_fin == null || fecha_fin == "undefined" || fecha_fin == "" ? moment().endOf('month').format('YYYY-MM-DD') : fecha_fin;
    ano_lectivo = ano_lectivo == null || ano_lectivo == "undefined" || ano_lectivo == "" ? 0 : parseInt(ano_lectivo);
    id_institucion = id_institucion == null || id_institucion == "undefined" || id_institucion == "" ? 0 : parseInt(id_institucion);
    let fillEncabezado = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: {
        argb: '2C7695'
      }
    }; //bgColor: {argb: 'FFFFFF'},
    let fillEncabezadoTotal = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: {
        argb: 'DA4453'
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
    let InicioCol = 3; //[1: 'DOCENTE', 2:'EMAIL', 3:FROM HERE] THIS IS CELL INDEX FROM DATA FOR FORMULA
    let alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const book = new lotus.Workbook();
    book.creator = nombre_docente || process.env.APP_API_FRONT;
    book.lastModifiedBy = nombre_docente || process.env.APP_API_FRONT;
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
    let registros = [],
      lasColumnas = [];
    let columnasTareas = ``,
      columnasContador = 0;
    columnas.push({
      'key': 'docente'
    }, {
      'key': 'mail'
    });
    columnasNombre = ['DOCENTE', 'EMAIL'];
    let gruposConsulta = {
      text: queryesStats.grupos,
      values: [ano_lectivo, id_institucion]
    };
    //console.log('La consulta dinamica grupos: ', gruposConsulta)
    let losGrupos = await Db.query(gruposConsulta);
    //console.log('La resultados dinamica grupos: ', losGrupos.rows)
    if (losGrupos.rows.length > 0) {
      columnasTareas = ``;
      columnasContador = 0;
      losGrupos.rows.forEach(item => {
        columnas.push({
          'key': item.aeestudiantes_grupo
        });
        registros.push(item.aeestudiantes_grupo);
        columnasNombre.push(item.aeestudiantes_grupo);
        columnasTareas += `
            COUNT(CASE WHEN(t.aeestudiantes_grupo LIKE '` + item.aeestudiantes_grupo + `') THEN aeasistencias_fecha END)::integer AS "` + item.aeestudiantes_grupo + `",`;
        columnasContador++;
      });
      //ADD HEADER FOR SUM
      if (losGrupos.rows.length == columnasContador) {
        columnasNombre.push('TOTAL REGISTROS');
      }
    }
    let asistenciasConsulta = {
      text: `
          SELECT t.aeusu_nombre AS docente, t.aeusu_nick AS mail,
          ` + columnasTareas.slice(0, -1) + `
          FROM (
                SELECT a.aeestudiantes_grupo, d.aedocentes_id, u.aeusu_nombre, u.aeusu_nick, a.aeasistencias_fecha
                FROM data.aeasistencias a, engine.aeusu u, data.inst_doce x, data.aedocentes d
                WHERE x.aeinst_id = ` + id_institucion + `
                AND x.aeanol_id = ` + ano_lectivo + `
                AND a.aeasistencias_fecha BETWEEN '` + fecha_inicio + `' AND '` + fecha_fin + `'
                AND d.aedocentes_estado = 1 AND u.aeusu_estado=1 AND x.inst_doce_estado=1
                AND u.aeusu_id = d.aeusu_id
                AND d.aedocentes_id = x.aedocentes_id
                AND a.aeasistencias_docente=x.aedocentes_id
                GROUP BY d.aedocentes_id, a.aeestudiantes_grupo, u.aeusu_nombre, u.aeusu_nick, a.aeasistencias_fecha
              ) as t
          GROUP BY 
            t.aeusu_nombre, t.aeusu_nick
          ORDER BY 
            t.aeusu_nombre;`,
      values: []
    };
    let lasAsistencias = await Db.query(asistenciasConsulta);
    //console.log('La rows dinamica asistencias: ', lasAsistencias.rows)
    var sheet = book.addWorksheet('ASISTENCIA-DOCENTE');
    /****************************************************************************/
    //HEADING
    //MERGE CELLS 
    sheet.mergeCells('C2', 'G2');
    sheet.getCell('C2').font = styleHeading;
    sheet.getCell('C2').value = 'Registro de asistencias por docente';
    sheet.mergeCells('C3', 'G3');
    sheet.getCell('C3').font = styleHeading;
    sheet.getCell('C3').value = nombre_sede;
    sheet.mergeCells('C5', 'G5');
    sheet.getCell('C5').font = styleHeading;
    sheet.getCell('C5').value = 'Generado por: ' + nombre_docente;
    sheet.mergeCells('C6', 'G6');
    sheet.getCell('C6').font = styleHeading;
    sheet.getCell('C6').value = 'Reporte desde ' + fecha_inicio + ' hasta ' + fecha_fin;
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
    sheet.addRows(lasAsistencias.rows);

    //ITERATE EACH ROW TO SHOW HEADER AND CALCULATE RESULT
    for (r = 0; r < lasAsistencias.rows.length; r++) {
      rowInit = r + (InicioY + 1);
      rowEnd = lasAsistencias.rows.length + (InicioY + 2);
      formulaFrom = sheet.getRow(rowInit).getCell(InicioCol).address;
      formulaTo = sheet.getRow(rowInit).getCell(columnasContador + InicioCol - 1).address;
      formulaCell = sheet.getRow(rowInit).getCell(columnasContador + InicioCol).address;

      //THE RESULT SHOULD BE CALCULATED BECAUSE exceljs DO NOT 
      let o = 0,
        e = 0;
      //TOTALIZE REGISTERS
      let inasistencias = 0;
      registros.forEach(function (key) {
        inasistencias += parseInt(lasAsistencias.rows[r][key.toString()]);
      });
      //console.log('Las inasistencias acumuladas: ', inasistencias)
      //LEAVE ONE AND TWO COLUMN: ID AND NAME FOR STUDENT
      o = o - InicioCol;
      //console.log('las sumatorias inasistencias: ', inasistencias)
      //console.log('las cantidad de dias: ', e)

      //TOTALCELL = SUM(INITCELL : ENDCELL)
      sheet.getCell(sheet.getRow(rowInit).getCell(columnasContador + InicioCol).address).value = {
        formula: "=SUM(" + formulaFrom + ":" + formulaTo + ")",
        result: inasistencias
      };
    }
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader("Content-Disposition", "attachment; filename=AsistenciaDocente.xlsx");

    //book.commit()
    book.xlsx.write(res).then(function () {
      res.status(200).end();
      //console.log('File write done........');
    });
  } catch (error) {
    res.send(error.toString());
  }
}
export async function studentAttendances(req, res, next) {
  try {
    let {
      fecha_inicio,
      fecha_fin,
      id_institucion,
      ano_lectivo,
      grupo,
      nombre_docente,
      escudo,
      nombre_sede
    } = req.query;
    let d = moment(),
      columnas = [],
      columnasNombre = [];
    fecha_inicio = fecha_inicio == null || fecha_inicio == "undefined" || fecha_inicio == "" ? moment().format('YYYY-MM-DD') : fecha_inicio;
    fecha_fin = fecha_fin == null || fecha_fin == "undefined" || fecha_fin == "" ? moment().subtract(7, "days").format('YYYY-MM-DD') : fecha_fin;
    ano_lectivo = ano_lectivo == null || ano_lectivo == "undefined" ? 0 : parseInt(ano_lectivo);
    id_institucion = id_institucion == null || id_institucion == "undefined" ? 0 : parseInt(id_institucion);
    grupo = grupo == null || grupo == "undefined" || grupo == "" ? '1%' : grupo;
    let fillEncabezado = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: {
        argb: '2C7695'
      }
    }; //bgColor: {argb: 'FFFFFF'},
    let fillEncabezadoTotal = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: {
        argb: 'DA4453'
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
    let InicioCol = 3; //[1: 'GRUPO', 2:'ESTUDIANTE', 3:FROM HERE] THIS IS CELL INDEX FROM DATA FOR FORMULA

    const book = new lotus.Workbook();
    book.creator = nombre_docente || process.env.APP_API_FRONT;
    book.lastModifiedBy = nombre_docente || process.env.APP_API_FRONT;
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
    let registros = [],
      lasColumnas = [];
    let columnasTareas = ``,
      columnasContador = 0;
    columnas.push({
      'key': 'grupo'
    }, {
      'key': 'estudiante'
    });
    columnasNombre = ['GRUPO', 'ESTUDIANTE'];
    let diasAsistidos = ``,
      e = 0;
    d = moment(fecha_fin);
    //console.log('Punto ciclo: '+d+' diferencia: '+(d.diff(inicio, 'days')))
    for (d = moment(fecha_fin); d.diff(fecha_inicio, 'days') >= 0; d.subtract(1, 'days')) {
      columnas.push({
        'key': d.format('MM-DD').toString()
        //'header': d.format('MM-DD').toString()
      });
      registros.push(d.format('MM-DD'));
      columnasNombre.push(d.format('MM-DD'));
      lasColumnas.push(d.format('MM-DD'));
      diasAsistidos += `
          SUM(CASE WHEN(aeasistencias_fecha = '` + d.format('YYYY-MM-DD') + `')THEN (NOT aeasistencias_llego)::INTEGER ELSE NULL END)::INTEGER AS "` + d.format('MM-DD') + `",`;
      e++;

      //ADD HEADER FOR SUM
      if (0 == parseInt(d.diff(fecha_inicio, 'days'))) {
        columnasNombre.push('TOTAL INASISTENCIAS');
        columnasNombre.push('% INASISTENCIAS');
      }
    }
    let asistenciasConsulta = {
      text: `
        SELECT t.aeusu_nombre AS estudiante, t.aeestudiantes_grupo AS grupo,
        ` + diasAsistidos.slice(0, -1) + `
        FROM (
              SELECT a.aeestudiantes_grupo, e.aeestudiantes_id, (e.aeestudiantes_apellidos || ' ' || e.aeestudiantes_nombres) as aeusu_nombre, 
              u.aeusu_nick, a.aeasistencias_fecha, a.aeasistencias_llego
              FROM data.aeasistencias a, engine.aeusu u, engine.aeusuroll x, data.aeestudiantes e
              WHERE x.aeinst_id = ` + id_institucion + `
              AND x.aeanol_id = ` + ano_lectivo + `
              AND a.aeasistencias_fecha BETWEEN '` + fecha_inicio + `' AND '` + fecha_fin + `'
              AND a.aeestudiantes_grupo LIKE '` + grupo + `'
              AND e.aeestudiantes_estado = 1 AND u.aeusu_estado=1 AND x.aeusuroll_estado=1
              AND u.aeusu_id = e.aeusu_id
              AND x.aeusu_id = e.aeusu_id
              AND e.aeestudiantes_id = x.aeacad_referencia
              AND a.aeestudiantes_id = x.aeacad_referencia
              GROUP BY e.aeestudiantes_id, a.aeestudiantes_grupo, (e.aeestudiantes_apellidos || ' ' || e.aeestudiantes_nombres), 
              u.aeusu_nick, a.aeasistencias_fecha, a.aeasistencias_llego
            ) as t
        GROUP BY 
          t.aeusu_nombre, t.aeestudiantes_grupo
        ORDER BY 
          t.aeusu_nombre;`,
      values: []
    };
    //console.log('La estudiante dinamica asistencias: ', asistenciasConsulta)
    let lasAsistencias = await Db.query(asistenciasConsulta);
    var sheet = book.addWorksheet('ASISTENCIA-' + grupo);
    /****************************************************************************/
    //HEADING
    //MERGE CELLS 
    sheet.mergeCells('C2', 'G2');
    sheet.getCell('C2').font = styleHeading;
    sheet.getCell('C2').value = 'Registro de asistencias por grupo';
    sheet.mergeCells('C3', 'G3');
    sheet.getCell('C3').font = styleHeading;
    sheet.getCell('C3').value = nombre_sede;
    sheet.mergeCells('C4', 'G4');
    sheet.getCell('C4').font = styleHeading;
    sheet.getCell('C4').value = 'Grupo: ' + grupo;
    sheet.mergeCells('C5', 'G5');
    sheet.getCell('C5').font = styleHeading;
    sheet.getCell('C5').value = 'Generado por: ' + nombre_docente;
    sheet.mergeCells('C6', 'G6');
    sheet.getCell('C6').font = styleHeading;
    sheet.getCell('C6').value = 'Reporte desde ' + fecha_inicio + ' hasta ' + fecha_fin;
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
    sheet.addRows(lasAsistencias.rows);

    //ITERATE EACH ROW TO SHOW HEADER AND CALCULATE RESULT
    d = moment(fecha_fin);
    InicioCol = 2;

    //ITERATE EACH ROW TO SHOW HEADER AND CALCULATE RESULT
    for (r = 0; r < lasAsistencias.rows.length; r++) {
      rowInit = r + (InicioY + 1);
      rowEnd = lasAsistencias.rows.length + (InicioY + 2);
      formulaFrom = sheet.getRow(rowInit).getCell(InicioCol + 1).address;
      formulaTo = sheet.getRow(rowInit).getCell(d.diff(fecha_inicio, 'days') + InicioCol + 1).address;
      formulaCell = sheet.getRow(rowInit).getCell(d.diff(fecha_inicio, 'days') + InicioCol + 2).address;

      //THE RESULT SHOULD BE CALCULATED BECAUSE exceljs DO NOT 
      let o = 0,
        e = 0;
      let inasistencias = 0;
      //TOTALIZE UNATTEND NOT OF NULL
      for (item in lasAsistencias.rows[r]) {
        if (o++ > 1) {
          if (lasAsistencias.rows[r][item] != null) {
            inasistencias += parseInt(lasAsistencias.rows[r][item]);
            e++; // GETTIN DAYS WITH ATTENDANCE REGISTRY
          }
        }
      }

      //console.log('Las inasistencias acumuladas: ', inasistencias)
      //LEAVE ONE AND TWO COLUMN: ID AND NAME FOR STUDENT
      o = o - InicioCol;
      //console.log('las sumatorias inasistencias: ', inasistencias)
      //console.log('las cantidad de dias: ', e)

      //TOTALCELL = SUM(INITCELL : ENDCELL)
      sheet.getCell(sheet.getRow(rowInit).getCell(d.diff(fecha_inicio, 'days') + InicioCol + 2).address).value = {
        formula: "=SUM(" + formulaFrom + ":" + formulaTo + ")",
        result: inasistencias
      };
      //% = (INASISTENCIAS / TOTALDIAS)
      sheet.getCell(sheet.getRow(rowInit).getCell(d.diff(fecha_inicio, 'days') + InicioCol + 3).address).numFmt = '0.00%';
      sheet.getCell(sheet.getRow(rowInit).getCell(d.diff(fecha_inicio, 'days') + InicioCol + 3).address).value = {
        formula: "=" + formulaCell + "/" + e + ")",
        result: inasistencias / e
      };
    }
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader("Content-Disposition", "attachment; filename=AsistenciaDocente.xlsx");

    //book.commit()
    book.xlsx.write(res).then(function () {
      res.status(200).end();
      //console.log('File write done........');
    });
  } catch (error) {
    res.send(error.toString());
  }
}
export async function listAttendanceDetail(req, res, next) {
  try {
    //console.log('Lo que llega: ', req)
    let {
      id_usuario,
      ano_lectivo,
      id_institucion,
      id_docente,
      nombre_docente,
      grupo,
      asignatura,
      fechainicial,
      fechafinal,
      escudo,
      nombre_sede
    } = req.query;
    id_usuario = parseInt(id_usuario);
    id_institucion = parseInt(id_institucion);
    id_docente = parseInt(id_docente);
    ano_lectivo = parseInt(ano_lectivo);
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
    let styleTable = {
      name: 'Trebuchet MS',
      size: 10,
      color: {
        argb: '333333'
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
      InicioX = 0,
      listSpace = 2,
      rowIterate = 1,
      headHight = 7;
    let alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let d = moment();
    let inicio = fechainicial != '' && fechainicial != null ? fechainicial : moment().format('YYYY-MM-DD');
    let fin = fechafinal != '' && fechafinal != null ? fechafinal : moment().subtract(7, "days").format('YYYY-MM-DD');
    let columnas = [],
      columnasNombre = [];
    const book = new lotus.Workbook();
    book.creator = nombre_docente || process.env.APP_API_FRONT;
    book.lastModifiedBy = nombre_docente || process.env.APP_API_FRONT;
    book.created = moment();
    book.modified = moment();
    book.views = [{
      x: 0,
      y: 0,
      width: 1500,
      height: 200000,
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

    //LIST OF SHEETS BY GROUPS
    let listGrupos = await Db.query({
      text: consultasAcademicas.rowsviewGroups,
      values: [ano_lectivo, id_institucion]
    });
    //console.log('listGrupos: ', listGrupos.text)

    for (s = 0; s < listGrupos.rows.length; s++) {
      InicioY = 8;
      InicioX = 0;
      listSpace = InicioY - 2;
      rowIterate = 1;
      headHight = InicioY - 1; //CREATING SHEET FOR THIS GROUP
      let sheet = book.addWorksheet(listGrupos.rows[s].aeestudiantes_grupo);
      sheet.state = 'visible';

      //LIST OF ASSIGMENTS BY GROUPS
      let listAsigments = await Db.query({
        text: consultasAcademicas.rowsviewAsigments,
        values: [ano_lectivo, id_institucion, listGrupos.rows[s].aeestudiantes_grupo]
      });
      //console.log('listAsigments: ', listAsigments)

      for (a = 0; a < listAsigments.rows.length; a++) {
        asignatura = listAsigments.rows[a].aeasignaciones_asignatura;
        grupo = listGrupos.rows[s].aeestudiantes_grupo;
        id_docente = listAsigments.rows[a].aedocentes_id;
        nombre_docente = listAsigments.rows[a].aedocente;
        columnas = [];
        columnasNombre = [];
        columnas.push({
          'key': 'aeestudiantes_codigo'
          //'header': 'CODIGO'
        }, {
          'key': 'estudiante'
          //'header': 'INASISTENCIAS ESTUDIANTES de '+grupo+' '+asignatura
        });
        columnasNombre = ['CODIGO', 'INASISTENCIAS ESTUDIANTES de ' + grupo + ' ' + asignatura];
        let diasAsistidos = ``,
          e = 0;
        d = moment(fin);
        //console.log('Punto ciclo: '+d+' diferencia: '+(d.diff(inicio, 'days')))
        for (d = moment(fin); d.diff(inicio, 'days') >= 0; d.subtract(1, 'days')) {
          columnas.push({
            'key': `asistencia${d.format('YYYYMMDD')}`
            //'header': d.format('YYYY-MM-DD')
          });
          columnasNombre.push(d.format('YYYY-MM-DD'));
          diasAsistidos += `
                  SUM(CASE WHEN(aeasistencias_fecha = '` + d.format('YYYY-MM-DD') + `')THEN (NOT aeasistencias_llego)::INTEGER END)::INTEGER AS asistencia` + d.format('YYYYMMDD') + `,`;

          //ADD HEADER FOR SUM
          if (0 == parseInt(d.diff(inicio, 'days'))) {
            columnasNombre.push('TOTAL INASISTENCIAS');
            columnasNombre.push('% INASISTENCIAS');
          }
        }
        let query = {
          text: `
                    SELECT 
                      *
                    FROM (
                      SELECT aeestudiantes_codigo,initcap(lower(aeestudiantes_apellidos)) || ' ' || initcap(lower(aeestudiantes_nombres)) AS ESTUDIANTE,
                      ` + diasAsistidos.slice(0, -1) + `
                      -- aeasistencias_llego
                      FROM data.aeasistencias a, data.aeestudiantes e
                      WHERE a.aeasistencias_docente = ` + id_docente + `
                        AND a.aeasignaciones_asignatura = '` + asignatura + `'
                        AND a.aeasistencias_fecha BETWEEN '` + inicio + `' AND '` + fin + `'
                        AND a.aeestudiantes_grupo = '` + grupo + `'
                        AND e.aeestudiantes_estado = 1
                        AND e.aeestudiantes_id=a.aeestudiantes_id
                      GROUP BY aeestudiantes_codigo,initcap(lower(aeestudiantes_apellidos)) || ' ' || initcap(lower(aeestudiantes_nombres))
                      ORDER BY ESTUDIANTE) u;`,
          values: [] //ano_lectivo,id_institucion,id_docente,grupo,asignatura
        };
        //console.log('consulta: ', query)

        //FORMULAS  OF TABLE BOTTOM
        let resp = await Db.query(query);
        //console.log('Punto: ', resp.rows)
        /****************************************************************************/
        //HEADING
        //IMAGES
        sheet.addImage(elEscudo, {
          tl: {
            col: 0,
            row: listSpace - 2
          },
          //tl: { col: (InicioY-(headHight+1)), row: (listSpace-2) },
          ext: {
            width: 130,
            height: 130
          }
        });
        sheet.addImage(elEscudoRight, {
          tl: {
            col: headHight,
            row: listSpace - 2
          },
          ext: {
            width: 130,
            height: 130
          }
        });

        //MERGE CELLS 
        //InicioY = 8, InicioX = 0, listSpace = 2, rowIterate = 1, headHight = 7 
        sheet.mergeCells('C' + listSpace, 'G' + listSpace);
        sheet.getCell('C' + listSpace).font = styleHeading;
        sheet.getCell('C' + listSpace).border = styleBorder;
        sheet.getCell('C' + listSpace).value = nombre_sede;
        console.log('1 mergeCells C' + listSpace, 'G' + listSpace);
        sheet.mergeCells('C' + (listSpace + rowIterate), 'G' + (listSpace + rowIterate));
        sheet.getCell('C' + (listSpace + rowIterate)).font = styleHeading;
        sheet.getCell('C' + (listSpace + rowIterate)).border = styleBorder; //
        sheet.getCell('C' + (listSpace + rowIterate)).value = asignatura + ' - ' + grupo;
        console.log('2 mergeCells C' + (listSpace + rowIterate), 'G' + (listSpace + rowIterate));
        rowIterate = rowIterate + 1; //DOWN SHEET ROW

        console.log('Asignatura ', rowIterate);
        sheet.mergeCells('C' + (listSpace + rowIterate), 'G' + (listSpace + rowIterate));
        sheet.getCell('C' + (listSpace + rowIterate)).font = styleHeading;
        sheet.getCell('C' + (listSpace + rowIterate)).border = styleBorder;
        sheet.getCell('C' + (listSpace + rowIterate)).value = nombre_docente;
        console.log('3 mergeCells C' + (listSpace + rowIterate), 'G' + (listSpace + rowIterate));
        rowIterate = rowIterate + 1; //DOWN SHEET ROW

        console.log('Docente ', rowIterate);
        sheet.mergeCells('C' + (listSpace + rowIterate), 'G' + (listSpace + rowIterate));
        sheet.getCell('C' + (listSpace + rowIterate)).font = styleHeading;
        sheet.getCell('C' + (listSpace + rowIterate)).border = styleBorder;
        sheet.getCell('C' + (listSpace + rowIterate)).value = 'Reporte de inasistencias';
        console.log('4 mergeCells C' + (listSpace + rowIterate), 'G' + (listSpace + rowIterate));
        rowIterate = rowIterate + 1; //DOWN SHEET ROW
        console.log('Reporte ', rowIterate);
        sheet.mergeCells('C' + (listSpace + rowIterate), 'G' + (listSpace + rowIterate));
        sheet.getCell('C' + (listSpace + rowIterate)).font = styleHeading;
        sheet.getCell('C' + (listSpace + rowIterate)).border = styleBorder;
        sheet.getCell('C' + (listSpace + rowIterate)).value = 'Reporte desde ' + fechainicial + ' hasta ' + fechafinal;
        console.log('5 mergeCells C' + (listSpace + rowIterate), 'G' + (listSpace + rowIterate));
        rowIterate = rowIterate + 1; //DOWN SHEET ROW
        console.log('Fechas ', rowIterate);

        /****************************************************************************/
        sheet.getRow(parseInt(InicioY + rowIterate)).values = columnasNombre;
        //FORMAT AND STYLE CELLS
        sheet.getRow(parseInt(InicioY + rowIterate)).eachCell({
          includeEmpty: true
        }, function (cell) {
          sheet.getCell(cell.address).fill = fillEncabezado;
          sheet.getCell(cell.address).font = styleEncabezado;
          sheet.getCell(cell.address).border = styleBorder;
        });
        rowIterate = rowIterate + 1; //DOWN SHEET ROW styleTable
        sheet.columns = columnas;
        sheet.addRows(resp.rows);
        /*tabladatos.eachCell({includeEmpty: true}, function(cell){
          sheet.getCell(cell.address).border = styleBorder
        }) */

        console.log('resp.rows.length ', resp.rows.length);

        //ITERATE EACH ROW TO SHOW HEADER AND CALCULATE RESULT
        d = moment(fin);
        InicioCol = 2;
        for (r = 0; r < resp.rows.length; r++) {
          rowInit = r + (InicioY + rowIterate + 1);
          rowEnd = parseInt(resp.rows.length) + parseInt(InicioY) + parseInt(rowIterate) + 1;
          //console.log('rowInit ', rowIterate)
          //console.log('rowEnd ', rowEnd)

          formulaFrom = sheet.getRow(rowInit).getCell(InicioCol + 1).address;
          formulaTo = sheet.getRow(rowInit).getCell(d.diff(inicio, 'days') + InicioCol + 1).address;
          formulaCell = sheet.getRow(rowInit).getCell(d.diff(inicio, 'days') + InicioCol + 2).address;

          //THE RESULT SHOULD BE CALCULATED BECAUSE exceljs DO NOT 
          let o = 0,
            e = 0;
          let inasistencias = 0;
          //TOTALIZE UNATTEND NOT OF NULL
          for (item in resp.rows[r]) {
            if (o++ > 1) {
              if (resp.rows[r][item] != null) {
                inasistencias += parseInt(resp.rows[r][item]);
                e++; // GETTIN DAYS WITH ATTENDANCE REGISTRY
              }
            }
          }
          //LEAVE ONE AND TWO COLUMN: ID AND NAME FOR STUDENT
          o = o - 2;
          //console.log('las sumatorias inasistencias: ', inasistencias)
          //console.log('las cantidad de dias: ', e)

          //TOTALCELL = SUM(INITCELL : ENDCELL)
          sheet.getCell(sheet.getRow(rowInit).getCell(d.diff(inicio, 'days') + InicioCol + 2).address).value = {
            formula: "=SUM(" + formulaFrom + ":" + formulaTo + ")",
            result: inasistencias
          };
          //% = (INASISTENCIAS / TOTALDIAS)
          sheet.getCell(sheet.getRow(rowInit).getCell(d.diff(inicio, 'days') + InicioCol + 3).address).numFmt = '0.00%';
          sheet.getCell(sheet.getRow(rowInit).getCell(d.diff(inicio, 'days') + InicioCol + 3).address).value = {
            formula: "=" + formulaCell + "/" + e + ")",
            result: inasistencias / e
          };
        }
        //listSpace=parseInt(rowIterate+2)
        rowEnd = parseInt(resp.rows.length) + parseInt(InicioY) + parseInt(rowIterate) + 1;
        console.log('2 resp.rows.length ', resp.rows.length);
        console.log(' rowEnd ', rowEnd);
        InicioY = rowEnd + 8;
        InicioX = 0;
        listSpace = InicioY - 2;
        rowIterate = 1;
        headHight = 7;
      }
      rowIterate = parseInt(rowIterate) + parseInt(rowEnd) + parseInt(listSpace);

      //book.commit()
      //console.log('FIN listSpace ', listSpace)
      // console.log('FIN rowIterate ', rowIterate)
    }
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
  listAttendance: listAttendance,
  listAttendanceAdmin: listAttendanceAdmin,
  teacherAttendances: teacherAttendances,
  studentAttendances: studentAttendances,
  listAttendanceDetail: listAttendanceDetail,
  listAttendanceAdminAssigment: listAttendanceAdminAssigment
};
