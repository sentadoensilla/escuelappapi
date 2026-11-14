---
name: escuelapp-api-contract-testing
description: Prueba contratos REST de escuelappapi y su compatibilidad con React, reglas de autenticación, roles y aislamiento institucional.
---
# API Contract Testing

Lee `escuelappapi/ARQUITECTURA.md`, `AGENTS.md` y contratos de los módulos. Confirma el estado real: los documentos reportan ESM/Express 4, JWT y respuesta `{status,statusCode,message,rows}`, con varias rutas históricas que responden errores dentro de HTTP 200.

## Pruebas
- Contrato de respuesta y status HTTP real (no asumir que statusCode del body coincide con HTTP status).
- Validación de entrada, tipos, valores vacíos, IDs encriptados y fechas.
- Auth: sin token, token inválido, expirado y roles sin privilegio.
- Multi-institución: A no ve/edita datos de B; `idempresa` debe derivarse del JWT según contrato.
- CRUD: create/read/update/borrado lógico; verifica que no se ejecute DELETE físico.
- Upload: límites, MIME, nombres de archivo, path traversal, errores y autorización.
- Consistencia de menú dinámico/ruta React.
- SQL parametrizado y consultas con datos límite.

Usa staging o base efímera restaurada, fixtures sintéticos y cuentas de prueba. No realices pruebas destructivas sobre base compartida ni uses superuser.
