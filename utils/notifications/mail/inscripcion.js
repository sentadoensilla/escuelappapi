import nodemailer from "nodemailer";
import generateButton from "../../buttons.js";
import moment from "moment-timezone";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
require('dotenv').config();
moment.tz.setDefault("America/Bogota");
//const ahora = moment().format('YYYY-MM-DD HH:mm:ss');
//const ahora = moment().format()

// async..await is not allowed in global scope, must use a wrapper

//main().catch(console.error);
export async function send(contenido) {
  let transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_SECURE,
    // true for 465, false for other ports
    auth: {
      user: process.env.MAIL_USER,
      // testAccount.user, // generated ethereal user
      pass: process.env.MAIL_PASS // testAccount.pass, // generated ethereal password
    },
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false
    }
  });

  /*
  Apreciado/a ${contenido.name} los colegios arquidiocesanos le dan la bienvenida a nuestra gran institución, estamos complacidos de que haya
  elegido ${contenido.colegio} como el segundo hogar de ${contenido.estudiante}.  Vamos a poner todo de nuestra parte para brindarle conocimientos y valores que lo 
  consoliden como un miembro valioso de la sociedad. 
  */

  let elTexto = `
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="720" style="margin: 0; padding: 0;font-family: Helvetica, Arial, sans-serif;color:#666666;">
                <tr>                    
                    <td align="center" bgcolor="#F8F8FF" style="padding:40px 0 30px 0;text-align:center;">
                        <img src="https://drive.google.com/thumbnail?id=13Pggf5pz6-2KoTi8gO2KFvOKPX5XLWWe" alt="Creating Email Magic" width="300" />
                        <h3>Colarqui<h3>
                    </td>
                </tr>
                <tr>
                    <td bgcolor="#ffffff" style="padding: 20px 50px 20px 50px;"> 
                        <table border="0" cellpadding="0" cellspacing="0" width="100%"> 
                            <tr>                    
                                <td>
                                    <h2 style="padding:8px 4px 14px 4px;text-align:center;font-size:28pt;color:#2c7695;">${contenido.message.titulo}</h2>                    
                                </td>                    
                            </tr>                    
                            <tr>
                                <td style="padding: 20px 0 30px 0;font-size:21pt;text-align:justify;">
                                    ${contenido.message.message}
                                </td>                    
                            </tr>                    
                            <tr>                    
                                <td style="padding: 30px 30px 30px 30px;">
                                    ${contenido.message.extra || botonDefault}
                                </td>
                            </tr>                    
                        </table>                
                    </td>
                </tr>
                <tr>        
                    <td bgcolor="#F8F8FF" style="padding: 30px 30px 30px 30px;text-align:center;">
                        <table border="0" cellpadding="0" cellspacing="0">
                            <tr> 
                                <td width="75%" style="text-align:center;"> 
                                    &reg; Administracion, Cali ` + moment().format('YYYY') + `<br/>                                
                                    Unsubscribe para no recibir estos mensajes nuevamente                                
                                </td>
                                <td align="right" style="text-align:center;"> 
                                    <table border="0" cellpadding="0" cellspacing="0">                                
                                        <tr>
                                            <td>
                                                <a href="https://instagram.com/peducativacali?utm_medium=copy_link">
                                                    <img src="https://drive.google.com/thumbnail?id=1Z7X7pXc29E6PBiD0_eXFf9ZQyAVD2Iwk" target="_" alt="Instagram" width="38" height="38" style="display: block;" border="0" />                                        
                                                </a>                                        
                                            </td>                                        
                                            <td style="font-size: 0; line-height: 0;" width="20">&nbsp;</td>                                        
                                            <td>                   
                                                <a href="https://www.facebook.com/Colegios-Arquidiocesanos-586658051448799">                                        
                                                    <img src="https://drive.google.com/thumbnail?id=1ZQJNYN_hii5Na1Os5ViN47thBPUE2CAZ" target="_" alt="Facebook" width="38" height="38" style="display: block;" border="0" />                                        
                                                </a>                                        
                                            </td>                                        
                                        </tr>                                
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="2" style="text-align:center;font-size:12px;">
                                    <br/>
                                    <img src="https://drive.google.com/thumbnail?id=14h2NykaY9Q2jjDzvZ3Xx1JIWfJkzWRFz" alt="Creating Email Magic" width="92" />
                                    <br/>Compartiendo con sencillez y alegria lo que somos y lo que tenemos                            
                                </td>
                            </tr>                     
                        </table>                            
                    </td>        
                </tr>
                </table>`;
  let promise = new Promise(async (resolve, reject) => {
    //VERIFYIN ATTACHMENTS
    let adjuntos = null;
    if (typeof contenido.adjuntos !== 'undefined') {
      adjuntos = contenido.adjuntos;
    }
    if (contenido.bcc == true) {
      info = await transporter.sendMail({
        from: '"Alan, de Colarqui" <soporte@escuelapp.co>',
        // sender address
        bcc: 'sentadoensilla@gmail.com',
        //email, //list of receivers contenido.email, //
        subject: contenido.message.titulo || "Comunicado del colegio oculto ",
        // Subject line
        text: "Comunicado del colegio",
        // plain text body
        html: elTexto,
        attachments: adjuntos
      });
    } else {
      info = await transporter.sendMail({
        from: '"Alan, de Colarqui" <soporte@escuelapp.co>',
        // sender address
        to: 'sentadoensilla@gmail.com',
        //email, //list of receivers contenido.email, //
        subject: contenido.message.titulo || "Comunicado del colegio ",
        // Subject line
        text: "Comunicado del colegio",
        // plain text body
        html: elTexto,
        attachments: adjuntos
      });
    }
    if (info.messageId) {
      resolve(info.response);
    } else {
      reject(0);
    }
  }).catch(error => error.toString());
  return promise;
}
export default {
  send: send
};
