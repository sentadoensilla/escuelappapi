---
name: escuelapp-whatsapp-preflight
description: Evalúa de forma segura la integración escuelappapi–apibaileys antes de activarla: sesiones, QR, consentimiento, outbox, colas, rate limits y aislamiento.
---
# WhatsApp Preflight QA

Lee siempre `INTEGRACION_WHATSAPP.md`, `PRUEBAS_WHATSAPP.md`, `CONSENTIMIENTO_WHATSAPP.md`, `apibaileys/ARQUITECTURA.md` y el esquema de datos actual. Los documentos son una especificación que debe verificarse contra código y migraciones.

## Reglas de seguridad
- Nunca disparar envíos reales ni pruebas masivas sin aprobación expresa.
- No habilitar `WP_API_ENABLE_CRON=true` en un primer smoke test. Inspeccionar y mantener cron apagado mientras se prueban rutas, sesiones y colas sin entrega externa.
- No desactivar consentimiento, validación de destinatario o aislamiento institucional.
- Mantener `modo_prueba` y `test_phone` en pruebas controladas; verificar `destino_efectivo` y el teléfono de prueba antes de encolar.
- No reducir `BASE_DELAY` por debajo del mínimo documentado, no eliminar JITTER, no elevar burst por encima del límite documentado y conservar concurrencia 1 por sesión. No presentar límites como método para evadir restricciones de WhatsApp.
- No borrar emisores/sesiones/credenciales ni cancelar colas reales en el entorno compartido.
- No imprimir QR, credenciales Baileys, auth state o tokens.

## Secuencia
1. Static review: rutas, active vs legacy layer, auth state, endpoints y contratos.
2. Config check: valores de entorno por presencia (sin imprimir valores), PostgreSQL, Redis y URL de API.
3. API tests con mocks/stubs: validación pre-envío, errores, respuestas, permisos.
4. Sesión: iniciar, QR emitido, escaneo solo con dispositivo/numero de pruebas autorizado, estado connected.
5. Reconexión: reinicio y persistencia de auth state; logout/disconnect/error.
6. Vinculación: código/QR/link, identificación/JID/LID, expiración y duplicados.
7. Consentimiento: SI activa; NO rechaza; revocación bloquea siguientes mensajes.
8. Outbox: pending → queued → sending → sent/failed/cancelled, attempts/last_error/wa_message_id.
9. Control de cola: pausa, reanudación, stop, cancelación de pendientes; historial intacto.
10. Multi-tenant: institución A no enumera ni opera sesiones, personas ni mensajes de B.
11. Solo después de aprobar pruebas de staging, planear un envío unitario de prueba real con usuario responsable presente.

## Hallazgos de bloqueo
P0 si: se envía a usuario sin consentimiento ACTIVE, se filtra entre instituciones, un retry duplica envíos, cron activa envíos inesperadamente, o el modo prueba no redirige. P1 si no persiste sesión/QR, el worker pierde mensajes o no actualiza estados.

Reporta resultado por cada ítem del checklist `PRUEBAS_WHATSAPP.md`. Nunca marques un caso no ejecutado como aprobado.
