---
name: escuelapp-mobile-safari-qa
description: Revisa pantallas Escuelapp en layout mobile-first y compatibilidad Safari/WebKit, especialmente iPhone, teclado, safe areas, controles táctiles y agenda escolar.
---
# Mobile Safari QA

Lee `CATALOGO_CONTROLES.md` §5 y anexo §6; lee `ARQUITECTURA.md` del frontend. Trata el catálogo como baseline local.

## Matriz mínima
- 360 × 800 CSS px: móvil compacto.
- 375 × 812 y 390 × 844: tamaños representativos de iPhone.
- 430 × 932: iPhone grande.
- 768 × 1024: tablet.
- Escritorio 1280 × 800.
Elige valores equivalentes si el dispositivo o runner no dispone de esas resoluciones. Documenta viewport, browser, OS y DPR.

## Comprobaciones
- La pantalla no exige zoom horizontal; no hay overflow horizontal involuntario.
- En mobile, campos van a ancho completo (p. ej. `col-12`) y se reordenan con jerarquía lógica.
- Inputs enfocados usan al menos 16px de fuente CSS como pauta del catálogo para evitar zoom automático de Safari.
- Teclado correcto (`type`, `inputMode`, `autoComplete`, `enterKeyHint`). El teclado no cubre botones Guardar/Siguiente.
- Tap targets: apunta a 44×44 pt según Apple HIG para controles principales. En web, mide hit areas en CSS px con prudencia; no afirmes equivalencia 1:1 entre pt y CSS px.
- Botones no dependen de hover y tienen estado pressed/focus visible.
- Sidebar, dropdowns y modales funcionan con tap; modal largo es scrollable y no atrapa el scroll.
- `select` y `react-select` no quedan recortados por `overflow`; verificar portal al `document.body` cuando proceda.
- SunEditor toolbar puede envolver/reducirse; no provoca scroll horizontal.
- Dropzone permite tocar para abrir selector nativo; drag-and-drop nunca es el único método.
- Date/time inputs nativos se prueban con el picker iOS.
- Revisar sticky/fixed, teclado virtual, rotación, scroll del body, `100vh`/`100dvh`, y `env(safe-area-inset-*)` si la interfaz se extiende bajo notch/home indicator.
- No agregar `-webkit-` a ciegas: verificar soporte/bug concreto y añadir prefijo solo cuando corresponda.

## Safari vs WebKit
Playwright WebKit prueba el motor WebKit, pero no ejecuta el Safari de marca ni reproduce todas las APIs/teclado/cámara/selector de archivos de iOS. Usa WebKit en macOS como filtro rápido y exige smoke test en un iPhone real antes de aprobar pantallas críticas.

## Salida
Capturas por viewport, defectos con pasos, qué se verificó en dispositivo real y qué solo en emulación. Prioriza agenda escolar, formularios de familias/acudientes, dashboards y pantallas de comunicación.
