const path = require('path')
const multer  = require('multer')
const token = require('../utils/token')
const { v4: uuidv4 } = require('uuid'); 
var moment = require('moment');
const ahora = moment().format('YYYYMMDDHHmmss');
const prohibidos = 'ÁÉÍÓÚáéíóúâêîôûàèìòùÇç/.,~!@#$%&_-12345'
const noChar = [' ','á','é','í','ó','ú','ñ','ä','ë','ï','ö','ü','Á','É','Í','Ó','Ú','Ñ','Ä','Ë','Ï','Ö','Ü','â','ê','î','ô','û','à','è','ì','ò','ù','À','È','Ì','Ò','Ù','Ç','ç','/',',','~','!','@','#','$','%','&']
const yesChar = ['_','a','e','i','o','u','n','a','e','i','o','u','A','E','I','O','U','N','A','E','I','O','U','a','e','i','o','u','a','e','i','o','u','A','E','I','O','U','C','c','_','_','_','_','_','_','_','_','_']

const limitFilesize = 6291456
const tipoArchivo = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/x-icon',
  'pdf',
  'application/pdf',
  'xls',
  'xlsx',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel.sheet.binary.macroEnabled.12',
  'application/vnd.ms-excel',
  'application/vnd.ms-excel.sheet.macroEnabled.12',
  'application/wps-office.xlsx',
  'application/wps-office.xls',
  'doc',
  'docx',
  'application/msword',
  'application/vnd.ms-word.document.macroEnabled.12',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
  'application/vnd.ms-word.template.macroEnabled.12',
  'application/wps-office.docx',
  'application/wps-office.doc',  
  'ppt',
  'pptx',
  'pps',
  'ppsx',
  'application/vnd.ms-powerpoint.template.macroEnabled.12',
  'application/vnd.openxmlformats-officedocument.presentationml.template',
  'application/vnd.ms-powerpoint.addin.macroEnabled.12',
  'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
  '	application/vnd.ms-powerpoint.slideshow.macroEnabled.12',
  'application/vnd.ms-powerpoint',
  'application/vnd.ms-powerpoint.presentation.macroEnabled.12',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/wps-office.pptx',
  'application/wps-office.ppt',  
  'application/wps-office.ppsx',
  'application/wps-office.pps',  
  'rtf',
  'txt',
  'csv',
  'zip',
  'rar',
  'application/rtf',
  'text/rtf',
  'text/html',
  'application/xml',
  'image/x-icon',
  'application/zip',
  'application/x-rar-compressed',
  'application/octet-stream',
  'application/x-zip-compressed',
  'multipart/x-zip',
  'application/msword',
  'application/x-tar',
  'text',
  'text/csv',
  'application/csv',
  'text/plain'                    
];
const tipoArchivoPlano = [
  'text',
  'text/html',
  'text/csv',
  'application/csv',
  'text/plain'
];

/**
 * replace special characters in name's file
 * @param {*} badName: filename of file
 * @returns 
 */
let goodName = (badName) =>{
  let devolver = ''
  badName.split('').forEach((l) =>{
    devolver += yesChar[noChar.indexOf(l)] || l
  })
  return devolver
}

let storage = multer.diskStorage({
    destination: path.join(__dirname,'../public/archivos/examenes'),
    filename: function ( req,file, cb) {
      cb(null, `${Date.now()}-${goodName(file.originalname||file.fieldname)}`)
    }
  })
   
  let upload = multer({ storage });  

  let storage2 = multer.diskStorage({
    destination: path.join(__dirname, '../public/archivos/tareas'),
    filename:function(req,file,cb){
      return cb(null, `${Date.now()}-${goodName(file.originalname||file.fieldname)}`);    
    },
  })

 let uploadAll = multer({
    storage:storage2,
    fileFilter: function (req, file, cb) {
      let ext = path.extname(file.originalname);
      if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg' && ext !== '.pdf' && ext !== '.xlsx') {          
        req.fileValidationError = 'Formato no valido '+ file.originalname;
        return cb(null, false);
      }
      cb(null, true)
    },
  })

let storageIns = multer.diskStorage({
  destination: function (req, file, cb){
    if(req.user.usuarioEmpresaId){
      cb(null, path.join(__dirname, '../public/archivos/tareas/',  token.decriptar(req.user.usuarioEmpresaId)))
    }else{
      cb(null, path.join(__dirname, '../public/archivos/tareas/'))
    }    
  },
  filename:function(req,file,cb){
    let elArchivo = ahora + '_' + token.decriptar(req.body.id_docente) + '_' +  goodName(file.originalname||file.fieldname)
    return cb(null, elArchivo)
  },
})

let uploadPath = multer({
  storage:storageIns,  
  fileFilter: function (req, file, cb) {  
    if(parseInt(tipoArchivo.indexOf(file.mimetype)) < 0) {     
        req.fileValidationError = 'Formato no valido '+ file.originalname;
        return cb(null, false);
    }
    cb(null, true)
  },
})

let storageResponse = multer.diskStorage({
  destination: function (req, file, cb){
    if(req.user.usuarioEmpresaId){
      cb(null, path.join(__dirname, '../public/archivos/tareasrespuestas/',  token.decriptar(req.user.usuarioEmpresaId)))
    }else{
      cb(null, path.join(__dirname, '../public/archivos/tareasrespuestas/'))
    }    
  },
  filename:function(req,file,cb){
    let elArchivo = ahora +'_'+ req.body.reference +'_'+ token.decriptar(req.user.academicoId) +'_'+ goodName(file.originalname||file.fieldname) //file.originalname.normalize('NFD').replace(/([\u0300-\u036f]|[^0-9a-zA-Z.])/g, '_');
    return cb(null, elArchivo)
  },
})

let uploadResponse = multer({
  storage:storageResponse,
  fileFilter: function (req, file, cb) {  
    const fileSize = parseInt(req.headers['content-length']);
    if((fileSize >= limitFilesize) || (parseInt(tipoArchivo.indexOf(file.mimetype)) < 0) ) {
      req.fileValidationError = ' Formato no valido o superaste el tamaño límite de archivos '+ file.originalname;
      return cb(null, false);
    }
    cb(null, true)
  },
})

let storageAlert = multer.diskStorage({
  destination: function (req, file, cb){
    if(req.user.usuarioEmpresaId){
      cb(null, path.join(__dirname, '../public/archivos/avisos/',  token.decriptar(req.user.usuarioEmpresaId)))
    }else{
      cb(null, path.join(__dirname, '../public/archivos/avisos/'))
    }    
  },
  filename:function(req,file,cb){
    let elArchivo = ahora + '_' + uuidv4() + '_' + token.decriptar(req.user.academicoId) + '_' +  goodName(file.originalname||file.fieldname)
    return cb(null, elArchivo)
  },
})

let uploadAlert = multer({
  storage:storageAlert,  
  fileFilter: function (req, file, cb) {  

    if(parseInt(tipoArchivo.indexOf(file.mimetype)) < 0) {     
        req.fileValidationError = 'Formato no valido '+ file.originalname;
        return cb(null, false);
    }
    cb(null, true)
  },
})

let storageCrono = multer.diskStorage({
  destination: function (req, file, cb){
    if(req.user.usuarioEmpresaId){
      cb(null, path.join(__dirname, '../public/archivos/cronograma/',  token.decriptar(req.user.usuarioEmpresaId)))
    }else{
      cb(null, path.join(__dirname, '../public/archivos/cronograma/'))
    }    
  },
  filename:function(req,file,cb){
    let elArchivo = ahora + '_' + uuidv4() + '_' + token.decriptar(req.user.usuarioEmpresaId) + '_' +  goodName(file.originalname||file.fieldname)
    return cb(null, elArchivo)
  },
})

let uploadCrono = multer({
  storage:storageCrono,  
  fileFilter: function (req, file, cb) {
    if(parseInt(tipoArchivoPlano.indexOf(file.mimetype)) < 0) {     
        req.fileValidationError = 'Formato no valido '+ file.originalname;
        return cb(null, false);
    }
    cb(null, true)
  },
})

let storageExcusa = multer.diskStorage({
  destination: function (req, file, cb){
    if(req.user.usuarioEmpresaId){
      cb(null, path.join(__dirname, '../public/archivos/excusas/',  token.decriptar(req.user.usuarioEmpresaId)))
    }else{
      cb(null, path.join(__dirname, '../public/archivos/excusas/'))
    }    
  },
  filename:function(req,file,cb){
    let elArchivo = ahora + '_' + uuidv4() + '_' +  goodName(file.originalname||file.fieldname)
    return cb(null, elArchivo)
  },
})

let uploadExcusa = multer({
  storage:storageExcusa,  
  fileFilter: function (req, file, cb) {
    if(parseInt(tipoArchivo.indexOf(file.mimetype)) < 0) {     
        req.fileValidationError = 'Formato no valido '+ goodName(file.originalname||file.fieldname);
        return cb(null, false);
    }
    cb(null, true)
  },
})



let storageInscripcion = multer.diskStorage({
  
  destination: function (req, file, cb){
    const inscripcion = JSON.parse(req.body.inscripcion)

    if(inscripcion.inscripcion[0].sede){
      cb(null, path.join(__dirname, '../public/archivos/instituciones/matriculas',  token.decriptar(inscripcion.inscripcion[0].sede)))
    }else{
      cb(null, path.join(__dirname, '../public/archivos/instituciones/matriculas'))
    }    
  },
  filename:function(req,file,cb){
    let elName = file.name || file.fieldname || file.originalname
    let preExtension = file.mimetype.split('/')
    let extension = '.'+preExtension[1].toString().trim()

    let elArchivo = ahora + '_' + token.decriptar(JSON.parse(req.body.inscripcion).inscripcion[0].sede) + '_' + JSON.parse(req.body.inscripcion).inscripcion[0].estudianteidentificacion +'_'+ goodName(elName)+extension
    req.body[elName] = '/p/d/m/'+token.decriptar(JSON.parse(req.body.inscripcion).inscripcion[0].sede)+'/'+elArchivo
    return cb(null, elArchivo)
  },
})

let uploadInscripcion = multer({
  storage:storageInscripcion,
  fileFilter: function (req, file, cb) {  
    const fileSize = parseInt(req.headers['content-length']);
    if((fileSize >= limitFilesize) || (parseInt(tipoArchivo.indexOf(file.mimetype)) < 0) ){
      req.fileValidationError = ' Formato no valido o superaste el tamaño límite de archivos '+ file.originalname;
      return cb(null, false);
    }
    cb(null, true)
  },
})

module.exports = {upload,uploadAll,uploadPath,uploadResponse,uploadAlert,uploadExcusa,uploadInscripcion,uploadCrono};