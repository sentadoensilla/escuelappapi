const db = require("../../database/conexpool");
const SchedulerEvents = db.scheduler;


    exports.getData = (req, res) => {
        SchedulerEvents.findAll()
            .then(data => {
                res.send(data);
            })
            .catch(err => {
                res.status(500).send({
                    message:
                        err.message || "Ocurrió un error mientras listamos los eventos"
                });
            });
    };

    exports.crudActions = (req, res) => {
        if(req.body.added !== null && req.body.added.length > 0){
            for(var i = 0; i < req.body.added.length; i++){
                var insertData = req.body.added[i];
                SchedulerEvents.create(insertData)
                    .then(data => {
                        res.send(data);
                    })
                    .catch(err => {
                        res.status(500).send({
                            message:
                                err.message || "Ocurrió algo inesperado registrando el evento"
                        });
                    });
             }
        }
   
        if(req.body.changed !== null && req.body.changed.length > 0){
            for(var i = 0; i < req.body.changed.length; i++){
                var updateData = req.body.changed[i];
                SchedulerEvents.update(updateData, { where: { id: updateData.id } })
                .then(num => {
                    if(num == 1) {
                        res.send(updateData);
                    }else{
                        res.send({
                            message: `No fue posible actualizar el evento ${id}. Tal vez no lo encontramos o no entendí el evento...`
                        });
                    }
                })
                .catch(err => {
                    res.status(500).send({
                        message: "Ocurrió un error actualizando el evento " + id
                    });
                });
            }
        }
   
        if(req.body.deleted !== null && req.body.deleted.length > 0) {
            for(var i = 0; i < req.body.deleted.length; i++){
                var deleteData = req.body.deleted[i];
                SchedulerEvents.destroy({ where: { id: deleteData.id } })
                   .then(num => {
                       if (num == 1) {
                           res.send(deleteData);
                       } else {
                           res.send({
                               message: `No fue posible eliminar el evento ${id}. Quizá no fue econtrado!`
                           });
                       }
                    })
                    .catch(err => {
                       res.status(500).send({
                           message: "No fue posible eliminar el evento " + id
                       });
                    });
            }
        }
   };
