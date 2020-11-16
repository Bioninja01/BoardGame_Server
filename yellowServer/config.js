const fs = require('fs');
let data_config = fs.readFileSync('c.json');
let config = JSON.parse(data_config);
let hostname = config.hostname;
let port = config.port;

module.exports.hostname = hostname;
module.exports.port = port;
