require('dotenv').config()
const Db = require('../database/conex')
const token =  require('../utils/token')
const generateButton = require('../utils/buttons')
const {generate} = require('../utils/passworGenearte')
const queryes= require('../sql/statistical')
var moment = require('moment-timezone')
const { TokenExpiredError } = require('jsonwebtoken')
moment.tz.setDefault("America/Bogota")
const ahora = moment().format()

module.exports = {
    async teacherIngresos(req,res){
        try{
            let {fecha_inicio,fecha_fin,id_institucion,ano_lectivo} = req.body
            let registros = []
            fecha_inicio=(fecha_inicio==null || fecha_inicio==undefined)? moment().startOf('month').format('YYYY-MM-DD') : fecha_inicio;
            fecha_fin=(fecha_fin==null || fecha_fin==undefined)? moment().endOf('month').format('YYYY-MM-DD') : fecha_fin;
      
            let ingresosConsulta = {
              text:queryes.teacherIngresos,
              values:[fecha_inicio,fecha_fin,parseInt(ano_lectivo),parseInt(id_institucion)]         
            }
      
            let losIngresos = await Db.query(ingresosConsulta)
            if(losIngresos.rows.length > 0){
                losIngresos.rows.forEach((item)=>{
                    registros.push({
                        id: token.encriptar(item.aedocentes_id),
                        nombre: item.docente,
                        fecha: item.fechaingreso,
                        interacciones: item.interacciones
                    })
                });
            }
            tok = await token.createtoken(registros);
            res.status(200).send({status:'success',statusCode:200,message:losIngresos.rows.length+' Ingresos de docentes encontrados ',token:tok})      
        }catch (error) {
            //console.log(error.toString());
            res.status(400).send(error.toString());
        }
    },

    async teacherCuestionarios(req,res){
        try{
            let {fecha_inicio,fecha_fin,id_institucion,id_anolectivo} = req.body
            let registros = []
            fecha_inicio=(fecha_inicio==null || fecha_inicio==undefined)? moment().startOf('month').format('YYYY-MM-DD') : fecha_inicio;
            fecha_fin=(fecha_fin==null || fecha_fin==undefined)? moment().endOf('month').format('YYYY-MM-DD') : fecha_fin;
            let columnasCuestionarios = ``, columnasContador=0;

            let gruposConsulta = {
                text:queryes.grupos,
                values:[id_anolectivo,id_institucion]
            }
            let losGrupos = await Db.query(gruposConsulta)

            if(losGrupos.rows.length > 0){                
                columnasCuestionarios = ``
                columnasContador=0
                losGrupos.rows.forEach((item)=>{
                    columnasCuestionarios += `COUNT(CASE WHEN(a.aeestudiantes_grupo LIKE '`+item.aeestudiantes_grupo+`')THEN a.aeestudiantes_grupo ELSE NULL END) AS "`+item.aeestudiantes_grupo+`"`;
                    columnasContador++
                })
            }
      
            let cuestionariosConsulta = {
              text:`
              SELECT t.aeusu_id as id, t.aeusu_nombre as nombre,
              `+columnasCuestionarios.slice(0,-1)+`
              FROM data.inst_cue a, data.aeinstituciones i, 
                  (
                    SELECT  d.aedocentes_id, u.aeusu_id, u.aeusu_nombre, u.aeusu_nick, u.aeusu_token
                    FROM engine.aeusu u, data.inst_doce x, data.aedocentes d
                    WHERE x.aeinst_id = $4
                    AND d.aedocentes_estado = 1
                    AND u.aeusu_estado=1
                    AND x.inst_doce_estado=1
                    AND u.aeusu_id = d.aeusu_id
                    AND d.aedocentes_id = x.aedocentes_id
                  ) as t
              WHERE a.aeinst_cue_fechacreacion BETWEEN $1 AND $2
                  AND a.aeano_id = $3
                  AND a.aeusu_id=t.aeusu_id
                  AND a.aeinst_id=i.aeinst_id
              GROUP BY 
                t.aeusu_id, t.aeusu_nombre
              ORDER BY 
                t.aeusu_nombre;`,
              values:[fecha_inicio,fecha_fin,id_anolectivo,id_institucion]         
            }
      
            let losCuestionarios = await Db.query(cuestionariosConsulta)

            tok = await token.createtoken(losCuestionarios.rows);
            res.status(200).send({status:'success',statusCode:200,message:losCuestionarios.rows.length+' Ingresos encontrados ',token:tok})      
        }catch (error) {
            //console.log(error.toString());
            res.status(400).send(error.toString());
        }
    },

    async teacherTareas(req,res){
        try{
            let {fecha_inicio,fecha_fin,id_institucion,id_anolectivo} = req.body
            let registros = []
            fecha_inicio=(fecha_inicio==null || fecha_inicio==undefined)? moment().startOf('month').format('YYYY-MM-DD') : fecha_inicio;
            fecha_fin=(fecha_fin==null || fecha_fin==undefined)? moment().endOf('month').format('YYYY-MM-DD') : fecha_fin;
            let columnasTareas = ``, columnasContador=0;

            let gruposConsulta = {
                text:queryes.grupos,
                values:[id_anolectivo,id_institucion]
            }
            let losGrupos = await Db.query(gruposConsulta)

            if(losGrupos.rows.length > 0){                
                columnasTareas = ``
                columnasContador=0
                losGrupos.rows.forEach((item)=>{
                    columnasTareas += `COUNT(CASE WHEN(a.aeestudiantes_grupo LIKE '`+item.aeestudiantes_grupo+`')THEN a.aeestudiantes_grupo END) AS "`+item.aeestudiantes_grupo+`"`;
                    columnasContador++
                })
            }
      
            let tareasConsulta = {
              text:`
              SELECT t.aeusu_id as id, t.aeusu_nombre as nombre,
              `+columnasTareas.slice(0,-1)+`
                FROM data.aetar_pro a, DATA.aetar h, data.aeinstituciones i, 
                    (
                    SELECT  d.aedocentes_id, u.aeusu_id, u.aeusu_nombre, u.aeusu_nick, u.aeusu_token
                    FROM engine.aeusu u, data.inst_doce x, data.aedocentes d
                    WHERE x.aeinst_id = $4
                    AND d.aedocentes_estado = 1
                    AND u.aeusu_estado=1
                    AND x.inst_doce_estado=1
                    AND u.aeusu_id = d.aeusu_id
                    AND d.aedocentes_id = x.aedocentes_id
                    ) as t
                WHERE h.aetar_fechacreacion BETWEEN $1 AND $2
                    AND a.aeanol_id = $3
                    AND a.aeinst_id = $4
                    AND a.aedocentes_id=t.aedocentes_id
                    AND a.aetar_id=h.aetar_id
                    AND a.aeinst_id=i.aeinst_id
                GROUP BY 
                    t.aeusu_id, t.aeusu_nombre
                ORDER BY 
                    t.aeusu_nombre;`,
              values:[fecha_inicio,fecha_fin,id_anolectivo,id_institucion]         
            }
      
            let lasTareas = await Db.query(tareasConsulta)

            tok = await token.createtoken(lasTareas.rows);
            res.status(200).send({status:'success',statusCode:200,message:lasTareas.rows.length+' Registros encontrados ',token:tok})      
        }catch (error) {
            //console.log(error.toString());
            res.status(400).send(error.toString());
        }
    },

    async teacherAttendances(req,res){
        try{
            let {fecha_inicio,fecha_fin,id_institucion,ano_lectivo} = req.body
            let registros = [], lasColumnas = []
            let columnasTareas = ``, columnasContador=0;

            fecha_inicio=(fecha_inicio==null || fecha_inicio=="undefined" || fecha_inicio=="")? moment().startOf('month').format('YYYY-MM-DD') : fecha_inicio;
            fecha_fin=(fecha_fin==null || fecha_fin=="undefined" || fecha_fin=="")? moment().endOf('month').format('YYYY-MM-DD') : fecha_fin;
            ano_lectivo=(ano_lectivo==null || ano_lectivo=="undefined" || ano_lectivo=="")?  0 : parseInt(ano_lectivo);
            id_institucion=(id_institucion==null || id_institucion=="undefined" || id_institucion=="")? 0 : parseInt(id_institucion);

            let gruposConsulta = {
                text:queryes.grupos,
                values:[ano_lectivo,id_institucion]
            }
            //console.log('La consulta dinamica grupos: ', gruposConsulta)
            let losGrupos = await Db.query(gruposConsulta)
            //console.log('La resultados dinamica grupos: ', losGrupos.rows)
            if(losGrupos.rows.length > 0){                
                columnasTareas = ``
                columnasContador=0
                losGrupos.rows.forEach((item)=>{
                    lasColumnas.push(item.aeestudiantes_grupo)
                    columnasTareas += `
                    COUNT(CASE WHEN(t.aeestudiantes_grupo LIKE '`+item.aeestudiantes_grupo+`') THEN aeasistencias_fecha END) AS "`+item.aeestudiantes_grupo+`",`;
                    columnasContador++
                })
            }
      
            let asistenciasConsulta = {
              text:`
              SELECT t.aeusu_nombre AS docente, t.aeusu_nick AS mail,
              `+columnasTareas.slice(0,-1)+`
              FROM (
                    SELECT a.aeestudiantes_grupo, d.aedocentes_id, u.aeusu_nombre, u.aeusu_nick, a.aeasistencias_fecha
                    FROM data.aeasistencias a, engine.aeusu u, data.inst_doce x, data.aedocentes d
                    WHERE x.aeinst_id = `+id_institucion+`
                    AND x.aeanol_id = `+ano_lectivo+`
                    AND a.aeasistencias_fecha BETWEEN '`+fecha_inicio+`' AND '`+fecha_fin+`'
                    AND d.aedocentes_estado = 1
                    AND u.aeusu_estado=1
                    AND x.inst_doce_estado=1
                    AND u.aeusu_id = d.aeusu_id
                    AND d.aedocentes_id = x.aedocentes_id
                    AND a.aeasistencias_docente=x.aedocentes_id
                    GROUP BY d.aedocentes_id, a.aeestudiantes_grupo, u.aeusu_nombre, u.aeusu_nick, a.aeasistencias_fecha
                  ) as t
              GROUP BY 
              t.aeusu_nombre, t.aeusu_nick
              ORDER BY 
                t.aeusu_nombre;`,
              values:[]         
            }
            //console.log('La consulta dinamica asistencias: ', asistenciasConsulta)      
            let lasAsistencias = await Db.query(asistenciasConsulta)

            tok = await token.createtoken({columnas:lasColumnas,filas:lasAsistencias.rows});
            res.status(200).send({status:'success',statusCode:200,message:lasAsistencias.rows.length+' Registros encontrados ',token:tok})      
        }catch (error) {
            console.log(error.toString());
            res.status(400).send(error.toString());
        }
    },

    async studentAttendances(req,res){
        try{
            let {fecha_inicio,fecha_fin,id_institucion,ano_lectivo,grupo} = req.body
            let d = moment();
            fecha_inicio=(fecha_inicio==null || fecha_inicio=="undefined" || fecha_inicio=="")? moment().format('YYYY-MM-DD') : fecha_inicio;
            fecha_fin=(fecha_fin==null || fecha_fin=="undefined" || fecha_fin=="")? moment().subtract(7, "days").format('YYYY-MM-DD') : fecha_fin;
            ano_lectivo=(ano_lectivo==null || ano_lectivo=="undefined")?  0 : parseInt(ano_lectivo);
            id_institucion=(id_institucion==null || id_institucion=="undefined")? 0 : parseInt(id_institucion);
            grupo=(grupo==null || grupo=="undefined" || grupo=="")? '1%' : grupo;
            
            let diasAsistidos = ``, lasColumnas = [], e = 0;
            d=moment(fecha_fin)
            //console.log('Punto ciclo: '+d+' diferencia: '+(d.diff(inicio, 'days')))
            for(d=moment(fecha_fin); d.diff(fecha_inicio, 'days') >= 0; d.subtract(1, 'days')){
                lasColumnas.push(d.format('MM-DD'))
                diasAsistidos += `
                SUM(CASE WHEN(aeasistencias_fecha = '`+d.format('YYYY-MM-DD') +`')THEN (NOT aeasistencias_llego)::INTEGER ELSE NULL END) AS "`+d.format('MM-DD')+`",`;
                e++;
            }
      
            let asistenciasConsulta = {
              text:`
              SELECT t.aeusu_nombre AS estudiante, t.aeestudiantes_grupo AS grupo,
              `+diasAsistidos.slice(0,-1)+`
              FROM (
                    SELECT a.aeestudiantes_grupo, e.aeestudiantes_id, (e.aeestudiantes_apellidos || ' ' || e.aeestudiantes_nombres) as aeusu_nombre, 
                    u.aeusu_nick, a.aeasistencias_fecha, a.aeasistencias_llego
                    FROM data.aeasistencias a, engine.aeusu u, data.aeestudiantes e
                    WHERE e.aeinstitucion_id = `+id_institucion+` 
                    AND e.aeano_id = `+ano_lectivo+` 
                    AND a.aeasistencias_fecha BETWEEN '`+fecha_inicio+`' AND '`+fecha_fin+`'
                    AND a.aeestudiantes_grupo LIKE '`+grupo+`'
                    AND e.aeestudiantes_estado = 1 AND u.aeusu_estado=1 AND a.aeasistencias_estado =1 
                    AND u.aeusu_id = e.aeusu_id 
                    AND a.aeestudiantes_id = e.aeestudiantes_id
                    AND a.aeestudiantes_grupo = e.aeestudiantes_grupo
                    GROUP BY e.aeestudiantes_id, a.aeestudiantes_grupo, (e.aeestudiantes_apellidos || ' ' || e.aeestudiantes_nombres), 
                    u.aeusu_nick, a.aeasistencias_fecha, a.aeasistencias_llego
                  ) as t
              GROUP BY 
              t.aeusu_nombre, t.aeestudiantes_grupo
              ORDER BY 
                t.aeusu_nombre;`,
              values:[]         
            }
            //console.log('La estudiante dinamica asistencias: ', asistenciasConsulta)
      
            let lasAsistencias = await Db.query(asistenciasConsulta)
            //console.log('La estudiante dinamica resultados: ', lasAsistencias.rows)
            tok = await token.createtoken({columnas:lasColumnas,filas:lasAsistencias.rows});
            res.status(200).send({status:'success',statusCode:200,message:lasAsistencias.rows.length+' Registros encontrados ',token:tok})      
        }catch (error) {
            //console.log(error.toString());
            res.status(400).send(error.toString());
        }
    },

    async studentIngresos(req,res){
        try{
            let {fecha_inicio,fecha_fin,id_institucion,ano_lectivo,grupo} = req.body
            let registros = []
            fecha_inicio=(fecha_inicio==null || fecha_inicio==undefined || fecha_inicio=="")? moment().startOf('month').format('YYYY-MM-DD') : fecha_inicio;
            fecha_fin=(fecha_fin==null || fecha_fin==undefined || fecha_fin=="")? moment().endOf('month').format('YYYY-MM-DD') : fecha_fin;
            grupo=(grupo==null || grupo==undefined || grupo=="")? '1%' : grupo;

            let ingresosConsulta = {
              text:queryes.studentIngresos,
              values:[fecha_inicio,fecha_fin,parseInt(ano_lectivo),parseInt(id_institucion),grupo]         
            }

            let losIngresos = await Db.query(ingresosConsulta)
            if(losIngresos.rows.length > 0){
                losIngresos.rows.forEach((item)=>{
                    registros.push({
                        id: token.encriptar(item.aeestudiantes_id),
                        grupo: item.grupo,
                        nombre: item.estudiante,
                        fecha: item.fechaingreso,
                        interacciones: item.interacciones
                    })
                });
            }
            tok = await token.createtoken(registros);
            res.status(200).send({status:'success',statusCode:200,message:losIngresos.rows.length+' Ingresos de estudiantes encontrados ',token:tok})      
        }catch (error) {
            //console.log(error.toString());
            res.status(400).send(error.toString());
        }
    },
}