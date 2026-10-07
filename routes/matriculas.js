import express from "express";
import Controller from "../controllers/MatriculasController.js";
import * as __mod0 from "../middlware/uploadImages.js";
import Auth from "../middlware/jwtoken.js";
const router = express.Router();
const {
  upload,
  uploadInscripcion
} = __mod0;
router.get('/getSedes', upload.none(), Controller.listaSedes);
router.post('/getSedes', upload.none(), Controller.listaSedes);
router.post('/getEps', upload.none(), Controller.listaEPS);
router.post('/getGrados', upload.none(), Controller.listaGrados);
router.post('/getSangre', upload.none(), Controller.listaGruposanguineo);
router.post('/getPaises', upload.none(), Controller.listaPaises);
router.post('/getProvincias', upload.none(), Controller.listaProvincias);
router.post('/getCiudades', upload.none(), Controller.listaMupios);
router.post('/getTipodocumento', upload.none(), Controller.listaTipodocumento);
router.post('/getTipoempresa', upload.none(), Controller.listaTipoempresa);
router.post('/getEtnias', upload.none(), Controller.listaEtnias);
router.post('/getCaracter', upload.none(), Controller.listaCaracter);
router.post('/getConocer', upload.none(), Controller.listaConocer);
router.post('/getJornada', upload.none(), Controller.listaJornada);
router.post('/getDiscapacidades', upload.none(), Controller.listaDiscapacidades);
router.post('/getParentezco', upload.none(), Controller.listaParentezco);
router.post('/sendInscripcion', uploadInscripcion.any(), Controller.inscribirMuchacho);
router.post('/premodifyInscripcion', upload.none(), Controller.preeditarMuchacho);
router.post('/modifyInscripcion', uploadInscripcion.any(), Controller.editarMuchacho);
router.post('/getDataInscripcion', upload.none(), Controller.buscarMuchacho);
router.post('/listEnrollment', upload.none(), Controller.listarInscritos);
router.post('/testEmail', upload.none(), Controller.validMails);
export default router;
