# Checklist de pruebas — Integración de WhatsApp (FASE 5)

Entorno objetivo: servicios locales apuntando a `bdsae2` en `sae12.com` (migraciones `001` y `002` ya aplicadas).

- `escuelappapi` → `http://localhost:4004` (DB `sae12.com/bdsae2`)
- `apibaileys` → `http://localhost:4088` (DB `sae12.com/bdsae2`, Redis local)
- `escuelappvenus` → `http://localhost:3000` (`REACT_APP_BACKEND_URL=http://localhost:4004`)

Requisitos: PostgreSQL (`sae12.com`), Redis local, y `WP_API_ENABLE_CRON=true` en `apibaileys`.

---

## 1. Vinculación de un emisor
- [ ] Login como rol **Institución** → menú **WhatsApp** → "Vincular emisor".
- [ ] Ingresar número y guardar. Verificar fila en `contact.emisor` (idempresa = institución) y `contact.emisor_config` (defaults 700/400/5/3000/1).

## 2. Conexión de sesión / QR
- [ ] Botón "Ver QR": obtener QR desde `contact.sessions.last_qr`.
- [ ] Escanear con WhatsApp (Dispositivos vinculados) → `contact.sessions.status` pasa a `4` (connected), `device_name` poblado.

## 3. Desconexión y reconexión
- [ ] Desconectar desde el teléfono → `status=6` (logged_out) o `5` (disconnected).
- [ ] Reiniciar `apibaileys` → las sesiones en estado `1/2/4/5` se restauran (`restoreEmisorOnStartUp`).

## 4. Vinculación por QR (persona)
- [ ] Generar QR/link desde la institución (`vinculacion/generar`) → obtiene `waUrl` con `ESC-<código>`.
- [ ] El link abre WhatsApp con el texto semilla.

## 5. Vinculación por enlace
- [ ] Abrir el `waUrl` directo; confirmar que el emisor recibe el mensaje `ESC-<código>`.

## 6. Identificación de usuario
- [ ] Enviar `ESC-<código>` → `contact.vinculacion_whatsapp` pasa a `IDENTIFIED` o `LID_REGISTERED` (según protocolo), con `jid` y `lid` capturados.

## 7. Obtención y persistencia de LID
- [ ] Si el mensaje llega con `@lid`, `lid` queda poblado; si llega con `@s.whatsapp.net`, se registra el JID y `lid` vacío (sin error).

## 8. Aceptación de términos
- [ ] Responder **SI** → estado `ACTIVE`, `consentimiento_fecha`, `consentimiento_version='1.0'`, `consentimiento_origen='whatsapp'`.

## 9. Revocación de consentimiento
- [ ] Responder **NO** → estado `REJECTED`. También verificar revocación desde API (`vinculacion/revocar` → `REVOKED`).

## 10. Rechazo de destinatarios sin autorización
- [ ] Intentar encolar un mensaje a una persona no `ACTIVE` → la API debe rechazar con motivo (validación pre-envío).

## 11. Envíos individuales
- [ ] Insertar en `data.aelog_envios` (status `pending`, `type`/`payload`) → el cron lo reclama y envía; `status=sent`, `enviosdetalles` con `wa_message_id`.

## 12. Envíos a múltiples destinatarios autorizados
- [ ] Varios `pending` → se procesan respetando el rate limit (no ráfagas agresivas).

## 13. Pausar / reanudar cola
- [ ] "Pausar" → `emisor_config.paused=true`; el cron deja de reclamar. "Reanudar" → vuelve a procesar.

## 14. Detener cola
- [ ] "Detener" → `stopped=true`; pendientes quedan sin procesar hasta nueva instrucción.

## 15. Eliminar cola
- [ ] "Eliminar cola" → pendientes pasan a `cancelled`; el historial (`sent`/`failed`) se conserva.

## 16. Eliminar emisor
- [ ] "Eliminar emisor" → borra `contact.emisor`, config, sesión y credenciales; **no** borra `data.aelog_envios`.

## 17. Configuración de velocidad
- [ ] Cambiar `base_delay/jitter/burst_limit/burst_pause/concurrency` → persiste en `contact.emisor_config` y el worker lo aplica (cache 30 s).

## 18. Aislamiento entre instituciones
- [ ] Institución A no ve/opera los emisores/mensajes de B; la API deriva el `idempresa` del JWT. Admin ve todos.

## 19. Modo de pruebas
- [ ] Activar con `APP_WP_NUMBERTEST` en **escuelappapi y apibaileys** → todos los mensajes se redirigen a ese número y `destino_efectivo` lo registra. Alternativa por emisor: `test_phone`/`modo_prueba`. Desactivar → vuelve a envío real.

## 20. Persistencia tras reinicio
- [ ] Reiniciar `apibaileys` y/o `escuelappapi` → estados, colas y mensajes siguen en PostgreSQL (no se pierde nada).

---

## Consultas de verificación rápida

```sql
-- Emisor y sesión de una institución
SELECT * FROM contact.emisor WHERE idempresa = :idempresa;
SELECT * FROM contact.sessions WHERE id = :numero;

-- Vinculaciones
SELECT persona_tipo, persona_id, telefono, lid, estado, consentimiento_version
FROM contact.vinculacion_whatsapp;

-- Cola
SELECT status, count(*) FROM data.aelog_envios GROUP BY status;

-- Auditoría
SELECT accion, resultado, fecha FROM contact.auditoria_whatsapp ORDER BY fecha DESC LIMIT 20;
```

---

## Resultados de la ejecución — 2026-11-14 (entorno local)

Base de datos usada: `127.0.0.1:5433/bdsae2`. Emisor de prueba: `573164119133` (institución 34,
`colpasy@gmail.com`). Destino de prueba: `APP_WP_NUMBERTEST=573178954170`.

- [x] Vinculación/sesión del emisor: sesión `status=4` (conectada).
- [x] Envío de texto, imagen y enlace de video (Baileys).
- [x] Formato único: título en negrita + cuerpo + nombre del colegio + “Enviado desde escuelapp”.
- [x] Transformación HTML del editor → formato WhatsApp (negrita, cursiva, tachado, listas, enlaces).
- [x] Audiencias: docentes, estudiantes, grupos, todos e instituciones (con `cinstid→aeinst_id` y
      `canolid→aeano_id`).
- [x] Casos de uso Institución (5), Coordinador (3), Docente (5), Estudiante/Acudiente (2) y
      Administrador (3); todos registrados en `data.aelog_envios` y enviados al número de prueba.
- [x] Cola: pausar (0 envíos durante 135 s), reanudar, detener (0 envíos durante 135 s), eliminar
      cola (cancela pending/queued/sending) y eliminar emisor (con respaldo/restauración).
- [x] Lote de 260 mensajes encolados y enviados en modo test.
- [x] Grilla: nombre/teléfono/grupo, estado semafórico, error en tooltip, columnas ordenables,
      modal de detalle con vista previa y gráfico ECharts de uso en el tiempo.
- [x] Idempotencia de fechas: `fecharegistro` y `updated_at` alineados tras la distribución de prueba.
- [ ] Multimedia desde adjuntos alojados en el servidor (URL pública) a gran escala.
- [ ] Cron de calendario y boletines automáticos (aún manuales).
