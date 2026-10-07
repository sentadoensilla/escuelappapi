import express from "express";
import users from "./users.js";
import teachers from "./teachers.js";
import students from "./students.js";
import horario from "./horario.js";
import academic from "./academic.js";
import attendance from "./attendance.js";
import comunications from "./comunications.js";
import datosgenerales from "./datosgenerales.js";
import linkables from "./linkables.js";
import matriculas from "./matriculas.js";
import emisor from "./emisor.js";
import general from "./general.js";
import estadisticas from "./estadisticas.js";
import estadisticasTotales from "./stats.js";
import alert from "./alerts.js";
import ano from "./anolectivo.js";
import menu from "../controllers/menu/menu.routes.js";
import areas from "./areas.js";
import citaciones from "./citaciones.js";
import observer from "./observer.js";
import scheduler from "./scheduler.js";
import tdesempeno from "../controllers/tipodesempeno/tipodesempeno.routes.js";
import catalogos from "../controllers/catalogos/catalogos.routes.js";
import anolperiodo from "../controllers/anolperiodo/anolperiodo.routes.js";
import institucion from "../controllers/institucion/institucion.routes.js";
import cursos from "../controllers/cursos/cursos.routes.js";
import pensum from "../controllers/pensum/pensum.routes.js";
import docentes from "../controllers/docentes/docentes.routes.js";
import estudiantes from "../controllers/estudiantes/estudiantes.routes.js";
import indicadores from "../controllers/indicadores/indicadores.routes.js";
import notas from "../controllers/notas/notas.routes.js";
import observador from "../controllers/observador/observador.routes.js";
import usuariossae from "../controllers/usuariossae/usuariossae.routes.js";
import configuracion from "../controllers/configuracion/configuracion.routes.js";
import preescolar from "../controllers/preescolar/preescolar.routes.js";
import estadisticassae from "../controllers/estadisticassae/estadisticassae.routes.js";
import integration from "../controllers/integration/integration.routes.js";
import avisos from "../controllers/avisos/avisos.routes.js";
import novedades from "../controllers/novedades/novedades.routes.js";
import disciplina from "../controllers/disciplina/disciplina.routes.js";
import pqrs from "../controllers/pqrs/pqrs.routes.js";
import configapp from "../controllers/configapp/configapp.routes.js";
import templates from "../controllers/templates/templates.routes.js";
import migracion from "../controllers/migracion/migracion.routes.js";
const router = express.Router();
// const webpush = require('../utils/webpush');

router.use('/users', users);
router.use('/teachers', teachers);
router.use('/students', students);
router.use('/asignments', horario);
router.use('/academic', academic);
router.use('/attendance', attendance);
router.use('/alerts', alert);
router.use("/request", general);
router.use('/comms', comunications);
router.use('/data', datosgenerales);
router.use('/show', linkables);
router.use('/genesis', matriculas);
router.use('/emisor', emisor);
router.use('/estadisticas', estadisticas);
router.use('/totals', estadisticasTotales);
router.use('/anolectivo', ano);
router.use('/menu', menu);
router.use('/areas', areas);
router.use('/citaciones', citaciones);
router.use('/observer', observer);
router.use('/calendar', scheduler);
router.use('/tipodesempeno', tdesempeno);

// ===== Montaje de los módulos SAE =====
router.use('/catalogos', catalogos); // CRUD genérico de catálogos SAE
router.use('/configuracion', configuracion); // escalas, SIE, certificados, constancias, paz y salvo, firmas
router.use('/institucion', institucion); // instituciones y sedes
router.use('/sae', anolperiodo); // años lectivos, periodos y valores
router.use('/sae', cursos); // cursos y sedes (apoyo)
router.use('/sae', pensum); // áreas, asignaturas, contenidos y config de áreas
router.use('/sae', docentes); // docentes, contratación y asignación académica
router.use('/sae', estudiantes); // estudiantes, matrícula, acudientes, socioeconómicos, pagos
router.use('/sae', indicadores); // competencias (indicadores de desempeño)
router.use('/sae', notas); // notas, logros, definitivas y promedios
router.use('/sae', observador); // observador del estudiante
router.use('/sae', usuariossae); // usuarios, roles, menús y privilegios SAE
router.use('/preescolar', preescolar); // ámbitos, dimensiones, asignaciones, notas y novedades de preescolar
router.use('/estadisticassae', estadisticassae); // reportes/estadísticas SAE (solo lectura)
router.use('/integration', integration); // Integration Layer (SAE → Escuelapp → Padre)

// ===== Módulos nuevos de cobertura completa de tablas =====
router.use('/avisos', avisos); // avisos institucionales SAE (tabavisroll, tabavisusua, avisrolldest)
router.use('/sae', novedades); // novedades/asistencias SAE (public.tabnove)
router.use('/sae', disciplina); // disciplina SAE (tabdisci, tabdiscinst, tabdiscnota)
router.use('/pqrs', pqrs); // PQRS Escuelapp (data.aepqr*)
router.use('/configapp', configapp); // ayuda, condiciones, solicitudes, mediciones, tipos certificado, avisos internos, tipos citación
router.use('/templates', templates); // plantillas de mensajería (contact.aetempmess*)
router.use('/migracion', migracion); // mapeo de identidad SAE <-> Escuelapp (migracion.map_*)
export default router;
