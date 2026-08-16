/**
 * Este archivo se ejecuta solo, no es necesario tener el API corriendo
 * te ubicas dentro de la carpeta API y ejecutas lo siguiente
 * node test/passwordEncrypt.js
 * DEBES ESPERAR BASTANTE SI ES UNA BASE DE DATOS EN OTRO SERVIDOR
 */

const Db = require('../database/conex')
const token = require('../utils/token')
const sql = require('../sql/authsql');
let cambiados = 0;
Db.query({
    text: 'SELECT aeusu_id, aeusu_llave FROM engine.aeusu WHERE aeroll_id IS NOT NULL;',
    values: [],
})
.then(results => {
    results.rows.map((item,i) =>{        
        Db.query({
            text: 'UPDATE engine.aeusu SET aeusu_llave=$2 WHERE aeusu_id=$1;',
            values: [parseInt(item.aeusu_id), token.encriptar(item.aeusu_llave)],
        })
        .then(changed =>{
            cambiados+=parseInt(changed.rowCount)
        })
    })
    console.log('Claves encriptadas: ', cambiados)
})
.catch(error =>{
    console.log('Hubo errores cambiando las claves: ', error)
})