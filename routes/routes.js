// PATH ROUTES SPLIT FOR AUTH AND VISITORS
const publicRoutes = {
  INDEX: '/',
  LOGIN: '/ingreso',
  NOTFOUND: '/404',
  CONTACT: '/contact',
  ABOUT: '/about',
  AGREE: '/acuerdoypolitica',
  AGREECAMPANA: '/contratoypolitica',
  REGISTER: '/newacount',
  RESET_PASSWORD: '/resetpass',
  RESET_PASSWORDLINK: '/changepass',
  // CAMBIAR LA CLAVE DE UN USUARIO DESDE UN LINK ENVIADO AL CORREO DEL DESPISTADO ESE
  COMUNICACION_OPEN: '/alertsview',
  COMUNICACION_VIEW: '/alertsview',
  HORARIO_VIEWOPEN: '/horario_salon'
};

// ROUTES FOR AUTH USERS 
const privateRoutes = {
  CONF: '/confcampana',
  // ESTABLECER LA CONFIGURACION DE MI CAMPANA: CUANDO GENERAR LOS REPORTES Y ENVIARLOS AL CORREO
  NOTFOUND: '/404',
  DASHBOARD: '/dashboardadmon',
  DASHBOARD_DOCENTE: '/dashteacher',
  DASHBOARD_ADMON: '/academic',
  DASHBOARD_ESTUDIANTE: '/dashstudent',
  EMISORES: '/emisores',
  // LISTADO DE NUMEROS DE WHATSAPP

  MENU_LIST: '/menu',
  MENU_ADD: '/menuadd',
  CONFIG_WP: '/configwp',
  CONFIG_GENERAL: '/general.conf',
  HELP_GENERAL: '/heLp',
  ASIGNACIONES_LIST: '/asignments',
  ASIGNACIONES_NEW: '/asignmentsadd',
  HORARIO_VIEW: '/horario_acudiente',
  ASISTENCIA_TEACHER: '/asistencias',
  ASISTENCIA_REPORTER: '/asistenciasreporte',
  AUSENTISMO_INSTITUCION: '/ausentismo',
  AUSENTISMO_GLOBAL: '/ausentismoglobal',
  CITACION_NEW: '/citacionesadd',
  CITACION_LIST: '/citaciones',
  CITACION_VIEW: '/citacionesdetail',
  CALENDAR_ADD: '/calendar',
  CALENDAR_VIEW: '/calendarshow',
  CALENDAR_OPEN: '/mycalendar',
  STUDENTS_VIEW: '/studentsdetail',
  STUDENTS_ADD: '/studentsadd',
  STUDENTS_LIST: '/students',
  TEACHER_VIEW: '/teachersdetail',
  TEACHER_ADD: '/teachersadd',
  TEACHER_LIST: '/teachers',
  EXCUSAS_TEACHER: '/excusasdocente',
  EXCUSAS_VIEW: '/excusasshow',
  EXCUSAS_ADD: '/excusas',
  EXCUSAS_LIST: '/excusas',
  EXCUSAS_LISTSEDE: '/excusasdocente',
  OBSERVADOR_TEACHER: '/observadormaestro',
  OBSERVADOR_VIEW: '/observadorshow',
  OBSERVADOR_ADD: '/observadormaestro',
  OBSERVADOR_LIST: '/observador',
  COMUNICACION_VIEW: '/alertshow',
  COMUNICACION_ADD: '/alerts',
  COMUNICACION_LIST: '/alertslist',
  EXAMEN_VIEWSEDE: '/evaluacionschool',
  EXAMEN_VIEW: '/evaluaciondetail',
  EXAMEN_VIEWRESOLVER: '/evaluacionperform',
  EXAMEN_RATE: '/evaluacionrate',
  EXAMEN_ADD: '/evaluacion',
  EXAMEN_LIST: '/evaluacionlist',
  TAREA_VIEWSEDE: '/tareassede',
  TAREA_VIEW: '/homework',
  // /:token'
  TAREA_VIEWRESOLVER: '/perform_homework',
  // /:id_cuestionario/:id_programacion/:idestudiante
  TAREA_RATE: '/rate_homework',
  // /:id_cuestionario/:id_programacion/:grupo
  TAREA_ADD: '/tarea',
  TAREA_LIST: '/tareaslist',
  CONSULTA_DOCENTEADD: '/consultar_docente',
  CONSULTA_DOCENTESEDE: '/consultar_docentelistsede',
  CONSULTA_DOCENTELIST: '/consultar_docentelist',
  CONSULTA_DOCENTEVIEW: '/consultar_docenteshow'
};
export { publicRoutes };
export { privateRoutes };
export default {
  publicRoutes: publicRoutes,
  privateRoutes: privateRoutes
};
