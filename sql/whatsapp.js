export const getWPInfo = `
    -- OBTENER LA INFORMACION DE UN EMISOR, SEGUN EL NUMERO DE WHATSAPP
    SELECT *
    FROM contact.emisor
    WHERE emisor LIKE $1;
    `;
export const setWPSession = `
    -- GUARDAR LA SESION DE UN WHATSAPP RECIEN ESCANEADO
    -- CAMBIAR A ESTADO: 6 CONECTADO, 7 CUANDO LA CONEXION SE PIERDA
    INSERT INTO contact.emisor
    (fecharegistro, estado, idempresa, emisor, token)
    VALUES (CURRENT_TIMESTAMP, $4, $1, $2, $3)
    ON CONFLICT (idempresa)
    DO UPDATE 
    SET fecharegistro=CURRENT_TIMESTAMP, estado=$4, token=$3, emisor=$2;
    `;
export const setWPStatus = `
    -- CAMBIAR EL ESTADO DE UN NUMERO DE WHATSAPP CUANDO INICIA O RESTAURA SESION
    UPDATE contact.emisor
    SET estado=$2, token=$3
    WHERE emisor=$1;
    `;
export const myWPSessions = `
    -- OBTENER TODAS LAS SESIONES DE WHATSAPP DE MI EMPRESA
    SELECT 
    c.idemisor, c.idempresa::integer as idcampana, c.fecharegistro, 
    c.estado, c.emisor, c.token, 
    (
        SELECT COUNT(DISTINCT l.aeestudiantes_id)::integer
        FROM data.aelog_envios l
        WHERE TO_CHAR(l.fecharegistro, 'YYYY-MM-DD')=TO_CHAR(current_date, 'YYYY-MM-DD')
        AND l.emisor LIKE c.emisor
        AND sent = TRUE
    ) AS mensajesenviados
    FROM contact.emisor c
    WHERE c.idempresa = ANY($1);
    `;
export const myWPSessionsExtend = `
    -- OBTENER TODAS LAS SESIONES DE WHATSAPP DE MI EMPRESA
    SELECT 
	    e.idemisor, e.idempresa::integer as idcampana, e.fecharegistro, 
	    e.estado, e.emisor, e.token,
        (
            SELECT COUNT(DISTINCT l.aeestudiantes_id)::integer
            FROM data.aelog_envios l
            WHERE TO_CHAR(l.fecharegistro, 'YYYY-MM-DD')=TO_CHAR(current_date, 'YYYY-MM-DD')
            AND l.emisor LIKE e.emisor
            AND sent = TRUE
        ) AS mensajesenviados
    FROM contact.emisor e
    WHERE e.idempresa = $1
        AND e.estado = 6;
    `;
export const allWPSessions = `
    -- OBTENER TODAS LAS SESIONES DE WHATSAPP QUE ESTAN REGISTRADAS EN EL SISTEMA
    SELECT idemisor, idempresa::integer as idcampana, fecharegistro, estado, emisor, token
    FROM contact.emisor
    ORDER BY idempresa;
    `;
export const myWPSessionsByNumber = `
    -- OBTENER TODAS LAS SESIONES DE WHATSAPP DE MI EMPRESA, USANDO UNO DE LOS NUMEROS
    SELECT 
        e.idemisor, e.idempresa::integer as idcampana, e.fecharegistro, e.estado, e.emisor, e.token
    FROM contact.emisor e
    WHERE e.idempresa IN (
        SELECT ee.idempresa FROM contact.emisor ee WHERE ee.emisor LIKE $1
    );`;
export const deleteWPRegistry = `
    -- ELIMINAR EL REGISTRO DE UN WHATSAPP EN LA BASE DE DATOS
    DELETE FROM contact.emisor WHERE emisor=$1;
    `;
export const WPsaveSocket = `
    -- REGISTRAR EL SOCKET ID (TOKEN) PARA TODOS LOS WHATSAPP DE UNA EMPRESA
    UPDATE contact.emisor
    SET token = $2
    WHERE idempresa = ANY($1)
    RETURNING *;
    `;
export const checkResultBochinche = `
    -- MARCAR EL RESULTADO DE UN ENVIO POR WHATSAPP
    UPDATE data.aelog_envios
    SET sent=$2, enviosdetalles=$3
    WHERE idlogenvios=$1
    `;
export const enviosHistory = `
    -- REGISTRO DEL ENVIO DE PUBLICIDAD EN EL LOG DE NOTIFICACIONES
    INSERT INTO data.aelog_envios
        (idreferencia, idempresa, aeestudiantes_id, emisor, fecharegistro, 
            tipo, sent, enviosdetalles)
        VALUES($1, $2, $3, $4, CURRENT_TIMESTAMP, 
            $5, $6, $7);
    `;
export const volantesHistory = `
    -- REGISTRO DEL ENVIO DE VOLANTES EN EL LOG DE NOTIFICACIONES
    INSERT INTO data.aelog_envios
        (idreferencia, idempresa, aeestudiantes_id, emisor, fecharegistro, 
            tipo, sent, enviosdetalles)
        VALUES($1, $2, $3, $4, CURRENT_TIMESTAMP, 
            3, $5, $6);
    `;
export const listaSedes = `
    -- LISTADO DE SEDES (INSTITUCIONES) PARA LAS COLAS DE NOTIFICACIONES
    SELECT aeinst_id
    FROM data.aeinstituciones
    ORDER BY aeinst_id;
    `;
export default {
  getWPInfo: getWPInfo,
  setWPSession: setWPSession,
  setWPStatus: setWPStatus,
  myWPSessions: myWPSessions,
  myWPSessionsExtend: myWPSessionsExtend,
  allWPSessions: allWPSessions,
  myWPSessionsByNumber: myWPSessionsByNumber,
  deleteWPRegistry: deleteWPRegistry,
  WPsaveSocket: WPsaveSocket,
  checkResultBochinche: checkResultBochinche,
  enviosHistory: enviosHistory,
  volantesHistory: volantesHistory,
  listaSedes: listaSedes
};
