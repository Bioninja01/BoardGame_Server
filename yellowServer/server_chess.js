let net = require('net');
let config = require('./config.js');
let util = require('./util.js');
let chess = require('./public/chess.js');

class ChessServer extends net.Server {
  constructor() {
    super();
    this.clients = {};
    this.board = null;
    this.player1 = null;
    this.player2 = null;
  }
  client_response(client, json) {
    let header = json.header;
    let data = json.data;
    switch (header) {
      case 'join':
        break;
      case 'move':
        break;
    }
  }
  new_board(row, col) {
    this.board = new chess.BoardData(row, col);
  }
  assign_players() {
    let ids = Object.keys(this.clients);
    this.player1 = this.clients[ids[0]];
    this.player2 = this.clients[ids[1]];
  }
  setup() {
    this.on('connection', function (socket) {
      console.log('client connected');
      let id = util.uuid();
      this.clients[id] = socket;
      socket.write('You have join the server!');
      socket.write('your id: ' + id);
      if (this.player1 == null) {
        this.player1 = socket;
        socket.write('your player1');
      } else if (this.player2 == null) {
        this.player2 = socket;
        socket.write('your player2');
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

    this.listen(config.port, () => {
      console.log(
        `Server running at http://${config.hostname}:${config.port}/`
      );
    });
  }
}

let server_chess = new ChessServer();
server_chess.new_board(3, 3);
server_chess.setup();
