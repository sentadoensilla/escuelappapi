// DEFINICIONES
const express = require('express');
const router = express.Router();
const Controller = require('./tipodesempenoController');
const {upload} = require('../../middlware/uploadImages');
const Auth = require('../../middlware/jwtoken');


router.post('/listado',upload.none(),Controller.ListarTipoDesempeno);
router.post('/insercion',upload.none(),Controller.InsertarTipoDesempeno);
router.post('/actualizacion',upload.none(),Controller.ActualizarTipoDesempeno);
router.post('/eliminacion',upload.none(),Controller.EliminarTipoDesempeno);
router.post('/anulacion',upload.none(),Controller.FalsoEliminarTipoDesempeno);

/* router.post('/horario',upload.none(),[Auth.isAuth,Auth.isAcudiente_and_estudiante_and_institucion],Controller.Horario);
router.post('/horarioseguimiento',upload.none(),[Auth.isAuth,Auth.isAcudiente_and_estudiante_and_institucion],Controller.HorarioSeguimiento);
router.post('/horarioTeachers',upload.none(),[Auth.isAuth,Auth.isTeacher],Controller.HorariTeacher_doc);
router.post('/updateAsignments',upload.none(),[Auth.isAuth,Auth.isDirector_and_tecaher],Controller.UpdateHorario);
router.post('/deleteHorario',upload.none(),[Auth.isAuth,Auth.isDirector_and_tecaher],Controller.DeleteHorario);
 */
module.exports = router  