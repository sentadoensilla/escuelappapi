require('dotenv').config()

var fs = require('fs');

//var httpContext = require('express-http-context');//MULTITHREAD
//var privateKey  = fs.readFileSync('/etc/letsencrypt/live/test.colarqui.edu.co/privkey.pem', 'utf8');
//var certificate = fs.readFileSync('/etc/letsencrypt/live/test.colarqui.edu.co/cert.pem', 'utf8');
//var ca = fs.readFileSync('/etc/letsencrypt/live/test.colarqui.edu.co/chain.pem', 'utf8');
//var credentials = {key: privateKey, cert: certificate, ca: ca};


var cluster = require("cluster");
var sticky = require("sticky-session");
const { Client , LocalAuth } = require("whatsapp-web.js");

const express = require('express')
const app = express();
// app.use(httpContext.middleware);//MULTITHREAD
let sequenceNumberByClient = new Map();
const bodyparser = require('body-parser')
// const { admin } = require('./utils/notifications/push/firebase-conf')


var useragent = require('express-useragent')
const PORT = process.env.PORT;
const indexrouter = require('./routes/index')
const cors = require('cors');
const  multer = require('multer');
const  upload = multer();
const path = require('path')
//FOR FIREBASE
// var serviceAccount = require("./utils/notifications/push/colarqui-firebase-adminsdk-nb5ii-9fd376430a.json");
//var serviceAccount = require("./utils/notifications/push/agendaescolar-31b27-firebase-adminsdk-igtfc-717a6e16e9.json");

//SOCKETIO
var global = require("./utils/notifications/socket.io/mySockets")
//WHATSAPP
const toolWPRemote = require("./utils/notifications/whatsapp/wpRomote")


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
  origin: ['http://localhost:8080','http://localhost:4004','https://colarqui.edu.co','https://test.colarqui.edu.co','https://escuelapp.co','https://colegiosarquidiocesanos.edu.co','*'], //true, //'*', //  
  credentials: true,
  methods: ['PUT', 'GET', 'POST', 'DELETE', 'HEAD', 'OPTIONS'],
  exposedHeaders: ['X-Locale','Content-Type','Authorization','Origin','Accept','X-Requested-With','Access-Control-Request-Method','Access-Control-Request-Headers'],
  optionsSuccessStatus: 204,
  preflightContinue: false
};

/*
  allowedHeaders: [ '*'
    //'Origin', 'X-Requested-With','Content-Type', 'Authorization', 'Accept'
    //'Origin, X-Requested-With, Content-Type, Accept','*' 'Access-Control-Allow-Origin', 'Origin', 'X-Requested-With', 'Content-Type', 'Accept'
  ],
*/

app.use(cors(corsOpts))
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(bodyparser.json())
app.use(useragent.express())

/* app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}); */

//RUTAS PARA MOSTRAR ARCHIVOS CARGADOS POR LOS USUARIOS
app.use('/',indexrouter);
app.use('/p', express.static(path.join(__dirname, '/public')))
app.use('/p/t/', express.static(path.join(__dirname, '/public/archivos/examenes/')))
app.use('/p/w/', express.static(path.join(__dirname, '/public/archivos/tareas/')))
app.use('/p/r/', express.static(path.join(__dirname, '/public/archivos/tareasrespuestas/')))
app.use('/p/wr/', express.static(path.join(__dirname, '/public/archivos/tareasrespuestas/')))
app.use('/p/c/', express.static(path.join(__dirname, '/public/archivos/avisos/')))
app.use('/p/ex/', express.static(path.join(__dirname, '/public/archivos/excusas/')))
app.use('/p/i/', express.static(path.join(__dirname, '/public/archivos/instituciones/institucionales/')))
app.use('/p/d/m/', express.static(path.join(__dirname, '/public/archivos/instituciones/matriculas/')))
app.use('/p/e/ma/', express.static(path.join(__dirname, '/public/archivos/ejemplos/matriculaA/')))
app.use('/p/e/mb/', express.static(path.join(__dirname, '/public/archivos/ejemplos/matriculaB/')))
app.use('/p/cl/', express.static(path.join(__dirname, 'public/archivos/cronograma/')))


const httpServer = require('http').createServer(app);
var info = {port: PORT};

//SOCKETS CONNECTIONS
const { Server } = require("socket.io")
global.io = new Server(httpServer, {
  path: '/communication',
  cors: corsOpts
})

// ADAPTER CONF MULTICORE
const redisAdapter = require("socket.io-redis");
global.io.adapter(
    redisAdapter({
        host:"localhost",
        port:6379
    })
);

if (!sticky.listen(httpServer, info.port)) {
  // Master code
  httpServer.once("Running: ", () => {
      console.log(`# HTTP Server running on port: ${PORT} port`);
  });
}
else {
  // Worker code
  //SOCKETS LISTENER
  global.io
  .on('connection', (socket) => {
    console.log({ connected: socket.id, worker: cluster.worker.id })
    sequenceNumberByClient.set(socket, 1)
    
    socket.on("givemewplist", (myData, callback) => {
      if(myData.socketId !== "undefined" || myData.socketid !== "undefined"){
        myData.anolectivo = parseInt(myData.anolectivo)
        let misCampanas = []
        myData.campana.map(item => {
            misCampanas.push(parseInt(item))
        })
        console.log('givemewplist: ', myData)
        toolWPRemote.emisorListCampana({
          socketId:myData.socketid,
          sessionId:myData.socketid,
          type:"campana",
          campana:misCampanas,
          anolectivo:myData.anolectivo
        })
      }  
    }) 
  

    socket.on("connectnamba", (data) => {
      if(data.socketId !== "undefined" || data.socketid !== "undefined"){
        //DECRIPT CAMPANAS ID
        data.campana.forEach((item,c) => {
          data.campana[c] = parseInt(item)
        })

        toolWPRemote.emisorSave({sessionId:data.sessionId,socketId:data.socketid,campana:data.campana,status:7})
        toolWPRemote.sessionManager({sessionId:data.sessionId,socketId:data.socketId,socketid:data.socketid,anolectivo:data.anolectivo,campana:data.campana});
        
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
    })  

    socket.on('disconnect', () => {
      sequenceNumberByClient.delete(socket);
    });

  });
}



//app.use('/public', express.static(path.join(__dirname,'public/archivos')))

//var httpServer = http.createServer(app);
// var httpsServer = https.createServer(credentials, app);

// httpsServer.listen(PORT, "0.0.0.0", (elserver)=>{
//   console.log('HTTPS Server running on port: '+PORT, elserver)
//   console.log('La ruta desde app es: ', app)
// });

/* app.listen(PORT, "localhost", ()=>{
  console.log('Current path: ', __dirname)
  console.log('HTTP Server running on port: '+PORT)
}) */

// https.createServer(credentials, app).listen(PORT,() => {

//   console.log('NodeSSL credentials: ', JSON.stringify(credentials))
//   console.log('NodeSSL running on port: '+PORT)
//   console.log('Current path: ', __dirname)
// });