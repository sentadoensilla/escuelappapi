import Db from "../database/conex.js";
import token from "../utils/token.js";
import sql from "../sql/authsql.js";
let cambiados = 0;
Db.query({
  text: 'SELECT aeusu_id, aeusu_llave FROM engine.aeusu WHERE aeroll_id IS NOT NULL;',
  values: []
}).then(results => {
  results.rows.map((item, i) => {
    Db.query({
      text: 'UPDATE engine.aeusu SET aeusu_llave=$2 WHERE aeusu_id=$1;',
      values: [parseInt(item.aeusu_id), token.encriptar(item.aeusu_llave)]
    }).then(changed => {
      cambiados += parseInt(changed.rowCount);
    });
  });
  console.log('Claves encriptadas: ', cambiados);
}).catch(error => {
  console.log('Hubo errores cambiando las claves: ', error);
});
