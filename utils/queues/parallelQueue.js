require("dotenv").config();
const fs = require('fs');

var Queue = require('bull');
var concurrent = parseInt(process.env.QUEUE_CONCURRENT_PARALLEL) || 1
var processor = require("./process/parallelQueueProcessor")
const log = process.env.APP_PATH+'logqueues.log'
const logError = process.env.APP_PATH+'logqueuesError.log'
const logFailed = process.env.APP_PATH+'logqueuesFailed.log'


module.exports = class parallelQueue {
  static instances = []

  static async getInstance(queueName){
    const result = this.instances.find( ({ queueInstanceName }) => queueInstanceName === queueName );
    if(result){
      return result.queueInstance
    }
    return await this.createInstance(queueName)
  }

  static async createInstance(queueName){
    const result = this.instances.find( ({ queueInstanceName }) => queueInstanceName === queueName );
    if(result){
      return result.queueInstance
    }else{
      var queueInstance =  await this.initializeQueue(queueName);
      this.instances.push({queueInstanceName:queueName , queueInstance : queueInstance})
      return queueInstance;
    }
  }

  static async initializeQueue(queueName,){
      const debug = require('debug')(queueName)
      const redisConfig = require("./redis")
      const queueInstance = Queue(queueName, redisConfig);
      queueInstance.process(concurrent, processor) ;
      
      queueInstance.on('completed', (job, result) => {
        fs.writeFileSync(log, '[' + new Date(Date.now()).toString() + '] - '+ `${queueName} - ${JSON.stringify(job)} \n ${JSON.stringify(result)}`, {flag:'a+'});
        debug(`\n ${queueName} Job completed with result   +++ \n`,result);
      })
      
      queueInstance.on('error', (job, err) => {
        fs.writeFileSync(logError, '[' + new Date(Date.now()).toString() + '] - '+ `${queueName} - ${JSON.stringify(job)} \n ${JSON.stringify(err)} \n`, {flag:'a+'});
        debug(`\n ${queueName} Job error with result   +++ \n`,err );
      })
      
      queueInstance.on('failed', (job, err) => {
        fs.writeFileSync(logFailed, '[' + new Date(Date.now()).toString() + '] - '+ `${queueName} - ${JSON.stringify(job)}  \n ${JSON.stringify(err)} \n`, {flag:'a+'});
        debug(`\n ${queueName} Job failed with result   +++ \n` ,err );
        var data = job.data;
        queueInstance.add(data, {  delay : 60000});
        
      })
      return queueInstance;
    }


}

