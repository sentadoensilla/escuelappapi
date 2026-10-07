import fs from "fs";
import path from "path";
import Db from "../../datasource.js";
import token from "../../token.js";
import queryes from "../../../sql/whatsapp.js";
import * as __mod0 from "@whiskeysockets/baileys";
import qrcode from "qrcode";
import LZString from "lz-string";
import * as __mod1 from "@hapi/boom";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
require("dotenv").config();
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
  msgRetryCounterMap
} = __mod0;
// var global = require("./wpEmisor")
const SESSION_FILE_PATH = process.env.APP_WP_SESSION_PATH;
let sessionData;
if (fs.existsSync(SESSION_FILE_PATH)) {
  sessionData = SESSION_FILE_PATH;
  global.sessionData = sessionData;
}
const log = require("pino");
const {
  session
} = {
  session: "SESSION_FILE_PATH"
};
const {
  Boom
} = __mod1;

//const { MongoStore } = require('wwebjs-mongo');
//const mongoose = require('mongoose');
//const { Console } = require("console");
//const { json } = require("body-parser");
// const store = makeInMemoryStore({ logger: log().child({ level: 'silent', stream: 'store' }) })

let sock = [];
let qrDinamic;
let soket;
export async function senderDirectory(myData) {
  if (!fs.existsSync(SESSION_FILE_PATH + "/" + myData.sessionId)) {
    fs.mkdirSync(SESSION_FILE_PATH + "/" + myData.sessionId, {
      recursive: true
    });
  }
  return fs.existsSync(SESSION_FILE_PATH + "/" + myData.sessionId);
}
export async function senderDirectoryRm(myData) {
  if (fs.existsSync(SESSION_FILE_PATH + "/" + myData.sessionId)) {
    fs.rmSync(SESSION_FILE_PATH + "/" + myData.sessionId, {
      recursive: true,
      force: true
    });
  }
  return fs.existsSync(SESSION_FILE_PATH + "/" + myData.sessionId);
}
export function isConnected(myData) {
  // let devolver = false
  // devolver = global.sock[myData.sessionId]?.user ? true : false;
  // return devolver;
  console.log('isConnected, global.qrDinamic[myData.sessionId]: ', global.sock[myData.sessionId]?.user);
  return global.sock[myData.sessionId]?.user ? true : false;
}
export async function updateQR(myData) {
  console.log('updateQR: ', myData);
  // await module.exports.emisorStatus({socketId: myData.socketId, sessionId: myData.sessionId, message: myData.requirement})
  let allemisorInfo = await emisorListNone(myData);
  let emisorInfo = allemisorInfo.filter(emisores => emisores.emisor == myData.sessionId);
  const compressedNamba = LZString.compressToEncodedURIComponent(myData.sessionId || emisorInfo.emisor);
  switch (myData.requirement) {
    case "qr":
      console.log('Mostrando QR: ', global.qrDinamic[myData.sessionId]);
      qrcode.toDataURL(global.qrDinamic[myData.sessionId], (err, url) => {
        console.log('Error generando qr: ', url);
        // soket?.emit("qr", url);
        global.io.to(emisorInfo.token || myData.socketId).emit("qr", {
          message: url || myData.qr,
          namba: myData.sessionId || emisorInfo.emisor
        });

        //soket?.emit("log", "QR recibido , scan");
        global.io.to(emisorInfo.token || myData.socketId).emit("log", {
          message: "QR recibido , scan" || url,
          namba: myData.sessionId || emisorInfo.emisor
        });
      });
      break;
    case "connected":
      await emisorStatus({
        socketId: myData.socketId,
        sessionId: myData.sessionId,
        message: "conectado"
      });
      // soket?.emit("qrstatus", "./assets/check.svg");
      global.io.to(myData.socketId || emisorInfo.token).emit("nambalistado", {
        list: allemisorInfo,
        namba: emisorInfo.emisor
      });

      // const { id, name } = sock?.user;
      // var userinfo = id + " " + name;
      // soket?.emit("user", userinfo);

      break;
    case "loading":
      // soket?.emit("qrstatus", "./assets/loader.gif");
      // soket?.emit("log", "Cargando ....");
      // GET LIST OF WHATSAPP IN DB
      global.io.to(myData.socketId || emisorInfo.token).emit("loading", {
        list: allemisorInfo,
        namba: emisorInfo.emisor
      });
      break;
    default:
      break;
  }
}
export async function connectToWhatsApp(myData) {
  try {
    // SAVING SOCKETID FOR ALL WHATSAPP CAMPANAS
    let checkDestDirectory = await senderDirectory(myData);

    // const { state, saveCreds } = await useMultiFileAuthState("session_auth_info");
    let myEmisor = await emisorSaveToken(myData);
    const {
      state,
      saveCreds
    } = await useMultiFileAuthState(`${SESSION_FILE_PATH + "/" + myData.sessionId + "/"}`);
    console.log('connectToWhatsApp: ', checkDestDirectory, state, saveCreds);
    global.sock[myData.sessionId] = makeWASocket({
      printQRInTerminal: true,
      // auth: state,
      auth: {
        creds: state.creds
      },
      logger: log({
        level: "silent"
      })
    });
    global.sock[myData.sessionId].ev.on("connection.update", async update => {
      const {
        connection,
        lastDisconnect,
        qr
      } = update;
      qrDinamic = qr;
      global.qrDinamic[myData.sessionId] = qrDinamic;
      console.log('el connection.update: ', qr);
      if (connection === "close") {
        let reason = new Boom(lastDisconnect.error).output.statusCode;
        if (reason === DisconnectReason.badSession) {
          console.log(`Bad Session File, Please Delete ${session} and Scan Again`);
          global.sock[myData.sessionId].logout();
        } else if (reason === DisconnectReason.connectionClosed) {
          console.log("Conexión cerrada, reconectando....");
          connectToWhatsApp(myData);
        } else if (reason === DisconnectReason.connectionLost) {
          console.log("Conexión perdida del servidor, reconectando...");
          connectToWhatsApp(myData);
        } else if (reason === DisconnectReason.connectionReplaced) {
          console.log("Conexión reemplazada, otra nueva sesión abierta, cierre la sesión actual primero");
          global.sock[myData.sessionId].logout();
        } else if (reason === DisconnectReason.loggedOut) {
          console.log(`Dispositivo cerrado, elimínelo ${session} y escanear de nuevo.`);
          global.sock[myData.sessionId].logout();
        } else if (reason === DisconnectReason.restartRequired) {
          console.log("Se requiere reinicio, reiniciando...");
          connectToWhatsApp(myData);
        } else if (reason === DisconnectReason.timedOut) {
          console.log("Se agotó el tiempo de conexión, conectando...");
          connectToWhatsApp(myData);
        } else {
          global.sock[myData.sessionId].end(`Motivo de desconexión desconocido: ${reason}|${lastDisconnect.error}`);
        }
      } else if (connection === "open") {
        console.log("conexión abierta");
        return;
      }
    });
    global.sock[myData.sessionId].ev.on("messages.upsert", async ({
      messages,
      type
    }) => {
      try {
        if (type === "notify") {
          if (!messages[0]?.key.fromMe) {
            const captureMessage = messages[0]?.message?.conversation;
            const numberWa = messages[0]?.key?.remoteJid;
            const compareMessage = captureMessage.toLocaleLowerCase();
            if (compareMessage === "ping") {
              await global.sock[myData.sessionId].sendMessage(numberWa, {
                text: "Pong"
              }, {
                quoted: messages[0]
              });
            } else {
              await global.sock[myData.sessionId].sendMessage(numberWa, {
                text: "Soy un robot"
              }, {
                quoted: messages[0]
              });
            }
          }
        }
      } catch (error) {
        console.log("error ", error);
      }
    });
    global.sock[myData.sessionId].ev.on("creds.update", saveCreds);
  } catch (error) {
    console.log("connectToWhatsApp catch error: " + error.toString());
  }
}
export async function emisorStatus(myData) {
  if (typeof myData.sessionId !== undefined) {
    let theState = 7;
    let myState = myData.message == "conectado" || myData.message == "ready" ? 6 : 7;
    theState = (await isConnected(myData)) ? 6 : 7;
    console.log('emisorStatus: ', myData.sessionId, myData.message, myState, myData.socketId);
    // save status on database
    await Db.query({
      text: queryes.setWPStatus,
      values: [myData.sessionId, myState, myData.socketId]
    });
    return theState;
  }
}
export async function emisorSaveToken(myData) {
  if (typeof myData.socketId !== undefined && myData.socketId !== "" && typeof myData.campana !== undefined && myData.campana !== "") {
    console.log('emisorSaveToken: nos llega: ', myData);
    await Db.query({
      text: queryes.WPsaveSocket,
      values: [myData.campana, myData.socketId]
    }).then(results => {
      console.log('emisorSaveToken: Guardando el token: ', myData, results.rows);
      return results.rows;
    }).catch(error => {
      return [];
    });
  } else {
    return [];
  }
}
export async function emisorSave(myData) {
  // console.log('emisorSave: ', myData)
  if (typeof myData.sessionId !== undefined && typeof myData.campana !== undefined) {
    const misCampanas = [];
    myData.campana.forEach(async item => {
      await Db.query({
        text: queryes.setWPSession,
        values: [item, myData.sessionId, myData.socketId || null, 6]
      });
    });
  }
}
export async function emisorDelete(myData) {
  if (typeof myData.sessionId !== undefined) {
    //DELETE DATABASE RECORD
    await Db.query({
      text: queryes.deleteWPRegistry,
      values: [myData.sessionId]
    }).then(async deleted => {
      return deleted.rowCount;
    }).catch(error => {
      console.log('[ERROR DB] emisoDelete error: ', error.toString());
      return 0;
    });
  } else {
    return 0;
  }
}
export async function emisorList(myData) {
  if (typeof myData.campana !== undefined) {
    let listaNumeros = [];
    //LIST DATABASE EMISOR
    await Db.query({
      text: queryes.myWPSessions,
      values: [myData.campana]
    }).then(response => {
      // MAP WHATSAPP NUMBER AND CHECK STATUS
      response.rows.map(async (item, i) => {
        // console.log('mapeando ', i, item)
        let nambaStatus = 7,
          nambaStatuslabel = "desconectado";
        await senderDirectoryRm({
          session: item.emisor
        }).then(async elNamba => {
          // console.log('emisorList buscando en mongo: ', elNamba)
          if (elNamba) {
            nambaStatus = 6;
            nambaStatuslabel = "conectado";
          }
          response.rows[i].status = nambaStatus;
          console.log('emisorList: ', {
            sessionId: item.emisor,
            message: nambaStatuslabel
          });
          await emisorStatus({
            sessionId: item.emisor,
            message: nambaStatuslabel
          });
        });
      });
      listaNumeros = response.rows;
    }).catch(error => {
      console.log('emisorList POSTGRESQL : ', error.toString());
      listaNumeros = [];
    });
    return listaNumeros;
  }
}
export async function emisorListNone(myData) {
  if (typeof myData.campana !== undefined) {
    let listaNumeros = [];
    //LIST DATABASE EMISOR
    await Db.query({
      text: queryes.myWPSessions,
      values: [myData.campana]
    }).then(response => {
      response.rows.map(async (item, i) => {
        // console.log('getState from: ', global.clientSessionStore[item.emisor]?.getState() )
        response.rows[i].idemisor = token.encriptar(item.idemisor);
        response.rows[i].idcampana = token.encriptar(item.idcampana);
      });
      listaNumeros = response.rows;
    }).catch(error => {
      listaNumeros = [];
    });
    return listaNumeros;
  }
}
export async function emisorListExtend(myData) {
  // console.log('emisorListExtend: ', myData)
  if (typeof myData.campana !== undefined) {
    //LIST DATABASE EMISOR
    await Db.query({
      text: queryes.myWPSessionsExtend,
      values: [myData.campana]
    }).then(response => {
      // console.log('emisorListExtend response: ', response)
      return response.rows;
    }).catch(error => {
      return [];
    });
  } else {
    return [];
  }
}
export async function emisorListCampana(myData) {
  if (typeof myData.campana !== undefined) {
    let listaNumeros = [];
    let elsocketId = null;
    //LIST DATABASE EMISOR
    await Db.query({
      text: queryes.myWPSessions,
      values: [myData.campana]
    }).then(response => {
      // MAP WHATSAPP NUMBER AND CHECK STATUS
      response.rows.map(async (item, i) => {
        // default is not connected
        let nambaStatus = 7,
          nambaStatuslabel = "desconectado";
        response.rows[i].idemisor = token.encriptar(item.idemisor);
        response.rows[i].idcampana = token.encriptar(item.idcampana);
        elsocketId = item.token;
      });
      listaNumeros = response.rows;
      // console.log('Recibimos en el emisorListCampana: ', elsocketId, myData)
    }).catch(error => {
      // console.log('Error en la lista de numeros: ', error.toString())
      listaNumeros = [];
    });

    // console.log('Pidieron listado: ', {sessionId: myData.sessionId, list: listaNumeros})
    global.io.to(myData.socketId || elsocketId).emit("nambalistado", {
      sessionId: myData.sessionId,
      list: listaNumeros
    });
    return listaNumeros;
  }
}
export async function emisorAll() {
  try {
    let listaNumeros = [];
    //LIST DATABASE EMISOR
    await Db.query({
      text: queryes.allWPSessions
    }).then(response => {
      response.rows.map(async (item, i) => {
        // console.log('Buscando ', item.emisor)
        if (!global.clientSessionStore[item.emisor]) {
          // console.log('Enganchando ', item.emisor)
          await sessionManager({
            sessionId: item.emisor,
            socketId: item.emisor,
            campana: item.idcampana
          });
        }
      });
      listaNumeros = response.rows;
    }).catch(error => {
      listaNumeros = [];
    });
  } catch (error) {
    console.log('Hubo un error tratando de recuperar los whatsapp emisores ' + error.toString());
  }
}
export default {
  senderDirectory: senderDirectory,
  senderDirectoryRm: senderDirectoryRm,
  isConnected: isConnected,
  updateQR: updateQR,
  connectToWhatsApp: connectToWhatsApp,
  emisorStatus: emisorStatus,
  emisorSaveToken: emisorSaveToken,
  emisorSave: emisorSave,
  emisorDelete: emisorDelete,
  emisorList: emisorList,
  emisorListNone: emisorListNone,
  emisorListExtend: emisorListExtend,
  emisorListCampana: emisorListCampana,
  emisorAll: emisorAll
};
