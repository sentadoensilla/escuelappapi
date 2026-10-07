import Db from "../database/conex.js";
import token from "../utils/token.js";
import sql from "../sql/authsql.js";

/**
 * claveValida
 * Compara la clave almacenada (logic.tabusua.cusuallave) contra la clave digitada.
 * El SAE guarda la clave en doble base64 (clásico) o simple base64/plano (migraciones).
 * Además se acepta el formato nuevo base64url (encriptar actual). Se mantienen todas
 * las representaciones para no romper usuarios históricos ni las claves de prueba.
 */
function claveValida(almacenada, digitada) {
  if (!almacenada || !digitada) return false;
  const plain = digitada.trim();
  const simple = Buffer.from(plain, 'utf-8').toString('base64');
  const doble = Buffer.from(simple, 'utf-8').toString('base64');
  const urlSafe = token.encriptar(plain);
  return almacenada === plain || almacenada === simple || almacenada === doble || almacenada === urlSafe;
}

function responderError(res, statusCode, message) {
  res.send({
    status: "fail",
    StatusCode: statusCode,
    message,
    rows: []
  });
}

export async function login(req, res) {
  let {
    username,
    password
  } = req.body;
  username = (username || '').trim();
  password = (password || '').trim();
  let datos_usuario;
  try {
    let very = await Db.query({
      text: sql.verify,
      values: [username]
    });

    // Credenciales incorrectas o usuario inactivo
    if (!very.rows[0]) {
      return responderError(res, 201, 'El usuario no se encuentra registrado o está suspendido o fue eliminado');
    }
    const user = very.rows[0];
    if (!claveValida(user.cusuallave, password)) {
      return responderError(res, 201, 'El usuario no se encuentra registrado o su contraseña es incorrecta');
    }

    const roll = parseInt(user.cusuaroll);
    let resp;

    switch (roll) {
      case 0:
        // ADMINISTRADOR DE SISTEMA (SAE)
        resp = await Db.query({
          text: sql.inicio_administrador,
          values: [username, roll]
        });
        if (!resp.rows[0]) return responderError(res, 201, 'El usuario no se encuentra registrado o está suspendido');
        datos_usuario = {
          usuarioIndex: resp.rows[0].aeroll_index,
          usuarioEmpresaId: '',
          usuarioAnoId: resp.rows[0].canolid ? token.encriptar(resp.rows[0].canolid) : '',
          usuarioId: token.encriptar(String(resp.rows[0].cusuaid)),
          academicoId: token.encriptar(String(resp.rows[0].cusuaid)),
          usuarioUnion: token.encriptar(user.cunioid),
          usuarioRollId: token.encriptar(String(resp.rows[0].cusuaroll)),
          usuarioRollNombre: resp.rows[0].crollnomb,
          usuarioNombre: resp.rows[0].cusuanomb,
          usuarioInstitucionNombre: '',
          usuarioNick: resp.rows[0].cusuanick,
          usuarioEstado: 'Activo'
        };
        break;

      case 1:
        // ESTUDIANTE
        resp = await Db.query({
          text: sql.inicio_estudiante,
          values: [username, roll]
        });
        if (!resp.rows[0]) return responderError(res, 201, 'El usuario no se encuentra registrado o está suspendido');
        datos_usuario = {
          usuarioIndex: resp.rows[0].aeroll_index,
          usuarioEmpresaId: token.encriptar(resp.rows[0].cinstid),
          usuarioAnoId: token.encriptar(resp.rows[0].canolid),
          usuarioId: token.encriptar(resp.rows[0].cusuaid),
          academicoId: token.encriptar(resp.rows[0].cestuid),
          usuarioUnion: token.encriptar(user.cunioid),
          usuarioRollId: token.encriptar(resp.rows[0].cusuaroll),
          usuarioRollNombre: resp.rows[0].crollnomb,
          usuarioNombre: resp.rows[0].estudiante,
          usuarioGrupo: resp.rows[0].ccursnomb,
          usuarioGrado: resp.rows[0].cgraddesc,
          usuarioInstitucionNombre: resp.rows[0].cinstnomb,
          usuarioNick: resp.rows[0].cusuanick,
          empresaLema: resp.rows[0].cinstlema,
          empresaEscudo: resp.rows[0].cinstescu,
          empresaTelefono: resp.rows[0].cinsttele,
          usuarioEstado: 'Activo'
        };
        break;

      case 2:
      case 6:
      case 7:
        // DOCENTE (2), COORDINADOR (6), SECRETARIA (7)
        resp = await Db.query({
          text: sql.inicio_Docente,
          values: [username, roll]
        });
        if (!resp.rows[0]) return responderError(res, 201, 'El usuario no se encuentra registrado o está suspendido');
        datos_usuario = {
          usuarioIndex: resp.rows[0].aeroll_index,
          usuarioEmpresaId: token.encriptar(resp.rows[0].cinstid),
          usuarioAnoId: token.encriptar(resp.rows[0].canolid),
          usuarioId: token.encriptar(resp.rows[0].cusuaid),
          academicoId: token.encriptar(resp.rows[0].cdoceid),
          usuarioUnion: token.encriptar(user.cunioid),
          usuarioRollId: token.encriptar(resp.rows[0].cusuaroll),
          usuarioRollNombre: resp.rows[0].crollnomb,
          usuarioNombre: resp.rows[0].nombre_completo,
          usuarioInstitucionNombre: resp.rows[0].cinstnomb,
          usuarioNick: resp.rows[0].cusuanick,
          empresaLema: resp.rows[0].cinstlema,
          empresaEscudo: resp.rows[0].cinstescu,
          empresaTelefono: resp.rows[0].cinsttele,
          usuarioEstado: 'Activo'
        };
        break;

      case 3:
        // INSTITUCION
        resp = await Db.query({
          text: sql.inicio_institucion,
          values: [username, roll]
        });
        if (!resp.rows[0]) return responderError(res, 201, 'El usuario no se encuentra registrado o está suspendido');
        datos_usuario = {
          usuarioIndex: resp.rows[0].aeroll_index,
          usuarioEmpresaId: token.encriptar(resp.rows[0].cinstid),
          usuarioAnoId: token.encriptar(resp.rows[0].canolid),
          usuarioId: token.encriptar(resp.rows[0].cusuaid),
          academicoId: token.encriptar(resp.rows[0].cinstid),
          usuarioUnion: token.encriptar(user.cunioid),
          usuarioRollId: token.encriptar(resp.rows[0].cusuaroll),
          usuarioRollNombre: resp.rows[0].crollnomb,
          usuarioNombre: resp.rows[0].cinstnomb,
          usuarioInstitucionNombre: resp.rows[0].cinstnomb,
          usuarioNick: resp.rows[0].cusuanick,
          empresaLema: resp.rows[0].cinstlema,
          empresaEscudo: resp.rows[0].cinstescu,
          empresaTelefono: resp.rows[0].cinsttele,
          usuarioEstado: 'Activo'
        };
        break;

      case 4:
        // ACUDIENTE
        resp = await Db.query({
          text: sql.inicio_acudiente,
          values: [username, roll]
        });
        if (!resp.rows[0]) return responderError(res, 201, 'El usuario no se encuentra registrado o está suspendido');
        datos_usuario = {
          usuarioIndex: resp.rows[0].aeroll_index,
          usuarioEmpresaId: token.encriptar(resp.rows[0].cinstid),
          usuarioAnoId: token.encriptar(resp.rows[0].canolid),
          usuarioId: token.encriptar(resp.rows[0].cusuaid),
          academicoId: token.encriptar(resp.rows[0].cestuacudid),
          usuarioUnion: token.encriptar(user.cunioid),
          usuarioRollId: token.encriptar(resp.rows[0].cusuaroll),
          usuarioRollNombre: resp.rows[0].crollnomb,
          usuarioNombre: resp.rows[0].nombre_completo,
          usuarioInstitucionNombre: resp.rows[0].cinstnomb,
          usuarioNick: resp.rows[0].cusuanick,
          empresaLema: resp.rows[0].cinstlema,
          empresaEscudo: resp.rows[0].cinstescu,
          empresaTelefono: resp.rows[0].cinsttele,
          usuarioEstado: 'Activo'
        };
        break;

      default:
        return responderError(res, 201, 'Tipo de usuario inválido');
    }

    // PRIVILEGES FOR MENUES (logic.tabmenu/tabopcimenu/tabrollopci/tabusuaopci)
    let resp2 = await Db.query({
      text: sql.privilegees,
      values: [parseInt(user.cusuaid)]
    });

    let miToken = await token.createtoken(datos_usuario);
    let miMenu = await token.createtoken(resp2.rows);
    datos_usuario.token = miToken;
    datos_usuario.privilegees = miMenu;
    if (datos_usuario.usuarioIndex != "" && resp2.rows.length != 0) {
      res.send({
        status: 'success',
        statusCode: 200,
        message: 'login correcto',
        rows: [{
          privilegees: resp2.rows,
          datos_usuario
        }]
      });
    } else {
      responderError(res, 201, 'El usuario no tiene menús habilitados o está suspendido');
    }
  } catch (error) {
    console.log(`Error de sistema: ${error}`);
    res.send({
      status: "error",
      StatusCode: 400,
      message: 'Ocurrio un error inesperado',
      rows: []
    });
  }
}
export default {
  login: login
};
