import Db from "../database/conex.js";
import token from "../utils/token.js";
import queryHorarios from "../sql/horarios.js";
import * as __mod0 from "express";
import moment from "moment";
const {
  query
} = __mod0;
export async function Create(req, res) {
  let {
    ano_lectivo,
    institucion_id,
    teacher,
    group,
    day,
    asignments,
    time,
    link
  } = req.body;
  let consul = `INSERT INTO data.aeasignaciones(
            aeasignaciones_id,aeanol_id, aeinst_id, aedocentes_id, aeasignaciones_asignatura, 
            aeasignaciones_grupo, aeasignaciones_dia, aeasignaciones_hora, 
            aeasignaciones_horafin, aeasignaciones_utiles, aeasignaciones_enlace, 
            aeasignaciones_estado)
            VALUES ((SELECT MAX(aeasignaciones_id)+1 FROM data.aeasignaciones),$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`;
  let query = {
    name: 'create Horario',
    text: consul,
    values: [ano_lectivo, institucion_id, parseInt(teacher), asignments, group, parseInt(day), time, null, null, link, 1]
  };
  try {
    console.log('Laquery: ', query);
    let resp = await Db.query(query);
    let tok = await token.createtoken(resp.rows[0]);
    res.status(200).send({
      status: 'success',
      statusCode: 200,
      message: 'Horario creado',
      token: tok
    });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
}
export async function Horario(req, res) {
  let tok = "";
  try {
    let {
      ano_lectivo,
      id_institucion,
      group
    } = req.body;
    console.log(group);
    let resp = await Db.query({
      name: "horario",
      text: queryHorarios.horarios,
      values: [ano_lectivo, id_institucion, group]
    });
    //console.log('La rows: ', resp.rows)
    let tok = await token.createtoken(resp.rows);
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Horario',
      token: tok
    });
  } catch (error) {
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'El sustema presenta un error inesperado',
      token: tok
    });
  }
}
export async function HorarioSeguimiento(req, res) {
  try {
    let {
      group,
      fechainicio,
      fechafin
    } = req.body;
    const id_institucion = parseInt(token.decriptar(req.user.usuarioEmpresaId));
    const ano_lectivo = parseInt(token.decriptar(req.user.usuarioAnoId));
    const fechaini = fechainicio ? moment(fechainicio).format('YYYY-MM-DD').toString() : moment().subtract(8, "days").format('YYYY-MM-DD').toString();
    const fechaf = fechafin ? moment(fechafin).format('YYYY-MM-DD').toString() : moment().format('YYYY-MM-DD').toString();
    console.log(ano_lectivo, id_institucion, group, fechaini, fechaf);
    let resp = await Db.query({
      text: queryHorarios.horariosSeguimiento,
      values: [ano_lectivo, id_institucion, group, fechaini, fechaf]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' Asistencias encontradas',
      rows: resp.rows
    });
  } catch (error) {
    console.log('HorarioSeguimiento try:', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'El sistema presenta un error inesperado',
      rows: []
    });
  }
}
export async function HorariTeacher_doc(req, res) {
  let {
    ano_lectivo,
    id_institucion,
    id_docente
  } = req.body;
  let consul = `
       SELECT row_to_json(u)
       FROM (
           SELECT y.aeasignaciones_hora,
           (
               SELECT
                   array_agg(x)
               FROM (
                   SELECT a.aeasignaciones_id, a.aeasignaciones_dia, a.aeasignaciones_hora, a.aeasignaciones_asignatura, 
                   a.aeasignaciones_grupo, a.aeasignaciones_enlace
                   FROM data.aeasignaciones a, data.aedocentes d
                   WHERE a.aeanol_id=$1 -- ID ANOLECTIVO
                   AND a.aeinst_id=$2 -- ID INSTITUCION
                   AND a.aedocentes_id=$3 -- ID DOCENTE
                   AND a.aeasignaciones_estado=1 
                   AND a.aedocentes_id=d.aedocentes_id	
                   AND a.aedocentes_id=d.aedocentes_id
                   GROUP BY a.aeasignaciones_dia, a.aeasignaciones_hora, a.aeasignaciones_grupo, a.aeasignaciones_id
                   ORDER BY aeasignaciones_dia, aeasignaciones_hora
               ) x
               WHERE x.aeasignaciones_hora=y.aeasignaciones_hora
           ) as detalles
           FROM data.aeasignaciones y
           WHERE y.aeanol_id=$1 -- ID ANOLECTIVO
           AND y.aeinst_id=$2 -- ID INSTITUCION
           AND y.aedocentes_id=$3 -- IDDOCENTE
           GROUP BY y.aeasignaciones_hora
           ORDER BY aeasignaciones_hora
       ) u;`;
  let query = {
    name: "horario-doce",
    text: consul,
    values: [ano_lectivo, id_institucion, id_docente]
  };
  try {
    let resp = await Db.query(query);
    let tok = await token.createtoken(resp.rows);
    res.status(200).send({
      status: 'success',
      statusCode: 200,
      message: 'Horario',
      token: tok
    });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
}
export async function UpdateHorario(req, res) {
  try {
    let {
      id,
      teacher,
      group,
      day,
      asignments,
      time,
      link
    } = req.body;
    let consul = `UPDATE data.aeasignaciones
                    SET  aedocentes_id=$2, aeasignaciones_asignatura=$3, 
                            aeasignaciones_grupo=$4, aeasignaciones_dia=$5, aeasignaciones_hora=$6, 
                            aeasignaciones_horafin=$7, aeasignaciones_utiles=$8, aeasignaciones_enlace=$9
                        WHERE aeasignaciones_id=$1
                        RETURNING *`;
    let query = {
      name: 'update',
      text: consul,
      values: [id, teacher, asignments, group, day, time, null, null, link]
    };
    let resp = await Db.query(query);
    if (resp.rows.length != 0) {
      let resul = {
        id,
        teacher,
        group,
        day,
        asignments,
        time,
        link
      };
      let tok = await token.createtoken(resul);
      res.status(200).send({
        status: 'success',
        statusCode: 200,
        message: 'Horario',
        token: tok
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
}
export async function DeleteHorario(req, res) {
  let {
    id
  } = req.body;
  let consul = `DELETE FROM data.aeasignaciones WHERE aeasignaciones_id=$1`;
  let query = {
    name: 'delet',
    text: consul,
    values: [id]
  };
  try {
    let resp = await Db.query(query);
    if (resp.rowCount === 1) {
      let tok = await token.createtoken(id);
      res.status(200).send({
        status: 'success',
        statusCode: 200,
        message: 'Horario',
        token: tok
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
}
export default {
  Create: Create,
  Horario: Horario,
  HorarioSeguimiento: HorarioSeguimiento,
  HorariTeacher_doc: HorariTeacher_doc,
  UpdateHorario: UpdateHorario,
  DeleteHorario: DeleteHorario
}; // const ahora = moment().format('YYYY-MM-DD HH:mm:ss');
