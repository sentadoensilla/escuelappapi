
const fs = require('fs');
const util = require('util');

const {SignJWT, jwtVerify } = require('jose');
const config = { tok: ".n1pp0nG4kk1.H4m4m4tsU-Sh1zU0k4J4p0n" };
const moment = require('moment')
const queryes = require('../sql/authsql')
const Db = require('./datasource')

// Nodejs encryption with CTR
var crypto = require('crypto'), algorithm = 'HS256', cryptoPass = '.n1pp0nG4kk1.H4m4m4tsU-Sh1zU0k4J4p0n';//"81234567812345678123456781234567";
//var crypto = require('crypto'), algorithm = 'aes-256-cbc', cryptoPass = '.n1pp0nG4kk1.';
//const ENC= 'H4m4m4tsU-Sh1zU0k4J4p0n';
//const IV = ".n1pp0nG4kk1.";
//const ALGO = "aes-256-cbc"
// Initializing the key
//const key = crypto.randomBytes(32)
// Initializing the iv vector
//const iv = crypto.randomBytes(16)
const initVector = crypto.randomBytes(16); //.toString("hex").slice(0, 16);;
const Securitykey = crypto.randomBytes(32);
const exists = util.promisify(fs.access);
const axios = require('axios')

module.exports = {

    async createtoken(sub) {
        try{
            const encoder = new TextEncoder();
            const jwtConstructor = new SignJWT({sub});
            const jwt = jwtConstructor
                .setProtectedHeader({alg:algorithm,typ:"JWT"})//ALGORITMO Y TIPO DE ENCRIPCION 
                .setIssuedAt()//TIEMPO DE CREACION
                .setExpirationTime('2m')
                .sign(encoder.encode(process.env.JWT_PRIVATE_key))//CLAVE PRIVADA PARA ENCRIPTAR
            return await jwt
        }catch(err){
            return await err
        }
    },

    async verifyToken(token){
        try{            
            const encoder = new TextEncoder();
            const jwtData = await jwtVerify(token,encoder.encode(process.env.JWT_PRIVATE_key));
            // sub es un objeto (datos_usuario) enviado por createtoken; no usar JSON.parse sobre él.
            console.log('verify: ', jwtData.payload.sub); //.payload.sub.sub_menu
            return jwtData
        }catch(err){
            return({
                success: 'fail',
                status: 403,
                message: "Token Invalido"
            })            
        }
    },

    /**
     * coloresArray RETURN A COLOR
     * @param {*} req 
     * @returns 
     */
    coloresArray: (index) =>{
        let misColores = [
            ['#007bff','#FFFFFF'],['#6610f2','#FFFFFF'],['#e83e8c','#FFFFFF'],['#ffc107','#343a40'],['#28a745','#FFFFFF'],
            ['#dc3545','#FFFFFF'],['#fd7e14','#FFFFFF'],['#28a745','#FFFFFF'],['#20c997','#FFFFFF'],['#17a2b8','#FFFFFF'],
            ['#6c757d','#FFFFFF'],['#007bff','#FFFFFF'],['#6c757d','#FFFFFF'],['#28a745','#FFFFFF'],['#343a40','#FFFFFF'],
            ['#343a40','#f8f9fa'],['#dc3545','#FFFFFF'],['#ffc107','#343a40'],['#6f42c1','#FFFFFF'],['#FA57ff','#FFFFFF'],
            ['#AC92EC','#f8f9fa'],['#D770AD','#343a40'],['#C0392B','#f8f9fa'],['#2980B9','#FFFFFF'],['#42A48D','#FFFFFF']
        ];
        return (misColores[index]||misColores[0]);
    },

    /**
     * notificationSave REGISTER A NOTIFICATION
     * @param {*} req 
     * @returns 
     */
    notificationSave: async (req, res, next) => {
        try {
            let query = {
                text: queryes.migadepan,
                values: req
            }
            let resp = await Db.query(query)
        } catch (error) {
            console.log(error);
            res.status(400).send(error)
        }
    },

    /**
     * notificationShow SHOW LIST NOTIFICATIONS BY USER
     * @param {*} req 
     * @returns 
     */
    notificationShow: async (req, res, next) => {
        try {
            let query = {
                text: queryes.migadepan,
                values: req
            }
            let resp = await Db.query(query)
        } catch (error) {
            console.log(error);
            res.status(400).send(error)
        }
    },

    /**
     * logsteps REGISTER USE OF API BY USER
     * @param {*} req 
     * @returns 
     */
    logsteps: async (req, res, next) => {
        try {
            let query = {
                text: queryes.migadepan,
                values: req
            }
            let resp = await Db.query(query)
        } catch (error) {
            console.log(error);
            // Evitar crash: res puede ser undefined cuando logsteps se llama con un solo argumento.
            if (res && typeof res.status === 'function') {
                res.status(400).send(error);
            }
        }
    },

    /**
     * paginate SPLIT AN ARR IN SIZE
     * @param {*} arr: ARREGLO DE DATOS, size: REBANADAS DE ARREGLO
     * @returns 
     */
    paginate: async (arr, size) => {
        return arr.reduce((acc, val, i) => {
            let idx = Math.floor(i / size)
            let page = acc[idx] || (acc[idx] = [])
            page.push(val)

            return acc
        }, [])
    },

    /**
     * encriptarHash RECEIVE A STRING TO MASK MD5
     * @param {*} text 
     * @returns 
     */
    encriptarHash: (text) => {
        return crypto.createHash('md5').update(text.toString()).digest("hex")
    },

    /**
     * encriptar RECEIVE A STRING TO MASK
     * @param {*} text 
     * @returns 
     */
    encriptar: (text) => {
        let encoded = ""
        if (text != "undefined" && text != null && text != "") {
            encoded = Buffer.from(text.toString(), 'utf-8').toString('base64').toString('base64')
        }
        return encoded
    },

    /**
     * decriptar RECEIVE A MASK LARGE STRING TO UN-MASK-IT
     * @param {*} text 
     * @returns 
     */
    decriptar: (text) => {
        let plain = ""
        if (text != "undefined" && text != null && text != "") {
            plain = Buffer.from(Buffer.from(text.toString(), 'base64'), 'base64').toString('utf-8')
        }
        return plain
    },

    /**
     * encryptBuffer RECEIVE A BUFFER TO MASK IT
     * @param {*} buffer 
     * @returns 
     * EXAMPLE var hw = encryptBuffer(new Buffer("hello world", "utf8"))
     */
    encryptBuffer: (buffer) => {
        var cipher = crypto.createCipher(algorithm, cryptoPass)
        var crypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
        return crypted;
    },

    /**
     * decryptBuffer RECEIVE A BUFFER TO un-MASK IT
     * @param {*} buffer 
     * @returns 
     * EXAMPLE var hw = encryptBuffer(new Buffer("hello world", "utf8"))
     * console.log(decrypt(hw).toString('utf8'));
    */
    decryptBuffer: (buffer) => {
        var decipher = crypto.createDecipher(algorithm, cryptoPass)
        var dec = Buffer.concat([decipher.update(buffer), decipher.final()]);
        return dec;
    },

    /**
     * fileExists RECEIVE A URI TO CHECK IF EXIST
     * @param {*} URI 
     * @returns 
    */
    fileExists: (path) => {
        return new Promise((resolve, reject) => {
            exists(path, fs.F_OK).then(ok => {
                resolve(true);
            }).catch(err => {
                resolve(false);
            });
        });
    },

    /**
     * randomString RETURN RANDOM STRING AS LONG AS LENGHT
     * @param {*} length (INTEGER) 
     * @returns 'aS.u$F'
    */
    randomString: (length) => {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789~!@#$%&*()_+=-';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    },

    /**
     * currency RETURN A NUMBER LIKE COP CURRENCY
     * @param {*} length (STRING||FLOAT) 
     * @returns 'aS.u$F'
    */
    currency: (buck) => {
        if (typeof buck !== "undefined" && buck !== ""){
            const formatter = new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                minimumFractionDigits: 0
            })
            return formatter.format(buck)
        }else{
            return 0
        }
    },

    /**
     * validEmail RETURN RANDOM STRING AS LONG AS LENGHT
     * @param {*} length (INTEGER) 
     * @returns 'aS.u$F'
    */
    validEmail: (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    },

    /**
     * stringSimilarity RETURN % LIKELY TWO STRINGS BASED ON LEVENSHTEIN DISTANCE
     * @param {*} s1:STRING, s2:STRING (THIS METHO ORDER ARGS => LONGER TO SHORTER)
     * @returns #.#######
    */
    stringSimilarity: (s1, s2) => {
        var longer = s1;
        var shorter = s2;
        if (s1.length < s2.length) {
            longer = s2;
            shorter = s1;
        }
        var longerLength = longer.length;
        if (longerLength == 0) {
            return 1.0;
        }
        return (longerLength - module.exports.editDistance(longer, shorter)) / parseFloat(longerLength);
    },

    /**
     * stringSimilarity METHOD FOR CALCULATE LEVENSHTEIN DISTANCE
     * @param {*} s1:STRING, s2:STRING 
     * @returns #.#######
    */
    editDistance: (s1, s2) => {
        s1 = s1.toLowerCase();
        s2 = s2.toLowerCase();

        var costs = new Array();
        for (var i = 0; i <= s1.length; i++) {
            var lastValue = i;
            for (var j = 0; j <= s2.length; j++) {
                if (i == 0)
                    costs[j] = j;
                else {
                    if (j > 0) {
                        var newValue = costs[j - 1];
                        if (s1.charAt(i - 1) != s2.charAt(j - 1))
                            newValue = Math.min(Math.min(newValue, lastValue),
                                costs[j]) + 1;
                        costs[j - 1] = lastValue;
                        lastValue = newValue;
                    }
                }
            }
            if (i > 0)
                costs[s2.length] = lastValue;
        }
        return costs[s2.length];
    },

    /**
     * sleep(2000) WAIT 2 SECONDS
     * @param {*} taim 
     * @returns 
     */
    sleep(taim){
        return new Promise(resolve => setTimeout(resolve, taim))
    },

    /**
     * ahora: return current date/time/timestamp 
     * @param {*} key 
     * @returns 
     */
    ahora(key){
        const now = new Date();
        const year = now.getFullYear();
        const month = ("0" + (now.getMonth() + 1)).slice(-2);
        const day = ("0" + now.getDate()).slice(-2);
        const hour = ("0" + now.getHours()).slice(-2);
        const minute = ("0" + now.getMinutes()).slice(-2);
        const second = ("0" + now.getSeconds()).slice(-2);
        switch (key) {
            case 'fecha':
                // YYYY-MM-DD hh:mm:ss
                return `${year}-${month}-${day}`;               
            break;
            
            case 'hora':
                // YYYY-MM-DD hh:mm:ss
                return `${hour}:${minute}:${second}`;
            break;
            
            default:
                // YYYY-MM-DD hh:mm:ss
                return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
            break;
        }

    },

    /**
     * chunk: return array splitted by chunk_size
     * @param {*} key 
     * @returns 
     */
    chunk(array, chunk_size){
        if(array.length == 0) return [];
        else return [array.splice(0, chunk_size)].concat(chunk(array, chunk_size))
    },

    /**
     * postMessage: hace una solicitud post, necesitamos tener una data.route y otros datos sessionId, to, payload
     * @param {*} data 
     * @returns 
     */
    async postMessage(data){
        try{
            if(data.route != "" && data.route != null && typeof data.route != undefined){

                const URLobjetivo = process.env.WP_API_BACKEND+data.route
                const options = { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
                const payLoad = {
                    campanaid: data.campanaid,
                    sessionId: data.sessionId,
                    to: data.to,
                    type: data.type,
                    payload: data.payload,
                    idcosa: data.idcosa,
                    idvotantes: data.idvotantes,
                    campana: data.campana,
                    socketId: data.socketId,
                    wpapikey: data.wpapikey                   
                }

                console.log('postMessage -> ', URLobjetivo, payLoad)

                const response = await axios.post(URLobjetivo, payLoad, options)
                // console.log('postMessage response -> ', response.data)

                return response.data;
            }
        }catch(error){
            console.log('postMessage Error en el POST:', error.response?.status, error.message )
            throw error; // O maneja el error según tu lógica
        }
    },

    /**
     * validNumber: VIRIFICA SI UN NUMERO TIENE WHATSAPP
     * @param {*} data 
     * @returns 
     */
    async validNumber(data){
        try{
            if(data.to != "" && data.to != null && typeof data.to != undefined
                && data.sessionId != "" && data.sessionId != null && typeof data.sessionId != undefined
            ){

                const URLobjetivo = process.env.WP_API_BACKEND+'/wp/queue/valid'
                const options = { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } } 
                const payLoad = {
                    sessionId: data.sessionId,
                    to: data.to.replace('+','')                
                }
                // console.log('validNumber -> ', URLobjetivo, payLoad, options)
                const response = await axios.post(URLobjetivo, payLoad, options)
                // console.log('validNumber response -> ', response.data)
                
                return (response.data)  // (response.data.result !== undefined)? response.data : {}
            }
        }catch(error){
            console.log('validNumber Error en el POST:', error.response?.status, error.message )
            throw error; // O maneja el error según tu lógica
        }
    }

}