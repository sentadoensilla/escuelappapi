---
name: escuelapp-database-regression-safety
description: Revisa migraciones, integridad y regresiones de bdsae2 con fixtures seguros, transacciones y ownership explícito.
---
# Database Regression & Safety

1. Lee `BASE_DATOS.md` y contrasta el DDL real con el código y migraciones.
2. Identifica esquema y owner funcional: SAE/legacy, `data`, `contact`, `engine`, `logic`, `integration`, `migracion` u otro.
3. No asumir que el documento de 12 esquemas coincide con la base actual; enumera diferencias.
4. Revisa PK/FK, índices, `NOT NULL`, uniques, checks, cascadas y grants.
5. Para Escuelapp, respeta convenciones documentadas, pero señala riesgos del patrón `MAX(pk)+1` si hay concurrencia; no cambies ese patrón dentro de un bugfix sin decisión aprobada.
6. Probar migraciones únicamente sobre una base de test/restauración controlada; preparar rollback y verificación posterior.
7. No ejecutar `DROP`, `TRUNCATE`, `DELETE` físico ni restore en una base conectada/compartida.
8. No consultar ni mostrar datos personales reales. Usa conteos agregados y fixtures inventados.
9. Verifica consistencia entre `contact.sessions`, `contact.whatsapp_auth`, `contact.emisor_config`, `contact.vinculacion_whatsapp` y outbox documentado si existen en el DDL vigente.

Salida: precondiciones, query solo lectura, impacto, plan de prueba, rollback y riesgo residual. No modifiques BD.
