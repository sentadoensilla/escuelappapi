import Db from "../../database/conex.js";
import token from "../../utils/token.js";
import queryes from "./menu.sql.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
require('dotenv').config();
export async function menuInsert(req, res) {
  let resultadoFinal = {};
  try {
    let {
      nombre,
      descripcion,
      destino,
      orden,
      idestado
    } = req.body;
    if (typeof nombre != "undefined" && nombre != null && nombre != "") {
      idestado = token.decriptar(idestado);
      nombre = nombre.trim().toLowerCase();
      descripcion = (descripcion || "").trim().toLowerCase();
      destino = (destino || "#").trim();
      orden = parseInt(orden);

      // MENU REGISTER (logic.tabmenu)
      await Db.query({
        text: queryes.menuInsert,
        values: [nombre, descripcion, destino, idestado, orden]
      }).then(async resultsMenu => {
        if (resultsMenu.rowCount > 0) {
          res.send({
            status: "success",
            statusCode: 200,
            message: `Menu ${nombre} registrado!`,
            rows: {
              idregistro: token.encriptar(resultsMenu.rows[0].cmenuid)
            }
          });
        } else {
          res.send({
            status: "error",
            statusCode: 400,
            message: `Ocurrio un error registrando el menu ${nombre}, recarga e intenta nuevamente`,
            rows: resultadoFinal
          });
        }
      }).catch(error => {
        console.log('Error try: ', error);
        res.send({
          status: "error",
          statusCode: 400,
          message: `Ocurrio un error registrando el menu ${nombre}, revisa minuciosamente la informacion, corrige e intenta nuevamente`,
          rows: resultadoFinal
        });
      });
    } else {
      res.send({
        status: "error",
        statusCode: 400,
        message: 'Falta informacion, revisar e intentar nuevamente',
        rows: resultadoFinal
      });
    }
  } catch (error) {
    console.log('inserMenu: ', error);
    res.send({
      status: "error",
      statusCode: 400,
      message: 'El sistema experimenta errores inesperados, por favor intente mas tarde',
      rows: resultadoFinal
    });
  }
}
export async function menuUpdate(req, res) {
  let resultadoFinal = {};
  try {
    let {
      idregistro,
      nombre,
      descripcion,
      destino,
      orden,
      idestado
    } = req.body;
    if (typeof nombre != "undefined" && nombre != null && nombre != "" && typeof idregistro != "undefined" && idregistro != null && idregistro != "") {
      idregistro = token.decriptar(idregistro);
      idestado = token.decriptar(idestado);
      nombre = nombre.trim().toLowerCase();
      descripcion = (descripcion || "").trim().toLowerCase();
      destino = (destino || "#").trim();
      orden = parseInt(orden);

      // MENU UPDATE (logic.tabmenu)
      await Db.query({
        text: queryes.menuUpdate,
        values: [idregistro, nombre, descripcion, destino, idestado, orden]
      }).then(async results => {
        if (results.rowCount > 0) {
          res.send({
            status: "success",
            statusCode: 200,
            message: `Menu ${nombre} actualizado!`,
            rows: {
              idregistro: token.encriptar(idregistro)
            }
          });
        } else {
          res.send({
            status: "error",
            statusCode: 400,
            message: `Ocurrió un error actualizando el menu ${nombre}, recarga e intenta nuevamente`,
            rows: resultadoFinal
          });
        }
      }).catch(error => {
        console.log('Error try: ', error);
        res.send({
          status: "error",
          statusCode: 400,
          message: `Ocurrió un error actualizando el menu ${nombre}, revisa minuciosamente la informacion, corrige e intenta nuevamente`,
          rows: resultadoFinal
        });
      });
    } else {
      res.send({
        status: "error",
        statusCode: 400,
        message: 'Falta informacion, revisar e intentar nuevamente',
        rows: resultadoFinal
      });
    }
  } catch (error) {
    console.log('inserMenu: ', error);
    res.send({
      status: "error",
      statusCode: 400,
      message: 'El sistema experimenta errores inesperados, por favor intente mas tarde',
      rows: resultadoFinal
    });
  }
}
export async function menuDelete(req, res) {
  let resultadoFinal = {};
  try {
    let {
      reference
    } = req.body;
    if (typeof reference != "undefined" && reference != null && reference != "") {
      let idregistro = token.decriptar(reference);
      // MENU DELETE (logic.tabmenu)
      await Db.query({
        text: queryes.menuDelete,
        values: [idregistro]
      }).then(async results => {
        if (results.rowCount > 0) {
          res.send({
            status: "success",
            statusCode: 200,
            message: `Menu borrado!`,
            rows: resultadoFinal
          });
        } else {
          res.send({
            status: "error",
            statusCode: 400,
            message: `Ocurrió un error borrando el menu, recarga e intenta nuevamente`,
            rows: resultadoFinal
          });
        }
      }).catch(error => {
        console.log('Error try: ', error);
        res.send({
          status: "error",
          statusCode: 400,
          message: `Ocurrió un error borrando el menu, dar aviso al administrador del sistema`,
          rows: resultadoFinal
        });
      });
    } else {
      res.send({
        status: "error",
        statusCode: 400,
        message: 'Falta informacion, revisar e intentar nuevamente',
        rows: resultadoFinal
      });
    }
  } catch (error) {
    console.log('inserMenu: ', error);
    res.send({
      status: "error",
      statusCode: 400,
      message: 'El sistema experimenta errores inesperados, por favor intente mas tarde',
      rows: resultadoFinal
    });
  }
}
export async function menuSelect(req, res) {
  let resultadoFinal = {};
  try {
    // menu list (logic.tabmenu)
    await Db.query({
      text: queryes.menuSelect,
      values: []
    }).then(async results => {
      results.rows.map((elDato, d) => {
        results.rows[d].idregistro = token.encriptar(elDato.idregistro);
        results.rows[d].idestado = token.encriptar(elDato.idestado);
      });
      resultadoFinal = {
        title: 'Menu',
        id: 'menuapp',
        caption: `Menues del sistema `,
        data: results.rows
      };
      res.send({
        status: "success",
        statusCode: 200,
        message: results.rows.length + ' Filas encontrados',
        rows: resultadoFinal
      });
    }).catch(error => {
      console.log('Error try: ', error);
      res.send({
        status: "error",
        statusCode: 400,
        message: '0 Resultados encontrados',
        rows: resultadoFinal
      });
    });
  } catch (error) {
    console.log('menulistado: ', error);
    res.send({
      status: "error",
      statusCode: 400,
      message: 'El sistema experimenta errores inesperados, por favor intente mas tarde',
      rows: resultadoFinal
    });
  }
}
export default {
  menuInsert: menuInsert,
  menuUpdate: menuUpdate,
  menuDelete: menuDelete,
  menuSelect: menuSelect
};
