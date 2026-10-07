import util from "util";
import wpSender from "../../../utils/notifications/whatsapp/wpBaileys.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
require('dotenv').config();
const sleep = util.promisify(setTimeout);
const elWait = parseInt(process.env.QUEUE_WAIT || 333);
export default async (job, done) => {
  await sleep(elWait);
  await wpSender.sendMessageQueue(job.data.message);
  done(null, "Job# has been done");
};
