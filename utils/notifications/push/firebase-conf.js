import admin from "firebase-admin";
import serviceAccount from "./colarqui-firebase-adminsdk-nb5ii-9fd376430a.json" with { type: "json" };
import { createRequire } from "module";
const require = createRequire(import.meta.url);
require('dotenv').config();
//var serviceAccount = require("./agendaescolar-31b27-firebase-adminsdk-igtfc-717a6e16e9.json");

admin.initializeApp({
  messagingSenderId: `${process.env.FIREBASE_MESSAGING_SENDER_ID}`,
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `${process.env.FIREBASE_DB_URL}`
});
export { admin };
