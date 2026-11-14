import fs from "fs";
import cluster from "cluster";
import sticky from "sticky-session";
import * as __mod0 from "whatsapp-web.js";
import express from "express";
import bodyparser from "body-parser";
import useragent from "express-useragent";
import indexrouter from "./routes/index.js";
import cors from "cors";
import multer from "multer";
import path from "path";
import global from "./utils/notifications/socket.io/mySockets.js";
import toolWPRemote from "./utils/notifications/whatsapp/wpRomote.js";
import * as __mod1 from "socket.io";
import token from "./utils/token.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
import { fileURLToPath } from "url";
const __dirname = fileURLToPath(new URL(".", import.meta.url));
require('dotenv').config();

/*
 * RESILIENCIA DE LA CONEXION A LA BD (tunel SSH a sae12.com)
 * ---------------------------------------------------------------------------
 * La base se alcanza por el tunel SSH (ver D:\VENUS\tunel). Cuando el tunel se
 * reinicia, el socket de alguna conexion del pool muere con ECONNRESET; si el
 * error llega sin manejador, Node tumba el proceso completo y la API deja de
 * responder hasta que alguien la reinicia.
 * Estos dos manejadores registran el aviso y dejan que el pool reponga las
 * conexiones solo. Los errores de red no son un fallo de programacion: no se
 * debe matar el proceso por ellos.
 */
const CODIGOS_RED = new Set(['ECONNRESET', 'EPIPE', 'ETIMEDOUT', 'ECONNREFUSED', 'ENETUNREACH', 'EHOSTUNREACH']);
function esErrorDeRed(err) {
  if (!err) return false;
  if (CODIGOS_RED.has(err.code)) return true;
  const texto = String(err.message || '');
  return /read ECONNRESET|write EPIPE|ECONNRESET|socket hang up|Connection terminated/i.test(texto);
}
process.on('uncaughtException', (err) => {
  if (esErrorDeRed(err)) {
    console.log('Aviso: conexion a la BD interrumpida (' + (err.code || err.message) + '). El pool se reconecta solo.');
    return;
  }
  console.error('ERROR NO CAPTURADO:', err);
  process.exit(1);
});
process.on('unhandledRejection', (motivo) => {
  if (esErrorDeRed(motivo)) {
    console.log('Aviso: promesa de BD rechazada por red (' + (motivo.code || motivo.message) + '). Se reintenta en la proxima consulta.');
    return;
  }
  console.error('PROMESA RECHAZADA NO CAPTURADA:', motivo);
});
const {
  Client,
  LocalAuth
} = __mod0;
const app = express();
const PORT = process.env.PORT;
const upload = multer();
let sequenceNumberByClient = new Map();
//WHATSAPP

const notification_options = {
  priority: "high",
  timeToLive: 60 * 60 * 24
};
const mime = {
  html: 'text/html',
  txt: 'text/plain',
  css: 'text/css',
  gif: 'image/gif',
  jpg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  js: 'application/javascript'
};
const corsOpts = {
  // Permite los dominios de producción, localhost (cualquier puerto) y las IPs
  // de red privada (LAN) para poder probar desde el celular escaneando el QR.
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // mismo origen / server-side / curl
    const dominios = [
      'https://colarqui.edu.co',
      'https://test.colarqui.edu.co',
      'https://escuelapp.co',
      'https://colegiosarquidiocesanos.edu.co',
    ];
    const esLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    // Rangos privados: 10.x, 192.168.x, 172.16–31.x
    const esPrivado = /^https?:\/\/(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(origin);
    if (dominios.includes(origin) || esLocal || esPrivado) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ['PUT', 'GET', 'POST', 'DELETE', 'HEAD', 'OPTIONS'],
  exposedHeaders: ['X-Locale', 'Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With', 'Access-Control-Request-Method', 'Access-Control-Request-Headers'],
  optionsSuccessStatus: 204,
  preflightContinue: false
};

/*
  allowedHeaders: [ '*'
    //'Origin', 'X-Requested-With','Content-Type', 'Authorization', 'Accept'
    //'Origin, X-Requested-With, Content-Type, Accept','*' 'Access-Control-Allow-Origin', 'Origin', 'X-Requested-With', 'Content-Type', 'Accept'
  ],
*/

app.use(cors(corsOpts));
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());
app.use(bodyparser.json());
app.use(useragent.express());

/* app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}); */

//RUTAS PARA MOSTRAR ARCHIVOS CARGADOS POR LOS USUARIOS
app.use('/', indexrouter);
app.use('/p', express.static(path.join(__dirname, '/public')));
app.use('/p/t/', express.static(path.join(__dirname, '/public/archivos/examenes/')));
app.use('/p/w/', express.static(path.join(__dirname, '/public/archivos/tareas/')));
app.use('/p/r/', express.static(path.join(__dirname, '/public/archivos/tareasrespuestas/')));
app.use('/p/wr/', express.static(path.join(__dirname, '/public/archivos/tareasrespuestas/')));
app.use('/p/c/', express.static(path.join(__dirname, '/public/archivos/avisos/')));
app.use('/p/ex/', express.static(path.join(__dirname, '/public/archivos/excusas/')));
app.use('/p/i/', express.static(path.join(__dirname, '/public/archivos/instituciones/institucionales/')));
app.use('/p/d/m/', express.static(path.join(__dirname, '/public/archivos/instituciones/matriculas/')));
app.use('/p/e/ma/', express.static(path.join(__dirname, '/public/archivos/ejemplos/matriculaA/')));
app.use('/p/e/mb/', express.static(path.join(__dirname, '/public/archivos/ejemplos/matriculaB/')));
app.use('/p/cl/', express.static(path.join(__dirname, 'public/archivos/cronograma/')));
app.use('/public', express.static(path.join(__dirname, 'public/archivos')));
const httpServer = require('http').createServer(app);
var info = {
  port: PORT
};

/*
//SCHEDULER CONNECTION
const db = require("./database/conexpool");
db.sequelize.sync({ force: false }).then(() => {
  console.log("Drop and re-sync db.");
});
*/

//SOCKETS CONNECTIONS
const {
  Server
} = __mod1;
global.io = new Server(httpServer, {
  path: '/communication',
  cors: corsOpts
});

// Worker code
//SOCKETS LISTENER
global.io.on('connection', socket => {
  sequenceNumberByClient.set(socket, 1);
  console.log({
    connected: socket.id
  });
  socket.on("givemewplist", (myData, callback) => {
    if (myData.socketId !== "undefined" || myData.socketid !== "undefined") {
      myData.anolectivo = parseInt(myData.anolectivo);
      let misCampanas = [];
      myData.campana.map(item => {
        misCampanas.push(parseInt(item));
      });
      console.log('givemewplist: ', myData);
      toolWPRemote.emisorListCampana({
        socketId: myData.socketid,
        sessionId: myData.socketid,
        type: "campana",
        campana: misCampanas,
        anolectivo: myData.anolectivo
      });
    }
  });
  socket.on("connectnamba", data => {
    if (typeof data.socketId !== "undefined" || typeof data.socketid !== "undefined") {
      //DECRIPT CAMPANAS ID
      data.campana.forEach((item, c) => {
        data.campana[c] = parseInt(item);
      });

      // toolWPRemote.emisorSave({sessionId:data.sessionId,socketId:data.socketid,campana:data.campana,status:7})
      toolWPRemote.emisorDelete({
        sessionId: data.sessionId
      });
      toolWPRemote.sessionManager({
        sessionId: data.sessionId,
        socketId: data.socketId,
        socketid: data.socketid,
        anolectivo: data.anolectivo,
        campana: data.campana
      });

      /* 
            toolWPRemote.getClientInstance({sessionId:data.sessionId,socketId:data.socketid,campana:data.campana})
            .then(numberStatus => {
              console.log('app.js en el numberStatus: ', numberStatus)
              if(!numberStatus){
                console.log('Estamos en el index.js ', numberStatus)
                toolWPRemote.sessionManager({sessionId:data.sessionId,socketId:data.socketid,campana:data.campana});
              }
            })
            .catch(error => {
              console.log("Connectnamba: error ", error)
            })
              */
    }
  });
  socket.on('disconnect', () => {
    sequenceNumberByClient.delete(socket);
  });
});
//var httpServer = http.createServer(app);
// var httpsServer = https.createServer(credentials, app);

httpServer.listen(PORT, "0.0.0.0", elserver => {
  console.log('HTTPS Server running on port: ' + PORT, elserver);
  console.log('claveestudiante, clavedocente, claveinstitucion, 12: ', token.encriptar('Estudiante.2000'), token.encriptar('Docente.2000'), token.encriptar('Institucion.2000'), token.encriptar('12'));
  // console.log('La ruta desde app es: ', app)
});

/* app.listen(PORT, "localhost", ()=>{
  console.log('Current path: ', __dirname)
  console.log('HTTP Server running on port: '+PORT)
}) */

// https.createServer(credentials, app).listen(PORT,() => {

//   console.log('NodeSSL credentials: ', JSON.stringify(credentials))
//   console.log('NodeSSL running on port: '+PORT)
//   console.log('Current path: ', __dirname)
// });
