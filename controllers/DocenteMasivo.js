const Db = require('../database/conex')

const csv = require('csv-parser');
const fs = require('fs');
const rutaFile = 'public/archivos/instituciones/institucionales/1839/';


    async function createTeacher(){
        fs.createReadStream(rutaFile+'3. DOCENTES_2021-03-11_05-48-11.csv')
            .pipe(csv())
            .on('data', (row) => {
                //console.log(row['MAIL']);
                let chequear = checkTeacher({email:row['MAIL']});
                console.log(chequear);
            })
            .on('end', () => {
                console.log('CSV leido de Pe a Pa');
            });
    }

    async function checkTeacher(req, res){   
        try {
            let consul = `SELECT x.aeusuroll_id, u.aeusu_id, u.aeusu_nick, d.aedocentes_mail, 
            d.aedocentes_nombres || ' ' || d.aedocentes_apellidos as nombre
            FROM data.aedocentes d, engine.aeusu u, engine.aeusuroll x
            WHERE d.aedocentes_mail = $1
            AND x.aeroll_id=2
            AND d.aedocentes_id=x.aeacad_referencia
            AND x.aeusu_id=u.aeusu_id;`

            let query1 = {
                name: 'Check-teacher',
                text: consul,
                values: [req.email],
            }

    /*
            try{
                let promise_post = await Db.query(query1);
                res.send(promise_post[0]);
            }catch(error){
                res.send(error.body.message);
            }
    */       
            let promise_post = new Promise(async(resolve,reject) => {
                Db.query(query1).then((response)=>{
                    console.log('respuesta', response[0]);                    
                  if(response){
                    resolve(response.rows[0]);
                  }else{
                    //console.error(response.body.message)
                    reject(response.body.message)
                  }
                },(error)=>{
                  reject(error)
                })
            })
            return await promise_post;

            //return await Db.query(query1);
            
        }catch(err){
            return err;
        }
    }

    //REGISTRAR UN MAESTRO ASOCIANDOLO A UN COLEGIO
    async function writeTeacher(){

    };

    module.exports={createTeacher}
