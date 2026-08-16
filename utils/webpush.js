const webpush = require('web-push');
require('dotenv').config()


webpush.setVapidDetails('mailto:sentadoensilla@gmail.com',process.env.PUBLIC_KEY_PVID,process.env.PRIVATE_KEY_PVID);

module.exports = webpush;