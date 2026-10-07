import { createRequire } from "module";
const require = createRequire(import.meta.url);
require('dotenv').config();
export function encabezadoPagina(props) {
  return `
        <div style="width:100%;text-align:center;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px; padding: 10px;font-family: Helvetica, Arial, sans-serif;color:#666666;">
                <tr>
                    <td align="center" bgcolor="#F8F8FF" style="padding:40px 0 30px 0;text-align:center;">
                        <img src="${props.logo}" alt="${props.titulo}" width="300" />
                        <h2 style="padding:4px 4px 2px 4px;text-align:center;font-size:28pt;color:#2c7695;">${props.titulo}</h2>
                    </td>
                </tr>
                <tr>
                    <td bgcolor="#ffffff" style="padding: 20px 50px 20px 50px;">
                        <h3 style="padding:8px 4px 14px 4px;text-align:center;font-size:22pt;color:#2c7695;">${props.subtitulo}</h3>               
                    </td>
                </tr>
            </table>
        </div>
        `;
}
export function piePagina(props) {
  return `
        <table align="center" border="0" cellpadding="0" cellspacing="0">
            <tr> 
                <td width="75%"> 
                    &reg; Array SAS, Cali, Colombia<br/>                                
                    <a href="${props.domain}/unsuscribe/${props.email}">Unsubscribe</a> para no recibir estos mensajes nuevamente                                
                </td>
                <td align="right"> 
                    <table border="0" cellpadding="0" cellspacing="0">                                
                        <tr>
                            <td>
                                <a href="https://api.whatsapp.com/send?phone=${props.numeroAtencion}&text=Hola">
                                    Atencion al cliente: <br/>${props.numeroAtencion} (solo whatsapp)
                                </a>
                            </td>
                        </tr>                                
                    </table>
                </td>
            </tr>
            <tr>
                <td colspan="2" style="text-align:center;font-size:12px;">
                    <br/>
                    <img src="${props.logo}" alt="Creating Email Magic" width="92" />
                    <br/>${props.lema}
                </td>
            </tr>
        </table> 
    `;
}
export default {
  encabezadoPagina: encabezadoPagina,
  piePagina: piePagina
};
