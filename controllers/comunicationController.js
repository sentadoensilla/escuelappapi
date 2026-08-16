require('dotenv').config()
const path = require('path')
const Db = require('../database/conex')
const token = require('../utils/token')
const queryes = require('../sql/comms')
const generate = require('../utils/notifications/mail/alerta')
// const generatePush = require('../utils/notifications/push/firebase')
const generateButton = require('../utils/buttons')
const wpSender = require('../utils/notifications/whatsapp/wpRomote')
const wpQueryes = require('../sql/whatsapp');
const { MessageMedia } = require('whatsapp-web.js');

let moment = require('moment');
const ahora = moment().format('YYYY-MM-DD HH:mm:ss');

module.exports = {
    /**
     * cronogramaList giveme a list of events in calendar and alerts in table for alerts
     * return [{},{},{}]
     * @param {*} req 
     * @param {*} res
     */
    async cronogramaList(req, res) {
        try {
            let { ano_lectivo, id_institucion, rol, id_academico, reference, id_usuario, fechainicio, fechafin, group } = req.body
            let tok = "", dayPast = 30, dayComming = 30, laQuery = {}, listaEventos = {}

            //CHECK DATA FRO EVENTS IN CALENDAR
            if (ano_lectivo != "" && id_institucion != "") {
                // console.log('intro anolectivo: ', ano_lectivo)
                ano_lectivo = parseInt(ano_lectivo)//parseInt(token.decriptar(ano_lectivo))
                id_institucion = parseInt(id_institucion)//parseInt(token.decriptar(id_institucion))
                id_academico = parseInt(id_academico)//parseInt(token.decriptar(id_academico))
                id_usuario = parseInt(id_usuario)//parseInt(token.decriptar(id_usuario))
                // group = (typeof group != "undefined" && group != "") ? JSON.parse(group) : [''];
                group = (typeof group != "undefined" && group != "") ? group.toString() : '';

                rol = (typeof rol != "undefined" && rol != "")? parseInt(rol) : 3 ;

                listaEventos = {
                    id: ano_lectivo + '' + id_institucion,
                    name: 'Eventos importantes ' + fechainicio + ' hasta ' + fechafin,
                    events: []
                }


                switch (rol) {
                    case 1:
                        criterios = ``
                        break;
                    case 2:
                        criterios = `AND (
                        '' = ANY(c.aecronograma_grupo)
                        OR 'Todos' = ANY(c.aecronograma_grupo)
                        OR 'Docentes' = ANY(c.aecronograma_grupo)
                        OR c.aecronograma_grupo @> (
                                SELECT array_agg(t.aeasignaciones_grupo)
                                FROM data.aeasignaciones t
                                WHERE t.aedocentes_id=`+ id_academico + ` --iddocente, idacademico
                                AND t.aeanol_id=`+ ano_lectivo + ` -- anolectivo
                                AND t.aeinst_id=`+ id_institucion + ` -- institucion
                            )
                        )`
                        break;
                    case 3:
                    case 6:
                        criterios = `
                        AND (
                            'Todos' = ANY(c.aecronograma_grupo) 
                            OR ('`+ group + `' = ANY(c.aecronograma_grupo))
                        )                    
                        `
                        break;
                    default:
                        criterios = ``
                    break;
                }

                //FILTER BY DATE IF DATE EXISTS
                if (fechainicio != '' && fechainicio != null && typeof fechainicio != undefined) {
                    fechainicio += (fechainicio.length <= 9) ? ' 00:00:00' : ''
                    criterios += `
                    AND c.aecronograma_fechainicio >= '`+ fechainicio + `'                
                    `
                }
                if (fechafin != '' && fechafin != null && typeof fechafin != undefined) {
                    fechafin += (fechafin.length <= 9) ? ' 00:00:00' : ''
                    criterios += `
                    AND c.aecronograma_fechafin <= '`+ fechafin + `'                  
                    `
                }

                if (typeof reference != "undefined" && reference != "") {
                    laQuery = {
                        text: `
                        -- CRONOGRAMA DE EVENTOS EN UNA INSTITUCION DURANTE FECHAS ESPECIFICAS
                        SELECT 
                        c.aecronograma_id, c.aeinst_id, c.aeano_id, t.aecronogramatipoevento_descripcion, t.aecronogramatipoevento_color, c.aecronograma_grupo, 
                        c.aeusu_id, c.aecronograma_fecharegistro, c.aecronograma_fechainicio, c.aecronograma_fechafin, 
                        c.aecronograma_titulo, c.aecronograma_descripcion, c.aecronograma_adjunto, c.aeusu_id, c.aecronograma_responsables, 
                        (
                        SELECT COUNT(x.aecronogramacomentario_id)
                        FROM data.aecronograma_comentarios x
                        WHERE x.aecronograma_id=c.aecronograma_id
                        ) as aecronograma_comentarios,
                        (
                            SELECT json_agg(row_to_json(x))
                            FROM (
                                SELECT r.aecronogramacomentario_id AS aecronogramacomentario_id, 
                                to_char(r.aecronogramacomentario_fecha, 'YYYY-MM-DD HH24:MI') AS aecronogramacomentario_fecha, 
                                u.aeusu_nombre AS aeusu_nombre, 
                                r.aecronogramacomentario_descripcion AS aecronogramacomentario_descripcion
                                FROM data.aecronograma_comentarios r, engine.aeusu u
                                WHERE r.aecronograma_id = $1
                                AND r.aeusu_id = u.aeusu_id
                                ORDER BY r.aecronogramacomentario_fecha DESC
                            ) x
                        ) AS inter
                        FROM data.aecronograma c, data.aecronograma_tipoevento t
                        WHERE c.aecronograma_id=$1
                        AND c.aecronograma_estado=1
                        AND c.aecronogramatipoevento_id=t.aecronogramatipoevento_id;`,
                        values: [parseInt(token.decriptar(reference))]
                    }
                } else {
                    laQuery = {
                        text: `
                        -- CRONOGRAMA DE EVENTOS EN UNA INSTITUCION DURANTE FECHAS ESPECIFICAS
                        SELECT 
                        c.aecronograma_id, c.aeinst_id, c.aeano_id, t.aecronogramatipoevento_descripcion, t.aecronogramatipoevento_color, c.aecronograma_grupo, 
                        c.aeusu_id, c.aecronograma_fecharegistro, c.aecronograma_fechainicio, c.aecronograma_fechafin, 
                        c.aecronograma_titulo, c.aecronograma_descripcion, c.aecronograma_adjunto, c.aeusu_id, c.aecronograma_responsables, 
                        (
                        SELECT COUNT(x.aecronogramacomentario_id)
                        FROM data.aecronograma_comentarios x
                        WHERE x.aecronograma_id=c.aecronograma_id
                        ) as aecronograma_comentarios,
                        (
                            SELECT json_agg(row_to_json(x))
                            FROM (
                                SELECT r.aecronogramacomentario_id AS aecronogramacomentario_id, 
                                to_char(r.aecronogramacomentario_fecha, 'YYYY-MM-DD HH24:MI') AS aecronogramacomentario_fecha, 
                                u.aeusu_nombre AS aeusu_nombre, 
                                r.aecronogramacomentario_descripcion AS aecronogramacomentario_descripcion
                                FROM data.aecronograma_comentarios r, engine.aeusu u
                                WHERE r.aecronograma_id = c.aecronograma_id
                                AND r.aeusu_id = u.aeusu_id
                                ORDER BY r.aecronogramacomentario_fecha DESC
                            ) x
                        ) AS inter
                        FROM data.aecronograma c, data.aecronograma_tipoevento t
                        WHERE c.aeinst_id @> $2 ::bigint[]
                        AND c.aeano_id=$1
                        AND c.aecronograma_estado = 1
                        `+ criterios + `
                        AND c.aecronogramatipoevento_id=t.aecronogramatipoevento_id
                        ORDER BY c.aecronograma_fechainicio, c.aecronogramatipoevento_id;`,
                        values: [ano_lectivo, [id_institucion]]
                    }
                }
                // console.log('La Query eventos: ', laQuery)

                await Db.query(laQuery).then((resultados) => {
                    //MASQUERADE ID
                    resultados.rows.map((elResultado, r) => {
                        resultados.rows[r].aecronograma_id = token.encriptar(elResultado.aecronograma_id)
                    })
                    // console.log('Listados: ', resultados.rows)

                    listaEventos = {
                        id: ano_lectivo + '' + id_institucion,
                        name: 'Eventos importantes ' + fechainicio + ' hasta ' + fechafin,
                        events: resultados.rows
                    }
                })



                tok = await token.createtoken(listaEventos)
                res.status(200).send({ status: 'success', statusCode: 200, message: listaEventos.events.length + ' Eventos encontrados ', token: tok })

            } else {
                tok = await token.createtoken('La sede y el ano lectivo son necesarios')
                res.status(200).send({ status: 'error', statusCode: 200, message: 'La sede y el ano lectivo son necesarios', token: tok })
            }
        } catch (error) {
            res.status(400).send(error.toString())
        }
    },

    /**
     * cronogramaInsert register events in calendar and alerts in table for alerts
     * return message or error
     * @param {*} req 
     * @param {*} res
     */
    async cronogramaInsert(req, res) {
        try {
            let { ano_lectivo, id_institucion, id_usuario, fechainicio, fechafin, titulo, descripcion, group, tipoevento, responsable } = req.body
            let tok = "", pretok = "", lasAlertas = []
            let groupsReal, groupsRealdata

            //CHECK DATA FRO EVENTS IN CALENDAR
            if (fechainicio != "" && fechafin != "" && titulo != "" && descripcion != "") {
                ano_lectivo = parseInt(ano_lectivo) //parseInt(token.decriptar(ano_lectivo))
                id_institucion = [parseInt(id_institucion)]//parseInt(token.decriptar(id_institucion))
                id_usuario = parseInt(id_usuario)//parseInt(token.decriptar(id_usuario))
                tipoevento = parseInt(token.decriptar(tipoevento))
                group = JSON.parse(group)
                responsable = (typeof responsable == "undefined" || responsable == "")? null : responsable ;
                
                const DIR = 'p/cl/' + id_institucion + '/'
                // console.log('typeof ', (typeof req.files))
                let adjunto1 = null;
                if (typeof req.files != "undefined") {
                    if (typeof req.files[0] != "undefined" && req.files[0] != null) {
                        adjunto1 = `${DIR}${req.files[0].filename}`;
                        req.rutaguardar = DIR
                        req.maxSize = 5000000
                        req.referFunction = "file"
                        req.fileMax = 1
                    }
                }
                let laQuery = {
                    text: queryes.cronogramaInsert,
                    values: [
                        id_institucion, ano_lectivo, tipoevento, group,
                        id_usuario, fechainicio, fechafin,
                        titulo, descripcion, adjunto1, responsable
                    ]
                }

                // console.log('laquery: ', laQuery)

                await Db.query(laQuery)
                    .then(async (preCoronograma) => {
                        if (preCoronograma.rowCount > 0) {
                            tok = await token.createtoken(titulo + ' creado en el cronograma')
                            res.status(200).send({ status: 'success', statusCode: 200, message: titulo + ' Evento creado en el cronograma', token: tok })
                        } else {
                            tok = await token.createtoken(' No fue posible agregar ' + titulo + ' al cronograma ')
                            res.status(200).send({ status: 'success', statusCode: 200, message: ' No fue posible agregar ' + titulo + ' al cronograma ', token: tok })
                        }
                    })
                    .catch(async (error) => {
                        tok = await token.createtoken(error.toString())
                        res.status(400).send({ status: 'error', statusCode: 400, message: 'No fue posible registrar el evento en el cronograma', token: tok })
                    })

            } else {
                tok = await token.createtoken('El titulo, contenido y fechas del evento son indispensables')
                res.status(200).send({ status: 'error', statusCode: 200, message: 'El titulo, contenido y fechas del evento son indispensables', token: tok })
            }
        } catch (error) {
            res.status(400).send(error.toString())
        }
    },

    /**
     * cronogramaBulk register multi events in calendar from csv file
     * return message or error
     * @param {*} req 
     * @param {*} res
     */
    async cronogramaBulk(req, res) {
        try {
            let { ano_lectivo, id_institucion, id_usuario, sedes } = req.body
            const fs = require("fs");
            // const { parse } = require("csv-parse");
            const csv = require("csv-parser");

            let tok = "", pretok = "", lasAlertas = [], registrados = 0;
            let groupsReal = [], misSedes = [], tipoEvento = 1, registros = 0, adjuntoReal = null, errores = 0
            let matrizEventos = [], misTipoEventos = ['']
            
            //TIPOEVENTOS FROM DB TO MATCH IN CSV
            await Db.query({
                text: queryes.cronogramaTipoEventoSelect,
                values: [1]
            }).then((losRows) => {
                losRows.rows.map((losTipo) => {
                    misTipoEventos.push(losTipo.descripcion)
                })
            })

            
            // console.log('misTipoEventos: ', misTipoEventos)
            // console.log('El id_institucion: ', id_institucion)


            //CHECK DATA FRO EVENTS IN CALENDAR
            if (ano_lectivo != "" && id_institucion != "" && id_usuario != "") {
                ano_lectivo = parseInt(ano_lectivo) //parseInt(token.decriptar(ano_lectivo))
                //id_institucion = parseInt(id_institucion)//parseInt(token.decriptar(id_institucion))
                //RECORREMOS TODAS LAS SEDES SELECCIONADAS PARA ARMAR EL ARRAY id_institucion
                sedes = sedes.split(",")
                sedes.forEach((sede,s) =>{
                    misSedes.push(parseInt(token.decriptar(sede)))
                })
                //id_institucion = [38,36,42,43,3,37,41,63,54,53,56,55,64,39,59,40,46,47,51,44,45,48,49,50,52,57,58,60,61,62]

                id_usuario = parseInt(id_usuario)//parseInt(token.decriptar(id_usuario))

                if (req.files[0] != undefined && req.files[0] != null) {
                    adjuntoReal = `${req.files[0].path}`
                }
                // console.log('El files: ', req.files[0])


                fs.createReadStream(adjuntoReal)
                    // .pipe(parse({ delimiter: ";", from_line: 2 }))
                    .pipe(csv())
                    .on("data", async function (row) {

                        //console.log('La row', row)
                        if(row['FECHA INICIAL'] != "undefined" && row['FECHA FINAL'] !="undefined" && row['TITULO DEL EVENTO'] !="undefined" && row['DESCRIPCION DEL EVENTO'] !="undefined" && row['TIPO DE EVENTO'] !="undefined" 
                             && row['FECHA INICIAL'] != "" && row['FECHA FINAL'] !="" && row['TITULO DEL EVENTO'] !="" && row['DESCRIPCION DEL EVENTO'] !="" && row['TIPO DE EVENTO'] !="" ){
                            groupsReal = []
                            row['GRUPOS'].split(',').map((elGrupo) => {
                                groupsReal.push(elGrupo.trim().toString())
                            })

                            tipoEvento = (row['TIPO DE EVENTO'] != "")? misTipoEventos.indexOf(row['TIPO DE EVENTO'].toLowerCase()) : 1 ; 

                            let miQuery = {
                                text: `
                                INSERT INTO data.aecronograma (
                                    aecronograma_id, aeinst_id, aeano_id, aecronogramatipoevento_id, aecronograma_grupo, aeusu_id, 
                                    aecronograma_estado, aecronograma_fecharegistro, aecronograma_fechainicio, aecronograma_fechafin, 
                                    aecronograma_titulo, aecronograma_descripcion, aecronograma_responsables, aecronograma_adjunto) 
                                VALUES ((SELECT COALESCE((MAX(aecronograma_id)+1), 1) FROM data.aecronograma),
                                    $1, $2, $12, $3, $4, 
                                    $5, CURRENT_TIMESTAMP, $6, $7, 
                                    $8, $9, $10, $11) RETURNING aecronograma_id;`,
                                values: [
                                    misSedes,
                                    ano_lectivo,
                                    groupsReal,
                                    id_usuario,
                                    1,
                                    moment(row['FECHA INICIAL']).format('YYYY-MM-DD HH:mm:ss'),
                                    moment(row['FECHA FINAL']).format('YYYY-MM-DD HH:mm:ss'),
                                    (row['TITULO DEL EVENTO'].trim()),
                                    (row['DESCRIPCION DEL EVENTO'].trim()),
                                    (row['RESPONSABLE'].trim()||null),
                                    null,
                                    tipoEvento
                                ]
                            }
                            console.log('El registro: ', miQuery)


                            await Db.query(miQuery)
                                .then((preCoronograma) => {
                                    registros += parseInt(preCoronograma.rowCount)
                                })
                                .catch((error) => {
                                    // console.log('query error: ', error.toString())
                                    errores++
                                })
                        }
                    })
                    .on("end", async () => {
                        tok = await token.createtoken('Registrados: ' + registros + ' errores: ' + errores)
                        res.send({ status: 'success', statusCode: 200, message: registros + ' Eventos creados en el cronograma', token: tok })
                    })
                    .on("error", async (error) => {
                        // console.log('File error: ', error.toString())

                        tok = await token.createtoken(error.toString())
                        res.send({ status: 'error', statusCode: 400, message: 'Hubo problemas al intentar los registros ', token: tok })
                    });

            } else {
                tok = await token.createtoken('El titulo, contenido y fechas del evento son indispensables')
                res.send({ status: 'error', statusCode: 200, message: 'El titulo, contenido y fechas del evento son indispensables', token: tok })
            }
        } catch (error) {
            console.log(error.toString())
            tok = await token.createtoken('El sistema presenta un error inesperado ')
            res.send({ status: 'error', statusCode: 400, message: 'El sistema presenta un error inesperado ', token: tok })
        }
    },

    /**
     * cronogramaEdit change event data on calendar
     * return message or error
     * @param {*} req 
     * @param {*} res
     */
    async cronogramaEdit(req, res) {
        try {
            let { id_evento, id_institucion, id_usuario, fechainicio, fechafin, titulo, descripcion, fechaalerta, group } = req.body
            let tok = "", pretok = "", lasAlertas = []

            //CHECK DATA FRO EVENTS IN CALENDAR
            if (id_evento != "" && fechainicio != "" && fechafin != "" && titulo != "" && descripcion != "") {
                ano_lectivo = parseInt(token.decriptar(ano_lectivo))
                id_institucion = parseInt(token.decriptar(id_institucion))
                id_usuario = parseInt(token.decriptar(id_usuario))
                id_evento = parseInt(token.decriptar(id_evento))

                group = JSON.stringify(group)

                const DIR = 'p/cl/' + id_institucion + '/'
                //// console.log('req.files: ', req.files)
                let adjunto1 = null;
                if (req.files[0] != undefined && req.files[0] != null) {
                    adjunto1 = `${DIR}${req.files[0].filename}`;
                }

                req.rutaguardar = DIR
                req.maxSize = 5000000
                req.referFunction = "file"
                req.fileMax = 1

                await Db.query({
                    text: queryes.cronogramaUpdate,
                    values: [
                        id_evento, ano_lectivo, id_institucion, id_usuario,
                        group, fechainicio, fechafin, titulo,
                        descripcion, adjunto1
                    ]
                })
                    .then(async (preCoronograma) => {
                        if (preCoronograma.rowCount > 0) {
                            //ARRAYZAR 
                            lasAlertas = []
                            fechaalerta.map((laFecha) => {
                                lasAlertas.push(preCoronograma.rows[0].aecronograma_id, laFecha)
                            })

                            await Db.query({
                                text: queryes.cronogramaAlertinsert,
                                values: [lasAlertas]
                            })
                                .then(async (preAlerta) => {
                                    pretok = preAlerta.rowCount + ' alertas agregadas'
                                })
                                .catch(async (error) => {
                                    pretok = await token.createtoken(error.toString())
                                })

                            tok = await token.createtoken(preCoronograma.rowCount + ' Evento creado en el cronograma, ' + pretok)
                            res.status(200).send({ status: 'success', statusCode: 200, message: preCoronograma.rowCount + ' Evento creado en el cronograma, ' + pretok, token: tok })
                        }
                    })
                    .catch(async (error) => {
                        tok = await token.createtoken(error.toString())
                        res.status(400).send({ status: 'error', statusCode: 400, message: 'No fue posible registrar el evento en el cronograma', token: tok })
                    })

            } else {
                tok = await token.createtoken('El titulo, contenido y fechas del evento son indispensables')
                res.status(200).send({ status: 'error', statusCode: 200, message: 'El titulo, contenido y fechas del evento son indispensables', token: tok })
            }
        } catch (error) {
            res.status(400).send(error.toString())
        }
    },

    /**
     * cronogramaDelete change event data on calendar
     * return message or error
     * @param {*} req 
     * @param {*} res
     */
    async cronogramaDelete(req, res) {
        try {
            let { reference, id_usuario, rol } = req.body
            let tok = ""

            //CHECK DATA FRO EVENTS IN CALENDAR
            if (reference != "" && id_usuario != "" && rol != "") {
                id_usuario = parseInt(id_usuario) //parseInt(token.decriptar(id_usuario))
                reference = parseInt(token.decriptar(reference))
                rol = parseInt(rol)

                let miQuery = {
                    text: queryes.cronogramaDelete,
                    values: [reference, id_usuario, rol]
                }

                // console.log('mi Query: ', miQuery)

                await Db.query(miQuery)
                    .then(async (preCoronograma) => {
                        if (preCoronograma.rowCount > 0) {
                            tok = await token.createtoken(preCoronograma.rowCount + ' Evento eliminado del cronograma, ')
                            res.status(200).send({ status: 'success', statusCode: 200, message: preCoronograma.rowCount + ' Evento eliminado del cronograma, ', token: tok })
                        }
                    })
                    .catch(async (error) => {
                        tok = await token.createtoken(error.toString())
                        res.status(400).send({ status: 'error', statusCode: 400, message: 'No fue posible eliminar el evento del cronograma', token: tok })
                    })

            } else {
                tok = await token.createtoken('No agarro el evento que deseas eliminar')
                res.status(200).send({ status: 'error', statusCode: 200, message: 'No agarro el evento que deseas eliminar', token: tok })
            }
        } catch (error) {
            res.status(400).send(error.toString())
        }
    },

    /**
     * cronogramaCommentList giveme a list of comments in a event
     * return [{},{},{}]
     * @param {*} req 
     * @param {*} res
     */
    async cronogramaCommentList(req, res) {
        try {
            let { id_cronograma } = req.body
            let tok = ""

            //CHECK DATA FRO EVENTS IN CALENDAR
            if (id_cronograma != "") {
                id_cronograma = parseInt(token.decriptar(id_cronograma))

                let listaComentarios = await Db.query({
                    text: queryes.cronogramaCommentSelect,
                    values: [id_cronograma]
                })

                tok = await token.createtoken(listaComentarios.rows)
                res.status(200).send({ status: 'success', statusCode: 200, message: listaComentarios.rows.length + ' Comentarios encontrados ', token: tok })

            } else {
                tok = await token.createtoken('El evento parece ficticio!')
                res.status(200).send({ status: 'error', statusCode: 200, message: 'El evento parece ficticio!', token: tok })
            }
        } catch (error) {
            res.status(400).send(error.toString())
        }
    },

    /**
     * cronogramaCommentList giveme a list of comments in a event
     * return [{},{},{}]
     * @param {*} req 
     * @param {*} res
     */
    async cronogramaTipoEventoList(req, res) {
        try {
            let { referencia } = req.body
            let tok = ""
            let elTipo = (typeof referencia == "undefined" || referencia == "") ? 1 : parseInt(referencia);

            let listaTipos = []
            await Db.query({
                text: queryes.cronogramaTipoEventoSelect,
                values: [elTipo]
            }).then((losRows) => {
                losRows.rows.map((losTipo) => {
                    listaTipos.push({
                        id: token.encriptar(losTipo.id),
                        descripcion: losTipo.descripcion,
                        color: losTipo.color
                    })
                })
            })

            tok = await token.createtoken(listaTipos)
            res.status(200).send({ status: 'success', statusCode: 200, message: listaTipos.length + ' Tipos de evento encontrados ', token: tok })
        } catch (error) {
            res.status(400).send(error.toString())
        }
    },

    /**
     * cronogramaComment register comment into event of calendar
     * return message or error
     * @param {*} req 
     * @param {*} res
     */
    async cronogramaComment(req, res) {
        try {
            let { reference, id_usuario, descripcion } = req.body
            let tok = ""

            //CHECK DATA FOR COMMENT TO EVENTS
            if (reference != "" && id_usuario != "" && descripcion != "") {
                id_usuario = parseInt(id_usuario) //parseInt(token.decriptar(id_usuario))
                reference = parseInt(token.decriptar(reference))
                let miQuery = {
                    text: queryes.cronogramaCommentInsert,
                    values: [reference, id_usuario, descripcion]
                }
                // console.log('Mi query: ', miQuery)

                await Db.query(miQuery)
                    .then(async (preComment) => {
                        if (preComment.rowCount > 0) {
                            tok = await token.createtoken(preComment.rowCount + ' Comentario registrado')
                            res.status(200).send({ status: 'success', statusCode: 200, message: preComment.rowCount + ' Comentario registrado', token: tok })
                        } else {
                            tok = await token.createtoken('No fue posible registrar tu comentario')
                            res.status(200).send({ status: 'error', statusCode: 200, message: 'No fue posible registrar tu comentario', token: tok })
                        }
                    })
                    .catch(async (error) => {
                        tok = await token.createtoken(error.toString())
                        res.status(400).send({ status: 'error', statusCode: 400, message: 'No fue posible registrar el evento en el cronograma', token: tok })
                    })

            } else {
                tok = await token.createtoken('y el comentario ?')
                res.status(200).send({ status: 'error', statusCode: 200, message: 'y el comentario ?', token: tok })
            }
        } catch (error) {
            res.status(400).send(error.toString())
        }
    },

    /**
     * cronogramaComment register comment to event of calendar
     * return message or error
     * @param {*} req 
     * @param {*} res
     */
    async cronogramaCommentDelete(req, res) {
        try {
            let { id_cronograma, reference, id_usuario, descripcion } = req.body
            let tok = ""

            //CHECK DATA FOR COMMENT TO EVENTS
            if (reference != "") {
                reference = parseInt(token.decriptar(id_usuario))

                await Db.query({
                    text: queryes.cronogramaCommentDelete,
                    values: [reference]
                })
                    .then(async (preComment) => {
                        if (preComment.rowCount > 0) {
                            tok = await token.createtoken(preComment.rowCount + ' Comentario eliminado')
                            res.status(200).send({ status: 'success', statusCode: 200, message: preComment.rowCount + ' Comentario eliminado', token: tok })
                        } else {
                            tok = await token.createtoken('No fue posible eliminar tu comentario')
                            res.status(200).send({ status: 'error', statusCode: 200, message: 'No fue posible eliminar tu comentario', token: tok })
                        }
                    })
                    .catch(async (error) => {
                        tok = await token.createtoken(error.toString())
                        res.status(400).send({ status: 'error', statusCode: 400, message: 'No fue posible eliminar el comentario en el cronograma', token: tok })
                    })

            } else {
                tok = await token.createtoken('y el comentario para eliminar?')
                res.status(200).send({ status: 'error', statusCode: 200, message: 'y el comentario para eliminar?', token: tok })
            }
        } catch (error) {
            res.status(400).send(error.toString())
        }
    },

    /**
     * cronogramaComment register comment to event of calendar
     * return message or error
     * @param {*} req 
     * @param {*} res
     */
    async cronogramaCommentEdit(req, res) {
        try {
            let { id_cronograma, id_comment, id_usuario, descripcion } = req.body
            let tok = ""

            //CHECK DATA FOR COMMENT TO EVENTS
            if (id_comment != "" && id_cronograma != "" && id_usuario != "" && descripcion != "") {
                id_usuario = parseInt(token.decriptar(id_usuario))
                id_cronograma = parseInt(token.decriptar(id_cronograma))
                id_comment = parseInt(token.decriptar(id_comment))

                await Db.query({
                    text: queryes.cronogramaCommentUpdate,
                    values: [id_comment, id_cronograma, id_usuario, descripcion]
                })
                    .then(async (preComment) => {
                        if (preComment.rowCount > 0) {
                            tok = await token.createtoken(preComment.rowCount + ' Comentario editado')
                            res.status(200).send({ status: 'success', statusCode: 200, message: preComment.rowCount + ' Comentario editado', token: tok })
                        } else {
                            tok = await token.createtoken('No fue posible editar tu comentario')
                            res.status(200).send({ status: 'error', statusCode: 200, message: 'No fue posible editar tu comentario', token: tok })
                        }
                    })
                    .catch(async (error) => {
                        tok = await token.createtoken(error.toString())
                        res.status(400).send({ status: 'error', statusCode: 400, message: 'No fue posible editar tu comentario', token: tok })
                    })

            } else {
                tok = await token.createtoken('y el comentario ?')
                res.status(200).send({ status: 'error', statusCode: 200, message: 'y el comentario ?', token: tok })
            }
        } catch (error) {
            res.status(400).send(error.toString())
        }
    },

    /**
     * list all comments from a question made to a teacher
     * receibe a aeconsultasdocentes_id as reference
     * return all comments at the bottom of question tag
     * @param {*} req 
     * @param {*} res
     */
    async getQuestionComments(req, res) {
        try {
            let { ano_lectivo, id_institucion, id_academico, rol, referencia } = req.body
            let query = {
                text: queryes.listAskTeacherComments,
                values: [parseInt(referencia)]
            }

            let listQueries = await Db.query(query)
            let tok = await token.createtoken(listQueries.rows);
            res.status(200).send({ status: 'success', statusCode: 200, message: listQueries.rows.length, token: tok })

        } catch (error) {
            res.status(400).send(error.toString())
        }
    },
    /**
     * insert a comment related to question made to a teacher
     * receibe a aeconsultasdocentes_id as reference
     * return legend like asignatura, pub/priv, # comments
     * @param {*} req 
     * @param {*} res
     */
    async sendQuestionComments(req, res) {
        try {
            let { ano_lectivo, id_institucion, id_academico, id_usuario, rol, referencia, comentario } = req.body
            let query = {
                text: queryes.insertAskTeacherComments,
                values: [parseInt(referencia), id_usuario, ahora, comentario]
            }
            // console.log(query)
            let listQueries = await Db.query(query)
            let tok = await token.createtoken(listQueries);
            res.status(200).send({ status: 'success', statusCode: 200, message: listQueries.rowCount, token: tok })

        } catch (error) {
            res.status(400).send(error.toString())
        }
    },

    /**
     * to get questions i sent a teacher about academic matters
     * show behind the sendert form, shown only my questions
     * 
     * @param {*} req 
     * @param {*} res 
     */
    async getQuestionTeacher(req, res) {
        try {
            let { ano_lectivo, id_institucion, id_academico } = req.body
            let interval = '180 days'

            let query = {
                text: queryes.listAskTeacher,
                values: [parseInt(ano_lectivo), parseInt(id_institucion), parseInt(id_academico)]
            }

            let listQueries = await Db.query(query)
            let tok = await token.createtoken(listQueries.rows);
            res.status(200).send({ status: 'success', statusCode: 200, message: 'datos', token: tok })

        } catch (error) {
            res.status(400).send(error.toString())
        }
    },
    /**
     * to send questions to a teacher about academic matters
     * insert into table, send advice to device and mail
     * 
     * @param {*} req  ano_lectivo,id_institucion,id_usuario,id_academico,id_docente,comunicate,asignatura,nombre_docente
     * @param {*} res 
     */
    async sendQuestionTeacher(req, res) {
        let tok = null
        let { ano_lectivo, id_institucion, id_usuario, id_academico, 
            id_docente, comunicate, asignatura, nombre_docente 
        } = req.body

        try {
            id_docente = parseInt(id_docente), id_academico = parseInt(id_academico)
            ano_lectivo = parseInt(ano_lectivo), id_institucion = parseInt(id_institucion)
            asignatura = asignatura.substring(2)

            let resp = await Db.query({
                text: queryes.insertAskTeacher,
                values: [
                    ahora, id_academico, asignatura.substring(2),
                    id_docente, id_institucion, ano_lectivo, comunicate
                ]
            });
            //LA CONSULTA FUE REGISTRADA

            if (typeof resp.rows[0].aeconsultasdocentes_id != undefined && resp.rows[0].aeconsultasdocentes_id != "") {
                let idEncriptado = token.encriptar(resp.rows[0].aeconsultasdocentes_id)

                let teacherContact = await Db.query({
                    text: `SELECT * FROM engine.contacto_teacher_one($1);`,
                    values: [id_docente]
                });

                let totalMessages = 0, totalPush = 0;
                let elBotonConsulta = generateButton.boton({ type: 'error', shape: 'square', destination: 'view_consulta/' + idEncriptado, text: ' Ver consulta ' })

                let destUsu = [], destNames = [], destMail = [], destToken = [];

                for (let i in teacherContact.rows) {

                    destNames.push(teacherContact.rows[i].docente)
                    destUsu.push(teacherContact.rows[i].aeusu_id)
                    destMail.push(teacherContact.rows[i].aedocentes_mail)
                    destToken.push(teacherContact.rows[i].telefono)
                    //if(teacherContact.rows[i].aeusu_token != null && teacherContact.rows[i].aeusu_token != ""){
                    //    destToken.push(teacherContact.rows[i].aeusu_token)
                    //}
                }

                let payload = {
                    notification: {
                        title: 'Nueva consulta para ' + nombre_docente,
                        body: token.noHTML(comunicate), //.replace(/<\/?[^>]+>/ig, " ").substring(0, 30),
                        extra: elBotonConsulta
                    },
                    data: {
                        route: 'notification?referencia=consulta',
                        index: token.encriptar(resp.rows[0].aeconsultasdocentes_id.toString())
                    }
                }


                let notificacionQuery = {
                    text: wpQueryes.saveNotifications,
                    values: [id_usuario, destUsu, ahora, payload.notification.title, comunicate, 'data.aeconsultasdocentes', resp.rows[0].aeconsultasdocentes_id, payload.data]
                }
                let respnotificacionQuery = await Db.query(notificacionQuery);

                //LIST DATABASE EMISOR
                await Db.query({
                    text: wpQueryes.myWPSessionsExtend,
                    values: [ano_lectivo,[id_institucion]]
                })
                .then(async (elEmisor) =>{   
                    elEmisor.rows[0].emisorlist.map(async (esteEmisor,e) => {
                        if(esteEmisor != null && esteEmisor != ""){
                            // console.log('esteEmisor: ', esteEmisor, contactoEstudiantes) 
                            let enlace = 'https://colarqui.edu.co'                                    
                            let preLogo = path.join(__dirname, '../', '/public/images/android-chrome-512x512.png')
                            const miLogo = MessageMedia.fromFilePath(preLogo);

                            destToken.map(async (contact) =>  {
                                if(contact.length > 9){  
                                    await wpSender.isRegistered({
                                        emisor:esteEmisor,
                                        number:contact
                                    })
                                    .then(async verificado => {
                                        if(verificado._serialized !== "" && verificado._serialized !== null && typeof verificado._serialized !== "undefined"){
                                                
                                            await wpSender.sendLinkOne({
                                                emisor: esteEmisor,
                                                sessionId: esteEmisor,
                                                idcosa: resp.rows[0].aeconsultasdocentes_id,
                                                idvotantes: id_academico,
                                                number: verificado._serialized,
                                                message: `${payload.notification.title} \n${payload.notification.body} \n\nMensaje enviado por colarqui.edu.co, para responder ingrese a ${enlace}`,
                                                type: 8,
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
                    console.log('Error myWPSessionsExtend: ', erroreo)
                })

                totalMessages = await generate.send({ name: destNames, email: destMail, message: { titulo: payload.notification.title, message: comunicate } })

                tok = await token.createtoken(' A ' + nombre_docente + ' de ' + asignatura.substring(2));

                // console.log('punto: ', tok)
                res.send({
                    status: 'success',
                    statusCode: 200,
                    message: ' A ' + nombre_docente + ' de ' + asignatura.substring(2),
                    token: tok
                })
            } else {
                //// console.log(resp)
                tok = await token.createtoken('La consulta no pudo ser enviada a ' + nombre_docente);
                res.send({
                    status: 'error',
                    statusCode: 400,
                    message: 'La consulta no pudo ser enviada a ' + nombre_docente,
                    token: tok
                })
            }

        } catch (error) {
            tok = await token.createtoken('El sistema se volvio loco con eso');
            res.send({
                status: 'error',
                statusCode: 400,
                message: 'El sistema se volvio loco con eso',
                token: tok
            })
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
            let { ano_lectivo, id_institucion, group } = req.body

            let query = {
                text: queryes.viewAsigments,
                values: [parseInt(ano_lectivo), parseInt(id_institucion), group]
            }

            let resp = await Db.query(query);
            //// console.log(resp.rows)

            let resultado = resp.rows.map(item => {
                return {
                    iddocente: item.listaasignaturas.aedocentes_id,
                    title: item.listaasignaturas.aedocente,
                    descripcion: item.listaasignaturas.aeasignaciones_asignatura,
                    enlace: item.listaasignaturas.aeasignaciones_enlace
                }
            })

            let tok = await token.createtoken(resultado);
            res.status(200).send({ status: 'success', statusCode: 200, message: 'datos', token: tok })

        } catch (error) {
            res.status(400).send(error)
        }
    }
}