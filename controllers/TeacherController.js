import Db from "../database/conex.js";
import queryes from "../sql/teachers.js";
import token from "../utils/token.js";
import userWelcome from "../utils/notifications/mail/welcome.js";
export async function RegisterTeachers(req, res) {
  try {
    let {
      ano_lectivo,
      id_institucion,
      first_name,
      last_name,
      date_birth,
      direction,
      email,
      gender,
      number_identification,
      phone,
      profile,
      reemplazode
    } = req.body;
    let rolDocente = [2, 1],
      queryUser = {},
      queryDocente = {},
      queryAsociacion = {},
      queryAsociacionUpdate = {},
      queryUnion = {};
    let insertUser = '',
      insertDocente = '',
      insertAsociacion = '',
      insertUnion = '',
      resul = '',
      tok = '';
    let idUsuario = null,
      idDocente = null,
      herencias = {};
    let elRol = rolDocente[profile] || 2;
    ano_lectivo = parseInt(ano_lectivo);
    id_institucion = parseInt(id_institucion);
    email = email.toLowerCase().trim();
    number_identification = number_identification.trim();
    first_name = token.capitalizeFirstLetter(first_name);
    last_name = token.capitalizeFirstLetter(last_name);

    //let key_user = await encryp.pass(number_identification)
    queryUser = {
      text: queryes.insertTeacherUser,
      values: [first_name, email, number_identification, elRol, 1]
    };
    await Db.query(queryUser).then(resp => {
      if (resp.rowCount > 0) {
        idUsuario = parseInt(resp.rows[0].aeusu_id);
        insertUser = resp;
      }
    }).catch(error => {
      res.status(400).send(error.toString());
    });
    queryDocente = {
      text: queryes.insertTeacher,
      values: [idUsuario, number_identification, first_name, last_name, date_birth, gender, direction, phone, email]
    };
    await Db.query(queryDocente).then(async resp2 => {
      if (resp2.rowCount > 0) {
        idDocente = parseInt(resp2.rows[0].aedocentes_id);
        insertDocente = resp2;

        //CUANDO REEMPLAZA A OTRO, HEREDA LAS ASIGNACIONES Y LAS ASISTENCIAS
        if (reemplazode != "" && reemplazode != null) {
          let herencias = await reemplazaTeacher({
            idanolectivo: ano_lectivo,
            idinstitucion: id_institucion,
            old: parseInt(reemplazode),
            new: idDocente
          });
          console.log('resultados de la herencia: ', herencias);
        }
      }
    }).catch(async error => {
      tok = await token.createtoken('Los datos presentan errores inesperados');
      res.status({
        status: 'error',
        statusCode: 400,
        message: 'Los datos presentan errores inesperados',
        token: tok
      });
    });

    //2; TEACHER, 1: ADMIN
    switch (elRol) {
      case 1:
        queryAsociacionUpdate = {
          text: queryes.updateDocenteAsociacion,
          values: [elRol, idUsuario, id_institucion, id_institucion, ano_lectivo, 1]
        };
        queryAsociacion = {
          text: queryes.insertDocenteAsociacion,
          values: [elRol, idUsuario, id_institucion, id_institucion, ano_lectivo, 1]
        };
        break;
      case 2:
        queryAsociacionUpdate = {
          text: queryes.updateDocenteAsociacion,
          values: [elRol, idUsuario, idDocente, id_institucion, ano_lectivo, 1]
        };
        queryAsociacion = {
          text: queryes.insertDocenteAsociacion,
          values: [elRol, idUsuario, idDocente, id_institucion, ano_lectivo, 1]
        };
        break;
    }
    queryUnionUpdate = {
      text: queryes.updateDocenteUnion,
      values: [id_institucion, idDocente, ano_lectivo, 1]
    };
    queryUnion = {
      text: queryes.insertDocenteUnion,
      values: [id_institucion, idDocente, ano_lectivo, 1]
    };

    //INTENTAMOS ACTUALIZAR, SI NO SE PUEDE INSERTAMOS EL REGISTRO
    await Db.query(queryAsociacionUpdate).then(async asociar => {
      insertAsociacion = asociar;
      if (asociar.rowCount < 1) {
        insertAsociacion = await Db.query(queryAsociacion);
      }
    }).catch(async error => {
      tok = await token.createtoken('Los datos presentan errores inesperados');
      res.status({
        status: 'error',
        statusCode: 400,
        message: 'Los datos presentan errores inesperados',
        token: tok
      });
    });

    //INTENTAMOS ACTUALIZAR, SI NO SE PUEDE INSERTAMOS EL REGISTRO
    await Db.query(queryUnionUpdate).then(async unir => {
      insertUnion = unir;
      if (unir.rowCount < 1) {
        insertUnion = await Db.query(queryUnion);
      }
    }).catch(async error => {
      tok = await token.createtoken('Los datos presentan errores inesperados');
      res.status({
        status: 'error',
        statusCode: 400,
        message: 'Los datos presentan errores inesperados',
        token: tok
      });
    });
    console.log('insertUser: ', insertUser.rowCount);
    console.log('insertDocente: ', insertDocente.rowCount);
    console.log('insertAsociacion: ', insertAsociacion.rowCount);
    console.log('insertUnion: ', insertUnion.rowCount);
    if (insertUser.rows.length != 0 && insertDocente.rows.length != 0 && insertAsociacion.rows.length != 0 && insertUnion.rows.length != 0) {
      resul = {
        id: idDocente,
        first_name,
        last_name,
        date_birth,
        direction,
        email,
        gender,
        number_identification,
        phone,
        result: 'Usuario Creado con Exito, el docente recibira un mail de bienvenida en ' + email
      };
      tok = await token.createtoken(resul);
      let mail = await userWelcome.send(first_name + ' ' + last_name, email, number_identification);
    } else {
      resul = {
        id: 0,
        first_name: 'Error',
        last_name: 'Error',
        date_birth,
        direction,
        email,
        gender,
        number_identification,
        phone,
        result: 'Hubo un problema creando el usuario, por favor contacte al administrador'
      };
      tok = await token.createtoken(resul);
    }
    res.send({
      status: 'success',
      statusCode: 200,
      message: resul.result,
      token: tok
    });
  } catch (error) {
    tok = await token.createtoken('El sistema experimenta errores inesperados');
    res.status({
      status: 'error',
      statusCode: 400,
      message: 'El sistema experimenta errores inesperados',
      token: tok
    });
  }
}
export async function Allteachers(req, res) {
  let tok = "";
  try {
    let {
      id_institucion,
      ano_lectivo
    } = req.body;
    if (ano_lectivo != "" && ano_lectivo != null && id_institucion != "" && id_institucion != null) {
      id_institucion = parseInt(id_institucion);
      ano_lectivo = parseInt(ano_lectivo);
      await Db.query({
        text: queryes.allTeachers,
        values: [id_institucion, ano_lectivo]
      }).then(async resp => {
        tok = await token.createtoken(resp.rows);
        res.send({
          status: 'success',
          statusCode: 200,
          message: 'Teachers',
          token: tok
        });
      }).catch(async error => {
        tok = await token.createtoken('Los datos presentan un problema inesperado');
        res.send({
          status: 'error',
          statusCode: 400,
          message: 'No teachers',
          token: tok
        });
      });
    } else {
      tok = await token.createtoken('La institucion y el año lectivo son indispensables');
      res.send({
        status: 'error',
        statusCode: 400,
        message: 'No teachers',
        token: tok
      });
    }
  } catch (error) {
    tok = await token.createtoken('El sistema experimenta errores inesperados, intente nuevamente');
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No system',
      token: tok
    });
  }
}
export async function updateTeachers(req, res) {
  try {
    let {
      id_institucion,
      ano_lectivo,
      id_usu,
      id,
      idusuario,
      first_name,
      last_name,
      date_birth,
      direction,
      email,
      gender,
      number_identification,
      phone,
      profile
    } = req.body;
    let rolDocente = [2, 1],
      query = '',
      query2 = '',
      resp = '',
      resp2 = '',
      resul = {
        result: 'No fue posible actualizar el usuario'
      },
      tok = '';
    //ESTO SI TIENE SENTIDO, EN LA VISTA, EL DOCENTE ES 0 Y EL ADMIN ES 1, SON LOS INDICES DE rolDocente
    let elRol = rolDocente[profile] || 2;
    id = parseInt(id);
    id_institucion = parseInt(id_institucion);
    ano_lectivo = parseInt(ano_lectivo);
    id_usu = parseInt(id_usu);
    idusuario = parseInt(idusuario);
    email = email.toLowerCase().trim();
    number_identification = number_identification.trim();
    first_name = token.capitalizeFirstLetter(first_name);
    last_name = token.capitalizeFirstLetter(last_name);
    if (email.indexOf('@') > -1 && id != "") {
      //2; TEACHER, 1: ADMIN
      switch (elRol) {
        case 1:
          query = {
            text: `
                            -- CAMBIAR DATOS DE USUARIO
                            UPDATE engine.aeusu 
                            SET aeusu_nombre = $1 || ' ' || $2, aeusu_nick=$3, aeusu_llave=$5
                            WHERE aeusu_id = (SELECT aeusu_id FROM data.aedocentes WHERE aedocentes_id=$4);`,
            values: [first_name, last_name, email, id, number_identification]
          };
          query2 = {
            text: `
                            -- CAMBIAR DATOS DE DOCENTE
                            UPDATE data.aedocentes 
                            SET
                                aedocentes_identificacion = $1, 
                                aedocentes_nombres = $2, aedocentes_apellidos = $3,
                                aedocentes_fechanacimiento = $4, aedocentes_genero = $5, 
                                aedocentes_direccion = $6, aedocentes_telefono= $7, 
                                aedocentes_mail = $8 
                            WHERE aedocentes_id = $9;`,
            values: [number_identification, first_name, last_name, date_birth, gender, direction, phone, email, id]
          };
          break;
        case 2:
          query = {
            text: `-- CAMBIAR DATOS DE USUARIO
                            UPDATE engine.aeusu 
                            SET aeusu_nombre = $1 || ' ' || $2, aeusu_nick=$3, aeusu_llave=$5
                            WHERE aeusu_id = (SELECT aeusu_id FROM data.aedocentes WHERE aedocentes_id=$4);`,
            values: [first_name, last_name, email, id, number_identification]
          };
          query2 = {
            text: `-- CAMBIAR DATOS DE DOCENTE
                            UPDATE data.aedocentes 
                            SET
                                aedocentes_identificacion = $1, 
                                aedocentes_nombres = $2, aedocentes_apellidos = $3,
                                aedocentes_fechanacimiento = $4, aedocentes_genero = $5, 
                                aedocentes_direccion = $6, aedocentes_telefono= $7, 
                                aedocentes_mail = $8 
                            WHERE aedocentes_id = $9;`,
            values: [number_identification, first_name, last_name, date_birth, gender, direction, phone, email, id]
          };
          break;
      }
      await Db.query(query).then(async cambio => {
        resp = cambio;
        if (cambio.rowCount > 0) {
          await Db.query(query2).then(async cambio2 => {
            resp2 = cambio2;
            if (cambio2.rowCount > 0) {
              await Db.query({
                text: `
                                    -- CAMBIAR EL ROL DEL DOCENTE EN LA TABLA DE ASOCIACIONES
                                    UPDATE 
                                        engine.aeusuroll 
                                    SET
                                        aeroll_id=$5
                                    WHERE aeacad_referencia=$3 AND aeusu_id=$4
                                    AND aeinst_id = $1 AND aeanol_id=$2;`,
                values: [id_institucion, ano_lectivo, id, idusuario, profile]
              }).then(async asociacion => {
                if (asociacion.rowCount > 0) {
                  resul = {
                    id,
                    first_name,
                    last_name,
                    date_birth,
                    direction,
                    email,
                    gender,
                    number_identification,
                    phone,
                    result: `Usuario ${first_name} ${last_name} actualizado`
                  };
                } else {
                  resul = {
                    id,
                    first_name,
                    last_name,
                    date_birth,
                    direction,
                    email,
                    gender,
                    number_identification,
                    phone,
                    result: `No fue posible actualizar el usuario ${first_name} ${last_name}, pruebe, eliminandolo primero y luego agregandolo nuevamente`
                  };
                }
              }).catch(async error => {
                tok = await token.createtoken('Los datos no responden adecuadamente, por favor intente nuevamente en un rato');
                res.send({
                  status: 'error',
                  statusCode: 400,
                  message: 'Los datos no responden adecuadamente, por favor intente nuevamente en un rato' + error.toString(),
                  token: tok
                });
              });
            } else {
              resul = {
                id,
                first_name,
                last_name,
                date_birth,
                direction,
                email,
                gender,
                number_identification,
                phone,
                result: `No fue posible actualizar el usuario ${first_name} ${last_name}, pruebe, eliminandolo primero y luego agregandolo nuevamente`
              };
            }
          }).catch(async error => {
            tok = await token.createtoken('Los datos no responden adecuadamente, por favor intente nuevamente en un rato');
            res.send({
              status: 'error',
              statusCode: 400,
              message: 'Los datos no responden adecuadamente, por favor intente nuevamente en un rato' + error.toString(),
              token: tok
            });
          });
        } else {
          resul = {
            id,
            first_name,
            last_name,
            date_birth,
            direction,
            email,
            gender,
            number_identification,
            phone,
            result: `No fue posible actualizar el usuario ${first_name} ${last_name}, pruebe, eliminandolo primero y luego agregandolo nuevamente`
          };
        }
        tok = await token.createtoken(resul);
        res.send({
          status: 'success',
          statusCode: 200,
          message: resul.result,
          token: tok
        });
      }).catch(async error => {
        tok = await token.createtoken('El sistema no responde adecuadamente, por favor intente nuevamente en un rato');
        res.send({
          status: 'error',
          statusCode: 400,
          message: 'El sistema no responde adecuadamente, por favor intente nuevamente en un rato',
          token: tok
        });
      });
    } else {
      res.send({
        status: 'success',
        statusCode: 400,
        message: ' No fue posible hacer el cambio, por favor verificar el correo ' + email,
        token: tok
      });
    }
  } catch (error) {
    console.log(error);
    tok = await token.createtoken('El sistema experimenta errores inesperados, intente nuevamente');
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No system',
      token: tok
    });
  }
}
export async function deleteTeachers(req, res) {
  let resul = {
      result: 'El docente sigue aqui! no lo pude eliminar'
    },
    tok = {};
  try {
    let {
      id_docente,
      id_institucion,
      ano_lectivo
    } = req.body;
    id_docente = parseInt(id_docente);
    id_institucion = parseInt(id_institucion);
    ano_lectivo = parseInt(ano_lectivo);
    let docente = await Db.query({
      text: queryes.getDocenteUnico,
      values: [id_docente]
    });
    let borrarAsociacion = await Db.query({
      text: queryes.deleteDocenteAsociacion,
      values: [id_docente, id_institucion, ano_lectivo]
    });
    let borrarUnion = await Db.query({
      text: queryes.deleteDocenteUnion,
      values: [id_institucion, ano_lectivo, id_docente]
    });
    if (borrarAsociacion.rowCount > 0 && borrarUnion.rowCount > 0) {
      resul = {
        aedocentes_id: docente.rows[0].aedocentes_id,
        aedocentes_nombres: docente.rows[0].aedocentes_nombres,
        aedocentes_apellidos: docente.rows[0].aedocentes_apellidos,
        result: `Docente Eliminado ${docente.rows[0].aedocentes_nombres} ${docente.rows[0].aedocentes_apellidos} eliminado`
      };
      tok = await token.createtoken(resul);
    } else {
      resul = {
        aedocentes_id: docente.rows[0].aedocentes_id,
        aedocentes_nombres: docente.rows[0].aedocentes_nombres,
        aedocentes_apellidos: docente.rows[0].aedocentes_apellidos,
        result: `${docente.rows[0].aedocentes_nombres} ${docente.rows[0].aedocentes_apellidos} no pudo ser eliminado, sigue vivo!!`
      };
      tok = await token.createtoken(resul);
    }
    res.send({
      status: 'success',
      statusCode: 200,
      message: resul.result,
      token: tok
    });
  } catch (error) {
    console.log(error);
    resul = {
      result: 'El sistema experimenta errores inesperados'
    };
    tok = await token.createtoken(resul.result);
    res.send({
      status: 'error',
      statusCode: 400,
      message: resul.result,
      token: tok
    });
  }
}
export async function reemplazaTeacher(datos) {
  //CUANDO REEMPLAZA A OTRO, HEREDA LAS ASIGNACIONES Y LAS ASISTENCIAS
  let resultados = {
    asigments: 0,
    attendances: 0
  };
  if (datos.old != "" && datos.old != null) {
    let miQuery = {
      text: queryes.inheritAssignations,
      values: [datos.idanolectivo, datos.idinstitucion, datos.old, datos.new]
    };
    console.log('query de reemplazo: ', miQuery);
    await Db.query(miQuery).then(asigments => {
      resultados.asigments = asigments.rowCount;
      console.log('Reemplazados: ', asigments.rowCount);
      return resultados;
    });
  } else {
    return resultados;
  }
}
export default {
  RegisterTeachers: RegisterTeachers,
  Allteachers: Allteachers,
  updateTeachers: updateTeachers,
  deleteTeachers: deleteTeachers,
  reemplazaTeacher: reemplazaTeacher
};
