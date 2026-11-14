---
name: escuelapp-form-control-audit
description: Audita formularios React de Escuelapp contra CATALOGO_CONTROLES.md, detectando tipo de control incorrecto, falta de WYSIWYG/file picker, errores React Hook Form y validación deficiente.
---
# Form Control Audit

Antes de inspeccionar una pantalla, lee `escuelappvenus/CATALOGO_CONTROLES.md` completo en las secciones relevantes, además de `ARQUITECTURA.md`.

## Reglas de criterio
- No convertir todos los `textarea` en WYSIWYG. Contenido breve y sin formato sigue siendo `textarea`; contenido enriquecido (avisos, comunicados, observador, excusas) usa `SunEditor` integrado con `Controller`.
- No convertir todo `input type=text` en archivo. Infiera el propósito por etiqueta, `name`, entidad, flujo de usuario, formato almacenado, validación, `crudConfig` y controladores/API. Si la intención no es demostrable, pregunta o reporta como “tipo por confirmar”.
- Teléfono debe ser `type=tel`/`inputMode=tel`; correo `email`; fechas `date` o picker según caso; hora `time`; valores numéricos el control apropiado.
- Archivo: `type=file`, `accept` alineado con el backend; validación de tamaño y MIME; preview para imágenes; `FormData` y `messenger.posterFile`. Para móvil verifica tap-to-pick; `capture` solo cuando sea el comportamiento deseado.
- React Hook Form: `register` para inputs nativos; `Controller` para SunEditor, react-select, DatePicker, dropzone y valores controlados.
- Cada control visible tiene label asociado, instrucciones y errores en línea (`aria-invalid`, `aria-describedby`).

## Checklist visual/funcional
1. Etiqueta, placeholder y ayuda describen el dato real.
2. Tipo de input y teclado corresponden al dato.
3. Obligatorio/formato/rango/tamaño validan antes de enviar y backend valida de nuevo.
4. Carga, error, vacío, éxito, disabled y submit en curso están resueltos.
5. Valores por defecto y edición cargan correctamente; `reset`, `watch`, `setValue` no desincronizan.
6. Upload valida cancelación, extensión, MIME, tamaño, preview y reemplazo/limpieza del archivo.
7. WYSIWYG guarda HTML esperado y vuelve a precargar el contenido sin perder formato.
8. Fechas se normalizan con `tool.soloFecha()` cuando corresponde.
9. Los campos de contexto/autor/institución se derivan del usuario autenticado y no se confían al cliente.
10. Controles no se cortan ni se salen del contenedor en 360 px.

## Salida
Para cada hallazgo: pantalla/ruta, archivo y línea, control actual, propósito inferido y evidencia, cambio sugerido citando sección del catálogo, prueba de interacción y estado de certeza (`confirmado`, `probable`, `por confirmar`). No modificar código.
