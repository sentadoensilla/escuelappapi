/**
 * dispatch.js — Notificación SAE → Escuelapp → Padre
 * Construye el mensaje, genera el enlace seguro, registra el envío en
 * data.aelog_envios (historial de comunicación) e intenta encolarlo en
 * WhatsApp (no fatal: si la infraestructura de WhatsApp no está lista,
 * el registro queda pendiente para reintento).
 */
const Db = require('../../database/conex');
const tokens = require('./tokens');
const sql = require('./integration.sql');

// Tipos de envío (data.aetipo_envio)
const TIPO = { COMUNICADO: 1, ASISTENCIA: 2, HORARIO: 3, EXCUSA: 4, TAREA: 5, EVALUACION: 6, CALENDARIO: 7, CONSULTA: 8, COBRO: 9, OBSERVACION: 10 };

/**
 * resolverEmisor: busca el número de WhatsApp de la institución SAE (cinstid)
 * usando el mapeo migracion.map_institucion → contact.emisor.
 * @param {number|string} idempresa cinstid (institución SAE)
 * @returns {string} número de WhatsApp o ''
 */
async function resolverEmisor(idempresa) {
    try {
        if (!idempresa) return '';
        const resp = await Db.query({ text: sql.resolverEmisor, values: [idempresa] });
        return (resp.rows[0] && resp.rows[0].numero) || '';
    } catch (err) {
        console.log('resolverEmisor: ', err.message);
        return '';
    }
}

/**
 * enviaNotificacion: registra y (si es posible) encola un WhatsApp.
 * @param {object} p { tipo, idreferencia, idempresa, emisor, aeestudiantes_id, destino, mensaje, enlace, acudiente }
 */
async function enviaNotificacion(p) {
    // 0) Si no viene emisor, resolverlo por institución SAE.
    const emisor = p.emisor || await resolverEmisor(p.idempresa);

    // 1) Insertar el registro de envío (historial de comunicación)
    const registro = {
        text: `INSERT INTO data.aelog_envios
                 (idlogenvios, idreferencia, idempresa, emisor, aeestudiantes_id, destino, tipo, fecharegistro, sent, enviosdetalles)
               VALUES ((SELECT COALESCE(MAX(idlogenvios)+1, 1) FROM data.aelog_envios), $1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, $7, $8)
               RETURNING idlogenvios`,
        values: [
            p.idreferencia || 0,     // NOT NULL
            p.idempresa || 0,        // NOT NULL
            emisor,                  // NOT NULL; '' = pendiente de mapeo
            p.aeestudiantes_id || 0, // NOT NULL
            p.destino || '',         // NOT NULL
            p.tipo || TIPO.COMUNICADO,
            false,
            JSON.stringify({ mensaje: p.mensaje, enlace: p.enlace, acudiente: p.acudiente || null }),
        ],
    };
    const resp = await Db.query(registro);
    const idlogenvios = resp.rows[0].idlogenvios;

    // 2) Intento de encolado en WhatsApp (Bull). No fatal: si la infra
    //    no está operativa, el envío queda pendiente (sent=false).
    try {
        const parallelQueue = require('../../utils/queues/parallelQueue');
        const cola = await parallelQueue.getInstance('queue' + (p.idempresa || 0));
        await cola.add({
            sessionId: emisor || '',
            to: p.destino,
            type: 'text',
            payload: { text: (p.mensaje || '') + '\n' + (p.enlace || '') },
        });
        // Marcar como enviado (la cola confirmó la aceptación).
        await Db.query({
            text: `UPDATE data.aelog_envios SET sent = true WHERE idlogenvios = $1`,
            values: [idlogenvios],
        });
    } catch (err) {
        // La cola no está disponible → el envío queda pendiente para reintento.
        console.log('dispatch: WhatsApp no disponible, envío queda pendiente ->', err.message);
    }

    return idlogenvios;
}

/**
 * mensajeEnlace: devuelve la URL del enlace seguro que consulta el evento.
 * Apunta a la página pública del frontend (/vista/:token), que valida contra
 * el backend (/integration/enlace/:token).
 * @param {string} token token firmado
 */
const urlEnlace = (token) => {
    const base = process.env.APP_API_FRONT || 'http://localhost:3000';
    return `${base}/vista/${token}`;
};

module.exports = { enviaNotificacion, urlEnlace, TIPO };
