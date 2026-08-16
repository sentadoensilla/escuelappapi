const Db = require('../database/conex');
const token =  require('../utils/token');
const {generate} = require('../utils/passworGenearte');
require('dotenv').config()
const alerta = require('../utils/notifications/mail/alerta');
// const pusher = require('../utils/notifications/push/firebase');

let moment = require('moment');
const ahora = moment().format('YYYY-MM-DD HH:m:s');

module.exports = {

    async updateToken(req,res){
        try{
            let {elToken,idUsuario} = req.body
            if(elToken !="" && idUsuario !="" ){
                let consulalerts = `UPDATE engine.aeusu SET aeusu_token=$2 WHERE aeusu_id=$1`;
                let query = {
                    text:consulalerts,
                    values:[idUsuario,elToken]
                }
                let resp = await Db.query(query);
                let tok = await token.createtoken(resp.rows);
                res.status(200).send({status:'success',statusCode:200,message:'Token actualizado',token:tok})
            }else{
                res.status(400).send({status:'error',statusCode:400,message:'Argumentos incompletos'})
            }
        }catch(error){
            res.status(400).send(error)
        }
    }
}