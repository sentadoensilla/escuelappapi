---
name: escuelapp-playwright-visual-regression
description: Diseña y ejecuta pruebas visuales y E2E con Playwright para rutas y formularios Escuelapp, sin confundir emulación WebKit con Safari iOS real.
---
# Playwright Visual Regression

## Antes de introducir Playwright
1. Inspecciona `package.json`, lockfile, scripts y tests existentes de `escuelappvenus`.
2. La documentación compartida describe CRA/react-scripts y no garantiza Playwright instalado. No instales ni cambies dependencias sin autorización.
3. Si se aprueba la incorporación, usa `@playwright/test` en devDependencies, versiona lockfile y fija browsers en CI.

## Casos
- Smoke de carga y errores de consola.
- Rutas autenticadas con un fixture de test, nunca credenciales reales.
- CRUD: lista, abrir, crear/editar, validación, guardar, cancelar y recargar.
- Controles: SunEditor, archivo, select, fecha, checkbox/radio, react-dropzone.
- Layout screenshot por viewport/rol para comparar regresiones.
- Capturar screenshots solo con datos sintéticos y ocultar información sensible.

## Buenas prácticas
- Usar `data-testid` solo donde roles/labels semánticos no basten.
- Preferir `getByRole`, `getByLabel`, `getByText` y assertions de estado visible.
- No depender de sleep fijo; esperar navegación, respuesta o estado observable.
- No desactivar TLS ni bloquear errores de consola silenciosamente.
- Diferenciar prueba determinista de screenshot tolerante a fuentes/antialiasing.
- Test WebKit en macOS cuando sea posible. Anotar que no equivale a Safari iOS.

## Ejecución segura
No hagas submit de mensajes reales, no uses datos reales de estudiantes, no borres registros. Intercepta APIs o usa fixture de staging autorizado.
