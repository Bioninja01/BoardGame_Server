const net = require('net');
const fs = require('fs');
let config = require('./config.js');
const { throws } = require('assert');

class Client extends net.Socket {
  constructor() {
    super();
    this.port = config.port;
    this.hostname = config.hostname;
  }
  join() {
    this.connect(this.port, this.hostname, function () {
      console.log('Connected');
      this.write('Hello, server!  Love, Client.');
    });
    this.on('data', (data) => {
      console.log('serverData:');
      var buf = Buffer.from(data);
      console.log(buf.toString());
    });
  }
  disconect() {
    this.end();
  }
}

let client = new Client();
client.join();
