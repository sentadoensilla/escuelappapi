const Cryptr = require ('cryptr') ;   
const cryptr = new Cryptr ('cifrado_key');    
 
module.exports = {

    pass:  (password)=>{
        let promise = new Promise ((resolve,reject)=>{
    
          let encry =  cryptr.encrypt(password);
          if(encry != password){
            resolve(encry)
          }else{
              reject('error en la encriptacion')
          }

        })
    
        return  promise 
      },  

    compare: (pass,compass)=>{
        
        const promise = new Promise((resolve,reject)=>{
            let decryp = cryptr.decrypt(compass);

            if(pass === decryp){
                resolve(true);
            }else{
                reject('error decrypt')
            }

           
        })    

        return promise
    },


    decryp: (pass)=>{
        
        const promise = new Promise((resolve,reject)=>{
            let pasw = cryptr.decrypt(pass);

            if(pass != pasw){
                resolve(pasw);
            }else{
                reject('error decrypt')
            }

           
        })    

        return promise
    }

}