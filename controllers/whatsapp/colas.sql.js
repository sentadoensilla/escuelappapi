// colas.sql.js — acciones administrativas sobre la cola de un emisor.
export const colaPausar = `UPDATE contact.emisor_config SET paused = true WHERE idemisor = $1 RETURNING idemisor;`;
export const colaReanudar = `UPDATE contact.emisor_config SET paused = false, stopped = false WHERE idemisor = $1 RETURNING idemisor;`;
export const colaDetener = `UPDATE contact.emisor_config SET stopped = true WHERE idemisor = $1 RETURNING idemisor;`;

export const colaEliminarPendientes = `
  UPDATE data.aelog_envios SET status = 'cancelled', updated_at = now()
  WHERE idempresa = $1 AND status IN ('pending', 'queued', 'sending')
  RETURNING idlogenvios;`;

export const idempresaDeEmisor = `SELECT idempresa, emisor FROM contact.emisor WHERE idemisor = $1;`;
export const emisorIdDeInstitucion = `SELECT e.idemisor FROM contact.emisor e WHERE e.idempresa = $1 LIMIT 1;`;

export default { colaPausar, colaReanudar, colaDetener, colaEliminarPendientes, idempresaDeEmisor, emisorIdDeInstitucion };
