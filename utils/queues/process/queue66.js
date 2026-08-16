require('dotenv').config()
const util = require('util');
const sleep = util.promisify(setTimeout);
const wpSender = require('../../../utils/notifications/whatsapp/wpBaileys')
const elWait = parseInt(process.env.QUEUE_WAIT||333)
module.exports = async (job,done) =>{
    await sleep(elWait)
    await wpSender.sendMessageQueue(job.data.message)
    done(null,"Job# has been done")
}
            