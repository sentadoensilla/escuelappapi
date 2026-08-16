
require('dotenv').config()
const nodemailer = require("nodemailer");
const presetText = require('../../textos')
// async..await is not allowed in global scope, must use a wrapper


module.exports = {

    async sendLink({usuario,id,email,fecha,enlace}) {       
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: false, //  process.env.MAIL_SECURE, // true for 465, false for other ports
            auth: {
            user:  process.env.MAIL_USER, // testAccount.user, // generated ethereal user
            pass:  process.env.MAIL_PASS // testAccount.pass, // generated ethereal password
            },
            tls: {
                // do not fail on invalid certs
                rejectUnauthorized: false
            },
                
        });


        let promise = new Promise( async(resolve,reject) => {
            let info = await transporter.sendMail({
                from: process.env.MAIL_SENDER_NAME+' <'+process.env.MAIL_SENDER_ACCOUNT+'>', // sender address
                to: email, // list of receivers
                subject: "Cambio de clave, Paso 1 ",
                text: "Reset password step 1",
                html: `
                <div style="text-align:center;">
                    ${presetText.encabezadoPagina({
                        logo: process.env.MAIL_SENDER_LOGO,
                        email: data.email,
                        titulo: process.env.MAIL_DOMAIN,
                        subtitulo: process.env.MAIL_SENDER_TEXT_ALT
                    })}                
                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="500" style="margin: 0; padding: 0;font-family: Helvetica, Arial, sans-serif;color:#666666;">
    
                        <tr>
                        
                            <td bgcolor="#ffffff" style="padding: 20px 50px 20px 50px;">
                
                                <table border="0" cellpadding="0" cellspacing="0" width="100%"> 
                                    <tr>                    
                                        <td>
                                            <h1 style="padding:8px 4px 14px 4px;text-align:center;font-size:34pt;color:#2c7695;">misvotos.com: Cambio de clave</h1>                    
                                        </td>                    
                                    </tr>                    
                                    <tr>
                                        <td style="padding: 20px 0 30px 0;text-align:justify;">
                                            <h2 style="padding:8px 4px 14px 4px;text-align:center;font-size:26pt;color:#2c7695;">Paso 1: Abrir este mensaje</h2>
                                            misvotos.com registra una solicitud para cambiar la clave de acceso para el usuario ${email} en la fecha ${fecha}.<br/><br/>
                                            <h2 style="padding:8px 4px 14px 4px;text-align:center;font-size:26pt;color:#2c7695;">Paso 2: clic en el enlace</h2>
                                            Si la solicitud fue realizada por usted, de clic en el siguiente enlace y el sistema le enviara un correo con la nueva clave
                                            <p style="text-align:center;">
                                                <a style="padding:8px 4px 14px 4px;text-align:center;font-size:24pt;color:#2c7695;"
                                                href="${process.env.APP_API_FRONT}${enlace}"
                                                target="_"
                                                >Cambiar la clave</a>
                                            </p>
                                            Después de dar clic recibirá un mensaje con la nueva clave
                                            <br/><br/>
                                            En caso de que la solicitud no haya sido generada por usted, ignore este mensaje
                                        </td>                    
                                    </tr>                    
                                    <tr>                    
                                        <td style="padding: 30px 30px 30px 30px;">

                                        </td>
                                    </tr>                    
                                </table>
                                
                            </td>
                        
                        </tr>
                        
                        <tr>        
                            <td bgcolor="#F8F8FF" style="padding: 30px 30px 30px 30px;">
                                ${presetText.piePagina({
                                    numeroAtencion: numeroAtencion,
                                    logo: process.env.MAIL_SENDER_LOGO_MINI,
                                    email: data.email,
                                    domain: process.env.MAIL_DOMAIN,
                                    lema: process.env.MAIL_SENDER_SUBJECT
                                })}                           
                            </td>        
                        </tr>
                    </table>
                </div>`, 
            });
        
            if (info.messageId) {
                resolve("Correo Enviado con Exito")
            } else {
                reject("Error Al enviar el Correo")
            }            
        })

        return promise
    },

    async sendPass({usuario,id,email,fecha,clave}) {       
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: false, //  process.env.MAIL_SECURE, // true for 465, false for other ports
            auth: {
            user:  process.env.MAIL_USER, // testAccount.user, // generated ethereal user
            pass:  process.env.MAIL_PASS // testAccount.pass, // generated ethereal password
            },
            tls: {
                // do not fail on invalid certs
                rejectUnauthorized: false
            },
                
        });


        let promise = new Promise( async(resolve,reject) => {
            let info = await transporter.sendMail({
                from: process.env.MAIL_SENDER_NAME+' <'+process.env.MAIL_SENDER_ACCOUNT+'>', // sender address
                to: email, // list of receivers
                subject: "Cambio de clave, paso 2 ",
                text: "Reset password step 2",
                html: `
                <div style="text-align:center;">
                ${presetText.encabezadoPagina({
                    logo: process.env.MAIL_SENDER_LOGO,
                    email: data.email,
                    titulo: process.env.MAIL_DOMAIN,
                    subtitulo: process.env.MAIL_SENDER_TEXT_ALT
                })}                
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="500" style="margin: 0; padding: 0;font-family: Helvetica, Arial, sans-serif;color:#666666;">
     
                    <tr>
                    
                        <td bgcolor="#ffffff" style="padding: 20px 50px 20px 50px;">
            
                            <table border="0" cellpadding="0" cellspacing="0" width="100%"> 
                                <tr>                    
                                    <td>
                                        <h2 style="padding:8px 4px 14px 4px;text-align:center;font-size:28pt;color:#2c7695;">misvotos.com: Cambio de clave</h2>                    
                                    </td>                    
                                </tr>                    
                                <tr>
                                    <td style="padding: 20px 0 30px 0;text-align:justify;">                            
                                        misvotos.com le envia la nueva clave para el usuario ${email} <br/><br/>
                                        <p style="text-align:center;">
                                            <a style="padding:8px 4px 14px 4px;text-align:center;font-size:28pt;color:#2c7695;">${clave}</a>
                                        </p>
                                        
                                    </td>                    
                                </tr>                    
                                <tr>                    
                                    <td style="padding: 30px 30px 30px 30px;">

                                    </td>
                                </tr>                    
                            </table>
                            
                        </td>
                    
                    </tr>
                    
                    <tr>        
                        <td bgcolor="#F8F8FF" style="padding: 30px 30px 30px 30px;">
                            ${presetText.piePagina({
                                numeroAtencion: numeroAtencion,
                                logo: process.env.MAIL_SENDER_LOGO_MINI,
                                email: data.email,
                                domain: process.env.MAIL_DOMAIN,
                                lema: process.env.MAIL_SENDER_SUBJECT
                            })}                             
                        </td>        
                    </tr>
        
                </table>
            </div>`, 
            });

        
            if (info.messageId) {
                resolve("Correo Enviado con Exito")
            } else {
                reject("Error Al enviar el Correo")
            }

            
        })
        
        return promise

    }
}
//main().catch(console.error);