# Consentimiento informado — Comunicaciones WhatsApp (Borrador)

> **Borrador para validación legal.** Debe ser revisado/aprobado por la institución y por asesoría
> jurídica, conforme a la **Ley 1581 de 2012** (Protección de Datos Personales) y su Decreto
> Reglamentario **1377 de 2013** (Colombia), así como a las **políticas y términos de WhatsApp/Meta**
> (uso de la Business Platform / canales no oficiales).

**Versión del documento:** `1.0`
**Identificador de versión en BD:** `consentimiento_version = '1.0'`

---

## 1. Identificación de la institución

La institución educativa (`{NOMBRE_INSTITUCION}`) actúa como responsable del tratamiento de los datos
personales en el marco del servicio Escuelapp. Su información de contacto y política de tratamiento
están disponibles en el sitio oficial de la institución.

## 2. Finalidad de las comunicaciones

El número de WhatsApp del emisor de la institución se utiliza **exclusivamente** para enviarte
comunicaciones relacionadas con la vida escolar:

- Avisos y comunicados institucionales.
- Asistencias e inasistencias.
- Notas, boletines y reportes académicos.
- Citaciones y observaciones de convivencia.
- Recordatorios de cronograma, evaluaciones y matrícula.
- Respuestas a PQRS y solicitudes.

## 3. Tipos de mensajes que recibirás

- Mensajes de texto informativos (avisos, recordatorios).
- Imágenes, documentos o enlaces (cuando el contenido lo requiera).
- No se enviarán mensajes con fines publicitarios de terceros ni ajenos a la actividad académica.

## 4. Tratamiento de datos personales

- Se tratarán como mínimo: nombre, número de teléfono, rol (estudiante/acudiente/docente) y, cuando el
  protocolo lo entregue, el identificador técnico de la cuenta (LID/JID).
- Los datos se usan únicamente para las finalidades descritas y se conservan según los términos de la
  política institucional de tratamiento de datos.
- No se ceden ni comercializan tus datos.

## 5. Consentimiento expreso

Al responder **SI** al mensaje de vinculación, otorgas tu consentimiento libre, previo, informado y
expreso para recibir las comunicaciones descritas. El sistema guarda evidencia de:

- Persona vinculada, institución y emisor.
- Número telefónico y LID (cuando exista).
- Fecha y hora de aceptación.
- Versión de este documento (`1.0`) y origen de la aceptación.

## 6. Revocación del consentimiento

Puedes **retirar tu consentimiento en cualquier momento** respondiendo al mensaje de vinculación, desde
el portal de la institución o solicitándolo a la secretaría. La revocación impide nuevos envíos que
requieran este consentimiento, sin afectar el tratamiento permitido por ley.

## 7. Recomendación sobre contactos

Se te sugiere guardar el número del emisor en tus contactos para mejorar la entrega y el reconocimiento
de los mensajes. No se asume que lo hayas guardado por el solo hecho de recibir un mensaje; se registra
como una instrucción presentada, no como una condición confirmada.

## 8. Canal y cumplimiento

El envío respeta los límites de frecuencia y las políticas de WhatsApp/Meta. Escuelapp no utiliza el
canal para eludir restricciones ni para envíos masivos no autorizados. Todo envío queda registrado en
la base de datos (PostgreSQL) con su estado, intentos y trazabilidad.

---

## Texto del mensaje de vinculación (flujo WhatsApp)

```
Hola. Esta es la línea de WhatsApp de {NOMBRE_INSTITUCION} (Escuelapp).

Confirmas que deseas recibir notificaciones escolares por WhatsApp (avisos, asistencias, notas,
citaciones y recordatorios).

Responde SI para aceptar o NO para rechazar.

Puedes retirar tu consentimiento cuando quieras. Conoce la política de tratamiento de datos personales
(Ley 1581 de 2012) en el sitio de tu institución. Te recomendamos guardar este contacto en tu agenda.

Versión de términos: 1.0
```
