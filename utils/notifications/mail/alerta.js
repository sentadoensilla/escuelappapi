
const nodemailer = require("nodemailer");
const generateButton = require('../../buttons')
const presetText = require('../../textos')
require('dotenv').config(),

// async..await is not allowed in global scope, must use a wrapper


module.exports = {

    async send({name=[],subject=null,email,bcc=null,message}) {
        let botonDefault = generateButton.boton({type:'warn',shape:'square',link:process.env.APP_API_FRONT,text:' '+process.env.MAIL_DOMAIN+' '})
        let info = null
        let numeroAtencion = process.env.APP_WP_CUSTOMERS
 
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: false, // process.env.MAIL_SECURE, // true for 465, false for other ports
            auth: {
            user:  process.env.MAIL_USER, // testAccount.user, // generated ethereal user
            pass:  process.env.MAIL_PASS // testAccount.pass, // generated ethereal password
            },
            tls: {
                // do not fail on invalid certs
                rejectUnauthorized: false
            },
                
        });

        let elTexto = `
            ${presetText.encabezadoPagina({
                logo: process.env.MAIL_SENDER_LOGO,
                email: email,
                titulo: process.env.MAIL_DOMAIN,
                subtitulo: process.env.MAIL_SENDER_TEXT_ALT
            })}        
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0; padding: 0;font-family: Helvetica, Arial, sans-serif;color:#666666;">
                <tr>

                    <td align="center" bgcolor="#ffffff" style="padding: 20px 50px 20px 50px;"> 
                        <table border="0" cellpadding="0" cellspacing="0" width="100%"> 
                            <tr>                    
                                <td>
                                    <h2 style="padding:8px 4px 14px 4px;text-align:center;font-size:28pt;color:#2c7695;">${message.titulo}</h2>                    
                                </td>                    
                            </tr>
                            <tr>
                                <td style="padding: 20px 0 30px 0;font-size:21pt;text-align:justify;">
                                    ${message.message}
                                </td>                    
                            </tr>                    
                            <tr>                    
                                <td style="padding:0px;text-align:center;">
                                    ${ message.extra || botonDefault }
                                    <div style="background-color:#E1E2EF;padding:8px 4px 14px 4px;text-align:center;font-size:11pt;color:#DA4453;">                                                                                
                                    Por favor agregar soporte@misvotos.com como contacto para evitar que vaya al spam<br/>  
                                    Este mensaje es generado automaticamente por un servidor<br/>
                                    </div>
                                </td>
                            </tr>                    
                        </table>                
                    </td>

                </tr>

                <tr>        
                    <td align="center" bgcolor="#F8F8FF" style="padding: 30px 30px 30px 30px;">
                        ${presetText.piePagina({
                            numeroAtencion: numeroAtencion,
                            logo: process.env.MAIL_SENDER_LOGO_MINI,
                            email: email,
                            domain: process.env.MAIL_DOMAIN,
                            lema: process.env.MAIL_SENDER_SUBJECT
                        })}
                    </td>        
                </tr>
            </table>`;

        let promise = new Promise( async(resolve,reject) => {
            if(email.length > 0){
                if(bcc==true){
                    info = await transporter.sendMail({
                        from: ' '+process.env.MAIL_SENDER_NAME+' <'+process.env.MAIL_SENDER_ACCOUNT+'>', // sender address
                        to: email, // list of receivers
                        subject: message.subject || process.env.MAIL_SENDER_SUBJECT, // Subject line
                        text: process.env.MAIL_SENDER_TEXT, // plain text body
                        html: elTexto, 
                    });
                }else{
                    info = await transporter.sendMail({
                        from: ' '+process.env.MAIL_SENDER_NAME+' <'+process.env.MAIL_SENDER_ACCOUNT+'>', // sender address
                        to: email, // list of receivers
                        subject: message.subject || process.env.MAIL_SENDER_SUBJECT, // Subject line
                        text: process.env.MAIL_SENDER_TEXT, // plain text body
                        html: elTexto, 
                    });
                }

                if (info.messageId) {
                    resolve(info.response);
                } else {
                    reject(0);
                }
            }else{
                resolve('Esta funcion requiere 1 email o mas');
            }
        })

        
        return promise
        
    },

}
//main().catch(console.error);