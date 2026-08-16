require('dotenv').config()
const path = require('path')
const Db = require('../database/conex');
const token = require('../utils/token');
const queryes = require('../sql/alerts');
const wpQueryes = require('../sql/whatsapp');
const wpSender = require('../utils/notifications/whatsapp/wpRomote')
const { MessageMedia } = require('whatsapp-web.js');
const generateButton = require('../utils/buttons');
const generate = require('../utils/notifications/mail/alerta');
// const generatePush = require('../utils/notifications/push/firebase');

let moment = require('moment');
const ahora = moment().format('YYYY-MM-DD HH:mm:ss');

module.exports = {
    /**
     * ALertsFind find and alert by decriptar(reference)
     * @param {*} req: comunicate,reference,id_usuario
     * @param {*} res: length of emails and push notifications generated
     */
    async ALertsFind(req, res) {
        try {
            let { reference, id_usuario, ano_lectivo, id_institucion } = req.body

            if (typeof reference != undefined && reference != "") {
                reference = parseInt(token.decriptar(reference))
                id_usuario = parseInt(token.decriptar(id_usuario))

                console.log('Reference: ', reference)

                await Db.query({
                    text: queryes.alertsFind,
                    values: [reference]
                }).then(async found => {

                    if (found.rows.length > 0) {
                        found.rows[0].idregistro = token.encriptar(found.rows[0].idregistro)
                        found.rows[0].idusuario = token.encriptar(found.rows[0].idusuario)
                        found.rows[0].idestado = token.encriptar(found.rows[0].idestado)
                        found.rows[0].idinstitucion = token.encriptar(found.rows[0].idinstitucion)
                        found.rows[0].escudo =  process.env.APP_API_BACKEND + '/' + found.rows[0].escudo 


                        if(found.rows[0].file != ""){
                            found.rows[0].file =  process.env.APP_API_BACKEND + '/' + found.rows[0].file 
                        }

                        let tok = await token.createtoken(found.rows);
                        res.send({
                            status: 'success',
                            statusCode: 200,
                            message: 'Comunicado encontrado',
                            rows: found.rows
                        })
                    } else {
                        res.send({
                            status: 'Comunicado no disponible',
                            statusCode: 200,
                            message: ' No fue posible encontrar el comunicado!',
                            rows: []
                        })
                    }
                })
                    .catch(async error => {
                        console.log('ALertsFind: ', error)
                        res.status(200).send({
                            status: 'error',
                            statusCode: 400,
                            message: ' Ocurrio un error buscando el comunicado, cierre sesion e intente nuevamente',
                            rows: []
                        })
                    })

            } else {
                res.send({
                    status: 'error',
                    statusCode: 400,
                    message: ' Comunicado no valido',
                    rows: []
                })
            }

        } catch (error) {
            console.log(error);
            res.status(400).send(error.toString())
        }
    },

    /**
     * ALertsDelete delete alerts, only original user can delete an alert
     * @param {*} req: comunicate,reference,id_usuario
     * @param {*} res: length of emails and push notifications generated
     */
    async ALertsDelete(req, res) {
        try {
            let { reference, id_usuario, ano_lectivo, id_institucion, rol } = req.body

            if (typeof reference != "undefined" && reference != "") {
                reference = parseInt(token.decriptar(reference))
                id_usuario = parseInt(token.decriptar(id_usuario))
                ano_lectivo = parseInt(token.decriptar(ano_lectivo))
                id_institucion = parseInt(token.decriptar(id_institucion))
                rol = parseInt(token.decriptar(rol))


                await Db.query({
                    text: queryes.alertsDelete,
                    values: [reference, ano_lectivo, id_institucion, id_usuario, rol]
                }).then(async deleted => {

                    if (deleted.rowCount > 0) {
                        res.send({
                            status: 'success',
                            statusCode: 200,
                            message: 'Comunicado eliminado',
                            rows: []
                        })
                    } else {
                        res.send({
                            status: 'error',
                            statusCode: 400,
                            message: 'No fue posible eliminar el comunicado! ¿Es usted el creador del comunicado?',
                            rows: []
                        })
                    }
                })
                .catch(async error => {
                    console.log(error);
                    res.send({
                        status: 'error',
                        statusCode: 400,
                        message: ' Ocurrio un error eliminando el comunicado, cierre sesion e intente nuevamente',
                        rows: []
                    })
                })

            } else {
                res.send({
                    status: 'error',
                    statusCode: 400,
                    message: ' Comunicado no valido',
                    rows: []
                })
            }

        } catch (error) {
            console.log(error);
            res.send({
                status: 'error',
                statusCode: 400,
                message: 'El sistema no sabe cómo borrar ese comunicado',
                rows: []
            })
        }
    },

    /**
     * ALertsEdit let me change content of an alert into DB, without send mails or notifications
     * @param {*} req: comunicate,reference,id_usuario
     * @param {*} res: length of emails and push notifications generated
     */
    async ALertsEdit(req, res) {
        try {
            let { title, group, student, date_init, date_finish, comunicate, file, id_usuario, ano_lectivo, id_institucion, respuestas, ambito, reference } = req.body
            if (reference != "") {
                reference = parseInt(token.decriptar(reference))
                id_usuario = parseInt(id_usuario)
                id_institucion = parseInt(id_institucion)
                ano_lectivo = parseInt(ano_lectivo)
                let groupsReal, groupsRealdata

                if (group.indexOf('Todos') >= 0) {
                    groupsRealdata = await Db.query({
                        text: queryes.rowsviewGroupsJSON,
                        values: [ano_lectivo, id_institucion]
                    })

                    if (groupsRealdata.rows.length > 0) {
                        console.log('Los contactos groupsRealdata: ', groupsRealdata.text)
                        group = JSON.stringify(groupsRealdata.rows[0].grupos)
                    }
                }
                group = group.replace(/'/g, '"')

                student = JSON.parse(student)

                console.log('la cantidad de estudiantes es: ' + student.length, student)

                const DIR = 'p/c/' + id_institucion + '/'
                //console.log('req.files: ', req.files)
                let adjunto1 = null;
                if (req.files[0] != undefined && req.files[0] != null) {
                    adjunto1 = `${DIR}${req.files[0].filename}`;
                }

                req.rutaguardar = DIR
                req.maxSize = 5000000
                req.referFunction = "file"
                req.fileMax = 1

                let misgroup = JSON.parse(group)

                await Db.query({
                    text: queryes.alertsEdit,
                    values: [parseInt(reference), misgroup, student, date_init, date_finish, title, comunicate, adjunto1, 1]
                })
                    .then(async avisado => {
                        if (avisado.rowCount > 0) {
                            let tok = await token.createtoken(' Comunicado editado, no se enviaron emails o alertas')

                            res.status(200).send({
                                status: 'success',
                                statusCode: 200,
                                message: ' Comunicado editado, no se enviaron emails o alertas',
                                token: tok
                            })
                        } else {

                            let tok = await token.createtoken(' El comunicado no pudo editarse')

                            res.status(200).send({
                                status: 'success',
                                statusCode: 200,
                                message: ' El comunicado no pudo editarse',
                                token: tok
                            })
                        }
                    })
                    .catch(async error => {
                        let tok = await token.createtoken(' Ocurrio un error editando el comunicado, intente nuevamente')
                        res.status(200).send({
                            status: 'error',
                            statusCode: 200,
                            message: ' Ocurrio un error editando el comunicado, intente nuevamente',
                            token: tok
                        })
                    });
            }
        } catch (error) {
            console.log(error);
            res.status(400).send(error.toString())
        }
    },

    /**
     * ALerts save alerts and send notifications and emails
     * @param {*} req: comunicate,reference,id_usuario
     * @param {*} res: length of emails and push notifications generated
     */
    async ALerts(req, res) {
        tok = null
        let { title, group, student, date_init, date_finish, 
            comunicate, file, id_usuario, ano_lectivo, 
            id_institucion, respuestas, alcance, nombre_institucion, escudo } = req.body

        try {

            id_usuario = parseInt(token.decriptar(id_usuario))
            id_institucion = parseInt(token.decriptar(id_institucion))
            ano_lectivo = parseInt(token.decriptar(ano_lectivo))
            alcance = parseInt(alcance)
            group =  group.split(',') || group
            student = (student !== "")? student.split(',').map(Number) || student : []
            date_init = moment(new Date(date_init)).format('YYYY-MM-DD HH:mm:ss');
            date_finish = moment(new Date(date_finish)).format('YYYY-MM-DD HH:mm:ss');

            let groupsReal, groupsRealdata, query2

            //0: DOCENTES, 1: DOCENTES Y ESTUDIANTES
            if (alcance == 0) {
                group = ['Docentes'],
                    student = []
            } else {
                if (group.indexOf('Todos') >= 0) {
                    groupsRealdata = await Db.query({
                        text: queryes.rowsviewGroupsJSON,
                        values: [ano_lectivo, id_institucion]
                    })

                    if (groupsRealdata.rows.length > 0) {
                        console.log('Los contactos groupsRealdata: ', groupsRealdata.text)
                        group = JSON.stringify(groupsRealdata.rows[0].grupos)
                    }
                }
                group.map((preGru,tal) => {
                    group[tal].replace(/'/g, '"')
                })

                console.log('la cantidad de estudiantes es: ' + student.length, student)
            }


            const DIR = 'p/c/' + id_institucion + '/'
            //console.log('req.files: ', req.files)
            let adjunto1 = null;
            if (typeof req.files !== 'undefined' && req.files) {
                adjunto1 = `${DIR}${req.files[0].filename}`;
            }

            req.rutaguardar = DIR
            req.maxSize = 5000000
            req.referFunction = "file"
            req.fileMax = 1


            let query = {
                text: `INSERT INTO data.aeavisos(
                    aeavisos_id, aeusu_id, aeinst_id, aeanol_id, 
                    aeavisos_grupo, aeavisos_estudiantesid, aeavisos_fecha, aeavisos_fechapublicacion, 
                    aeavisos_fechafinalizacion, aeavisos_titulo, aeavisos_descripcion, aeavisos_adjunto, 
                    aeavisos_estado, aeavisos_alcance, aeavisos_aceptarespuestas)
                    VALUES ((SELECT COALESCE(MAX(aeavisos_id)+1, 1) FROM data.aeavisos), 
                    $1, $2, $3, $4, $5, current_timestamp, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING aeavisos_id`,
                values: [id_usuario, id_institucion, ano_lectivo, group,
                    student, date_init, date_finish, title,
                    comunicate, adjunto1, 1, alcance, respuestas
                ]
            }

            await Db.query(query)
            .then(async avisado =>{
                if (avisado.rowCount > 0) {
                    //console.log('Registro de aviso: ', query)
                    let idEncriptado = await token.encriptar(avisado.rows[0].aeavisos_id)

                    //0: DOCENTES, 1: DOCENTES Y ESTUDIANTES
                    if (alcance == 0) {
                        //GET CONTACT USING GROUP OR SPECIFIC STUDENTS
                        query2 = {
                            text: `SELECT * FROM engine.contacto_teacher_inst($1, $2)`,
                            values: [ano_lectivo, id_institucion]
                        }
                    } else {
                        //GET CONTACT USING GROUP OR SPECIFIC STUDENTS
                        query2 = {
                            text: `SELECT * FROM engine.contacto_student($1, $2, $3);`,
                            values: [ano_lectivo, id_institucion, group]
                        }

                        if (student.length > 0) {
                            query2 = {
                                text: `SELECT * FROM engine.contacto_student_one($1, $2, $3);`,
                                values: [ano_lectivo, id_institucion, student]
                            }
                        }
                    }

                    console.log('Los contactos consulta: ', query2)
                    let resp = await Db.query(query2);
                    //console.log('Los contactos rows: ', resp.rows)

                    let totalMessages = 0, totalPush = 0;
                    let elBotonComunicado = generateButton.boton({ type: 'success', shape: 'square', destination: 'view_alert/' + idEncriptado, text: ' Ver comunicado ' })

                    let destUsu = [], destNames = [], destMail = [], destToken = [];

                    //0: DOCENTES, 1: DOCENTES Y ESTUDIANTES
                    if (alcance == 0) {
                        resp.rows.map(contacto => {
                            if (contacto.aedocentes_mail.indexOf('@') >= 0) {
                                destNames.push(contacto.docente)
                                destUsu.push(contacto.aeusu_id)
                                destMail.push(contacto.aedocentes_mail)
                                destToken.push([contacto.aedocentes_id,contacto.telefono])
                            }
                        })
                    } else {
                        resp.rows.map(contacto => {
                            let losMails = '', elToken = null
                            if (contacto.correoestudiante.indexOf('@') >= 0) {
                                losMails = contacto.correoestudiante
                                losMails += (contacto.correoacudiente.indexOf('@') >= 0) ? ',' + contacto.correoacudiente : '';
                                destMail.push(losMails)//                            
                                destNames.push(contacto.estudiante + ',' + contacto.acudiente)
                                destUsu.push(contacto.aeusu_id)
                                //elToken = (contacto.tokenestudiante.length > 4)? contacto.tokenestudiante : null ;
                                contacto.contactos.map((elPIN) =>{
                                    destToken.push([contacto.aeestudiantes_id, elPIN])
                                })
                                    
                            }
                        })
                    }

                    // console.log('Los contactos destMail: ', destMail)
                    console.log('Los contactos destToken: ', destToken)

                    let messagePreview = token.noHTML(comunicate) // comunicate.replace(/<\/?[^>]+>/ig, " ").substring(0, 50) + ' ... '
                    let payload = {
                        notification: {
                            title: title,
                            body: messagePreview,
                            extra: elBotonComunicado
                        },
                        data: {
                            route: 'notification?referencia=alerta',
                            index: idEncriptado.toString()
                        }
                    }

                    let notificacionQuery = {
                        text: `INSERT INTO data.aenotificaciones(
                            aenotificaciones_id, aenotificaciones_de, aenotificaciones_para, aenotificaciones_fecha, 
                            aenotificaciones_title, aenotificaciones_body, aenotificaciones_ruta, aenotificaciones_referencia, aenotificaciones_data)
                            VALUES ((SELECT COALESCE(MAX(aenotificaciones_id)+1, 1) FROM data.aenotificaciones), $1, $2, current_timestamp, $3, $4, $5, $6, $7) RETURNING aenotificaciones_id`,
                        values: [id_usuario, destUsu, title, messagePreview.substring(0, 50), 'data.aeavisos', avisado.rows[0].aeavisos_id, payload.data]
                    }
                    let respnotificacionQuery = await Db.query(notificacionQuery);

                    // totalMessages = await generate.send({ name: destNames, email: destMail, message: { titulo: title, message: messagePreview + ' <br/>' + elBotonComunicado } })

                    // totalPush = await generatePush.pushSendMessage({ name: destNames, tokens: destToken, message: payload })
                        //LIST DATABASE EMISOR
                        await Db.query({
                            text: wpQueryes.myWPSessionsExtend,
                            values: [ano_lectivo,[id_institucion]]
                        })
                        .then(async (elEmisor) =>{
                            let preLogo = path.join(__dirname, '../public/', escudo)
                            // IF ADJUNTO IS IMAGE, SEND IT IN NOTIFICATION
                            if(adjunto1 !== null){
                                if( ['png','jpg','jpeg','gif','pdf'].indexOf(path.extname(adjunto1).toLowerCase()) ){
                                    preLogo = path.join(__dirname, '../',  '/public/archivos/avisos/', id_institucion+'/', req.files[0].filename )                            
                                }
                            }
                            const miLogo = MessageMedia.fromFilePath(preLogo);
                            const enlace = process.env.APP_API_FRONT+'/view_alert/' + idEncriptado

                            elEmisor.rows[0].emisorlist.map(async (esteEmisor,e) => {
                                if(esteEmisor != null && esteEmisor != ""){
                                    console.log('esteEmisor: ', esteEmisor)

                                    let avisados = 0

                                    await wpSender.sendLinkMulti({
                                        emisor: esteEmisor,
                                        sessionId: esteEmisor,
                                        idcosa: avisado.rows[0].aeavisos_id,
                                        idvotantes: avisado.rows[0].aeavisos_id, // INTO destToken:[contacto.aeestudiantes_id, elPIN]
                                        number: destToken, // ARREGLO CON MUCHOS NUMEROS
                                        message: 'AVISO IMPORTANTE DEL COLEGIO \n\n'+payload.notification.body+`\n\nEste mensaje es enviado por COLARQUI (La Agenda Escolar de los COLegios ARQUIdiocesanos) agenda que no sabe leer, tampoco sabe oir notas de voz. \n\nSi desea responder debe ingrese a  ${enlace} \n\nEl usuario es el correo del estudiante y la clave es el documento del mismo. \n\n ${process.env.APP_API_FRONT}`,
                                        type: 1,
                                        image: miLogo,
                                        campana: id_institucion,
                                        link: enlace
                                    })                          
                                }
                            })
                        })
                        .catch(async erroreo => {
                            // tok = await token.createtoken('La observación fue registrada, no se enviaron mensajes, porque el whatsapp del colegio no esta conectado, por favor avise a su secretaria')
                            console.log('Error myWPSessionsExtend: ', erroreo)
                        })
                    
                    res.send({
                        status: 'success',
                        statusCode: 200,
                        message: avisado.rowCount + ' Comunicado registrado, se enviaran los correos y las notificaciones respectivas',
                        rows: []
                    })
                } else {

                    res.send({
                        status: 'error',
                        statusCode: 400,
                        message: ' No fue posible registrar el comunicado',
                        rows: []
                    })
                }
            })
            .catch(error => {
                console.log(error);
                res.send({
                    status: 'error',
                    statusCode: 400,
                    message: 'No fue posible registrar el comunicado, no se enviarán notificaciones',
                    rows: []
                })                
            })

        } catch (error) {
            console.log(error);
            res.send({
                status: 'error',
                statusCode: 400,
                message: ' El sistema tiene depresion post parto',
                rows: []
            })
        }

    },

    /**
     * save comments into alerts and send notifications and emails
     * @param {*} req: comunicate,reference,id_usuario
     * @param {*} res: length of emails and push notifications generated
     */
    async alertComments(req, res) {
        try {
            let { comunicate, reference, id_usuario, ano_lectivo, id_institucion } = req.body
            if (typeof reference != undefined && reference != "") {
                let idEncriptado = reference
                reference = parseInt(token.decriptar(reference))
                id_usuario = parseInt(token.decriptar(id_usuario))

                let query = {
                    text: queryes.answerComunicado,
                    values: [reference, id_usuario, comunicate]
                }
                let avisado = await Db.query(query);
                let avisadoEnc = await token.createtoken(avisado.rows[0])

                let query2 = {
                    text: queryes.comunicadoDestinatarios,
                    values: [reference]
                }

                let resp = await Db.query(query2);

                let totalMessages = 0, totalPush = 0;

                let destUsu = [], destNames = [], destMail = [], destTelefono = [];
                let elBotonComunicado = generateButton.boton({ type: 'success', shape: 'square', destination: 'alertsview/' + idEncriptado, text: ' Ver comunicado ' })

                resp.rows.map(contacto => {
                    let losMails = '', elToken = null
                    
                    if (contacto.aeacademicos_correo.indexOf('@') >= 0) {
                        //losMails = contacto.aeacademicos_correo
                        losMails += (contacto.aeacademicos_correo.indexOf('@') >= 0) ? ',' + contacto.aeacademicos_correo : '';
                        destMail.push(losMails)//

                        destNames.push(contacto.aeacademicos_nombre)
                        destUsu.push(contacto.aeusu_id)

                        destTelefono.push(contacto.aeacademicos_contacto)
                            
                    }
                })

                console.log('Los correos, telefonos: ', destMail.length, destTelefono.length)

                let payload = {
                    notification: {
                        title: 'Nuevo comentario',
                        body: comunicate.replace(/<\/?[^>]+>/ig, " ").substring(0, 30),
                        extra: elBotonComunicado
                    },
                    data: {
                        route: 'notification?referencia=alerta',
                        index: reference.toString()
                    }
                }

                let notificacionQuery = {
                    text: queryes.comunicadoRegisterNotification,
                    values: [id_usuario, destUsu, payload.notification.title, payload.notification.body, 
                        'data.aeavisos_comentarios', avisado.rows[0].aeavisoscomentarios_id, payload.data]
                }
                let respnotificacionQuery = await Db.query(notificacionQuery);

                // ENVIO DE CORREOS POR COMENTARIOS
                if(destMail.length > 0){
                    totalMessages = await generate.send({
                        name: destNames,
                        email: destMail,
                        message: {
                            titulo: payload.notification.title,
                            message: payload.notification.body,
                            extra: payload.notification.extra
                        }
                    })
                }


                res.send({
                    status: 'success',
                    statusCode: 200,
                    message: ' Respuesta registrada ',
                    rows: []
                })
            } else {

                res.send({
                    status: 'error',
                    statusCode: 400,
                    message: 'El comunicado que intenta comentar no esta disponible',
                    rows: []
                })
            }

        } catch (error) {
            console.log('alertComments: ', error);
            res.send({
                status: 'error',
                statusCode: 400,
                message: 'El sistema no puede responder a su solicitud',
                rows: []
            })
        }

    },

    /**
     * save comments into alerts and send notifications and emails
     * @param {*} req: comunicate,reference,id_usuario
     * @param {*} res: length of emails and push notifications generated
     */
    async consultaComments(req, res) {
        try {
            let { comunicate, reference, id_usuario, ano_lectivo, id_institucion } = req.body
            let idEncriptado = reference
            reference = parseInt(token.decriptar(reference))

            let query = {
                text: `INSERT INTO data.aeconsultasdocentes_comentarios(
                    aeconsultasdocentescomentarios_id, aeconsultasdocentes_id, aeusu_id, 
                    aeconsultasdocentescomentarios_fecha, aeconsultasdocentescomentarios_descripcion, aeconsultasdocentescomentarios_estado)
                    VALUES ((SELECT COALESCE(MAX(aeconsultasdocentescomentarios_id)+1, 1) FROM data.aeconsultasdocentes_comentarios), $1, $2, current_timestamp, $3, 1)
                    RETURNING aeconsultasdocentescomentarios_id;`,
                values: [reference, id_usuario, comunicate]
            }
            let avisado = await Db.query(query);
            let avisadoEnc = await token.createtoken(avisado.rows[0])

            let query2 = {
                text: `
                --CONTACTOS DE TODOS LOS QUE INTERVIENEN EN UNA CONSULTA A DOCENTE
                SELECT * FROM engine.contacto_user(
                    -- CONSULTAR LOS ID DE TODOS LOS QUE INTERVIENEN EN UNA CONSULTA A DOCENTE
                    (    SELECT array_agg(u.aeusu_id) AS aeusu_id
                        FROM (
                            SELECT e.aeusu_id
                            FROM data.aeconsultasdocentes_comentarios e
                            WHERE e.aeconsultasdocentes_id = $1
                            GROUP BY e.aeusu_id
                        ) u
                    )
                );`,
                values: [reference]
            }

            let resp = await Db.query(query2);
            let totalMessages = 0, totalPush = 0;

            let destUsu = [], destNames = [], destMail = [], destToken = [];
            let elBotonComunicado = generateButton.boton({ type: 'error', shape: 'square', destination: 'view_consulta/' + idEncriptado, text: ' Ver consulta ' })

            resp.rows.map(contacto => {
                let elToken = null
                if (contacto.aeacademicos_correo.indexOf('@') >= 0) {
                    destMail.push(contacto.aeacademicos_correo)//                    
                    destNames.push(contacto.aeacademicos_nombre)
                    destUsu.push(contacto.aeusu_id)
                    destToken.push(contacto.aeacademicos_token)
                }
            })

            let payload = {
                notification: {
                    title: 'Nuevo comentario, en consulta a docente',
                    body: comunicate.replace(/<\/?[^>]+>/ig, " ").substring(0, 30),
                    extra: elBotonComunicado
                },
                data: {
                    route: 'notification?referencia=consulta',
                    index: idEncriptado.toString()
                }
            }

            let notificacionQuery = {
                text: `INSERT INTO data.aenotificaciones(
                    aenotificaciones_id, aenotificaciones_de, aenotificaciones_para, aenotificaciones_fecha, 
                    aenotificaciones_title, aenotificaciones_body, aenotificaciones_ruta, aenotificaciones_referencia, aenotificaciones_data)
                    VALUES ((SELECT COALESCE(MAX(aenotificaciones_id)+1, 1) FROM data.aenotificaciones), $1, $2, current_timestamp, $3, $4, $5, $6, $7) RETURNING aenotificaciones_id`,
                values: [id_usuario, destUsu, payload.notification.title, payload.notification.body, 'data.aeconsultasdocentes', reference, payload.data]
            }
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
            })
            //console.log('Push enviados: ', totalMessages)


            let tok = await token.createtoken(totalPush);
            res.status(200).send({
                status: 'success',
                statusCode: 200,
                message: totalMessages + ' Respuesta enviada, ' + totalMessages,
                token: tok
            })

        } catch (error) {
            console.log(error);
            res.status(400).send(error.toString())
        }

    },

    /**
     * giveMeAlerts: show comunicados if the isset(reference) show one, something else show multiple comunicados
     * @param {*} req 
     * @param {*} res 
     */
    async giveMeAlerts(req, res) {
        try {
            let { ano_lectivo, id_academico, id_institucion, id_usuario, reference, group, rol } = req.body
            let consulalerts, query
            let criterios = `
                AND '`+ ahora + `' >= aeavisos_fechapublicacion
                AND (aeavisos_fechafinalizacion + interval '3 days') >= '`+ ahora + `'                    
                `;

            rol = parseInt(token.decriptar(rol)), id_usuario = parseInt(token.decriptar(id_usuario)), id_academico = parseInt(token.decriptar(id_academico))
            ano_lectivo = parseInt(token.decriptar(ano_lectivo)), id_institucion = parseInt(token.decriptar(id_institucion))

            switch (rol) {
                case 1:
                    criterios = ``
                    break;
                case 2:
                    criterios = `AND (
                    a.aeusu_id = `+ id_usuario + ` 
                    OR 'Todos' = ANY(a.aeavisos_grupo)
                    OR 'Docentes' = ANY(a.aeavisos_grupo)
                    OR a.aeavisos_grupo @> (
                        SELECT array_agg(t.aeasignaciones_grupo)
                        FROM data.aeasignaciones t
                        WHERE t.aedocentes_id=`+ id_academico + ` --iddocente, idacademico
                        AND t.aeanol_id=`+ ano_lectivo + ` -- anolectivo
                        AND t.aeinst_id=`+ id_institucion + ` -- institucion
                    ) )
                    AND CURRENT_TIMESTAMP >= aeavisos_fechapublicacion
                    AND (aeavisos_fechafinalizacion + interval '15 days') >= CURRENT_TIMESTAMP                   
                    `
                    break;
                case 3:
                case 6:
                    criterios = `AND (
                        'Todos' = ANY(a.aeavisos_grupo) 
                        OR ('`+ group + `' = ANY(a.aeavisos_grupo) 
                            AND (
                                a.aeavisos_estudiantesid = '{}' 
                                OR a.aeavisos_estudiantesid IS NULL
                                ) 
                        ) 
                        OR ('`+ group + `' = ANY(a.aeavisos_grupo) AND ` + id_academico + ` = ANY(a.aeavisos_estudiantesid) )  
                    )
                    AND aeavisos_alcance<>0 -- 0 SON COMUNICADOS PARA DOCENTES UNICAMENTE
                    AND CURRENT_TIMESTAMP >= aeavisos_fechapublicacion
                    AND (aeavisos_fechafinalizacion + interval '3 days') >= CURRENT_TIMESTAMP                    
                    `
                    break;
                default:
                    criterios = `
                    AND aeavisos_alcance<>0 -- 0 SON COMUNICADOS PARA DOCENTES UNICAMENTE
                    AND CURRENT_TIMESTAMP >= aeavisos_fechapublicacion
                    AND (aeavisos_fechafinalizacion + interval '3 days') >= CURRENT_TIMESTAMP                   
                    `
                    break;
            }

            if (typeof reference !== "undefined" && reference != "") {
                reference = parseInt(token.decriptar(reference))

                query = {
                    text: `
                    SELECT a.aeavisos_id AS idregistro, a.aeusu_id AS idusuario, aeavisos_titulo AS title, aeavisos_descripcion AS comunicate, 
                        translate(aeavisos_grupo::text, '{}','') AS group, 
                        translate(aeavisos_estudiantesid::text, '{}','') as student, aeavisos_adjunto AS file,
                        TO_CHAR(aeavisos_fecha, 'YYYY-MM-DD HH24:MI') AS dateregistro, TO_CHAR(aeavisos_fechapublicacion, 'YYYY-MM-DD HH24:MI') AS date_init, 
                        TO_CHAR(aeavisos_fechafinalizacion, 'YYYY-MM-DD HH24:MI') AS date_finish, e.aeestados_descripcion AS estado,
                        a.aeavisos_estado AS idestado, 
                        (SELECT COUNT(*) FROM data.aeavisos_comentarios WHERE aeavisos_id=$1 ) AS comentarios,
                        aeusu_nombre AS emisor, aeavisos_alcance AS alcance, aeavisos_aceptarespuestas AS respuestas,
                        (
                            SELECT array_agg( n.aeestudiantes_apellidos || ' ' || n.aeestudiantes_nombres ) AS estudiantes
                            FROM data.aeestudiantes n
                            WHERE n.aeestudiantes_id = ANY (a.aeavisos_estudiantesid::bigint[])
                            AND n.aeinstitucion_id = a.aeinst_id
                            AND n.aeano_id = a.aeanol_id
                        ) as estudiantesnombres
                    FROM data.aeavisos a, data.aeestados e, engine.aeusu u
                    WHERE a.aeavisos_id=$1
                        AND a.aeavisos_estado<>0
                        AND a.aeavisos_estado=e.aeestados_id
                        AND a.aeusu_id=u.aeusu_id`,
                    values: [reference]
                }
            } else {

                query = {
                    text: `
                    SELECT a.aeavisos_id AS idregistro, a.aeusu_id AS idusuario, aeavisos_titulo AS title, aeavisos_descripcion AS comunicate, 
                        translate(aeavisos_grupo::text, '{}','') AS group, 
                        translate(aeavisos_estudiantesid::text, '{}','') as student, aeavisos_adjunto AS file,
                        TO_CHAR(aeavisos_fecha, 'YYYY-MM-DD HH24:MI') AS dateregistro, TO_CHAR(aeavisos_fechapublicacion, 'YYYY-MM-DD HH24:MI') AS date_init, 
                        TO_CHAR(aeavisos_fechafinalizacion, 'YYYY-MM-DD HH24:MI') AS date_finish, e.aeestados_descripcion AS estado,
                        a.aeavisos_estado AS idestado, 
                        (SELECT COUNT(*) FROM data.aeavisos_comentarios WHERE aeavisos_id=$1 ) AS comentarios,
                        aeusu_nombre AS emisor, aeavisos_alcance AS alcance, aeavisos_aceptarespuestas AS respuestas
                    FROM data.aeavisos a, data.aeestados e, engine.aeusu u
                    WHERE a.aeinst_id=$1
                        AND a.aeanol_id=$2
                        `+ criterios + `
                        AND a.aeavisos_estado=e.aeestados_id
                        AND a.aeusu_id=u.aeusu_id
                        ORDER BY aeavisos_fecha DESC
                        -- LIMIT 40`,
                    values: [id_institucion, ano_lectivo]
                }
            }
            //console.log('La consulta alerts: ', query)

            let resp = await Db.query(query);
            //console.log('La consulta alerts: ', resp.rows.length)
            //if(resp.rows.length > 0){
            resp.rows.map((item, i) => {
                resp.rows[i].idregistro = token.encriptar(resp.rows[i].idregistro)
                resp.rows[i].idestado = token.encriptar(resp.rows[i].idestado)
                resp.rows[i].idusuario = token.encriptar(resp.rows[i].idusuario)
            })
            //}

            res.send({ 
                status: 'success', 
                statusCode: 200, 
                message: resp.rows.length + ' Comunicados encontrados', 
                rows: resp.rows 
            })
        } catch (error) {
            console.log('Error listando los comunicados: ', error.toString())
            res.send({ 
                status: 'success', 
                statusCode: 400, 
                message: 'El sistema no puede encontrar los comunicados en este momento, intente de nuevo mas tarde', 
                rows: [] 
            })
        }
    },

    /**
     * show consultas if the isset(reference) show one, something else show multiple consultas
     * @param {*} req 
     * @param {*} res 
     */
    async giveMeConsultas(req, res) {
        try {
            let { ano_lectivo, id_academico, id_institucion, id_usuario, reference, group, rol } = req.body
            let consultasdocentes, query, criterios = ``;

            switch (parseInt(rol)) {
                case 1:
                    criterios = `AND TO_CHAR(c.aeconsultasdocentes_fecha, 'YYYY-MM-DD') 
                    BETWEEN TO_CHAR(current_date - interval '3 month', 'YYYY-MM-01') AND TO_CHAR(current_date, 'YYYY-MM-DD') `
                    break;
                case 2:
                    criterios = `
                    AND c.aedocente_id=`+ parseInt(id_academico) + `
                    AND TO_CHAR(c.aeconsultasdocentes_fecha, 'YYYY-MM-DD') 
                    BETWEEN TO_CHAR(current_date - interval '3 month', 'YYYY-MM-01') AND TO_CHAR(current_date, 'YYYY-MM-DD') 
                    `
                    break;
                case 3:
                    criterios = `AND c.aeestudiantes_id=` + parseInt(id_academico) + ` `
                    break;
            }

            if (typeof reference !== "undefined" && reference != "") {
                reference = parseInt(token.decriptar(reference))
                consultasdocentes = `
                SELECT aeconsultasdocentes_id, aeconsultasdocentes_fecha, (aeestudiantes_apellidos || ' ' || aeestudiantes_nombres) as aeestudiantes_nombre, 
                aeasignaciones_asignatura, (aedocentes_apellidos || ' ' || aedocentes_nombres) as aedocentes_nombre, aeinst_id, aeanol_id, 
                aeconsultasdocentes_descripcion, aeconsultasdocentes_visibilidad, s.aeestados_descripcion as estado,
                (SELECT COUNT(*) FROM data.aeconsultasdocentes_comentarios x WHERE x.aeconsultasdocentes_id=$1 )  AS aeconsultasdocentes_comentarios -- ,n.aenotificaciones_estado
                FROM data.aeconsultasdocentes c, data.aeestudiantes e, data.aedocentes d, data.aeestados s -- ,
                /*( 
                    SELECT aenotificaciones_id, aenotificaciones_de, aenotificaciones_para,
                    aenotificaciones_fecha, aenotificaciones_title, aenotificaciones_body,
                    aenotificaciones_ruta, aenotificaciones_referencia, aenotificaciones_data,
                    aenotificaciones_estado
                    FROM data.aenotificaciones n
                    WHERE n.aenotificaciones_ruta LIKE 'data.aeconsultasdocentes'
                ) n*/
                WHERE c.aeconsultasdocentes_id=$1
                AND c.aeestudiantes_id=e.aeestudiantes_id
                -- AND c.aeconsultasdocentes_id=n.aenotificaciones_referencia
                AND c.aedocente_id=d.aedocentes_id
                AND c.aeconsultasdocentes_estado=s.aeestados_id
                `;
                query = {
                    text: consultasdocentes,
                    values: [reference]
                }
            } else {
                consultasdocentes = `
                --LISTADO DE CONSULTAS A DOCENTES
                SELECT aeconsultasdocentes_id, aeconsultasdocentes_fecha, (aeestudiantes_apellidos || ' ' || aeestudiantes_nombres) as aeestudiantes_nombre, 
                aeasignaciones_asignatura, (aedocentes_apellidos || ' ' || aedocentes_nombres) as aedocentes_nombre, aeinst_id, aeanol_id, 
                aeconsultasdocentes_descripcion, aeconsultasdocentes_visibilidad, s.aeestados_descripcion as estado,
                (SELECT COUNT(*) FROM data.aeconsultasdocentes_comentarios x WHERE x.aeconsultasdocentes_id=c.aeconsultasdocentes_id )  AS aeconsultasdocentes_comentarios --,n.aenotificaciones_estado
                FROM data.aeconsultasdocentes c, data.aeestudiantes e, data.aedocentes d, data.aeestados s -- ,
                /*( 
                    SELECT aenotificaciones_id, aenotificaciones_de, aenotificaciones_para,
                    aenotificaciones_fecha, aenotificaciones_title, aenotificaciones_body,
                    aenotificaciones_ruta, aenotificaciones_referencia, aenotificaciones_data,
                    aenotificaciones_estado
                    FROM data.aenotificaciones n
                    WHERE n.aenotificaciones_ruta LIKE 'data.aeconsultasdocentes'
                ) n */
                WHERE c.aeanol_id=$2
                AND c.aeinst_id=$1
                `+ criterios + `
                AND c.aeestudiantes_id=e.aeestudiantes_id
                -- AND c.aeconsultasdocentes_id=n.aenotificaciones_referencia
                AND c.aedocente_id=d.aedocentes_id
                AND c.aeconsultasdocentes_estado=s.aeestados_id
                ORDER BY aeconsultasdocentes_fecha DESC
                -- LIMIT 20
                `;
                query = {
                    text: consultasdocentes,
                    values: [parseInt(id_institucion), parseInt(ano_lectivo)]
                }
            }
            //console.log('la query CONSULTA A DOCENTES: ', query)

            let resp = await Db.query(query);
            resp.rows.map((item, i) => {
                resp.rows[i].aeconsultasdocentes_id = token.encriptar(resp.rows[i].aeconsultasdocentes_id)
            })

            let tok = await token.createtoken(resp.rows);
            res.status(200).send({ status: 'success', statusCode: 200, message: resp.rows.length + ' Consultas ', token: tok })
        } catch (error) {
            res.status(400).send(error.toString())
        }
    },

    /**
     * commentsAlerts: return list of comments
     * Get comments for alerts
     * @param {*} req: ano_lectivo,id_institucion,id_academico,reference
     * @param {*} res: row of comments on alerts
     */
    async commentsAlerts(req, res) {
        try {
            let { ano_lectivo, id_institucion, rol, id_usuario, id_academico, reference } = req.body
            if (typeof reference != undefined && reference != "") {
                reference = parseInt(token.decriptar(reference))
                ano_lectivo = parseInt(token.decriptar(ano_lectivo))
                id_institucion = parseInt(token.decriptar(id_institucion))
                id_academico = parseInt(token.decriptar(id_academico))
                id_usuario = parseInt(token.decriptar(id_usuario))

                let query = {}
                switch (parseInt(token.decriptar(rol))) {
                    case 1:
                    case 2:
                        query = {
                            text: queryes.viewComments,
                            values: [reference]
                        }
                        break;

                    case 3:
                    case 6:
                    default:
                        query = {
                            text: queryes.viewCommentsStudent,
                            values: [reference, id_usuario]
                        }
                        break;
                }

                let resp = await Db.query(query);
           
                res.send({ 
                    status: 'success', 
                    statusCode: 200, 
                    message: resp.rows.length + ' comentarios encontrados', 
                    rows: resp.rows 
                })
            } else {
                res.send({ 
                    status: 'error', 
                    statusCode: 400, 
                    message: 'No es posible ver el comunicado', 
                    rows: [] 
                })
            }
        } catch (error) {
            console.log('commentsAlerts catch: ', error.toString())
            res.send({ 
                status: 'error', 
                statusCode: 400, 
                message: 'El sistema es incapaz de dar un paso seguido', 
                rows: [] 
            })
        }
    },

    /**
     * Get comments for alerts
     * @param {*} req: reference
     * @param {*} res: row of comments on alerts
     */
    async commentsConsultas(req, res) {
        try {
            let { reference } = req.body
            reference = parseInt(token.decriptar(reference))
            let query = {
                text: `
                SELECT aeconsultasdocentescomentarios_fecha, aeusu_nombre, aeconsultasdocentescomentarios_descripcion
                FROM data.aeconsultasdocentes_comentarios c, engine.aeusu u
                WHERE aeconsultasdocentes_id = $1
                AND c.aeusu_id=u.aeusu_id
                ORDER BY aeconsultasdocentescomentarios_fecha DESC`,
                values: [reference]
            }
            let resp = await Db.query(query);

            let tok = await token.createtoken(resp.rows)

            res.status(200).send({ status: 'success', statusCode: 200, message: resp.rows.length + ' Respuestas ', token: tok })
        } catch (error) {
            res.status(400).send(error.toString())
        }
    },

    /**
     * listAllAlerts: fetch all notification for user
     * @param {*} req 
     * @param {*} res 
     */
    async listAllAlerts(req, res) {
        try {
            let { id_usuario, ano_lectivo, id_institucion, rol } = req.body
            let query = {};

            switch (parseInt(token.decriptar(rol))) {
                case 1:
                    ano_lectivo = parseInt(token.decriptar(ano_lectivo))
                    id_institucion = parseInt(token.decriptar(id_institucion))
                    query = {
                        text: queryes.notificationGlobal,
                        values: [ano_lectivo, id_institucion]
                    }
                    break;

                default:
                    id_usuario = parseInt(token.decriptar(id_usuario))
                    query = {
                        text: queryes.notificationUser,
                        values: [id_usuario]
                    }
                    break;
            }

            let resp = Db.query(query)
            console.log('la lista de notificaciones: ', resp.rows)

            res.send({ 
                status: 'success', 
                statusCode: 200, 
                message: resp.rows.length+ ' Notificaciones recibidas', 
                rows: resp.rows 
            })
        } catch (error) {
            console.log('Error listando los avisos: ', error)
            res.status(400).send({ 
                status: 'success', 
                statusCode: 400, 
                message: 'El sistema enfrenta dificultades', 
                rows: []
            })
        }
    },

    /**
     * listOneAlerts: fetch one notification for id
     * @param {*} req 
     * @param {*} res 
     */
    async listOneAlerts(req, res) {
        try {
            let { id_usuario, ano_lectivo, id_institucion, referencia } = req.body
            //referencia=parseInt(token.decriptar(referencia))
            let eltexto = `
            SELECT n.aenotificaciones_id, u.aeusu_nombre, n.aenotificaciones_para, TO_CHAR(n.aenotificaciones_fecha, 'YYYY-MM-DD, HH:mi') as aenotificaciones_fecha, 
            n.aenotificaciones_title, n.aenotificaciones_body, n.aenotificaciones_ruta, 
            n.aenotificaciones_referencia, n.aenotificaciones_data
            FROM data.aenotificaciones n, engine.aeusu u
            WHERE n.aenotificaciones_id=$1
            AND n.aenotificaciones_de=u.aeusu_id
            ORDER BY n.aenotificaciones_fecha DESC, n.aenotificaciones_title;`;
            let query = {
                text: eltexto,
                values: [parseInt(referencia)]
            }
            let resp = await Db.query(query);

            let tok = await token.createtoken(resp.rows);

            res.status(200).send({ status: 'success', statusCode: 200, message: 'Notificacion', token: tok })
        } catch (error) {
            res.status(400).send(error.toString())
        }
    },
}