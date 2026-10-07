import Db from "../../database/conex.js";
import sql from "./integration.sql.js";
import tokens from "./tokens.js";
import * as __mod0 from "./dispatch.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
/**
 * integrationController.js — Integration Layer (SAE → Escuelapp → Padre)
 * Expone adaptadores de lectura de SAE, detección de eventos y enlaces seguros.
 */
require('dotenv').config();
const {
  enviaNotificacion,
  urlEnlace,
  TIPO
} = __mod0;
export async function misEstudiantes(req, res) {
  try {
    const {
      identificacion
    } = req.body || {};
    if (!identificacion) {
      return res.send({
        status: 'error',
        statusCode: 400,
        message: 'Falta la identificación del acudiente',
        rows: []
      });
    }
    const resp = await Db.query({
      text: sql.identidadAcudiente,
      values: [identificacion]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' estudiantes',
      rows: resp.rows
    });
  } catch (error) {
    console.log('misEstudiantes: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo resolver la identidad',
      rows: []
    });
  }
}
export async function eventoAsistencia(req, res) {
  try {
    const {
      idnovedad
    } = req.body || {};
    if (!idnovedad) {
      return res.send({
        status: 'error',
        statusCode: 400,
        message: 'Falta idnovedad (tabnove)',
        rows: []
      });
    }
    const resp = await Db.query({
      text: sql.destinatariosNovedad,
      values: [idnovedad]
    });
    const destinatarios = resp.rows;
    const registros = [];
    for (const d of destinatarios) {
      const token = tokens.genera({
        tipo: 'novedad',
        ref: d.cnoveid,
        estudiante: d.cestuid,
        matricula: d.cmatrid,
        acudiente: d.cestuacudid
      });
      const enlace = urlEnlace(token);
      const mensaje = `${d.tiponovedad || 'Novedad'} de ${d.estudiante} (${d.curso || ''}) el ${d.cnovefech}: ${d.cnoveobse || ''}`;
      const idlog = await enviaNotificacion({
        tipo: TIPO.ASISTENCIA,
        idreferencia: d.cnoveid,
        idempresa: d.idinstitucion,
        aeestudiantes_id: d.cestuid,
        destino: d.telefono,
        mensaje,
        enlace,
        acudiente: d.acudiente
      });
      registros.push({
        idlog,
        estudiante: d.estudiante,
        acudiente: d.acudiente,
        destino: d.telefono,
        enlace
      });
    }
    res.send({
      status: 'success',
      statusCode: 200,
      message: registros.length + ' notificaciones generadas',
      rows: registros
    });
  } catch (error) {
    console.log('eventoAsistencia: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo procesar el evento de asistencia',
      rows: []
    });
  }
}
export async function eventoComunicado(req, res) {
  try {
    const {
      idaviso,
      limiteDemo
    } = req.body || {};
    let destinatarios = [];
    if (idaviso) {
      const aviso = await Db.query({
        text: sql.datoAviso,
        values: [idaviso]
      });
      if (aviso.rows.length === 0) {
        return res.send({
          status: 'error',
          statusCode: 404,
          message: 'Aviso no encontrado (tabavisroll está vacío en esta base)',
          rows: []
        });
      }
      // rolesAviso → acudientes (crollid=4) — con avisos reales se resolvería aquí.
      const demo = await Db.query({
        text: sql.acudientesDemo,
        values: [limiteDemo || 3]
      });
      destinatarios = demo.rows.map(r => ({
        ...r,
        _titulo: aviso.rows[0].titulo,
        _contenido: aviso.rows[0].contenido
      }));
    } else {
      const demo = await Db.query({
        text: sql.acudientesDemo,
        values: [limiteDemo || 3]
      });
      destinatarios = demo.rows.map(r => ({
        ...r,
        _titulo: 'Comunicado institucional',
        _contenido: 'Mensaje de prueba del Integration Layer.'
      }));
    }
    const registros = [];
    for (const d of destinatarios) {
      const token = tokens.genera({
        tipo: 'aviso',
        ref: idaviso || 0,
        acudiente: d.cestuacudid
      });
      const enlace = urlEnlace(token);
      const mensaje = `Comunicado: ${d._titulo}. ${d._contenido}`;
      const idlog = await enviaNotificacion({
        tipo: TIPO.COMUNICADO,
        idreferencia: idaviso || 0,
        idempresa: d.idinstitucion,
        aeestudiantes_id: d.cestuid,
        destino: d.telefono,
        mensaje,
        enlace,
        acudiente: d.acudiente
      });
      registros.push({
        idlog,
        acudiente: d.acudiente,
        destino: d.telefono,
        enlace
      });
    }
    res.send({
      status: 'success',
      statusCode: 200,
      message: registros.length + ' comunicados generados',
      rows: registros
    });
  } catch (error) {
    console.log('eventoComunicado: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo procesar el comunicado',
      rows: []
    });
  }
}
export async function abrirEnlace(req, res) {
  try {
    const {
      token
    } = req.params;
    const payload = tokens.valida(token);
    if (!payload) {
      return res.send({
        status: 'error',
        statusCode: 401,
        message: 'Enlace inválido',
        rows: []
      });
    }
    if (payload.expirado) {
      return res.send({
        status: 'error',
        statusCode: 410,
        message: 'Enlace expirado',
        rows: []
      });
    }

    // Registrar el acceso en estadistica.tabhistvis
    await Db.query({
      text: sql.registrarAcceso,
      values: ['web', payload.acudiente || 0, '/integration/enlace/' + token]
    });
    let evento = {};
    let estudiante = null;
    if (payload.tipo === 'novedad') {
      const d = await Db.query({
        text: sql.datoNovedad,
        values: [payload.ref]
      });
      const nov = await Db.query({
        text: sql.consultarNovedadesEstudiante,
        values: [payload.matricula]
      });
      evento = {
        tipo: 'novedad',
        ...(d.rows[0] || {}),
        historial: nov.rows
      };
    } else if (payload.tipo === 'aviso') {
      const d = await Db.query({
        text: sql.datoAviso,
        values: [payload.ref]
      });
      evento = {
        tipo: 'aviso',
        ...(d.rows[0] || {})
      };
    }
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Enlace válido',
      rows: {
        evento,
        estudiante
      }
    });
  } catch (error) {
    console.log('abrirEnlace: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo abrir el enlace',
      rows: []
    });
  }
}
export async function institucionesConfig(req, res) {
  try {
    const {
      limite
    } = req.body || {};
    const resp = await Db.query({
      text: sql.institucionesConEmisor,
      values: [limite || 200]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: resp.rows.length + ' instituciones',
      rows: resp.rows
    });
  } catch (error) {
    console.log('institucionesConfig: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo consultar',
      rows: []
    });
  }
}
export async function guardarEmisorInstitucion(req, res) {
  try {
    const {
      idinstitucion,
      idinstitucionescuelapp
    } = req.body || {};
    if (!idinstitucion || !idinstitucionescuelapp) {
      return res.send({
        status: 'error',
        statusCode: 400,
        message: 'Falta idinstitucion (SAE) o idinstitucionescuelapp (aeinst_id)',
        rows: []
      });
    }
    const cinstid = parseInt(token.decriptar(idinstitucion));
    const aeinst_id = parseInt(token.decriptar(idinstitucionescuelapp));
    await Db.query({
      text: sql.upsertMapInstitucion,
      values: [cinstid, aeinst_id]
    });
    res.send({
      status: 'success',
      statusCode: 200,
      message: 'Emisor mapeado a la institución',
      rows: {}
    });
  } catch (error) {
    console.log('guardarEmisorInstitucion: ', error);
    res.send({
      status: 'error',
      statusCode: 400,
      message: 'No se pudo mapear el emisor',
      rows: []
    });
  }
}
export default {
  misEstudiantes: misEstudiantes,
  eventoAsistencia: eventoAsistencia,
  eventoComunicado: eventoComunicado,
  abrirEnlace: abrirEnlace,
  institucionesConfig: institucionesConfig,
  guardarEmisorInstitucion: guardarEmisorInstitucion
};
