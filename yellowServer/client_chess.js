const net = require('net');
const path = require('path');
const tcp = require(path.resolve(__dirname, 'client_tcp.js'));

class Chess extends tcp.Client {
  constructor() {
    super();
    this.pieces = [];
  }
}

let client = new Chess();

client.on('data', (data) => {
  var buf = Buffer.from(data);
  console.log(buf.toString());
  let obj = JSON.parse(buf.toString());
  let header = obj.header;
  let message = obj.message;
  client.emit(header, message);
});
client.on('setPieces', (data) => {
  console.log('serverData:');
  this.pieces = data;
  console.log(data);
});
client.on('test', (data) => {
  console.log('serverData:');
  console.log(data);
});

client.join();
