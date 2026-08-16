require('dotenv').config()
const Db = require('../database/conex');
const token = require('../utils/token');
const totalQueryes = require('../sql/total');
const {privateRoutes} = require('../routes/routes');
var moment = require('moment-timezone');
// const { query } = require('../database/pgpromise');
moment.tz.setDefault("America/Bogota")
//const ahora = moment().format('YYYY-MM-DD HH:mm:ss');
const ahora = moment().format();


module.exports = {

    /**
     * totalTeachersWorking: show teachers making numbers in students attendances
     * @param {*} req id_institucion masquerade integer
     * @param {*} res [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}]
     */
    async totalTeacherAttendance(req, res){
      let resultadoFinal = {}
        try {
          let { id_institucion } = req.body;         
    
          if (typeof id_institucion != "undefined" && id_institucion != null && id_institucion != "") {
            id_institucion = parseInt(token.decriptar(id_institucion));
            // DOCENTES REGISTRANDO ASISTENCIAS
            await Db.query({
              text: totalQueryes.totalTeacherAttendance,
              values: [id_institucion],
            })
              .then(async (results) => {
                  results.rows.map((elDato,d) => {
                      results.rows[d].id_institucion = token.encriptar(elDato.id_institucion)
                  })
                  let performance = (parseInt(results.rows[0].marcando)||0)/(parseInt(results.rows[0].totales)||1)
                  let colorData = token.statsColor('hex',performance.toFixed(1))
                  
                  resultadoFinal = {
                    id_institucion: results.rows[0].id_institucion,
                    title:'Docentes y asistencias',
                    id:'totalTeacherAttendance',
                    caption:`Docentes marcando asistencias en ${results.rows[0].sede}`,
                    data:[{
                      caption: 'marcando',
                      value: parseInt(results.rows[0].marcando),
                      colorText: colorData.text||'#222222',
                      colorBackground: colorData.background||'#ffc107'
                    },{
                      caption: 'total docentes',
                      value: parseInt(results.rows[0].totales),
                      colorText: colorData.text||'#222222',
                      colorBackground: colorData.background||'#ffc107'
                    },{
                      caption: '% marcando',
                      value: parseFloat((performance*100).toFixed(1)),
                      aditional: '%',
                      colorText: colorData.text||'#222222',
                      colorBackground: colorData.background||'#ffc107'
                    }]
                  }

                  res.send({
                    status: "success",
                    statusCode: 200,
                    message: 'Resultados encontrados',
                    rows: resultadoFinal
                  });
              })
              .catch((error) => {
                console.log('Error try: ', error)
                res.send({
                  status: "error",
                  statusCode: 400,
                  message: '0 Resultados encontrados',
                  rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
                });
              });                
          }else{
            res.send({
                status: "error",
                statusCode: 400,
                message: 'La institucion requerida no esta disponible',
                rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
            });
          }

        } catch (error) {
          console.log('totalStatsEmpresa: ', error)
          res.send({
            status: "error",
            statusCode: 400,
            message: 'El sistema experimenta errores inesperados, por favor intente mas tarde', //error.toString()
            rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}]
          });
        }
    },

    /**
     * totalTeachersWorking: show teachers making numbers in students attendances
     * @param {*} req id_institucion masquerade integer
     * @param {*} res [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}]
     */
    async totalTeacherAttendanceDay(req, res){
      let resultadoFinal = {}
        try {
          
          let anolectivo = token.decriptar(req.user.usuarioAnoId)
          let id_institucion = parseInt(token.decriptar(req.user.academicoId)) 
          let dias = 15     
          let { fechaini, fechafin, mes} = req.body;
  

          if (typeof id_institucion != "undefined" && id_institucion != null && id_institucion != "") {
            // DOCENTES REGISTRANDO ASISTENCIAS
            await Db.query({
              text: totalQueryes.totalTeacherAttendanceByDay,
              values: [id_institucion, fechaini, fechafin],
            })
              .then(async (results) => {
                  let losLabel = [], losData = []

                  results.rows.map((elDato,d) => {
                      losLabel.push(elDato.dia)
                      losData.push(parseInt(elDato.docentesregistrantes))
                  })

                  console.log('Datos de usuario: ', [id_institucion, fechaini, fechafin])
                  
                  resultadoFinal = {
                    id_institucion: results.rows[0].id_institucion,
                    title:'Docentes marcando por dia',
                    id:'totalTeacherAttendance',
                    caption:`Cantidad de docentes marcando asistencias en ${req.user.usuarioInstitucionNombre}  entre ${fechafin.split("T")[0]} y ${fechaini.split("T")[0]}`,
                    barColor: '#17a2b8',
                    borderColor: '#17a2b8',
                    categories: losLabel,
                    series: losData
                  }

                  res.send({
                    status: "success",
                    statusCode: 200,
                    message: 'Resultados encontrados',
                    rows: resultadoFinal
                  });
              })
              .catch((error) => {
                console.log('Error try: ', error)
                res.send({
                  status: "error",
                  statusCode: 400,
                  message: '0 Resultados encontrados',
                  rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
                });
              });                
          }else{
            res.send({
                status: "error",
                statusCode: 400,
                message: 'La institucion requerida no esta disponible',
                rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
            });
          }

        } catch (error) {
          console.log('totalStatsEmpresa: ', error)
          res.send({
            status: "error",
            statusCode: 400,
            message: 'El sistema experimenta errores inesperados, por favor intente mas tarde', //error.toString()
            rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}]
          });
        }
    },

    /**
     * totalBitacora: show behavior registers from students
     * @param {*} req id_institucion masquerade integer
     * @param {*} res [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}]
     */
    async totalBitacora(req, res){
      let resultadoFinal = {}
        try {
          let anolectivo = token.decriptar(req.user.usuarioAnoId)
          let id_institucion = token.decriptar(req.user.academicoId)          
          let { mes} = req.body;  
    
          if (typeof id_institucion != "undefined" && id_institucion != null && id_institucion != "") {
            // LIST WARNINGS
            await Db.query({
              text: totalQueryes.totalWarnings,
              values: [anolectivo,id_institucion,mes],
            })
              .then(async (results) => {
                  
                  resultadoFinal = {
                    id_institucion: id_institucion,
                    title:'Observaciones',
                    id:'totalBitacora',
                    caption:`Observaciones registradas en ${req.user.usuarioInstitucionNombre}`,
                    data:[{
                      caption: 'Hoy',
                      value: parseInt(results.rows[0].hoy),
                      colorText: '#f8f9fa',
                      colorBackground: '#20c997'
                    },{
                      caption: 'Semana',
                      value: parseInt(results.rows[0].semana),
                      colorText: '#f8f9fa',
                      colorBackground: '#20c997'
                    },{
                      caption: 'Mes',
                      value: parseInt(results.rows[0].mes),
                      colorText: '#f8f9fa',
                      colorBackground: '#20c997'
                    }]
                  }

                  res.send({
                    status: "success",
                    statusCode: 200,
                    message: 'Resultados encontrados',
                    rows: resultadoFinal
                  });
              })
              .catch((error) => {
                console.log('Error try: ', error)
                res.send({
                  status: "error",
                  statusCode: 400,
                  message: '0 Resultados encontrados',
                  rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
                });
              });                
          }else{
            res.send({
                status: "error",
                statusCode: 400,
                message: 'La institucion requerida no esta disponible',
                rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
            });
          }

        } catch (error) {
          console.log('totalStatsEmpresa: ', error)
          res.send({
            status: "error",
            statusCode: 400,
            message: 'El sistema experimenta errores inesperados, por favor intente mas tarde', //error.toString()
            rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}]
          });
        }
    },

    /**
     * totalBitacora: show behavior registers from students
     * @param {*} req id_institucion masquerade integer
     * @param {*} res [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}]
     */
    async totalBitacoraXTeacher(req, res){

        try {
          let anolectivo = parseInt(token.decriptar(req.user.usuarioAnoId))
          let id_institucion = parseInt(token.decriptar(req.user.usuarioEmpresaId))
          let id_academico = parseInt(token.decriptar(req.user.academicoId))
          let rol = parseInt(token.decriptar(req.user.usuarioRollId))          
          
          let { mes} = req.body; 
          let resultadoFinal = {
            id_institucion: req.user.usuarioEmpresaId,
            title:'Observaciones de mis estudiantes',
            id:'totalBitacora',
            caption:`Observaciones registradas en ${req.user.usuarioInstitucionNombre}`,
            data:[]
          } 
    
          if (typeof id_institucion != "undefined" && id_institucion != null && id_institucion != "") {
            // LIST WARNINGS
            await Db.query({
              text: totalQueryes.totalWarningsXTeacher,
              values: [anolectivo,id_institucion,mes,id_academico],
            })
              .then(async (results) => {
                  
                  resultadoFinal = {
                    id_institucion: id_institucion,
                    title:'Observaciones',
                    id:'totalBitacora',
                    caption:`Observaciones registradas en ${req.user.usuarioInstitucionNombre}`,
                    data:[{
                      caption: 'Hoy',
                      value: parseInt(results.rows[0].hoy),
                      colorText: '#f8f9fa',
                      colorBackground: '#20c997'
                    },{
                      caption: 'Semana',
                      value: parseInt(results.rows[0].semana),
                      colorText: '#f8f9fa',
                      colorBackground: '#20c997'
                    },{
                      caption: 'Mes',
                      value: parseInt(results.rows[0].mes),
                      colorText: '#f8f9fa',
                      colorBackground: '#20c997'
                    }]
                  }

                  res.send({
                    status: "success",
                    statusCode: 200,
                    message: 'Resultados encontrados',
                    rows: resultadoFinal
                  });
              })
              .catch((error) => {
                console.log('totalBitacoraXTeacher Error try: ', error)
                res.send({
                  status: "error",
                  statusCode: 400,
                  message: '0 Resultados encontrados',
                  rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
                });
              });                
          }else{
            res.send({
                status: "error",
                statusCode: 400,
                message: 'La institucion requerida no esta disponible',
                rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
            });
          }

        } catch (error) {
          console.log('totalBitacoraXTeacher: ', error)
          res.send({
            status: "error",
            statusCode: 400,
            message: 'El sistema experimenta errores inesperados, por favor intente mas tarde', //error.toString()
            rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}]
          });
        }
    },

    /**
     * totalStudentsAttendance: show students attendances by group, today and month
     * @param {*} req id_institucion masquerade integer
     * @param {*} res [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}]
     */
    async totalStudentsAttendance(req, res){
      let resultadoFinal = {}
        try {
          let anolectivo = token.decriptar(req.user.usuarioAnoId)
          let id_institucion = token.decriptar(req.user.academicoId)
          let { fechaini, fechafin, mes} = req.body;         
    
          if (typeof id_institucion != "undefined" && id_institucion != null && id_institucion != ""
            && typeof anolectivo != "undefined" && anolectivo != null && anolectivo != ""
          ){
            // DOCENTES REGISTRANDO ASISTENCIAS
            await Db.query({
              text: totalQueryes.totalStudentsAttendance,
              values: [anolectivo, id_institucion, fechaini, fechafin, mes],
            })
              .then(async (results) => {
               
                  resultadoFinal = {
                    id_institucion: id_institucion,
                    title:'Estudiantes inasistentes',
                    id:'totalStudentsAttendance',
                    caption:`Estudiantes con inasistencias en ${req.user.usuarioInstitucionNombre}`,
                    data:[{
                      caption: 'Hoy',
                      value: parseInt(results.rows[0].hoy),
                      colorText: '#AAAAAA',
                      colorBackground: '#48ABf7'
                    },{
                      caption: 'Semana',
                      value: parseInt(results.rows[0].semana),
                      colorText: '#AAAAAA',
                      colorBackground: '#48ABf7'
                    },{
                      caption: 'Mes',
                      value: parseInt(results.rows[0].mes),
                      colorText: '#AAAAAA',
                      colorBackground: '#48ABf7'
                    }]
                  }

                  res.send({
                    status: "success",
                    statusCode: 200,
                    message: 'Resultados encontrados',
                    rows: resultadoFinal
                  });
              })
              .catch((error) => {
                console.log('Error try: ', error)
                res.send({
                  status: "error",
                  statusCode: 400,
                  message: '0 Resultados encontrados',
                  rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
                });
              });                
          }else{
            res.send({
                status: "error",
                statusCode: 400,
                message: 'La institucion requerida no esta disponible',
                rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
            });
          }

        } catch (error) {
          console.log('totalStatsEmpresa: ', error)
          res.send({
            status: "error",
            statusCode: 400,
            message: 'El sistema experimenta errores inesperados, por favor intente mas tarde', //error.toString()
            rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}]
          });
        }
    },

    /**
     * totalStudentsAttendanceXTeacher: show students attendances by group, today and month by teacher 
     * @param {*} req id_institucion masquerade integer
     * @param {*} res [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}]
     */
    async totalStudentsAttendanceXTeacher(req, res){

        try {
          let anolectivo = parseInt(token.decriptar(req.user.usuarioAnoId))
          let id_institucion = parseInt(token.decriptar(req.user.usuarioEmpresaId))
          let id_academico = parseInt(token.decriptar(req.user.academicoId))
          let rol = parseInt(token.decriptar(req.user.usuarioRollId))

          let {  fechaini, fechafin, mes } = req.body;         
          let resultadoFinal = {
            id_institucion: req.user.usuarioEmpresaId,
            title:'Estudiantes inasistentes',
            id:'totalStudentsAttendance',
            caption:`Estudiantes con inasistencias en ${req.user.usuarioInstitucionNombre}`,
            data:[]
          }          

          if (typeof id_institucion != "undefined" && id_institucion != null && id_institucion != ""
            && typeof anolectivo != "undefined" && anolectivo != null && anolectivo != ""
            && typeof id_academico != "undefined" && id_academico != null && id_academico != ""
          ){
            // DOCENTES REGISTRANDO ASISTENCIAS
            await Db.query({
              text: totalQueryes.totalStudentsAttendanceXTeacher,
              values: [anolectivo, id_institucion, fechaini, fechafin, mes, id_academico],
            })
              .then(async (results) => {
               
                  resultadoFinal = {
                    id_institucion: id_institucion,
                    title:'Estudiantes inasistentes',
                    id:'totalStudentsAttendance',
                    caption:`Estudiantes con inasistencias en ${req.user.usuarioInstitucionNombre}`,
                    data:[{
                      caption: 'Hoy',
                      value: parseInt(results.rows[0].hoy),
                      colorText: '#AAAAAA',
                      colorBackground: '#48ABf7'
                    },{
                      caption: 'Semana',
                      value: parseInt(results.rows[0].semana),
                      colorText: '#AAAAAA',
                      colorBackground: '#48ABf7'
                    },{
                      caption: 'Mes',
                      value: parseInt(results.rows[0].mes),
                      colorText: '#AAAAAA',
                      colorBackground: '#48ABf7'
                    }]
                  }

                  res.send({
                    status: "success",
                    statusCode: 200,
                    message: 'Resultados encontrados',
                    rows: resultadoFinal
                  });
              })
              .catch((error) => {
                console.log('Error try: ', error)
                res.send({
                  status: "error",
                  statusCode: 400,
                  message: '0 Resultados encontrados',
                  rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
                });
              });                
          }else{
            res.send({
                status: "error",
                statusCode: 400,
                message: 'La institucion requerida no esta disponible',
                rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
            });
          }

        } catch (error) {
          console.log('totalStatsEmpresa: ', error)
          res.send({
            status: "error",
            statusCode: 400,
            message: 'El sistema experimenta errores inesperados, por favor intente mas tarde', //error.toString()
            rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}]
          });
        }
    },

    /**
     * totalStudentsAttendanceByDay: show students attendances day to day
     * @param {*} req anolectivo masquerade integer, id_institucion masquerade integer, fechainicial, fechafinal
     * @param {*} res [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}]
     */
    async totalStudentsAttendanceByDay(req, res){
      let resultadoFinal = {
        id_institucion: 0,
        title:'Inasistentes por dia',
        id:'totalStudentsAttendanceByDay',
        caption:`Cantidad de estudiantes inasistentes en ${req.user.usuarioInstitucionNombre}`,
        barColor: '#17a2b8',
        borderColor: '#17a2b8',
        categories: [],
        series: []
      }
        try {
          let anolectivo = token.decriptar(req.user.usuarioAnoId)
          let id_institucion = token.decriptar(req.user.academicoId)
          let { fechaini, fechafin, mes} = req.body;
          let losLabel = [], losData = []
    
          if (typeof id_institucion != "undefined" && id_institucion != null && id_institucion != ""
            && typeof anolectivo != "undefined" && anolectivo != null && anolectivo != ""
          ){
            // DOCENTES REGISTRANDO ASISTENCIAS
            await Db.query({
              text: totalQueryes.totalStudentsAttendanceByDay,
              values: [anolectivo, id_institucion, fechaini, fechafin],
            })
              .then(async (results) => {
                // FIRST FILTER NULLS            
                results.rows.filter(preData => preData.fecha!=null).map((elDato) => {
                  losLabel.push(elDato.dianombre + '-' + elDato.dia)
                  losData.push(parseInt(elDato.inasistentes))
                })

                resultadoFinal = {
                  id_institucion: id_institucion,
                  title:'Inasistentes por dia',
                  id:'totalStudentsAttendanceByDay',
                  caption:`Cantidad de estudiantes inasistentes en ${req.user.usuarioInstitucionNombre} entre ${fechafin.split("T")[0]} y ${fechaini.split("T")[0]}`,
                  barColor: '#17a2b8',
                  borderColor: '#17a2b8',
                  categories: losLabel,
                  series: losData
                }

                res.send({
                  status: "success",
                  statusCode: 200,
                  message: 'Resultados encontrados',
                  rows: resultadoFinal
                });
              })
              .catch((error) => {
                console.log('Error try: ', error)
                res.send({
                  status: "error",
                  statusCode: 400,
                  message: '0 Resultados encontrados',
                  rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
                });
              });                
          }else{
            res.send({
                status: "error",
                statusCode: 400,
                message: 'La institucion requerida no esta disponible',
                rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
            });
          }

        } catch (error) {
          console.log('totalStatsEmpresa: ', error)
          res.send({
            status: "error",
            statusCode: 400,
            message: 'El sistema experimenta errores inesperados, por favor intente mas tarde', //error.toString()
            rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}]
          });
        }
    },

    /**
     * totalStudentsAttendanceByDayXTeacher: show students attendances day to day by teacher groups 
     * @param {*} req anolectivo masquerade integer, id_institucion masquerade integer, fechainicial, fechafinal
     * @param {*} res [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}]
     */
    async totalStudentsAttendanceByDayXTeacher(req, res){
      let resultadoFinal = {
        id_institucion: req.user.usuarioEmpresaId,
        title:'Inasistentes por dia',
        id:'totalStudentsAttendanceByDay',
        caption:`Cantidad de estudiantes inasistentes en ${req.user.usuarioInstitucionNombre}`,
        barColor: '#17a2b8',
        borderColor: '#17a2b8',
        categories: [],
        series: []
      }
        try {
          let anolectivo = parseInt(token.decriptar(req.user.usuarioAnoId))
          let id_institucion = parseInt(token.decriptar(req.user.usuarioEmpresaId))
          let id_academico = parseInt(token.decriptar(req.user.academicoId))
          let rol = parseInt(token.decriptar(req.user.usuarioRollId))

          let { fechaini, fechafin, mes} = req.body;
          let losLabel = [], losData = []
    
          if (typeof id_institucion != "undefined" && id_institucion != null && id_institucion != ""
            && typeof anolectivo != "undefined" && anolectivo != null && anolectivo != ""
            && typeof id_academico != "undefined" && id_academico != null && id_academico != ""
          ){
            // DOCENTES REGISTRANDO ASISTENCIAS
            await Db.query({
              text: totalQueryes.totalStudentsAttendanceByDayXTeacher,
              values: [anolectivo, id_institucion, fechaini, fechafin, id_academico],
            })
              .then(async (results) => {
                // FIRST FILTER NULLS            
                results.rows.filter(preData => preData.fecha!=null).map((elDato) => {
                  losLabel.push(elDato.dianombre + '-' + elDato.dia)
                  losData.push(parseInt(elDato.inasistentes))
                })

                resultadoFinal = {
                  id_institucion: req.user.usuarioEmpresaId,
                  title:'Inasistentes por dia en mis grupos',
                  id:'totalStudentsAttendanceByDay',
                  caption:`Cantidad de estudiantes inasistentes en ${req.user.usuarioInstitucionNombre} entre ${fechafin.split("T")[0]} y ${fechaini.split("T")[0]}`,
                  barColor: '#17a2b8',
                  borderColor: '#17a2b8',
                  categories: losLabel,
                  series: losData
                }

                res.send({
                  status: "success",
                  statusCode: 200,
                  message: 'Resultados encontrados',
                  rows: resultadoFinal
                });
              })
              .catch((error) => {
                console.log('Error try: ', error)
                res.send({
                  status: "error",
                  statusCode: 400,
                  message: '0 Resultados encontrados',
                  rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
                });
              });                
          }else{
            res.send({
                status: "error",
                statusCode: 400,
                message: 'La institucion requerida no esta disponible',
                rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
            });
          }

        } catch (error) {
          console.log('totalStatsEmpresa: ', error)
          res.send({
            status: "error",
            statusCode: 400,
            message: 'El sistema experimenta errores inesperados, por favor intente mas tarde', //error.toString()
            rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}]
          });
        }
    },

    /**
     * totalAttendance show stundents with 2 or more unn attendance for week
     * @param {*} req : {ano_lectivo,id_institucion,grupo,fechaini,fechafin}
     * @param {*} res : 200->registradas y la cantidad
    */
    async totalAttendance(req, res) {
      let resultadoFinal = {}
      let dias = 30
      try {
          let ano_lectivo = token.decriptar(req.user.usuarioAnoId)
          let id_institucion = token.decriptar(req.user.academicoId)
          let { grupo, fechaini, fechafin } = req.body

          if (grupo = (typeof grupo != "undefined")) {
              if (grupo.indexOf(',') > -1) {
                  grupo = `AND a.aeestudiantes_grupo LIKE '` + grupo.replace(",", "','") + `'`
              }
          } else {
              grupo = ''
          }

          //grupo=(typeof grupo != "undefined")? `AND a.aeestudiantes_grupo LIKE '`+grupo+`'` : '' ;
          let d = moment();
          let inicio = (fechaini != '' && fechaini != null) ? fechaini : moment().format('YYYY-MM-DD');
          let fin = (fechafin != '' && fechafin != null) ? fechafin : moment().subtract(dias, "days").format('YYYY-MM-DD');
          //UMBRAL DE INASISTENCIAS PERMITIDAS DURANTE UNA SEMANA
          let umbralInasistencias = await Db.query({
              text: `SELECT COALESCE(aeinstconf_asistencias_umbralweek, 2) as umbralinasistencias 
              FROM data.aeinstituciones_conf 
              WHERE aeinst_id=$1 AND aeinstconf_anolectivo=$2`,
              values: [id_institucion, ano_lectivo]
          })

          let query = {
              text: `
                  SELECT 
                    e.aeestudiantes_id as estudianteid, e.aeano_id AS anoid, e.aeinstitucion_id AS institucionid, a.aeestudiantes_grupo AS grupo,
                    initcap(lower(e.aeestudiantes_apellidos)) || ' ' || initcap(lower(e.aeestudiantes_nombres)) AS aeestudiantes_nombres,
                    ( e.aeestudiantes_mail ||
                        (
                            SELECT array_agg(aeestudiantes_mailacudiente)
                            FROM data.aeacudientes c
                            WHERE c.aeacudientes_id=e.aeacudientes_id
                        )
                    ) AS aeestudiantes_mail,                     
                    e.aeestudiantes_telefono,
                    (
                        SELECT array_agg(aeestudiantes_telefonoacudiente)
                        FROM data.aeacudientes c
                        WHERE LENGTH(aeestudiantes_telefonoacudiente) > 9
                        AND c.aeacudientes_id=e.aeacudientes_id
                    ) AS aeacudientes_telefono,
                    COUNT(DISTINCT a.aeasistencias_fecha) AS INASISTENCIAS,
                    (
                            --EXCUSAS DE ESTUDIANTES AGRUPADAS POR FECHA
                            --UN REGISTRO POR CADA DIA DE LA aeexcusas_desde HASTA aeexcusas_hasta 
                        SELECT COUNT(aeexcusas_diaexcusado)  AS aeexcusas_diaexcusado
                        FROM (
                            SELECT i.aeinst_id, i.aeanol_id, i.aeestudiantes_id, -- i.aeexcusas_desde, i.aeexcusas_hasta,
                                i.aetipoexcusa_id, i.aeexcusas_estado,
                                generate_series(i.aeexcusas_desde::timestamp, i.aeexcusas_hasta, '1 day')::date AS aeexcusas_diaexcusado
                            FROM data.aeexcusas i
                            WHERE i.aeexcusas_estado <> 0
                            AND i.aeinst_id = e.aeinstitucion_id
                            AND i.aeanol_id = e.aeano_id
                            AND i.aeestudiantes_id = e.aeestudiantes_id
                            GROUP BY i.aeinst_id, i.aeanol_id, i.aeestudiantes_id, 
                                i.aetipoexcusa_id, i.aeexcusas_estado, aeexcusas_diaexcusado
                        ) e
                        WHERE EXTRACT(isodow FROM e.aeexcusas_diaexcusado) < 6 -- 6 SABADO Y 7 DOMINGO                        
                    ) AS EXCUSAS                    
                  FROM data.aeestudiantes e,
                  (
                      -- VER POR ESTUDIANTE, CUANTAS FALLAS O ASISTENCIAS TIENE REGISTRADAS EN EL DIA
                      SELECT 
                        x.aeasistencias_fecha, x.aeestudiantes_id, x.aeestudiantes_grupo, 
                        COUNT(CASE WHEN (x.aeasistencias_llego=1) THEN x.aeasistencia_id END  ) AS VINO,
                        COUNT(CASE WHEN (x.aeasistencias_llego=0) THEN x.aeasistencia_id END  ) AS NOVINO
                      FROM 
                        data.aeasistencias x
                      WHERE 
                        x.aeasistencias_fecha BETWEEN $3 AND $4
                        AND x.aeasistencias_estado<>0 
                        AND x.aeestudiantes_grupo IN (
                          -- LISTA DE GRUPOS DE UN DOCENTE, GRUPOS DONDE DA CLASES
                          SELECT DISTINCT aeasignaciones_grupo
                          FROM data.aeasignaciones h
                          WHERE h.aeanol_id=$1 -- anolectivo
                          AND h.aeinst_id=$2 -- institucion   
                        )   
                      GROUP BY x.aeasistencias_fecha, x.aeestudiantes_id, x.aeestudiantes_grupo
                  ) AS a
                  WHERE 
                    e.aeano_id = $1 AND e.aeinstitucion_id = $2 
                    `+ grupo + `
                    AND e.aeestudiantes_estado <> 0
                    AND a.aeasistencias_fecha BETWEEN $3 AND $4
                    AND (a.vino=0 AND a.novino>0)
                    AND e.aeestudiantes_id=a.aeestudiantes_id
                  GROUP BY 
                    e.aeestudiantes_id, e.aeano_id, e.aeinstitucion_id,
                    initcap(lower(aeestudiantes_apellidos)) || ' ' || initcap(lower(aeestudiantes_nombres)),
                    a.aeestudiantes_grupo, e.aeestudiantes_mail, e.aeacudientes_id, e.aeestudiantes_telefono
                  HAVING 
                    COUNT(DISTINCT a.aeasistencias_fecha) > $5
                  ORDER BY 
                    NULLIF(regexp_replace(a.aeestudiantes_grupo, '[^0-9]*','','g'), '')::numeric, 
                    aeestudiantes_nombres, INASISTENCIAS DESC;`,
              values: [ano_lectivo, id_institucion, inicio, fin, parseInt(umbralInasistencias.rows[0].umbralinasistencias)]
          }
          // console.log('EL AUSENTISMO : ', query)


          await Db.query(query)
          .then(results =>{

              results.rows.forEach((item, i) => {
                results.rows[i].umbral = parseInt(umbralInasistencias.rows[0].umbralinasistencias)
                results.rows[i].estudianteid = token.encriptar(item.estudianteid)
                results.rows[i].diferencia = parseInt(item.inasistencias) - parseInt(item.excusas)
                results.rows[i].aeestudiantes_mail = (results.rows[i].aeestudiantes_mail != null)? item.aeestudiantes_mail.join(', ') : ''
                results.rows[i].aeacudientes_telefono = (results.rows[i].aeacudientes_telefono != null)? item.aeacudientes_telefono.join(', ') : ''
                // console.log('aeacudientes_telefono: ', results.rows[i].aeacudientes_telefono)
              })

              //console.log('Listado de ausentes: ', results.rows)

              resultadoFinal = {
                id_institucion: id_institucion,
                title:'Estudiantes con sintomas de ausentismo',
                id:'totalStudentsAttendance',
                caption:`Estudiantes con ${umbralInasistencias.rows[0].umbralinasistencias} o mas ausencias entre ${fechaini.split("T")[0]} y ${fechafin.split("T")[0]}`,
                data: results.rows
              }

              res.send({
                status: "success",
                statusCode: 200,
                message: 'Resultados encontrados',
                rows: resultadoFinal
              });

          })
          .catch(error =>{
              console.log('error try consultando los ausentismos: ', error)
              res.send({
                  status: "error",
                  statusCode: 400,
                  message: '0 Resultados encontrados',
                  rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
              });
          })

      } catch (error) {
          res.send({
              status: "error",
              statusCode: 400,
              message: 'La institucion requerida no esta disponible',
              rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
          });
      }
    },

    /**
     * totalAttendanceXTeacher show stundents with 2 or more unn attendance for week, by teacher assigment
     * @param {*} req : {ano_lectivo,id_institucion,grupo,fechaini,fechafin}
     * @param {*} res : 200->registradas y la cantidad
    */
    async totalAttendanceXTeacher(req, res) {
      let resultadoFinal = {
        id_institucion: req.user.usuarioEmpresaId,
        title:'Estudiantes con sintomas de ausentismo',
        id:'totalStudentsAttendance',
        caption:`Estudiantes con ausencias reiteradas`,
        data: []
      }
      let dias = 30
      try {
          let ano_lectivo = parseInt(token.decriptar(req.user.usuarioAnoId))
          let id_institucion = parseInt(token.decriptar(req.user.usuarioEmpresaId))
          let id_academico = parseInt(token.decriptar(req.user.academicoId))
          let rol = parseInt(token.decriptar(req.user.usuarioRollId))
          let { grupo, fechaini, fechafin } = req.body

          if (grupo = (typeof grupo != "undefined")) {
              if (grupo.indexOf(',') > -1) {
                  grupo = `AND a.aeestudiantes_grupo LIKE '` + grupo.replace(",", "','") + `'`
              }
          } else {
              grupo = ''
          }

          //grupo=(typeof grupo != "undefined")? `AND a.aeestudiantes_grupo LIKE '`+grupo+`'` : '' ;
          let d = moment();
          let inicio = (fechaini != '' && fechaini != null) ? fechaini : moment().format('YYYY-MM-DD');
          let fin = (fechafin != '' && fechafin != null) ? fechafin : moment().subtract(dias, "days").format('YYYY-MM-DD');
          //UMBRAL DE INASISTENCIAS PERMITIDAS DURANTE UNA SEMANA
          let umbralInasistencias = await Db.query({
              text: `SELECT COALESCE(aeinstconf_asistencias_umbralweek, 2) as umbralinasistencias 
              FROM data.aeinstituciones_conf 
              WHERE aeinst_id=$1 AND aeinstconf_anolectivo=$2`,
              values: [id_institucion, ano_lectivo]
          })

          let query = {
              text: `
                  SELECT 
                    e.aeestudiantes_id as estudianteid, e.aeano_id AS anoid, e.aeinstitucion_id AS institucionid, a.aeestudiantes_grupo AS grupo,
                    initcap(lower(e.aeestudiantes_apellidos)) || ' ' || initcap(lower(e.aeestudiantes_nombres)) AS aeestudiantes_nombres,
                    ( e.aeestudiantes_mail ||
                        (
                            SELECT array_agg(aeestudiantes_mailacudiente)
                            FROM data.aeacudientes c
                            WHERE c.aeacudientes_id=e.aeacudientes_id
                        )
                    ) AS aeestudiantes_mail,                     
                    e.aeestudiantes_telefono,
                    (
                        SELECT array_agg(aeestudiantes_telefonoacudiente)
                        FROM data.aeacudientes c
                        WHERE LENGTH(aeestudiantes_telefonoacudiente) > 9
                        AND c.aeacudientes_id=e.aeacudientes_id
                    ) AS aeacudientes_telefono,
                    COUNT(DISTINCT a.aeasistencias_fecha) AS INASISTENCIAS,
                    (
                            --EXCUSAS DE ESTUDIANTES AGRUPADAS POR FECHA
                            --UN REGISTRO POR CADA DIA DE LA aeexcusas_desde HASTA aeexcusas_hasta 
                        SELECT COUNT(aeexcusas_diaexcusado)  AS aeexcusas_diaexcusado
                        FROM (
                            SELECT i.aeinst_id, i.aeanol_id, i.aeestudiantes_id, -- i.aeexcusas_desde, i.aeexcusas_hasta,
                                i.aetipoexcusa_id, i.aeexcusas_estado,
                                generate_series(i.aeexcusas_desde::timestamp, i.aeexcusas_hasta, '1 day')::date AS aeexcusas_diaexcusado
                            FROM data.aeexcusas i
                            WHERE i.aeexcusas_estado <> 0
                            AND i.aeinst_id = e.aeinstitucion_id
                            AND i.aeanol_id = e.aeano_id
                            AND i.aeestudiantes_id = e.aeestudiantes_id
                            GROUP BY i.aeinst_id, i.aeanol_id, i.aeestudiantes_id, 
                                i.aetipoexcusa_id, i.aeexcusas_estado, aeexcusas_diaexcusado
                        ) e
                        WHERE EXTRACT(isodow FROM e.aeexcusas_diaexcusado) < 6 -- 6 SABADO Y 7 DOMINGO                        
                    ) AS EXCUSAS
                  FROM 
                    data.aeestudiantes e, 
                    (
                      -- VER POR ESTUDIANTE, CUANTAS FALLAS O ASISTENCIAS TIENE REGISTRADAS EN EL DIA
                      SELECT 
                        x.aeasistencias_fecha, x.aeestudiantes_id, x.aeestudiantes_grupo, 
                        COUNT(CASE WHEN (x.aeasistencias_llego=1) THEN x.aeasistencia_id END  ) AS VINO,
                        COUNT(CASE WHEN (x.aeasistencias_llego=0) THEN x.aeasistencia_id END  ) AS NOVINO
                      FROM 
                        data.aeasistencias x
                      WHERE 
                        x.aeasistencias_fecha BETWEEN $3 AND $4
                        AND x.aeasistencias_estado<>0 
                        AND x.aeestudiantes_grupo IN (
                          -- LISTA DE GRUPOS DE UN DOCENTE, GRUPOS DONDE DA CLASES
                          SELECT DISTINCT aeasignaciones_grupo
                          FROM data.aeasignaciones h
                          WHERE h.aedocentes_id=$6 --iddocente, idacademico
                          AND h.aeanol_id=$1 -- anolectivo
                          AND h.aeinst_id=$2 -- institucion   
                        )   
                      GROUP BY x.aeasistencias_fecha, x.aeestudiantes_id, x.aeestudiantes_grupo
                  ) AS a
                  WHERE 
                    e.aeano_id = $1 AND e.aeinstitucion_id = $2 
                    `+ grupo + `
                    AND e.aeestudiantes_estado <> 0
                    AND a.aeasistencias_fecha BETWEEN $3 AND $4
                    AND (a.vino=0 AND a.novino>0)
                    AND e.aeestudiantes_id=a.aeestudiantes_id
                  GROUP BY 
                    e.aeestudiantes_id, e.aeano_id, e.aeinstitucion_id,
                    initcap(lower(aeestudiantes_apellidos)) || ' ' || initcap(lower(aeestudiantes_nombres)),
                    a.aeestudiantes_grupo, e.aeestudiantes_mail, e.aeacudientes_id, e.aeestudiantes_telefono
                  HAVING 
                    COUNT(DISTINCT a.aeasistencias_fecha) > $5
                  ORDER BY 
                    NULLIF(regexp_replace(a.aeestudiantes_grupo, '[^0-9]*','','g'), '')::numeric, 
                    aeestudiantes_nombres, INASISTENCIAS DESC;`,
              values: [ano_lectivo, id_institucion, inicio, fin, parseInt(umbralInasistencias.rows[0].umbralinasistencias), id_academico]
          }
          // console.log('EL AUSENTISMO : ', query)


          await Db.query(query)
          .then(results =>{

              results.rows.forEach((item, i) => {
                results.rows[i].umbral = parseInt(umbralInasistencias.rows[0].umbralinasistencias)
                results.rows[i].estudianteid = token.encriptar(item.estudianteid)
                results.rows[i].diferencia = parseInt(item.inasistencias) - parseInt(item.excusas)
                results.rows[i].aeestudiantes_mail = (results.rows[i].aeestudiantes_mail != null)? item.aeestudiantes_mail.join(', ') : ''
                results.rows[i].aeacudientes_telefono = (results.rows[i].aeacudientes_telefono != null)? item.aeacudientes_telefono.join(', ') : ''
                // console.log('aeacudientes_telefono: ', results.rows[i].aeacudientes_telefono)
              })

              //console.log('Listado de ausentes: ', results.rows)

              resultadoFinal = {
                id_institucion: id_institucion,
                title:'Estudiantes con sintomas de ausentismo',
                id:'totalStudentsAttendance',
                caption:`Estudiantes con ${umbralInasistencias.rows[0].umbralinasistencias} o mas ausencias entre ${fechaini.split("T")[0]} y ${fechafin.split("T")[0]}`,
                data: results.rows
              }

              res.send({
                status: "success",
                statusCode: 200,
                message: 'Resultados encontrados',
                rows: resultadoFinal
              });

          })
          .catch(error =>{
              console.log('error try consultando los ausentismos: ', error)
              res.send({
                  status: "error",
                  statusCode: 400,
                  message: '0 Resultados encontrados',
                  rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
              });
          })

      } catch (error) {
          res.send({
              status: "error",
              statusCode: 400,
              message: 'La institucion requerida no esta disponible',
              rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
          });
      }
    },

    /**
     * totalAttendanceGroup show stundents with 2 or more unn attendance for week
     * @param {*} req : {ano_lectivo,id_institucion,grupo,fechaini,fechafin}
     * @param {*} res : 200->registradas y la cantidad
    */
    async totalAttendanceGroup(req, res) {
        let resultadoFinal = {}
        let dias = 30
        try {
            let ano_lectivo = token.decriptar(req.user.usuarioAnoId)
            let id_institucion = token.decriptar(req.user.academicoId)
            let { grupo, fechaini, fechafin } = req.body

            grupo = (typeof grupo != "undefined") ? `AND a.aeestudiantes_grupo LIKE '` + grupo + `'` : '';
            let d = moment();
            let inicio = (fechaini != '' && fechaini != null) ? fechaini : moment().format('YYYY-MM-DD');
            let fin = (fechafin != '' && fechafin != null) ? fechafin : moment().subtract(dias, "days").format('YYYY-MM-DD');
            //UMBRAL DE INASISTENCIAS PERMITIDAS DURANTE UNA SEMANA 
            let umbralInasistencias = await Db.query({
                text: `SELECT COALESCE(aeinstconf_asistencias_umbralweek, 2) as umbralinasistencias 
                FROM data.aeinstituciones_conf 
                WHERE aeinst_id=$1 AND aeinstconf_anolectivo=$2`,
                values: [id_institucion, ano_lectivo]
            })

            await Db.query({
                text: totalQueryes.attendanceCount,
                values: [ano_lectivo, id_institucion, inicio, fin, parseInt(umbralInasistencias.rows[0].umbralinasistencias)]
            })
            .then(results =>{
                resultadoFinal = {
                    id_institucion: id_institucion,
                    title:'Pre ausentismo en grupos',
                    id:'totalGroupPaviaClase',
                    caption:`Pre ausentismo por grupos entre ${fechaini.split("T")[0]} y ${fechafin.split("T")[0]} en ${req.user.usuarioInstitucionNombre}`,
                    data: results.rows
                }
                
                res.send({
                    status: "success",
                    statusCode: 200,
                    message: 'Resultados encontrados',
                    rows: resultadoFinal
                });
            })
            .catch(error =>{
                console.log('error try consultando los ausentismosgroup: ', error)
                res.send({
                    status: "error",
                    statusCode: 400,
                    message: '0 Resultados encontrados',
                    rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
                });
            })

        } catch (error) {
            console.log('pre Ausentismo Group: ', error)
            res.send({
              status: "error",
              statusCode: 400,
              message: 'El sistema experimenta errores inesperados, por favor intente mas tarde', //error.toString()
              rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}]
            });
        }
    },

    /**
     * totalAttendanceGroupXTeacher show stundents with 2 or more unn attendance for week by group teacher related
     * @param {*} req : {ano_lectivo,id_institucion,grupo,fechaini,fechafin}
     * @param {*} res : 200->registradas y la cantidad
    */
    async totalAttendanceGroupXTeacher(req, res) {
      let resultadoFinal = {
        id_institucion: req.user.usuarioEmpresaId,
        title:'Pre ausentismo en grupos',
        id:'totalGroupPaviaClase',
        caption:`Pre ausentismo por grupos en ${req.user.usuarioInstitucionNombre}`,
        data: []
      }
      let dias = 30
      try {
          let ano_lectivo = parseInt(token.decriptar(req.user.usuarioAnoId))
          let id_institucion = parseInt(token.decriptar(req.user.usuarioEmpresaId))
          let id_academico = parseInt(token.decriptar(req.user.academicoId))
          let rol = parseInt(token.decriptar(req.user.usuarioRollId))
          let { grupo, fechaini, fechafin } = req.body

          grupo = (typeof grupo != "undefined") ? `AND a.aeestudiantes_grupo LIKE '` + grupo + `'` : '';
          let d = moment();
          let inicio = (fechaini != '' && fechaini != null) ? fechaini : moment().format('YYYY-MM-DD');
          let fin = (fechafin != '' && fechafin != null) ? fechafin : moment().subtract(dias, "days").format('YYYY-MM-DD');
          //UMBRAL DE INASISTENCIAS PERMITIDAS DURANTE UNA SEMANA 
          let umbralInasistencias = await Db.query({
              text: `SELECT COALESCE(aeinstconf_asistencias_umbralweek, 2) as umbralinasistencias 
              FROM data.aeinstituciones_conf 
              WHERE aeinst_id=$1 AND aeinstconf_anolectivo=$2`,
              values: [id_institucion, ano_lectivo]
          })

          await Db.query({
              text: totalQueryes.attendanceCountXTeacher,
              values: [ano_lectivo, id_institucion, inicio, fin, parseInt(umbralInasistencias.rows[0].umbralinasistencias), id_academico]
          })
          .then(results =>{
              resultadoFinal = {
                  id_institucion: req.user.usuarioEmpresaId,
                  title:'Pre ausentismo en mis grupos',
                  id:'totalGroupPaviaClase',
                  caption:`Pre ausentismo por grupos entre ${fechaini.split("T")[0]} y ${fechafin.split("T")[0]} en ${req.user.usuarioInstitucionNombre}`,
                  data: results.rows
              }
              
              res.send({
                  status: "success",
                  statusCode: 200,
                  message: 'Resultados encontrados',
                  rows: resultadoFinal
              });
          })
          .catch(error =>{
              console.log('error try consultando los ausentismosgroup: ', error)
              res.send({
                  status: "error",
                  statusCode: 400,
                  message: '0 Resultados encontrados',
                  rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
              });
          })

      } catch (error) {
          console.log('pre Ausentismo Group: ', error)
          res.send({
            status: "error",
            statusCode: 400,
            message: 'El sistema experimenta errores inesperados, por favor intente mas tarde', //error.toString()
            rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}]
          });
      }
  },

    /**
     * totalStudentsExams: show exams registered in all school
     * @param {*} req id_institucion masquerade integer
     * @param {*} res [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}]
     */
    async totalStudentsExams(req, res){
      let resultadoFinal = {}
        try {
          let anolectivo = token.decriptar(req.user.usuarioAnoId)
          let id_institucion = token.decriptar(req.user.academicoId)
          let { fechaini, fechafin, mes} = req.body;         
    
          if (typeof id_institucion != "undefined" && id_institucion != null && id_institucion != ""
            && typeof anolectivo != "undefined" && anolectivo != null && anolectivo != ""
          ){
            // GET TOTAL EXAMS 
            await Db.query({
              text: totalQueryes.totalExams,
              values: [anolectivo, id_institucion, mes],
            })
              .then(async (results) => {
               
                  resultadoFinal = {
                    id_institucion: id_institucion,
                    title:'Evaluaciones registradas',
                    id:'totalStudentsExams',
                    duration:450,
                    width:10,
                    radius:60,
                    caption:`Total evaluaciones registradas en ${req.user.usuarioInstitucionNombre}`,
                    data:[{
                      caption: 'Hoy',
                      value: parseInt(results.rows[0].hoy),
                      colorText: '#f8f9fa',
                      colorBackground: '#6610f2'
                    },{
                      caption: 'Semana',
                      value: parseInt(results.rows[0].semana),
                      colorText: '#f8f9fa',
                      colorBackground: '#6610f2'
                    },{
                      caption: 'Mes',
                      value: parseInt(results.rows[0].mes),
                      colorText: '#f8f9fa',
                      colorBackground: '#6610f2'
                    }]
                  }

                  res.send({
                    status: "success",
                    statusCode: 200,
                    message: 'Resultados encontrados',
                    rows: resultadoFinal
                  });
              })
              .catch((error) => {
                console.log('Error try: ', error)
                res.send({
                  status: "error",
                  statusCode: 400,
                  message: '0 Resultados encontrados',
                  rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
                });
              });                
          }else{
            res.send({
                status: "error",
                statusCode: 400,
                message: 'La institucion requerida no esta disponible',
                rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
            });
          }

        } catch (error) {
          console.log('totalStatsEmpresa: ', error)
          res.send({
            status: "error",
            statusCode: 400,
            message: 'El sistema experimenta errores inesperados, por favor intente mas tarde', //error.toString()
            rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}]
          });
        }
    },

    /**
     * totalStudentsExamsXTeacher: show exams registered into teacher groups
     * @param {*} req id_institucion masquerade integer
     * @param {*} res [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}]
     */
    async totalStudentsExamsXTeacher(req, res){
      let resultadoFinal = {
        id_institucion: req.user.usuarioEmpresaId,
        title:'Evaluaciones registradas',
        id:'totalStudentsExams',
        duration:450,
        width:10,
        radius:60,
        caption:`Total evaluaciones registradas en ${req.user.usuarioInstitucionNombre}`,
        data:[]
      }
        try {
          let anolectivo = parseInt(token.decriptar(req.user.usuarioAnoId))
          let id_institucion = parseInt(token.decriptar(req.user.usuarioEmpresaId))
          let id_academico = parseInt(token.decriptar(req.user.academicoId))
          let rol = parseInt(token.decriptar(req.user.usuarioRollId))

          let { fechaini, fechafin, mes} = req.body;         
    
          if (typeof id_institucion != "undefined" && id_institucion != null && id_institucion != ""
            && typeof anolectivo != "undefined" && anolectivo != null && anolectivo != ""
          ){
            // GET TOTAL EXAMS 
            await Db.query({
              text: totalQueryes.totalExamsXTeacher,
              values: [anolectivo, id_institucion, mes, id_academico],
            })
              .then(async (results) => {
               
                  resultadoFinal = {
                    id_institucion: req.user.usuarioEmpresaId,
                    title:'Evaluaciones registradas',
                    id:'totalStudentsExams',
                    duration:450,
                    width:10,
                    radius:60,
                    caption:`Total evaluaciones registradas en ${req.user.usuarioInstitucionNombre}`,
                    data:[{
                      caption: 'Hoy',
                      value: parseInt(results.rows[0].hoy),
                      colorText: '#f8f9fa',
                      colorBackground: '#6610f2'
                    },{
                      caption: 'Semana',
                      value: parseInt(results.rows[0].semana),
                      colorText: '#f8f9fa',
                      colorBackground: '#6610f2'
                    },{
                      caption: 'Mes',
                      value: parseInt(results.rows[0].mes),
                      colorText: '#f8f9fa',
                      colorBackground: '#6610f2'
                    }]
                  }

                  res.send({
                    status: "success",
                    statusCode: 200,
                    message: 'Resultados encontrados',
                    rows: resultadoFinal
                  });
              })
              .catch((error) => {
                console.log('Error try: ', error)
                res.send({
                  status: "error",
                  statusCode: 400,
                  message: '0 Resultados encontrados',
                  rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
                });
              });                
          }else{
            res.send({
                status: "error",
                statusCode: 400,
                message: 'La institucion requerida no esta disponible',
                rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
            });
          }

        } catch (error) {
          console.log('totalStatsEmpresa: ', error)
          res.send({
            status: "error",
            statusCode: 400,
            message: 'El sistema experimenta errores inesperados, por favor intente mas tarde', //error.toString()
            rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}]
          });
        }
    },

    /**
     * totalStudentsHomeWorks: show homwWorks registered in all school
     * @param {*} req id_institucion masquerade integer
     * @param {*} res [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}]
     */
    async totalStudentsHomeWorks(req, res){
      let resultadoFinal = {}
        try {
          let anolectivo = token.decriptar(req.user.usuarioAnoId)
          let id_institucion = token.decriptar(req.user.academicoId)
          let { fechaini, fechafin, mes} = req.body;         
    
          if (typeof id_institucion != "undefined" && id_institucion != null && id_institucion != ""
            && typeof anolectivo != "undefined" && anolectivo != null && anolectivo != ""
          ){
            // DOCENTES REGISTRANDO ASISTENCIAS
            await Db.query({
              text: totalQueryes.totalHomeworks,
              values: [anolectivo, id_institucion, mes],
            })
              .then(async (results) => {
               
                  resultadoFinal = {
                    id_institucion: id_institucion,
                    title:'Tareas',
                    id:'totalStudentsHomework',
                    caption:`Total tareas propuestas en ${req.user.usuarioInstitucionNombre}`,
                    duration:450,
                    width:10,
                    radius:60,
                    data:[{
                      caption: 'Hoy',
                      value: parseInt(results.rows[0].hoy),
                      colorText: '#f8f9fa',
                      colorBackground: '#28a745'
                    },{
                      caption: 'Semana',
                      value: parseInt(results.rows[0].semana),
                      colorText: '#f8f9fa',
                      colorBackground: '#28a745'
                    },{
                      caption: 'Mes',
                      value: parseInt(results.rows[0].mes),
                      colorText: '#f8f9fa',
                      colorBackground: '#28a745'
                    }]
                  }

                  res.send({
                    status: "success",
                    statusCode: 200,
                    message: 'Resultados encontrados',
                    rows: resultadoFinal
                  });
              })
              .catch((error) => {
                console.log('Error try: ', error)
                res.send({
                  status: "error",
                  statusCode: 400,
                  message: '0 Resultados encontrados',
                  rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
                });
              });                
          }else{
            res.send({
                status: "error",
                statusCode: 400,
                message: 'La institucion requerida no esta disponible',
                rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
            });
          }

        } catch (error) {
          console.log('totalStatsEmpresa: ', error)
          res.send({
            status: "error",
            statusCode: 400,
            message: 'El sistema experimenta errores inesperados, por favor intente mas tarde', //error.toString()
            rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}]
          });
        }
    },

    /**
     * totalStudentsHomeWorksXTeacher: show homwWorks registered in groups realted with teacher
     * @param {*} req id_institucion masquerade integer
     * @param {*} res [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}]
     */
    async totalStudentsHomeWorksXTeacher(req, res){
      let resultadoFinal = {
        id_institucion: req.user.usuarioInstitucionId,
        title:'Tareas',
        id:'totalStudentsHomework',
        caption:`Total tareas propuestas en ${req.user.usuarioInstitucionNombre}`,
        duration:450,
        width:10,
        radius:60,
        data:[]
      }
        try {
          let anolectivo = parseInt(token.decriptar(req.user.usuarioAnoId))
          let id_institucion = parseInt(token.decriptar(req.user.usuarioEmpresaId))
          let id_academico = parseInt(token.decriptar(req.user.academicoId))
          let rol = parseInt(token.decriptar(req.user.usuarioRollId))

          let { fechaini, fechafin, mes} = req.body;         
    
          if (typeof id_institucion != "undefined" && id_institucion != null && id_institucion != ""
            && typeof anolectivo != "undefined" && anolectivo != null && anolectivo != ""
            && typeof id_academico != "undefined" && id_academico != null && id_academico != ""
          ){
            // DOCENTES REGISTRANDO ASISTENCIAS
            await Db.query({
              text: totalQueryes.totalHomeworksXTeacher,
              values: [anolectivo, id_institucion, mes, id_academico],
            })
              .then(async (results) => {
               
                  resultadoFinal = {
                    id_institucion: req.user.usuarioInstitucionId,
                    title:'Tareas en mis grupos',
                    id:'totalStudentsHomework',
                    caption:`Total tareas propuestas en ${req.user.usuarioInstitucionNombre}`,
                    duration:450,
                    width:10,
                    radius:60,
                    data:[{
                      caption: 'Hoy',
                      value: parseInt(results.rows[0].hoy),
                      colorText: '#f8f9fa',
                      colorBackground: '#28a745'
                    },{
                      caption: 'Semana',
                      value: parseInt(results.rows[0].semana),
                      colorText: '#f8f9fa',
                      colorBackground: '#28a745'
                    },{
                      caption: 'Mes',
                      value: parseInt(results.rows[0].mes),
                      colorText: '#f8f9fa',
                      colorBackground: '#28a745'
                    }]
                  }

                  res.send({
                    status: "success",
                    statusCode: 200,
                    message: 'Resultados encontrados',
                    rows: resultadoFinal
                  });
              })
              .catch((error) => {
                console.log('Error try: ', error)
                res.send({
                  status: "error",
                  statusCode: 400,
                  message: '0 Resultados encontrados',
                  rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
                });
              });                
          }else{
            res.send({
                status: "error",
                statusCode: 400,
                message: 'La institucion requerida no esta disponible',
                rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
            });
          }

        } catch (error) {
          console.log('totalStatsEmpresa: ', error)
          res.send({
            status: "error",
            statusCode: 400,
            message: 'El sistema experimenta errores inesperados, por favor intente mas tarde', //error.toString()
            rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}]
          });
        }
    },

    /**
     * totalTeacherAsk: show all ask for each teacher
     * @param {*} req id_institucion masquerade integer
     * @param {*} res [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}]
     */
    async totalTeacherAsk(req, res){
      let resultadoFinal = {}
        try {
          let anolectivo = parseInt(token.decriptar(req.user.usuarioAnoId))
          let id_institucion = parseInt(token.decriptar(req.user.academicoId))
          let { mes} = req.body;         
    
          if (typeof id_institucion != "undefined" && id_institucion != null && id_institucion != ""
            && typeof anolectivo != "undefined" && anolectivo != null && anolectivo != ""
          ){
            // QUESTIONS FROM PARENTS TO TEACHERS
            await Db.query({
              text: totalQueryes.totalQuestionsTeachers,
              values: [anolectivo, id_institucion, mes],
            })
              .then(async (results) => {
                let performance = (parseInt(results.rows[0].respondidas)||0)/(parseInt(results.rows[0].mes)||1)
                let colorData = token.statsColor('hex',performance.toFixed(1))
                
                  resultadoFinal = {
                    id_institucion: id_institucion,
                    title:'Consultas de padres a docentes',
                    id:'totalTeacherAsk',
                    caption:`Relacion de consultas a docentes realizadas en ${req.user.usuarioInstitucionNombre}`,
                    data:[{
                      caption: 'Hoy',
                      value: parseInt(results.rows[0].hoy),
                      colorText: '#f8f9fa',
                      colorBackground: '#ffc107'
                    },{
                      caption: 'Semana',
                      value: parseInt(results.rows[0].semana),
                      colorText: '#f8f9fa',
                      colorBackground: '#ffc107'
                    },{
                      caption: 'Mes',
                      value: parseInt(results.rows[0].mes),
                      colorText: '#f8f9fa',
                      colorBackground: '#ffc107'
                    },{
                      caption: 'Respondidas',
                      value: parseInt(results.rows[0].respondidas),
                      colorText: '#f8f9fa',
                      colorBackground: '#ffc107'
                    },{
                      caption: '% de respuestas',
                      value: parseFloat((performance*100).toFixed(1)),
                      aditional: '%',
                      colorText: colorData.text||'#f8f9fa',
                      colorBackground: colorData.background||'#ffc107'
                    }]
                  }

                  res.send({
                    status: "success",
                    statusCode: 200,
                    message: 'Resultados encontrados',
                    rows: resultadoFinal
                  });
              })
              .catch((error) => {
                console.log('Error try: ', error)
                res.send({
                  status: "error",
                  statusCode: 400,
                  message: '0 Resultados encontrados',
                  rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
                });
              });                
          }else{
            res.send({
                status: "error",
                statusCode: 400,
                message: 'La institucion requerida no esta disponible',
                rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
            });
          }

        } catch (error) {
          console.log('totalStatsEmpresa: ', error)
          res.send({
            status: "error",
            statusCode: 400,
            message: 'El sistema experimenta errores inesperados, por favor intente mas tarde', //error.toString()
            rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}]
          });
        }
    },

    /**
     * totalTeacherAskXTeacher: show all ask for me as teacher
     * @param {*} req id_institucion masquerade integer
     * @param {*} res [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}]
     */
    async totalTeacherAskXTeacher(req, res){

        try {
          let anolectivo = parseInt(token.decriptar(req.user.usuarioAnoId))
          let id_institucion = parseInt(token.decriptar(req.user.usuarioEmpresaId))
          let id_academico = parseInt(token.decriptar(req.user.academicoId))
          let rol = parseInt(token.decriptar(req.user.usuarioRollId))

          let { mes} = req.body;         
          let resultadoFinal = {
            id_institucion: req.user.usuarioEmpresaId,
            title:'Consultas de padres a docentes',
            id:'totalTeacherAsk',
            caption:`Relacion de consultas a docentes realizadas en ${req.user.usuarioInstitucionNombre}`,
            data:[]
          }
          
          if (typeof id_institucion != "undefined" && id_institucion != null && id_institucion != ""
            && typeof anolectivo != "undefined" && anolectivo != null && anolectivo != ""
            && typeof id_academico != "undefined" && id_academico != null && id_academico != ""
            && typeof rol != "undefined" && rol != null && rol != ""
          ){
            // QUESTIONS FROM PARENTS TO TEACHERS
            await Db.query({
              text: totalQueryes.totalQuestionsTeachersSpecific,
              values: [anolectivo, id_institucion, mes, id_academico],
            })
              .then(async (results) => {
                let performance = (parseInt(results.rows[0].respondidas)||0)/(parseInt(results.rows[0].mes)||1)
                let colorData = token.statsColor('hex',performance.toFixed(1))
                
                  resultadoFinal = {
                    id_institucion: req.user.usuarioEmpresaId,
                    title:'Consultas de padres a docentes',
                    id:'totalTeacherAsk',
                    caption:`Relacion de consultas a docentes realizadas en ${req.user.usuarioInstitucionNombre}`,
                    data:[{
                      caption: 'Hoy',
                      value: parseInt(results.rows[0].hoy),
                      colorText: '#f8f9fa',
                      colorBackground: '#ffc107'
                    },{
                      caption: 'Semana',
                      value: parseInt(results.rows[0].semana),
                      colorText: '#f8f9fa',
                      colorBackground: '#ffc107'
                    },{
                      caption: 'Mes',
                      value: parseInt(results.rows[0].mes),
                      colorText: '#f8f9fa',
                      colorBackground: '#ffc107'
                    },{
                      caption: 'Respondidas',
                      value: parseInt(results.rows[0].respondidas),
                      colorText: '#f8f9fa',
                      colorBackground: '#ffc107'
                    },{
                      caption: '% de respuestas',
                      value: parseFloat((performance*100).toFixed(1)),
                      aditional: '%',
                      colorText: colorData.text||'#f8f9fa',
                      colorBackground: colorData.background||'#ffc107'
                    }]
                  }

                  res.send({
                    status: "success",
                    statusCode: 200,
                    message: 'Resultados encontrados',
                    rows: resultadoFinal
                  });
              })
              .catch((error) => {
                console.log('Error try: ', error)
                res.send({
                  status: "error",
                  statusCode: 400,
                  message: '0 Resultados encontrados',
                  rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
                });
              });                
          }else{
            res.send({
                status: "error",
                statusCode: 400,
                message: 'La institucion requerida no esta disponible',
                rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
            });
          }

        } catch (error) {
          console.log('totalStatsEmpresa: ', error)
          res.send({
            status: "error",
            statusCode: 400,
            message: 'El sistema experimenta errores inesperados, por favor intente mas tarde', //error.toString()
            rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}]
          });
        }
    },

    /**
     * totalTeacherAskDetails: show top requested teachers 
     * @param {*} req id_institucion masquerade integer
     * @param {*} res [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}]
     */
    async totalTeacherAskDetails(req, res){
      let resultadoFinal = {}
        try {
          let anolectivo = token.decriptar(req.user.usuarioAnoId)
          let id_institucion = token.decriptar(req.user.academicoId)
          let { fechaini, fechafin, mes} = req.body;         
    
          if (typeof id_institucion != "undefined" && id_institucion != null && id_institucion != ""
            && typeof anolectivo != "undefined" && anolectivo != null && anolectivo != ""
          ){
            // DOCENTES REGISTRANDO ASISTENCIAS
            await Db.query({
              text: totalQueryes.topTeachersRequested,
              values: [anolectivo, id_institucion, mes, 5],
            })
              .then(async (results) => {
                results.rows.map((item,i) =>{
                    results.rows[i].aedocente_id = token.encriptar(item.aedocente_id)
                  })
               
                  resultadoFinal = {
                    id_institucion: id_institucion,
                    title:`Docentes con mas consultas`,
                    id:'totalTeacherAskDetails',
                    caption:`Docentes con mas consultas`,
                    data: results.rows
                  }

                  res.send({
                    status: "success",
                    statusCode: 200,
                    message: 'Resultados encontrados',
                    rows: resultadoFinal
                  });
              })
              .catch((error) => {
                console.log('Error try: ', error)
                res.send({
                  status: "error",
                  statusCode: 400,
                  message: '0 Resultados encontrados',
                  rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
                });
              });                
          }else{
            res.send({
                status: "error",
                statusCode: 400,
                message: 'La institucion requerida no esta disponible',
                rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
            });
          }

        } catch (error) {
          console.log('totalStatsEmpresa: ', error)
          res.send({
            status: "error",
            statusCode: 400,
            message: 'El sistema experimenta errores inesperados, por favor intente mas tarde', //error.toString()
            rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}]
          });
        }
    },

    /**
     * totalTeacherAskDetailsXTeacher: show last 5 request for a teacher
     * @param {*} req id_institucion masquerade integer
     * @param {*} res [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}]
     */
    async totalTeacherAskDetailsXTeacher(req, res){
      let resultadoFinal = {}
        try {
          let anolectivo = token.decriptar(req.user.usuarioAnoId)
          let id_institucion = token.decriptar(req.user.usuarioEmpresaId)
          let id_academico = parseInt(token.decriptar(req.user.academicoId))
          let rol = parseInt(token.decriptar(req.user.usuarioRollId))
          let { fechaini, fechafin, mes} = req.body;
          
          let resultadoFinal = {
            id_institucion: req.user.usuarioEmpresaId,
            title:`Estudiantes con más consultas`,
            id:'totalTeacherAskDetails',
            caption:`Estudiantes con más consultas`,
            data: []
          }
    
          if (typeof id_institucion != "undefined" && id_institucion != null && id_institucion != ""
            && typeof anolectivo != "undefined" && anolectivo != null && anolectivo != ""
            && typeof id_academico != "undefined" && id_academico != null && id_academico != ""
            && typeof rol != "undefined" && rol != null && rol != ""
          ){
            // DOCENTES REGISTRANDO ASISTENCIAS
            await Db.query({
              text: totalQueryes.last5RequestedTeachers,
              values: [anolectivo, id_institucion, mes, 5, id_academico],
            })
              .then(async (results) => {
                results.rows.map((item,i) =>{
                    results.rows[i].aeestudiantes_id = token.encriptar(item.aeestudiantes_id)
                  })
               
                  resultadoFinal = {
                    id_institucion: req.user.usuarioEmpresaId,
                    title:`Estudiantes con más consultas`,
                    id:'totalTeacherAskDetails',
                    caption:`Estudiantes con más consultas`,
                    data: results.rows
                  }

                  res.send({
                    status: "success",
                    statusCode: 200,
                    message: 'Resultados encontrados',
                    rows: resultadoFinal
                  });
              })
              .catch((error) => {
                console.log('Error try: ', error)
                res.send({
                  status: "error",
                  statusCode: 400,
                  message: '0 Resultados encontrados',
                  rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
                });
              });                
          }else{
            res.send({
                status: "error",
                statusCode: 400,
                message: 'La institucion requerida no está disponible',
                rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
            });
          }

        } catch (error) {
          console.log('totalStatsEmpresa: ', error)
          res.send({
            status: "error",
            statusCode: 400,
            message: 'El sistema experimenta errores inesperados, por favor intente más tarde', //error.toString()
            rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}]
          });
        }
    },

    /**
     * totalAlerts: show Alerts sent into school
     * @param {*} req id_institucion masquerade integer
     * @param {*} res [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}]
     */
    async totalAlerts(req, res){
      let resultadoFinal = {}
        try {
          let anolectivo = token.decriptar(req.user.usuarioAnoId)
          let id_institucion = token.decriptar(req.user.academicoId)
          let { mes} = req.body;         
    
          if (typeof id_institucion != "undefined" && id_institucion != null && id_institucion != ""
            && typeof anolectivo != "undefined" && anolectivo != null && anolectivo != ""
          ){
            // QUESTIONS FROM PARENTS TO TEACHERS
            await Db.query({
              text: totalQueryes.totalAlerts,
              values: [anolectivo, id_institucion, mes],
            })
              .then(async (results) => {
                let performance = (parseInt(results.rows[0].respondidas)||0)/(parseInt(results.rows[0].mes)||1)
                let colorData = token.statsColor('hex',performance.toFixed(1))
                
                  resultadoFinal = {
                    id_institucion: req.user.academicoId,
                    title:'Comunicados enviados',
                    id:'totalAlertsSent',
                    caption:`Comunicados emitidos en ${req.user.usuarioInstitucionNombre}`,
                    duration:550,
                    width:12,
                    radius:70,
                    data:[{
                      caption: 'Hoy',
                      value: parseInt(results.rows[0].hoy),
                      colorText: '#f8f9fa',
                      colorBackground: '#28a745'
                    },{
                      caption: 'Semana',
                      value: parseInt(results.rows[0].semana),
                      colorText: '#f8f9fa',
                      colorBackground: '#28a745'
                    },{
                      caption: 'Mes',
                      value: parseInt(results.rows[0].mes),
                      colorText: '#f8f9fa',
                      colorBackground: '#28a745'
                    }]
                  }

                  res.send({
                    status: "success",
                    statusCode: 200,
                    message: 'Resultados encontrados',
                    rows: resultadoFinal
                  });
              })
              .catch((error) => {
                console.log('Error try: ', error)
                res.send({
                  status: "error",
                  statusCode: 400,
                  message: '0 Resultados encontrados',
                  rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
                });
              });                
          }else{
            res.send({
                status: "error",
                statusCode: 400,
                message: 'La institucion requerida no esta disponible',
                rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
            });
          }

        } catch (error) {
          console.log('totalStatsEmpresa: ', error)
          res.send({
            status: "error",
            statusCode: 400,
            message: 'El sistema experimenta errores inesperados, por favor intente mas tarde', //error.toString()
            rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}]
          });
        }
    },

    /**
     * totalAlertsXTeacher: show Alerts sent into school and teacher related
     * @param {*} req anolectivo, id_institucion, id_academico masquerade integer
     * @param {*} res [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}]
     */
    async totalAlertsXTeacher(req, res){
        try {
          let anolectivo = token.decriptar(req.user.usuarioAnoId)
          let id_institucion = token.decriptar(req.user.usuarioEmpresaId)
          let id_academico = token.decriptar(req.user.academicoId)

          let { mes} = req.body;
          let resultadoFinal = {
            id_institucion: req.user.usuarioEmpresaId,
            title:'Comunicados enviados en el colegio',
            id:'totalAlertsSent',
            caption:`Comunicados emitidos en ${req.user.usuarioInstitucionNombre}`,
            duration:550,
            width:12,
            radius:70,
            data:[]
          }         
    
          if (typeof id_institucion != "undefined" && id_institucion != null && id_institucion != ""
            && typeof anolectivo != "undefined" && anolectivo != null && anolectivo != ""
            && typeof id_academico != "undefined" && id_academico != null && id_academico != ""
          ){
            // QUESTIONS FROM PARENTS TO TEACHERS
            await Db.query({
              text: totalQueryes.totalAlertsDocente,
              values: [anolectivo, id_institucion, mes, id_academico],
            })
              .then(async (results) => {
                let performance = (parseInt(results.rows[0].respondidas)||0)/(parseInt(results.rows[0].mes)||1)
                let colorData = token.statsColor('hex',performance.toFixed(1))
                
                  resultadoFinal = {
                    id_institucion: id_institucion,
                    title:'Comunicados enviados en el colegio',
                    id:'totalAlertsSent',
                    caption:`Comunicados emitidos en ${req.user.usuarioInstitucionNombre}`,
                    duration:550,
                    width:12,
                    radius:70,
                    link:privateRoutes.COMUNICACION_LIST,
                    data:[{
                      caption: 'Hoy',
                      value: parseInt(results.rows[0].hoy),
                      colorText: '#f8f9fa',
                      colorBackground: '#28a745'
                    },{
                      caption: 'Semana',
                      value: parseInt(results.rows[0].semana),
                      colorText: '#f8f9fa',
                      colorBackground: '#28a745'
                    },{
                      caption: 'Mes',
                      value: parseInt(results.rows[0].mes),
                      colorText: '#f8f9fa',
                      colorBackground: '#28a745'
                    }]
                  }

                  res.send({
                    status: "success",
                    statusCode: 200,
                    message: 'Resultados encontrados',
                    rows: resultadoFinal
                  });
              })
              .catch((error) => {
                console.log('Error try: ', error)
                res.send({
                  status: "error",
                  statusCode: 400,
                  message: '0 Resultados encontrados',
                  rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
                });
              });                
          }else{
            res.send({
                status: "error",
                statusCode: 400,
                message: 'La institucion requerida no esta disponible',
                rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
            });
          }

        } catch (error) {
          console.log('totalStatsEmpresa: ', error)
          res.send({
            status: "error",
            statusCode: 400,
            message: 'El sistema experimenta errores inesperados, por favor intente mas tarde', //error.toString()
            rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}]
          });
        }
    },

    /**
     * totalAlerts: show Alerts sent into school
     * @param {*} req id_institucion masquerade integer
     * @param {*} res [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}]
     */
    async totalListStudents(req, res){
      let resultadoFinal = {}
        try {
          let anolectivo = token.decriptar(req.user.usuarioAnoId)
          let id_institucion = token.decriptar(req.user.academicoId)
          let { mes} = req.body;         
    
          if (typeof id_institucion != "undefined" && id_institucion != null && id_institucion != ""
            && typeof anolectivo != "undefined" && anolectivo != null && anolectivo != ""
          ){
            // QUESTIONS FROM PARENTS TO TEACHERS
            await Db.query({
              text: totalQueryes.resumeStudentsByGroup,
              values: [anolectivo, id_institucion],
            })
              .then(async (results) => {
              
                  resultadoFinal = {
                    id_institucion: id_institucion,
                    title:`Estudiantes por grupo en ${req.user.usuarioInstitucionNombre}`,
                    id:'totalResumeStudents',
                    caption:`Estudiantes por grupo en ${req.user.usuarioInstitucionNombre}`,
                    data: results.rows
                  }

                  res.send({
                    status: "success",
                    statusCode: 200,
                    message: 'Resultados encontrados',
                    rows: resultadoFinal
                  });
              })
              .catch((error) => {
                console.log('Error try: ', error)
                res.send({
                  status: "error",
                  statusCode: 400,
                  message: '0 Resultados encontrados',
                  rows: [] // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
                });
              });                
          }else{
            res.send({
                status: "error",
                statusCode: 400,
                message: 'La institucion requerida no esta disponible',
                rows: [] // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
            });
          }

        } catch (error) {
          console.log('totalStatsEmpresa: ', error)
          res.send({
            status: "error",
            statusCode: 400,
            message: 'El sistema experimenta errores inesperados, por favor intente mas tarde', //error.toString()
            rows: [] // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}]
          });
        }
    },

    /**
     * @param {*} req id_institucion masquerade integer
     * @param {*} res [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}]
     */
    async totalListStudentsXTeacher(req, res){
        try {
          let anolectivo = token.decriptar(req.user.usuarioAnoId)
          let id_institucion = token.decriptar(req.user.usuarioEmpresaId)
          let id_academico = token.decriptar(req.user.academicoId)
          let { dia } = req.body;         
          let resultadoFinal = {
            id_institucion: req.user.usuarioEmpresaId,
            title:`Estudiantes por grupo en ${req.user.usuarioInstitucionNombre}`,
            id:'totalResumeStudents',
            caption:`Estudiantes por grupo en ${req.user.usuarioInstitucionNombre}`,
            data: []
          }       
    
          if (typeof id_institucion != "undefined" && id_institucion != null && id_institucion != ""
            && typeof anolectivo != "undefined" && anolectivo != null && anolectivo != ""
            && typeof id_academico != "undefined" && id_academico != null && id_academico != ""
          ){
            // QUESTIONS FROM PARENTS TO TEACHERS
            await Db.query({
              text: totalQueryes.resumeStudentsByGroupTeacher,
              values: [anolectivo, id_institucion, id_academico],
            })
              .then(async (results) => {
              
                  resultadoFinal = {
                    id_institucion: req.user.usuarioEmpresaId,
                    title:`Estudiantes por grupo en ${req.user.usuarioInstitucionNombre}`,
                    id:'totalResumeStudents',
                    caption:`Estudiantes por grupo en ${req.user.usuarioInstitucionNombre}`,
                    data: results.rows
                  }

                  res.send({
                    status: "success",
                    statusCode: 200,
                    message: 'Resultados encontrados',
                    rows: resultadoFinal
                  });
              })
              .catch((error) => {
                console.log('totalListStudentsXTeacher Error try: ', error)
                res.send({
                  status: "error",
                  statusCode: 400,
                  message: '0 Resultados encontrados',
                  rows: [] 
                });
              });                
          }else{
            res.send({
                status: "error",
                statusCode: 400,
                message: 'La institucion requerida no esta disponible',
                rows: [] 
            });
          }

        } catch (error) {
          console.log('totalListStudentsXTeacher: ', error)
          res.send({
            status: "error",
            statusCode: 400,
            message: 'El sistema experimenta errores inesperados, por favor intente mas tarde', //error.toString()
            rows: []
          });
        }
    },

    /**
     * resumeWhatsapp: show whatsapp resume in my school 
     * @param {*} req id_institucion masquerade integer
     * @param {*} res [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}]
     */
    async resumeWhatsapp(req, res){
      let resultadoFinal = {}
        try {
          let anolectivo = token.decriptar(req.user.usuarioAnoId)
          let id_institucion = token.decriptar(req.user.academicoId)
          let { fechaini, fechafin, mes} = req.body;         
    
          if (typeof id_institucion != "undefined" && id_institucion != null && id_institucion != ""
            && typeof anolectivo != "undefined" && anolectivo != null && anolectivo != ""
          ){
            // QUESTIONS FROM PARENTS TO TEACHERS
            await Db.query({
              text: totalQueryes.resumeWPMessageSent,
              values: [id_institucion]
            })
              .then(async (results) => {
                empresaStatus = await Db.query({
                  text: totalQueryes.resumeWPMessageStatus,
                  values: [id_institucion]
                })

                results.rows.map((item,i) => {
                  results.rows[i].tipo = token.encriptar(item.tipo)
                })
               
                  resultadoFinal = {
                    id_institucion: token.encriptar(empresaStatus.rows[0].empresaid),
                    title:'Whatsapp',
                    id:'totalWPSent',
                    caption:`Resumen de Whatsapp enviados en ${req.user.usuarioInstitucionNombre}`,
                    idemisor: token.encriptar(empresaStatus.rows[0].idemisor||''),
                    emisor:empresaStatus.rows[0].emisor||'Sin Whatsapp',
                    estado:empresaStatus.rows[0].estado||'DESCONECTADO',
                    idestado:empresaStatus.rows[0].idestado||7,
                    data: results.rows,
                    link: '/wpstatus'
                  }

                  res.send({
                    status: "success",
                    statusCode: 200,
                    message: 'Resultados encontrados',
                    rows: resultadoFinal
                  });
              })
              .catch((error) => {
                console.log('Error try: ', error)
                res.send({
                  status: "error",
                  statusCode: 400,
                  message: '0 Resultados encontrados',
                  rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
                });
              });                
          }else{
            res.send({
                status: "error",
                statusCode: 400,
                message: 'La institucion requerida no esta disponible',
                rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
            });
          }

        } catch (error) {
          console.log('totalStatsEmpresa: ', error)
          res.send({
            status: "error",
            statusCode: 400,
            message: 'El sistema experimenta errores inesperados, por favor intente mas tarde', //error.toString()
            rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}]
          });
        }
    },

    /**
     * totalExcuses: show Excuses for today received into school
     * @param {*} req id_institucion masquerade integer
     * @param {*} res [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}]
     */
    async totalExcusesTeacher(req, res){
        try {
          let anolectivo = token.decriptar(req.user.usuarioAnoId)
          let id_institucion = token.decriptar(req.user.usuarioEmpresaId)
          let id_academico = token.decriptar(req.user.academicoId)
          let { dia } = req.body;         
          let resultadoFinal = {
            id_institucion: req.user.usuarioEmpresaId,
            title:'Excusas para hoy',
            id:'totalAlertsSent',
            link: privateRoutes.EXCUSAS_LIST,
            caption:`Excusas para hoy en ${req.user.usuarioInstitucionNombre}`,
            data:[]
          }

          if (typeof id_institucion != "undefined" && id_institucion != null && id_institucion != ""
            && typeof anolectivo != "undefined" && anolectivo != null && anolectivo != ""
            && typeof id_academico != "undefined" && id_academico != null && id_academico != ""
          ){
            // QUESTIONS FROM PARENTS TO TEACHERS
            await Db.query({
              text: totalQueryes.totalExcusesToDayTeacher,
              values: [anolectivo, id_institucion, dia||ahora, id_academico],
            })
              .then(async (results) => {

                  results.rows.map((item,i) =>{
                    results.rows[i].idexcusas = token.encriptar(item.idexcusas)
                    results.rows[i].idinstitucion = token.encriptar(item.idinstitucion)
                    results.rows[i].idanolectivo = token.encriptar(item.idanolectivo)
                    results.rows[i].idestudiante = token.encriptar(item.idestudiante)
                  })
                
                  resultadoFinal = {
                    id_institucion: req.user.academicoId,
                    title:'Excusas para hoy',
                    id:'totalAlertsSent',
                    caption:`Excusas para hoy en ${req.user.usuarioInstitucionNombre}`,
                    link: privateRoutes.EXCUSAS_LIST,
                    data: results.rows
                  }

                  res.send({
                    status: "success",
                    statusCode: 200,
                    message: 'Resultados encontrados',
                    rows: resultadoFinal
                  });
              })
              .catch((error) => {
                console.log('Error try: ', error)
                res.send({
                  status: "error",
                  statusCode: 400,
                  message: '0 Resultados encontrados',
                  rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
                });
              });                
          }else{
            res.send({
                status: "error",
                statusCode: 400,
                message: 'La institucion requerida no esta disponible',
                rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}],
            });
          }

        } catch (error) {
          console.log('totalStatsEmpresa: ', error)
          res.send({
            status: "error",
            statusCode: 400,
            message: 'El sistema experimenta errores inesperados, por favor intente mas tarde', //error.toString()
            rows: resultadoFinal // [{id_institucion:null,sede:null,calendario:null,docregistrantes:null,doctotales:null}]
          });
        }
    },
}