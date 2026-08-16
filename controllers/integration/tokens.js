/**
 * tokens.js — Enlaces seguros (Integration Layer)
 * Genera y valida enlaces firmados con expiración para notificaciones
 * SAE → Escuelapp → Padre.
 *
 * Formato: base64url(payload{exp}) . HMAC-SHA256(firma)
 */
const crypto = require('crypto');

// Secreto para firmar los enlaces (configurable; fallback a APP_KEY).
const SECRET = process.env.INTEGRATION_SECRET || process.env.APP_KEY || '.n1pp0nG4kk1.H4m4m4tsU-Sh1zU0k4J4p0n';

/**
 * genera: crea un enlace firmado con vencimiento.
 * @param {object} payload datos que viajan en el enlace (tipo, referencia, destinatario, ...)
 * @param {number} ttlHoras horas de validez (default 24)
 * @returns {string} token
 */
const genera = (payload, ttlHoras = 24) => {
    const exp = Date.now() + (ttlHoras * 3600 * 1000);
    const cuerpo = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
    const firma = crypto.createHmac('sha256', SECRET).update(cuerpo).digest('base64url');
    return `${cuerpo}.${firma}`;
};

/**
 * valida: verifica firma y vencimiento de un token.
 * @param {string} token
 * @returns {object|null} payload; si venció, retorna { ...payload, expirado: true }
 */
const valida = (token) => {
    try {
        const [cuerpo, firma] = String(token).split('.');
        if (!cuerpo || !firma) return null;
        const esperada = crypto.createHmac('sha256', SECRET).update(cuerpo).digest('base64url');
        const a = Buffer.from(firma);
        const b = Buffer.from(esperada);
        if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
        const payload = JSON.parse(Buffer.from(cuerpo, 'base64url').toString('utf-8'));
        if (Date.now() > payload.exp) return { ...payload, expirado: true };
        return payload;
    } catch (err) {
        return null;
    }
};

module.exports = { genera, valida };
