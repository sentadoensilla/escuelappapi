const express = require('express')
const router = express.Router();
const users = require('./users');
const teachers = require('./teachers');
const students = require('./students');
const horario = require('./horario');
const academic = require('./academic');
const attendance = require('./attendance');
const comunications = require('./comunications');
const datosgenerales = require('./datosgenerales');
const linkables = require('./linkables');
const matriculas = require('./matriculas');
const emisor = require('./emisor');
const general = require("./general");
const estadisticas = require('./estadisticas');
const estadisticasTotales = require('./stats');
const alert = require('./alerts');
const ano = require('./anolectivo');
const menu = require('../controllers/menu/menu.routes');
const areas = require('./areas')
const citaciones = require('./citaciones')
const observer = require('./observer')
const scheduler = require('./scheduler')
const tdesempeno = require('../controllers/tipodesempeno/tipodesempeno.routes');

// ===== Módulos SAE (CRUD por subcarpeta en controllers/) =====
const catalogos = require('../controllers/catalogos/catalogos.routes');
const anolperiodo = require('../controllers/anolperiodo/anolperiodo.routes');
const institucion = require('../controllers/institucion/institucion.routes');
const cursos = require('../controllers/cursos/cursos.routes');
const pensum = require('../controllers/pensum/pensum.routes');
const docentes = require('../controllers/docentes/docentes.routes');
const estudiantes = require('../controllers/estudiantes/estudiantes.routes');
const indicadores = require('../controllers/indicadores/indicadores.routes');
const notas = require('../controllers/notas/notas.routes');
const observador = require('../controllers/observador/observador.routes');
const usuariossae = require('../controllers/usuariossae/usuariossae.routes');
const configuracion = require('../controllers/configuracion/configuracion.routes');
const preescolar = require('../controllers/preescolar/preescolar.routes');
const estadisticassae = require('../controllers/estadisticassae/estadisticassae.routes');
const integration = require('../controllers/integration/integration.routes');

// const webpush = require('../utils/webpush');

router.use('/users',users);
router.use('/teachers',teachers);
router.use('/students',students);
router.use('/asignments',horario);
router.use('/academic',academic);
router.use('/attendance',attendance);
router.use('/alerts',alert);
router.use("/request", general);
router.use('/comms',comunications);
router.use('/data',datosgenerales);
router.use('/show',linkables);
router.use('/genesis',matriculas);
router.use('/emisor',emisor);
router.use('/estadisticas',estadisticas);
router.use('/totals',estadisticasTotales);
router.use('/anolectivo',ano);
router.use('/menu',menu);
router.use('/areas',areas);
router.use('/citaciones',citaciones);
router.use('/observer',observer);
router.use('/calendar',scheduler);
router.use('/tipodesempeno',tdesempeno);

// ===== Montaje de los módulos SAE =====
router.use('/catalogos', catalogos);          // CRUD genérico de catálogos SAE
router.use('/configuracion', configuracion);  // escalas, SIE, certificados, constancias, paz y salvo, firmas
router.use('/institucion', institucion);      // instituciones y sedes
router.use('/sae', anolperiodo);              // años lectivos, periodos y valores
router.use('/sae', cursos);                   // cursos y sedes (apoyo)
router.use('/sae', pensum);                   // áreas, asignaturas, contenidos y config de áreas
router.use('/sae', docentes);                 // docentes, contratación y asignación académica
router.use('/sae', estudiantes);              // estudiantes, matrícula, acudientes, socioeconómicos, pagos
router.use('/sae', indicadores);              // competencias (indicadores de desempeño)
router.use('/sae', notas);                    // notas, logros, definitivas y promedios
router.use('/sae', observador);               // observador del estudiante
router.use('/sae', usuariossae);              // usuarios, roles, menús y privilegios SAE
router.use('/preescolar', preescolar);        // ámbitos, dimensiones, asignaciones, notas y novedades de preescolar
router.use('/estadisticassae', estadisticassae); // reportes/estadísticas SAE (solo lectura)
router.use('/integration', integration);      // Integration Layer (SAE → Escuelapp → Padre)

module.exports = router;