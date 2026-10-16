-- ============================================================================
-- Integración de WhatsApp en Escuelapp — Migración (FASE 3a)
-- Idempotente (IF NOT EXISTS). Esquema `contact` = infraestructura WhatsApp.
-- Ejecutar como usuario con CREATE sobre `contact` (p. ej. postgres / adminit4_saeroot).
-- Rollback: 001_whatsapp_integracion.rollback.sql
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- Catálogo de estados de sesión Baileys
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact.sessions_status (
    code        smallint PRIMARY KEY,
    descripcion varchar(40) NOT NULL
);

INSERT INTO contact.sessions_status (code, descripcion) VALUES
    (1, 'waiting_qr'),
    (2, 'qr_generated'),
    (3, 'scanning'),
    (4, 'connected'),
    (5, 'disconnected'),
    (6, 'logged_out'),
    (7, 'error')
ON CONFLICT (code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Estado persistido de cada sesión Baileys (una por emisor/número)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact.sessions (
    id           text PRIMARY KEY,               -- número del emisor (sessionId)
    idempresa    bigint,
    status       smallint REFERENCES contact.sessions_status(code),
    device_name  text,
    phone_number text,
    last_qr      text,
    last_error   text,
    created_at   timestamptz DEFAULT now(),
    updated_at   timestamptz DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- Credenciales Baileys (auth state) — clave/valor por sesión
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact.whatsapp_auth (
    session_id text NOT NULL,
    key        text NOT NULL,
    value      text,
    PRIMARY KEY (session_id, key)
);

-- ----------------------------------------------------------------------------
-- Configuración de velocidad / control por emisor (persistida en PostgreSQL)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact.emisor_config (
    idemisor     integer PRIMARY KEY REFERENCES contact.emisor(idemisor) ON DELETE CASCADE,
    idempresa    bigint,
    base_delay   integer  NOT NULL DEFAULT 700,   -- ms entre mensajes
    jitter       integer  NOT NULL DEFAULT 400,   -- + aleatorio ms
    burst_limit  integer  NOT NULL DEFAULT 5,     -- mensajes seguidos antes de pausa
    burst_pause  integer  NOT NULL DEFAULT 3000,  -- pausa tras burst (ms)
    concurrency  integer  NOT NULL DEFAULT 1,     -- concurrencia por sesión
    paused       boolean  NOT NULL DEFAULT false, -- PAUSAR cola (conserva mensajes)
    stopped      boolean  NOT NULL DEFAULT false, -- DETENER cola (pendientes sin procesar)
    modo_prueba  boolean  NOT NULL DEFAULT false, -- modo de pruebas activo
    test_phone   text,                            -- número autorizado de pruebas
    updated_by   bigint,
    updated_at   timestamptz DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- Vinculación de personas + LID + consentimiento (no toca entidades canónicas)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact.vinculacion_whatsapp (
    id                       bigserial PRIMARY KEY,
    idempresa                bigint      NOT NULL,
    idemisor                 integer,
    persona_tipo             varchar(20) NOT NULL,  -- estudiante | acudiente | docente
    persona_id               bigint      NOT NULL,  -- id canónico SAE (cestuid/cestuacudid/cdoceid)
    telefono                 text,                  -- número tal como fue capturado
    telefono_norm            text,                  -- número normalizado internacional (E.164)
    jid                      text,                  -- JID de WhatsApp (p.ej. 57...@s.whatsapp.net)
    lid                      text,                  -- LID cuando el protocolo lo entrega
    estado                   varchar(24) NOT NULL DEFAULT 'PENDING',
    consentimiento_version   text,                  -- versión de términos aceptada
    consentimiento_fecha     timestamptz,
    consentimiento_origen    text,                  -- qr | link | manual
    verificado_at            timestamptz,           -- última verificación de número
    opt_codigo               varchar(16),           -- código de un solo uso (vinculación)
    opt_codigo_expires_at    timestamptz,
    created_at               timestamptz DEFAULT now(),
    updated_at               timestamptz DEFAULT now(),
    CONSTRAINT vinculacion_estado_check CHECK (estado IN (
        'PENDING','CONVERSATION_STARTED','IDENTIFIED','LID_REGISTERED',
        'CONSENT_PENDING','CONSENT_ACCEPTED','ACTIVE','REVOKED','BLOCKED','ERROR')),
    UNIQUE (idempresa, persona_tipo, persona_id)
);

-- Un LID no puede pertenecer a dos personas de la misma institución
CREATE UNIQUE INDEX IF NOT EXISTS uq_vinculacion_lid
    ON contact.vinculacion_whatsapp (idempresa, lid)
    WHERE lid IS NOT NULL AND lid <> '';

-- ----------------------------------------------------------------------------
-- Auditoría de acciones administrativas (sin credenciales/tokens)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact.auditoria_whatsapp (
    id         bigserial PRIMARY KEY,
    idempresa  bigint,
    idemisor   integer,
    usuario_id bigint,
    accion     varchar(64) NOT NULL,   -- vincular / pausar / reanudar / detener / eliminar_cola / eliminar_emisor / pruebas / consentir / revocar
    resultado  varchar(32),
    detalle    jsonb,
    fecha      timestamptz DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- data.aelog_envios: columnas de estado de cola (ADITIVO, no destructivo)
-- ----------------------------------------------------------------------------
ALTER TABLE data.aelog_envios ADD COLUMN IF NOT EXISTS status           text DEFAULT 'pending';
ALTER TABLE data.aelog_envios ADD COLUMN IF NOT EXISTS attempts         integer DEFAULT 0;
ALTER TABLE data.aelog_envios ADD COLUMN IF NOT EXISTS last_error       text;
ALTER TABLE data.aelog_envios ADD COLUMN IF NOT EXISTS payload          jsonb;
ALTER TABLE data.aelog_envios ADD COLUMN IF NOT EXISTS type             text;
ALTER TABLE data.aelog_envios ADD COLUMN IF NOT EXISTS lid              text;
ALTER TABLE data.aelog_envios ADD COLUMN IF NOT EXISTS destino_efectivo text;  -- en modo prueba, el test_phone
ALTER TABLE data.aelog_envios ADD COLUMN IF NOT EXISTS updated_at       timestamptz DEFAULT now();

-- ----------------------------------------------------------------------------
-- Índices para el drenado de la cola
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_aelog_envios_status  ON data.aelog_envios (status, idempresa, fecharegistro);
CREATE INDEX IF NOT EXISTS idx_aelog_envios_empresa ON data.aelog_envios (idempresa, fecharegistro);

-- ----------------------------------------------------------------------------
-- Trigger genérico de updated_at
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION contact.set_updated_at() RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sessions_updated ON contact.sessions;
CREATE TRIGGER trg_sessions_updated BEFORE UPDATE ON contact.sessions
    FOR EACH ROW EXECUTE FUNCTION contact.set_updated_at();

DROP TRIGGER IF EXISTS trg_emisor_config_updated ON contact.emisor_config;
CREATE TRIGGER trg_emisor_config_updated BEFORE UPDATE ON contact.emisor_config
    FOR EACH ROW EXECUTE FUNCTION contact.set_updated_at();

DROP TRIGGER IF EXISTS trg_vinculacion_updated ON contact.vinculacion_whatsapp;
CREATE TRIGGER trg_vinculacion_updated BEFORE UPDATE ON contact.vinculacion_whatsapp
    FOR EACH ROW EXECUTE FUNCTION contact.set_updated_at();

DROP TRIGGER IF EXISTS trg_aelog_envios_updated ON data.aelog_envios;
CREATE TRIGGER trg_aelog_envios_updated BEFORE UPDATE ON data.aelog_envios
    FOR EACH ROW EXECUTE FUNCTION contact.set_updated_at();

COMMIT;
