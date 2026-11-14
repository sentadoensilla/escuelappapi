---
name: escuelapp-qa-orchestration
description: Organiza una auditoría funcional y de calidad de Escuelapp por repositorio, riesgo y evidencia; usar al revisar un cambio, módulo, pantalla o una versión antes de liberar.
---
# Escuelapp QA Orchestration

## Fuentes obligatorias
- `escuelappapi/AGENTS.md` y `BASE_DATOS.md` para reglas globales y datos.
- `escuelappvenus/ARQUITECTURA.md` y `CATALOGO_CONTROLES.md` para UI.
- `escuelappapi/ARQUITECTURA.md` para API.
- `apibaileys/ARQUITECTURA.md`, `INTEGRACION_WHATSAPP.md`, `CONSENTIMIENTO_WHATSAPP.md`, `PRUEBAS_WHATSAPP.md` para WhatsApp.

Los repos son Git independientes. Determina primero el repositorio real y no supongas que `Venus/` es un único repo.

## Procedimiento
1. Identifica alcance, rama y diff (`git status`, `git diff --stat`, `git diff --check`). No alteres el árbol.
2. Determina si el cambio afecta frontend, API, base de datos, WhatsApp o más de uno.
3. Selecciona skills/agentes especializados; no invoques todos para cambios triviales.
4. Comprueba documentación vs código y reporta contradicciones antes de asumir que un documento sigue vigente.
5. Ejecuta solo comandos de lectura/build/test no destructivos y pide aprobación para instalar paquetes, tocar datos o iniciar servicios.
6. Reporta defectos con severidad, ruta/archivo/línea, pasos reproducibles, resultado esperado/actual y evidencia.
7. Separa: bloqueante, error funcional, defecto visual/UX, accesibilidad, deuda/documentación y sugerencia.
8. No declares pase global con Playwright solamente: para iPhone exige prueba real en Safari sobre dispositivo.

## Severidad
- P0: exposición de datos, acceso entre instituciones, envío no autorizado, pérdida/corrupción de datos.
- P1: flujo principal bloqueado, formulario no guarda, upload incorrecto, sesión/QR no funciona.
- P2: responsive roto, control incorrecto, validación confusa, navegación/teclado difícil.
- P3: mejora visual menor o deuda sin impacto inmediato.

## Entrega
Tabla de hallazgos con `ID | severidad | repo | pantalla/endpoint | evidencia | esperado | actual | pasos | recomendación | estado`.
Añade cobertura, pruebas ejecutadas, no ejecutadas y limitaciones. No cambies código: delega correcciones a un coder y repite el test después.
