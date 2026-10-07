import Db from "../database/conex.js";
import token from "../utils/token.js";
import queryes from "../sql/areas.js";
export async function areaListado(req, res) {
  try {
    let {} = req.body;
    let miempresa = [],
      idusuario,
      rol,
      idacademico;
    req.user.usuarioEmpresaId.map(elDato => {
      miempresa.push(parseInt(token.decriptar(elDato)));
    });
    idusuario = token.decriptar(req.user.usuarioId);
    rol = token.decriptar(req.user.usuarioRol);
    idacademico = token.decriptar(req.user.academicoId);
    let result = await Db.query({
      text: queryes.areasList,
      values: []
    });
    result.rows.map((ciclo, c) => {
      result.rows[c].areaid = token.encriptar(ciclo.areaid.toString());
      result.rows[c].areaestado = token.encriptar(ciclo.areaestado.toString());
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
