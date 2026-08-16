

module.exports ={

   

    generate(){
            
        let characters = "518746392abcdefghijklmnopqrstuvwxyz5783413692ABCDEFGHIJKLMNOPQRSTUVWXYZ";            
        let pass=""
        for (i=0; i < 9; i++){
            pass += characters.charAt(Math.floor(Math.random()*characters.length));   
        }
        return pass
    }
}