const { admin } = require('./firebase-conf')
const notification_options = {
    priority: "high",
    timeToLive: 60 * 60 * 24
  };
  const paginate = (arr, size) => {
    return arr.reduce((acc, val, i) => {
      let idx = Math.floor(i / size)
      let page = acc[idx] || (acc[idx] = [])
      page.push(val)
  
      return acc
    }, [])
  }
module.exports = {
    pushGetToken(idToken){
        //VERIFICAR LA VALIDEZ DEL TOKEN, 
        //SI TOKEN INVALIDO O VENCIDO
        //    RENOVARLO DESDE FIREBASE, CAMBIARLO EN LA DB

        let checkRevoked = true;
        admin
          .auth()
          .verifyIdToken(idToken, checkRevoked)
          .then((payload) => {
            // Token is valid.
            console.log('Token is valid')
            return {status:200,message:'Token is valid'}
          })
          .catch((error) => {
            if (error.code == 'auth/id-token-revoked') {
              // Token has been revoked. Inform the user to reauthenticate or signOut() the user.
                console.log('Token has been revoked')

              return {status:404,message:'Token has been revoked. Inform the user to reauthenticate or signOut() the user'}
            } else {
                //Token is invalid.
                //admin.messaging.deleteToken(idToken)
                console.log('Token is invalid')
                return {status:401,message:'Token is invalid'}
            }
          });
    },
    async pushSendMessageTopic(){

    },
    /**
     * pushSendMessage({})
     * si(token > 1){
     *  enviar a muchos dispositivos sendMulticast()
     *  devolver exitos y errores
     * }sino{
     *  enviar a un solo dispositivo sendToDevice()
     *  devolver exitos y errores
     * }
     */

    async pushSendMessage(datos){
        let respuestaFinal = {};
        let registrationTokens = [];
        console.log('Token recibidos',datos.tokens)
        if(datos.tokens.length > 0){
            let limit = 400
            let pieces = Math.ceil(datos.tokens.length/limit)
            

            if(datos.tokens.length > 1){
                //FIREBASE HAS A LIMIT OF MESSAGE IN A ROW (500), BUT 
                //WE HAS TO SEND 400 IN A ROW
                
                for(d=0; d<pieces; d++){
                    let tokenPartes = paginate(datos.tokens, pieces)
                    //console.log('datos llego asi: ',datos)
                    //REAL TOKEN
                    //datos.tokens = datos.tokens
                    //FAKED TOKEN
                    datos.tokens = tokenPartes.map( (item) => {
                        if(item.length > 4){
                            return item+'fake'
                        }                        
                    })

                    let adiciones = {title: datos.message.notification.title, body: datos.message.notification.body}
                    datos.data = { ...datos.data, ...adiciones }

                    admin.messaging().sendMulticast(datos)
                    .then((response) => {
                        respuestaFinal = response;
                        //console.log('meta de datos: ',datos)
                        let adiciones = {
                            notification:{
                                route:datos.message.data.route, 
                                index: datos.message.data.index, 
                                title: datos.message.notification.title, 
                                body: datos.message.notification.body
                            }
                        }
                        respuestaFinal = { ...respuestaFinal, ...adiciones };

                        if (response.failureCount > 0) {
                            const failedTokens = [];
                            response.responses.forEach((resp, idx) => {
                                if (!resp.success) {
                                    failedTokens.push(registrationTokens[idx]);
                                }
                            });
                            respuestaFinal.tokenfailure = failedTokens
                        }
                        console.log('Esta es la respuesta de firebase: ', respuestaFinal)
                        return respuestaFinal;
                    }).catch( error => {
                        console.log('Error firebase.pushSendMessage.sendMulticast : ', error)    
                        return error;
                    });
                }
            }else{
                //FIREBASE HAS A LIMIT OF MESSAGE IN A ROW (500), BUT 
                //WE HAS TO SEND 400 IN A ROW
                for(d=0; d<pieces; d++){
                    let tokenPartes = paginate(datos.tokens, pieces)
                    if(tokenPartes.length > 4){
                        admin.messaging().sendToDevice(tokenPartes, datos.message, notification_options)
                        .then( response => {
                            respuestaFinal = response;
                            if (response.failureCount > 0) {
                                const failedTokens = [];
                                if (!response.success) {
                                    failedTokens.push(datos.tokens);
                                }
                                respuestaFinal.tokenfailure = failedTokens
                            }                
                            //console.log(respuestaFinal)
                            return respuestaFinal
                        })
                        .catch( error => {
                            console.log('Error firebase.pushSendMessage.sendToDevice: ', error.toString())    
                            return error.toString();
                        });
                    }
                }
            }
        }       
    },
}