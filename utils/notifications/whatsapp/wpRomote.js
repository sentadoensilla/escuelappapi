require("dotenv").config()
const fs = require('fs')
const path = require("path");

// const util = require('util')
const Db = require("../../datasource")
const token = require("../../token")
const queryes = require("../../../sql/whatsapp")
const {
    default: makeWASocket,
    MessageType,
    MessageOptions,
    Mimetype,
    DisconnectReason,
    BufferJSON,
    AnyMessageContent,
    delay,
    fetchLatestBaileysVersion,
    isJidBroadcast,
    makeCacheableSignalKeyStore,
    makeInMemoryStore,
    MessageRetryMap,
    useMultiFileAuthState,
    msgRetryCounterMap,
} = require("@whiskeysockets/baileys");
const qrcode = require("qrcode");
const LZString = require('lz-string');


// var global = require("./wpEmisor")
const SESSION_FILE_PATH = process.env.APP_WP_SESSION_PATH
let sessionData;
if(fs.existsSync(SESSION_FILE_PATH)){
    sessionData = SESSION_FILE_PATH
    global.sessionData = sessionData
}

const log = (pino = require("pino"));
const { session } = { session: "SESSION_FILE_PATH" };
const { Boom } = require("@hapi/boom");

const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');
const { Console } = require("console")

let store;
let sock;
let qrDinamic;
let soket;


module.exports = {
    /**
     * senderDirectory: CREATE DIRECTORY FOR SENDER SESSION
     * senderDirectory: @param myData:{sessionId: WHATSAPP NUMBER}
     * @param {*} myData 
     * @returns 
     */
    async senderDirectory(myData) {
        if (!fs.existsSync(SESSION_FILE_PATH+"/"+myData.sessionId)) {
            fs.mkdirSync(SESSION_FILE_PATH+"/"+myData.sessionId, { recursive: true });
        }
        return fs.existsSync(SESSION_FILE_PATH+"/"+myData.sessionId);      
    },

    /**
     * senderDirectoryRm: DELETE DIRECTORY FOR SENDER SESSION
     * senderDirectoryRm: @param myData:{sessionId: WHATSAPP NUMBER}
     * @param {*} myData 
     * @returns 
     */
    async senderDirectoryRm(myData) {
        if (fs.existsSync(SESSION_FILE_PATH+"/"+myData.sessionId)) {
            fs.rmSync(SESSION_FILE_PATH+"/"+myData.sessionId, { recursive: true, force: true  });
        }
        return fs.existsSync(SESSION_FILE_PATH+"/"+myData.sessionId);      
    },

    /** 
     * RETURN TRUE OR FALSE FOR WHATSAPP NUMBER IF EXIST
     * getClientInstance({
     *  campana:[] LOS ID DE LAS CAMPANAS QUE QUIEREN SABER SUS NUMEROS
     *  sessionId: numero telefonico
     * })
     */ 
    async getClientInstance(myData){

        if(!myData.sessionId) return ({status:"invalid", message:`Dame un numero de whatsapp, no seas malo: ${myData.sessionId}`});
        let alreadyClient = false, message = "fail"
        let buscado = global.clientSessionStore.hasOwnProperty(myData.sessionId)
        
        // console.log('getClientInstance Definiendo el buscado: ', typeof buscado)
        if(!buscado){
            await module.exports.sessionManager({
                sessionId: myData.sessionId,
                socketId: myData.socketId,
                campana: myData.campana
            })
            .then(elClient =>{
                global.clientSessionStore[myData.sessionId] = elClient
                console.log('getClientInstance: ', {sessionId: myData.sessionId, message: message})
                module.exports.emisorStatus({sessionId: myData.sessionId, message: message})
                message = "conectado"
                alreadyClient = true
                // console.log('getClientInstance UNDEFINED status del numero: ', message, typeof global.clientSessionStore[myData.sessionId])
            })
            .catch(elerror =>{
                message = "fail"
                alreadyClient = false                
                // console.log('getClientInstance OTRO status del numero: ', myData.sessionId, message, elerror)

            })           

            return alreadyClient;
        }

        return alreadyClient;
    },

    // INIT OR RETURN THE WHATSAPP SESSION FOR A NUMBER
    /**
     * sessionManager: INIT OR RETURN THE WHATSAPP SESSION FOR A NUMBER, into global.clientSessionStore.  SOME INTERNAL PROCEDURES LIKE RECEIVE MESSAGES, QR EMITS, AUTH OR FAILURE
     * @param {*} myData 
     * @returns 
     */
    async sessionManager(myData){
        // SAVING SOCKETID FOR ALL WHATSAPP CAMPANAS
        let checkDestDirectory = await module.exports.senderDirectory(myData);

        let myEmisor = await module.exports.emisorSaveToken(myData)
        const { state, saveCreds } = await useMultiFileAuthState(SESSION_FILE_PATH+"/"+myData.sessionId+"/");

        sock = makeWASocket({
            printQRInTerminal: true,
            auth: state,
            logger: log({ level: "silent" }),
        });

        
        sock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect, qr } = update;
            qrDinamic = qr;
            console.log(`connection: ${connection} lastDisconnect: ${lastDisconnect} qr: ${qr} `);
            
            if (connection === "close") {
                let reason = new Boom(lastDisconnect.error).output.statusCode;
                if (reason === DisconnectReason.badSession) {
                    console.log(`Bad Session File, Please Delete ${session} and Scan Again`);
                    sock.logout();

                } else if (reason === DisconnectReason.connectionClosed) {
                    console.log("Conexión cerrada, reconectando....");
                    module.exports.sessionManager(myData);
                } else if (reason === DisconnectReason.connectionLost) {
                    console.log("Conexión perdida del servidor, reconectando...");
                    module.exports.sessionManager(myData);
                } else if (reason === DisconnectReason.connectionReplaced) {
                    console.log("Conexión reemplazada, otra nueva sesión abierta, cierre la sesión actual primero");
                    sock.logout();
                } else if (reason === DisconnectReason.loggedOut) {
                    console.log(`Dispositivo cerrado, elimínelo ${session} y escanear de nuevo.`);
                    sock.logout();
                } else if (reason === DisconnectReason.restartRequired) {
                    console.log("Se requiere reinicio, reiniciando...");
                    module.exports.sessionManager(myData);
                } else if (reason === DisconnectReason.timedOut) {
                    console.log("Se agotó el tiempo de conexión, conectando...");
                    module.exports.sessionManager(myData);
                } else {
                    sock.end(`Motivo de desconexión desconocido: ${reason}|${lastDisconnect.error}`);
                }
            }
            else if (connection == undefined) {
                myData.requirement = 'qr'
                myData.qr = (qr != undefined)? qr : '' ;
                await module.exports.updateQR(myData);
                console.log("sock.ev.on conexión undefined");
                return;
            }            
            else if (connection === "open") {
                console.log("conexión abierta");
                return;
            }
        });
        

        sock.ev.on("messages.upsert", async ({ messages, type }) => {
            try {
                if (type === "notify") {
                    if (!messages[0]?.key.fromMe) {
                        const captureMessage = messages[0]?.message?.conversation;
                        const numberWa = messages[0]?.key?.remoteJid;

                        const compareMessage = captureMessage.toLocaleLowerCase();

                        if (compareMessage === "ping") {
                            await sock.sendMessage(
                                numberWa,
                                {  text: "Pong",},
                                { quoted: messages[0],}
                            );
                        }
                        else{
                            await sock.sendMessage(
                                numberWa,
                                {text: "Soy un robot",},
                                {quoted: messages[0],}
                            );
                        }
                    }
                }
            }catch(error){
                console.log("error ", error);
            }
        });
        
        sock.ev.on("creds.update", saveCreds);
        
    },

    /**
     * isConnected: check connection status for a myData.sessionId
     * @param {*} myData 
     * @returns 
     */
    async isConnected(myData){
        // return sock?.user ? true : false;
        return global.clientSessionStore[myData.sessionId]?.user ? true : false;
    },


    /**
     * updateQR: saca los codigos qr para conectar el whatsapp
     * @param {*} myData 
     */
    async updateQR(myData){
        switch (myData.requirement) {
            case "qr":
                await module.exports.emisorStatus({socketId: myData.socketId, sessionId: myData.sessionId, message: myData.requirement})
                let allemisorInfo = await module.exports.emisorListNone(myData)
                let emisorInfo = allemisorInfo.filter(emisores => emisores.emisor == myData.sessionId)            
                const compressedNamba = LZString.compressToEncodedURIComponent(myData.sessionId||emisorInfo.emisor);
                // ARREGLAR EL DESORDER DE SOCKETID, TAL VEZ NO PONERLE IF PARA ACTUALIZARLO AYUDE


                qrcode.toDataURL(qrDinamic, {
                    errorCorrectionLevel: 'L', // más espacio disponibleversion: 10
                    version: 10 // puedes subirlo si sigue fallando, hasta 40
                    }, 
                    (err, url) => {
                        console.log(`myData.qr: ${myData.qr} url: ${url}`)
                        global.io.to(emisorInfo.token||myData.socketId).emit(
                            "qr", {
                                message: myData.qr||url, 
                                namba: myData.sessionId||emisorInfo.emisor
                            }
                        )
                        global.io.to(emisorInfo.token||myData.socketId).emit(
                            "log", {
                                message: "QR recibido , scan", 
                                namba: myData.sessionId||emisorInfo.emisor
                            }
                        )
                    }
                );
            break;
            case "connected":
                soket?.emit("qrstatus", "./assets/check.svg");
                soket?.emit("log", " usaario conectado");
                const { id, name } = sock?.user;
                var userinfo = id + " " + name;
                soket?.emit("user", userinfo);
            break;
            case "loading":
                soket?.emit("qrstatus", "./assets/loader.gif");
                soket?.emit("log", "Cargando ....");
            break;
            default:
            break;
        }
    },

    /**
     * sessionRestore: TRY TO RESTORE THE WHATSAPP SESSION FOR A NUMBER, into global.clientSessionStore.  SOME INTERNAL PROCEDURES LIKE RECEIVE MESSAGES, QR EMITS, AUTH OR FAILURE
     * @param {*} myData 
     * @returns 
     */
    async sessionRestore(myData){
        // SAVING SOCKETID FOR ALL WHATSAPP CAMPANAS
        // let myEmisor = await module.exports.emisorSaveToken(myData)
        console.log('into sessionRestore: ', myData)

        const client = new Client({
            puppeteer: {
                headless: true,
                executablePath: '/usr/bin/google-chrome-stable',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu',
                ],
            },
            authStrategy: new RemoteAuth({
                clientId: myData.sessionId,
                store,
                backupSyncIntervalMs: 60000,
            }),
        })
/* 
        client.on('qr', async (code) => {
            await module.exports.emisorStatus({socketId: myData.socketId, sessionId: myData.sessionId, message: "qr"})
            // GET LIST OF WHATSAPP IN DB
            let allemisorInfo = await module.exports.emisorListNone(myData)
            let emisorInfo = allemisorInfo.filter(emisores => emisores.emisor == myData.sessionId)            
            // ARREGLAR EL DESORDER DE SOCKETID, TAL VEZ NO PONERLE IF PARA ACTUALIZARLO AYUDE
            global.io.to(emisorInfo.token||myData.socketId).emit("qr", {message: code, namba: myData.sessionId||emisorInfo.emisor})
        });
 */
        client.on('authenticated', async () => {
            await module.exports.emisorStatus({socketId: myData.socketId, sessionId: myData.sessionId, message: "conectado"})
            global.clientSessionStore[myData.sessionId] = client
            console.log('AUTHENTICATED: ', global.clientSessionStore[myData.sessionId])
        });

        client.on('ready', async () => {
            await module.exports.emisorStatus({socketId: myData.socketId, sessionId: myData.sessionId, message: "ready"})
            global.clientSessionStore[myData.sessionId] = client
            console.log('READY: ', global.clientSessionStore[myData.sessionId])
        })

        client.on('auth_failure', async (msg) => {
            // SEND STATUS TO SOCKET CLIENT TO SHOW ON APP
            await module.exports.emisorStatus({socketId: myData.socketId, sessionId: myData.sessionId, message: "fail"})
            const allemisorInfo = await module.exports.emisorListNone(myData)
            const emisorInfo = allemisorInfo.filter(emisores => emisores.emisor == myData.sessionId)
            global.io.to(myData.socketId||emisorInfo.token).emit("nambalistado", {list: allemisorInfo, namba: emisorInfo.emisor})
            console.log('AUTH FAIL: ', global.clientSessionStore[myData.sessionId])
        
        });

        client.initialize();
        return client;
    },

    /**
     * emisorStatus: CHANGE WHATSAPP STATUS ON DATABASE
     * @param {*} myData:{
     *  sessionId: WHATSAPP NUMBER
     *  message: conectado||other
     * } save in postgres
     * not return
     */
    async emisorStatus(myData){
        if(typeof myData.sessionId !== undefined){
            let theState = 7
            let myState = (myData.message=="conectado"||myData.message=="ready")? 6 : 7;

            theState = (await module.exports.isConnected(myData))? 6 : 7 ;

            console.log('emisorStatus: ', myData.sessionId,myData.message,myState,myData.socketId)
            // save status on database
            await Db.query({
                text: queryes.setWPStatus,
                values: [myData.sessionId,myState,myData.socketId]
            })
            
            return theState;
        }        
    },

    /**
     * emisorSaveToken: Register socket id for all whatsapp numbers into DB
     * @param {*} myData:{
     *  sessionId: WHATSAPP NUMBER
     *  message: conectado||other
     * } save in postgres
     * return list of whatsapp [idemisor,fecharegistro,estado,idcampana,emisor,token]
     */
    async emisorSaveToken(myData){
        if(typeof myData.socketId !== undefined && myData.socketId !== "" &&
            typeof myData.campana !== undefined && myData.campana !== ""
        ){
            console.log('emisorSaveToken: nos llega: ', myData)

            await Db.query({
                text: queryes.WPsaveSocket,
                values: [myData.campana,myData.socketId]
            })
            .then(results =>{
                console.log('emisorSaveToken: Guardando el token: ', myData, results.rows)
                return results.rows
            })
            .catch(error =>{
                return []
            })
        }else{
            return []
        }
    },

    /**
     * emisorSave: STORE ROWS IN POSTGRES, DIRECTORY IN wwebjs_auth, DOC IN MONGO
     * emisorSave: @param {*} myData:{
     *  sessionId: WHATSAPP NUMBER
     * } delete in postgres, rm in wwebjs_auth, delete in mongo 
     * not return
     */
    async emisorSave(myData){
        // console.log('emisorSave: ', myData)
        if(
            typeof myData.sessionId !== undefined
            && typeof myData.campana !== undefined
        ){
            const misCampanas = []
            myData.campana.forEach(async item => {
                await Db.query({
                    text:queryes.setWPSession,
                    values:[item,myData.sessionId,myData.socketId||null,6]
                })
            })
        }
    },

    /**
     * emisorDelete: DELETE ROWS IN POSTGRES, DIRECTORY IN wwebjs_auth, DOC IN MONGO
     * emisorDelete: @param {*} myData:{
     *  sessionId: WHATSAPP NUMBER
     * } delete in postgres, rm in wwebjs_auth, delete in mongo 
     * not return
     */
    async emisorDelete(myData){
        if(typeof myData.sessionId !== undefined){
            //DELETE DATABASE RECORD
            await Db.query({
                text: queryes.deleteWPRegistry,
                values: [myData.sessionId]
            })
            .then(async deleted =>{
                if(deleted.rowCount>0){
                    //DELETE INSTANCE IN GLOBAL OBJECT
                    delete global.clientSessionStore[myData.sessionId];
                    await senderDirectoryRm({path: sessionData, session: myData.sessionId})

                    const aEliminar = SESSION_FILE_PATH+'/RemoteAuth-'+myData.sessionId

                    if(fs.existsSync(aEliminar)){
                        //DELETE SESSION DIRECTORY
                        fs.rmdir(aEliminar, { recursive: true, force: true }, err => {
                            if (err) {
                                console.log('Hubo errores al borrar la carpeta '+err.toString())
                            }
                        });
                    }
                }
            })            
        }
    },

    /**
     * emisorList: LIST OF WHATSAPP NUMBERS IN MY CAMPANA WITH STATUS
     * emisorList: @param {*} myData:{
     *  sessionId: WHATSAPP NUMBER
     * } delete in postgres, rm in wwebjs_auth, delete in mongo 
     * return: [{idemisor,idcampana,emisor,status,token},...]
     */
    async emisorList(myData){

        if(typeof myData.campana !== undefined){
            let listaNumeros = []
            //LIST DATABASE EMISOR
            await Db.query({
                text: queryes.myWPSessions,
                values: [myData.campana]
            })
            .then(response =>{
                // MAP WHATSAPP NUMBER AND CHECK STATUS
                response.rows.map(async (item,i) =>{
                    // console.log('mapeando ', i, item)
                    let nambaStatus = 7, nambaStatuslabel = "desconectado"  
                    await module.exports.senderDirectoryRm({session: item.emisor})
                    .then(async elNamba =>{
                        // console.log('emisorList buscando en mongo: ', elNamba)
                        if(elNamba){
                            nambaStatus = 6
                            nambaStatuslabel = "conectado" 
                        }
                        response.rows[i].status = nambaStatus
                        console.log('emisorList: ', {sessionId: item.emisor, message: nambaStatuslabel})
                        await module.exports.emisorStatus({sessionId: item.emisor, message: nambaStatuslabel})
                    })                    
                    
                }) 
                listaNumeros = response.rows
            })
            .catch(error =>{
                console.log('emisorList POSTGRESQL : ', error.toString())
                listaNumeros = []
            })

            return listaNumeros
        }
    },    

    
    // LISTS WHATSAPP STATUS ON DATABASE LATER SHOW ON APP
    /**
     * emisorListNone: LIST OF WHATSAPP NUMBERS IN MY CAMPANA WITH STATUS
     * emisorList: @param {*} myData:{
     *  sessionId: WHATSAPP NUMBER
     * } delete in postgres, rm in wwebjs_auth, delete in mongo 
     * return: [{idemisor,idcampana,emisor,status,token},...]
     */
    async emisorListNone(myData){
        if(typeof myData.campana !== undefined){
            let listaNumeros = []
            //LIST DATABASE EMISOR
            await Db.query({
                text: queryes.myWPSessions,
                values: [myData.campana]
            })
            .then(response =>{
                response.rows.map( async(item,i) =>{
                    // console.log('getState from: ', global.clientSessionStore[item.emisor]?.getState() )
                    response.rows[i].idemisor = token.encriptar(item.idemisor)
                    response.rows[i].idcampana = token.encriptar(item.idcampana)
                })

                listaNumeros = response.rows
            })
            .catch(error =>{
                listaNumeros = []
            })

            return listaNumeros
        }
    },  

    // LISTS WHATSAPP STATUS ON DATABASE LATER SHOW ON APP
    /**
     * emisorListExtend: LIST OF WHATSAPP NUMBERS IN MY CAMPANA WITH STATUS
     * emisorListExtend: @param {*} myData:{
     *  campana: id de la campana
     * return: [{idemisor,idcampana,emisor,status,token,...}]
     */
    async emisorListExtend(myData){
        // console.log('emisorListExtend: ', myData)
        if(typeof myData.campana !== undefined){
            //LIST DATABASE EMISOR
            await Db.query({
                text: queryes.myWPSessionsExtend,
                values: [myData.campana]
            })
            .then(response =>{
                // console.log('emisorListExtend response: ', response)
                return response.rows
            })
            .catch(error =>{
                return []
            })
        }else{
            return []
        }
    }, 

    /** 
     * LISTS WHATSAPP STATUS ON DATABASE LATER SHOW ON APP
     * emisorListCampana: 
     * emisorListCampana({
     *  campana:[] LOS ID DE LAS CAMPANAS QUE QUIEREN SABER SUS NUMEROS
     *  sessionId: token socketid para enviar la respuesta
     * })
     */ 
    async emisorListCampana(myData){
        if(typeof myData.campana !== undefined){
            let listaNumeros = []
            let elsocketId  = null
            //LIST DATABASE EMISOR
            await Db.query({
                text: queryes.myWPSessions,
                values: [myData.campana]
            })
            .then(response =>{
                
                // MAP WHATSAPP NUMBER AND CHECK STATUS
                response.rows.map( async(item,i) =>{
                    // default is not connected
                    let nambaStatus = 7, nambaStatuslabel = "desconectado"
                    
                    await module.exports.isConnected(myData)
                    .then(async elNamba =>{
                        
                        if(elNamba){
                            console.log('emisorListCampana sessionRestore: ', {sessionId:item.emisor},{myData})
                            //WHEN SESSION EXISTS TRY RECOVER TO GLOBALSESSIONSTORE
                            await module.exports.sessionManager({sessionId:item.emisor,socketId:myData.socketId})
                            nambaStatus = 6
                            nambaStatuslabel = "conectado"
                        }
                        response.rows[i].status = nambaStatus
                        console.log('emisorListCampana: ', {sessionId: item.emisor, message: nambaStatuslabel})
                        await module.exports.emisorStatus({sessionId: item.emisor, message: nambaStatuslabel})
                    })
                    
                    response.rows[i].idemisor = token.encriptar(item.idemisor)
                    response.rows[i].idcampana = token.encriptar(item.idcampana)
                    elsocketId = item.token
                    
                })
                
                listaNumeros = response.rows
                // console.log('Recibimos en el emisorListCampana: ', elsocketId, myData)
            })
            .catch(error =>{
                // console.log('Error en la lista de numeros: ', error.toString())
                listaNumeros = []
            })

            // console.log('Pidieron listado: ', {sessionId: myData.sessionId, list: listaNumeros})
            global.io.to(myData.socketId||elsocketId).emit("nambalistado", {sessionId: myData.sessionId, list: listaNumeros})
            return listaNumeros
        }
    },

    // LISTS WHATSAPP STATUS ON DATABASE LATER SHOW ON APP
    /**
     * emisorAll: INIT ALL WHATSAPP SESSION, SHOULD INVOQUE IT AT BACKEND START
     * emisorList: RETURN ANYTHING
     */
    async emisorAll(){
        try{
            let listaNumeros = []
            //LIST DATABASE EMISOR
            await Db.query({
                text: queryes.allWPSessions,
            })
            .then(response =>{
                response.rows.map(async (item,i) =>{
                    // console.log('Buscando ', item.emisor)
                    if(!global.clientSessionStore[item.emisor]){
                        // console.log('Enganchando ', item.emisor)
                        await module.exports.sessionManager({sessionId:item.emisor,socketId:item.emisor,campana:item.idcampana})
                    }
                })
                listaNumeros = response.rows
            })
            .catch(error =>{
                listaNumeros = []
            })
        }
        catch(error){
            console.log('Hubo un error tratando de recuperar los whatsapp emisores '+error.toString())          
        } 
    },

    // SEND IMAGE TO SOMEONE
    /**
     * sendImageOne: SEND ONE IMAGE TO WHATSAPP
     * props: {number:whatsapp number as string,imagen:PATH as string,descripcion: message about image}
     * emisorList: RETURN {}
     */    
    async sendImageOne(props){
        try{
            // console.log('propiedades recibidas: ', props)
            // const { MessageMedia } = require('whatsapp-web.js');
            // const media = MessageMedia.fromFilePath(props.image);

            const sanitized_number = props.number.toString().replace(/[- )(]/g, ""); // remove unnecessary chars from the number
            let final_number = ''
            if(sanitized_number.length > 10){
                final_number = `${sanitized_number.replace('+','')}`+'@c.us'; // add 91 before the number here 91 is country code of colombia
            }else{
                final_number = `57${sanitized_number.substring(sanitized_number.length - 10).replace('+','')}`+'@c.us'; // add 91 before the number here 91 is country code of colombia
            }
            // console.log('propiedades recibidas: ', final_number, props)

            await global.clientSessionStore[props.emisor].sendMessage(
                final_number, props.image, {caption: props.descripcion}
            )// send message
            .then(async sendMessageData =>{
                // ACA REGISTRAMOS EL LOG QUE LE ENVIAMOS EL REGISTRO
                console.log('Si se lo mandamos: ', sendMessageData)                    
                const messagesDetails = {
                    id:sendMessageData.id,
                    from:sendMessageData.from,
                    to:sendMessageData.to,
                    caption:sendMessageData._data.caption,
                    hasMedia:sendMessageData.hasMedia,
                    type:sendMessageData.type,
                    timestamp:sendMessageData.timestamp
                }
                await Db.query({
                    text:queryes.enviosHistory,
                    values:[
                        props.idcosa,
                        props.campana,
                        props.idvotantes,
                        props.emisor,
                        props.type,
                        sendMessageData._data?.isNewMsg,
                        JSON.stringify(messagesDetails)
                    ]
                })
            })
            .catch(async error =>{
                const messagesDetails = {
                    error:error.toString()
                }
                console.log('catcn no se lo mandamos: ', messagesDetails)  
                await Db.query({
                    text:queryes.enviosHistory,
                    values:[
                        props.idcosa,
                        props.campana,
                        props.idvotantes,
                        props.emisor,
                        props.type,
                        false,
                        JSON.stringify(messagesDetails)
                    ]
                })
            })
        }catch(error){
            // ACA MARCAMOS EL PERSONAL COMO QUE NO TIENE WHATSAPP
            // console.log(final_number, "El numero no tiene cuenta de whatsapp");
            const messagesDetails = {
                error:error.toString()
            }
            console.log('try NO se lo mandamos: ', props, error.toString())  
            await Db.query({
                text:queryes.enviosHistory,
                values:[
                    props.idcosa,
                    props.campana,
                    props.idvotantes,
                    props.emisor,
                    props.type,
                    false,
                    JSON.stringify(messagesDetails)
                ]
            })
        }
    },

    /**
     * isRegistered: CHECK IF NUMBER IS REGISTERED IN WHATSAPP
     * props: {number:whatsapp number as string,emisor:whatsapp account from campana}
     * emisorList: RETURN {}
     */    
    async isRegistered(props){
        try{
            const sanitized_number = props.number.toString().replace(/[- )(]/g, ""); // remove unnecessary chars from the number
            let final_number = ''
            if(sanitized_number.length > 10){
                final_number = `${sanitized_number.replace('+','')}`+'@c.us'; // add 91 before the number here 91 is country code of colombia
            }else{
                final_number = `57${sanitized_number.substring(sanitized_number.length - 10).replace('+','')}`+'@c.us'; // add 91 before the number here 91 is country code of colombia
            }
            // console.log('propiedades recibidas: ', final_number, props)

            await global.clientSessionStore[props.emisor].isRegisteredUser(final_number)// send message
            .then(response =>{
                // ACA REGISTRAMOS EL LOG QUE LE ENVIAMOS EL REGISTRO
                return response
            })
            .catch(async error =>{
                console.log('isRegistered: ', error.toString())
            })
        }catch(error){
            // NO SE PUDO
            console.log('TRY isRegistered: ', error.toString())
        }
    },


    // SEND TEXT AND LINK TO SOMEONE
    /**
     * sendLinkOne: SEND ONE IMAGE TO WHATSAPP
     * props: {
     *  emisor: whatsapp sender number as string,
     *  sessionId: same editor
     *  link: link as string,
     *  descripcion: message about link,     *
     *  idcosa: idregistro of thing to share,
     *  idvotantes: idregistro of target
     *  campana: idregistro of campana
     * }
     * RETURN {}
     */    
    async sendLinkOne(props){
        let enviado = false
        try{
            const sanitized_number = props.number.toString().replace(/[- )(]/g, ""); // remove unnecessary chars from the number
            let final_number = ''
            props.type = (typeof props.type !== "undefined" && props.type !== "" && props.type !== null) ? parseInt(props.type) : 1 ;

            if(sanitized_number.length > 10){
                final_number = `${sanitized_number.replace('+','')}`+'@c.us'; // add 91 before the number here 91 is country code of colombia
            }else{
                final_number = `57${sanitized_number.substring(sanitized_number.length - 10).replace('+','')}`+'@c.us'; // add 91 before the number here 91 is country code of colombia
            }
            // console.log('propiedades recibidas: ', final_number, props)


            await global.clientSessionStore[props.emisor].sendMessage(
                final_number, props.image, {caption: props.message, linkPreview: true, sendVideoAsGif: true}
                // final_number, props.message, { linkPreview: true, sendVideoAsGif: true}
            )// 
            .then(async sendMessageData =>{
                // ACA REGISTRAMOS EL LOG QUE LE ENVIAMOS EL REGISTRO
                // console.log('Si se lo mandamos: ', sendMessageData)
                enviado = true
                const messagesDetails = {
                    id:sendMessageData.id,
                    from:sendMessageData.from,
                    to:sendMessageData.to,
                    caption:sendMessageData._data.caption,
                    hasMedia:false,
                    type:props.type, // 1: consentimiento, 2: publicidad, 3: volantes
                    timestamp:sendMessageData.timestamp
                }
                // let elLog = 
                // console.log('EL log: ', elLog)

                await Db.query({
                    text:queryes.enviosHistory,
                    values:[
                        props.idcosa,
                        props.campana,
                        props.idvotantes,
                        props.emisor,
                        props.type,
                        enviado,
                        JSON.stringify(messagesDetails)
                    ]
                })
                return enviado
            })
            .catch(async error =>{
                const messagesDetails = {
                    error:error.toString()
                }

                await Db.query({
                    text:queryes.enviosHistory,
                    values:[
                        props.idcosa,
                        props.campana,
                        props.idvotantes,
                        props.emisor,
                        props.type,
                        enviado,
                        JSON.stringify(messagesDetails)
                    ]
                })
                return enviado
            })
        }catch(error){
            // ACA MARCAMOS EL PERSONAL COMO QUE NO TIENE WHATSAPP
            // console.log(final_number, "El numero no tiene cuenta de whatsapp");
            const messagesDetails = {
                error:error.toString()
            }
            await Db.query({
                text:queryes.enviosHistory,
                values:[
                    props.idcosa,
                    props.campana,
                    props.idvotantes,
                    props.emisor,
                    props.type,
                    enviado,
                    JSON.stringify(messagesDetails)
                ]
            })
            return enviado
        }
    },

    /**
     * sendLinkOne: SEND ONE IMAGE TO WHATSAPP
     * props: {
     *  emisor: whatsapp sender number as string,
     *  sessionId: same editor
     *  link: link as string,
     *  descripcion: message about link,     *
     *  idcosa: idregistro of thing to share,
     *  idvotantes: idregistro of target
     *  campana: idregistro of campana
     * }
     * RETURN {}
     */    
    async sendLinkOneMulti(props){
        try{
            const sanitized_number = props.number.toString().replace(/[- )(]/g, ""); // remove unnecessary chars from the number
            let final_number = '', enviado = false
            props.type = (typeof props.type !== "undefined" && props.type !== "" && props.type !== null) ? parseInt(props.type) : 1 ;

            if(sanitized_number.length > 10){
                final_number = `${sanitized_number.replace('+','')}`+'@c.us'; // add 91 before the number here 91 is country code of colombia
            }else{
                final_number = `57${sanitized_number.substring(sanitized_number.length - 10).replace('+','')}`+'@c.us'; // add 91 before the number here 91 is country code of colombia
            }
            // console.log('propiedades recibidas: ', final_number, props)


            await global.clientSessionStore[props.emisor].sendMessage(
                final_number, props.message, { linkPreview: { includePreview: true }}
            )// 
            .then(async sendMessageData =>{
                // ACA REGISTRAMOS EL LOG QUE LE ENVIAMOS EL REGISTRO
                // console.log('Si se lo mandamos: ', sendMessageData)
                enviado = true
                const messagesDetails = {
                    id:sendMessageData.id,
                    from:sendMessageData.from,
                    to:sendMessageData.to,
                    caption:sendMessageData._data.caption,
                    hasMedia:false,
                    type:props.type, // 1: consentimiento, 2: publicidad, 3: volantes
                    timestamp:sendMessageData.timestamp
                }
                // let elLog = 
                // console.log('EL log: ', elLog)

                await Db.query({
                    text:queryes.enviosHistory,
                    values:[
                        props.idcosa,
                        props.campana,
                        props.idvotantes,
                        props.type,
                        isRegistered,
                        enviado,
                        JSON.stringify(messagesDetails)
                    ]
                })
                return enviado
            })
            .catch(async error =>{
                const messagesDetails = {
                    error:error.toString()
                }

                await Db.query({
                    text:queryes.enviosHistory,
                    values:[
                        props.idcosa,
                        props.campana,
                        props.idvotantes,
                        props.type,
                        isRegistered,
                        enviado,
                        JSON.stringify(messagesDetails)
                    ]
                })
                return enviado
            })
        }catch(error){
            // ACA MARCAMOS EL PERSONAL COMO QUE NO TIENE WHATSAPP
            // console.log(final_number, "El numero no tiene cuenta de whatsapp");
            const messagesDetails = {
                error:error.toString()
            }
            await Db.query({
                text:queryes.volantesHistory,
                values:[props.idcosa,props.idvotantes,false,JSON.stringify(messagesDetails)]
            })
            return false
        }
    },

    /**
     * sendLinkOne: SEND ONE IMAGE TO WHATSAPP
     * props: {
     *  emisor: whatsapp sender number as string,
     *  sessionId: same editor
     *  link: link as string,
     *  descripcion: message about link,     *
     *  idcosa: idregistro of thing to share,
     *  idvotantes: idregistro of target
     *  campana: idregistro of campana
     * }
     * RETURN {}
     */    
    async sendLinkOneBochinche(props){
        try{
            const sanitized_number = props.number.toString().replace(/[- )(]/g, ""); // remove unnecessary chars from the number
            let final_number = '', enviado = false
            props.type = (typeof props.type !== "undefined" && props.type !== "" && props.type !== null) ? parseInt(props.type) : 1 ;

            if(sanitized_number.length > 10){
                final_number = `${sanitized_number.replace('+','')}`+'@c.us'; // add 91 before the number here 91 is country code of colombia
            }else{
                final_number = `57${sanitized_number.substring(sanitized_number.length - 10).replace('+','')}`+'@c.us'; // add 91 before the number here 91 is country code of colombia
            }
            // console.log('propiedades recibidas: ', final_number, props)


            await global.clientSessionStore[props.emisor].sendMessage(
                final_number, props.message, { linkPreview: { includePreview: true }}
            )// 
            .then(async sendMessageData =>{
                // ACA REGISTRAMOS EL LOG QUE LE ENVIAMOS EL REGISTRO
                // console.log('Si se lo mandamos: ', sendMessageData)
                enviado = true
                const messagesDetails = {
                    id:sendMessageData.id,
                    from:sendMessageData.from,
                    to:sendMessageData.to,
                    caption:sendMessageData._data.caption,
                    hasMedia:false,
                    type:props.type, // 1: consentimiento, 2: publicidad, 3: volantes
                    timestamp:sendMessageData.timestamp
                }
                // let elLog = 
                // console.log('EL log: ', elLog)

                await Db.query({
                    text:queryes.checkResultBochinche,
                    values:[
                        props.idregistro,
                        enviado,
                        JSON.stringify(messagesDetails)
                    ]
                })
                return enviado
            })
            .catch(async error =>{
                const messagesDetails = {
                    error:error.toString()
                }

                await Db.query({
                    text:queryes.checkResultBochinche,
                    values:[
                        props.idregistro,
                        enviado,
                        JSON.stringify(messagesDetails)
                    ]
                })
                return enviado
            })
        }catch(error){
            // ACA MARCAMOS EL PERSONAL COMO QUE NO TIENE WHATSAPP
            // console.log(final_number, "El numero no tiene cuenta de whatsapp");
            const messagesDetails = {
                error:error.toString()
            }
            await Db.query({
                text:queryes.checkResultBochinche,
                values:[
                    props.idregistro,
                    false,
                    JSON.stringify(messagesDetails)
                ]
            })
            return false
        }
    },

    // SEND IMAGE TO SOMEONE
    /**
     * sendImageOne: SEND ONE IMAGE TO WHATSAPP
     * props: {number:whatsapp number as string,imagen:PATH as string,descripcion: message about image}
     * emisorList: RETURN {}
     */    
    async sendImageBochinche(props){
        try{
            // console.log('propiedades recibidas: ', props)
            const { MessageMedia } = require('whatsapp-web.js');
            const media = MessageMedia.fromFilePath(props.image);

            const sanitized_number = props.number.toString().replace(/[- )(]/g, ""); // remove unnecessary chars from the number
            let final_number = ''
            if(sanitized_number.length > 10){
                final_number = `${sanitized_number.replace('+','')}`+'@c.us'; // add 91 before the number here 91 is country code of colombia
            }else{
                final_number = `57${sanitized_number.substring(sanitized_number.length - 10).replace('+','')}`+'@c.us'; // add 91 before the number here 91 is country code of colombia
            }
            // console.log('propiedades recibidas: ', final_number, props)

            await global.clientSessionStore[props.emisor].sendMessage(
                final_number, props.media, {caption: props.descripcion}
            )// send message
            .then(async sendMessageData =>{
                // ACA REGISTRAMOS EL LOG QUE LE ENVIAMOS EL REGISTRO
                // console.log('Si se lo mandamos: ', sendMessageData)                    
                const messagesDetails = {
                    id:sendMessageData.id,
                    from:sendMessageData.from,
                    to:sendMessageData.to,
                    caption:sendMessageData._data.caption,
                    hasMedia:sendMessageData.hasMedia,
                    type:sendMessageData.type,
                    timestamp:sendMessageData.timestamp
                }
                await Db.query({
                    text:queryes.volantesHistory,
                    values:[props.idcosa,props.idvotantes,isRegistered,JSON.stringify(messagesDetails)]
                })
            })
            .catch(async error =>{
                const messagesDetails = {
                    error:error
                }
                await Db.query({
                    text:queryes.volantesHistory,
                    values:[props.idcosa,props.idvotantes,false,JSON.stringify(messagesDetails)]
                })
            })
        }catch(error){
            // ACA MARCAMOS EL PERSONAL COMO QUE NO TIENE WHATSAPP
            // console.log(final_number, "El numero no tiene cuenta de whatsapp");
            const messagesDetails = {
                error:error.toString()
            }
            await Db.query({
                text:queryes.volantesHistory,
                values:[props.idcosa,props.idvotantes,false,messagesDetails]
            })
        }
    },
}