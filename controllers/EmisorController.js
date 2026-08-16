require('dotenv').config()
const Db = require('../database/conex')
const token = require('../utils/token')
const queryes = require('../sql/whatsapp')
//SOCKETIO
var global = require("../utils/notifications/socket.io/mySockets")
//WPEMISOR
const wp = require("../utils/notifications/whatsapp/wpRomote")
const path = require('path')

let moment = require('moment');
const ahora = moment().format('YYYY-MM-DD HH:mm:ss');

module.exports = {
    /**
     * deleteWhatsapp: Elimina un numero de whatsapp del registro
     * @param {*} req empresa, anolectivo, mynumber, socketId
     * @param {*} res message
     */
    async deleteWhatsapp(req, res) {
        try {
            let { empresa, anolectivo, mynumber, socketId } = req.body
            console.log('req.body: ', req.body)
            const phoneNumber = mynumber.toString().replace(/[- )(]/g, "");
            let eliminado = ' registro eliminado ', tok = null
            if(phoneNumber.length >= 10){
                wp.emisorDelete({sessionId: phoneNumber})

                Db.query({
                    text: queryes.getWPInfo,
                    values: [phoneNumber]
                })
                .then(async target =>{
                    if(target.rowCount>0){
                        eliminado = 'el registro no se elimino correctamente'
                    }
                })
                .catch(async error => {
                    tok = await token.createtoken(`El numero ${phoneNumber} no fue eliminado`) 
                    res.send({
                        status: "error",
                        statusCode: 400,
                        message: tok
                    });
                })

                global.io.to(socketId).emit("nambadeleted", {sessionId: phoneNumber, message: eliminado})

                tok = await token.createtoken(eliminado)           
                res.send({
                    status: "success",
                    statusCode: 200,
                    message: eliminado,
                    token: tok,
                });

            }else{
                tok = await token.createtoken(`El numero ${phoneNumber} no parece un numero correcto`) 
                res.send({
                    status: "error",
                    statusCode: 400,
                    message: `El numero ${phoneNumber} no parece un numero correcto`,
                    token: tok,
                });
            }
        } catch (error) {
            tok = await token.createtoken(`El numero ese no sabe, no responde`) 
            console.log('error: ', error)
            res.send({
                status: "error",
                statusCode: 400,
                message: `El numero ese no sabe, no responde`,
                token: tok,
            });
        }
    }

}