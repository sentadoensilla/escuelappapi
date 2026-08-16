require('dotenv').config()
//const path = require('path')
//var fs = require('fs')
const Db = require("../utils/datasource.js");
const queryes = require("../../sql/whatsapp.js");
const token = require('../token.js');

const init = async()=>{
    const queueNames = [
        "processNumberOne",
        "processNumberTwo",
        "processNumberThree"
    ]
    const parallelQueue = require("./parallelQueue")
    queueNames.forEach(async queueName=>{
        await parallelQueue.createInstance(queueName)
    })
    const processNumberOne = await parallelQueue.getInstance("processNumberOne")
    await processNumberOne.add({parallerProcessor:"processNumberOne"})

    //
    const processNumberTwo = await parallelQueue.getInstance("processNumberTwo")
    await processNumberTwo.add({parallerProcessor:"processNumberTwo"})

    //
    const processNumberThree = await parallelQueue.getInstance("processNumberThree")
    await processNumberThree.add({parallerProcessor:"processNumberThree"})
    
    await Db.query({
        text: queryes.listaSedes,
        values: []
    }).then(async results => {
        
        /*                  
        const laCola = `
            const util = require('util');
            const sleep = util.promisify(setTimeout);
            const wpSender = require('../../../utils/notifications/whatsapp/wpRomote')

            module.exports = async (job,done) =>{
                await sleep(333)
                await wpSender.sendMessageQueue(job.data.message)
                done(null,"Job# has been done")
            }
            `
            */
        results.rows.map(async(laInst, i) =>{
            let sede = 'queue'+parseInt(laInst.aeinst_id)
            await parallelQueue.createInstance(sede)

            /*                                     
            let myProcessor = path.join(__dirname, `./process/${sede}.js`)
            fs.writeFile(myProcessor, laCola, function (err, file) {
                if (err) throw err;
                console.log(`${myProcessor} File is created successfully`);
            });

            console.info(i+' -> Created queue: ', sede)
            */            
        })       
    
    }).catch(async error =>{
        console.log('wpQueue: no hubo colegios, revisar la tabla data.aeinstituciones ', error)
    })
}

init()
