const net = require('net');
let config = require('./config.js');
const readline = require('readline');

rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
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
      console.log('serverData:old Data');
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
function speak() {
  rl.question('Command: ', function (data) {
    if (data == 'exit') {
      rl.close();
    } else {
      this.write(string);
      speak();
    }
  });
}

let client = new Client();
client.join();

client.removeAllListeners('data');
client.on('data', (data) => {
  console.log('serverData:');
  var buf = Buffer.from(data);
  let obj = JSON.parse(buf.toString());
  console.log(obj);
});
// speak();

function generate_message(string) {
  let obj = JSON.parse(string);
  return obj;
}
