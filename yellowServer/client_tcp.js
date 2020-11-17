const net = require('net');
const path = require('path');

class Client extends net.Socket {
  constructor() {
    super();
    let config = require(path.resolve(__dirname, 'config.js'));
    this.port = config.port;
    this.hostname = config.hostname;
  }
  join() {
    this.connect(this.port, this.hostname, function () {
      console.log('Connected');
      this.write('Hello, server!  Love, Client.');
    });
  }
  disconect() {
    this.end();
  }
  write_data(jsonData) {
    let string = JSON.stringify(jsonData);
    this.write(string);
  }
}

module.exports.Client = Client;
