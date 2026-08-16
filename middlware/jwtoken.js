const services = require('../utils/token')
var moment = require('moment')


module.exports = {
    notAuth:async(req,res,next)=>{
        try{
            req.user = result.sub;
            next();       
        }catch(err){
            res.send(err);
        }     
    },

    isAuth:async(req,res,next)=>{
        if(!req.headers.authorization ||
            !req.headers.authorization.startsWith('Bearer') ||
            !req.headers.authorization.split(' ')[1]){

            return res.send({success:'fail',statusCode:403,message:'No tienes Autorizacion isAuth'})
        }
        const token = req.headers.authorization.split(" ")[1];
        services.verifyToken(token)
       .then((result) => {
           // jose.jwtVerify devuelve el payload en result.payload.sub (no result.sub).
           req.user = (result.payload && result.payload.sub) || result.sub;
           next();    
       }).catch((err) => {
           res.send(err);
       });
       
    },

    estudiante:async(req,res,aux)=>{
        let rol = parseInt(services.decriptar(req.user?.usuarioRollId))
        let argumentos = []

        if(rol === 3 || rol === 2 || rol === 1
            || rol === 203 || rol === 202 || rol === 201
        ){
            res.status(200)
            argumentos[3]=res.statusCode
            await services.logsteps(argumentos)
            next();
            return;
        }else{
            res.status(401)
            argumentos[3]=res.statusCode
            await services.logsteps(argumentos) 
            res.send({status:'Unauthorized',statusCode: 401, message:'No tienes autorizacion'})           
            return
        }
    },

    Admin_academico:async(req,res,next)=>{
        
        let rol = parseInt(services.decriptar(req.user?.usuarioRollId))
        let argumentos = [];

        if(rol === 1 || rol === 201 || rol === 207 || rol === 208){
            res.status(200)
            argumentos = [
                services.decriptar(req.user.usuarioId),
                moment().format(),
                req.originalUrl,
                res.statusCode,
                (req.headers['x-forwarded-for'] || req.socket.remoteAddress || null),
                req.useragent.browser,
                req.useragent.os,
                '',
                req.useragent.version,
                ''
            ];

            await services.logsteps(argumentos)
            next();
            return;
        }else{
            res.status(401)
            argumentos[3] = res.statusCode
            await services.logsteps(argumentos)
            res.send({status:'Unauthorized',statusCode: 401, message:'No tienes autorizacion'}) 
            return
        }

    },

    Admin:async(req,res,next)=>{
        
        let rol = parseInt(services.decriptar(req.user?.usuarioRollId))
        let argumentos = [];

        if(rol === 1 || rol === 4 || rol === 201 || rol === 204 || rol === 205 || rol === 207 || rol === 208){
            res.status(200)
            argumentos = [
                services.decriptar(req.user.usuarioId),
                moment().format(),
                req.originalUrl,
                res.statusCode,
                (req.headers['x-forwarded-for'] || req.socket.remoteAddress || null),
                req.useragent.browser,
                req.useragent.os,
                '',
                req.useragent.version,
                ''
            ];
            await services.logsteps(argumentos)
            next();
            return;
        }else{
            res.status(401)
            argumentos[3] = res.statusCode
            await services.logsteps(argumentos)
            res.send({status:'Unauthorized',statusCode: 401, message:'No tienes autorizacion'}) 
            return
        }

    },

    isTeacher:async(req,res,next)=>{
        let rol = parseInt(services.decriptar(req.user?.usuarioRollId))
        let argumentos = []

        if(rol === 2 || rol === 202){
            res.status(200)
            argumentos = [
                services.decriptar(req.user.usuarioId),
                moment().format(),
                req.originalUrl,
                res.statusCode,
                (req.headers['x-forwarded-for'] || req.socket.remoteAddress || null),
                req.useragent.browser,
                req.useragent.os,
                '',
                req.useragent.version,
                ''
            ];
            await services.logsteps(argumentos)
            next();
            return;
        }else{
            res.status(401)
            argumentos[3] = res.statusCode
            await services.logsteps(argumentos)
            res.send({status:'Unauthorized',statusCode: 401, message:'No tienes autorizacion'}) 
            return
        }
    },

    isAcudient:async(req,res,next)=>{
        let rol = parseInt(services.decriptar(req.user?.usuarioRollId))
        let argumentos = [];

        if(rol === 3 || rol === 6 || rol === 203 || rol === 206){
            res.status(200)
            argumentos = [
                services.decriptar(req.user.usuarioId),
                moment().format(),
                req.originalUrl,
                res.statusCode,
                (req.headers['x-forwarded-for'] || req.socket.remoteAddress || null),
                req.useragent.browser,
                req.useragent.os,
                '',
                req.useragent.version,
                ''
            ];
            await services.logsteps(req)
            next();
            return;
        }else{
            res.status(400)
            let argumentos = {req, ...res}
            await services.logsteps(argumentos)
            res.send({status:'Unauthorized',statusCode: 401, message:'No tienes autorizacion'}) 
            return
        }
    },

    isDirector_and_tecaher:async(req,res,next)=>{
        let rol = parseInt(services.decriptar(req.user?.usuarioRollId))
        let argumentos = [];

        if(rol === 1 || rol === 2 || rol === 201 || rol === 202){

            res.status(200)
            argumentos = [
                services.decriptar(req.user.usuarioId),
                moment().format(),
                req.originalUrl,
                res.statusCode,
                (req.headers['x-forwarded-for'] || req.socket.remoteAddress || null),
                req.useragent.browser,
                req.useragent.os,
                '',
                req.useragent.version,
                ''
            ];
            await services.logsteps(argumentos)
             next();
             return;
        }else{
            res.status(401)
            argumentos[3]=res.statusCode
            await services.logsteps(argumentos)
            res.send({status:'Unauthorized',statusCode: 401, message:'No tienes autorizacion'})
            return
        }
    },

    isAcudiente_and_estudiante:async(req,res,next)=>{
        let rol = parseInt(services.decriptar(req.user?.usuarioRollId))
        let argumentos = [];

        if(rol === 3 || rol === 6 || rol === 203 || rol === 206){
            res.status(200)
            argumentos = [
                services.decriptar(req.user.usuarioId),
                moment().format(),
                req.originalUrl,
                res.statusCode,
                (req.headers['x-forwarded-for'] || req.socket.remoteAddress || null),
                req.useragent.browser,
                req.useragent.os,
                '',
                req.useragent.version,
                ''
            ];
            await services.logsteps(argumentos)
            next();
            return;
        }else{
            res.status(400)
            argumentos[3]=res.statusCode
            await services.logsteps(argumentos)
            res.send({status:'Unauthorized',statusCode: 401, message:'No tienes autorizacion'}) 
            return
        }
    }, 
    
    isAcudiente_and_estudiante_and_institucion:async(req,res,next)=>{
        
        let rol = parseInt(services.decriptar(req.user?.usuarioRollId))
        let argumentos = [];

        if(rol === 1 || rol === 3 || rol === 6 || rol === 201 || rol === 203 || rol === 206 || rol === 207 || rol === 208){
            res.status(200)
            argumentos = [
                services.decriptar(req.user.usuarioId),
                moment().format(),
                req.originalUrl,
                res.statusCode,
                (req.headers['x-forwarded-for'] || req.socket.remoteAddress || null),
                req.useragent.browser,
                req.useragent.os,
                '',
                req.useragent.version,
                ''
            ];
            await services.logsteps(argumentos)
            next();
            return;
        }else{
            res.status(401)
            argumentos[3] = res.statusCode
            await services.logsteps(argumentos)
            res.send({status:'Unauthorized',statusCode: 401, message:'No tienes autorizacion'}) 
            return
        }
    },

    isAcademico_and_estudiante_and_teacher:async(req,res,next)=>{
        let rol = parseInt(services.decriptar(req.user?.usuarioRollId))
        let argumentos = [];

        if(rol === 1 || rol === 2 || rol === 3
            || rol === 201 || rol === 202 || rol === 203
        ){
            res.status(200)
            argumentos = [
                services.decriptar(req.user.usuarioId),
                moment().format(),
                req.originalUrl,
                res.statusCode,
                (req.headers['x-forwarded-for'] || req.socket.remoteAddress || null),
                req.useragent.browser,
                req.useragent.os,
                '',
                req.useragent.version,
                ''
            ];
            await services.logsteps(argumentos)
            next();
            return;
        }else{
            res.status(401)
            argumentos[3] = res.statusCode
            await services.logsteps(argumentos)
            res.send({status:'Unauthorized',statusCode: 401, message:'No tienes autorizacion'}) 
            return
        }
    },

    isDirector_and_tecaher_and_admin: async(req,res,next)=>{
        let rol = parseInt(services.decriptar(req.user?.usuarioRollId))
        let argumentos = [];

        if(rol === 1 || rol === 2 || rol === 4
            || rol === 201 || rol === 202 || rol === 204
        ){
            res.status(200)
            argumentos = [
                services.decriptar(req.user.usuarioId),
                moment().format(),
                req.originalUrl,
                res.statusCode,
                (req.headers['x-forwarded-for'] || req.socket.remoteAddress || null),
                req.useragent.browser,
                req.useragent.os,
                '',
                req.useragent.version,
                ''
            ];
            await services.logsteps(argumentos)
             next();
             return;
        }else{
            res.status(401)
            argumentos[3]=res.statusCode
            await services.logsteps(argumentos)
            res.send({status:'Unauthorized',statusCode: 401, message:'No tienes autorizacion'}) 
            return
        }
    },
  
}