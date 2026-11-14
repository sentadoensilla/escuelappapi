-- ============================================================================
-- Rollback de la migración 001_whatsapp_integracion.sql
-- (Reversible cuando sea técnicamente viable; NO elimina datos históricos de
--  emisor/aelog_envios preexistentes, sólo lo añadido por esta integración.)
-- ============================================================================

BEGIN;

DROP TRIGGER IF EXISTS trg_aelog_envios_updated ON data.aelog_envios;
DROP TRIGGER IF EXISTS trg_vinculacion_updated  ON contact.vinculacion_whatsapp;
DROP TRIGGER IF EXISTS trg_emisor_config_updated ON contact.emisor_config;
DROP TRIGGER IF EXISTS trg_sessions_updated     ON contact.sessions;

DROP INDEX IF EXISTS idx_aelog_envios_empresa;
DROP INDEX IF EXISTS idx_aelog_envios_status;

-- Columnas añadidas a data.aelog_envios (NO toca las columnas originales)
ALTER TABLE data.aelog_envios DROP COLUMN IF EXISTS updated_at;
ALTER TABLE data.aelog_envios DROP COLUMN IF EXISTS destino_efectivo;
ALTER TABLE data.aelog_envios DROP COLUMN IF EXISTS lid;
ALTER TABLE data.aelog_envios DROP COLUMN IF EXISTS type;
ALTER TABLE data.aelog_envios DROP COLUMN IF EXISTS payload;
ALTER TABLE data.aelog_envios DROP COLUMN IF EXISTS last_error;
ALTER TABLE data.aelog_envios DROP COLUMN IF EXISTS attempts;
ALTER TABLE data.aelog_envios DROP COLUMN IF EXISTS status;

DROP TABLE IF EXISTS contact.auditoria_whatsapp;
DROP TABLE IF EXISTS contact.vinculacion_whatsapp;
DROP TABLE IF EXISTS contact.emisor_config;
DROP TABLE IF EXISTS contact.whatsapp_auth;
DROP TABLE IF EXISTS contact.sessions;
DROP TABLE IF EXISTS contact.sessions_status;

DROP FUNCTION IF EXISTS contact.set_updated_at();

COMMIT;
