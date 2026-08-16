require('dotenv').config()
const Db = require('../database/conex');
const path = require('path')
const token = require('../utils/token');
const queryes = require('../sql/exams');
const consultasAcademicas = require('../sql/academics');
const generateButton = require('../utils/buttons')
const { generate } = require('../utils/passworGenearte');
const alerta = require('../utils/notifications/mail/alerta');

const fs = require('fs')
var util = require('util')
// const pusher = require('../utils/notifications/push/firebase')
const wpSender = require('../utils/notifications/whatsapp/wpRomote')
const wpQueryes = require('../sql/whatsapp');
const { MessageMedia } = require('whatsapp-web.js');
// const { MessageMedia } = require('whatsapp-web.js');
var moment = require('moment-timezone');
const { query } = require('express');
const { multiResult } = require('../database/pgpromise');
//const { resolve } = require('path/posix');
moment.tz.setDefault("America/Bogota")
//const ahora = moment().format('YYYY-MM-DD HH:mm:ss');
const ahora = moment().format();


module.exports = {

    async createExam(req, res) {
        try {
            let { content, date_init, date_finish, time, name_exam, file, intentos, id_institucion, ano_lectivo, id_usuario, groups, tipo_intento, ordenado, minimun_note, materia } = req.body

            id_institucion = parseInt(id_institucion), ano_lectivo = parseInt(ano_lectivo), id_usuario = parseInt(id_usuario)
            intentos = parseInt(intentos), tipo_intento = parseInt(tipo_intento), ordenado = eval(ordenado), minimun_note = parseFloat(minimun_note)
            groups = JSON.parse(groups)

            let image;
            if (req.file) {
                image = `/p/t/${req.file.filename}`
            } else {
                image = null
            }


            let consul = `INSERT INTO data.aecue(
                aecue_id, aecue_nombre, aecue_descripcion, aecue_imagen, aecue_fechacreacion, 
                aecue_asignatura, aecue_estado)
                VALUES ((SELECT MAX(aecue_id)+1 FROM data.aecue),$1, $2, $3, $4, $5, $6)RETURNING aecue_id `

            let query = {
                text: consul,
                values: [name_exam, content, image, ahora, materia, 1],
            }
            let resp = await Db.query(query)

            //REGISTRAR LAS PROGRAMACIONES UNA A UNA SEGUN EL GRUPO
            let arr = [], query2 = {}, resp2 = null
            let consul2 = `INSERT INTO data.inst_cue(
                aeinst_cue_id, aecue_id, aeinst_id, aeano_id, aeusu_id, 
                aeestudiantes_grupo, aeinst_cue_fechacreacion, aeinst_cue_fechaini, 
                aeinst_cue_fechafin, aeinst_cue_duracion, aeinst_cue_intentos, 
                aeinst_cue_tipointento, aeinst_cue_ordenado,aeinst_cue_resultadominimo, aeinst_cue_estado)
                VALUES ((SELECT MAX(aeinst_cue_id)+1 FROM data.inst_cue),$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,$14)RETURNING aeinst_cue_id`

            for (let i in groups) {
                query2 = {
                    text: consul2,
                    values: [
                        resp.rows[0].aecue_id, id_institucion, ano_lectivo, id_usuario,
                        groups[i], ahora, date_init, date_finish,
                        time, intentos, tipo_intento, ordenado, minimun_note, 1
                    ]
                }
                resp2 = await Db.query(query2);
                arr.push(resp2.rows[0].aeinst_cue_id);
                //NOTIFICACIONES POR CORREO DE LA NUEVA EVALUACION
                let queryinfo = {
                    text: `SELECT * FROM engine.contacto_student($1, $2, $3)`,
                    values: [ano_lectivo, id_institucion, [groups[i]]]
                }
                let correos = await Db.query(queryinfo);

                for (let j in correos.rows) {
                    let messageAcu = {
                        titulo: 'Nueva evaluación programada',
                        message: ` El estudiante ${correos.rows[j].estudiante}, quien cursa ${groups[i]}, tiene programada una evaluación: ${name_exam}
                        en la asignatura ${materia} en la siguiente fecha: ${date_init}.
                    
                        Requerimos que usted como padre de familia estimule al estudiante, para que estudie, repase 
                        y se prepare en casa para la evaluación.
                    
                        Con su ayuda lograremos que ${correos.rows[j].estudiante} obtenga los mejores resultados académicos.`,
                        extra: `<a 
                        style="margin:5px;padding:15px 30px;border-radius:30px;background-color:#37BC98;color:#FFFFFF;
                            display:inline-block;font-family:Arial,sans-serif;font-size:13pt;font-weight:normal;line-height:120%;
                            text-decoration:none;text-transform:none;" 
                        href="${process.env.APP_API_FRONT}">
                        abrir
                        </a>`
                    }
                    await alerta.send({ email: correos.rows[j].correoestudiante, message: messageAcu });//correos.rows[j].correoestudiante
                    await alerta.send({ email: correos.rows[j].correoacudiente, message: messageAcu });//correos.rows[j].correoacudiente
                }

            }

            let resul = {
                image, id: resp.rows[0].aecue_id, id_programacion: arr, content, date_init, date_finish, time, name_exam, file, intentos, id_institucion, ano_lectivo, id_usuario, groups, tipo_intento, ordenado
            }
            if (resp.rows.length > 0 && arr.length > 0) {
                let tok = await token.createtoken(resul);
                res.status(200).send({ status: 'success', statusCode: 200, message: 'Evaluacion creada con exito', token: tok })
            }
            //console.log(resp.rows);


        } catch (error) {
            //console.log(error);
            res.status(400).send(error);
        }


    },

    /**
     * addQuestions register questions and options in a evaluacion 
     * @param {*} req: id_exam,description,order,type_question,options,id_institucion,id_usu,ano_lectivo,rol
     * @param {*} res 
     */
    async addQuestions(req, res) {
        try {

            let { id_exam, description, order, type_question, options, id_institucion, id_usu, ano_lectivo, rol } = req.body
            id_exam = parseInt(id_exam), type_question = parseInt(type_question)
            id_institucion = parseInt(id_institucion), id_usu = parseInt(id_usu)
            ano_lectivo = parseInt(ano_lectivo), rol = parseInt(rol)
            options = JSON.parse(options);

            let queryPregunta = {
                text: `INSERT INTO data.aepre(
                    aepre_id, aecue_id, aetippre_id, aepre_descripcion, aepre_fechacreacion, 
                    aepre_orden, aepre_estado)
                    VALUES ((SELECT COALESCE(MAX(aepre_id)+1, 1) FROM data.aepre) ,$1, $2, $3, $4, $5, $6)RETURNING aepre_id`,
                values: [id_exam, type_question, description, ahora, order, 1],
            }

            let respPregunta = await Db.query(queryPregunta);

            if (type_question != 4 && type_question != 0) {
                for (let i in options) {

                    let queryOpciones = {
                        text: `INSERT INTO data.aeopcres(
                            aeopcres_id, aepre_id, aeopcres_descripcion, aeopcres_orden, 
                            aeopcres_valor, aeopcres_estado)
                            VALUES ((SELECT MAX(aeopcres_id)+1 FROM data.aeopcres),$1, $2, $3, $4, $5)`,
                        values: [respPregunta.rows[0].aepre_id, options[i].answer, order, (options[i].value || 0), 1]
                    }
                    let respOpciones = await Db.query(queryOpciones);
                }
            }

            let resul = { id_exam, description, order, type_question, options, id_institucion, id_usu, ano_lectivo, rol }
            let tok = await token.createtoken(respPregunta.rowCount + ' preguntas registradas');
            res.status(200).send({ status: 'success', statusCode: 200, message: 'Pregunta Registrada con exito', token: tok })

        } catch (error) {
            ////console.log(error);
            res.status(400).send(error)
        }

    },

    /**
     * exams show list of exams to a student in a card
     * @param {*} req ano_lectivo,id_institucion,group
     * @param {*} res [{idcuestionario,duration,fecha_inicio,...}]
     */
    async exams(req, res) {

        let { ano_lectivo, id_institucion, group, reference } = req.body
        try {

            let query = {
                name: 'custionary',
                text: queryes.consulallexam,
                values: [parseInt(id_institucion), parseInt(ano_lectivo), group]
            }
            let resp = await Db.query(query);
            //console.log('El resultado: ', resp.rows)
            let resul = resp.rows.map(item => {

                return {
                    id_cuestionario: item.row_to_json.idcuestionario,
                    idcuestionario: item.row_to_json.idcuestionario,
                    title: item.row_to_json.nombre,
                    descripcion: item.row_to_json.descripcion,
                    asignaturas: item.row_to_json.asignaturas,
                    grupos: item.row_to_json.grupos,
                    grupo: item.row_to_json.grupos,
                    preguntas: item.row_to_json.preguntas,
                    opciones: item.row_to_json.opciones,
                    fechainicio: moment(item.row_to_json.aeinst_cue_fechaini).format('YYYY-MM-DD HH-mm'),
                    fechafin: moment(item.row_to_json.aeinst_cue_fechafin).format('YYYY-MM-DD HH-mm'),
                    duracion: item.row_to_json.aeinst_cue_duracion,
                    id_programacion: item.row_to_json.idprogramacion,
                    tipointento: item.row_to_json.aeinst_cue_tipointento,
                    intentos: item.row_to_json.aeinst_cue_intentos,
                    ordenado: item.row_to_json.aeinst_cue_ordenado,
                    fecha_inicio: ahora,
                    nota_minima: item.row_to_json.aeinst_cue_resultadominimo,
                    imagen: item.row_to_json.imagen,
                    questions: item.row_to_json.detalles != null ? item.row_to_json.detalles.map(items => {
                        return {
                            id_cuestions: items.aecue_id,
                            nombre: items.aecue_nombre,
                            id_pregunta: items.aepre_id,
                            orden: items.aepre_orden,
                            title: items.aepre_descripcion,
                            tipo_pregunta: items.aetippre_id,
                            opciones: items.opciones
                        }
                    }) : [],
                }
            })
            let tok = await token.createtoken(resul);
            res.status(200).send({ status: 'success', statusCode: 200, message: 'evaluciones', token: tok })


        } catch (error) {
            res.status(400).send(error)
        }


    },

    /**
     * examsbyid: LIST QUIZ BY USERID
     * @param {*} req 
     * @param {*} res 
     */
    async examsbyid(req, res) {
        let { id_usuario } = req.body
        try {
            id_usuario = parseInt(id_usuario)
            let query = {
                text: queryes.consulexams,
                values: [id_usuario]
            }
            let resp = await Db.query(query);
            //console.log('Lista de evaluaciones: ', query)

            let resul = resp.rows.map(item => {

                return {
                    idcuestionario: item.row_to_json.idcuestionario,
                    id_cuestionario: item.row_to_json.idcuestionario,
                    title: item.row_to_json.nombre,
                    descripcion: item.row_to_json.descripcion,
                    grupo: item.row_to_json.grupos,
                    grupos: item.row_to_json.grupos,
                    preguntas: item.row_to_json.preguntas,
                    opciones: item.row_to_json.opciones,
                    fechainicio: moment(item.row_to_json.aeinst_cue_fechaini).format('YYYY-MM-DD HH-mm'),
                    fechafin: moment(item.row_to_json.aeinst_cue_fechafin).format('YYYY-MM-DD HH-mm'),
                    duracion: item.row_to_json.aeinst_cue_duracion,
                    id_programacion: item.row_to_json.idprogramacion,
                    tipointento: item.row_to_json.aeinst_cue_tipointento,
                    intentos: item.row_to_json.aeinst_cue_intentos,
                    ordenado: item.row_to_json.aeinst_cue_ordenado,
                    fecha_inicio: ahora,
                    imagen: item.row_to_json.imagen,
                    intentos_realizados: item.row_to_json.intentosrealizados,
                    nota_minima: item.row_to_json.aeinst_cue_resultadominimo,
                    questions: item.row_to_json.detalles != null ? item.row_to_json.detalles.map(items => {
                        return {
                            id_cuestions: items.aecue_id,
                            nombre: items.aecue_nombre,
                            id_pregunta: items.aepre_id,
                            orden: items.aepre_orden,
                            title: items.aepre_descripcion,
                            tipo_pregunta: items.aetippre_id,
                            opciones: items.opciones,
                            preguntas_respondidas: items.respuestas[0].respuestas

                        }
                    }) : [],
                }
            })
            let tok = await token.createtoken(resul);
            res.status(200).send({ status: 'success', statusCode: 200, message: 'evaluciones', token: tok })


        } catch (error) {
            //console.log(error);
            res.status(400).send(error)
        }


    },

    async examAdmin(req, res) {
        try {
            let { ano_lectivo, id_institucion } = req.body
            let query = {
                text: queryes.consulExamsAdmin,
                values: [id_institucion, ano_lectivo]
            }
            let resp = await Db.query(query);


            let resul = resp.rows.map(item => {


                return {
                    id_cuestionario: item.row_to_json.idcuestionario,
                    idcuestionario: item.row_to_json.idcuestionario,
                    title: item.row_to_json.nombre,
                    descripcion: item.row_to_json.descripcion,
                    grupos: item.row_to_json.grupos,
                    grupo: item.row_to_json.grupos,
                    grupos: item.row_to_json.grupos,
                    preguntas: item.row_to_json.preguntas,
                    opciones: item.row_to_json.opciones,
                    fechainicio: item.row_to_json.aeinst_cue_fechaini,
                    fechafin: item.row_to_json.aeinst_cue_fechafin,
                    duracion: item.row_to_json.aeinst_cue_duracion,
                    id_programacion: item.row_to_json.idprogramacion,
                    tipointento: item.row_to_json.aeinst_cue_tipointento,
                    intentos: item.row_to_json.aeinst_cue_intentos,
                    ordenado: item.row_to_json.aeinst_cue_ordenado,
                    fecha_inicio: ahora,
                    docente: item.row_to_json.docente,
                    imagen: item.row_to_json.imagen,
                    nota_minima: item.row_to_json.aeinst_cue_resultadominimo,
                    questions: item.row_to_json.detalles != null ? item.row_to_json.detalles.map(items => {
                        return {
                            id_cuestions: items.aecue_id,
                            nombre: items.aecue_nombre,
                            id_pregunta: items.aepre_id,
                            orden: items.aepre_orden,
                            title: items.aepre_descripcion,
                            tipo_pregunta: items.aetippre_id,
                            opciones: items.opciones
                        }
                    }) : [],
                }
            })
            let tok = await token.createtoken(resul);
            res.status(200).send({ status: 'success', statusCode: 200, message: 'evaluciones', token: tok })

        } catch (error) {
            res.status(400).send({ status: 'error', statusCode: 400, message: error.toString(), token: tok })
        }
    },

    /**
     * Calification save result of evaluaciiones from students
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async Calification(req, res) {
        try {

            let { id_exam, duration, id_institucion, id_usu, id_academico, ano_lectivo, rol, response, cant_questions, id_programacion, fecha_inicio } = req.body;
            let abierta = null, waitResult = false
            response = JSON.parse(response);
            id_programacion = parseInt(id_programacion);
            id_exam = parseInt(id_exam);
            id_usu = parseInt(id_usu);


            let fecha_creacion = moment().format()

            let queryallintentos = {
                text: queryes.allintentos,
                values: [id_exam, id_usu]
            }
            let intentosall = await Db.query(queryallintentos)

            let queryexam = {
                text: queryes.programation,
                values: [id_programacion, id_exam]
            }
            let exam = await Db.query(queryexam)
            //IS IMPOSIBLE PERFORM EXAM
            /******************************************* */
            let fechaIni = moment(exam.rows[0].aeinst_cue_fechaini).format('YYYY-MM-DD HH:mm:ss')
            let fechaFin = moment(exam.rows[0].aeinst_cue_fechafin).format('YYYY-MM-DD HH:mm:ss')


            if (fecha_creacion < fechaIni) {
                let obj = {
                    posibility: false,
                    message: 'Aun no es tiempo de realizar el examen',
                    preguntas_correctas: 0,
                    total_preguntas: 1,
                    porcentaje: 0
                }
                let tok = await token.createtoken(obj);
                return res.status(200).send({ status: 'done', statusCode: 200, message: 'No puedes iniciar el examen', token: tok });
            }
            if (fecha_creacion > fechaFin) {
                let obj = {
                    posibility: false,
                    message: 'Ya es demasiado tarde para realizar el examen',
                    preguntas_correctas: 0,
                    total_preguntas: 1,
                    porcentaje: 0
                }
                let tok = await token.createtoken(obj);
                return res.status(200).send({ status: 'done', message: 'Ya cauduco la fecha para iniciar el examen', token: tok });
            }
            if (exam.rows[0].aeinst_cue_intentos <= intentosall.rows.length) {
                let obj = {
                    posibility: false,
                    message: 'Alcanzaste el limite maximo de intentos permitidos: ' + exam.rows[0].aeinst_cue_intentos + ', Ya no puedes hacer este examen',
                    preguntas_correctas: 0,
                    total_preguntas: 1,
                    porcentaje: 0
                }
                let tok = await token.createtoken(obj);
                return res.status(200).send({ status: 'done', message: 'Limite de intentos alcanzado', token: tok });
            }

            /****************************** */
            let idspreguta = []
            Object.keys(response).forEach(key => {
                idspreguta.push({
                    id: key.split('pregunta')[1],
                    respuesta: Array.isArray(response[key]) === true ? response[key] : [response[key]]
                })
            })

            //REGISTER EACH ANSWER
            let arr = []
            //GET DETAIL FOR EACH ANSWER OPTION
            //console.log('all preguntas: ', idspreguta)

            for (let i in idspreguta) {
                let query = {
                    text: queryes.consul,
                    values: [parseInt(idspreguta[i].id)]
                }
                let resp = await Db.query(query)
                //console.log('consulta: ', query)
                let resul = {}
                for (let j = 0; j < idspreguta[i].respuesta.length; j++) {
                    //QUESTION HAS OPTIONS OR IS FREE QUESTION
                    if (resp.rows.length > 0) {
                        resul = resp.rows.filter((items) => parseInt(items.aeopcres_id) === parseInt(idspreguta[i].respuesta[j]))
                        //console.log('El resul filtered: ', resul)
                    } else {
                        resul = [{ aeopcres_id: 0, aeopcres_descripcion: idspreguta[i].respuesta[0], aeopcres_valor: 0, aepre_id: idspreguta[i].id }]
                    }
                    arr.push(resul[0])//the [0] index is a hack to arr clean format
                }
            }
            //console.log('Mis respuestas: ', arr)

            let acertadas = arr.filter((item) => {
                if (item.hasOwnProperty('aeopcres_valor')) {
                    if (item.aeopcres_valor > 0) {
                        return item.aeopcres_valor
                    } else {
                        return item
                    }
                }
            });

            //console.log('respuestas acertadas: ', acertadas)


            let suma = 0;
            acertadas.map(item => {
                suma += item.aeopcres_valor
            })
            let calification = (suma / cant_questions) * 100;
            calification = Math.round(calification, 2)
            /*************************************************************** */

            /*************************************************************** */
            let aprobe = false;
            if (suma >= exam.rows[0].aeinst_cue_resultadominimo) {
                aprobe = true;
            }

            let queryintentos = {
                text: queryes.intentos,
                values: [id_programacion, id_usu, parseFloat(suma), fecha_inicio, fecha_creacion, duration, fecha_creacion, aprobe, 1]
            }
            //console.log('Los intentos: ', queryintentos)               

            let intentosid = await Db.query(queryintentos);

            for (let i in arr) {
                //console.log('for i: ', arr[i]) 
                if (arr[i].aeopcres_id == 0) {
                    abierta = arr[i].aeopcres_descripcion
                    waitResult = true
                }

                let queryrespuestas = {
                    text: queryes.respuestas,
                    values: [
                        parseInt(intentosid.rows[0].inst_cue_res_id),
                        parseInt(arr[i].aepre_id),
                        arr[i].aeopcres_id,
                        abierta
                    ]
                }
                //console.log('Insertando respuesta: '+i, queryrespuestas)
                await Db.query(queryrespuestas)
            }

            //CONDENSE ALL REGISTER IN VIEW FOR FUTURE QUERYES
            let Refresh = `REFRESH MATERIALIZED VIEW data.aenotas;`;
            let qeryRefresh = {
                text: Refresh
            }
            await Db.query(qeryRefresh)

            let textNota = 'SELECT * FROM data.aenotas WHERE aenota_tipo=1 AND aenota_referenciaid=$1';

            let queryNota = {
                text: textNota,
                values: [intentosid.rows[0].inst_cue_res_id]
            }

            let nota = await Db.query(queryNota)

            let queryInfo = 'SELECT * FROM engine.contacto_student_one($1, $2, $3);'

            let queryIn = {
                text: queryInfo,
                values: [ano_lectivo, id_institucion, [id_academico]]
            }

            let correos = await Db.query(queryIn);
            let messageAcu = {};
            let obj = {};

            ////console.log(correos.rows);

            if (nota.rows[0].aeestudiantes_id != null) {
                messageAcu = {
                    titulo: 'Evaluación finalizada',
                    message: ` El estudiante ${correos.rows[0].estudiante}, quien cursa ${nota.rows[0].aeestudiantes_grupo}, 
                    ha realizado la evaluacion ${exam.rows[0].aecue_nombre}
                    en la asignatura ${exam.rows[0].aecue_asignatura}.                
                    Con una Calificacion de ${nota.rows[0].aenota_resultado} .`
                }
                obj = {
                    message: messageAcu.message,
                    preguntas_correctas: 'En espera',
                    total_preguntas: cant_questions,
                    porcentaje: 'En espera'
                }
                //WHEN A QUESTION IS FREE, FINAL RESULT WAITING FOR TEACHER
                if (waitResult) {

                    messageAcu = {
                        titulo: 'Evaluación de ' + exam.rows[0].aecue_asignatura + ' finalizada',
                        message: ` El estudiante ${correos.rows[0].estudiante}, quien cursa ${nota.rows[0].aeestudiantes_grupo}, 
                        ha realizado la evaluacion ${exam.rows[0].aecue_nombre}
                        en la asignatura ${exam.rows[0].aecue_asignatura}.                
                        la calificación debe esperar a revisión del maestro.`
                    }

                    obj = {
                        message: messageAcu.message,
                        preguntas_correctas: 'En espera',
                        total_preguntas: cant_questions,
                        porcentaje: 'En espera'
                    }

                }

                await alerta.send({ subject: messageAcu.titulo, email: (correos.rows[0].correoestudiante || correos.rows[0].correoestudiante), message: messageAcu });
            }

            let tok = await token.createtoken(obj);

            res.status(200).send({ status: 'success', statusCode: 200, message: 'resultado', token: tok });


            /*********************************************************************** */
            /*
  
              switch (tipointento) {
                  case 1:
                      let prom = 0; 
                      intentosall.rows.map(item=>{
                          prom += item.inst_cue_res_resultado;
                      })
                      let resul = (prom/intentosall.rows.length)
                      break;
                  case 2:
                      if(intentosall.length === 1){
  
                          let queryintentos = {
                              text:intentos,
                              values:[id_institucion,id_usu,calification,new Date(),new Date(),duration,ahora,1]
                          }
                          await Db.query(queryintentos);
                      }
  
                  case 3:
                      if(intentosall.length === intentos){
                          let queryintentos = {
                              text:intentos,
                              values:[id_institucion,id_usu,calification,new Date(),new Date(),duration,ahora,1]
                          }
                          await Db.query(queryintentos);
                      }    
                      
              }
  
              */


        } catch (error) {
            //console.log(error);    
            res.status(400).send(error)
        }


    },

    /**
     * to show list for each asigments in a group
     * insert into table, send advice to device and mail
     * 
     * @param {*} req: anolectivo,institucion,group
     * @param {*} res: asigment list json format
     */
    async viewListAssigments(req, res) {
        try {
            let { ano_lectivo, id_institucion, grupo } = req.body
            const consul = `SELECT  
            a.aedocentes_id, d.aedocentes_nombres || ' ' || d.aedocentes_apellidos as aedocente, 
            a.aeasignaciones_asignatura, a.aeasignaciones_enlace
            FROM data.aeasignaciones a, data.aedocentes d
            WHERE a.aeanol_id=$1
            AND a.aeinst_id=$2
            AND lower(a.aeasignaciones_grupo) LIKE lower($3)
            AND a.aeasignaciones_estado=1
            AND a.aedocentes_id = d.aedocentes_id
            GROUP BY a.aedocentes_id, a.aeasignaciones_asignatura, 
            d.aedocentes_nombres || ' ' || d.aedocentes_apellidos, a.aeasignaciones_enlace
            ORDER BY a.aeasignaciones_asignatura,aedocente`;

            let query = {
                text: consul,
                values: [parseInt(ano_lectivo), parseInt(id_institucion), grupo]
            }

            let resp = await Db.query(query);
            let tok = await token.createtoken(resp);
            res.status(200).send({ status: 'success', statusCode: 200, message: 'datos', token: tok })

        } catch (error) {
            res.status(400).send(error)
        }
    },

    /**
     * getListAssigments to show list for each asigments in a group
     * insert into table, send advice to device and mail
     * 
     * @param {*} req: anolectivo,institucion,group
     * @param {*} res: asigment list json format
     */
    async getListAssigments(req, res) {
        try {
            //diasemana start with 0, in database is 1 more
            let { ano_lectivo, id_institucion, grupo, diasemana } = req.body

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
            }

            let resp = await Db.query(query)

            let resul = [], codes = []
            resp.rows.map(item => {
                codes.push(item.aeasignaciones_asignatura.trim())
                resul.push({ code: item.aeasignaciones_asignatura.trim(), label: item.aeasignaciones_asignatura.trim() })
            })
            if (resp.rows.length > 1) {
                resul.unshift({ code: codes.join(','), label: 'Todas' })
            }
            //console.log('las asignaturas: ', resul)

            let tok = await token.createtoken(resul);
            res.send({ status: 'success', statusCode: 200, message: resp.rows.length + ' asignaturas encontradas', token: tok })

        } catch (error) {
            res.status(400).send(error.toString())
        }
    },

    /**
     * Asigments show all registered asignments for school
     * @param {*} req ano_lectivo,id_institucion
     * @param {*} res 
     */
    async Asigments(req, res) {
        try {
            let { ano_lectivo, id_institucion } = req.body

            let query = {
                text: `SELECT 
                a.aeinst_nombre,
                e.aeasignaciones_asignatura
                FROM data.aeasignaciones e, data.aeinstituciones a
                WHERE e.aeinst_id = $1 -- ID INSTITUCION
                AND e.aeanol_id=$2 -- ID ANOLECTIVO
                AND e.aeinst_id=a.aeinst_id
                GROUP BY a.aeinst_nombre, e.aeasignaciones_asignatura
                ORDER BY a.aeinst_nombre, e.aeasignaciones_asignatura`,
                values: [id_institucion, ano_lectivo]
            }

            let resp = await Db.query(query);
            let tok = await token.createtoken(resp);
            res.status(200).send({ status: 'success', statusCode: 200, message: 'datos', token: tok })

        } catch (error) {
            res.status(400).send(error.toString())
        }
    },

    /**
     * asigmentsTeachersUnique: list asigments by teacher, inst and anolec
     * req: ano_lectivo,id_institucion,id_docente
     * res: [asignment,asigment,...]
     */
    async asigmentsTeachersUnique(req, res) {
        try {
            let { ano_lectivo, id_institucion, id_docente } = req.body

            let query = {
                text: `SELECT 
                e.aeasignaciones_asignatura
                FROM data.aeasignaciones e, data.aeinstituciones a
                WHERE e.aeinst_id = $1 -- ID INSTITUCION
                AND e.aeanol_id=$2 -- ID ANOLECTIVO
                AND e.aedocentes_id=$3 -- ID DOCENTE
                AND e.aeinst_id=a.aeinst_id
                GROUP BY e.aeasignaciones_asignatura
                ORDER BY e.aeasignaciones_asignatura`,
                values: [id_institucion, ano_lectivo, id_docente]
            }

            let resp = await Db.query(query);

            let tok = await token.createtoken(resp.rows);
            res.status(200).send({ status: 'success', statusCode: 200, message: 'datos', token: tok })

        } catch (error) {
            res.status(400).send(error.toString())
        }
    },



    /**
     * reviewAttendance show stundents with 2 or more unn attendance for week
     * @param {*} req : {ano_lectivo,id_institucion,grupo}
     * @param {*} res : 200->registradas y la cantidad
    */
    async reviewAttendance(req, res) {
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
                text: `SELECT row_to_json(u) as datos
                FROM (
                    SELECT e.aeestudiantes_id as estudianteid, e.aeano_id AS anoid, e.aeinstitucion_id AS institucionid, a.aeestudiantes_grupo AS grupo,
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
                        WHERE c.aeacudientes_id=e.aeacudientes_id
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
                    FROM data.aeasistencias a, data.aeestudiantes e
                    WHERE e.aeano_id = $1 AND e.aeinstitucion_id = $2 
                    `+ grupo + `
                    AND e.aeestudiantes_estado <> 0
                    AND a.aeasistencias_fecha BETWEEN $3 AND $4
                    AND a.aeasistencias_llego=false
                    AND e.aeestudiantes_id=a.aeestudiantes_id
                    GROUP BY e.aeestudiantes_id, e.aeano_id, e.aeinstitucion_id,
                    initcap(lower(aeestudiantes_apellidos)) || ' ' || initcap(lower(aeestudiantes_nombres)),
                    a.aeestudiantes_grupo, e.aeestudiantes_mail, e.aeacudientes_id, e.aeestudiantes_telefono
                    HAVING COUNT(DISTINCT a.aeasistencias_fecha) > $5
                    ORDER BY NULLIF(regexp_replace(a.aeestudiantes_grupo, '[^0-9]*','','g'), '')::numeric, 
                    aeestudiantes_nombres, INASISTENCIAS DESC
                ) u;`,
                values: [ano_lectivo, id_institucion, inicio, fin, parseInt(umbralInasistencias.rows[0].umbralinasistencias)]
            }
            //console.log('EL AUSENTISMO : ', query)


            await Db.query(query)
            .then(results =>{

                results.rows.forEach((item, i) => {
                    results.rows[i].umbral = parseInt(umbralInasistencias.rows[0].umbralinasistencias)
                    results.rows[i].datos.estudianteid = token.encriptar(item.datos.estudianteid)
                    results.rows[i].datos.diferencia = parseInt(item.datos.inasistencias) - parseInt(item.datos.excusas)
                    results.rows[i].datos.aeestudiantes_mail = item.datos.aeestudiantes_mail.join(', ')
                    results.rows[i].datos.aeacudientes_telefono = item.datos.aeacudientes_telefono.join(', ')
                })

                //console.log('Listado de ausentes: ', results.rows)

                resultadoFinal = {
                    id_institucion: id_institucion,
                    title:'Estudiantes inasistentes',
                    id:'totalStudentsAttendance',
                    caption:`Estudiantes con inasistencias en ${req.user.usuarioInstitucionNombre}`,
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
     * reviewAttendanceGroup show stundents with 2 or more unn attendance for week
     * @param {*} req : {ano_lectivo,id_institucion,grupo}
     * @param {*} res : 200->registradas y la cantidad
    */
    async reviewAttendanceGroup(req, res) {
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
                text: consultasAcademicas.attendanceCount,
                values: [ano_lectivo, id_institucion, inicio, fin, parseInt(umbralInasistencias.rows[0].umbralinasistencias)]
            })
            .then(results =>{
                resultadoFinal = {
                    id_institucion: id_institucion,
                    title:'Pre ausentismo en grupos',
                    id:'totalGroupPaviaClase',
                    caption:`Pre ausentismo por grupos entre ${inicio} y ${fin} en ${req.user.usuarioInstitucionNombre}`,
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
     * reviewAttendance show stundents with 2 or more unn attendance for week GLOBAL ADMIN
     * @param {*} req : {ano_lectivo,id_institucion,grupo}
     * @param {*} res : 200->registradas y la cantidad
    */
    async reviewAttendanceGlobal(req, res) {
        try {
            let { ano_lectivo, id_institucion, grupo, fechainicial, fechafinal } = req.body
            id_institucion = parseInt(id_institucion)
            ano_lectivo = parseInt(ano_lectivo)
            if (grupo = (typeof grupo != "undefined")) {
                if (grupo.indexOf(',') > -1) {
                    grupo = `AND a.aeestudiantes_grupo LIKE '` + grupo.replace(",", "','") + `'`
                }
            } else {
                grupo = ''
            }

            //grupo=(typeof grupo != "undefined")? `AND a.aeestudiantes_grupo LIKE '`+grupo+`'` : '' ;
            let d = moment();
            let inicio = (fechainicial != '' && fechainicial != null) ? fechainicial : moment().format('YYYY-MM-DD');
            let fin = (fechafinal != '' && fechafinal != null) ? fechafinal : moment().subtract(45, "days").format('YYYY-MM-DD');
            //UMBRAL DE INASISTENCIAS PERMITIDAS DURANTE UNA SEMANA
            let confs = {
                text: `SELECT COALESCE(aeinstconf_asistencias_umbralweek, 2) as umbralinasistencias 
                FROM data.aeinstituciones_conf 
                WHERE aeinst_id=$1 AND aeinstconf_anolectivo=$2`,
                values: [id_institucion, ano_lectivo]
            }
            //console.log('las conf: ', confs)   
            let umbralInasistencias = await Db.query(confs)


            let query = {
                text: `SELECT row_to_json(u) as datos
                FROM (
                    SELECT initcap(lower(e.aeestudiantes_apellidos)) || ' ' || initcap(lower(e.aeestudiantes_nombres)) AS aeestudiantes_nombres,
                    a.aeestudiantes_grupo, e.aeestudiantes_mail, e.aeestudiantes_telefono,
                    (
                        SELECT array_agg(aeestudiantes_telefonoacudiente)
                        FROM data.aeacudientes c
                        WHERE c.aeacudientes_id=e.aeacudientes_id
                    ) AS aeacudientes_telefono,
                    COUNT(DISTINCT a.aeasistencias_fecha) AS INASISTENCIAS
                    FROM data.aeasistencias a, data.aeestudiantes e
                    WHERE e.aeano_id = $1 AND e.aeinstitucion_id = $2 
                    `+ grupo + `
                    AND e.aeestudiantes_estado <> 0
                    AND a.aeasistencias_fecha BETWEEN $3 AND $4
                    AND a.aeasistencias_llego=false
                    AND e.aeestudiantes_id=a.aeestudiantes_id
                    GROUP BY initcap(lower(aeestudiantes_apellidos)) || ' ' || initcap(lower(aeestudiantes_nombres)),
                    a.aeestudiantes_grupo, e.aeestudiantes_mail, e.aeacudientes_id, e.aeestudiantes_telefono
                    HAVING COUNT(DISTINCT a.aeasistencias_fecha) > $5
                    ORDER BY NULLIF(regexp_replace(a.aeestudiantes_grupo, '[^0-9]*','','g'), '')::numeric, 
                    aeestudiantes_nombres, INASISTENCIAS desc
                ) u;`,
                values: [ano_lectivo, id_institucion, inicio, fin, parseInt(umbralInasistencias.rows[0].umbralinasistencias)]
            }
            //console.log('las query: ', query)   


            let resp = await Db.query(query);

            let tok = await token.createtoken(resp.rows);

            res.send({ status: 'success', statusCode: 200, message: resp.rows.length + ' Inasistencias ', token: tok })
        } catch (error) {
            res.send(error.toString())
        }
    },

    /**
     * reviewAttendanceGroup show stundents with 2 or more unn attendance for week  GLOBAL ADMIN
     * @param {*} req : {ano_lectivo,id_institucion,grupo}
     * @param {*} res : 200->registradas y la cantidad
    */
    async reviewAttendanceGroupGlobal(req, res) {
        try {
            let { ano_lectivo, id_institucion, grupo, fechainicial, fechafinal } = req.body

            let lasSedes = [], losAnolectivo = []
            id_institucion.split(",").map((miSede) => {
                lasSedes.push(token.decriptar(miSede))
            })
            ano_lectivo.split(",").map((miAno) => {
                losAnolectivo.push(token.decriptar(miAno))
            })
            //grupo=(typeof grupo != "undefined")? `AND a.aeestudiantes_grupo LIKE '`+grupo+`'` : '' ;
            let d = moment();
            let inicio = (fechainicial != '' && fechainicial != null) ? fechainicial : moment().format('YYYY-MM-DD');
            let fin = (fechafinal != '' && fechafinal != null) ? fechafinal : moment().subtract(8, "days").format('YYYY-MM-DD');
            //UMBRAL DE INASISTENCIAS PERMITIDAS DURANTE UNA SEMANA
            /*
            let confs = {
                text:`SELECT COALESCE(aeinstconf_asistencias_umbralweek, 2) as umbralinasistencias 
                FROM data.aeinstituciones_conf 
                WHERE aeinst_id=$1 AND aeinstconf_anolectivo=$2`,
                values:[id_institucion,ano_lectivo]
            } 
            //console.log('las conf: ', confs)   
            let umbralInasistencias = await Db.query(confs)
            */

            let resp = await Db.query({
                text: consultasAcademicas.attendanceCountGlobal,
                values: [losAnolectivo, lasSedes, inicio, fin]
            });
            //console.log('la query asistencias: ', resp.rows)
            resp.rows.map((sede, i) => {
                resp.rows[i].aeinst_id = token.encriptar(sede.aeinst_id)
            })

            let tok = await token.createtoken(resp.rows);

            res.send({ status: 'success', statusCode: 200, message: resp.rows.length + ' Instituciones ', token: tok })
        } catch (error) {
            res.send(error.toString())
        }
    },

    /**
     * listStudentsGroup return list of student in a group of school
     * @param {*} req: id_institucion,ano_lectivo,group
     * @param {*} res: [{grupo:'grupo'},{grupo:'grupo'}...]
     */
    async listStudentsGroup(req, res) {
        let { id_academico, rol, group, header } = req.body
        let id_institucion = parseInt(token.decriptar(req.user.usuarioEmpresaId))
        let ano_lectivo = parseInt(token.decriptar(req.user.usuarioAnoId))

        header = (typeof header != "undefined" && header != 'false') ? true : false;
        //console.log('Header: '+typeof header, header)

        try {
            let query = {
                text: `
                -- LISTA DE ESTUDIANTES EN UN GRUPO, DE UNA INSTITUCION EN UN ANOLECTIVO
                SELECT aeestudiantes_id as idestudiante,aeusu_id as idusuario, 
                (aeestudiantes_apellidos || ' ' || aeestudiantes_nombres) as nombreestudiante, 
                aeestudiantes_grupo as grupoestudiante
                 FROM data.aeestudiantes
                 WHERE aeestudiantes_grupo=$3
                 AND aeinstitucion_id=$1
                 AND aeano_id=$2
                 AND aeestudiantes_estado=1
                 ORDER BY aeestudiantes_grupo,nombreestudiante`,
                values: [id_institucion, ano_lectivo, group]
            }

            let toditos = [], toditosUsuarios = [], tok = null

            let resp = await Db.query(query);

            if (resp.rows.length > 0) {
                //IF header is true ADD 'Todos' TO RESPONSE GROUP LIST 
                //let resul = (resp.rows.length > 0)? [{aeestudiantes_id:,aeestudiantes_nombre:'Todos'}] : [{}] ;
                if (header) {
                    resp.rows.forEach((item,i) => {
                        resp.rows[i].idestudiante = token.encriptar(item.idestudiante)
                        resp.rows[i].idusuario = token.encriptar(item.idusuario)

                        toditos.push(resp.rows[i].idestudiante)
                        toditosUsuarios.push(resp.rows[i].idusuario)
                    })
                    resp.rows.unshift({ idestudiante: toditos, idusuario: toditosUsuarios, nombreestudiante: 'Todos' })
                }
            }

            res.send({ 
                status: 'success', 
                statusCode: 200, 
                message: resp.rows.length + ' Estudiantes encontrados ', 
                rows: resp.rows 
            })
        } catch (error) {
            console.log(error.toString())
            res.send({ 
                status: 'error', 
                statusCode: 400, 
                message: ' El sistema presenta un error inesperado ', 
                rows: []
            })
        }

    },

    /**
     * listAttendancePersonal show non-attendance list for one student
     * @param {*} req : {id_usuario,ano_lectivo,id_institucion,id_docente,grupo,asignatura,estudiantesSI,estudiantesNO}
     * @param {*} res : 200->registradas y la cantidad
     */
    async listAttendancePersonal(req, res) {
        try {
            let { id_usuario, id_academico, ano_lectivo, id_institucion, grupo } = req.body
            id_usuario = parseInt(id_usuario)
            id_academico = parseInt(id_academico)
            id_institucion = parseInt(id_institucion)
            ano_lectivo = parseInt(ano_lectivo)
            let inicio = moment().format('YYYY-MM-DD') //(fechainicial!='' && fechainicial!=null)? fechainicial : moment().format('YYYY-MM-DD')
            let fin = moment().subtract(3, "months").format('YYYY-MM-DD') //(fechafinal!='' && fechafinal!=null)? fechafinal :  moment().subtract(3, "months").format('YYYY-MM-DD')
            //FECHA LIMITE PARA LAS EXCUSAS SEGUN LA INSTITUCION DONDE ESTA EL ESTUDIANTE
            let confs = {
                text: `SELECT COALESCE(aeinstconf_excusas_limite, 1) as limiteexcusas 
                FROM data.aeinstituciones_conf 
                WHERE aeinst_id=$1 AND aeinstconf_anolectivo=$2`,
                values: [id_institucion, ano_lectivo]
            }
            let limitExcusa = await Db.query(confs)


            let query = {
                text: consultasAcademicas.listAsistenciasEstudiante,
                values: [id_academico, moment(inicio).format('YYYY-MM-DD'), moment(fin).format('YYYY-MM-DD'), parseInt(limitExcusa.rows[0].limiteexcusas)] //ano_lectivo,id_institucion,id_docente,grupo,asignatura
            }
            //console.log('consulta: ', query)

            let resp = await Db.query(query);
            //console.log('Datos: ', resp.rows)

            let tok = await token.createtoken(resp.rows);

            res.send({ status: 'success', statusCode: 200, message: 'asistencias', token: tok })
        } catch (error) {
            res.send(error.toString())
        }
    },

    /**
     * sendExcuse save excuses from a student, send notification to teacher and school
     * and a student or parent comment
     * @param {*} req: id_institucion,ano_lectivo,id_academico,id_usuario,reference
     * @param {*} res: [{grupo:'grupo'},{grupo:'grupo'}...]
     */
    async sendExcuse(req, res) {
        let {
            ano_lectivo, id_institucion, id_academico, id_usuario,
            rol, reference, fecha_inicial, fecha_final,
            tipo_excusa, mensaje, excusa_adjunto, group, asignaturas, limite_excusa,
            estudiante
        } = req.body

        try {

            const wpSender = require('../utils/notifications/whatsapp/wpRomote')
            ano_lectivo = parseInt(ano_lectivo), id_institucion = parseInt(id_institucion), id_academico = parseInt(id_academico),
                id_usuario = parseInt(id_usuario), rol = parseInt(rol), tipo_excusa = parseInt(tipo_excusa), asignaturas = asignaturas.split(',').map(String)
            limite_excusa = parseInt(limite_excusa) + 1// 1 DAY OFF 

            //console.log('Mis excusas: ', asignaturas)


            const DIR = 'p/ex/' + id_institucion

            let elAdjunto = null
            if (req.files) {
                elAdjunto = req.files[0] ? `${DIR}/${req.files[0].filename}` : null
            }

            let lafechaInicio = moment(fecha_inicial), lafechaFinal = moment(fecha_final)

            //IF fecha_inicial DON'T EXCEED (now()-limite_excusa), REGISTER EXCUSA
            if ((moment().subtract(limite_excusa, "days") <= lafechaInicio) && (lafechaInicio <= lafechaFinal)) {

                let listQueries = await Db.query({
                    text: consultasAcademicas.excusasInsert,
                    values: [
                        id_institucion, ano_lectivo, id_academico, ahora,
                        moment(fecha_inicial).format('YYYY-MM-DD HH:mm:ss'),
                        moment(fecha_final).format('YYYY-MM-DD HH:mm:ss'),
                        tipo_excusa, mensaje, elAdjunto, asignaturas
                    ]
                })

                if (listQueries.rowCount > 0) {
                    let idEncriptado = await token.encriptar(listQueries.rows[0].aeexcusas_id)

                    let resp = await Db.query({
                        text: `SELECT * FROM engine.contacto_teacher($1, $2, $3);`,
                        values: [ano_lectivo, id_institucion, group]
                    });
                    let totalMessages = 0, totalPush = 0;

                    ////console.log('La contactos: ', resp.rows)
                    let elBotonComunicado = generateButton.boton({ type: 'success', shape: 'square', destination: 'excusas/' + idEncriptado, text: ' Ver excusa ' })


                    let destUsu = [], destNames = [], destMail = [], destToken = [];

                    resp.rows.map(contacto => {
                        if (contacto.aedocentes_mail.indexOf('@') >= 0) {
                            destNames.push(contacto.docente)
                            destUsu.push(contacto.aeusu_id)
                            destMail.push(contacto.aedocentes_mail)
                            destToken.push(contacto.telefono)
                        }
                    })

                    let messagePreview = token.noHTML(mensaje) // mensaje.replace(/<\/?[^>]+>/ig, " ").substring(0, 30) + ' ... '
                    let payload = {
                        notification: {
                            title: 'Excusa en ' + group,
                            body: messagePreview,
                            extra: elBotonComunicado
                        },
                        data: {
                            route: 'notification?referencia=excusas',
                            index: idEncriptado.toString()
                        }
                    }
                    //console.log('La payload: ', payload);

                    let notificacionQuery = {
                        text: `INSERT INTO data.aenotificaciones(
                            aenotificaciones_id, aenotificaciones_de, aenotificaciones_para, aenotificaciones_fecha, 
                            aenotificaciones_title, aenotificaciones_body, aenotificaciones_ruta, aenotificaciones_referencia, aenotificaciones_data)
                            VALUES ((SELECT COALESCE(MAX(aenotificaciones_id)+1, 1) FROM data.aenotificaciones), $1, $2, $3, $4, $5, $6, $7, $8) RETURNING aenotificaciones_id`,
                        values: [id_usuario, destUsu, ahora, payload.notification.title,
                            payload.notification.body, 'data.aeexcusas', listQueries.rows[0].aeexcusas_id, payload.data]
                    }

                    let respnotificacionQuery = await Db.query(notificacionQuery);
                    //console.log('La respnotificacionQuery: ', respnotificacionQuery)

                    // totalPush = await pusher.pushSendMessage({ name: destNames, tokens: destToken, message: payload })


                    //LIST DATABASE EMISOR
                    await Db.query({
                        text: wpQueryes.myWPSessionsExtend,
                        values: [ano_lectivo,[id_institucion]]
                    })
                    .then(async (elEmisor) =>{
                        let preLogo = path.join(__dirname, '../', '/public/images/android-chrome-512x512.png')
                        // IF ADJUNTO IS IMAGE, SEND IT IN NOTIFICATION
                        if(elAdjunto!==null){
                            if( ['png','jpg','jpeg','gif'].indexOf(path.extname(elAdjunto).toLowerCase()) ){
                                preLogo = path.join(__dirname, '../',  '/public/archivos/excusas/', id_institucion+'/', req.files[0].filename )                            
                            }
                        }
                        const miLogo = MessageMedia.fromFilePath(preLogo);
                        const enlace = process.env.APP_API_FRONT+'/excusas/' + idEncriptado

                        elEmisor.rows[0].emisorlist.map(async (esteEmisor,e) => {
                            if(esteEmisor != null && esteEmisor != ""){
                                console.log('esteEmisor: ', esteEmisor)

                                let avisados = 0

                                destToken.map(async (contact) =>{
                                    if(contact.length > 9){  

                                        await wpSender.isRegistered({
                                            emisor:esteEmisor,
                                            number:contact
                                        })
                                        .then(async verificado => {
                                            console.log('verificado._serialized: ', contact, verificado._serialized)
                                            if(verificado._serialized !== "" && verificado._serialized !== null && typeof verificado._serialized !== "undefined"){
                                                
                                                await wpSender.sendLinkOne({
                                                    emisor: esteEmisor,
                                                    sessionId: esteEmisor,
                                                    idcosa: listQueries.rows[0].aeexcusas_id,
                                                    idvotantes: id_academico,
                                                    number: '+573178954170', // verificado._serialized
                                                    message: 'NUEVA EXCUSA de ' +estudiante+' de '+ group+'\n\n'+payload.notification.body+`\n\nPara mas detalles ingrese a colarqui.edu.co\n\n${enlace}`,
                                                    type: 4,
                                                    image: miLogo,
                                                    campana: id_institucion,
                                                    link: enlace
                                                })
                                            }                                           
                                        })

                                    }
                                })                           
                            }
                        })
                    })
                    .catch(async erroreo => {
                        // tok = await token.createtoken('La observación fue registrada, no se enviaron mensajes, porque el whatsapp del colegio no esta conectado, por favor avise a su secretaria')
                        console.log('Error myWPSessionsExtend: ', erroreo)
                    })

                    totalMessages = await alerta.send({
                        name: destNames,
                        email: destMail,
                        message: {
                            titulo: payload.notification.title,
                            message: payload.notification.body + '<br/><div style="text-align:center;">' + elBotonComunicado + '</div>'
                        }
                    })
                    //console.log('Push enviados: ', totalMessages)

                    let elmensajefinal = 'Excusa enviada a ' + destMail.length + ' docentes'
                    let tok = await token.createtoken(elmensajefinal)

                    res.send({ status: 'success', 'statusCode': 200, 'message': elmensajefinal, token: tok })
                } else {
                    let tok = await token.createtoken('Excusa registrada')
                    res.send({ status: 'success', 'statusCode': 200, 'message': elmensajefinal, token: tok })
                }
            }
            //WHEN fecha_inicio EXCEED ahora 
            else {
                let tok = await token.createtoken('las fechas para la excusa exceden los límites de la institución')
                res.send({ status: 'error', 'statusCode': 400, 'message': 'las fechas para la excusa exceden los límites de la institución', token: tok })
            }
        } catch (error) {
            res.send({ status: 'error', 'statusCode': 400, 'message': error.toString() })
        }
    },

    /**
     * listExcuse show excuses registered
     * @param {*} req: id_institucion,ano_lectivo
     * @param {*} res: [{grupo:'grupo'},{grupo:'grupo'}...]
     */
    async listExcuse(req, res) {
        try {
            let {reference, group, fecha_inicio, fecha_fin } = req.body
            let consultasdocentes, query, criterios = ``;

            let ano_lectivo = parseInt(token.decriptar(req.user.usuarioAnoId))
            let id_institucion = parseInt(token.decriptar(req.user.usuarioEmpresaId))
            let id_academico = parseInt(token.decriptar(req.user.academicoId))
            let rol = parseInt(token.decriptar(req.user.usuarioRollId))


            fecha_inicio = (typeof fecha_inicio != undefined) ? moment(fecha_inicio).format('YYYY-MM-DD') : moment().startOf('month').format('YYYY-MM-DD');
            fecha_fin = (typeof fecha_fin != undefined) ? moment(fecha_fin).format('YYYY-MM-DD') : moment().endOf('month').format('YYYY-MM-DD');

            switch (rol) {
                case 1:
                case 201:
                    criterios = `AND (
                        TO_CHAR(e.aeexcusas_desde, 'YYYY-MM-DD') BETWEEN '`+ fecha_inicio + `' AND '` + fecha_fin + `' 
                        OR 
                        TO_CHAR(e.aeexcusas_hasta, 'YYYY-MM-DD') BETWEEN '`+ fecha_inicio + `' AND '` + fecha_fin + `' 
                    )`
                    break;
                case 2:
                case 202:
                    criterios = `
                    AND s.aeestudiantes_grupo 
                    IN (
                        SELECT 
                        x.aeasignaciones_grupo 
                        FROM data.aeasignaciones x, data.aeinstituciones a
                        WHERE x.aeinst_id = $2 -- ID INSTITUCION
                        AND x.aeanol_id= $1 -- ID ANOLECTIVO
                        AND x.aedocentes_id= `+ id_academico + ` -- ID DOCENTE
                        AND x.aeinst_id=a.aeinst_id
                        GROUP BY x.aeasignaciones_grupo 
                    )
                    AND (
                        TO_CHAR(e.aeexcusas_desde, 'YYYY-MM-DD') BETWEEN '`+ fecha_inicio + `' AND '` + fecha_fin + `'
                        OR 
                        TO_CHAR(e.aeexcusas_hasta, 'YYYY-MM-DD') BETWEEN '`+ fecha_inicio + `' AND '` + fecha_fin + `' 
                    )
                    `
                break;
                case 3:
                case 203:
                    criterios = `AND e.aeestudiantes_id = ` + id_academico + ` 
                    `
                break;
            }

            if (typeof reference !== "undefined" && reference != "" && reference != null) {

                query = {
                    text: `
                        SELECT 
                            e.aeexcusas_id AS idregistro, e.aeinst_id AS idinstitucion, 
                            e.aeanol_id AS idanolectivo, e.aeestudiantes_id AS idestudiante, 
                            (s.aeestudiantes_apellidos || ' ' || s.aeestudiantes_nombres) as estudiante,
                            s.aeestudiantes_grupo AS grupo, e.aeexcusas_fecha AS fecharegistro, 
                            TO_CHAR(e.aeexcusas_desde, 'YYYY-MM-DD HH:mm:ss') as desde, 
                            TO_CHAR(e.aeexcusas_hasta, 'YYYY-MM-DD HH:mm:ss') as hasta, 
                            t.aetipoexcusa_nombre AS tipoexcusa, 
                            e.aeexcusas_mensaje AS mensaje, e.aeexcusas_archivoadjunto AS adjunto, 
                            e.aeexcusas_estado AS idestado, d.aeestados_descripcion AS estado,
                            e.aeexcusas_asignatura AS asignatura,
                            (
                                (
                                    SELECT a.aeestudiantes_mailacudiente || ', ' || a.aeestudiantes_telefonoacudiente
                                    FROM data.aeacudientes a
                                    WHERE a.aeacudientes_id=s.aeacudientes_id
                                ) || ', ' || aeestudiantes_telefono
                            )  as contacto ,
                            (
                                SELECT 
                                    COUNT(r.aeexcusasrespuestas_id)
                                FROM data.aeexcusas_respuestas R
                                WHERE r.aeexcusas_id = e.aeexcusas_id      
                            ) AS interacciones,
                            (
                                SELECT json_agg(row_to_json(x))
                                FROM (
                                    SELECT r.aeexcusasrespuestas_id AS idrespuesta, 
                                    to_char(r.aeexcusasrespuestas_fecha, 'YYYY-MM-DD HH24:MI') AS respuestafecha, 
                                    u.aeusu_nombre AS usuarionombre,
                                    U.aeroll_id AS usuariorol,
                                    r.aeexcusasrespuestas_descripcion AS respuestadescripcion
                                    FROM data.aeexcusas_respuestas r, engine.aeusu u
                                    WHERE r.aeexcusas_id = $1
                                    AND r.aeusu_id = u.aeusu_id
                                    ORDER BY respuestafecha DESC
                                ) x
                            ) AS inter,
                            i.aeinst_nombre AS nombreinstitucion, i.calendario, 
                            i.aeinst_direccion AS direccion, i.aeinst_telefono AS telefono, 
                            i.aeinst_mail AS mail, i.aeinst_escudo AS escudo, i.aeinst_facebook AS facebook                      
                        FROM 
                            data.aeexcusas e LEFT JOIN data.aeestudiantes s
                                ON (e.aeestudiantes_id=s.aeestudiantes_id)
                            LEFT JOIN data.aeinstituciones i
                                ON (e.aeinst_id=i.aeinst_id)
                            LEFT JOIN data.aetipoexcusas t
                                ON (e.aetipoexcusa_id=t.aetipoexcusa_id)
                            LEFT JOIN data.aeestados d
                                ON (e.aeexcusas_estado=d.aeestados_id)
                        WHERE e.aeexcusas_id=$1
                        AND t.aetipoexcusa_id<>0
                        AND e.aeexcusas_estado<>0;`,
                    values: [parseInt(token.decriptar(reference))]
                }


            } else {

                //ADDING GROUP TO CRITERIA
                if (typeof group != "undefined" && group != "") {
                    criterios += `
                    AND s.aeestudiantes_grupo LIKE '`+ group + `'
                    `
                }
                query = {
                    text: `
                        SELECT 
                            e.aeexcusas_id AS idregistro, e.aeinst_id AS idinstitucion, 
                            e.aeanol_id AS idanolectivo, e.aeestudiantes_id AS idestudiante, 
                            (s.aeestudiantes_apellidos || ' ' || s.aeestudiantes_nombres) as estudiante,
                            s.aeestudiantes_grupo AS grupo, e.aeexcusas_fecha AS fecharegistro, 
                            TO_CHAR(e.aeexcusas_desde, 'YYYY-MM-DD HH:mm:ss') as desde, 
                            TO_CHAR(e.aeexcusas_hasta, 'YYYY-MM-DD HH:mm:ss') as hasta, 
                            t.aetipoexcusa_nombre as tipoexcusa, 
                            e.aeexcusas_mensaje AS mensaje, e.aeexcusas_archivoadjunto AS adjunto, 
                            e.aeexcusas_estado AS idestado, d.aeestados_descripcion AS estado,
                            e.aeexcusas_asignatura AS asignatura, 
                            (
                                SELECT 
                                    correoacudiente || ',' || contactos 
                                FROM engine.contacto_student_one($1, $2, ARRAY[s.aeestudiantes_id])
                            )  as contacto,
                            (
                                SELECT COUNT(r.aeexcusasrespuestas_id)
                                FROM data.aeexcusas_respuestas r
                                WHERE r.aeexcusas_id = e.aeexcusas_id      
                            ) AS interacciones
                        FROM 
                            data.aeexcusas e LEFT JOIN data.aeestudiantes s
                                ON (e.aeestudiantes_id=s.aeestudiantes_id)
                            LEFT JOIN data.aetipoexcusas t
                                ON (e.aetipoexcusa_id=t.aetipoexcusa_id)
                            LEFT JOIN data.aeestados d
                                ON (e.aeexcusas_estado=d.aeestados_id)
                        WHERE e.aeanol_id = $1
                        AND e.aeinst_id = $2
                        `+ criterios + `
                        AND t.aetipoexcusas_estado<>0
                        AND e.aeexcusas_estado<>0
                        AND s.aeestudiantes_estado<>0
                        ORDER BY e.aeexcusas_DESDE DESC;`,
                    values: [ano_lectivo, id_institucion]
                }
            }

            let resp = await Db.query(query);
            
            resp.rows.map((elem, idx) => {
                resp.rows[idx].idregistro = token.encriptar(resp.rows[idx].idregistro)
                resp.rows[idx].idestado = token.encriptar(resp.rows[idx].idestado)
                resp.rows[idx].idanolectivo = token.encriptar(resp.rows[idx].idanolectivo)
                resp.rows[idx].idestudiante = token.encriptar(resp.rows[idx].idestudiante)
                resp.rows[idx].idinstitucion = token.encriptar(resp.rows[idx].idinstitucion)

                // EACH ID ANSWER SHOULD BE MARQUERADE
                if(typeof resp.rows[idx].inter !== "undefined" && resp.rows[idx].inter !== null){
                    resp.rows[idx].inter.map((elen, idy) => {
                        resp.rows[idx].inter[idy].idrespuesta = token.encriptar(resp.rows[idx].inter[idy].idrespuesta)
                        resp.rows[idx].inter[idy].usuariorol = token.encriptar(resp.rows[idx].inter[idy].usuariorol)
                    })
                }else{
                    resp.rows[idx].inter = []
                }
            })

            res.send({ 
                status: 'success', 
                statusCode: 200, 
                message: resp.rows.length + ' Excusas ', 
                rows: resp.rows 
            })
        } catch (error) {
            console.log('Error listExcuse: ', error)
            res.send({ 
                status: 'success', 
                statusCode: 400, 
                message: 'El sistema no puede encontrar las excusas en este momento, intente de nuevo mas tarde', 
                rows: [] 
            })
        }
    },


    /**
     * listExcuse show excuses registered
     * @param {*} req: id_institucion,ano_lectivo
     * @param {*} res: [{grupo:'grupo'},{grupo:'grupo'}...]
     */
    async listExcuseOpen(req, res) {
        try {
            let { reference } = req.body

            if (typeof reference !== "undefined" && reference != "" && reference != null) {

                let resp = await Db.query({
                    text: `
                    -- DATOS DE UNA EXCUSA A PARTIR DEL IDEXCUSA
                        SELECT 
                            e.aeexcusas_id AS idregistro, e.aeinst_id AS idinstitucion, 
                            e.aeanol_id AS idanolectivo, e.aeestudiantes_id AS idestudiante, 
                            (s.aeestudiantes_apellidos) as estudiante,
                            s.aeestudiantes_grupo AS grupo, e.aeexcusas_fecha AS fecharegistro, 
                            TO_CHAR(e.aeexcusas_desde, 'YYYY-MM-DD') as desde, 
                            TO_CHAR(e.aeexcusas_hasta, 'YYYY-MM-DD') as hasta, 
                            t.aetipoexcusa_nombre AS tipoexcusa, 
                            e.aeexcusas_mensaje AS mensaje, e.aeexcusas_archivoadjunto AS adjunto, 
                            e.aeexcusas_estado AS idestado, d.aeestados_descripcion AS estado,
                            e.aeexcusas_asignatura AS asignatura,
                            (
                                (
                                    SELECT a.aeestudiantes_mailacudiente || ', ' || a.aeestudiantes_telefonoacudiente
                                    FROM data.aeacudientes a
                                    WHERE a.aeacudientes_id=s.aeacudientes_id
                                ) || ', ' || aeestudiantes_telefono
                            )  as contacto ,
                            (
                                SELECT 
                                    COUNT(r.aeexcusasrespuestas_id)
                                FROM data.aeexcusas_respuestas R
                                WHERE r.aeexcusas_id = e.aeexcusas_id      
                            ) AS interacciones,
                            (
                                SELECT json_agg(row_to_json(x))
                                FROM (
                                    SELECT r.aeexcusasrespuestas_id AS idrespuesta, 
                                    to_char(r.aeexcusasrespuestas_fecha, 'YYYY-MM-DD HH24:MI') AS respuestafecha, 
                                    u.aeusu_nombre AS usuarionombre,
                                    U.aeroll_id AS usuariorol,
                                    r.aeexcusasrespuestas_descripcion AS respuestadescripcion
                                    FROM data.aeexcusas_respuestas r, engine.aeusu u
                                    WHERE r.aeexcusas_id = $1
                                    AND r.aeusu_id = u.aeusu_id
                                    ORDER BY respuestafecha DESC
                                ) x
                            ) AS inter,
                            i.aeinst_nombre AS nombreinstitucion, i.calendario, 
                            i.aeinst_direccion AS direccion, i.aeinst_telefono AS telefono, 
                            i.aeinst_mail AS mail, i.aeinst_escudo AS escudo, i.aeinst_facebook AS facebook                      
                        FROM 
                            data.aeexcusas e LEFT JOIN data.aeestudiantes s
                                ON (e.aeestudiantes_id=s.aeestudiantes_id)
                            LEFT JOIN data.aeinstituciones i
                                ON (e.aeinst_id=i.aeinst_id)
                            LEFT JOIN data.aetipoexcusas t
                                ON (e.aetipoexcusa_id=t.aetipoexcusa_id)
                            LEFT JOIN data.aeestados d
                                ON (e.aeexcusas_estado=d.aeestados_id)
                        WHERE e.aeexcusas_id=$1
                        AND t.aetipoexcusa_id<>0
                        AND e.aeexcusas_estado<>0;`,
                    values: [parseInt(token.decriptar(reference))]
                });
                
                resp.rows.map((elem, idx) => {
                    resp.rows[idx].idregistro = token.encriptar(resp.rows[idx].idregistro)
                    resp.rows[idx].idestado = token.encriptar(resp.rows[idx].idestado)
                    resp.rows[idx].idanolectivo = token.encriptar(resp.rows[idx].idanolectivo)
                    resp.rows[idx].idestudiante = token.encriptar(resp.rows[idx].idestudiante)
                    resp.rows[idx].idinstitucion = token.encriptar(resp.rows[idx].idinstitucion)
                    resp.rows[idx].inter = [] // INTERACTIONS OR RESPONSES WILL NOT BE SHOWN
                })

                res.send({ 
                    status: 'success', 
                    statusCode: 200, 
                    message: resp.rows.length + ' Excusas ', 
                    rows: resp.rows 
                })
            }else{
                res.send({ 
                    status: 'error', 
                    statusCode: 400, 
                    message: 'No existe la excusa', 
                    rows: [] 
                })                
            }
        } catch (error) {
            console.log('Error listExcuse: ', error)
            res.send({ 
                status: 'error', 
                statusCode: 400, 
                message: 'El sistema no puede encontrar las excusas en este momento, intente de nuevo mas tarde', 
                rows: [] 
            })
        }
    },

    /**
     * deleteExcuse delete excuse, (only original user/school) can delete an excuse
     * @param {*} req: comunicate,reference,id_usuario
     * @param {*} res: length of emails and push notifications generated
     */
    async deleteExcuse(req, res) {
        try {
            let { reference } = req.body

            if (typeof reference != "undefined" && reference != "") {
                reference = parseInt(token.decriptar(reference))

                let id_academico = parseInt(token.decriptar(req.user.academicoId))
                let rol = parseInt(token.decriptar(req.user.usuarioRollId))

                await Db.query({
                    text: consultasAcademicas.excusasDelete,
                    values: [reference, id_academico, rol]
                })
                .then(async deleted => {

                    if (deleted.rowCount > 0) {
                        res.send({
                            status: 'success',
                            statusCode: 200,
                            message: 'Excusa eliminada',
                            rows: []
                        })
                    } else {
                        res.send({
                            status: 'error',
                            statusCode: 400,
                            message: 'No fue posible eliminar el registro! ¿Es usted el creador de la excusa?',
                            rows: []
                        })
                    }
                })
                .catch(async error => {
                    console.log(error);
                    res.send({
                        status: 'error',
                        statusCode: 400,
                        message: ' Ocurrio un error eliminando el registro, cierre sesión e intente nuevamente',
                        rows: []
                    })
                })

            } else {
                res.send({
                    status: 'error',
                    statusCode: 400,
                    message: ' Excusa no válida',
                    rows: []
                })
            }

        } catch (error) {
            console.log('deleteExcuse: ', error);
            res.send({
                status: 'error',
                statusCode: 400,
                message: 'El sistema no sabe cómo borrar ese comunicado',
                rows: []
            })
        }
    },

    /**
     * listExcuseGroup show excuses arrange by group
     * @param {*} req: id_institucion,ano_lectivo
     * @param {*} res: [{grupo:'grupo'},{grupo:'grupo'}...]
     */
    async listExcuseGroup(req, res) {
        try {
            let { ano_lectivo, id_academico, id_institucion, group, rol, fecha_inicio, fecha_fin } = req.body
            let consultasdocentes, losGrupos, query, criterios = ``;
            ano_lectivo = parseInt(ano_lectivo), id_academico = parseInt(id_academico), id_institucion = parseInt(id_institucion)
            rol = parseInt(rol)
            fecha_inicio = (typeof fecha_inicio != undefined) ? fecha_inicio : moment().startOf('month').format('YYYY-MM-DD');
            fecha_fin = (typeof fecha_fin != undefined) ? fecha_fin : moment().endOf('month').format('YYYY-MM-DD');

            switch (rol) {
                case 1:
                    criterios = `AND (
                        TO_CHAR(e.aeexcusas_desde, 'YYYY-MM-DD') BETWEEN '`+ fecha_inicio + `' AND '` + fecha_fin + `' 
                        OR 
                        TO_CHAR(e.aeexcusas_hasta, 'YYYY-MM-DD') BETWEEN '`+ fecha_inicio + `' AND '` + fecha_fin + `' 
                    )`
                    break;
                case 2:
                    criterios = `
                    AND s.aeestudiantes_grupo 
                    IN (
                        SELECT 
                        x.aeasignaciones_grupo 
                        FROM data.aeasignaciones x, data.aeinstituciones a
                        WHERE x.aeinst_id = $2 -- ID INSTITUCION
                        AND x.aeanol_id= $1 -- ID ANOLECTIVO
                        AND x.aedocentes_id= `+ id_academico + ` -- ID DOCENTE
                        AND x.aeinst_id=a.aeinst_id
                        GROUP BY x.aeasignaciones_grupo 
                    )
                    AND (
                        TO_CHAR(e.aeexcusas_desde, 'YYYY-MM-DD') BETWEEN '`+ fecha_inicio + `' AND '` + fecha_fin + `'
                        OR 
                        TO_CHAR(e.aeexcusas_hasta, 'YYYY-MM-DD') BETWEEN '`+ fecha_inicio + `' AND '` + fecha_fin + `' 
                    )
                    `
                    break;
                case 3:
                    criterios = `AND e.aeestudiantes_id = ` + id_academico + ` 
                    `
                    break;
            }

            //ADDING GROUP TO CRITERIA
            if (typeof group != undefined && group != "") {
                criterios += `
                AND s.aeestudiantes_grupo LIKE '`+ group + `'
                `
            }

            query = {
                text: `
                    SELECT 
                        s.aeestudiantes_grupo, t.aetipoexcusa_nombre, COUNT(e.aeexcusas_id) AS CANTIDAD
                    FROM data.aeestudiantes s, data.aeexcusas e, data.aetipoexcusas t
                    WHERE aeanol_id = $1
                    AND aeinst_id = $2
                    `+ criterios + `
                    AND t.aetipoexcusa_id<>0
                    AND e.aeexcusas_estado<>0
                    AND s.aeestudiantes_estado<>0
                    AND e.aetipoexcusa_id=t.aetipoexcusa_id
                    AND e.aeestudiantes_id=s.aeestudiantes_id
                    GROUP BY s.aeestudiantes_grupo, t.aetipoexcusa_nombre
                    ORDER BY NULLIF(regexp_replace(s.aeestudiantes_grupo, '[^0-9]*','','g'), '')::numeric`,
                values: [ano_lectivo, id_institucion]
            }

            let resp = await Db.query(query)

            let tok = await token.createtoken(resp.rows);
            res.status(200).send({ status: 'success', statusCode: 200, message: resp.rows.length + ' Excusas ', token: tok })
        } catch (error) {
            res.status(400).send(error.toString())
        }
    },

    /**
     * listTipoExcusa return list of aetipoexcusa for sendExcuse
     * @param {*} req: 
     * @param {*} res: [{code:#},{label:'bla'}...]
     */
    async listTipoExcusa(req, res) {
        let { id_institucion, ano_lectivo, rol } = req.body

        try {
            let query = {
                text: `SELECT aetipoexcusa_id, aetipoexcusa_nombre
                FROM data.aetipoexcusas
                WHERE aetipoexcusas_estado <> $1
                ORDER BY aetipoexcusa_id`,
                values: [0]
            }

            let resp = await Db.query(query)

            let resul = []
            resp.rows.map(item => {
                resul.push({ code: item.aetipoexcusa_id, label: item.aetipoexcusa_nombre })
            })
            //console.log('la respuesta tipo de excusa: ', resul)

            let tok = await token.createtoken(resul);
            res.status(200).send({ status: 'success', statusCode: 200, message: resp.rows.length + ' tipos de excusa', token: tok })
        } catch (error) {
            res.status(400).send(error.toString())
        }
    },

    /**
     * excusasComments register a excusas comment, a student 
     * @param {*} req: id_institucion,ano_lectivo,id_academico,id_usuario,reference,comunicate
     * @param {*} res: [{grupo:'grupo'},{grupo:'grupo'}...]
     */
    async excusasComments(req, res) {
        try {
            let { id_usuario, tipocomentario, reference, comunicate } = req.body

            id_usuario = parseInt(token.decriptar(id_usuario))
            tipocomentario = (tipocomentario==null || tipocomentario=="")? 1 : tipocomentario
            if (parseInt(tipocomentario) == 2) {
                comunicate = 'Visto'
            }

            if (typeof reference != "undefined" && reference != "" && reference != null) {
                reference = parseInt(token.decriptar(reference))

                await Db.query({
                    text: consultasAcademicas.excusasInsertComments,
                    values: [reference, id_usuario, tipocomentario, comunicate]
                })
                .then(async (listQueries) => {

                    res.send({ 
                        status: 'success', 
                        statusCode: 200, 
                        message: listQueries.rowCount + ' Comentario registrado', 
                        rows: [] 
                    })
                })
                .catch(async (error) => {
                    console.log(' excusasComments ', error)
                    res.send({ 
                        status: 'error', 
                        statusCode: 400, 
                        message: ' Comentario no registrado ', 
                        rows: [] 
                    })
                })

            } else {
                res.send({ 
                    status: 'error', 
                    statusCode: 400, 
                    message: 'Falta la excusa ', 
                    rows: [] 
                })
            }
        } catch (error) {
            console.log('catch excusasComments ', error)
            res.send({ 
                status: 'error', 
                statusCode: 400, 
                message: 'El sistema experimenta dificultades técnicas ', 
                rows: [] 
            })
        }
    },

    /**
     * group return list of group in a school
     * @param {*} req: id_institucion,ano_lectivo
     * @param {*} res: [{grupo:'grupo'},{grupo:'grupo'}...]
     */
    async group(req, res) {
        let { id_institucion, ano_lectivo, id_docente, rol } = req.body

        try {
            let query = {
                text: `SELECT g.aeestudiantes_grupo, NULLIF(regexp_replace(g.aeestudiantes_grupo, '[^0-9]*','','g'), '')::numeric as orden
                FROM DATA.aeestudiantes g
                WHERE g.aeinstitucion_id=$1
                AND g.aeano_id=$2
                GROUP BY aeestudiantes_grupo, orden
                ORDER BY orden, aeestudiantes_grupo;
                
                -- SELECT g.aeestudiantes_grupo, NULLIF(regexp_replace(g.aeestudiantes_grupo, '[^0-9]*','','g'), '')::numeric as orden
                -- FROM data.aegrupos g
                -- WHERE g.aeinstitucion_id=$1
                -- AND g.aeano_id=$2
                -- ORDER BY orden, aeestudiantes_grupo
                `,
                values: [parseInt(id_institucion), parseInt(ano_lectivo)]
            }
            ////console.log('la consulta grupos: ', query)
            let resp = await Db.query(query)
            ////console.log('la respuesta grupos: ', resp.rows)

            //ADD 'Todos' TO RESPONSE GROUP LIST 
            let resul = [], codes = []
            resp.rows.map(item => {
                codes.push(item.aeestudiantes_grupo)
                resul.push({ code: item.aeestudiantes_grupo, grupo: item.aeestudiantes_grupo })
            })
            if (rol == "1") {
                if (resp.rows.length > 0) {
                    resul.unshift({ code: codes.join(','), grupo: 'Todos' })
                }
            }

            ////console.log('Los grupos: ', resul)

            let tok = await token.createtoken(resul);
            res.status(200).send({ status: 'success', statusCode: 200, message: resp.rows.length + ' grupos', token: tok })
        } catch (error) {
            res.status(400).send(error.toString())
        }
    },

    /**
     * groupFilter return list of group for a teacher in the asigments
     * @param {*} req: id_institucion,ano_lectivo,id_docente
     * @param {*} res: [{grupo:'grupo'},{grupo:'grupo'}...]
     */
    async groupFilter(req, res) {
        let { id_institucion, ano_lectivo, id_docente, rol } = req.body

        try {
            let query = {
                text: `SELECT a.aeasignaciones_grupo, NULLIF(regexp_replace(a.aeasignaciones_grupo, '[^0-9]*','','g'), '')::numeric as orden
                FROM data.aeasignaciones a
                WHERE  a.aedocentes_id=$3
                AND a.aeinst_id=$1
                AND a.aeanol_id=$2
                GROUP BY aeasignaciones_grupo, NULLIF(regexp_replace(a.aeasignaciones_grupo, '[^0-9]*','','g'), '')
                ORDER BY orden, aeasignaciones_grupo`,
                values: [parseInt(id_institucion), parseInt(ano_lectivo), parseInt(id_docente)]
            }
            ////console.log('la consulta grupos: ', query)
            let resp = await Db.query(query)

            //ADD 'Todos' TO RESPONSE GROUP LIST 
            let resul = [], codes = []
            resp.rows.map(item => {
                codes.push(item.aeasignaciones_grupo)
                resul.push({ code: item.aeasignaciones_grupo, grupo: item.aeasignaciones_grupo })
            })

            if (rol == "1") {
                if (resp.rows.length > 0) {
                    resul.unshift({ code: codes.join(','), grupo: 'Todos' })
                }
            }
            ////console.log('la respuesta grupos: ', resul)

            let tok = await token.createtoken(resul);
            res.status(200).send({ status: 'success', statusCode: 200, message: resp.rows.length + ' grupos', token: tok })
        } catch (error) {
            res.status(400).send(error.toString())
        }
    },

    async listStudentsParent(req, res) {
        let { id_institucion, ano_lectivo, id_academico, rol } = req.body

        let consul = `SELECT aeestudiantes_id, 
           (aeestudiantes_apellidos || aeestudiantes_nombres) aeestudiantes_nombre, 
           aeestudiantes_grupo
            FROM data.aeestudiantes
            WHERE aeacudientes_id=$3
            AND aeinstitucion_id=$1
            AND aeano_id=$2
            ORDER BY aeestudiantes_grupo,aeestudiantes_nombre`

        try {
            let query = {
                text: consul,
                values: [id_institucion, ano_lectivo, id_academico]
            }

            let resp = await Db.query(query);

            let tok = await token.createtoken(resp);
            res.status(200).send({ status: 'success', statusCode: 200, message: 'datos', token: tok })
        } catch (error) {
            res.status(400).send(error)
        }

    },

    async typeInt(req, res) {
        try {
            let resp = [], tok = ""
            await Db.query({
                text: `SELECT aetipint_id, aetipint_descripcion, aetipint_estado
                FROM data.aetipint WHERE aetipint_estado=true;`,
            })
            .then(async result => {
               tok = await token.createtoken(resp.rows);
               res.send({ status: 'success', statusCode: 200, message: 'Intentos tipo', token: tok })
            })
            .catch(error => {
                res.send({ status: 'error', statusCode: 400, message: 'Sin datos', token: tok })
            });
        } catch (error) {
            res.send({ status: 'error', statusCode: 400, message: 'Intentos tipo', token: tok })
        }
    },

    async tyPre(req, res) {
        try {
            let consul = `SELECT aetippre_id, aetippre_descripcion, aetippre_estado
            FROM data.aetippre WHERE aetippre_estado=true;`

            let query = {
                text: consul,
            }

            let resp = await Db.query(query);
            let tok = await token.createtoken(resp.rows);

            res.status(200).send({ status: 'success', statusCode: 200, message: 'preguntas tipo', token: tok })
        } catch (error) {
            res.status(400).send(error)
        }
    },

    async Schools(req, res) {

        try {
            let { ano_lectivo } = req.body;
            let consul = `SELECT i.aeinst_id, aeusu_id, aeinst_nombre
                            FROM data.aeinstituciones i, data.aeinstituciones_conf c
                            WHERE c.aeinstconf_anolectivo=$1
                            AND i.aeinst_estado=1
                            AND c.aeinst_id=i.aeinst_id
                            ORDER BY aeinst_nombre`

            let query = {
                text: consul,
                values: [ano_lectivo],
            }

            let resp = await Db.query(query);
            let tok = await token.createtoken(resp.rows);
            res.status(200).send({ status: 'success', statusCode: 200, message: 'preguntas tipo', token: tok })
        } catch (error) {
            res.status(400).send(error)
        }
    },

    /**
     * listaSedes return list of schools to show in a select list
     * @param {*} req 
     * @param {*} res 
     */
    async listaSedes(req, res) {
        try {
            let { filtro } = req.body
            let sedes = []

            let previoSedes = await Db.query({
                text: consultasAcademicas.listaSedes,
                values: ['%' + filtro + '%'] //
            })
            if (previoSedes.rows.length > 0) {
                previoSedes.rows.forEach((item) => {
                    let elId = item.aeinst_id.toString()
                    let idano = item.idanolectivo.toString()
                    sedes.push({
                        id: token.encriptar(item.aeinst_id),
                        nombre: item.aeinst_nombre,
                        nit: item.aeinst_nit,
                        email: item.aeinst_mail,
                        idanolectivo: token.encriptar(item.idanolectivo), //item.idanolectivo.toString()
                        anolectivo: item.anolectivo
                    })
                });
            }
            tok = await token.createtoken(sedes);
            res.status(200).send({ status: 'success', statusCode: 200, message: previoSedes.rows.length + ' Sedes disponibles ', token: tok })

        } catch (error) {
            ////console.log(error.toString());
            res.status(400).send(error.toString());
        }
    },



    async anoLectivo(req, res) {
        try {

            let consul = `SELECT aeano_id, aeano_descripcion,
                            UPPER(aeano_calendario) AS aeano_calendario, aeano_estado
                            FROM data.aeano
                            WHERE aeano_estado=1
                            ORDER BY aeano_id;`

            let query = {
                text: consul,

            }

            let resp = await Db.query(query);
            let tok = await token.createtoken(resp.rows);
            res.status(200).send({ status: 'success', statusCode: 200, message: 'preguntas tipo', token: tok })
        } catch (error) {
            res.status(400).send(error)
        }
    },

    async Deleteexams(req, res) {

        try {
            let { id_exam } = req.body;

            let consul = `DELETE FROM data.aeres
                    WHERE inst_cue_res_id IN (
                        SELECT i.inst_cue_res_id
                        FROM data.inst_cue p, data.inst_cue_res i
                        WHERE p.aecue_id=$1  -- ID DEL CUESTIONARIO
                        AND i.aeinst_cue_id=p.aeinst_cue_id
                    );`

            let query1 = {
                text: consul,
                values: [id_exam]
            }

            let resp1 = await Db.query(query1);

            let consul2 = ` DELETE FROM data.inst_cue_res
                        WHERE aeinst_cue_id IN (
                            SELECT aeinst_cue_id
                            FROM data.inst_cue 
                            WHERE aecue_id=$1  -- ID DEL CUESTIONARIO
                        );`;

            let query2 = {
                text: consul2,
                values: [id_exam]
            }

            let resp2 = await Db.query(query2);

            let consul3 = `DELETE FROM data.inst_cue
        WHERE aecue_id=$1 ;  -- ID DEL CUESTIONARIO
        `;

            let query3 = {
                text: consul3,
                values: [id_exam]
            }

            let resp3 = await Db.query(query3);

            let consul4 = `DELETE FROM data.aecue
            WHERE aecue_id=$1 ; -- ID DEL CUESTIONARIO`;

            let query4 = {
                text: consul4,
                values: [id_exam]
            }

            let resp4 = await Db.query(query4)

            let obj = {
                respuestas_eliminadas: resp1.rowCount,
                intentos_eliminados: resp2.rowCount,
                programaciones_eliminadas: resp3.rowCount,
                cuestionarios_eliminados: resp4.rowCount
            }
            let tok = await token.createtoken(obj);
            res.status(200).send({ status: 'success', statusCode: 200, message: 'preguntas tipo', token: tok })
        } catch (error) {
            res.status(400).send(error)
        }


    },

    async changepass(req, res) {


        let { old_pass, new_pass, confirm_pass, id_institucion, id_usu, ano_lectivo, rol } = req.body

        const consul = `SELECT
        u.aeusu_llave
        FROM engine.aeusu u
        WHERE u.aeusu_id = $1`


        try {
            let query = {
                text: consul,
                values: [id_usu]
            }
            let resp = await Db.query(query);

            if (resp.rows[0].aeusu_llave != old_pass) {
                let tok = await token.createtoken({ status: 'fail', message: 'Las contraseña antigua no coincide' });
                res.status(200).send({ status: 'success', statusCode: 200, message: 'datos', token: tok })
            } else {
                const change = `UPDATE engine.aeusu SET aeusu_llave = $1 WHERE aeusu_id = $2  `;

                let query1 = {
                    text: change,
                    values: [new_pass, id_usu]
                }
                let resp2 = await Db.query(query1);
                if (resp2.rowCount > 0) {
                    let resul = {
                        old_pass, new_pass, confirm_pass, id_institucion, id_usu, ano_lectivo, rol
                    }

                    let tok = await token.createtoken(resul)
                    res.status(200).send({ status: 'success', statusCode: 200, message: 'resultado', token: tok });
                }
            }

        } catch (error) {
            //console.log(error);
            res.status(400).send(error)
        }

    },

    /**
     * show all homeworks available for a student with group criteria1
     * @param {*} req 
     * @param {*} res 
     */
     async taskStudents(req, res) {
        let { id_institucion, ano_lectivo, group } = req.body
        try {
            let query = {
                text: queryes.TaskStudents,
                values: [group, ano_lectivo, id_institucion]
            }
            let resp = await Db.query(query)
            let resul = resp.rows.map(item => {
                return {
                    idtarea: token.encriptar(item.row_to_json.idcuestionario),
                    id_tarea: token.encriptar(item.row_to_json.idcuestionario),
                    id_programacion: token.encriptar(item.row_to_json.idprogramacion),
                    idprogramacion: token.encriptar(item.row_to_json.idprogramacion),
                    id_cuestionario: token.encriptar(item.row_to_json.idtarea),
                    idcuestionario: token.encriptar(item.row_to_json.idtarea),
                    fecha_creacion: item.row_to_json.aetar_fechacreacion,
                    fecha_limite: item.row_to_json.aetar_pro_fechalimite,
                    title: item.row_to_json.nombre,
                    descripcion: item.row_to_json.descripcion,
                    adjunto1: item.row_to_json.aetar_adjunto1,
                    adjunto2: item.row_to_json.aetar_adjunto2,
                    adjunto3: item.row_to_json.aetar_adjunto3,
                    estadoprogramacion: item.row_to_json.estadoprogramacion,
                    grupo: item.row_to_json.aeestudiantes_grupo,
                    docente: item.row_to_json.docente,
                    asignatura: item.row_to_json.aeasignaciones_asignatura,
                    respuestas: item.row_to_json.respuestas
                }
            })
            let tok = await token.createtoken(resul)
            res.status(200).send({ status: 'success', statusCode: 200, message: 'resultado', token: tok });
        } catch (error) {
            res.status(400).send(error.toString())
        }

    },

    /**
     * show homeworks details to student, 
     * he can answer it optionally send a file (frontend)
     * @param {*} req 
     * @param {*} res 
     */
     async showHomework(req, res) {
        let { id_institucion, ano_lectivo, group, reference, id_estudiante, programacion, estudiante } = req.body
        id_institucion = parseInt(id_institucion), ano_lectivo = parseInt(ano_lectivo), 
        reference=parseInt(token.decriptar(reference)), id_estudiante = parseInt(id_estudiante)
        programacion=parseInt(token.decriptar(programacion))
        
        try {
            var miestudiante = parseInt(id_estudiante)

            let query = {
                text: queryes.showTaskStudents,
                values: [reference, [programacion], ano_lectivo, id_institucion, miestudiante]
            }         


            if (typeof estudiante !== 'undefined') {
                miestudiante = parseInt(estudiante)
                var laprogramacion = programacion.split(',')
                laprogramacion = laprogramacion.map(Number)

                query = {
                    text: queryes.showTaskTeachers,
                    values: [reference, laprogramacion, ano_lectivo, id_institucion, miestudiante]
                }
            }
            console.log('La query: ', query)

            let resp = await Db.query(query);

            let resul = resp.rows.map(item => {
                return {
                    id_cuestionario: item.row_to_json.idtarea,
                    idcuestionario: item.row_to_json.idtarea,
                    estadotarea: item.row_to_json.estadotarea,
                    id_programacion: item.row_to_json.idprogramacion,
                    idprogramacion: item.row_to_json.idprogramacion,
                    estadoprogramacion: item.row_to_json.estadoprogramacion,
                    grupo: item.row_to_json.aeestudiantes_grupo,
                    nombre: item.row_to_json.nombre,
                    descripcion: item.row_to_json.descripcion,
                    aetar_fechacreacion: item.row_to_json.aetar_fechacreacion,
                    aetar_pro_fechalimite: item.row_to_json.aetar_pro_fechalimite,
                    adjunto: item.row_to_json.adjunto,
                    docente: item.row_to_json.docente,
                    aeasignaciones_asignatura: item.row_to_json.aeasignaciones_asignatura,
                    respuestas: item.row_to_json.respuestas,
                    detalles: item.row_to_json.detalles
                }
            })

            let tok = await token.createtoken(resul)
            res.status(200).send({ status: 'success', statusCode: 200, message: 'resultado', token: tok });
        } catch (error) {
            res.status(400).send(error.toString())
        }

    },
    /**
     * show exams details to student, 
     * he can answer it optionally send a file (frontend)
     * @param {*} req 
     * @param {*} res 
     */
    async showExams(req, res) {
        let { id_institucion, ano_lectivo, group, reference, id_estudiante, programacion, estudiante } = req.body
        id_institucion = parseInt(id_institucion), ano_lectivo = parseInt(ano_lectivo), id_estudiante = parseInt(id_estudiante)
        reference = parseInt(reference)

        try {
            var miestudiante = parseInt(id_estudiante)

            let query = {
                text: queryes.consulexams_reference,
                values: [reference]
            }
            //console.log('La query: ', query)

            /*             if(typeof estudiante !== 'undefined') {
                            miestudiante=parseInt(estudiante)
                            var laprogramacion=programacion.split(',')
                            laprogramacion=laprogramacion.map(Number)
            
                            query = {
                                text:queryes.consulexams_reference,
                                values:[laprogramacion]
                            }
                        }
             */
            let resp = await Db.query(query);

            let resul = resp.rows.map(item => {
                return {
                    id_cuestionario: item.row_to_json.idcuestionario,
                    idcuestionario: item.row_to_json.idcuestionario,
                    id_programacion: item.row_to_json.idprogramacion,
                    idprogramacion: item.row_to_json.idprogramacion,
                    grupos: item.row_to_json.grupos,
                    grupo: item.row_to_json.grupos,
                    nombre: item.row_to_json.nombre,
                    descripcion: item.row_to_json.descripcion,
                    preguntas: item.row_to_json.preguntas,
                    opciones: item.row_to_json.opciones,
                    imagen: item.row_to_json.imagen,
                    fechainicial: moment(item.row_to_json.aeinst_cue_fechaini).format('YYYY-MM-DD HH-mm'),
                    fechafinal: moment(item.row_to_json.aeinst_cue_fechafin).format('YYYY-MM-DD HH-mm'),
                    duracion: item.row_to_json.aeinst_cue_duracion,
                    intentosdisponibles: item.row_to_json.aeinst_cue_intentos,
                    intentosrealizados: item.row_to_json.intentosrealizados,
                    idtipointento: item.row_to_json.aeinst_cue_tipointento,
                    tipointento: item.row_to_json.tipointento,
                    ordenado: item.row_to_json.aeinst_cue_ordenado,
                    resultadominimo: item.row_to_json.aeinst_cue_resultadominimo || 'Sin establecer',
                    ordenado: item.row_to_json.aeinst_cue_ordenado,
                    docente: item.row_to_json.docente,
                    asignatura: item.row_to_json.asignatura,
                    respuestas: item.row_to_json.respuestas,
                    detalles: item.row_to_json.detalles
                }
            })

            let tok = await token.createtoken(resul)
            ////console.log('Consulta datos examen: ', query)
            ////console.log('Rows datos examen: ', resp.rows)

            res.status(200).send({ status: 'success', statusCode: 200, message: resp.rows.length + 'resultado', token: tok });
        } catch (error) {
            res.status(400).send(error.toString())
        }
    },


    /**
     * save homeworks rate for teachers and schools
     * 
     * @param {*} req 
     * @param {*} res 
     */
    async saveHomeworkResults(req, res) {
        let { id_programacion, ano_lectivo, reference_grupo, losgrupos, reference, reference_sub, id_resultado, resultado, estudiante, id_academico } = req.body
        var actualizados = 0, registrados = 0, text = ``, values = [];

        reference = reference.split(',')
        reference_sub = reference_sub.split(',')
        reference_grupo = reference_grupo.split(',')

        estudiante = estudiante.split(',')
        id_resultado = id_resultado.split(',')
        resultado = resultado.split(',')
        losgrupos = losgrupos.split(',')


        try {
            for (i = 0; i < estudiante.length; i++) {
                if (resultado[i] != "") {
                    //get id_programacion for each student based on losgrupos
                    id_programacion = reference_sub[reference_grupo.indexOf(losgrupos[i])]
                    if (id_resultado[i] != "") {
                        text = `UPDATE data.aetar_res 
                            SET aetar_res_resultado=$2 
                            WHERE aetar_res_id=$1;`;
                        values = [id_resultado[i], resultado[i]]

                        Db.query(text, values)
                            .then(res => {
                                ////console.log('res UPDATE: ', res)
                                actualizados += parseInt(res.rowCount)
                            })
                            .catch(err => {
                                console.error(err.stack)
                            })
                    } else {
                        text = `INSERT INTO data.aetar_res(aetar_res_id, aetar_pro_id, aeestudiantes_id, aetar_res_fechaentrega, 
                            aetar_res_descripcion, aetar_res_adjunto1, aetar_res_adjunto2, aetar_res_adjunto3, 
                            aetar_res_resultado, aetar_res_aprobacion, aetar_res_estado) 
                            VALUES (
                                (SELECT COALESCE(MAX(aetar_res_id)+1, 1) FROM data.aetar_res),$1, $2, $3, 
                                $4, $5, $6, $7, 
                                $8, $9, $10 
                            )`;
                        values = [id_programacion, estudiante[i], ahora, 'Calificacion otorgada por el docente', null, null, null, resultado[i], null, 1]

                        Db.query(text, values)
                            .then(res => {
                                ////console.log('res INSERT: ', res)
                                registrados += parseInt(res.rowCount)
                            })
                            .catch(err => {
                                console.error(err.stack)
                            })
                    }
                }
                /*else{
                    text=`DELETE FROM data.aetar_res WHERE aeestudiantes_id, aetar_pro_id`;
                    values=[id_programacion,estudiante[i],ahora,'Calificacion otorgada por el docente',null,null,null,elResultado,null,1]

                    Db.query(text, values)
                    .then(res => {
                        //console.log('res INSERT: ', res)
                        registrados += parseInt(res.rowCount)
                    })
                    .catch(err => {
                        console.error(err.stack)
                    })                    
                }*/
            }
            //console.log('UPDATES '+actualizados+' INSERT: '+registrados)
            let tok = await token.createtoken('Las resultados fueron guardados')
            res.status(200).send({ status: 'success', statusCode: 200, message: 'resultado', token: tok });
        } catch (error) {
            res.status(400).send(error.toString())
        }

    },

    /**
     * save exams rate for teachers and schools
     * 
     * @param {*} req 
     * @param {*} res 
     */
    async saveExamsResults(req, res) {
        let { id_programacion, ano_lectivo, reference_grupo, losgrupos, reference, reference_sub, id_resultado, resultado, estudiante, id_academico, notaminima } = req.body
        var actualizados = 0, registrados = 0, text = ``, values = [], idusuario = [];

        reference = reference.split(',')
        reference_sub = reference_sub.split(',')
        reference_grupo = reference_grupo.split(',')

        idusuario = estudiante.split(',')
        id_resultado = id_resultado.split(',')
        resultado = resultado.split(',')
        losgrupos = losgrupos.split(',')
        notaminima = parseFloat(notaminima) || 1


        try {
            for (i = 0; i < idusuario.length; i++) {
                if (resultado[i] != "") {
                    //get id_programacion for each student based on losgrupos
                    id_programacion = reference_sub[reference_grupo.indexOf(losgrupos[i])]
                    let elResultado = parseFloat(resultado[i])
                    let aprobacion = (elResultado >= notaminima) ? true : false;

                    if (id_resultado[i] != "") {
                        text = `UPDATE data.inst_cue_res 
                            SET inst_cue_res_resultado=$2, inst_cue_res_aprobacion=$3
                            WHERE inst_cue_res_id=$1;`;
                        values = [id_resultado[i], elResultado, aprobacion]

                        Db.query(text, values)
                            .then(res => {
                                ////console.log('res UPDATE: ', res)
                                actualizados += parseInt(res.rowCount)
                            })
                            .catch(err => {
                                console.error(err.stack)
                            })
                    } else {
                        text = `INSERT INTO data.inst_cue_res
                        (inst_cue_res_id, aeinst_cue_id, aeusu_id, inst_cue_res_resultado, inst_cue_res_fechaini, inst_cue_res_fechafin, 
                            inst_cue_res_duracion, inst_cue_res_fechaintento, inst_cue_res_aprobacion, inst_cue_res_estado)
                        VALUES((SELECT COALESCE(MAX(inst_cue_res_id)+1, 1) FROM data.inst_cue_res), 
                            $1, $2, $3, $4, $5, $6, $7, $8, $9);`;
                        values = [id_programacion, idusuario[i], elResultado, ahora, ahora,
                            '00:00:00', ahora, aprobacion, 1]

                        Db.query(text, values)
                            .then(res => {
                                // //console.log('res INSERT: ', res)
                                registrados += parseInt(res.rowCount)
                            })
                            .catch(err => {
                                console.error(err.stack)
                            })
                    }
                }

            }
            ////console.log('UPDATES '+actualizados+' INSERT: '+registrados)
            let tok = await token.createtoken('Las Notas fueron registradas')
            res.status(200).send({ status: 'success', statusCode: 200, message: 'resultado', token: tok });
        } catch (error) {
            res.status(400).send(error.toString())
        }
    },

    /**
     * show homeworks results details to student, and teachers
     * student cand see  homework results, teachers can rate it
     * @param {*} req 
     * @param {*} res 
     */
    async showHomeworkResults(req, res) {
        let { id_institucion, ano_lectivo, group, reference, reference_sub, id_estudiante, id_docente } = req.body
        group = group.split(',')
        reference = reference.split(',')
        reference_sub = reference_sub.split(',')
        try {
            let query = {
                text: queryes.showTaskResults,
                values: [ano_lectivo, id_institucion, group, reference_sub]
            }

            let resp = await Db.query(query)
            let tok = await token.createtoken(resp.rows)

            res.status(200).send({ status: 'success', statusCode: 200, message: 'resultado', token: tok });
        } catch (error) {
            res.status(400).send(error.toString())
        }

    },

    /**
     * showExamsResults: show exams results details to student, and teachers
     * student cand see exams results, teachers can edit results
     * @param {*} req 
     * @param {*} res 
     */
    async showExamsResults(req, res) {
        let { id_institucion, ano_lectivo, group, reference, reference_sub, id_estudiante, id_docente } = req.body
        group = group.split(',')
        reference = reference.split(',')
        ano_lectivo = parseInt(ano_lectivo)
        id_institucion = parseInt(id_institucion)

        reference_sub = reference_sub.split(',').map(Number)
        try {
            let query = {
                text: queryes.showExamsResults,
                values: [ano_lectivo, id_institucion, group, reference_sub]
            }

            //console.log('Los examenes: ', query)

            let resp = await Db.query(query)
            ////console.log('Los examenes rows: ', resp.rows)

            let tok = await token.createtoken(resp.rows)

            res.status(200).send({ status: 'success', statusCode: 200, message: resp.rows.length + ' resultado', token: tok });
        } catch (error) {
            res.status(400).send(error.toString())
        }

    },


    /**
     * show exams results details to student, and teachers
     * student cand see exams results, teachers can edit results
     * @param {*} req 
     * @param {*} res 
     */
    async examsResult(req, res) {
        let { id_institucion, ano_lectivo, grupo, id_cuestionario, id_programacion, id_usu } = req.body

        try {
            let query = {
                text: queryes.showExamsAnswers,
                values: [id_programacion, id_usu]
            }
            ////console.log('Los intentos: ', query)

            let resp = await Db.query(query)
            //console.log('Los intentos rows: ', resp.rows)

            let tok = await token.createtoken(resp.rows)

            res.status(200).send({ status: 'success', statusCode: 200, message: resp.rows.length + ' intentos realizados', token: tok });
        } catch (error) {
            res.status(400).send(error.toString())
        }

    },
    /**
     * show all homeworks write for a teacher
     * @param {*} req 
     * @param {*} res 
     */
    async taskDocents(req, res) {
        let { ano_lectivo, id_docente, id_institucion } = req.body
        try {
            let query = {
                text: queryes.taskDocs,
                values: [id_docente, ano_lectivo, id_institucion]
            }
            let resp = await Db.query(query);
            let resul = resp.rows.map(item => {
                return {
                    idtarea: item.row_to_json.idcuestionario,
                    id_tarea: item.row_to_json.idcuestionario,
                    id_programacion: item.row_to_json.idprogramacion,
                    idprogramacion: item.row_to_json.idprogramacion,
                    id_cuestionario: item.row_to_json.idtarea,
                    idcuestionario: item.row_to_json.idtarea,
                    fecha_creacion: item.row_to_json.aetar_fechacreacion,
                    fecha_limite: item.row_to_json.aetar_pro_fechalimite,
                    title: item.row_to_json.nombre,
                    descripcion: item.row_to_json.descripcion,
                    adjunto1: item.row_to_json.aetar_adjunto1,
                    adjunto2: item.row_to_json.aetar_adjunto2,
                    adjunto3: item.row_to_json.aetar_adjunto3,
                    estadoprogramacion: item.row_to_json.estadoprogramacion,
                    grupo: item.row_to_json.aeestudiantes_grupo,
                    docente: item.row_to_json.docente,
                    asignatura: item.row_to_json.aeasignaciones_asignatura,
                    respuestas: item.row_to_json.respuestas
                }
            })

            let tok = await token.createtoken(resul)
            res.status(200).send({ status: 'success', statusCode: 200, message: 'resultado', token: tok });
        } catch (error) {
            //console.log(error);
            res.status(400).send(error)
        }
    },

    async UpdateTask(req, res) {
        try {
            let { id_cuestionario, id_docente, id_programacion, materia, content, date_init, date_finish, name_work, file, ano_lectivo, id_institucion, id_usuario, groups, ordenado, minimun_note } = req.body;
            groups = JSON.parse(groups)
            id_programacion = JSON.parse(id_programacion)

            const DIR = 'p/w/' + id_institucion + '/'


            let adjunto1 = '', adjunto2 = '', adjunto3 = '';
            if (req.files) {
                adjunto1 = (req.files[0]) ? " aetar_adjunto1='" + `${DIR}/${req.files[0].filename}` + "', " : '';
                adjunto2 = (req.files[1]) ? " aetar_adjunto2='" + `${DIR}/${req.files[1].filename}` + "', " : '';
                adjunto3 = (req.files[2]) ? " aetar_adjunto3='" + `${DIR}/${req.files[2].filename}` + "', " : '';
            }

            req.rutaguardar = DIR
            req.maxSize = 5000000
            req.referFunction = "file"
            req.fileMax = 3

            //let cargados = await module.exports.subirArchivo(req)
            //console.log('Esta fue la carga: ', [adjunto1,adjunto2,adjunto3])

            let consul = `UPDATE data.aetar
            SET aetar_nombre=$1, aetar_descripcion=$2, 
            `+ adjunto1 + adjunto2 + adjunto3 + `
            aetar_estado=1
            WHERE aetar_id=$3;`

            let query = {
                text: consul,
                values: [name_work, content, id_cuestionario]
            }

            await Db.query(query);


            let consul2 = `UPDATE data.aetar_pro
                            SET aeinst_id=$1, aeanol_id=$2, aedocentes_id=$3, 
                                aeasignaciones_asignatura=$5, aetar_pro_fechalimite=$6, 
                                aetar_pro_estado=1
                            WHERE aetar_pro_id=$7 AND aeestudiantes_grupo=$4;`

            for (let i in groups) {
                let query2 = {
                    text: consul2,
                    values: [id_institucion, ano_lectivo, id_docente, groups[i], materia, date_finish, id_programacion[i]]
                }
                await Db.query(query2);
            }
            let tok = await token.createtoken('La tarea fue modificada sin emitir notificaciones o emails')
            res.status(200).send({ status: 'success', statusCode: 200, message: 'La tarea fue modificada sin emitir notificaciones o emails', token: tok });

        } catch (error) {
            //console.log(error);
            res.status(400).send(error);
        }
    },

    async DeleteTaks(req, res) {
        try {
            let { id_programacion, id_task, confirm } = req.body
            id_programacion = id_programacion.split(",");

            //return //console.log(id_programacion);
            let tok;
            let resp2



            let opciones = `DELETE
                    FROM data.aetar_res
                    WHERE aetar_pro_id=$1`;

            let pregunta = `DELETE FROM data.aetar_pro
                                    WHERE aetar_pro_id=$1;`

            for (let i in id_programacion) {

                let query2 = {
                    text: opciones,
                    values: [parseInt(id_programacion[i])]
                }
                resp2 = await Db.query(query2);

                let query3 = {
                    text: pregunta,
                    values: [parseInt(id_programacion[i])]
                }

                let resp3 = await Db.query(query3);
            }

            let tareaa = `DELETE FROM data.aetar
                    WHERE aetar_id=$1;`
            let query4 = {
                text: tareaa,
                values: [id_task],
            }

            let resp4 = await Db.query(query4);

            let obj = {
                respuestas_eliminadas: resp2.rowCount,

            }

            tok = await token.createtoken(obj);
            res.status(200).send({ status: 'success', statusCode: 200, message: 'Tarea elminada con exito', token: tok })




        } catch (error) {
            //console.log(error.toString());
            res.status(400).send(error.toString());
        }
    },

    async subirArchivo(req, res) {
        const path = require("path")
        const { v4: uuidv4 } = require('uuid');
        let multer = require('multer');
        let fs = require('fs-extra');
        let File = require('../middlware/file');
        const elLimite = req.maxSize || (3 * 1000 * 1000)
        const RUTA = req.rutaguardar
        //console.log('El path -> ', RUTA)
        //console.log('El ref -> ', req.referFunction)

        //var upload = multer({ dest: RUTA })

        const storage = multer.diskStorage({
            destination: (req, file, callback) => {
                //fs.mkdirsSync(RUTA)
                callback(null, RUTA)
                //console.log('into destination')
            },
            filename: (req, file, callback) => {
                //console.log('into filename')
                const fileName = file.originalname.toLowerCase().split(' ').join('-');
                callback(null, uuidv4() + '-' + fileName)
            }
        });


        var upload = multer({
            storage: storage,
            limits: { fileSize: elLimite },
            fileFilter: (req, file, callback) => {
                let tipoArchivo = [
                    'image/jpeg',
                    'image/png',
                    'image/gif',
                    'image/x-icon',
                    'application/pdf',
                    'application/vnd.ms-excel',
                    'application/xml',
                    'image/x-icon',
                    'application/zip',
                    'application/msword',
                    'application/x-tar',
                    'text',
                    'text/csv',
                    'text/plain'
                ];
                //console.log('into upload')

                if (tipoArchivo.indexOf(file.mimetype) === -1) {
                    callback(null, false);
                    res.status(400).send({ status: 'error', statusCode: 400, message: 'Tipo de archivo no permitido', token: null })
                    return callback(new Error('Tipo de archivo no permitido'));
                } else {
                    res.status(200).send({ status: 'success', statusCode: 200, message: 'Carga exitosa', token: null })
                    return callback(null, true);
                }
            }
        }).upload.array(req.referFunction);


        /*
        upload(req, res, function(err){  
            if(err){
                res.status(400).send(err.toString())

            }
            else{
                res.status(200).send("Carga exitosa")
            }
        });
        */

    },

    /**
     * SAVE TASK TEACHER -> STUDENTS (SEND MAIL AND NOTIFICATIONS)
     * @param {*} req INFO FROM INPUTS INCLUDING FILES
     * @param {*} res 
     */
    async CreateTask(req, res) {
        //if(req.fileValidationError)return res.status(400).send(req.fileValidationError) 

        try {

            let fileBase = 'p/w', alertsEnviados = 0, premailEnviados = '', mailEnviados = 0
            let destNames = [], destTokens = [], destMail = [], messageAcu = ''
            let botonEntrar = generateButton.boton({ type: 'success', shape: 'square', destination: 'tarea', text: ' Ingresar ' })


            let { id_docente, materia, content, date_init, date_finish, name_work, file, ano_lectivo, id_institucion, id_usuario, groups, ordenado, minimun_note } = req.body;
            id_docente = parseInt(id_docente), ano_lectivo = parseInt(ano_lectivo), id_institucion = parseInt(id_institucion), id_usuario = parseInt(id_usuario)
            groups = JSON.parse(groups);

            const DIR = 'p/w/' + id_institucion + '/'


            let adjunto1, adjunto2, adjunto3;
            if (req.files) {
                req.files[0] ? adjunto1 = `${DIR}/${req.files[0].filename}` : null;
                req.files[1] ? adjunto2 = `${DIR}/${req.files[1].filename}` : null;
                req.files[2] ? adjunto3 = `${DIR}/${req.files[2].filename}` : null;
            } else {
                adjunto1 = null;
                adjunto2 = null;
                adjunto3 = null;
            }

            req.rutaguardar = DIR
            req.maxSize = 5000000
            req.referFunction = "file"
            req.fileMax = 3

            //let cargados = await module.exports.subirArchivo(req)
            //console.log('Esta fue la carga: ', [adjunto1,adjunto2,adjunto3])

            let query = {
                text: `INSERT INTO data.aetar(
                aetar_id, aetar_fechacreacion, aetar_nombre, aetar_descripcion, 
                aetar_adjunto1, aetar_adjunto2, aetar_adjunto3, aetar_estado)
                VALUES ((SELECT COALESCE((MAX(aetar_id)+1), 1)  FROM data.aetar), $1, $2, $3, 
                $4, $5, $6, $7) RETURNING aetar_id`,
                values: [date_init, name_work, content, adjunto1, adjunto2, adjunto3, 1]
            }
            //console.log('INSERT INTO data.aetar', query)

            let resp = await Db.query(query);

            for (let i in groups) {
                let query2 = {
                    text: `INSERT INTO data.aetar_pro(
                    aetar_pro_id, aetar_id, aeinst_id, aeanol_id, aedocentes_id, aeestudiantes_grupo, aeasignaciones_asignatura, 
                    aetar_pro_fechalimite, aetar_pro_estado)
                        VALUES ((SELECT COALESCE((MAX(aetar_pro_id)+1), 1)  FROM data.aetar_pro), $1, $2, $3, $4, $5, $6, 
                    $7, $8);`,
                    values: [parseInt(resp.rows[0].aetar_id), id_institucion, ano_lectivo, id_docente, groups[i], materia, date_finish, 1]
                }
                let resp2 = await Db.query(query2);

                //console.log('INSERT INTO data.aetar_pro', query2)

                messageAcu = {
                    subject: 'Nueva tarea en ' + materia,
                    titulo: 'Nueva tarea en colarqui: ' + name_work,
                    message: `Para los estudiantes del grupo ${groups[i]}, se acaba de programar la tarea: ${name_work}
                en la asignatura ${materia} con plazo límite en la fecha: ${date_finish}.<br/><br/>
            
                Requerimos que usted como padre de familia este al tanto y estimule al estudiante, para que estudie, repase 
                y realice sus tareas.<br/><br/>
            
                Con su ayuda lograremos que nuestro apreciado estudiante obtenga los mejores resultados académicos.`
                }
                let payload = {
                    notification: {
                        title: messageAcu.titulo,
                        body: messageAcu.message,
                        extra: botonEntrar
                    },
                    data: {
                        route: 'notification?referencia=tarea',
                        index: parseInt(resp.rows[0].aetar_id.toString())
                    }
                }

                let queryinfo = {
                    text: `SELECT * FROM engine.contacto_student($1, $2, $3)`,
                    values: [ano_lectivo, id_institucion, [groups[i]]]
                }

                var correos = await Db.query(queryinfo);
                ////console.log('FROM engine.contacto_student', correos.rows)

                //JOIN NAMES, TOKEN AND MAILS FOR SEND ONE COMMAND FOR ALL
                for (let j in correos.rows) {
                    destMail.push(correos.rows[j].correoestudiante, correos.rows[j].correoacudiente)
                    destNames.push(correos.rows[j].estudiante)
                    if (correos.rows[j].tokenestudiante != null) { destTokens.push(correos.rows[j].tokenestudiante) }
                }
                //destMail.push('sentadoensilla@gmail.com')
                await alerta.send({ email: destMail, message: messageAcu, bcc: true })
                    .then((premailEnviados) => {
                        mailEnviados += (premailEnviados.indexOf('Ok:')) ? 1 : 0;
                    })

                // alertsEnviados = await pusher.pushSendMessage({ name: destNames, tokens: destTokens, message: payload })
                ////console.log('Pushes: ', prealertsEnviados)
                //alertsEnviados+=(prealertsEnviados.indexOf('Ok:'))? 1 : 0;
            }
            ////console.log('la respuesta de los pushes: ', alertsEnviados)

            var tok = await token.createtoken('Tarea registrada: Los estudiantes de ' + groups + ' y sus acudientes recibiran un correo y una notificación');
            res.status(200).send({ status: 'success', statusCode: 200, message: 'Tarea registrada: Los estudiantes de ' + groups + ' y sus acudientes recibiran un correo y una notificación', token: tok })

        } catch (error) {
            //console.log(error.toString());
            res.status(400).send(error.toString())
        }
    },

    /**
     * save the answer to a homework from student profile (any profile really)
     * @param {*} req 
     * @param {*} res 
     */
    async AnswerTask(req, res) {
        try {
            let { id_academico, content, file, reference, ano_lectivo, id_institucion, id_usuario } = req.body;
            reference = parseInt(reference), id_academico = parseInt(id_academico), ano_lectivo = parseInt(ano_lectivo), id_institucion = parseInt(id_institucion), id_usuario = parseInt(id_usuario)

            const DIR = 'p/wr/' + id_institucion

            let adjunto1, adjunto2, adjunto3;
            if (req.files) {
                req.files[0] ? adjunto1 = `${DIR}/${req.files[0].filename}` : null;
                req.files[1] ? adjunto2 = `${DIR}/${req.files[1].filename}` : null;
                req.files[2] ? adjunto3 = `${DIR}/${req.files[2].filename}` : null;
            } else {
                adjunto1 = null;
                adjunto2 = null;
                adjunto3 = null;
            }

            //NOT REPEAT THE HOMEWORK
            let previo = {
                text: `SELECT aetar_res_id
                FROM data.aetar_res 
                WHERE aetar_pro_id=$1
                AND aeestudiantes_id=$2
                AND aetar_res_estado=1`,
                values: [reference, id_academico]
            }
            let yalahizo = await Db.query(previo)

            if (yalahizo.rows.length < 1) {
                let query = {
                    text: `INSERT INTO data.aetar_res(aetar_res_id, aetar_pro_id, aeestudiantes_id, aetar_res_fechaentrega, 
                        aetar_res_descripcion, aetar_res_adjunto1, aetar_res_adjunto2, aetar_res_adjunto3, 
                        aetar_res_resultado, aetar_res_aprobacion, aetar_res_estado)
                        VALUES ((SELECT COALESCE((MAX(aetar_res_id)+1), 1)  FROM data.aetar_res), $1, $2, $3, 
                        $4, $5, $6, $7, 
                        $8, $9, $10) RETURNING aetar_res_id`,
                    values: [reference, id_academico, ahora, content, adjunto1, adjunto2, adjunto3, null, false, 1]
                }

                let resp = await Db.query(query);
                var tok = await token.createtoken(resp);
                return res.status(200).json({ status: 'success', statusCode: 200, message: 'La respuesta a la tarea fue registrada, debes esperar que el docente haga la valoración', token: tok })
            } else {
                var tok = await token.createtoken(yalahizo.rows[0].aetar_res_id)
                return res.status(200).json({ status: 'error', statusCode: 200, message: 'Ya hiciste la tarea, debes esperar que el docente haga la valoración o elimine tu tarea', token: tok })
            }
        } catch (error) {
            //console.log(error.toString());
            return res.status(400).json(error.toString());
        }
    },

    /**
     * 
     * @param {*} req 
     * @param {*} res 
     */
    async updateExams(req, res) {
        try {
            let { id_exam, content, date_init, date_finish, time, name_exam, file, intentos, id_institucion, ano_lectivo, id_usuario, groups, tipo_intento, ordenado, minimun_note } = req.body
            groups = JSON.parse(groups);
            let fecha_creacion = moment().format('YYYY-MM-DD HH:m:s')



            let image;
            if (req.file) {
                image = `/p/t/${req.file.filename}`
            } else {
                image = null
            }

            const consul1 = `UPDATE data.aecue
                                SET aecue_nombre=$1, aecue_descripcion=$2, aecue_imagen=$3, 
                                aecue_fechacreacion=$4, aecue_roldestino=$5, aecue_estado=$7
                                WHERE aecue_id=$6 RETURNING aecue_id`;

            let query = {
                text: consul1,
                values: [name_exam, content, image, fecha_creacion, 6, id_exam, 1]
            };

            let resp = await Db.query(query);

            const consul2 = `UPDATE data.inst_cue
                            SET aeinst_id=$1, aeano_id=$2, aeusu_id=$3, 
                                 aeinst_cue_fechacreacion=$5, aeinst_cue_fechaini=$6, 
                                aeinst_cue_fechafin=$7, aeinst_cue_duracion=$8, aeinst_cue_intentos=$9, 
                                aeinst_cue_tipointento=$10, aeinst_cue_ordenado=$11, aeinst_cue_resultadominimo=$12, 
                                aeinst_cue_estado=$13
                                WHERE aecue_id=$14 AND aeestudiantes_grupo=$4;`;
            for (let i in groups) {
                let query2 = {
                    text: consul2,
                    values: [parseInt(id_institucion), parseInt(ano_lectivo), parseInt(id_usuario), groups[i], fecha_creacion, date_init, date_finish, time, parseInt(intentos), parseInt(tipo_intento), eval(ordenado), parseFloat(minimun_note), 1, resp.rows[0].aecue_id]
                }
                let resp2 = await Db.query(query2);
            }

            let resul = { id_exam, content, date_init, date_finish, time, name_exam, file, intentos, id_institucion, ano_lectivo, id_usuario, groups, tipo_intento, ordenado, minimun_note }
            let tok = await token.createtoken(resul);
            res.status(200).send({ status: 'success', statusCode: 200, message: 'Evaluacion actualizada con exito', token: tok })

        } catch (error) {
            //console.log(error);
            res.status(400).send(error)
        }
    },

    async deleteQuestion(req, res) {

        try {
            let { id_exam, id_question, } = req.body
            let tok;

            let opciones = `DELETE FROM data.aeopcres WHERE aepre_id=$1`;

            let query2 = {
                text: opciones,
                values: [parseInt(id_question)]
            }
            let resp2 = await Db.query(query2);

            let pregunta = `DELETE FROM data.aepre WHERE aepre_id=$1`

            let query3 = {
                text: pregunta,
                values: [parseInt(id_question)]
            }

            let resp3 = await Db.query(query3);

            let obj = {
                opciones_eliminadas: resp2.rowCount,
                pregunta_eliminada: resp3.rowCount
            }

            tok = await token.createtoken(obj);
            res.status(200).send({ status: 'success', statusCode: 200, message: 'Pregunta elminada con exito', token: tok })




        } catch (error) {
            res.status(400).send(error);
        }


    },

    async upateQuestions(req, res) {
        try {


            let { id_exam, id_question, description, order, type_question, options } = req.body
            options = JSON.parse(options)


            let consul = `UPDATE data.aepre
                SET aetippre_id=$1, aepre_descripcion=$2, aepre_fechacreacion=$3, 
                aepre_orden=$4, aepre_estado=$5
                WHERE aepre_id=$6;`;


            let query = {
                text: consul,
                values: [type_question, description, ahora, order, 1, id_question]
            }

            let resp = await Db.query(query);


            let consul2 = `UPDATE data.aeopcres
                         SET aepre_id=$1, aeopcres_descripcion=$2, aeopcres_orden=$3, 
                            aeopcres_valor=$4, aeopcres_estado=$5
                            WHERE aeopcres_id=$6;`;

            for (let i in options) {
                let query2 = {
                    text: consul2,
                    values: [id_question, options[i].answer, order, options[i].value, 1, options[i].id]
                }

                let resp2 = await Db.query(query2);
            }
            let tok = await token.createtoken(req.body);
            res.status(200).send({ status: 'success', statusCode: 200, message: 'Pregunta actualizada con exito', token: tok })

        } catch (error) {
            //console.log(error);
            res.status(400).send(error)
        }

    }

}