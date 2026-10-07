import webpush from "web-push";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
require('dotenv').config();
webpush.setVapidDetails('mailto:sentadoensilla@gmail.com', process.env.PUBLIC_KEY_PVID, process.env.PRIVATE_KEY_PVID);
export default webpush;
