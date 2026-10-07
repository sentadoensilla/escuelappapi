# Context
Hola, soy Kephrem y tu eres mi senior dev de apoyo, me ayudarás a construir escuelapp, un sistema SaaS de registros académicos y agenda escolar multicuenta, multiusuario para que docentes, estudiantes y padres de familia, interacturen y tengan registro y notificaciones relacionadas con el colegio 

Si te encomiendo hacer un módulo nuevo, no preguntes, simplemente implementa el código siguiendo la lógica que ya está implementada en /var/www/html/venus/api/

Si hay que editar algo, haz la proposición y espera a que te confirme o te sugiera distintas formas de hacer la edición.

# Reglas del proyecto
Vamos a construir escuelapp: un sistema SaaS de registros académicos y agenda escolar
    Los actores son:
        - Colegio
            Es el dueño de la cuenta principal, tiene usuario propio, pero también tiene asociados a los docentes, los estudiantes, y los padres de familia
                - Visualiza post de los otros actores
                - Registra post para que los otros actores lo vean
                - Permite registro de pre matrículas (con enlace o QR Code)
                - Permite el registro de docentes y padres de familia (con enlace o QR Code)
                - Permite el registro de estudiantes (con enlace o QR Code)
                - Realiza registros institucionales para grados, grupos o estudiantes y padres específicos

        
        - Docentes
            Realiza registros académicos y de convivencia con los estudiantes específicos o a un grado completo o a un grupo completo de estudiantes:
                - Visualiza post de los otros actores
                - Registra post para que los otros actores lo vean
                - Notas
                - Asistencias (Pueden generar notificaciones por whatsapp o por correo)
                - observaciones (Pueden generar notificaciones por whatsapp o por correo)

        - Estudiantes
            Recibe registros académicos y de convivencia de parte de los docentes
                - Visualiza post de los otros actores
                - Registra post para que los otros actores lo vean
                - Visualiza notas
                - Compara su rendimiento con los demás estudiantes
                - Visualiza asistencias
                - Visualiza observaciones

        - Padres de familia
            Recibe registros institucionales, académicos y de convivencia por parte de colegio y de docentes
                - Visualiza post de los otros actores
                - Registra post para que los otros actores lo vean
                - Recibe notificaciones via Whatsapp (inasistencias, observaciones, notas, etc)
                - Realiza pre-matrículas de estudiantes
                - Visualiza los registros institucionales
                - Visualiza notas
                - Visualiza dashboard académico
                - Visualiza dashboard de convivencia
                - Visualiza asistencias
                - Visualiza observaciones
                - Compara el rendimiento de su estudiante con el resto del grupo 






## Stack
- Backend: Node.js (Express)
- DB: PostgreSQL
- nodemailer: Para enviar email, principal forma de comunicación en blazmanager
- Baileys: Se utiliza para enviar notificaciones a whatsapp

## Convenciones Backend
- Usar async/await, no callbacks
- Validaciones con Zod
- Arquitectura por capas: dentro de api/src/controllers crearemos una carpeta para cada módulo
    Dentro de esa carpeta estará: 
        - modulo.routes.js: las rutas que llaman a cada función
        - moduloController.js: las funciones 
        - modulo.sql.js: las sentencias SQL que serán utilizadas por las funciones
    Dentro de api/src/middleware:
        - jwtoken.js: contiene funciones de control y autenticación de usuarios cuando pretenden utilizar los recursos 
        - uploadImages.js: Contiene funciones para cargar imágenes y documentos al servidor
    Dentro de api/src/public:
        - Recursos de uso público como imágenes y documentos
    Dentro de api/src/routes:
        - Está la index de las rutas y aquí deben invocarse las *routes.js que están dentro de los módulos en api/src/controllers
    Dentro de api/src/sql:
        - Existen varios módulos que no están por carpetas, las consultas de dichos módulos están aquí
    Dentro de api/src/ssl:
        - Están los certificados de conexión a la DB
    Dentro de api/src/utils:
        - Existen varias librerías de uso general en esta carpeta:
            buttons.js: Sirve para crear botones llamando funciones, todos salen con el mismo diseño, útil en los email que se envían
            cron.js: Tareas programadas como por ejemplo ejecutar envio de mensajes de whatsapp
            datasource.js: Métodos de conexión a la base de datos
            datasoriceConst.js: las variables de conexión, tomadas del .env
            mongodbsource.js métodos de conexión para mongodb (se usa dependiendo del proyecto)
            token.js: a pesar del nombre, es una librería multipropósito, que contiene todos los métodos de uso general en el sistema
        - api/src/utils/exoorts: Contiene la lógica para exportar a excel
        - api/src/utils/notifications: Contiene la lógica para enviar emails y para enviar whatsapp
        - api/src/utils/queue: Contiene la lógica para enviar notificaciones usando colas
- Contrato de respuestas: los controllers responden `{status, statusCode, message, rows}`. Cuando NO hay resultados se responde `{status:'error', statusCode:400, message:'0 Resultados encontrados', rows:{}}`. El frontend debe validar `statusCode === 200` y que `rows` tenga contenido real; nunca comparar `rows` contra el string `"{}"`.
- Dashboards `/totals/statsinitial/*`: hay endpoints exclusivos de docente/director (guarda `isDirector_and_tecaher`, p.ej. `attendancesteacher`, `attendancesteacherbyday`, `listUnnattendance`, `listUnnattendanceGroup`). Cada tablero por rol debe invocar solo los que su guarda permite; el tablero de estudiante (`/dashstudent`) usa los endpoints de estudiante/acudiente/institucion.

## Estilo
- La plantilla base está en /var/www/html/atlantis, debes usar los elementos visuales que están en ésta plantilla, junto con bootstrap 5
- Codificar buscando la responsividad
- Cuando se trata de tablas, esconder columnas a medida que la pantalla se hace más pequeña
- Código limpio y modular, ideal para mantenimiento futuro del código
- Nombres de variables en camellCase
- Comentarios útiles en las funciones /** */
- Funciones generales dentro de utils/token.js

## Base de datos
- Utiliza /var/www/html/blaz/api/src/sql/authsql.js para la forma de las consultas
- En ocasiones se hará backup del servidor local, para hacer restore en el servidor