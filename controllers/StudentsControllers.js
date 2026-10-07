import Db from "../database/conex.js";
import token from "../utils/token.js";
import userWelcome from "../utils/notifications/mail/welcome.js";
import querys from "../sql/students.js";
import moment from "moment";
export async function Register(req, res) {
  let {
    institucion_id,
    ano_lectivo,
    first_name,
    last_name,
    date_birth,
    direction,
    email,
    gender,
    number_identification,
    phone,
    code,
    acu_direction,
    acu_gender,
    acu_last_names,
    acu_nombres,
    acu_phone,
    group,
    number_identification_acu,
    acu_email
  } = req.body;
  const ahora = moment().format('YYYY-MM-DD HH:m:s');
  try {
    //REGISTRO DE USUARIO PARA ACUDIENTE
    let acuUsuIns = `INSERT INTO engine.aeusu(aeusu_id, aeusu_nombre, aeusu_nick, aeusu_llave, aeroll_id, aeusu_estado, aeusu_token)
                          VALUES ((SELECT MAX(aeusu_id)+1 FROM engine.aeusu),$1, $2, $3, $4, $5, $6) RETURNING aeusu_id`;

    //let key_user = await encryp.pass(number_identification)
    let query = {
      name: 'Register',
      text: acuUsuIns,
      values: [acu_nombres + ' ' + acu_last_names, email, number_identification_acu, 6, 1, null]
    };
    let acuUsuResp = await Db.query(query);
    let acuAcadIns = `
                INSERT INTO data.aeacudientes(
                    aeacudientes_id, aeusu_id, aeestudiantes_id, aeestudiantes_fecharegistro, 
                    aeestudiantes_idenacudiente, aeestudiantes_nombresacudiente, 
                    aeestudiantes_apellidosacudiente, aeestudiantes_generoacudiente, 
                    aeestudiantes_direccionacudiente, aeestudiantes_telefonoacudiente, 
                    aeestudiantes_mailacudiente, aeestudiantes_fotoacudiente, aeestudiantes_estado)
                VALUES ((SELECT MAX(aeacudientes_id)+1 FROM data.aeacudientes), $1, $2, $3, 
                    $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING aeacudientes_id             
                `;
    let query2 = {
      name: 'Reg Acudiente',
      text: acuAcadIns,
      values: [acuUsuResp.rows[0].aeusu_id, null, ahora, number_identification_acu, acu_nombres, acu_last_names, acu_gender, acu_direction, acu_phone, email, null, 1]
    };
    let acuAcadResp = await Db.query(query2);
    let acuUnion = `INSERT INTO engine.aeusuroll(aeusuroll_id,aeroll_id, aeusu_id, aeacad_referencia, aeusuroll_estado)
                VALUES ((SELECT MAX(aeusuroll_id)+1 FROM engine.aeusuroll),$1, $2, $3, $4)RETURNING aeusuroll_id`;
    let query3 = {
      name: 'Registerol',
      text: acuUnion,
      values: [3, parseInt(acuUsuResp.rows[0].aeusu_id), parseInt(acuAcadResp.rows[0].aeacudientes_id), 1]
    };
    let acuUnionResp = await Db.query(query3);

    //CREACION DEL USUARIO DE ESTUDIANTE
    let consul = `INSERT INTO engine.aeusu(aeusu_id, aeusu_nombre, aeusu_nick, aeusu_llave, aeroll_id, aeusu_estado, aeusu_token)
                          VALUES ((SELECT MAX(aeusu_id)+1 FROM engine.aeusu),$1, $2, $3, $4, $5, $6) RETURNING aeusu_id`;

    //let key_user = await encryp.pass(number_identification)
    let query4 = {
      name: 'Register',
      text: consul,
      values: [first_name, email, number_identification, 3, 1, null]
    };
    let resp = await Db.query(query4);
    let consul2 = `INSERT INTO data.aeestudiantes(
                aeestudiantes_id, aeinstitucion_id, aeano_id, aeacudientes_id, 
                aeestudiantes_fecharegistro, aeestudiantes_mail, aeestudiantes_codigo, 
                aeestudiantes_grupo, aeestudiantes_nombres, aeestudiantes_apellidos, 
                aeestudiantes_identificacion, aeestudiantes_fechanacimiento, 
                aeestudiantes_genero, aeestudiantes_direccion, aeestudiantes_telefono, 
                aeusu_id, aeestudiantes_estado)
                VALUES ((SELECT MAX(aeestudiantes_id)+1 FROM data.aeestudiantes),
                $1, $2, $3, $4, 
                        $5, $6, $7, 
                        $8, $9, $10, 
                        $11, $12, 
                        $13, $14, $15, 
                        $16) RETURNING aeestudiantes_id`;
    let query5 = {
      name: 'registro-studen',
      text: consul2,
      values: [institucion_id, ano_lectivo, parseInt(acuAcadResp.rows[0].aeacudientes_id), ahora, email, code, group, first_name, last_name, number_identification, date_birth, gender, direction, phone, parseInt(acuUsuResp.rows[0].aeusu_id), 1]
    };
    let resp2 = await Db.query(query5);
    let consul3 = `INSERT INTO engine.aeusuroll(
                aeusuroll_id,aeroll_id, aeusu_id, aeacad_referencia, aeusuroll_estado)
                VALUES ((SELECT MAX(aeusuroll_id)+1 FROM engine.aeusuroll),$1, $2, $3, $4)RETURNING aeusuroll_id`;
    let query6 = {
      name: 'Registerol',
      text: consul3,
      values: [3, parseInt(resp.rows[0].aeusu_id), parseInt(resp2.rows[0].aeestudiantes_id), 1]
    };
    let resp3 = await Db.query(query6);
    if (resp.rows.length != 0 && resp2.rows.length != 0 && resp3.rows.length != 0) {
      let resul = {
        id: resp2.rows[0].aeestudiantes_id,
        institucion_id,
        ano_lectivo,
        first_name,
        last_name,
        date_birth,
        direction,
        email,
        gender,
        number_identification,
        phone,
        code,
        acu_direction,
        acu_gender,
        acu_last_names,
        acu_nombres,
        acu_phone,
        group,
        number_identification_acu
      };
      console.log(resul);
      let tok = await token.createtoken(resul);
      //let mail = await userWelcome.send({first_name,last_name,email,number_identification});
      res.status(200).send({
        status: 'success',
        statusCode: 200,
        message: 'Usuario Creado con Exito',
        token: tok
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error.toString());
  }
}
export async function Allstudents(req, res) {
  let tok = "";
  let {
    id_institucion,
    ano_lectivo,
    rol
  } = req.body;
  try {
    let resp = await Db.query({
      text: querys.allStudents,
      values: [parseInt(id_institucion), parseInt(ano_lectivo)]
    });
    tok = await token.createtoken(resp.rows);
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Students',
      token: tok
    });
  } catch (error) {
    console.log(error);
    tok = await token.createtoken('El sistema presenta un error inesperado');
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'El sistema presenta un error inesperado',
      token: tok
    });
  }
}
export async function updateStudents(req, res) {
  let tok = "";
  try {
    let {
      id,
      id_usu,
      aeusu_id,
      institucion_id,
      ano_lectivo,
      first_name,
      last_name,
      date_birth,
      direction,
      email,
      gender,
      number_identification,
      phone,
      code,
      acu_direction,
      acu_gender,
      acu_last_names,
      acu_nombres,
      acu_phone,
      group,
      acu_email,
      number_identification_acu
    } = req.body;
    gender = gender != "undefined" ? gender : '';
    acu_gender = acu_gender != "undefined" ? acu_gender : '';
    email = email != "undefined" && email != "" ? email.trim().toLowerCase() : null;
    if (email.indexOf('@') > -1) {
      //IF email EXIST DO NOT PERFORM OTHER QUERYES      
      let respverificarUsuario = await Db.query({
        text: querys.checkUser,
        values: [email]
      });

      // console.log(aeusu_id, respverificarUsuario.rows);
      if (parseInt(respverificarUsuario.rows[0].aeusu_id) == parseInt(aeusu_id)) {
        let resp = await Db.query({
          text: querys.updateStudentsUser,
          values: [first_name, last_name, email, id]
        });
        if (resp.rowCount > 0) {
          let query2 = {
            text: querys.updateStudentsPersonal,
            values: [code, group, first_name, last_name, number_identification_acu, date_birth, gender, direction, phone, email, id]
          };
          console.log('update students: ', query2);
          let resp2 = await Db.query(query2);
          let query3 = {
            text: querys.updateStudentsParents,
            values: [number_identification_acu, acu_nombres, acu_last_names, acu_gender, acu_direction, acu_phone, acu_email, id]
          };
          console.log('update parents: ', query3);
          let resp3 = await Db.query(query3);

          // REVISAR LUEGO COMO INTEGRAR DENTRO DE LA EDICION DEL ACUDIENTE CON SU RESPECTIVO USUARIO

          let resul = {
            id,
            institucion_id,
            ano_lectivo,
            first_name,
            last_name,
            date_birth,
            direction,
            acu_email,
            gender,
            number_identification,
            phone,
            code,
            acu_direction,
            acu_gender,
            acu_last_names,
            acu_nombres,
            acu_phone,
            acu_email,
            group,
            number_identification_acu
          };
          let tok = await token.createtoken(resul);
          res.send({
            status: 'success',
            statusCode: 200,
            message: 'Estudiante Actualizado con exito',
            token: tok
          });
        }
      } else {
        let tok = await token.createtoken('El correo ' + email + ' parece estar presente en mas de un estudiante, por favor reportelo a colarqui@arquidiocesanos.edu.co');
        res.send({
          status: 'success',
          statusCode: 200,
          message: 'El correo ' + email + ' parece estar presente en mas de un estudiante, por favor reportelo a colarqui@arquidiocesanos.edu.co',
          token: tok
        });
      }
    } else {
      tok = await token.createtoken('El correo ' + email + ' No existe previamente, es dificil actualizar algo que no existe');
      res.send({
        status: 'success',
        statusCode: 200,
        message: ' Correo existe previamente ',
        token: tok
      });
    }
  } catch (error) {
    console.log(error);
    tok = await token.createtoken('El sistema experimenta errores inesperados ');
    res.send({
      status: 'error',
      statusCode: 400,
      message: ' EL sistema experimenta errores inesperados ',
      token: tok
    });
  }
}
export async function deleteStudents(req, res) {
  let {
    id
  } = req.body;
  let upda = `UPDATE data.aeestudiantes SET aeestudiantes_estado = $1 WHERE aeestudiantes_id = $2  RETURNING *`;
  let deldoc = {
    name: 'del-students',
    text: upda,
    values: [0, id]
  };
  try {
    let resp = await Db.query(deldoc);
    if (resp.rows.length != 0) {
      let dele = `UPDATE engine.aeusu SET aeusu_estado = $1 WHERE aeusu_id = $2  RETURNING aeusu_id`;
      let query = {
        name: "del-usu",
        text: dele,
        values: [0, resp.rows[0].aeusu_id]
      };
      let resp2 = await Db.query(query);
      console.log(resp2.rows);
      let resul = {
        aeestudiantes_id: id,
        aeestudiantes_nombres: resp.rows[0].aeestudiantes_nombres,
        aeestudiantes_apellidos: resp.rows[0].aeestudiantes_apellidos
      };
      let tok = await token.createtoken(resul);
      res.status(200).send({
        status: 'success',
        statusCode: 200,
        message: 'Estudiante Eliminado',
        token: tok
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
}
export default {
  Register: Register,
  Allstudents: Allstudents,
  updateStudents: updateStudents,
  deleteStudents: deleteStudents
};
