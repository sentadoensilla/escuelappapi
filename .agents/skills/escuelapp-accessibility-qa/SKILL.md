---
name: escuelapp-accessibility-qa
description: Audita accesibilidad práctica de vistas y formularios Escuelapp: labels, errores, foco, teclado, contraste y objetivos táctiles.
---
# Accessibility QA

- Asociar todo control a label visible mediante `htmlFor`/`id` o nombre accesible apropiado.
- Los errores deben anunciar qué campo falló, relacionarse vía `aria-describedby` y marcar `aria-invalid`.
- Probar navegación por teclado, orden de tabulación, foco visible y retorno de foco tras modal.
- Icon buttons tienen nombre accesible; íconos decorativos se ocultan de AT.
- No usar color como único indicador de error/estado.
- Revisar contraste, zoom/reflow y que los mensajes no desplacen controles críticos fuera de vista.
- Controles táctiles grandes y espaciados; usar Apple HIG (44×44 pt recomendado) como guía adicional en iOS.
- Ejecutar axe u otra herramienta solo si ya está instalada o su instalación está aprobada. La ausencia de violaciones automatizadas no demuestra accesibilidad total.

Entrega WCAG/Apple-HIG-inspired findings con impacto, evidencia y recomendación. No cambies código.
