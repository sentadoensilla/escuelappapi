import nodemailer from "nodemailer";
import generateButton from "../../buttons.js";
import presetText from "../../textos.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
require('dotenv').config();
export async function send(data) {
  let botonDefault = generateButton.boton({
    type: 'warn',
    shape: 'square',
    link: process.env.APP_API_FRONT,
    text: ' ' + process.env.MAIL_DOMAIN + ' '
  });
  let transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false,
    // process.env.MAIL_SECURE, // true for 465, false for other ports
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
  let promise = new Promise(async (resolve, reject) => {
    let info = await transporter.sendMail({
      from: process.env.MAIL_SENDER_NAME + ' <' + process.env.MAIL_SENDER_ACCOUNT + '>',
      // sender address
      to: data.email,
      // list of receivers
      subject: process.env.MAIL_SENDER_SUBJECT,
      // Subject line
      text: process.env.MAIL_SENDER_TEXT,
      // plain text body
      html: `
                ${presetText.encabezadoPagina({
        logo: process.env.MAIL_SENDER_LOGO,
        email: data.email,
        titulo: process.env.MAIL_DOMAIN,
        subtitulo: process.env.MAIL_SENDER_TEXT_ALT
      })}
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="margin: 0; padding: 0;font-family: Helvetica, Arial, sans-serif;color:#666666;">
                    <tr>
                    
                        <td bgcolor="#ffffff" style="padding: 20px 50px 20px 50px;">
            
                            <table border="0" cellpadding="0" cellspacing="0" width="100%"> 
                                <tr>                    
                                    <td>
                                        <h2 style="padding:8px 4px 14px 4px;text-align:center;font-size:28pt;color:#2c7695;">${process.env.MAIL_SENDER_SUBJECT}</h2>                    
                                    </td>                    
                                </tr>                    
                                <tr>
                                    <td style="padding: 20px 0 30px 0;text-align:justify;">                    
                                        
                                        
                                        La cuenta ${data.account} acaba de ser habilitada en misvotos.com para ayudar en los procesos con los votantes en su campaña

                                        <ul>
                                            <li>
                                                <h2 style="font-size:18pt;margin-top:0;color:#007bff;">Registrar reclutadores:</h2>
                                                <p style="font-size:14pt;line-height:1.82;word-break:break-word;color:#343a40;">
                                                    Registre a cada persona dentro de su equipo de trabajo que se dedicarán a
                                                    conseguir y convencer a los votantes, ellos podrán reclutarlos usando misvotos.com desde su smartphone
                                                    Y para el tema publicitario, sería muy importante para la campaña, obtener el número de whatsapp de los votantes
                                                </p>
                                            </li>
                                            <li>
                                                <h2 style="font-size:17px;margin-top:0;color:#007bff;">Establecer metas para los reclutadores:</h2>
                                                <p style="font-size:14pt;line-height:1.82;word-break:break-word;color:#343a40;">
                                                    Establezca una meta de votantes para la campaña en un tiempo determinado, el sistema asignará a cada reclutador una meta 
                                                    diaria de votantes, ellos la consiguen y todo estará bien.
                                                </p>
                                            </li>
                                            <li>
                                                <h2 style="font-size:17px;margin-top:0;color:#007bff;">Registrar votantes:</h2>
                                                <p style="font-size:14pt;line-height:1.82;word-break:break-word;color:#343a40;">
                                                    Los reclutadores deben registrar los votantes, cumplir sus metas diarias de registro para la campaña.  Ideal que cada votante 
                                                    aporte su número de whatsapp para que reciba la información de la campaña (volantes y demás). Además estos votantes
                                                    deben aprobar el uso de sus datos personales a través de whatsapp.
                                                </p>
                                            </li>
                                            <li>
                                                <h2 style="font-size:17px;margin-top:0;color:#007bff;">Obtener métricas:</h2>
                                                <p style="font-size:14pt;line-height:1.82;word-break:break-word;color:#343a40;">
                                                    misvotos.com ofrece a la campaña, las estadísticas para ver el progreso de cada reclutador
                                                    y además también dejará ver características de los votantes, datos útiles para medir la campaña
                                                </p>
                                            </li>
                                            <li>
                                                <h2 style="font-size:17px;margin-top:0;color:#007bff;">Enviar publicidad, videos, audios y volantes:</h2>
                                                <p style="font-size:14pt;line-height:1.82;word-break:break-word;color:#343a40;">
                                                    misvotos.com ofrece a las campañas con plan "Ganador" la posibilidad de mostrar todo sobre la campaña<br/>Imagínate las posibilidades de mostrarle al votante un video con el candidato hablando, o un volante con la información de la campaña, o un audio con el mensaje del candidato, todo esto directo al votante sin intermediarios, sin que el reclutador tenga que hacer nada, solo registrar al votante y listo, el sistema se encarga de enviarle toda la información a los votantes registrados.
                                                </p>
                                            </li>                                          
                                        </ul>
                                        
                                        <h3 style="padding:8px 4px 14px 4px;text-align:center;font-size:28pt;color:#2c7695;">Su usuario es: ${data.email} </h3> 
                                        <h3 style="padding:8px 4px 14px 4px;text-align:center;font-size:28pt;color:#2c7695;">Su clave es: ${data.pass} </h3>
                                        <p style="text-align:center;">
                                            ${botonDefault}
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
                `
    });
    if (info.messageId) {
      resolve("Correo Enviado con Exito");
    } else {
      reject("Error Al enviar el Correo");
    }
  });
  return promise;
}
export default {
  send: send
}; // async..await is not allowed in global scope, must use a wrapper
//main().catch(console.error);
