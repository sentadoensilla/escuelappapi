import Db from "../database/conex.js";
import token from "../utils/token.js";
import queryes from "../sql/areas.js";
export async function areaListado(req, res) {
  try {
    let result = await Db.query({
      text: queryes.areasList,
      values: []
    });
    result.rows.forEach(ciclo => {
      ciclo.areaid = token.encriptar(String(ciclo.areaid));
      ciclo.areaestado = token.encriptar(String(ciclo.areaestado));
    });
    res.send({
      status: "success",
      statusCode: 200,
      message: result.rows.length + " Resultados encontrados",
      rows: result.rows
    });
  } catch (error) {
    console.log('areaListado TRY error: ', error);
    res.send({
      status: "error",
      statusCode: 400,
      message: "El sistema ha encontrado un error inesperado",
      rows: []
    });
  }
}
export default {
  areaListado: areaListado
}; //MODULOS O FUNCIONES
