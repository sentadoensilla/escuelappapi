require('dotenv').config()
const Db = require('../database/conex')

const fs = require('fs')
const path = require('path')

const token =  require('../utils/token')
const queryes= require('../sql/matricula')
const generateButton = require('../utils/buttons')
const {generate} = require('../utils/passworGenearte')
const alerta = require('../utils/notifications/mail/inscripcion')
// const pusher = require('../utils/notifications/push/firebase')

var moment = require('moment-timezone')
const { TokenExpiredError } = require('jsonwebtoken')
const { isUndefined } = require('util')
const { builtinModules } = require('module')
moment.tz.setDefault("America/Bogota")
//const ahora = moment().format('YYYY-MM-DD HH:mm:ss');
const ahora = moment().format()

module.exports = {

  /**
   * listaSedes return list of schools to parent choice
   * @param {*} req 
   * @param {*} res 
   */
  async listaSedes(req,res){       
    try{
      let {filtro} = req.body
      let sedes = []

      //console.log('Filtros: ', filtro)
      let sedesConsultas = {
        text:queryes.listaSedes,
        values:['%arquidiocesanos%',filtro.toString()||'B'] //
      }

      let previoSedes = await Db.query(sedesConsultas)
      if(previoSedes.rows.length > 0){
        previoSedes.rows.forEach((item)=>{
          let elId = item.aeinst_id.toString()
          let idano = item.idanolectivo.toString()
          sedes.push({
            id: token.encriptar(item.aeinst_id), //let elId = item.aeinst_id.toString()
            nombre: item.aeinst_nombre,
            nit: item.aeinst_nit,
            email: item.aeinst_mail,
            direccion: item.aeinst_direccion,
            telefono: item.aeinst_telefono,
            codigo: item.codigo_cg1,
            escudo: item.aeinst_escudo.replace('archivos/instituciones/institucionales/','p/i/'),
            fb: item.aeinst_facebook,
            x: item.coordx,
            y: item.coordy,
            idanolectivo: token.encriptar(item.idanolectivo), //item.idanolectivo.toString()
            anolectivo: item.anolectivo
          })
        });

        const fs = require("fs");
        let buscado = '330029943'
/*      const files = fs.readdirSync(__dirname+'/../../matriculas/TA/').filter(function(fn){
          return (fn.indexOf(buscado) >= 0)? fn : null ;
        });        
        console.log('Encontrado 0: ', files); 
        files = __dirname+'/../../matriculas/TO/'+ fs.readdirSync(__dirname+'/../../matriculas/TO/').filter(fn => fn.indexOf(buscado)>-1);        
        console.log('Encontrado 1: ', files);
        files = fs.readdirSync(__dirname+'/../../matriculas/TM/').filter(fn => path(fn)+fn.indexOf(buscado)>-1);        
        console.log('Encontrado 2: ', files);

        //console.log('12: ', token.encriptar('12'))
        //console.log('1: ', token.encriptar('76'))
        //console.log('2: ', token.encriptar('47'))
        //console.log('5: ', token.encriptar('5'))
*/

      }
      //tok = await token.createtoken(sedes);
      res.status(200).send({status:'success',statusCode:200,message:previoSedes.rows.length+' Sedes disponibles ',token:sedes})

    }catch (error) {
      //console.log(error.toString());
      res.status(400).send(error.toString());
    }
  },

  /**
   * listaGruposanguineo return list of RH and blood
   * @param {*} req 
   * @param {*} res 
   */
   async listaGruposanguineo(req,res){       
    try{
      let {filtro} = req.body
      let sangre = []

      let sangreConsultas = {
        text:queryes.listaSangre,
        values:[filtro|1]         
      }

      let previosangre = await Db.query(sangreConsultas)
      if(previosangre.rows.length > 0){
        previosangre.rows.forEach((item)=>{

          let elId = item.aegruposanguineo_id.toString()
          sangre.push({
            id: token.encriptar(elId), //item.aeinst_id, //
            descripcion: item.aegruposanguineo_descripcion
          })
        });
        //console.log('las eps: ', sangre)
      }
      //tok = await token.createtoken(sedes);
      res.status(200).send({status:'success',statusCode:200,message:previosangre.rows.length+' tipos de sangre disponibles ',token:sangre})

    }catch (error) {
      //console.log(error.toString());
      res.status(400).send(error.toString());
    }
  },

  /**
   * listaSedes return list of EPS to parent choice
   * @param {*} req 
   * @param {*} res 
   */
  async listaEPS(req,res){       
    try{
      let {indicador,ano_lectivo,id_academico,rol,group,header} = req.body
      let eps = []

      let epsConsultas = {
        text:queryes.listaEPS,
        values:['EPS',1]         
      }

      let previoeps = await Db.query(epsConsultas)
      if(previoeps.rows.length > 0){
        previoeps.rows.forEach((item)=>{

          let elId = item.aeeps_id.toString()
          eps.push({
            id: token.encriptar(elId), //item.aeinst_id, //
            nombre: item.aeeps_nombre
          })
        });
        //console.log('las eps: ', eps)
      }
      //tok = await token.createtoken(sedes);
      res.status(200).send({status:'success',statusCode:200,message:previoeps.rows.length+' eps disponibles ',token:eps})

    }catch (error) {
      //console.log(error.toString());
      res.status(400).send(error.toString());
    }
  },

  /**
   * listaGrados return list of GRADOS to parent choice
   * @param {*} req 
   * @param {*} res 
   */
   async listaGrados(req,res){       
    try{
      let {filtro} = req.body
      let grado = []

      let gradoConsultas = {
        text:queryes.listaGrados,
        values:[parseInt(filtro)|1]         
      }

      let previogrado = await Db.query(gradoConsultas)
      if(previogrado.rows.length > 0){
        previogrado.rows.forEach((item)=>{

          let elId = item.aegrados_id.toString()
          grado.push({
            id: token.encriptar(elId), //item.aeinst_id, //
            codigo: item.aegrados_codigo,
            descripcion: item.aegrados_descripcion
          })
        });
        //console.log('las eps: ', grado)
      }
      //tok = await token.createtoken(sedes);
      res.status(200).send({status:'success',statusCode:200,message:previogrado.rows.length+' grados disponibles ',token:grado})

    }catch (error) {
      //console.log(error.toString());
      res.status(400).send(error.toString());
    }
  },

  /**
   * listaPaises return list of PAISES to parent choice
   * @param {*} req 
   * @param {*} res 
   */
   async listaPaises(req,res){       
    try{
      let {filtro} = req.body
      let resultado = []

      let Consulta = {
        text:queryes.listaPaises,
        values:[filtro|1]         
      }

      let previoresultado = await Db.query(Consulta)
      if(previoresultado.rows.length > 0){
        previoresultado.rows.forEach((item)=>{

          let elId = item.aeterritorios_id.toString()
          resultado.push({
            id: token.encriptar(elId),
            codigo: item.aeterritorios_code,
            descripcion: item.aeterritorios_descripcion
          })
        });
        //console.log('las listaPaises: ', resultado)
      }
      //tok = await token.createtoken(sedes);
      res.status(200).send({status:'success',statusCode:200,message:previoresultado.rows.length+' paises disponibles ',token:resultado})

    }catch (error) {
      //console.log(error.toString());
      res.status(400).send(error.toString());
    }
  },

  /**
   * listaProvincias return list of PROVINCIAS|DEPARTAMENTOS to parent choice
   * @param {*} req 
   * @param {*} res 
   */
   async listaProvincias(req,res){       
    try{
      let {filtro,pais} = req.body
      //console.log('La pais: ', token.decriptar(pais))

      let paisFilter = (pais!="")? parseInt(token.decriptar(pais)) : 47 ;
      let resultado = []

      let Consulta = {
        text:queryes.listaProvincias,
        values:[paisFilter,parseInt(filtro)|1]         
      }
      //console.log('La consulta: ', Consulta)

      let previoresultado = await Db.query(Consulta)
      if(previoresultado.rows.length > 0){
        previoresultado.rows.forEach((item)=>{

          let elId = item.aeterritoriosprovincias_id.toString()
          resultado.push({
            id: token.encriptar(elId),
            descripcion: item.aeterritoriosprovincias_descripcion
          })
        });
        //console.log('las listaProvincias: ', resultado)
      }
      //tok = await token.createtoken(sedes);
      res.status(200).send({status:'success',statusCode:200,message:previoresultado.rows.length+' provincias disponibles ',token:resultado})

    }catch (error) {
      //console.log(error.toString());
      res.status(400).send(error.toString());
    }
  },

  /**
   * listaMupios return list of MUNICIPIOS|CIUDADES to parent choice
   * @param {*} req 
   * @param {*} res 
   */
   async listaMupios(req,res){       
    try{
      let {filtro,provincia} = req.body
      let provinciaFilter = (provincia!="")? parseInt(token.decriptar(provincia)) : 32 ;
      let resultado = []

      let Consulta = {
        text:queryes.listaMupios,
        values:[provinciaFilter,parseInt(filtro)|1]         
      }

      let previoresultado = await Db.query(Consulta)
      if(previoresultado.rows.length > 0){
        previoresultado.rows.forEach((item)=>{

          let elId = item.aeterritoriosmupios_id.toString()
          resultado.push({
            id: token.encriptar(elId),
            descripcion: item.aeterritoriosmupios_descripcion
          })
        });
        //console.log('las listaMupios: ', resultado)
      }
      //tok = await token.createtoken(sedes);
      res.status(200).send({status:'success',statusCode:200,message:previoresultado.rows.length+' Municipios disponibles ',token:resultado})

    }catch (error) {
      //console.log(error.toString());
      res.status(400).send(error.toString());
    }
  },

  /**
   * listaTipodocumento return list of TIPOS DE DOCUMENTO to parent choice
   * @param {*} req 
   * @param {*} res 
   */
   async listaParentezco(req,res){       
    try{
      let {filtro} = req.body
      let resultado = []

      let Consulta = {
        text:queryes.listaParentezco,
        values:[filtro|1]         
      }

      let previoresultado = await Db.query(Consulta)
      if(previoresultado.rows.length > 0){
        previoresultado.rows.forEach((item)=>{

          let elId = item.aeparentezco_id.toString()
          resultado.push({
            id: token.encriptar(elId),
            descripcion: item.aeparentezco_descripcion
          })
        });
        //console.log('las listaTipodocumento: ', resultado)
      }
      //tok = await token.createtoken(sedes);
      res.status(200).send({status:'success',statusCode:200,message:previoresultado.rows.length+' Parentezcos disponibles ',token:resultado})

    }catch (error) {
      //console.log(error.toString());
      res.status(400).send(error.toString());
    }
  },

  /**
   * listaTipodocumento return list of TIPOS DE DOCUMENTO to parent choice
   * @param {*} req 
   * @param {*} res 
   */
   async listaTipodocumento(req,res){       
    try{
      let {filtro} = req.body
      let resultado = []

      let Consulta = {
        text:queryes.listaTipodocumento,
        values:[filtro|1]         
      }

      let previoresultado = await Db.query(Consulta)
      if(previoresultado.rows.length > 0){
        previoresultado.rows.forEach((item)=>{

          let elId = item.aetipodocumento_id.toString()
          resultado.push({
            id: token.encriptar(elId),
            sigla: item.aetipodocumento_sigla,
            descripcion: item.aetipodocumento_descripcion
          })
        });
        //console.log('las listaTipodocumento: ', resultado)
      }
      //tok = await token.createtoken(sedes);
      res.status(200).send({status:'success',statusCode:200,message:previoresultado.rows.length+' Tipos de documento disponibles ',token:resultado})

    }catch (error) {
      //console.log(error.toString());
      res.status(400).send(error.toString());
    }
  },

  /**
   * listaTipoempresa return list of TIPOS DE DOCUMENTO to parent choice
   * @param {*} req 
   * @param {*} res 
   */
   async listaTipoempresa(req,res){       
    try{
      let {filtro} = req.body
      let resultado = []

      let Consulta = {
        text:queryes.listaTipoempresa,
        values:[filtro|1]         
      }

      let previoresultado = await Db.query(Consulta)
      if(previoresultado.rows.length > 0){
        previoresultado.rows.forEach((item)=>{

          let elId = item.aetipoempresa_id.toString()
          resultado.push({
            id: token.encriptar(elId),
            descripcion: item.aetipoempresa_descripcion
          })
        });
        //console.log('las listaTipoempresa: ', resultado)
      }
      //tok = await token.createtoken(sedes);
      res.status(200).send({status:'success',statusCode:200,message:previoresultado.rows.length+' Tipos de empresa disponibles ',token:resultado})

    }catch (error) {
      //console.log(error.toString());
      res.status(400).send(error.toString());
    }
  },

  /**
   * listaEtnias return list of ETNIAS to parent choice
   * @param {*} req 
   * @param {*} res 
   */
   async listaEtnias(req,res){       
    try{
      let {filtro} = req.body
      let resultado = []

      let Consulta = {
        text:queryes.listaEtnias,
        values:[filtro|1]         
      }

      let previoresultado = await Db.query(Consulta)
      if(previoresultado.rows.length > 0){
        previoresultado.rows.forEach((item)=>{

          let elId = item.aeetnias_id.toString()
          resultado.push({
            id: token.encriptar(elId),
            descripcion: item.aeetnias_descripcion
          })
        });
        //console.log('las listaEtnias: ', resultado)
      }
      //tok = await token.createtoken(sedes);
      res.status(200).send({status:'success',statusCode:200,message:previoresultado.rows.length+' Etnias disponibles ',token:resultado})

    }catch (error) {
      //console.log(error.toString());
      res.status(400).send(error.toString());
    }
  },

  /**
   * listaCaracter return list of CARACTER to parent choice
   * @param {*} req 
   * @param {*} res 
   */
   async listaCaracter(req,res){       
    try{
      let {filtro} = req.body
      let resultado = []

      let Consulta = {
        text:queryes.listaCaracter,
        values:[filtro|1]         
      }

      let previoresultado = await Db.query(Consulta)
      if(previoresultado.rows.length > 0){
        previoresultado.rows.forEach((item)=>{

          let elId = item.aecaracter_id.toString()
          resultado.push({
            id: token.encriptar(elId),
            descripcion: item.aecaracter_descripcion
          })
        });
        //console.log('las listaCaracter: ', resultado)
      }
      //tok = await token.createtoken(sedes);
      res.status(200).send({status:'success',statusCode:200,message:previoresultado.rows.length+' Caracter disponibles ',token:resultado})

    }catch (error) {
      //console.log(error.toString());
      res.status(400).send(error.toString());
    }
  },

  /**
   * listaConocer return list of FUENTES DE CONOCIMIENTO to parent choice
   * @param {*} req 
   * @param {*} res 
   */
   async listaConocer(req,res){       
    try{
      let {filtro} = req.body
      let resultado = []

      let Consulta = {
        text:queryes.listaConocer,
        values:[filtro|1]         
      }

      let previoresultado = await Db.query(Consulta)
      if(previoresultado.rows.length > 0){
        previoresultado.rows.forEach((item)=>{

          let elId = item.aeconocer_id.toString()
          resultado.push({
            id: token.encriptar(elId),
            descripcion: item.aeconocer_descripcion
          })
        });
        //console.log('las listaConocer: ', resultado)
      }
      //tok = await token.createtoken(sedes);
      res.status(200).send({status:'success',statusCode:200,message:previoresultado.rows.length+' como supo disponibles ',token:resultado})

    }catch (error) {
      //console.log(error.toString());
      res.status(400).send(error.toString());
    }
  },

  /**
   * listaJornada return list of jornadas to parent choice
   * @param {*} req 
   * @param {*} res 
   */
   async listaJornada(req,res){       
    try{
      let {filtro} = req.body
      let resultado = []

      let Consulta = {
        text:queryes.listaJornada,
        values:[filtro|1]         
      }

      let previoresultado = await Db.query(Consulta)
      if(previoresultado.rows.length > 0){
        previoresultado.rows.forEach((item)=>{

          let elId = item.aejornada_id.toString()
          resultado.push({
            id: token.encriptar(elId),
            descripcion: item.aejornada_descripcion
          })
        });
        //console.log('las listaJornada: ', resultado)
      }
      //tok = await token.createtoken(sedes);
      res.status(200).send({status:'success',statusCode:200,message:previoresultado.rows.length+' Discapacidades disponibles ',token:resultado})

    }catch (error) {
      //console.log(error.toString());
      res.status(400).send(error.toString());
    }
  },

  /**
   * listaDiscapacidades return list of DISCAPACIDADES to parent choice
   * @param {*} req 
   * @param {*} res 
   */
   async listaDiscapacidades(req,res){
    try{
      let {filtro} = req.body
      let resultado = []

      let Consulta = {
        text:queryes.listaDiscapacidades,
        values:[filtro|1]         
      }

      let previoresultado = await Db.query(Consulta)
      if(previoresultado.rows.length > 0){
        previoresultado.rows.forEach((item)=>{

          let elId = item.aediscapacidades_id.toString()
          resultado.push({
            id: token.encriptar(elId),
            descripcion: item.aediscapacidades_descripcion
          })
        });
        //console.log('las listaDiscapacidades: ', resultado)
      }
      //tok = await token.createtoken(sedes);
      res.status(200).send({status:'success',statusCode:200,message:previoresultado.rows.length+' Discapacidades disponibles ',token:resultado})

    }catch (error) {
      //console.log(error.toString());
      res.status(400).send(error.toString());
    }
  },

  /**
   * listarInscritos return previous data for students, put in inscription form
   * @param {*} req: grado, fechainicio, fechafin
   * @param {*} res list of student or void
   */
  async listarInscritos(req,res){
    try{
      const {ano_lectivo,id_institucion,rol,grado,fechainicial,fechafinal} = req.body
      let criterios = ``

      let inicio=(fechainicial!='' && fechainicial!=null && fechainicial!=undefined)? fechainicial : moment().format('YYYY-MM-DD') ;
      let fin=(fechafinal!='' && fechafinal!=null && fechafinal!=undefined)? fechafinal :  moment().subtract(45, "days").format('YYYY-MM-DD');
      let elgrado=(grado!='' && grado!=null && grado!= undefined)? parseInt(token.decriptar(grado)) : 1 ;
      //let elEstado=(estado!='' && estado!=null && estado!= undefined)? parseInt(token.decriptar(estado)) : 1 ;


      criterios = (criterios == ``)? ` u.aeusu_estado IS NOT NULL ` : criterios ;

      let predataEstudiante = {
        text: `SELECT row_to_json(u) as datos
        FROM (
          SELECT 
            m.aeano_id as anolectivo, m.aeinstitucion_id as sede, m.aeestudiantes_id, m.aeestudiantes_codigo, initcap(aeestudiantes_apellidos || ' ' || aeestudiantes_nombres) as estudiante,
            m.aeestudiantes_grado, m.aeestudiantes_grupo, 
            string_agg(initcap(p.aeacudientes_nombres || ' ' || p.aeacudientes_apellidos), ', ') as acudiente,
            m.aeestudiantes_mail, 
            string_agg(p.aeacudientes_mail, ', ') as aeacudientes_mail,  m.aeestudiantes_telefono, 
            string_agg(p.aeacudientes_telresidencia, ', ') as aeacudientes_telresidencia, 
            string_agg(p.aeacudientes_celpersonal, ', ') as aeacudientes_celpersonal,
            string_agg(p.aeacudientes_empresatelefono, ', ') as aeacudientes_empresatelefono, 
            e.aeestados_descripcion as estado
          FROM 
            data.aematriculas_estudiantes m, data.aematriculas_academia a, data.aematriculas_demografia d,
            data.aematriculas_acudientes p, data.estudiantes_acudientes ep, data.aeestados e
          WHERE 
            m.aeinstitucion_id=$2
            AND m.aeano_id=$1
            -- AND m.aeestudiantes_grado=$5
            AND TO_CHAR(m.aeestudiantes_fecharegistro, 'YYYY-MM-DD') BETWEEN $3 AND $4
            AND m.aeestudiantes_id=a.aeestudiantes_id
            AND m.aeestudiantes_id=d.aeestudiantes_id
            AND m.aeestudiantes_id=ep.aeestudiantes_id
            AND p.aeacudientes_id=ep.aeacudientes_id
            AND m.aeestudiantes_estado=e.aeestados_id
          GROUP BY m.aeano_id, m.aeinstitucion_id, 
          m.aeano_id, m.aeinstitucion_id, m.aeestudiantes_id, m.aeestudiantes_codigo, (aeestudiantes_apellidos || ' ' || aeestudiantes_nombres),
            m.aeestudiantes_grado, m.aeestudiantes_grupo, m.aeestudiantes_mail, e.aeestados_descripcion
        ) u;`,
        values: [parseInt(ano_lectivo),parseInt(id_institucion),inicio,fin]
      }
      //console.log('select command: ', predataEstudiante)

      let dataEstudiante = await Db.query(predataEstudiante)
      console.log('Resultados: ', dataEstudiante.rows)

      let tok = await token.createtoken(dataEstudiante.rows);
                          
      res.send({status:'success',statusCode:200,message: dataEstudiante.rows.length+' inscripciones ',token:tok}) 
    }catch(error){
      //console.log(error.toString());
      res.status(400).send(error.toString());      
    }
  },

  /**
   * buscarMuchacho return previous data for students, put in inscription form
   * @param {*} req: email or id por student
   * @param {*} res message, and mail message
   */
  async buscarMuchacho(req,res){
    try{
      const {correo,identificacion} = req.body
      let criterios = ``, resultados = []

      if(correo!= undefined && correo != ""){
        criterios += `
        u.aeusu_nick LIKE '`+correo+`'
        OR e.aeestudiantes_mail LIKE '`+correo+`'
        `
      }
      if(identificacion != "" > 0 && identificacion!= undefined){
        if(criterios != ``){
          criterios += `
          OR e.aeestudiantes_identificacion LIKE '`+identificacion+`'
          `
        }else{
          criterios += `
          e.aeestudiantes_identificacion LIKE '`+identificacion+`'
          `          
        }
      }

      criterios = (criterios == ``)? ` u.aeusu_estado IS NOT NULL ` : criterios ;

      let predataEstudiante = {
        text: `SELECT 
                  e.aeinstitucion_id as sede, 12 as anolectivo, e.aeestudiantes_identificacion as estudianteidentificacion,
                  e.aeestudiantes_mail as estudiantecorreo,  e.aeestudiantes_nombres as estudiantenombres, e.aeestudiantes_apellidos as estudianteapellidos,  
                  e.aeestudiantes_telefono as estudiantetelefono, e.aeestudiantes_fechanacimiento as estudiantenacimiento, 
                  e.aeusu_id as usuario, e.aeestudiantes_id as estudiante, a.aeacudientes_id as acudiente,
                  a.aeestudiantes_mailacudiente as acudientecorreo, a.aeestudiantes_idenacudiente as acudienteidentificacion,
                  a.aeestudiantes_nombresacudiente as acudientenombres, a.aeestudiantes_apellidosacudiente as acudienteapellidos,
                  a.aeestudiantes_telefonoacudiente as acudientetelefono, e.aeestudiantes_codigo as estudiantecodigo
              FROM 
                  data.aeestudiantes e, engine.aeusu u, engine.aeroll r, data.aeinstituciones x, engine.aeusuroll y,
                  data.aeacudientes a
              WHERE 
              ( `+criterios+` )
              -- AND u.aeusu_estado=1 AND e.aeestudiantes_estado=1 
              AND u.aeroll_id = 3 AND y.aeroll_id=3
              AND u.aeusu_id=y.aeusu_id AND e.aeestudiantes_id=y.aeacad_referencia
              AND e.aeacudientes_id=a.aeacudientes_id
              AND r.aeroll_id = u.aeroll_id AND e.aeinstitucion_id=x.aeinst_id AND e.aeusu_id=u.aeusu_id`,
        values: []
      }
      console.log('select command: ', predataEstudiante)

      let dataEstudiante = await Db.query(predataEstudiante)
      console.log('Resultados estudiantes: ', dataEstudiante.rows)

      //NOT EXIST IN aeestudiantes, THEN LOOKUP AT 
      if(dataEstudiante.rows.length <= 0){
        predataEstudiante = {
          text: `SELECT 
                    e.aeinstitucion_id as sede, 12 as anolectivo, e.aeestudiantes_identificacion as estudianteidentificacion,
                    e.aeestudiantes_mail as estudiantecorreo,  e.aeestudiantes_nombres as estudiantenombres, e.aeestudiantes_apellidos as estudianteapellidos,  
                    e.aeestudiantes_telefono as estudiantetelefono, e.aeestudiantes_fechanacimiento as estudiantenacimiento, 
                    e.aeusu_id as usuario, e.aeestudiantes_id as estudiante, a.aeacudientes_id as acudiente,
                    a.aeestudiantes_mailacudiente as acudientecorreo, a.aeestudiantes_idenacudiente as acudienteidentificacion,
                    a.aeestudiantes_nombresacudiente as acudientenombres, a.aeestudiantes_apellidosacudiente as acudienteapellidos,
                    a.aeestudiantes_telefonoacudiente as acudientetelefono, e.aeestudiantes_codigo as estudiantecodigo
                FROM 
                    data.aematriculas_estudiantes e, engine.aeusu u, engine.aeroll r, data.aeinstituciones x, engine.aeusuroll y,
                    data.aeacudientes a
                WHERE 
                ( `+criterios+` )
                -- AND u.aeusu_estado=1 AND e.aeestudiantes_estado=1 
                AND u.aeroll_id = 3 AND y.aeroll_id=3
                AND u.aeusu_id=y.aeusu_id AND e.aeestudiantes_id=y.aeacad_referencia
                AND e.aeacudientes_id=a.aeacudientes_id
                AND r.aeroll_id = u.aeroll_id AND e.aeinstitucion_id=x.aeinst_id AND e.aeusu_id=u.aeusu_id`,
          values: []
        }
        console.log('select command: ', predataEstudiante)  
        dataEstudiante = await Db.query(predataEstudiante)
        console.log('Resultados matricula: ', dataEstudiante.rows)
      }

      if(dataEstudiante.rows.length > 0){
      //FORMATING ROWS FOR 
        for(r of dataEstudiante.rows){
          resultados.push({
            sede: token.encriptar(r.sede),
            anolectivo: token.encriptar(r.anolectivo),
            estudianteidentificacion: r.estudianteidentificacion,
            estudiantecodigo: r.estudiantecodigo,
            estudiantecorreo: r.estudiantecorreo,
            estudiantenombres: r.estudiantenombres,
            estudianteapellidos: r.estudianteapellidos,
            estudiantetelefono: r.estudiantetelefono,
            estudiantenacimiento: moment(r.estudiantenacimiento).format('YYYY-MM-DD'),
            usuario: token.encriptar(r.usuario),
            estudiante: token.encriptar(r.estudiante),
            acudiente: token.encriptar(r.acudiente),
            acudientecorreo: r.acudientecorreo,
            acudienteidentificacion: r.acudienteidentificacion,
            acudientenombres: r.acudientenombres,
            acudienteapellidos: r.acudienteapellidos,
            acudientetelefono: r.acudientetelefono           
          })
        }

        res.status(200).send({status:'success',statusCode:200,message:dataEstudiante.rows.length+' Estudiante encontrado ',token:resultados})
      }else{
        res.status(200).send({status:'success',statusCode:200,message:' Estudiante no encontrado ',token:null})
      }

    }catch (error) {
      //console.log(error.toString());
      res.status(400).send(error.toString());
    }
  },

  /**
   * deleteAdjuntos delete files uploaded linket to idStudet
   * @param {*} idStudet: integer column in table data.aematriculas_adjuntos
   */
  async deleteAdjuntos(idStudet){
    try {
      if(idStudet!=null && idStudet!=""){
        idStudet=parseInt(idStudet)
        let adjuntosToDelete = {
          text: `
          SELECT aeadjuntos_id, aeadjuntos_fecharegistro, 
            aeadjuntos_documentoestudiante, aeadjuntos_documentootroestudiante, aeadjuntos_documentoacudiente, 
            aeadjuntos_documentoresponsable, aeadjuntos_fotoestudiante, aeadjuntos_fotoacudiente, 
            aeadjuntos_fotorespfinanciero, aeadjuntos_facturaservicios, adjuntos_certificadomedico, 
            aeadjuntos_vacunas, aeadjuntos_epsafiliacion, aeadjuntos_pagadamatricula, 
            aeadjuntos_pagadaotroscostos, aeadjuntos_contrato, aeadjuntos_pagare, aeadjuntos_cartalaboral
          FROM data.aematriculas_adjuntos
          WHERE aeestudiantes_id=$1;`,
          values: [idStudet]
        }  
        adjuntosDeleted = await Db.query(adjuntosToDelete)
        if(adjuntosDeleted.rows.length > 0){
          console.log('Adjuntos a borrar: ', adjuntosDeleted.rows)
          adjuntosDeleted.rows.map(function(adjunto){            
            fs.unlinkSync(adjunto.aeadjuntos_documentoestudiante.replace('/p/d/m/','./public/archivos/instituciones/matriculas/'))
            fs.unlinkSync(adjunto.aeadjuntos_documentootroestudiante.replace('/p/d/m/','./public/archivos/instituciones/matriculas/'))
            fs.unlinkSync(adjunto.aeadjuntos_documentoacudiente.replace('/p/d/m/','./public/archivos/instituciones/matriculas/'))
            fs.unlinkSync(adjunto.aeadjuntos_documentoresponsable.replace('/p/d/m/','./public/archivos/instituciones/matriculas/'))
            fs.unlinkSync(adjunto.aeadjuntos_fotoestudiante.replace('/p/d/m/','./public/archivos/instituciones/matriculas/'))
            fs.unlinkSync(adjunto.aeadjuntos_fotoacudiente.replace('/p/d/m/','./public/archivos/instituciones/matriculas/'))
            fs.unlinkSync(adjunto.aeadjuntos_fotorespfinanciero.replace('/p/d/m/','./public/archivos/instituciones/matriculas/'))
            fs.unlinkSync(adjunto.aeadjuntos_epsafiliacion.replace('/p/d/m/','./public/archivos/instituciones/matriculas/'))
            fs.unlinkSync(adjunto.aeadjuntos_cartalaboral.replace('/p/d/m/','./public/archivos/instituciones/matriculas/'))            
            //file removed
          })
        }

      }

    } catch(err) {
      console.error(err)
    }
  },

  /**
   * inscribirMuchacho mail return message about state of inscription process
   * @param {*} req: several files and several items for inscription
   * @param {*} res message, and mail message
   * @param {*} next call editarMuchacho if mail (parent or student) exist
   */
   async inscribirMuchacho(req,res,next){
    let pruebadeEscritorio = []
    try{
        var inscripcion = JSON.parse(req.body.inscripcion)
        //const archivosRegistrados = req.body.losfiles
        let acudienteInsertado = [], estudianteInsertado = []
        let totalMessages = "", imagenQR = "", inscripcionElmensaje = "", botonVerificarInscripcion = "", botonCompartirInscripcion = "", botonMaps = "", botonSocial = "", qrInscripcion = ""
        let elIdacudiente_usuario = null, elIdacudiente_academico = null, elIdestudiante_usuario = null, elIdestudiante_academico = null        
        let muchachoDebe = {}, avisoimportante = '', costosMatricula = 0, costosMatriculaArchivo = {recibos:[]}
        var qr = require("qrcode")

        console.log('Completo: ', inscripcion)
        //console.log('Los archivos: ', req.body.adjuntoestudiantefoto)

        //RECORREMOS CADA ESTUDIANTE EN LA INSCRIPCION
        //inscripcion.inscripcion.forEach((estudiante, index) => {
        for(var index = 0; index < inscripcion.inscripcion.length; index++){

          acudienteInsertado = [], estudianteInsertado = []
          let usuario_id = ""
          let acudiente_id = ""

          let sede = parseInt(token.decriptar(inscripcion.inscripcion[index].sede))
          let sede_nombre = inscripcion.inscripcion[index].sedenombre
          let sede_correo = inscripcion.inscripcion[index].sedecorreo
          let sede_codigoc = inscripcion.inscripcion[index].sedecodigoc
          let sede_facebook = inscripcion.inscripcion[index].sedefacebook
          let sede_mapa = inscripcion.inscripcion[index].sedemapa
          let elAnolectivo = inscripcion.inscripcion[index].anolectivo || token.encriptar('12')
          let anolectivo = parseInt(token.decriptar(elAnolectivo))
          //ARRAY FOR ACUDIENTES
          let acudiente_correo = [],acudiente_tipodocumento = [],acudiente_identificacion = [],acudiente_nombres = [],acudiente_apellidos = [],acudiente_telefono = [],acudiente_telefonoempresa = [],
            acudiente_celular = [],acudiente_empresa = [],acudiente_direccion = [],acudiente_cargo = [],acudiente_convive = [],acudiente_principal = [],acudiente_responsable = [],acudiente_parentezco = [],
            acudiente_microempresa = [],acudiente_microempresatipo = [],acudiente_parentezcootro = []
            console.log('Inscribir Los datos llegaron: sede '+sede+', ano: '+anolectivo+', index: '+index)
            //INICIO CICLO RECORRER LOS ACUDIENTES
            //inscripcion.fpartacudientes.forEach(async (acudiente, a) => {
            for(var a=0; a < inscripcion.fpartacudientes.length; a++){

              acudiente_correo.push(inscripcion.fpartacudientes[a].acudientecorreo.toLowerCase())
              console.log('Inscribir Inside fpartacudientes: '+a+' : ', acudiente_correo)
              //pruebadeEscritorio.push({ciclo: a, reference: 'Inside fpartacudientes: ', data: JSON.stringify(acudiente_correo), result: '' })

              acudiente_tipodocumento.push(parseInt(token.decriptar(inscripcion.fpartacudientes[a].acudientetipodocumento)))
              acudiente_identificacion.push(inscripcion.fpartacudientes[a].acudienteidentificacion)
              acudiente_nombres.push(inscripcion.fpartacudientes[a].acudientenombres.toLowerCase())
              acudiente_apellidos.push(inscripcion.fpartacudientes[a].acudienteapellidos.toLowerCase())
              acudiente_telefono.push(inscripcion.fpartacudientes[a].acudientetelefono||'')
              acudiente_telefonoempresa.push(inscripcion.fpartacudientes[a].acudientetelefonotrabajo||'')

              acudiente_celular.push(inscripcion.fpartacudientes[a].acudientecelular||'')
              acudiente_empresa.push(inscripcion.fpartacudientes[a].acudienteempresa||'')

              let preDireccion = ''
              if(typeof inscripcion.fpartacudientes[a].acudientedireccion_1 !== 'undefined'){
                preDireccion += (typeof inscripcion.fpartacudientes[a].acudientedireccion_1 != '')? inscripcion.fpartacudientes[a].acudientedireccion_1.trim().toUpperCase() : '' ;
                preDireccion += (typeof inscripcion.fpartacudientes[a].acudientedireccion_2 !== 'undefined')? ' ' + inscripcion.fpartacudientes[a].acudientedireccion_2.trim().toUpperCase() : '';
                preDireccion += (typeof inscripcion.fpartacudientes[a].acudientedireccion_3 !== 'undefined')? ' ' + inscripcion.fpartacudientes[a].acudientedireccion_3.trim().toUpperCase() : '';
                preDireccion += (typeof inscripcion.fpartacudientes[a].acudientedireccion_4 !== 'undefined')? ' | ' + inscripcion.fpartacudientes[a].acudientedireccion_4.trim().toUpperCase() : '';
                console.log('inscribir Inside fpartacudientes direccion: '+a+' : '+acudiente_correo, preDireccion)
              }                
              acudiente_direccion.push(preDireccion)


              acudiente_cargo.push(inscripcion.fpartacudientes[a].acudientecargo||'')
              acudiente_convive.push(!!parseInt(inscripcion.fpartacudientes[a].acudienteconvive||0))
              acudiente_principal.push(!!parseInt(inscripcion.fpartacudientes[a].acudienteprincipal||0))
              acudiente_responsable.push(!!parseInt(inscripcion.fpartacudientes[a].acudienteresponsable||0))

              console.log('Inscribir Inside fpartacudientes responsable: '+a+' : ', acudiente_correo)

              //parseInt(token.decriptar(inscripcion.fpartacudientes[a].responsableparentezco))
              let preacudiente_parentezcootro = (inscripcion.fpartacudientes[a].acudienteparentezcocual !== undefined)? inscripcion.fpartacudientes[a].acudienteparentezcocual : ''
              let preacudiente_parentezco = parseInt(token.decriptar(inscripcion.fpartacudientes[a].acudienteparentezco||'MA=='))

              //WHEN PARENTEZCOOTRO HAS A VALUE TRY INSERT IT
              if(preacudiente_parentezcootro!=''){
                let masParentezcos = await Db.query({
                  text: queryes.insertarParentezco,
                  values: [preacudiente_parentezcootro]
                })
                preacudiente_parentezco = masParentezcos.rows[0].aeparentezco_id           
              }
              acudiente_parentezco.push(preacudiente_parentezco||0)
              acudiente_parentezcootro.push(preacudiente_parentezcootro || '')


              acudiente_microempresa.push(!!parseInt(inscripcion.fpartacudientes[a].acudientemicroempresa||0))
              
              let acudientemicroempresatipo = inscripcion.fpartacudientes[a].acudientemicroempresatipo || 'MA=='
              acudiente_microempresatipo.push(parseInt(token.decriptar(acudientemicroempresatipo)))

              acudiente_correo.push(inscripcion.fpartacudientes[a].responsablecorreo.toLowerCase())
              console.log('inscribir Inside fpartacudientes: '+a+' : ', acudiente_correo)

              acudiente_tipodocumento.push(parseInt(token.decriptar(inscripcion.fpartacudientes[a].responsabletipodocumento||'MQ==')))
              acudiente_identificacion.push(inscripcion.fpartacudientes[a].responsableidentificacion)
              acudiente_nombres.push(inscripcion.fpartacudientes[a].responsablenombres.toLowerCase())
              acudiente_apellidos.push(inscripcion.fpartacudientes[a].responsableapellidos.toLowerCase())
              acudiente_telefono.push(inscripcion.fpartacudientes[a].responsabletelefono||'')
              acudiente_telefonoempresa.push(inscripcion.fpartacudientes[a].responsabletelefonotrabajo||'')

              acudiente_celular.push(inscripcion.fpartacudientes[a].responsablecelular||'')
              acudiente_empresa.push(inscripcion.fpartacudientes[a].responsableempresa||'')
              
              preDireccion = ''
              if(typeof inscripcion.fpartacudientes[a].responsabledireccion_1 !== 'undefined' && inscripcion.fpartacudientes[a].responsabledireccion_1 != ''){
                preDireccion += (typeof inscripcion.fpartacudientes[a].responsabledireccion_1 != '')? inscripcion.fpartacudientes[a].responsabledireccion_1.trim().toUpperCase() : '' ;
                preDireccion += (typeof inscripcion.fpartacudientes[a].responsabledireccion_2 !== 'undefined')? ' ' + inscripcion.fpartacudientes[a].responsabledireccion_2.trim().toUpperCase() : '';
                preDireccion += (typeof inscripcion.fpartacudientes[a].responsabledireccion_3 !== 'undefined')? ' ' + inscripcion.fpartacudientes[a].responsabledireccion_3.trim().toUpperCase() : '';
                preDireccion += (typeof inscripcion.fpartacudientes[a].responsabledireccion_4 !== 'undefined')? ' | ' + inscripcion.fpartacudientes[a].responsabledireccion_4.trim().toUpperCase() : '';
                console.log('Inside fpartresponsables direccion: '+a+' : '+acudiente_correo, preDireccion)
              }
              acudiente_direccion.push(preDireccion)

              let elCargo = inscripcion.fpartacudientes[a].responsablecargo || ''
              acudiente_cargo.push(elCargo)
              console.log('El acudiente_cargo: ', acudiente_cargo)
              let acudienteConvive = !!parseInt(inscripcion.fpartacudientes[a].responsableconvive) || false
              acudiente_convive.push(acudienteConvive)
              console.log('El acudiente_convive: ', acudiente_convive)

              let acudientePrincipal = !!parseInt(inscripcion.fpartacudientes[a].responsableprincipal) || false
              acudiente_principal.push(acudientePrincipal)
              console.log('El acudiente_principal: ', acudiente_principal)

              let acudienteResponsable = !!parseInt(inscripcion.fpartacudientes[a].responsableresponsable) || false
              acudiente_responsable.push(acudienteResponsable)
              console.log('El acudiente_responsable: ', acudiente_responsable)

              //parseInt(token.decriptar(inscripcion.fpartacudientes[a].responsableparentezco))
              preacudiente_parentezcootro = (inscripcion.fpartacudientes[a].responsableparentezcocual !== undefined)? inscripcion.fpartacudientes[a].responsableparentezcocual : ''
              console.log('El preacudiente_parentezcootro: ', preacudiente_parentezcootro)

              
              let elParentezco = (inscripcion.fpartacudientes[a].responsableparentezco !== undefined)? inscripcion.fpartacudientes[a].responsableparentezco : 'MA=='
              preacudiente_parentezco = parseInt(token.decriptar(elParentezco))
              console.log('El preacudiente_parentezco: ', preacudiente_parentezco)

              //WHEN PARENTEZCOOTRO HAS A VALUE TRY INSERT IT
              if(preacudiente_parentezcootro!=''){
                let masParentezcos = await Db.query({
                  text: queryes.insertarParentezco,
                  values: [preacudiente_parentezcootro.toLowerCase()]
                })
                preacudiente_parentezco = masParentezcos.rows[0].aeparentezco_id           
              }
              console.log('IF El preacudiente_parentezcootro: ', preacudiente_parentezcootro)

              acudiente_parentezco.push(preacudiente_parentezco || 0)
              console.log('El acudiente_parentezco: ', acudiente_parentezco)

              acudiente_parentezcootro.push(preacudiente_parentezcootro || '')
              console.log('El acudiente_parentezcootro: ', acudiente_parentezcootro)


              //acudiente_parentezco.push(parseInt(token.decriptar(inscripcion.fpartacudientes[a].responsableparentezco)))
              //acudiente_parentezcootro.push(inscripcion.fpartacudientes[a].responsableparentezcocual.toLowerCase() || '')

              let tieneMicroempresa = (inscripcion.fpartacudientes[a].responsablemicroempresa !== undefined)? !!parseInt(inscripcion.fpartacudientes[a].responsablemicroempresa) : false
              acudiente_microempresa.push(tieneMicroempresa)
              console.log('El tieneMicroempresa: ', acudiente_microempresa)

              let responsableMicroempresatipo = inscripcion.fpartacudientes[a].responsablemicroempresatipo || 'MA=='
              acudiente_microempresatipo.push(parseInt(token.decriptar(responsableMicroempresatipo)))
              console.log('El responsableMicroempresatipo: ', acudiente_microempresatipo)
              
//ITERATE EACH ACUDIENTE
              for(var p=0; p < acudiente_correo.length; p++){
                elIdacudiente_usuario = null, elIdacudiente_academico = null, elIdestudiante_usuario = null, elIdestudiante_academico = null
                //let acudiente_nombres = inscripcion.fpartacudientes[index].acudienteapellidos

                //RECOVER USERID FROM INSERT
                let acudienteUsuario = {
                  text: `SELECT aeusu_id FROM engine.aeusu WHERE aeusu_nick LIKE $1`,
                  values: [acudiente_correo[p]]
                }
                let acudiente_usuario = await Db.query(acudienteUsuario)
                console.log('Inscribir Inside for p:'+p+' acudiente_correo: ',JSON.stringify(acudienteUsuario))
                //pruebadeEscritorio.push({ciclo: a, reference: 'Inside for p:'+p+' acudiente_correo: ', data: JSON.stringify(acudienteUsuario), result: acudiente_usuario.rows })


                //NOT FOUND PREVIOUS USER => INSERT IT
                if(acudiente_usuario.rows.length <= 0){
                  acudienteUsuario = {
                    text: `INSERT INTO engine.aeusu
                    (aeusu_id, aeusu_nombre, aeusu_nick, aeusu_llave, aeroll_id, aeusu_estado, aeusu_token)
                    VALUES((SELECT COALESCE(MAX(aeusu_id), 0)+1 FROM engine.aeusu), $1, $2, $3, $4, $5, $6)RETURNING aeusu_id;`,
                    values: [acudiente_nombres[p] + ' ' + acudiente_apellidos[p],acudiente_correo[p],token.encriptar(acudiente_identificacion[p]),6,1,null]
                  }  
                  acudiente_usuario = await Db.query(acudienteUsuario)
                console.log('Inside for p:'+p+' acudiente_usuario insert: ',acudiente_usuario)

                  //pruebadeEscritorio.push({ciclo: a, reference: 'Inside for p:'+p+' acudiente_usuario <= 0 ', data: JSON.stringify(acudienteUsuario), result: acudiente_usuario.rowCount })
                }else{
                  acudienteUsuario = {
                    text: `UPDATE engine.aeusu
                    SET aeusu_nombre=$2, aeusu_nick=$3, aeusu_llave=$4, aeroll_id=$5, aeusu_estado=$6
                    WHERE aeusu_id=$1 RETURNING aeusu_id;`,
                    values: [acudiente_usuario.rows[0].aeusu_id,
                      acudiente_nombres[p] + ' ' + acudiente_apellidos[p],
                      acudiente_correo[p],
                      token.encriptar(acudiente_identificacion[p]),6,1
                    ]
                  }  
                  acudiente_usuario = await Db.query(acudienteUsuario)
                  console.log('Inside for p:'+p+' acudiente_usuario update: ',acudiente_usuario)

                  //pruebadeEscritorio.push({ciclo: a, reference: 'Inside for p:'+p+' acudiente_usuario > 0 ', data: JSON.stringify(acudienteUsuario), result: acudiente_usuario.rowCount })
                }

                elIdacudiente_usuario = parseInt(acudiente_usuario.rows[0].aeusu_id)

                //INSERT ACUDIENTES FOR STUDENT 
                let acudienteacademico = {
                  text: `SELECT aeacudientes_id FROM data.aematriculas_acudientes WHERE aeacudientes_identificacion LIKE $1`,
                  values: [acudiente_identificacion[p]]
                }
                let acudiente_academico = await Db.query(acudienteacademico)
                //pruebadeEscritorio.push({ciclo: a, reference: 'Inside for p:'+p+' search aeacudientes_identificacion ', data: JSON.stringify(acudienteacademico), result: acudiente_academico.rows })


                //NOT FOUND PREVIOUS USER => INSERT IT
                if(acudiente_academico.rows.length <= 0){
                  //INSERT ACUDIENTES FOR STUDENT 
                  acudienteacademico = {
                    text: `INSERT INTO data.aematriculas_acudientes
                      (aeacudientes_id, aeusu_id, aeacudientes_nombres, aeacudientes_apellidos, aeacudientes_tipoidentificacion, 
                        aeacudientes_identificacion, aeacudientes_telresidencia, aeacudientes_celpersonal, aeacudientes_empresatelefono, 
                        aeacudientes_mail, aeacudientes_empresa, aeacudientes_empresacargo, aeacudientes_empresadireccion, 
                        aeacudientes_empresario, aeacudientes_empresariotipo, aeacudientes_parentezcootro)
                      VALUES((SELECT COALESCE(MAX(aeacudientes_id), 0)+1 FROM data.aematriculas_acudientes), $1, $2, $3, $4, $5, 
                      $6, $7, $8, $9, 
                      $10, $11, $12, $13, $14, $15)RETURNING aeacudientes_id;`,
                    values: [elIdacudiente_usuario,acudiente_nombres[p],acudiente_apellidos[p], acudiente_tipodocumento[p],
                      acudiente_identificacion[p], acudiente_telefono[p], acudiente_celular[p], acudiente_telefonoempresa[p], 
                      acudiente_correo[p], acudiente_empresa[p], acudiente_cargo[p], acudiente_direccion[p],
                      acudiente_microempresa[p], acudiente_microempresatipo[p], acudiente_parentezcootro[p]
                    ]
                  }
                  console.log('insert acudiente academico: ', acudienteacademico)
                  acudiente_academico = await Db.query(acudienteacademico)
                  //pruebadeEscritorio.push({ciclo: a, reference: 'Inside for p:'+p+' INSERTING data.aematriculas_acudientes ', data: JSON.stringify(acudienteacademico), result: acudiente_academico.rowCount })

                }else{
                  //UPDATE ACUDIENTES FOR STUDENT 
                  acudienteacademico = {
                    text: `UPDATE data.aematriculas_acudientes
                      SET aeusu_id=$2, aeacudientes_nombres=$3, aeacudientes_apellidos=$4, aeacudientes_tipoidentificacion=$5, 
                        aeacudientes_identificacion=$6, aeacudientes_telresidencia=$7, aeacudientes_celpersonal=$8, aeacudientes_empresatelefono=$9, 
                        aeacudientes_mail=$10, aeacudientes_empresa=$11, aeacudientes_empresacargo=$12, aeacudientes_empresadireccion=$13, 
                        aeacudientes_empresario=$14, aeacudientes_empresariotipo=$15, aeacudientes_parentezcootro=$16
                      WHERE aeacudientes_id=$1 RETURNING aeacudientes_id;`,
                    values: [parseInt(acudiente_academico.rows[0].aeacudientes_id),elIdacudiente_usuario,
                      acudiente_nombres[p],acudiente_apellidos[p], acudiente_tipodocumento[p],
                      acudiente_identificacion[p], acudiente_telefono[p], acudiente_celular[p], acudiente_telefonoempresa[p], 
                      acudiente_correo[p], acudiente_empresa[p], acudiente_cargo[p], acudiente_direccion[p],
                      acudiente_microempresa[p], acudiente_microempresatipo[p], acudiente_parentezcootro[p]
                    ]
                  }
                  console.log('insert acudiente academico: ', acudienteacademico)
                  acudiente_academico = await Db.query(acudienteacademico)
                  //pruebadeEscritorio.push({ciclo: a, reference: 'Inside for p:'+p+' UPDATE data.aematriculas_acudientes ', data: JSON.stringify(acudienteacademico), result: acudiente_academico.rowCount })

                }

                elIdacudiente_academico = parseInt(acudiente_academico.rows[0].aeacudientes_id)

                acudienteInsertado.push({
                  usuario_id: elIdacudiente_usuario, 
                  acudiente_id: elIdacudiente_academico, 
                  correo: acudiente_correo[p],
                  nombre: acudiente_nombres[p] + ' ' + acudiente_apellidos[p],
                  parentezco: acudiente_parentezco[p],
                  presente: acudiente_convive[p],
                  esacudiente: acudiente_principal[p],
                  esresponsable: acudiente_responsable[p]
                })
                console.log('Acudiente insertado '+p+': ', acudienteInsertado)
                //pruebadeEscritorio.push({ciclo: a, reference: 'Inside for p:'+p+' STORING acudiente in acudienteInsertado[] ', data: JSON.stringify(acudienteInsertado), result: acudienteInsertado.length })
              }

            }//FIN CICLO QUE RECORRE CADA ACUDIENTE

            
            let estudiante_id = (inscripcion.inscripcion[index].estudiante !== undefined)? parseInt(token.decriptar(inscripcion.inscripcion[index].estudiante)) : ''
            console.log('El estudiante_id: ', estudiante_id)
            let estudiante_estudiantenuevo = !!parseInt(inscripcion.fpartacademia[index].estudiantenuevo||0)
            console.log('El estudiante_estudiantenuevo: ', estudiante_estudiantenuevo)
            let eltipoDocumentoestudiante = inscripcion.inscripcion[index].estudiantetipodocumento || 'NQ=='
            let estudiante_tipodocumento = parseInt(token.decriptar(eltipoDocumentoestudiante))
            console.log('El estudiante_tipodocumento: ', estudiante_tipodocumento)

            let estudiante_documento = inscripcion.inscripcion[index].estudianteidentificacion || ''
            let estudiante_codigo = inscripcion.inscripcion[index].estudiantecodigo||''
            let estudiante_codigo_base = estudiante_codigo
            //if(estudiante_codigo!='' && estudiante_codigo.length>8){
            //  estudiante_codigo_base = estudiante_codigo //estudiante_codigo.substring(2)//LEAVING SCHOOL CODE              
            //}

            let estudiante_correo = (inscripcion.inscripcion[index].estudiantecorreo !== undefined)? inscripcion.inscripcion[index].estudiantecorreo.toLowerCase() : ''
            let estudiante_nombres = (inscripcion.inscripcion[index].estudiantenombres !== undefined)? inscripcion.inscripcion[index].estudiantenombres.toLowerCase() : 'Sin Nombre'
            let estudiante_apellidos = (inscripcion.inscripcion[index].estudianteapellidos !== undefined)? inscripcion.inscripcion[index].estudianteapellidos.toLowerCase() : 'Sin Apellido'
            let estudiante_fechanacimiento = inscripcion.inscripcion[index].estudiantenacimiento || '1900/12/31'
            let estudiante_genero = inscripcion.inscripcion[index].estudiantegenero || 'I'
            let estudiante_grado = parseInt(token.decriptar(inscripcion.inscripcion[index].grado))
            console.log('El estudiante_grado: ', estudiante_grado)

            let estudiante_direccion = inscripcion.inscripcion[index].estudiantedireccion_1 + ' ' + inscripcion.inscripcion[index].estudiantedireccion_2 + ' ' + inscripcion.inscripcion[index].estudiantedireccion_3
            estudiante_direccion += (inscripcion.inscripcion[index].estudiantedireccion_4 !== undefined)? inscripcion.inscripcion[index].estudiantedireccion_4 : '' ;
            console.log('El estudiante_direccion: ', estudiante_direccion)

            let estudiante_telefono = inscripcion.inscripcion[index].estudiantetelefono || ''
            console.log('El estudiante_telefono: ', estudiante_telefono)

            //RECOVER USERID FROM INSERT USING estudiante_correo || estudiante_documento
            let estudianteUsuario = {
              text: `SELECT aeusu_id FROM engine.aeusu WHERE aeusu_nick LIKE $1`,
              values: [estudiante_correo]
            }
            //IF student_email COME VOID
            if(estudiante_correo.indexOf('@')<0){
              estudianteUsuario = {
                text: `SELECT aeusu_id FROM engine.aeusu WHERE aeusu_nick LIKE $1`,
                values: [estudiante_documento]
              }
              estudiante_correo=estudiante_documento
            }

            console.log('buscar usuario estudiante: ', estudianteUsuario)
            let usuario = await Db.query(estudianteUsuario)
            //pruebadeEscritorio.push({ciclo: a, reference: 'RECOVER USERID FROM INSERT USING estudiante_correo || estudiante_documento ', data: JSON.stringify(estudianteUsuario), result: usuario.rows })

            //NOT FOUND PREVIOUS USER => INSERT IT
            if(usuario.rows.length <= 0){
              estudianteUsuario = {
                text: `INSERT INTO engine.aeusu
                (aeusu_id, aeusu_nombre, aeusu_nick, aeusu_llave, aeroll_id, aeusu_estado, aeusu_token)
                VALUES((SELECT COALESCE(MAX(aeusu_id), 0)+1 FROM engine.aeusu), $1, $2, $3, $4, $5, $6)RETURNING aeusu_id;`,
                values: [(estudiante_nombres + ' ' + estudiante_apellidos),estudiante_correo,token.encriptar(estudiante_documento),3,1,null]
              }
              console.log('insert usuario estudiante: ', estudianteUsuario)
              usuario = await Db.query(estudianteUsuario)
            }else{
              //IN THIS POINT STUDENT IS OLD BECAUSE EXIST IN DB
              estudiante_estudiantenuevo = false
              console.log('ES UN ESTUDIANTE ANTIGUO: '+usuario.rows[0].aeusu_id)
              //NOW UPDATE USER DATA FOR STUDENTS
              estudianteUsuario = {
                text: `UPDATE engine.aeusu
                SET aeusu_nombre=$2, aeusu_nick=$3, aeusu_llave=$4, aeroll_id=$5, aeusu_estado=$6
                WHERE aeusu_id=$1 RETURNING aeusu_id;`,
                values: [usuario.rows[0].aeusu_id,
                  (estudiante_nombres + ' ' + estudiante_apellidos),
                  estudiante_correo,
                  token.encriptar(estudiante_documento),3,1
                ]
              }  
              usuario = await Db.query(estudianteUsuario)
            }
            //pruebadeEscritorio.push({ciclo: a, reference: 'NOT FOUND PREVIOUS USER => INSERT IT ', data: JSON.stringify(estudianteUsuario), result: usuario.rowCount })

            elIdestudiante_usuario = parseInt(usuario.rows[0].aeusu_id)

            let estudianteAcademico = {
              text: `SELECT aeestudiantes_id FROM data.aematriculas_estudiantes WHERE aeestudiantes_identificacion LIKE $1`,
              values: [estudiante_documento]
            }
            let estudiante_academico = await Db.query(estudianteAcademico)
            console.log('results usuario academico: ', estudiante_academico)
            //pruebadeEscritorio.push({ciclo: a, reference: 'SEARCH ACADEMIC STUDENT IN aematriculas_estudiantes ', data: JSON.stringify(estudianteAcademico), result: estudiante_academico.rowCount })

            //INFORMACION DE PAGOS PARA NUEVOS O ANTIGUOS
            //ESTUDIANTE NUEVO
            muchachoDebe = {}, avisoimportante = '', costosMatricula = 0, costosMatriculaArchivo = {recibos:[]}
            muchachoDebe = await module.exports.buscarMuchachoMoroso({
              idestudiante:elIdestudiante_academico,
              codigo:estudiante_codigo_base,
              nombrecompleto: estudiante_apellidos.toUpperCase() +' '+ estudiante_nombres.toUpperCase()
            })
            console.log('Muchacho debe: ', muchachoDebe)
            //IF STUDENT HAS A DEBT, ADD WARN
            if(muchachoDebe.status){
              console.log('ES UN ESTUDIANTE DEUDOR: '+estudiante_codigo+'|'+estudiante_codigo_base)

              avisoimportante+=`
              <div style="margin:1%;background:#FFDDEC;color:#DA4453;">
                <h2 style="padding:5px 15px;border-bottom:1px solid #555555;color:#DA4453;font-size:19pt;">
                  El sistema ha encontrado una deuda previa
                </h2>
                <ul style="font-size:17pt;">
                  <li>Código estudiantil: ${estudiante_codigo}</li>
                  <li>Identidad del estudiante: ${estudiante_documento}</li>
                  <li>Estudiante: ${muchachoDebe.estudiante}</li>
                  <li>Deuda estimada en más de: ${muchachoDebe.deuda} pesos</li>
                </ul>
                <p style="padding:3px 15px;border-top:1px solid #555555;color:#DA4453;font-size:13pt;">
                  Por favor acudir personalmente a la sede central ubicada en el barrio Alfonso Lopez, Carrera 7h bis # 76-25<br/>
                  `+generateButton.boton({type:'error',shape:'square',link:'https://www.google.com/maps/place/3.458873,-76.47991',text:'  Veala en el mapa '})+`
                  <br/>
                  Solicite atencion por pensiones pendientes en la oficina de cobranza<br/>
                </p>
                <p style="padding:3px 15px;border-top:1px solid #555555;color:#444444;font-size:13pt;">
                  Si usted considera que se trata de un error escriba un email a cobranza@arquidiocesanos.edu.co
                  Solicitando una rectificación Indicando el su teléfono, el código del estudiante, No. de identidad, Nombre completo y el monto de la deuda.<br/>
                  La respuesta puede tardar un poco dependiendo de varios factores.
                </p>
              </div>`
            }

//STUDENT NOT DEBT, THEN SHOW A BILL OR COST REFERENCE FOR NEW STUDENTS 
            if(avisoimportante==''){
              //NEW STUDENT
              if(estudiante_estudiantenuevo){
                console.log('NO DEBE Y ES UN ESTUDIANTE NUEVO: '+estudiante_estudiantenuevo)

                let matriculaCostos = await Db.query({
                  text:queryes.inscripcionBuscarCostos,
                  values:[anolectivo,sede,estudiante_grado,estudiante_estudiantenuevo]
                })
                console.log('QUERY COSTOS: ', matriculaCostos)


                //IF STUDENT HAS A DEBT, ADD WARN
                if(matriculaCostos.rows.length > 0){
                  console.log('NO DEBE Y ES UN ESTUDIANTE NUEVO, LOS COSTOS AQUI: ', matriculaCostos.rows)


                  let totalCostos = 0
                  avisoimportante+=`
                  <div style="margin:1%;background:#BBFFC7;color:#333333;">
                    <h2 style="padding:5px 15px;border-bottom:1px dashed #555555;color:#333333;font-size:19pt;text-align:center;">
                      COSTOS DE MATRICULA
                    </h2>
                    <table style="border:1px solid #555555;" cellpadding="0" cellspacing="0">
                    <tr>
                      <th style="border:1px solid #555555;font-size:17pt;font-weight:bolder;">CONCEPTO</th>
                      <th style="border:1px solid #555555;font-size:17pt;font-weight:bolder;">FECHA LIMITE</th>
                      <th style="border:1px solid #555555;font-size:17pt;font-weight:bolder;">VALOR</th>
                    </tr>`

                  matriculaCostos.rows.map((costos)=>{
                    totalCostos += parseFloat(costos.valor.replace('.','').replace(',','.')).toFixed(1)
                    avisoimportante+=`
                      <tr>
                        <td style="border:1px solid #555555;font-size:15pt;">${costos.concepto}</td>
                        <td style="border:1px solid #555555;font-size:15pt;text-align:left;">${moment(costos.fecha).format('YYYY-MM-DD')}</td>
                        <td style="border:1px solid #555555;font-size:15pt;">${costos.valor}</td>
                      </tr>`
                  })
                  avisoimportante+=`
                    <tr>
                      <td colspan="2" style="border:1px solid #555555;font-size:17pt;font-weight:bolder;">TOTAL MATRICULA</td>
                      <td style="border:1px solid #555555;font-size:17pt;font-weight:bolder;">$ ${totalCostos}</td>
                    </tr>
                  </table>
                  <p style="padding:3px 15px;border-top:1px dashed #555555;color:#333333;font-size:13pt;">
                    Por favor acudir personalmente a la sede ${sede_nombre} para cancelar estos costos y terminar el proceso<br/>
                    `+generateButton.boton({type:'error',shape:'square',link:sede_mapa,text:'  Vea la sede en el mapa '})+`
                    <br/>
                    <span style="color:#DA4453;font-weight:bolder;text-align:center;">Se aceptan tarjetas y pagos en efectivo hasta las fechas descritas, luego de eso solo pago con tarjetas</span>
                  </p>
                  <p style="padding:3px 15px;border-top:1px dashed #555555;color:#333333;font-size:13pt;">
                    La sede se reserva el derecho de admisión para este proceso, los valores aquí descritos pueden variar sin previo aviso, 
                    Utilizaremos los datos de este formulario para contactarlo en caso de ser necesario, 
                    por favor visitar frecuentemente nuestras redes sociales para tener información de primera mano.
                  </p>
                </div>`

                }
              }
              //OLD MUCHACHO
              else{
                console.log('NO DEBE Y ES UN ESTUDIANTE ANTIGUO: '+estudiante_codigo)

                costosMatriculaArchivo = await module.exports.facturarMuchachoAntiguo({
                  idestudiante:elIdestudiante_academico,
                  codigo:estudiante_codigo,
                  nombrecompleto: estudiante_apellidos.toUpperCase() +' '+ estudiante_nombres.toUpperCase()
                })

                console.log('ARCHIVOS COSTOS: ', costosMatriculaArchivo)
                if(costosMatriculaArchivo.result){
                  avisoimportante+=`
                  <div style="margin:1%;background:#BBFFC7;color:#222222;">
                    <p style="padding:5px 15px;border-bottom:1px solid #555555;color:#222222;font-size:17pt;">
                      Adjunto a este mensaje encontrará las facturas para realizar el pago, 
                      cuando las haya cancelado llevelas a la sede ${sede_nombre} para poder finalizar el proceso.  
                      Deve llevar el codigo QR que está en este mensaje.<br/> 
                      `+generateButton.boton({type:'error',shape:'square',link:sede_mapa,text:'  Veala en el mapa '})+`
                    </p>
                    <p style="padding:5px 15px;border-bottom:1px solid #555555;color:#222222;font-size:17pt;">
                      Existe un recargo según la fecha en la que realice pago, por favor fíjese en las facturas.
                    </p>
                    <p style="padding:3px 15px;border-top:1px solid #555555;color:#333333;font-size:13pt;">
                      La sede se reserva el derecho de admisión para este proceso, los valores aquí descritos pueden variar sin previo aviso, 
                      Utilizaremos los datos de este formulario para contactarlo en caso de ser necesario, 
                      por favor visitar frecuentemente nuestras redes sociales para tener información de primera mano.
                    </p>
                    </div>`
                }else{
                  avisoimportante+=`
                  <div style="margin:1%;background:#BBFFC7;color:#222222;">
                    <h2 style="padding:5px 15px;border-bottom:1px dashed #555555;color:#DA4453;font-size:19pt;text-align:center;">
                    Es urgente que acuda personalmente a la sede que eligio y solicite los recibos de pago.
                    </h2>
                  <p style="padding:5px 15px;border-bottom:1px solid #555555;color:#222222;font-size:17pt;">
                      Ya teniamos registrado al estudiante ${estudiante_apellidos.toUpperCase() +' '+ estudiante_nombres.toUpperCase()}, 
                      Sin embargo no tenemos un recibo para que se disponga a realizar el pago.<br/><br/>
                      Debe acudir personalmente a la sede para que le den los recibos<br/>
                      Deve llevar el codigo QR que está en este mensaje.<br/>
                      `+generateButton.boton({type:'error',shape:'square',link:sede_mapa,text:'  Veala en el mapa '})+`
                    </p>
                    <p style="padding:5px 15px;border-bottom:1px solid #555555;color:#222222;font-size:17pt;">
                      Existe un recargo según la fecha en la que realice pago, por favor fíjese en las facturas.
                    </p>
                    <p style="padding:3px 15px;border-top:1px solid #555555;color:#333333;font-size:13pt;">
                      La sede se reserva el derecho de admisión para este proceso, los valores aquí descritos pueden variar sin previo aviso, 
                      Utilizaremos los datos de este formulario para contactarlo en caso de ser necesario, 
                      por favor visitar frecuentemente nuestras redes sociales para tener información de primera mano.
                    </p>
                    </div>`
                }
              }
            }

            //NOT FOUND PREVIOUS USER => INSERT IT
            if(estudiante_academico.rows.length <= 0){
              estudianteAcademico = {
                text: `INSERT INTO data.aematriculas_estudiantes
              (aeestudiantes_id, aeinstitucion_id, aeano_id, aeusu_id, aeacudientes_id, aeestudiantes_fecharegistro, aeestudiantes_estado, 
                aeestudiantes_grado, aeestudiantes_grupo, aeestudiantes_nombres, aeestudiantes_apellidos, 
                aeestudiantes_tipodocumento, aeestudiantes_identificacion, aeestudiantes_fechanacimiento, aeestudiantes_genero, 
                aeestudiantes_direccion, aeestudiantes_telefono, aeestudiantes_mail, aeestudiantes_codigo, aeestudiantes_jornada)
              VALUES((SELECT COALESCE(MAX(aeestudiantes_id), 0)+1 FROM data.aematriculas_estudiantes), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)RETURNING aeestudiantes_id;`,
              values: [sede, anolectivo, elIdestudiante_usuario, null, ahora, 9,
                estudiante_grado, null, estudiante_nombres, estudiante_apellidos,
                estudiante_tipodocumento, estudiante_documento, estudiante_fechanacimiento, estudiante_genero,
                estudiante_direccion, estudiante_telefono, estudiante_correo, estudiante_codigo, null]
              }

              console.log('INSERT INTO data.aematriculas_estudiantes: ', estudianteAcademico)
              estudiante_academico = await Db.query(estudianteAcademico)

            }else{
              estudianteAcademico = {
                text: `UPDATE data.aematriculas_estudiantes
                  SET aeinstitucion_id=$2, aeano_id=$3, aeusu_id=$4, aeacudientes_id=$5, aeestudiantes_fecharegistro=$6, aeestudiantes_estado=$7, 
                    aeestudiantes_grado=$8, aeestudiantes_grupo=$9, aeestudiantes_nombres=$10, aeestudiantes_apellidos=$11, 
                    aeestudiantes_tipodocumento=$12, aeestudiantes_identificacion=$13, aeestudiantes_fechanacimiento=$14, aeestudiantes_genero=$15, 
                    aeestudiantes_direccion=$16, aeestudiantes_telefono=$17, aeestudiantes_mail=$18, aeestudiantes_codigo=$19, aeestudiantes_jornada=$20
                  WHERE aeestudiantes_id=$1 RETURNING aeestudiantes_id;`,
                values: [estudiante_academico.rows[0].aeestudiantes_id, sede, anolectivo, elIdestudiante_usuario, null, ahora, 9,
                    estudiante_grado, null, estudiante_nombres, estudiante_apellidos,
                    estudiante_tipodocumento, estudiante_documento, estudiante_fechanacimiento, estudiante_genero,
                    estudiante_direccion, estudiante_telefono, estudiante_correo, estudiante_codigo, null
                  ]
              }
              console.log('UPDATE INTO data.aematriculas_estudiantes: ', estudianteAcademico)
              estudiante_academico = await Db.query(estudianteAcademico)
            }
            //pruebadeEscritorio.push({ciclo: a, reference: 'ADDING ACADEMIC STUDENT IN aematriculas_estudiantes ', data: JSON.stringify(estudianteAcademico), result: estudiante_academico.rowCount })

            elIdestudiante_academico = (estudiante_academico.rowCount > 0)? estudiante_academico.rows[0].aeestudiantes_id : null ;
//DELETING FILES FROM FOLDERS (DISK SPACE)
            module.exports.deleteAdjuntos(elIdestudiante_academico)
            //DELETING EXISTING DATA ASOCIATE TO STUDENT IN TABLES data.aematriculas_academia, data.aematriculas_adjuntos, data.aematriculas_demografia
//PREVIOUS TO INSERT NEW DATA FOR THESE STUDENT
            let tableAdditions = ['data.aematriculas_academia', 'data.aematriculas_adjuntos', 'data.aematriculas_demografia', 'data.estudiantes_acudientes']
            let deletePrevious = {}, previousDeleted = 0

            tableAdditions.map( async (tablita) => {
              let deletePrevious = {
                text: `DELETE FROM `+tablita+` WHERE aeestudiantes_id=`+elIdestudiante_academico+`;`,
                values: []
              }

              let preGenesis = await Db.query(deletePrevious)
              console.log('DELETING  DATA FOR STUDENTS ', deletePrevious)

              //pruebadeEscritorio.push({ciclo: a, reference: 'ERASE FILES OR PICS IPLOADED FROM STUDENT ', data: JSON.stringify(deletePrevious), result: preGenesis.rowCount })

              //previousDeleted += preGenesis.rowCount
            })
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////        
            //INSERCION DE RELACION ENTRE ESTUDIANTES E INSTITUCION Y ESTUDIANTE Y ACUDIENTE
            //ESTUDIANTE Y ACUDIENTE
            //RECORREMOS LOS ACUDIENTES REGISTRADOS EN LA DB, ASOCIAMOS A CADA ESTUDIANTE
            let relacionesRegistradas = 0
            
            for(let ae=0; ae < acudienteInsertado.length; ae++){
              let estudianteYacudiente = {
                text: `INSERT INTO data.estudiantes_acudientes
                  (aeestuacu_id, aeestuacu_fecharegistro, aeestudiantes_id, aeacudientes_id, aeestuacu_parentezco, 
                    aeestuacu_presente, aeestuacu_acudiente, aeestuacu_responsablefinanciero, aeestuacu_estado)
                  VALUES((SELECT COALESCE(MAX(aeestuacu_id), 0)+1 FROM data.estudiantes_acudientes), $1, $2, $3, $4, 
                  $5, $6, $7, $8)RETURNING aeestuacu_id;`,
                values: [ahora, elIdestudiante_academico, acudienteInsertado[ae].acudiente_id, acudienteInsertado[ae].parentezco, 
                  acudienteInsertado[ae].presente, acudienteInsertado[ae].esacudiente, acudienteInsertado[ae].esresponsable, 1]
              }

              let preRelacionAcuEstu = await Db.query(estudianteYacudiente)
              relacionesRegistradas = parseInt(preRelacionAcuEstu.rowCount)
              //pruebadeEscritorio.push({ciclo: a, reference: 'RELATION STUDENT PARENT SUBLOOP ae: '+ae+' ', data: JSON.stringify(estudianteYacudiente), result: preRelacionAcuEstu.rowCount })

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////        

              //HABILITAR EL USUARIO PARA CADA ACUDIENTE 
              let estudianteYusuario = {
                text: `INSERT INTO engine.aeusuroll
                    (aeusuroll_id, aeroll_id, aeusu_id, aeacad_referencia, aeinst_id, aeanol_id, aeusuroll_estado)
                  VALUES((SELECT COALESCE(MAX(aeusuroll_id), 0)+1 FROM engine.aeusuroll), $1, $2, $3, $4, $5, $6)RETURNING aeroll_id;`,
                values: [6, acudienteInsertado[ae].usuario_id, acudienteInsertado[ae].acudiente_id, sede, anolectivo, 1]
              }

              let preRelacionEstuUsu = await Db.query(estudianteYusuario)
              relacionesRegistradas = parseInt(preRelacionEstuUsu.rowCount)
              //console.log('Relaciones registradas: ', preRelacionEstuUsu)
              //pruebadeEscritorio.push({ciclo: a, reference: 'ENABLE PARENT USER SUBLOOP ae: '+ae+' ', data: JSON.stringify(estudianteYusuario), result: preRelacionEstuUsu.rowCount })
            }
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////        
            //HABILITAR EL USUARIO PARA CADA ESTUDIANTE 
            let estudianteYacudiente = {
              text: `
                INSERT INTO engine.aeusuroll
                  (aeusuroll_id, aeroll_id, aeusu_id, aeacad_referencia, aeinst_id, aeanol_id, aeusuroll_estado)
                VALUES((SELECT COALESCE(MAX(aeusuroll_id), 0)+1 FROM engine.aeusuroll), $1, $2, $3, $4, $5, $6)RETURNING aeroll_id;`,
              values: [3, elIdestudiante_usuario, elIdestudiante_academico, sede, anolectivo, 1]
            }
            console.log('insert asociar estudiante y usuario: ', estudianteYacudiente)

            let preRelacionAcuEstu = await Db.query(estudianteYacudiente)
            console.log('La preRelacionAcuEstu: ', preRelacionAcuEstu)
            relacionesRegistradas = parseInt(preRelacionAcuEstu.rowCount)
            //pruebadeEscritorio.push({ciclo: a, reference: 'ENABLE STUDENT USER SUBLOOP ae: '+ae+' ', data: JSON.stringify(estudianteYacudiente), result: preRelacionAcuEstu.rowCount })
            
            let estudiante_estudianterepitente = !!parseInt(inscripcion.fpartacademia[index].estudianterepitente)
            let estudiante_estudianteconocer = token.decriptar(inscripcion.fpartacademia[index].estudianteconocer) || 0
            let estudiante_estudiantecaracter = (inscripcion.fpartacademia[index].estudiantecaracter !== undefined)? token.decriptar(inscripcion.fpartacademia[index].estudiantecaracter) : null
            let estudiante_otrocolegiopais = parseInt(token.decriptar(inscripcion.fpartacademia[index].estudiantepaisanterior))||null
            let estudiante_otrocolegioprovincia = parseInt(token.decriptar(inscripcion.fpartacademia[index].estudiantedeptoanterior))||null
            let estudiante_otrocolegiociudad = parseInt(token.decriptar(inscripcion.fpartacademia[index].estudiantemupioanterior))||null
            let estudiante_estudianteconocerotro = (inscripcion.fpartacademia[index].estudianteconocercual !== undefined)? inscripcion.fpartacademia[index].estudianteconocercual.toLowerCase() : ''

            //DATOS DE ESTUDIANTE ACADEMIA
            let estudianteMasacademico = {
              text:`INSERT INTO data.aematriculas_academia
                (aeestudiantesacademia_id, aeestudiantes_id, aeestudiantesacademia_nuevo, aeestudiantesacademia_colegio_caracter, 
                  aeestudiantesacademia_colegio_pais, aeestudiantesacademia_colegio_provincia, aeestudiantesacademia_colegio_ciudad, aeestudiantesacademia_gradomatricula, 
                  aeestudiantesacademia_repitente, aeestudiantesacademia_conocernos, aeestudiantesacademia_conocernos_otro)
                VALUES((SELECT COALESCE(MAX(aeestudiantesacademia_id), 0)+1 FROM data.aematriculas_academia), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING aeestudiantesacademia_id;`,
              values: [
                elIdestudiante_academico, estudiante_estudiantenuevo, estudiante_estudiantecaracter, 
                  estudiante_otrocolegiopais, estudiante_otrocolegioprovincia, estudiante_otrocolegiociudad, estudiante_grado,
                  estudiante_estudianterepitente, estudiante_estudianteconocer, estudiante_estudianteconocerotro
                ]
            }
            console.log('insert datos academicos estudiante: ', estudianteMasacademico)

            let estudiante_masacademico = await Db.query(estudianteMasacademico)
            //console.log('La academica: ', estudiante_masacademico)
            //pruebadeEscritorio.push({ciclo: a, reference: 'INSERTING STUDENT DATA ACADEMIA SUBLOOP ae: '+ae+' ', data: JSON.stringify(estudianteMasacademico), result: estudiante_masacademico.rowCount })

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////        
            let estudiante_tiposangre = parseInt(token.decriptar(inscripcion.fpartdemografia[index].estudiantegruposanguineo))
            let estudiante_rh = inscripcion.fpartdemografia[index].estudianterh || '+'
            let estudiante_talla = inscripcion.fpartdemografia[index].estudiantetalla || '0'
            let estudiante_peso = parseFloat(inscripcion.fpartdemografia[index].estudiantepeso)
            let estudiante_sisben = !!parseInt(inscripcion.fpartdemografia[index].estudiantesisben) || false
            let estudiante_sisbennivel = (inscripcion.fpartdemografia[index].estudiantesisbennivel !== undefined)? parseInt(inscripcion.fpartdemografia[index].estudiantesisbennivel) : -1
            //console.log('El nivel del sisben del estudiante es: ', estudiante_sisbennivel)
            let estudiante_hermanos = parseInt(inscripcion.fpartdemografia[index].estudiantehermanos)
            let estudiante_hermanas = parseInt(inscripcion.fpartdemografia[index].estudiantehermanos)
            let estudiante_desplazado = !!parseInt(inscripcion.fpartdemografia[index].estudiantedesplazado) || false
            let estudiante_cirugia = !!parseInt(inscripcion.fpartdemografia[index].estudiantecirugia) || false
            let estudiante_cirugiacual = (inscripcion.fpartdemografia[index].estudiantecirugiacual !== undefined)? inscripcion.fpartdemografia[index].estudiantecirugiacual : ''
            let estudiante_tratamiento = !!parseInt(inscripcion.fpartdemografia[index].estudiantehermanos) || false
            let estudiante_tratamientocual = (inscripcion.fpartdemografia[index].estudiantetratamientocual !== undefined)? inscripcion.fpartdemografia[index].estudiantetratamientocual : ''
            let estudiante_nacimientopais = parseInt(token.decriptar(inscripcion.fpartdemografia[index].estudiantepais||'MTAxNw=='))
            let estudiante_nacimientoprovincia = parseInt(token.decriptar(inscripcion.fpartdemografia[index].estudiantedepto||'NzY='))
            let estudiante_nacimientociudad = parseInt(token.decriptar(inscripcion.fpartdemografia[index].estudiantemupio||'NDc='))
            let estudiante_estrato = parseInt(inscripcion.inscripcion[index].estudianteestrato)
            let estudiante_comuna = parseInt(inscripcion.inscripcion[index].estudiantecomuna) || 0
            let estudiante_barrio = inscripcion.inscripcion[index].estudianbarrio || ''
            let estudiante_eps = parseInt(token.decriptar(inscripcion.inscripcion[index].eps))
            let estudiante_discapacidad = parseInt(token.decriptar(inscripcion.fpartdemografia[index].estudiantediscapacidad))
            let estudiante_discapacidadotra = (inscripcion.fpartdemografia[index].estudiantediscapacidadcual !== undefined )? inscripcion.fpartdemografia[index].estudiantediscapacidadcual : ''
            let estudiante_etnia = parseInt(token.decriptar(inscripcion.fpartdemografia[index].estudianteetnia))

            //INSERTAR DATOS DEMOGRAFICOS DEL ACUDIENTE
            let estudianteMasdemografia = {
              text:`INSERT INTO data.aematriculas_demografia
                (aeestudiantesdemografia_id, aeestudiantes_id, aeestudiantesdemografia_fecharegistro, aeestudiantesdemografia_talla, 
                  aeestudiantesdemografia_peso, aeestudiantesdemografia_gruposanguineo, aeestudiantesdemografia_rh, aeestudiantesdemografia_discapacidad, 
                  aeestudiantesdemografia_discapacidad_otra, aeestudiantesdemografia_sisben, aeestudiantesdemografia_sisbennivel, aeestudiantesdemografia_eps, 
                  aeestudiantesdemografia_direccion, aeestudiantesdemografia_barrio, aeestudiantesdemografia_comuna, aeestudiantesdemografia_estrato, 
                  aeestudiantesdemografia_mupionacimiento, aeestudiantesdemografia_deptonacimiento, aeestudiantesdemografia_paisnacimiento, aeestudiantesdemografia_desplazado, 
                  aeestudiantesdemografia_cantidadhermanos, aeestudiantesdemografia_cantidadhermanas, aeestudiantesdemografia_cirugias, aeestudiantesdemografia_cirugias_cual, 
                  aeestudiantesdemografia_tratamientoterapia, aeestudiantesdemografia_tratamientoterapia_cual, aeestudiantesdemografia_etnia)
                VALUES((SELECT COALESCE(MAX(aeestudiantesdemografia_id), 0)+1 FROM data.aematriculas_demografia), $1, $2, $3, $4, $5, $6, $7, 
                $8, $9, $10, $11, 
                $12, $13, $14, $15, 
                $16, $17, $18, $19, 
                $20, $21, $22, $23, 
                $24, $25, $26)RETURNING aeestudiantesdemografia_id;`,
              values: [
                elIdestudiante_academico, ahora, estudiante_talla,
                  estudiante_peso, estudiante_tiposangre, estudiante_rh, estudiante_discapacidad,
                  estudiante_discapacidadotra, estudiante_sisben, estudiante_sisbennivel, estudiante_eps,
                  estudiante_direccion, estudiante_barrio, estudiante_comuna, estudiante_estrato,
                  estudiante_nacimientociudad, estudiante_nacimientoprovincia, estudiante_nacimientopais, estudiante_desplazado,
                  estudiante_hermanos, estudiante_hermanas, estudiante_cirugia, estudiante_cirugiacual,
                  estudiante_tratamiento, estudiante_tratamientocual, estudiante_etnia
                ]
            }
            console.log('insert datos demograficos estudiante: ', estudianteMasdemografia)
            let estudiante_masdemografia = await Db.query(estudianteMasdemografia)
            //pruebadeEscritorio.push({ciclo: a, reference: 'INSERTING STUDENT DATA DEMOGRAFIA SUBLOOP ae: '+ae+' ', data: JSON.stringify(estudianteMasdemografia), result: estudiante_masdemografia.rowCount })


            //INSERTAR FOTOS TOMADAS DEL ESTUDIANTE, LAS FOTOS YA FUERON CARGADAS EN EL uploadimages.js
            let aeadjuntos_fotoestudiante = req.body.adjuntoestudiantefoto
            let aeadjuntos_documentoestudiante = req.body.adjuntoestudianteidentidad
            let aeadjuntos_documentootroestudiante = req.body.adjuntoestudianteidentidad
            let aeadjuntos_epsafiliacion = req.body.adjuntofotocertificadoeps
            let aeadjuntos_vacunas = req.body.adjuntofotocertificadovacunas || null
            let adjuntos_certificadomedico = req.body.adjuntofotocertificadomedico || null
            let aeadjuntos_fotoacudiente = req.body.adjuntoacudientefoto
            let aeadjuntos_documentoacudiente = req.body.adjuntodocumentoacudiente
            let aeadjuntos_fotorespfinanciero = req.body.adjuntoresponsablefoto
            let aeadjuntos_documentoresponsable = req.body.adjuntofotodocumentoresponsable
            let aeadjuntos_cartalaboral = req.body.adjuntocartalaboral
            let aeadjuntos_facturaservicios = req.body.adjuntofotoreciboservicios

            if(aeadjuntos_documentoestudiante != "" && aeadjuntos_documentoestudiante != undefined && aeadjuntos_documentoestudiante != "undefined"){
              let estudianteMasAdjuntos = {
                text:`INSERT INTO data.aematriculas_adjuntos
                (aeestudiantes_id, aeadjuntos_fecharegistro, aeadjuntos_documentoestudiante, aeadjuntos_documentootroestudiante, 
                aeadjuntos_documentoacudiente, aeadjuntos_documentoresponsable, aeadjuntos_fotoestudiante, aeadjuntos_fotoacudiente, 
                aeadjuntos_fotorespfinanciero, aeadjuntos_facturaservicios, adjuntos_certificadomedico, aeadjuntos_vacunas, 
                aeadjuntos_epsafiliacion, aeadjuntos_pagadamatricula, aeadjuntos_pagadaotroscostos, aeadjuntos_contrato, 
                aeadjuntos_pagare, aeadjuntos_cartalaboral)
                VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING aeadjuntos_id;
                `,
                values: [
                  elIdestudiante_academico, ahora, aeadjuntos_documentoestudiante, aeadjuntos_documentootroestudiante,
                  aeadjuntos_documentoacudiente, aeadjuntos_documentoresponsable, aeadjuntos_fotoestudiante, aeadjuntos_fotoacudiente,
                  aeadjuntos_fotorespfinanciero, aeadjuntos_facturaservicios, adjuntos_certificadomedico, aeadjuntos_vacunas,
                  aeadjuntos_epsafiliacion, null, null, null,
                  null, aeadjuntos_cartalaboral
                ]
              }
              console.log('insert adjuntos estudiante: ', estudianteMasAdjuntos)
              let estudiante_masadjuntos = await Db.query(estudianteMasAdjuntos)
              //pruebadeEscritorio.push({ciclo: a, reference: 'INSERTING STUDENT DATA ADJUNTOS SUBLOOP ae: '+ae+' ', data: JSON.stringify(estudianteMasAdjuntos), result: estudiante_masadjuntos.rowCount })
            }

            //CONFIRMAR PARA ESTUDIANTE:
            //USUARIO CREADO, ACADEMICO CREADO, UNION CREADA, ESTUDIANTE-ACUDIENTE UNIDO

            totalMessages = "", inscripcionElmensaje = "", botonVerificarInscripcion = "", botonCompartirInscripcion = "", botonMaps = "", botonSocial = "", qrInscripcion = ""


            for(let ae=0; ae < acudienteInsertado.length; ae++){
              //console.log('Los acudientes: '+ae, acudienteInsertado)
              console.log('La demografia: '+ae, acudienteInsertado[ae].nombre)
              
              let urlAdministrativa = process.env.APP_API_FRONT+'/procesomatricula/'+token.encriptar(elIdestudiante_academico)+'/'+token.encriptar(sede)+'/'+token.encriptar(anolectivo)
              let urlRevision = process.env.APP_API_FRONT+'/matriculaestado.html?estudiante='+token.encriptar(elIdestudiante_academico) 

              botonVerificarInscripcion = generateButton.boton({type:'error',shape:'square',destination:urlRevision,text:' Verificar estado de la inscripción '})
              botonCompartirInscripcion = generateButton.boton({type:'success',shape:'square',text:' Compartir a otro padre de familia ', other: ' id="shareInscripcion" '})
              botonSocial = generateButton.boton({type:'default',shape:'square',link: sede_facebook,text:' Síganos en facebook '})
              botonMaps= generateButton.boton({type:'warn',shape:'square',link: sede_mapa,text:' Vea la ubicación del colegio '})
              //QRCODE FOR SHOW AND EMAIL
              let qrDestination = './public/archivos/instituciones/matriculas/'+sede+'/qr_'+sede+'_'+estudiante_documento+'.png';
              imagenQR = await qr.toDataURL(urlAdministrativa,{margin:5,width:500})
              console.log('la QR es esto: ', imagenQR)
              var imagenQRbase64 = imagenQR.replace(/^data:image\/png;base64,/, "");

              let existqrDestination = await token.fileExists(qrDestination);

              fs.writeFileSync(qrDestination, imagenQRbase64, {encoding: 'base64', flag: 'w'}, async function(){
                totalMessages = await alerta.send({
                  name:'Colarqui, soporte tecnico',
                  email:'colarqui@arquidiocesanos.edu.co,sentadoensilla@gmail.com,soporte@escuelapp.co',
                  message:{
                    titulo:'Problemas con el QR: '+(estudiante_nombres + ' ' + estudiante_apellidos),
                    message:`Revisar el servidor, hay problemas con el QR: 
                    Institucion: ${sede} : ${sede_nombre}
                    Estudiante: ${elIdestudiante_academico} -> ${estudiante_nombres}  ${estudiante_apellidos} (aeusu_id: ${elIdestudiante_usuario} )
                    Acudiente: ${elIdacudiente_academico} -> ${acudienteInsertado[ae].nombre} (aeusu_id: ${elIdacudiente_usuario} )
                    
                    Revisar el espacio en disco
                    
                    la QR: ${imagenQR} `,
                    extra: '<img src="'+imagenQR+'" />'
                  }
                })
              })

              imagenQR = process.env.APP_API_BACKEND+'/p/d/m/'+sede+'/qr_'+sede+'_'+estudiante_documento+'.png';

              console.log('la QR guardada aqui: ', imagenQR)


              inscripcionElmensaje = `Apreciado/a ${acudienteInsertado[ae].nombre} estamos complacidos de que haya
              elegido nuestra sede ${sede_nombre} como el segundo hogar de ${estudiante_nombres + ' ' + estudiante_apellidos}.<br/>
              <div class="card">
              <h5 class="h5 font-weight-bold">
                <a href="https://colegiosarquidiocesanos.edu.co/" target="_blank">Colegios arquidiocesanos</a>
              </h5>
              <p class="mb-0">Inscripcion/reserva registrada</p>
              <audio id="audio0" preload="true" controls autoplay>
                  <source src="sounds/instruccion_7.mp3">
              </audio>
              <!-- Card content
              <div class="card-body text-center">
                  <div id="audioplayer">
                    <i id="pButton" class="fa fa-play fa-2xl"></i>
                    <div id="timeline">
                      <div id="playhead"></div>
                    </div>
                    </div>
                  </div>
              -->
              </div>              
              <div style="padding:5%;width:100%;text-align:center;">
                <h4 style="color:#DA4453;text-align:center;">Presentar este código QR en el colegio (El código es único para cada estudiante)</h4>
                <img src="${imagenQR}" />
              </div>
              <br><br>`

              totalMessages = await alerta.send({
                name:acudienteInsertado[ae].nombre,
                email:acudienteInsertado[ae].correo,
                message:{
                  titulo:'Inscripción Colegios arquidiocesanos: '+(estudiante_nombres + ' ' + estudiante_apellidos),
                  message:inscripcionElmensaje,
                  extra: avisoimportante + botonVerificarInscripcion + botonCompartirInscripcion + qrInscripcion + botonSocial + botonMaps
                },
                adjuntos: costosMatriculaArchivo.recibos
              })
              //pruebadeEscritorio.push({ciclo: a, reference: 'SEND MAIL TO PARENTS:  Inscripción Colegios arquidiocesano', data: JSON.stringify(totalMessages), result: totalMessages })

            }

            //CONFIRMAR PARA ACUDIENTE:
            //USUARIO CREADO, ACADEMICO CREADO, UNION CREADA,ACUDIENTE-ESTUDIANTE UNIDO
            //ENVIAR A LOS CORREOS EL AVISO DE QUE YA FUE INSCRITO, EL QR PARA ESTAR REVISANDO
            //console.log('Datos para el acudiente: ', acudienteInsertado)
        }
        console.table(pruebadeEscritorio)
        res.status(200).send({status:'success',statusCode:200,message:acudienteInsertado.length+' Estudiantes matriculados ',token:{titulo:'Inscripción finalizada',message:inscripcionElmensaje + avisoimportante + botonVerificarInscripcion + botonCompartirInscripcion + qrInscripcion + botonSocial + botonMaps}})
    }catch (error) {
      //console.log(error.toString());
      //console.table(pruebadeEscritorio)
      res.status(400).send(error.toString());
    }

  },

  /**
   * facturarMuchachoNuevo return info bill to show after inscription for new students
   * to aprove it or process it
   * @param {*} muchacho={idestudiante,codigo,NOMBRECOMPLETO}
   * return HTMLstring saying you have to pay $$$ 
   */
  async facturarMuchachoNuevo(muchacho){
    try{

    }catch (error) {
      //console.log(error.toString());
      //console.table(pruebadeEscritorio)
      return error.toString();
    }
  },

  /**
   * facturarMuchachoAntiguo return info bill to show after inscription for old students
   * to aprove it or process it
   * @param {*} muchacho={idestudiante,codigo,NOMBRECOMPLETO}
   * return {result:true|false,message:go to principal|HTMLstring saying you have to pay $$$,PDFFile}
   */
  async facturarMuchachoAntiguo(muchacho){
    const facturafs = require("fs");
    var path = require("path");
    try{
      console.log("Entramos a facturarMuchachoAntiguo")

      if(muchacho.codigo != ""){
        let recibosEncontrados = []

        let buscado = muchacho.codigo.toString()
        let carpetas = ['/var/www/html/colarqui/matriculas/TA/','/var/www/html/colarqui/matriculas/TM/','/var/www/html/colarqui/matriculas/TO/']
        let recibosNombre = ['Otros_Costos','Matricula','Kit']
        
        carpetas.map((laRuta,item)=>{
          //ONLY MATCH FILES FOUND
          facturafs.readdirSync(laRuta).filter(fn => {
            if(fn.indexOf(buscado)>-1){
              recibosEncontrados[item] = { 
                filename: item+'_'+recibosNombre[item]+'.pdf', 
                path: laRuta + facturafs.readdirSync(laRuta).filter(fn => fn.indexOf(buscado)>-1)
              }
            }
          })
        })
      
        /*

        recibosEncontrados[item] = facturafs.readdirSync(laRuta).filter(fn => laRuta+fn.indexOf(buscado)>-1);
        laRuta = path.join(__dirname, '..', '..', 'matriculas', 'TA') //'/var/www/html/colarqui/matriculas/TA'
        recibosEncontrados[0] = facturafs.readdirSync(laRuta).filter(fn => fn.indexOf(buscado)>-1) || '';
        
        laRuta = path.join(__dirname, '..', '..', 'matriculas', 'TM') //'/var/www/html/colarqui/matriculas/TM'
        recibosEncontrados[1] = laRuta + facturafs.readdirSync(laRuta).filter(fn => fn.indexOf(buscado)>-1) || '';

        laRuta = path.join(__dirname, '..', '..', 'matriculas', 'TO') //'/var/www/html/colarqui/matriculas/TO'
        recibosEncontrados[2] = laRuta + facturafs.readdirSync(laRuta).filter(fn => fn.indexOf(buscado)>-1) || '';
        
        console.log('recibos encontrados: ', recibosEncontrados)
        recibosEncontrados.map((bills,index)=>{
          console.log('recibos encontrados['+index+']: ', bills)
          recibos[index] = {path: bills, filename: index + '_'+buscado}
        })
        */

        console.log("Entramos a facturarMuchachoAntiguo con codigo, recibos: ", recibosEncontrados)

        if(recibosEncontrados.length > 0){
          return {result:true,message:'El codigo no ha sido especificado',recibos:recibosEncontrados}
        }else{
          return {result:false,message:'No encontramos recibos',recibos:recibosEncontrados}
        }
      }else{
        console.log("Entramos a facturarMuchachoAntiguo sin codigo")

        return {result:false,message:'El codigo no ha sido especificado',recibos:[]}
      }
    }catch (error) {
      return error.toString();
    }
  },


  /**
   * buscarMuchachoMoroso return $$$ in debt or false
   * 
   * @param {*} muchacho={idestudiante,codigo,NOMBRECOMPLETO}
   * return debt || false
   */
  async buscarMuchachoMoroso(muchacho){
    try{
      let parecido = 0, parecidoDefinitivo = -1
      let deuda = await Db.query({
        text:queryes.inscripcionBuscarDeuda,
        values:[muchacho.codigo]         
      })
      //STUDENT HAS A DEBT, ITERATE TO SHOW AMOUNT OF THESE
      if(deuda.rows.length > 0){
        parecidoDefinitivo = -1
        console.table('La deuda: ', deuda.rows)
        deuda.rows.map((moroso, index) => {
          parecido = token.stringSimilarity(muchacho.nombrecompleto, moroso.estudiante)
          parecidoDefinitivo = (parecido>parecidoDefinitivo)? index : parecidoDefinitivo ;
        })
        console.log('El mas parecido es: ', deuda.rows[parecidoDefinitivo])
        if(parecidoDefinitivo >= 0){
          return ({
            status:true,
            estudiante:deuda.rows[parecidoDefinitivo].estudiante,
            deuda:deuda.rows[parecidoDefinitivo].deuda
          })
        }else{
          //NOT DEBT
          return ({
            status:false,
            estudiante:'',
            deuda:0
          })
        }
      }else{
        //NOT DEBT
        return ({
          status:false,
          estudiante:'',
          deuda:0
        })
      }
    }catch (error) {
      //console.log(error.toString());
      //console.table(pruebadeEscritorio)
      return error.toString();
    }
  },

  /**
   * preeditarMuchacho return inscription data for a student, show as data into school session
   * to aprove it or process it
   * @param {*} req 
   * @param {*} res 
   */
   async preeditarMuchacho(req,res){       
    let {elEstudiante} = req.body
    elEstudiante = (elEstudiante!="")? parseInt(token.decriptar(elEstudiante)) : null ;
    let resultado = []
    try{
      if(elEstudiante != null){
        let inscripcionEstudiante = await Db.query({
          text:queryes.inscripcionEstudiante,
          values:[elEstudiante]         
        })

        let inscripcionEstudianteAcademico = await Db.query({
          text:queryes.inscripcionEstudianteAcademico,
          values:[elEstudiante]         
        })

        let inscripcionEstudianteDemografico = await Db.query({
          text:queryes.inscripcionEstudianteDemografico,
          values:[elEstudiante]         
        })

        let inscripcionEstudianteAdjuntos = await Db.query({
          text:queryes.inscripcionEstudianteAdjuntos,
          values:[elEstudiante]         
        })

        let inscripcionEstudianteAcudiente = await Db.query({
          text:queryes.inscripcionEstudianteAcudiente,
          values:[elEstudiante]         
        })

        inscripcionEstudiante.rows.forEach((item)=>{
          resultado.push({
            estudiante: inscripcionEstudiante.rows,
            estudianteAcademico: inscripcionEstudianteAcademico.rows,
            estudianteDemografico: inscripcionEstudianteDemografico.rows,
            estudianteAdjunto: inscripcionEstudianteAdjuntos.rows,
            estudianteAcudiente: inscripcionEstudianteAcudiente.rows
          })
        });

        tok = await token.createtoken(resultado);
        res.status(200).send({status:'success',statusCode:200,message:resultado.length+' Estudiantes encontrados ',token:tok})
      }else{
        resultado = await token.createtoken(' El sistema no puede identificar el estudiante ')
        res.status(200).send({status:'success',statusCode:200,message:' El sistema no puede identificar el estudiante ',token:resultado})
      }

    }catch (error) {
      //console.log(error.toString());
      res.status(400).send(error.toString());
    }
  },

  /**
   * editarMuchacho return previous data for students, put in inscription form
   * @param {*} req: estudiantes_id or 
   * @param {*} res message, and mail message
   * @param {*} next call editarMuchacho if mail (parent or student) exist
   */
  async editarMuchacho(req,res,next){
    try{
      const inscripcion = JSON.parse(req.body.inscripcion)
      let acudienteInsertado = [], estudianteInsertado = []
      let totalMessages = "", inscripcionElmensaje = "", botonVerificarInscripcion = "", botonCompartirInscripcion = "", botonMaps = "", botonSocial = "", qrInscripcion = ""
      
      console.log('Completo: ', inscripcion)

      //RECORREMOS CADA ESTUDIANTE EN LA INSCRIPCION
      //inscripcion.inscripcion.forEach((estudiante, index) => {
      for(var index = 0; index < inscripcion.inscripcion.length; index++){

        acudienteInsertado = [], estudianteInsertado = []

        let sede = parseInt(token.decriptar(inscripcion.inscripcion[index].sede))
        let sede_nombre = inscripcion.inscripcion[index].sedenombre
        let sede_correo = inscripcion.inscripcion[index].sedecorreo
        let sede_facebook = inscripcion.inscripcion[index].sedefacebook
        let sede_mapa = inscripcion.inscripcion[index].sedemapa
        let anolectivo = parseInt(token.decriptar(inscripcion.inscripcion[index].anolectivo))
        let estudiante_id = parseInt(token.decriptar(inscripcion.inscripcion[index].estudiante))
        let acudiente_id = parseInt(token.decriptar(inscripcion.inscripcion[index].acudiente))


        console.log('Los datos llegaron: sede '+sede+', ano: '+anolectivo+', index: '+index)
          //INICIO CICLO RECORRER LOS ACUDIENTES
          //inscripcion.fpartacudientes.forEach(async (acudiente, a) => {
          for(var a=0; a < inscripcion.fpartacudientes.length; a++){

            let acudiente_correo = inscripcion.fpartacudientes[a].acudientecorreo.trim().toLowerCase()
            console.log('Inside fpartacudientes: '+a+' : ', acudiente_correo)

            let acudiente_tipodocumento = parseInt(token.decriptar(inscripcion.fpartacudientes[a].acudientetipodocumento))
            let acudiente_identificacion = inscripcion.fpartacudientes[a].acudienteidentificacion.trim()
            let acudiente_nombres = inscripcion.fpartacudientes[a].acudientenombres.trim().toLowerCase()
            let acudiente_apellidos = inscripcion.fpartacudientes[a].acudienteapellidos.trim().toLowerCase()
            let acudiente_telefono = inscripcion.fpartacudientes[a].acudientetelefono.trim()
            let acudiente_telefonoempresa = inscripcion.fpartacudientes[a].acudientetelefonotrabajo.trim()

            let acudiente_celular = inscripcion.fpartacudientes[a].acudientecelular.trim()
            let acudiente_empresa = inscripcion.fpartacudientes[a].acudienteempresa.trim()
            let acudiente_direccion = inscripcion.fpartacudientes[a].acudientedireccion_1.trim() + ' ' + inscripcion.fpartacudientes[a].acudientedireccion_2.trim() + ' ' + inscripcion.fpartacudientes[a].acudientedireccion_3.trim()
            let acudiente_cargo = inscripcion.fpartacudientes[a].acudientecargo.trim()
            let acudiente_convive = !!parseInt(inscripcion.fpartacudientes[a].acudienteconvive)
            let acudiente_principal = !!parseInt(inscripcion.fpartacudientes[a].acudienteprincipal)
            let acudiente_responsable = !!parseInt(inscripcion.fpartacudientes[a].acudienteresponsable)

            let acudiente_parentezco = parseInt(token.decriptar(inscripcion.fpartacudientes[a].acudienteparentezco))
            let acudiente_microempresa = !!parseInt(inscripcion.fpartacudientes[a].acudientemicroempresa)
            let acudiente_microempresatipo = parseInt(token.decriptar(inscripcion.fpartacudientes[a].acudientemicroempresatipo))
            let acudiente_parentezcootro = inscripcion.fpartacudientes[a].acudienteparentezcocual.trim().toLowerCase()
            //let acudiente_nombres = inscripcion.fpartacudientes[index].acudienteapellidos

            /*
            //WHEN PARENTEZCOOTRO HAS A VALUE TRY INSERT IT
            if(acudiente_parentezcootro!=''){
              let masParentezcos = await Db.query({
                text: queryes.insertarParentezco,
                values: [acudiente_parentezcootro]
              })              
            }
            */

            //UPDATE USER VERIFING EMAIL PREVIOUSLY
            let lookUserParent = {
              text: `SELECT aeusu_nombre, aeroll_id, aeusu_estado
              FROM engine.aeusu
              WHERE aeusu_nick=$1`,
              values: [acudiente_correo]
            }

            let previo_acudiente = await Db.query(lookUserParent)

          //IF EXIST ALL END
            if(previo_acudiente.rows[0].aeusu_nombre.toLowerCase() == acudiente_correo){
              res.status(200).send({
                status:'success',
                statusCode:200,
                message:' El correo de acudiente ya se encuentra registrado ',
                token:{
                  titulo:' El correo de acudiente ya se encuentra registrado ',
                  message:'El correo del acudiente '+acudiente_correo+' se encuentra registrado, por favor corregirlo'
                }
              })
            }

            let acudienteUsuario = {
              text: `UPDATE engine.aeusu
              SET aeusu_nombre=$1, aeusu_nick=$2, aeusu_llave=$3, aeroll_id=$4, aeusu_estado=$5
              WHERE aeusu_id=(SELECT aeusu_id FROM data.aematriculas_acudientes WHERE aeacudientes_mail=$2) RETURNING aeusu_id`,
              values: [acudiente_nombres + ' ' + acudiente_apellidos,acudiente_correo,token.encriptar(acudiente_identificacion),6,1]
            }
            console.log('update command: ', acudienteUsuario)

            let acudiente_usuario = await Db.query(acudienteUsuario)

            //INSERT ACUDIENTES FOR STUDENT 
            let acudienteacademico = {
              text: `UPDATE data.aematriculas_acudientes
              SET 
                aeacudientes_id, aeusu_id, aeacudientes_nombres=$2, aeacudientes_apellidos=$3, aeacudientes_tipoidentificacion=$4, 
                  aeacudientes_identificacion=$5, aeacudientes_telresidencia=$6, aeacudientes_celpersonal=$7, aeacudientes_empresatelefono=$8, 
                  aeacudientes_mail=$9, aeacudientes_empresa=$10, aeacudientes_empresacargo=$11, aeacudientes_empresadireccion=$12, 
                  aeacudientes_empresario=$13, aeacudientes_empresariotipo=$14, aeacudientes_parentezcootro=$15
              WHERE aeacudientes_id=$16)RETURNING aeacudientes_id;`,
              values: [parseInt(acudiente_usuario.rows[0].aeusu_id),acudiente_nombres,acudiente_apellidos, acudiente_tipodocumento,
                acudiente_identificacion, acudiente_telefono, acudiente_celular, acudiente_telefonoempresa, 
                acudiente_correo, acudiente_empresa, acudiente_cargo, acudiente_direccion,
                acudiente_microempresa, acudiente_microempresatipo, acudienteparentezcootro, acudiente_id
              ]
            }
            console.log('update acudiente academico: ', acudienteacademico)

            let acudiente_academico = await Db.query(acudienteacademico)

            acudienteInsertado.push({
              usuario_id: parseInt(acudiente_usuario.rows[0].aeusu_id), 
              acudiente_id: parseInt(acudiente_academico.rows[0].aeacudientes_id), 
              correo: acudiente_correo,
              nombre: acudiente_nombres + ' ' + acudiente_apellidos,
              parentezco: acudiente_parentezco,
              presente: acudiente_convive,
              esacudiente: acudiente_principal,
              esresponsable: acudiente_responsable
            })

          }//FIN CICLO QUE RECORRE CADA ACUDIENTE

          
          //let estudiante_id = parseInt(token.decriptar(inscripcion.inscripcion[index].estudiante))
          let estudiante_tipodocumento = parseInt(token.decriptar(inscripcion.inscripcion[index].estudiantetipodocumento))
          let estudiante_documento = inscripcion.inscripcion[index].estudianteidentificacion
          let estudiante_correo = inscripcion.inscripcion[index].estudiantecorreo.trim().toLowerCase()
          let estudiante_nombres = inscripcion.inscripcion[index].estudiantenombres.trim().toLowerCase()
          let estudiante_apellidos = inscripcion.inscripcion[index].estudianteapellidos.trim().toLowerCase()
          let estudiante_fechanacimiento = inscripcion.inscripcion[index].estudiantenacimiento.trim()
          let estudiante_genero = inscripcion.inscripcion[index].estudiantegenero.trim()
          let estudiante_grado = parseInt(token.decriptar(inscripcion.inscripcion[index].grado))

          let estudiante_direccion = inscripcion.inscripcion[index].estudiantedireccion_1.trim() + ' ' 
          + inscripcion.inscripcion[index].estudiantedireccion_2.trim() + ' ' 
          + inscripcion.inscripcion[index].estudiantedireccion_3.trim()
          + (inscripcion.inscripcion[index].estudiantedireccion_4 != "") ? ' | '+(inscripcion.inscripcion[index].estudiantedireccion_4.trim()||'') : null ;
          
          let estudiante_telefono = inscripcion.inscripcion[index].estudiantetelefono.trim()

          //LOOK USER FROM STUDENT BY EMAIL
          let lookUserStudent = {
            text: `SELECT aeusu_nombre, aeroll_id, aeusu_estado
            FROM engine.aeusu
            WHERE aeusu_nick=$1`,
            values: [estudiante_correo]
          }

          let previo_estudiante = await Db.query(lookUserStudent)

          //IF EXIST ALL END
          if(previo_estudiante.rows[0].aeusu_nombre.toLowerCase() == estudiante_correo){
            res.status(200).send({
              status:'success',
              statusCode:200,
              message:' El correo de estudiante ya se encuentra registrado ',
              token:{
                titulo:' El correo de estudiante ya se encuentra registrado ',
                message:'El correo del estudiante '+estudiante_correo+' se encuentra registrado, por favor corregirlo'
              }
            })
          }

          let estudianteUsuario = {
            text: `UPDATE engine.aeusu
            SET aeusu_nombre=$1, aeusu_nick=$2, aeusu_llave=$3, aeroll_id=$4, aeusu_estado=$5
            WHERE aeusu_id=(SELECT aeusu_id FROM data.aematriculas_estudiantes WHERE aeestudiantes_mail=$2) RETURNING aeusu_id;`,
            values: [(estudiante_nombres + ' ' + estudiante_apellidos),estudiante_correo,token.encriptar(estudiante_documento),3,1,null]
          }

          console.log('update usuario estudiante: ', estudianteUsuario)

          let usuario = await Db.query(estudianteUsuario)
          usuario_id = parseInt(usuario.rows[0].aeusu_id)      

//HASTA AQUI VAMOS BIEN

          let estudianteAcademico = {
            text: `INSERT INTO data.aematriculas_estudiantes
          (aeestudiantes_id, aeinstitucion_id, aeano_id, aeusu_id, aeacudientes_id, aeestudiantes_fecharegistro, aeestudiantes_estado, 
            aeestudiantes_grado, aeestudiantes_grupo, aeestudiantes_nombres, aeestudiantes_apellidos, 
            aeestudiantes_tipodocumento, aeestudiantes_identificacion, aeestudiantes_fechanacimiento, aeestudiantes_genero, 
            aeestudiantes_direccion, aeestudiantes_telefono, aeestudiantes_mail, aeestudiantes_codigo, aeestudiantes_jornada)
          VALUES((SELECT COALESCE(MAX(aeestudiantes_id), 0)+1 FROM data.aematriculas_estudiantes), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)RETURNING aeestudiantes_id;`,
          values: [sede, anolectivo, usuario_id, null, ahora, 9,
            estudiante_grado, null, estudiante_nombres, estudiante_apellidos,
            estudiante_tipodocumento, estudiante_documento, estudiante_fechanacimiento, estudiante_genero,
            estudiante_direccion, estudiante_telefono, estudiante_correo, null, null]
          }
          console.log('insert usuario academico: ', estudianteAcademico)

          let estudiante_academico = await Db.query(estudianteAcademico)
          console.log('results usuario academico: ', estudiante_academico)

          estudianteInsertado = (estudiante_academico.rowCount > 0)? estudiante_academico.rows[0].aeestudiantes_id : null ; 
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////        
          //INSERCION DE RELACION ENTRE ESTUDIANTES E INSTITUCION Y ESTUDIANTE Y ACUDIENTE
          //ESTUDIANTE Y ACUDIENTE
          //RECORREMOS LOS ACUDIENTES REGISTRADOS EN LA DB, ASOCIAMOS A CADA ESTUDIANTE
          let relacionesRegistradas = 0
          
          for(let ae=0; ae < acudienteInsertado.length; ae++){
            let estudianteYacudiente = {
              text: `INSERT INTO data.estudiantes_acudientes
                (aeestuacu_id, aeestuacu_fecharegistro, aeestudiantes_id, aeacudientes_id, aeestuacu_parentezco, 
                  aeestuacu_presente, aeestuacu_acudiente, aeestuacu_responsablefinanciero, aeestuacu_estado)
                VALUES((SELECT COALESCE(MAX(aeestuacu_id), 0)+1 FROM data.estudiantes_acudientes), $1, $2, $3, $4, 
                $5, $6, $7, $8)RETURNING aeestuacu_id;`,
              values: [ahora, estudianteInsertado, acudienteInsertado[ae].acudiente_id, acudienteInsertado[ae].parentezco, 
                acudienteInsertado[ae].presente, acudienteInsertado[ae].esacudiente, acudienteInsertado[ae].esresponsable, 1]
            }

            console.log('insert union estudiante y acudiente: ', estudianteYacudiente)

            let preRelacionAcuEstu = await Db.query(estudianteYacudiente)
            relacionesRegistradas = parseInt(preRelacionAcuEstu.rowCount)

            let estudianteYusuario = {
              text: `INSERT INTO engine.aeusuroll
                  (aeusuroll_id, aeroll_id, aeusu_id, aeacad_referencia, aeinst_id, aeanol_id, aeusuroll_estado)
                VALUES((SELECT COALESCE(MAX(aeusuroll_id), 0)+1 FROM engine.aeusuroll), $1, $2, $3, $4, $5, $6)RETURNING aeroll_id;`,
              values: [6, acudienteInsertado[ae].usuario_id, acudienteInsertado[ae].acudiente_id, sede, anolectivo, 1]
            }

            console.log('insert asociacion usuario: ', estudianteYusuario)

            let preRelacionEstuUsu = await Db.query(estudianteYusuario)
            relacionesRegistradas = parseInt(preRelacionEstuUsu.rowCount)
            console.log('Relaciones registradas: ', preRelacionEstuUsu)
          }
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////        
          //HABILITAR EL USUARIO PARA CADA ESTUDIANTE 
          let estudianteYacudiente = {
            text: `
              INSERT INTO engine.aeusuroll
                (aeusuroll_id, aeroll_id, aeusu_id, aeacad_referencia, aeinst_id, aeanol_id, aeusuroll_estado)
              VALUES((SELECT COALESCE(MAX(aeusuroll_id), 0)+1 FROM engine.aeusuroll), $1, $2, $3, $4, $5, $6)RETURNING aeroll_id;`,
            values: [3, usuario_id, estudianteInsertado, sede, anolectivo, 1]
          }
          console.log('insert asociar estudiante y usuario: ', estudianteYacudiente)

          let preRelacionAcuEstu = await Db.query(estudianteYacudiente)
          console.log('La preRelacionAcuEstu: ', preRelacionAcuEstu)

          relacionesRegistradas = parseInt(preRelacionAcuEstu.rowCount)

          let estudiante_estudiantenuevo = !!parseInt(inscripcion.fpartacademia[index].estudiantenuevo||0)
          let estudiante_estudianterepitente = !!parseInt(inscripcion.fpartacademia[index].estudianterepitente||0)
          let estudiante_estudianteconocer = token.decriptar(inscripcion.fpartacademia[index].estudianteconocer||'MA==')
          let estudiante_estudiantecaracter = token.decriptar(inscripcion.fpartacademia[index].estudiantecaracter||'')
          let estudiante_otrocolegiopais = parseInt(token.decriptar(inscripcion.fpartacademia[index].estudiantepaisanterior||'MQ=='))
          let estudiante_otrocolegioprovincia = parseInt(token.decriptar(inscripcion.fpartacademia[index].estudiantedeptoanterior||'MQ=='))
          let estudiante_otrocolegiociudad = parseInt(token.decriptar(inscripcion.fpartacademia[index].estudiantemupioanterior||'MQ=='))
          let estudiante_estudianteconocerotro = inscripcion.fpartacademia[index].estudianteconocercual || ''

          //DATOS DE ESTUDIANTE ACADEMIA
          let estudianteMasacademico = {
            text:`INSERT INTO data.aematriculas_academia
              (aeestudiantesacademia_id, aeestudiantes_id, aeestudiantesacademia_nuevo, aeestudiantesacademia_colegio_caracter, 
                aeestudiantesacademia_colegio_pais, aeestudiantesacademia_colegio_provincia, aeestudiantesacademia_colegio_ciudad, aeestudiantesacademia_gradomatricula, 
                aeestudiantesacademia_repitente, aeestudiantesacademia_conocernos, aeestudiantesacademia_conocernos_otro)
              VALUES((SELECT COALESCE(MAX(aeestudiantesacademia_id), 0)+1 FROM data.aematriculas_academia), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING aeestudiantesacademia_id;`,
            values: [
                estudianteInsertado, estudiante_estudiantenuevo, estudiante_estudiantecaracter, 
                estudiante_otrocolegiopais, estudiante_otrocolegioprovincia, estudiante_otrocolegiociudad, estudiante_grado,
                estudiante_estudianterepitente, estudiante_estudianteconocer, estudiante_estudianteconocerotro
              ]
          }
          console.log('insert datos academicos estudiante: ', estudianteMasacademico)


          let estudiante_masacademico = await Db.query(estudianteMasacademico)
          console.log('La academica: ', estudiante_masacademico)

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////        
          let estudiante_tiposangre = parseInt(token.decriptar(inscripcion.fpartdemografia[index].estudiantegruposanguineo))
          let estudiante_rh = inscripcion.fpartdemografia[index].estudianterh
          let estudiante_talla = inscripcion.fpartdemografia[index].estudiantetalla
          let estudiante_peso = parseFloat(inscripcion.fpartdemografia[index].estudiantepeso)
          let estudiante_sisben = !!parseInt(inscripcion.fpartdemografia[index].estudiantesisben|| 0)
          let estudiante_sisbennivel = parseInt(inscripcion.fpartdemografia[index].estudiantesisbennivel) || -1
          let estudiante_hermanos = parseInt(inscripcion.fpartdemografia[index].estudiantehermanos) || 0
          let estudiante_hermanas = parseInt(inscripcion.fpartdemografia[index].estudiantehermanos) || 0
          let estudiante_desplazado = !!parseInt(inscripcion.fpartdemografia[index].estudiantedesplazado|| 0)
          let estudiante_cirugia = !!parseInt(inscripcion.fpartdemografia[index].estudiantecirugia|| 0)
          let estudiante_cirugiacual = inscripcion.fpartdemografia[index].estudiantecirugiacual || ''
          let estudiante_tratamiento = !!parseInt(inscripcion.fpartdemografia[index].estudiantetratamiento|| 0)
          let estudiante_tratamientocual = inscripcion.fpartdemografia[index].estudiantetratamientocual || ''
          let estudiante_nacimientopais = parseInt(token.decriptar(inscripcion.fpartdemografia[index].estudiantepais||'NDc='))
          let estudiante_nacimientoprovincia = parseInt(token.decriptar(inscripcion.fpartdemografia[index].estudiantedepto||'NzY='))
          let estudiante_nacimientociudad = parseInt(token.decriptar(inscripcion.fpartdemografia[index].estudiantemupio||'MTAxNw=='))
          let estudiante_estrato = parseInt(inscripcion.inscripcion[index].estudianteestrato)
          let estudiante_comuna = parseInt(inscripcion.inscripcion[index].estudiantecomuna)
          let estudiante_barrio = inscripcion.inscripcion[index].estudianbarrio || ''
          let estudiante_eps = parseInt(token.decriptar(inscripcion.inscripcion[index].eps))
          let estudiante_discapacidad = parseInt(token.decriptar(inscripcion.fpartdemografia[index].estudiantediscapacidad))
          let estudiante_discapacidadotra = inscripcion.fpartdemografia[index].estudiantediscapacidadcual.trim().toLowerCase() || ''        
          let estudiante_etnia = parseInt(token.decriptar(inscripcion.fpartdemografia[index].estudianteetnia))

          //INSERTAR DATOS DEMOGRAFICOS DEL ACUDIENTE
          let estudianteMasdemografia = {
            text:`INSERT INTO data.aematriculas_demografia
              (aeestudiantesdemografia_id, aeestudiantes_id, aeestudiantesdemografia_fecharegistro, aeestudiantesdemografia_talla, 
                aeestudiantesdemografia_peso, aeestudiantesdemografia_gruposanguineo, aeestudiantesdemografia_rh, aeestudiantesdemografia_discapacidad, 
                aeestudiantesdemografia_discapacidad_otra, aeestudiantesdemografia_sisben, aeestudiantesdemografia_sisbennivel, aeestudiantesdemografia_eps, 
                aeestudiantesdemografia_direccion, aeestudiantesdemografia_barrio, aeestudiantesdemografia_comuna, aeestudiantesdemografia_estrato, 
                aeestudiantesdemografia_mupionacimiento, aeestudiantesdemografia_deptonacimiento, aeestudiantesdemografia_paisnacimiento, aeestudiantesdemografia_desplazado, 
                aeestudiantesdemografia_cantidadhermanos, aeestudiantesdemografia_cantidadhermanas, aeestudiantesdemografia_cirugias, aeestudiantesdemografia_cirugias_cual, 
                aeestudiantesdemografia_tratamientoterapia, aeestudiantesdemografia_tratamientoterapia_cual, aeestudiantesdemografia_etnia)
              VALUES((SELECT COALESCE(MAX(aeestudiantesdemografia_id), 0)+1 FROM data.aematriculas_demografia), $1, $2, $3, $4, $5, $6, $7, 
              $8, $9, $10, $11, 
              $12, $13, $14, $15, 
              $16, $17, $18, $19, 
              $20, $21, $22, $23, 
              $24, $25, $26)RETURNING aeestudiantesdemografia_id;`,
            values: [
                estudianteInsertado, ahora, estudiante_talla,
                estudiante_peso, estudiante_tiposangre, estudiante_rh, estudiante_discapacidad,
                estudiante_discapacidadotra, estudiante_sisben, estudiante_sisbennivel, estudiante_eps,
                estudiante_direccion, estudiante_barrio, estudiante_comuna, estudiante_estrato,
                estudiante_nacimientociudad, estudiante_nacimientoprovincia, estudiante_nacimientopais, estudiante_desplazado,
                estudiante_hermanos, estudiante_hermanas, estudiante_cirugia, estudiante_cirugiacual,
                estudiante_tratamiento, estudiante_tratamientocual, estudiante_etnia
              ]
          }
          console.log('insert datos demograficos estudiante: ', estudianteMasdemografia)
          let estudiante_masdemografia = await Db.query(estudianteMasdemografia, (err, res) => {
            console.log(err, res);
          })
          console.log('RESULTS OF insert datos demograficos estudiante: ', estudiante_masdemografia)

          //CONFIRMAR PARA ESTUDIANTE:
          //USUARIO CREADO, ACADEMICO CREADO, UNION CREADA, ESTUDIANTE-ACUDIENTE UNIDO

          totalMessages = "", inscripcionElmensaje = "", botonVerificarInscripcion = "", botonCompartirInscripcion = "", botonMaps = "", botonSocial = "", qrInscripcion = ""


          for(let ae=0; ae < acudienteInsertado.length; ae++){
            console.log('Los acudientes: '+ae, acudienteInsertado)
            console.log('La demografia: '+ae, acudienteInsertado[ae].nombre)
            

            botonVerificarInscripcion = generateButton.boton({type:'error',shape:'square',destination:'matriculaestado.html?estudiante='+token.encriptar(estudianteInsertado),text:' Verificar estado de la inscripción '})
            botonCompartirInscripcion = generateButton.boton({type:'success',shape:'square', other: ' id="shareInscripcion" '})
            botonSocial = generateButton.boton({type:'default',shape:'square',link: sede_facebook,text:' Síganos en facebook '})
            botonMaps= generateButton.boton({type:'warn',shape:'square',link: sede_mapa,text:' Vea la ubicación del colegio '})

            inscripcionElmensaje = `Apreciado/a ${acudienteInsertado[ae].nombre} los colegios arquidiocesanos le dan la bienvenida a nuestra gran institución, estamos complacidos de que haya
            elegido nuestra sede ${sede_nombre} como el segundo hogar de ${estudiante_nombres + ' ' + estudiante_apellidos}.  Vamos a poner todo de nuestra parte para brindarle conocimientos y valores que lo 
            consoliden como un miembro valioso de la sociedad.<br><br>
            En este momento el estado de este proceso es "Inscrito", en la sede elegida van a efectuar los procesos requeridos en estos casos para matricular al estudiante, usted puede verificar
            el estado del proceso en cualquier momento dando clic en el botón de abajo.<br><br>
            En los próximos dias usted recibirá un correo electrónico notificando el estado de matriculado y las instrucciones finales para que firme los documentos correspondientes 
            o alguna novedad y las instrucciones del caso.<br><br>
            
            Si lo prefiere puede compartir con alguien interesado para que inscriba estudiantes en alguna de nuestras sedes, con los botones de abajo.<br><br>
            Gracias por elegirnos<br><br>`

              totalMessages = await alerta.send({
                name:acudienteInsertado[ae].nombre,              
                email:acudienteInsertado[ae].correo,
                message:{
                  titulo:'Inscripción Colegios arquidiocesanos: '+(estudiante_nombres + ' ' + estudiante_apellidos),
                  message:inscripcionElmensaje,
                  extra: botonVerificarInscripcion + botonCompartirInscripcion + qrInscripcion + botonSocial + botonMaps
                }
              })
          }

          //CONFIRMAR PARA ACUDIENTE:
          //USUARIO CREADO, ACADEMICO CREADO, UNION CREADA,ACUDIENTE-ESTUDIANTE UNIDO

          //ENVIAR A LOS CORREOS EL AVISO DE QUE YA FUE INSCRITO, EL QR PARA ESTAR REVISANDO


          console.log('Datos para el acudiente: ', acudienteInsertado)

      }

      res.status(200).send({status:'success',statusCode:200,message:acudienteInsertado.length+' Estudiantes matriculados ',token:{titulo:'Inscripción finalizada',message:inscripcionElmensaje + botonVerificarInscripcion + botonCompartirInscripcion + qrInscripcion + botonSocial + botonMaps}})

      
    }catch (error) {
      res.status(400).send(error.toString());
    }
  },
  

  /**
   * validMails SEND VERIFY PHRASE TO EMAIL FOR TESTING PROPOUSE
   * @param {*} req: email
   */  
  async validMails(req,res,next){
    try{
      let {email} = req.body
      let frase = token.randomString(6)
      //console.log('Este es el email: ', token.validEmail(email))
      if(token.validEmail(email)!=null){
        totalMessages = await alerta.send({
          name:'Acudiente colarqui',
          email:email,
          message:{
            titulo:'Colarqui, verificando tu email ',
            message:`<div style="padding:5%;width:100%;text-align:center;">
              <h4 style="color:#DA4453;text-align:center;">Frase de verificación para ${email}</h4>
              <div style="padding:5%;width:100%;font-size:36pt;font-family:Roboto,georgia,serif;text-align:center;"> ${frase} </div>
              <br>
              <p style="padding:5%;width:100%;color:#2C7695;font-size:15pt;text-align:center;">La anterior frase de verificacion debes escribir la en el formulario de inscripción, justo debajo de ${email} </p>
              <div style="background:#2C7695;padding:5%;width:100%;color:#FFFFFF;font-size:15pt;text-align:center;text-decoration:none;">
                Por favor agregar soporte@escuelapp.co como contacto para evitar que vaya al spam
              </div>
            </div>`,
            extra:`<br><br>`
          }
        })
        res.status(200).send({status:'success',statusCode:200,message:' Frase enviada al correo '+email,token:token.encriptarHash(frase)})

      }else{
        res.status(200).send({status:'success',statusCode:200,message:' El email es invalido ',token:''})
      }

    }catch(error){
      console.log(error.toString());
      res.status(400).send(error.toString());
    }
  }
}