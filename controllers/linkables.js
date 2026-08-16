require('dotenv').config()
const Db = require('../database/conex');
const token =  require('../utils/token');
const {generate} = require('../utils/passworGenearte');

const alerta = require('../utils/notifications/mail/alerta');
// const pusher = require('../utils/notifications/push/firebase');

let moment = require('moment');
const ahora = moment().format('YYYY-MM-DD HH:m:s');

module.exports = {

    async showAviso(req,res){

    }
}