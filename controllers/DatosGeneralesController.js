require('dotenv').config()
const Db = require('../database/conex')
const token = require('../utils/token')
const queryes = require('../sql/datosGenerales.js')
const generate = require('../utils/notifications/mail/alerta')
// const generatePush = require('../utils/notifications/push/firebase')
const generateButton = require('../utils/buttons')

let moment = require('moment');
const ahora = moment().format('YYYY-MM-DD HH:mm:ss');
let tok = "";

module.exports = {
    /**
     * institucionesList giveme a list of instituciones
     * return [{},{},{}]
     * @param {*} req 
     * @param {*} res
     */
    async institucionesList(req, res) {
        try{
            let { criterio } = req.body;
            criterio = (criterio != "" && criterio != "undefined")? criterio : '%@arquidiocesanos.edu.co' ;
            await Db.query({
                text:queryes.institucionesList,
                values:[criterio]
            })
            .then(async(resultados) => {
                //MASQUERADE ID
                resultados.rows.map((elResultado, r) => {
                    resultados.rows[r].institucion_id = token.encriptar(elResultado.institucion_id)
                })

                tok = await token.createtoken(resultados.rows)
                res.send({ 
                    status: 'success', 
                    statusCode: 200, 
                    message: resultados.rows.length + ' Instituciones encontradas ', 
                    token: tok 
                })

            })
            .catch(async error =>{
                tok = await token.createtoken('Los datos experimentan errores inesperados')
                res.send({ 
                    status: 'error', 
                    statusCode: 400, 
                    message: 'Los datos experimentan errores inesperados', 
                    token: tok 
                })
            })
        }
        catch(error){
            tok = await token.createtoken('El sistema experimenta errores inesperados')
            res.send({ 
                status: 'error', 
                statusCode: 400, 
                message: 'El sistema experimenta errores inesperados', 
                token: tok 
            })
        }
    },
    /**
     * tipoPublicacionesList giveme a list of aepublicaciones_tipo
     * return [{},{},{}]
     * @param {*} req 
     * @param {*} res
     */
    async tipoPublicacionesList(req, res) {
        try{
            await Db.query({
                text:queryes.tipopublicacionesList
            })
            .then(async(resultados) => {
                //MASQUERADE ID
                resultados.rows.map((elResultado, r) => {
                    resultados.rows[r].aepublicacionestipo_id = token.encriptar(elResultado.aepublicacionestipo_id)
                })

                tok = await token.createtoken(resultados.rows)
                res.send({ 
                    status: 'success', 
                    statusCode: 200, 
                    message: resultados.rows.length + ' Datos encontradoss ', 
                    token: tok 
                })

            })
            .catch(async error =>{
                tok = await token.createtoken('Los datos experimentan errores inesperados')
                res.send({ 
                    status: 'error', 
                    statusCode: 400, 
                    message: 'Los datos experimentan errores inesperados', 
                    token: tok 
                })
            })
        }
        catch(error){
            tok = await token.createtoken('El sistema experimenta errores inesperados')
            res.send({ 
                status: 'error', 
                statusCode: 400, 
                message: 'El sistema experimenta errores inesperados', 
                token: tok 
            })
        }
    },
    /**
     * motivosList giveme a list of aemotivo
     * return [{},...]
     * @param {*} req 
     * @param {*} res
     */
    async motivosList(req, res) {
        try{
            await Db.query({
                text:queryes.listMotivos
            })
            .then(async(resultados) => {
                //MASQUERADE ID
                resultados.rows.map((elResultado, r) => {
                    resultados.rows[r].idregistro = token.encriptar(elResultado.idregistro)
                })

                res.send({ 
                    status: 'success', 
                    statusCode: 200, 
                    message: resultados.rows.length + ' Datos encontradoss ', 
                    token: resultados.rows 
                })

            })
            .catch(async error =>{
                res.send({ 
                    status: 'error', 
                    statusCode: 400, 
                    message: 'Los datos experimentan errores inesperados', 
                    token: [] 
                })
            })
        }
        catch(error){
            res.send({ 
                status: 'error', 
                statusCode: 400, 
                message: 'El sistema experimenta errores inesperados', 
                token: [] 
            })
        }
    }
}