---
name: escuelapp-documentation-drift
description: Compara cambios y comportamiento real con los documentos obligatorios de Escuelapp y detecta documentación desactualizada tras cada modificación.
---
# Documentation Drift Check

Al cierre de cualquier cambio, verifica qué documentación afecta:
- Cambios de interfaz/controles/widgets: `escuelappvenus/CATALOGO_CONTROLES.md` y `ARQUITECTURA.md` del frontend.
- Cambios backend: `escuelappapi/ARQUITECTURA.md` y `AGENTS.md` si cambian reglas generales.
- Cambios de DDL/consultas/ownership: `BASE_DATOS.md`.
- Cambios Baileys, endpoints, colas, rate limit, auth state o variables: `apibaileys/ARQUITECTURA.md`; también `BASE_DATOS.md` si aplica.
- Cambios funcionales de WhatsApp: `INTEGRACION_WHATSAPP.md` y `PRUEBAS_WHATSAPP.md`.

Contrasta con diff y archivos reales; no copies el documento antiguo si ya no refleja el código. Actualiza la fecha del encabezado según convención. Si no puedes editar (auditoría read-only), enumera cambios documentales pendientes con ubicación y contenido sugerido.
