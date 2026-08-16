var moment = require('moment-timezone');
// const ahora = moment().format('s').toString().slice(-1); //LAST SECOND

const ahora = moment().valueOf().toString().slice(-1);//LAST MILLISECOND

var datetime = new Date();
console.log('datetime, ahora: '. datetime, ahora);