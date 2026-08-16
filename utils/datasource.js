require('dotenv').config()
const { Pool } = require('pg')
const fs = require("fs")

const connParams = require("./datasourceConst").connParams

const client = new Pool(connParams)

client.connect()
    .then(() => console.log(' postgres -> ' + client.options.host + ':' + client.options.database + ' user ' + client.options.user ))
    .catch(err => console.log('error de conexion a la DB: ', err.stack))

const Db = client;

module.exports = Db;