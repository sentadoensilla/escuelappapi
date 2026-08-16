const Db = require('../database/conex')
const token = require('../utils/token')
const sql = require('../sql/authsql');
const userWelcome = require('../utils/notifications/mail/welcome');
const encryp = require('../utils/encrypassword');

module.exports = {

    async login(req, res) {
        let { username, password } = req.body
        let resp;
        let datos_usuario;
        let cadena;
        // password = token.encriptar(password.trim())
        password = password.trim()  
        username = username.trim()        

        try {
            await Db.query({
                text: sql.verify,
                values: [username]
            }).then(async very =>{

                console.log('very.rows[0].aeusu_llave, password', very.rows[0], password)   
                if (very.rows[0].aeusu_llave == password) {
                    switch (very.rows[0].aeroll_id) {
                        case 3:
                        case 203:
                            resp = await Db.query({
                                text: sql.inicio_estudiante,
                                values: [username, very.rows[0].aeusu_llave,parseInt(very.rows[0].aeroll_id)],
                            });
                            //console.log(very.rows)
                            datos_usuario = {
                                usuarioIndex: resp.rows[0].aeroll_index,
                                usuarioEmpresaId: token.encriptar(resp.rows[0].aeinst_id),
                                usuarioAnoId: token.encriptar(resp.rows[0].aeanol_id),
                                usuarioId: token.encriptar(resp.rows[0].aeusu_id),
                                academicoId: token.encriptar(resp.rows[0].aeestudiantes_id),
                                usuarioUnion: token.encriptar(resp.rows[0].aeusuroll_id),
                                usuarioRollId: token.encriptar(resp.rows[0].aeroll_id),
                                usuarioNombre: resp.rows[0].estudiante,
                                usuarioRollNombre: resp.rows[0].aeroll_nombre,
                                usuarioGrupo: resp.rows[0].aeestudiantes_grupo,
                                usuarioGrado: resp.rows[0].aeestudiantes_grupo,
                                usuarioTelefono: resp.rows[0].aeestudiantes_telefono,
                                usuarioGenero: resp.rows[0].aeestudiantes_genero,
                                usuarioEstado: token.encriptar(resp.rows[0].aeestudiantes_estado),
                                usuarioConf: resp.rows[0].conf,
                                usuarioInstitucionNombre: resp.rows[0].aeinst_nombre,
                                empresaLema: resp.rows[0].aeinst_lema,
                                empresaEscudo: resp.rows[0].aeinst_escudo,
                                empresaTelefono: resp.rows[0].aeinst_telefono,
                                empresaMail: resp.rows[0].aeinst_mail,
                                usuarioNick: resp.rows[0].aeusu_nick,
                                usuarioEstado: resp.rows[0].aeestados_descripcion
                            }

                        break;

                        case 2:
                        case 202:
                            resp = await Db.query({
                                text: sql.inicio_Docente,
                                values: [username, very.rows[0].aeusu_llave,parseInt(very.rows[0].aeroll_id)],
                            });
                            datos_usuario = {
                                usuarioIndex: resp.rows[0].aeroll_index,
                                usuarioEmpresaId: token.encriptar(resp.rows[0].aeinst_id),
                                usuarioAnoId: token.encriptar(resp.rows[0].aeanol_id),
                                usuarioId: token.encriptar(resp.rows[0].aeusu_id),
                                academicoId: token.encriptar(resp.rows[0].aedocentes_id),
                                usuarioUnion: token.encriptar(resp.rows[0].aeusuroll_id),
                                usuarioRollId: token.encriptar(resp.rows[0].aeroll_id),
                                usuarioNombre: resp.rows[0].nombre_completo,
                                usuarioRollNombre: resp.rows[0].aeroll_nombre,
                                usuarioInstitucionNombre: resp.rows[0].aeinst_nombre,
                                empresaLema: resp.rows[0].aeinst_lema,
                                empresaEscudo: resp.rows[0].aeinst_escudo,
                                empresaTelefono: resp.rows[0].aeinst_telefono,
                                usuarioNick: resp.rows[0].aeinst_mail,
                                usuarioEstado: resp.rows[0].aeestados_descripcion
                            }
                        break;

                        case 1:
                        case 201:
                        case 207: // Coordinador
                        case 208: // Secretaria
                            await Db.query({
                                text: sql.inicio_institucion,
                                values: [username, very.rows[0].aeusu_llave,parseInt(very.rows[0].aeroll_id)]
                            })
                            .then(resp =>{
                                datos_usuario = {
                                    usuarioIndex: resp.rows[0].aeroll_index,
                                    usuarioEmpresaId: token.encriptar(resp.rows[0].aeinst_id),
                                    usuarioAnoId: token.encriptar(resp.rows[0].aeinstconf_anolectivo),
                                    usuarioId: token.encriptar(resp.rows[0].aeusu_id),
                                    academicoId: token.encriptar(resp.rows[0].aeinst_id),
                                    usuarioUnion: token.encriptar(resp.rows[0].aeusuroll_id),
                                    usuarioRollId: token.encriptar(resp.rows[0].aeroll_id),
                                    usuarioNombre: resp.rows[0].nombre_completo,
                                    usuarioRollNombre: resp.rows[0].aeroll_nombre,
                                    usuarioInstitucionNombre: resp.rows[0].aeinst_nombre,
                                    empresaLema: resp.rows[0].aeinst_lema,
                                    empresaEscudo: resp.rows[0].aeinst_escudo,
                                    empresaTelefono: resp.rows[0].aeinst_telefono,
                                    usuarioNick: resp.rows[0].aeinst_mail,
                                    usuarioEstado: resp.rows[0].aeestados_descripcion
                                }
                            })
                        break;

                        case 4:
                        case 204: //ADMIN GLOBAL PARA COLEGIOS
                            let instIDs = [], instAnol = [], instUsuid = []
                            let queryadmon = {
                                text: sql.inicio_administrador,
                                values: [username, very.rows[0].aeusu_llave,parseInt(very.rows[0].aeroll_id)]
                            }
                            resp = await Db.query(queryadmon);
                            //console.log('laqueryadmon: ', resp.rows)
                            resp.rows.map((laRow) => {
                                //ENCRIPTAR FOR THOSE KEY DATA
                                laRow.aeinst_id.map((instId) => {
                                    instIDs.push(token.encriptar(instId))
                                })
                                laRow.aeinst_aeusu_id.map((instusu) => {
                                    instUsuid.push(token.encriptar(instusu))
                                })
                                laRow.aeinst_anolectivo.map((instano) => {
                                    instAnol.push(token.encriptar(instano))
                                })
                            })

                            datos_usuario = {
                                index: resp.rows[0].aeroll_index,
                                id_institucion: instIDs,
                                id_anolectivo: instAnol,
                                id_usuario: resp.rows[0].aeusu_id,
                                idacademico: resp.rows[0].aeusu_id,
                                rol: resp.rows[0].aeroll_id,
                                name: resp.rows[0].aeusu_nombre,
                                rol_name: resp.rows[0].aeroll_nombre,
                                nombre_institucion: resp.rows[0].aeinst_nombre,
                                lema: resp.rows[0].aeinst_lema,
                                escudo: resp.rows[0].aeinst_escudo,
                                telefono: resp.rows[0].aeinst_telefono,
                                nick: resp.rows[0].aeusu_nick,
                                estado: resp.rows[0].aeestados_descripcion
                                /*                                
                                    institucion_id: JSON.stringify(instIDs),
                                    institucion_idusuario: JSON.stringify(instUsuid),
                                    institucion_nombre: JSON.stringify(resp.rows[0].aeinst_nombre),
                                    institucion_anolectivo: JSON.stringify(instAnol),
                                    institucion_direccion: JSON.stringify(resp.rows[0].aeinst_direccion),
                                    institucion_mail: JSON.stringify(resp.rows[0].aeinst_mail),
                                    institucion_telefono: JSON.stringify(resp.rows[0].aeinst_telefono),
                                    institucion_escudo: JSON.stringify(resp.rows[0].aeinst_escudo),
                                    institucion_nit: JSON.stringify(resp.rows[0].aeinst_nit),
                                    institucion_lema: JSON.stringify(resp.rows[0].aeinst_lema),
                                    institucion_descripcion: JSON.stringify(resp.rows[0].aeinst_descripcion),
                                    id_usuario:resp.rows[0].aeusu_id,
                                    name:resp.rows[0].aeusu_nombre,
                                    usuario_usuario:resp.rows[0].aeusu_nick,
                                    usuario_rol:resp.rows[0].aeroll_id,
                                    usuario_rolnombre:resp.rows[0].aeroll_nombre,
                                    usuario_estado:resp.rows[0].aeusu_estado,
                                    id_institucion: JSON.stringify(instIDs),
                                    id_anolectivo: JSON.stringify(instAnol),
                                    idacademico:resp.rows[0].aeusu_id,
                                    rol:resp.rows[0].aeroll_id,
                                    rol_name:resp.rows[0].aeroll_nombre,
                                    nombre_institucion:resp.rows[0].aeinst_nombre[0],//JSON.stringify(resp.rows[0].aeinst_nombre),
                                    escudo:JSON.stringify(resp.rows[0].aeinst_escudo),
                                    telefono:resp.rows[0].aeinst_telefono,
                                    nick:resp.rows[0].aeusu_nick,
                                    estado:resp.rows[0].aeestados_descripcion
                                                                    
                                    id_institucion:resp.rows[0].aeinst_id,
                                    id_anolectivo:resp.rows[0].aeinst_anolectivo,
                                    id_usuario:resp.rows[0].aeinst_aeusu_id,
                                    idacademico:resp.rows[0].aeusu_id,
                                    rol:resp.rows[0].aeroll_id,
                                    name:resp.rows[0].aeusu_nombre,
                                    rol_name:resp.rows[0].aeroll_nombre,
                                    nombre_institucion:resp.rows[0].aeinst_nombre[0],
                                    lema:resp.rows[0].aeinst_lema,
                                    escudo:resp.rows[0].aeinst_escudo,
                                    telefono:resp.rows[0].aeinst_telefono,
                                    nick:resp.rows[0].aeusu_nick,
                                    estado:resp.rows[0].aeestados_descripcion
                                */
                            }
                            break;
                    }

                    console.log('datos_usuario: ', datos_usuario)

                    //PRIVILEGES FOR MENUES
                    let resp2 = await Db.query({
                        text: sql.privilegees,
                        values: [parseInt(token.decriptar(datos_usuario.usuarioId))],
                    })
                    // console.log('resp2.rows: ', resp2.rows, parseInt(token.decriptar(datos_usuario.usuarioId)))


                    let miToken = await token.createtoken(datos_usuario)
                    let miMenu = await token.createtoken(resp2.rows)

                    datos_usuario.token = miToken
                    datos_usuario.privilegees = miMenu

                    if (datos_usuario.index != "" && resp2.rows.length != 0) {
                        res.send({
                            status: 'success', 
                            statusCode: 200, 
                            message: 'login correcto', 
                            rows: [{
                                privilegees: resp2.rows,
                                datos_usuario
                            }] 
                        })
                    } else {
                        res.send({ 
                            status: "fail", 
                            StatusCode: 201, 
                            message: 'El usuario no se encuentra registrado o está suspendido o fue eliminado o quién sabe...', 
                            rows: [] 
                        })
                    }
                } else {
                    res.send({ 
                        status: "fail", 
                        StatusCode: 201, 
                        message: 'El usuario no se encuentra registrado o su contraseña es incorrecta', 
                        rows: [] 
                    })
                }
            })
            .catch (async error => {
                console.log(`Error de DB: ${error}`)
                res.send({ 
                    status: "error", 
                    StatusCode: 400, 
                    message: 'Los datos no parecen estar disponibles en el momento', 
                    rows: [] 
                })
            })

        } catch (error) {
            console.log(`Error de sistema: ${error}`)
            res.send({ 
                status: "error", 
                StatusCode: 400, 
                message: 'Ocurrio un error inesperado', 
                rows: [] 
            })
        }

    },

}
