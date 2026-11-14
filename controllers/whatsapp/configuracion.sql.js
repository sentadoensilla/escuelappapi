// configuracion.sql.js — velocidad de envío y modo de pruebas por emisor.
export const configConsultar = `
  SELECT c.idemisor, c.idempresa, c.base_delay, c.jitter, c.burst_limit, c.burst_pause,
         c.concurrency, c.paused, c.stopped, c.modo_prueba, c.test_phone, c.updated_at
  FROM contact.emisor_config c WHERE c.idemisor = $1;`;

export const configActualizar = `
  UPDATE contact.emisor_config SET
    base_delay = $2, jitter = $3, burst_limit = $4, burst_pause = $5,
    concurrency = $6, modo_prueba = $7, test_phone = $8, updated_by = $9
  WHERE idemisor = $1 RETURNING idemisor;`;

export const configPruebas = `
  UPDATE contact.emisor_config SET modo_prueba = $2, test_phone = $3, updated_by = $4
  WHERE idemisor = $1 RETURNING idemisor;`;

export const emisorIdDeInstitucion = `
  SELECT e.idemisor FROM contact.emisor e WHERE e.idempresa = $1 LIMIT 1;`;

export default { configConsultar, configActualizar, configPruebas, emisorIdDeInstitucion };
