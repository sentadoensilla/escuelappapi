---
name: escuelapp-test-data-and-secrets
description: Garantiza que pruebas de Escuelapp usen datos sintéticos y no expongan credenciales, tokens, QR, contactos o datos de estudiantes.
---
# Test Data & Secret Hygiene

- Nunca mostrar el contenido de `.env`, archivos de claves, auth state Baileys, certificados privados, JWT, API keys, QR o contraseñas.
- Antes de compartir logs o screenshots, redactar teléfonos, nombres, correos e identificadores de estudiantes/acudientes.
- Usar usuarios, instituciones, estudiantes y teléfonos sintéticos claramente ficticios en test.
- Comprobar que `test_phone` pertenece a entorno de prueba y está autorizado; no revelar su valor en el reporte si es un número privado.
- No copiar un dump completo ni adjuntar filas personales a un bug report.
- Si se encuentra un secreto versionado o incluido en documentación: detener difusión, no reproducirlo en el informe y recomendar rotación del secreto, eliminación del historial cuando corresponda y uso de secret manager/env local fuera de Git.
- No ejecutar scripts de backup/restore compartidos sin revisión: el script de restore documentado elimina y recrea la base de destino.
