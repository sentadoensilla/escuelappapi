// DEFINICIONES E IMPORTACIONES
require('dotenv').config()
const Db = require('../../database/conex') // LIBRERIA DE CONEXION A POSTGRES
const token = require('../../utils/token') // LIBRERIA DE PROPOSITO GENERAL: encriptar, decriptar, etc
const queryes = require('./tipodesempeno.sql') //LIBRERIA DE COMANDOS SQL A UTILIZAR
//const { error } = require('console')


//MODULOS O FUNCIONES QUE RESOLVERAN CADA SITUACION
module.exports={

    //FUNCIÓN PARA MOSRAR TIPOS DE DESEMPEÑO
    async ListarTipoDesempeno(req,res){
        try{
            Db.query({
                text: queryes.listadoTipoDesempeno,
                values:[]
            }).then(result=>{
                res.send({
                    status: 'success',
                    statusCode: '200',
                    message: `Se encontraron ${result.rowCount} registros`,
                    rows: result.rows
                })
            })
        }catch(error){
            console.log(error.toString())
            res.send({
                status: 'error',
                statusCode: '400',
                message: error.toString(),
                rows: []
            })
        }
    },

    //FUNCIÓN PARA INSERTAR TIPOS DE DESEMPEÑO
    async InsertarTipoDesempeno(req,res){
        //Datos recuperados del formulario
        let {nombre}=req.body
        try{
            //Formateo de datos
            nombre=nombre.trim().toString()
            
            //Validación de datos vacíos
            if(nombre===''){
                res.send({
                    status: 'error',
                    statusCode: 400,
                    message: 'Los campos no pueden estar vacios',
                    rows: []
                })
            }else{
                Db.query({
                    text: queryes.InserTipoDesempeno,
                    values:[nombre]
                }).then(result=>{
                    res.send({
                        status: 'success',
                        statusCode: '200',
                        message: `Se ingresaron ${result.rowCount} registros`,
                        rows: result.rows
                    })
                })
                .catch(error => {
                    console.log("Algo salió mal.", error.toString())
                })
            }  

        }catch(error){
            res.send({
                status: 'error',
                statusCode: '400',
                message: error.toString(),
                rows: []
            })
        }
    },

    //FUNCIÓN PARA ACTUALIZAR TIPOS DE DESEMPEÑO
    async ActualizarTipoDesempeno(req,res){
        //Datos recuperados del formulario
        let {idregistro,nombre,estado}=req.body
        try{
            //Formateo de datos
            idregistro=parseInt(token.decriptar(idregistro.toString()))
            nombre=nombre.trim().toString()
            estado=parseInt(estado.trim())

            //Validación de datos vacíos
            if(idregistro===null || nombre==='' ||  estado===null){
                res.send({
                    status: 'error',
                    statusCode: 400,
                    message: 'Los campos no pueden estar vacios',
                    rows: []
                })
            }else{
                Db.query({
                    text: queryes.UpdateTipoDesempeno,
                    values:[idregistro,nombre,estado]
                }).then(result=>{
                    res.send({
                        status: 'success',
                        statusCode: '200',
                        message: `Se actualizaron ${result.rowCount} registros`,
                        rows: result.rows
                    })
                })
                .catch(error => {
                    console.log("Algo salió mal.", error.toString())
                })
            }  

        }catch(error){
            res.send({
                status: 'error',
                statusCode: '400',
                message: error.toString(),
                rows: []
            })
        }
    },

    //FUNCIÓN PARA ELIMINAR TIPOS DE DESEMPEÑO
    async EliminarTipoDesempeno(req,res){
        //Datos recuperados del formulario
        let {reference}=req.body
        try{
            //Formateo de datos y desencriptado
            reference=parseInt(token.decriptar(reference.toString()))
            
            //Validación de datos vacíos
            if(reference===null || reference===''){
                res.send({
                    status: 'error',
                    statusCode: 400,
                    message: 'El valor de referencia es inválido',
                    rows: []
                })
            }else{
                Db.query({
                    text: queryes.DeleteTipoDesempeno,
                    values:[reference]
                }).then(result=>{
                    res.send({
                        status: 'success',
                        statusCode: '200',
                        message: `Se eliminaron ${result.rowCount} registros`,
                        rows: result.rows
                    })
                })
                .catch(error => {
                    console.log("Algo salió mal.", error.toString())
                })
            }  

        }catch(error){
            res.send({
                status: 'error',
                statusCode: '400',
                message: error.toString(),
                rows: []
            })
        }
    },

    //FUNCIÓN PARA ANULAR TIPOS DE DESEMPEÑO
    async FalsoEliminarTipoDesempeno(req,res){
        //Datos recuperados del formulario
        let {reference}=req.body
        try{
            //Formateo de datos
            reference=parseInt(token.decriptar(reference))
            
            //Validación de datos vacíos
            if(reference===null || reference===''){
                res.send({
                    status: 'error',
                    statusCode: 400,
                    message: 'El valor de referencia es inválido',
                    rows: []
                })
            }else{
                Db.query({
                    text: queryes.FalsoDeleteTipoDesempeno,
                    values:[reference]
                }).then(result=>{
                    res.send({
                        status: 'success',
                        statusCode: '200',
                        message: `Se actualizaron ${result.rowCount} registros`,
                        rows: result.rows
                    })
                })
                .catch(error => {
                    console.log("Algo salió mal.", error.toString())
                })
            }  

        }catch(error){
            res.send({
                status: 'error',
                statusCode: '400',
                message: error.toString(),
                rows: []
            })
        }
    },

}

