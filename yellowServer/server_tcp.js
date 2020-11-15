const net = require('net');
let config = require('./config.js');
let util = require('./util.js');

let serverData = 'data from the server!!!';

var server = net.createServer();
var clients = {};

server.on('connection', function (socket) {
  console.log('client connected');
  let id = util.uuid();
  clients[id] = socket;
  try {
    socket.write('Hello from server!');
    socket.write('your id: ' + id);
  } catch (error) {
    console.log('error');
  }
  socket.on('data', (data) => {
    console.log('clientData:');
    var buf = Buffer.from(data);
    console.log(buf.toString());
  });
  socket.on('end', () => {
    console.log('client disconnected');
  });
});

server.listen(config.port, () => {
  console.log(`Server running at http://${config.hostname}:${config.port}/`);
});

module.exports = {
  server: server,
  clients: clients,
};
