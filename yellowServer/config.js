const fs = require('fs');
const path = require('path');
let data_config = fs.readFileSync(path.resolve(__dirname, 'c.json'));
let config = JSON.parse(data_config);
let hostname = config.hostname;
let port = config.port;

module.exports.hostname = hostname;
module.exports.port = port;
