let net = require('net');
let config = require('./config.js');
let util = require('./util.js');
let chess = require('./public/chess.js');
const { Player, Piece } = require('./public/chess.js');

class Net_Player extends Player {
  constructor(client) {
    super();
    this.client = client;
  }
  write(data) {
    this.client.write(data);
  }
}
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
  new_pieces(player) {
    let pieces = [];
    let piece_types = [
      'rook',
      'knight',
      'bishop',
      'queen',
      'king',
      'rook',
      'knight',
      'bishop',
    ];
    for (let i = 0; i < 8; i++) {
      let pawn = new chess.Piece(player.color, 'pawn');
      pawn.move = 'f';
      pieces.push(pawn);
    }
    for (let i = 0; i < 8; i++) {
      let type = piece_types[i];
      let piece = new chess.Piece(player.color, type);

      switch (type) {
        case 'rook':
          piece.move = 'cf<,cl<,cr<,cb<';
          break;
        case 'knight':
          piece.move = 'ffl,ffr,llf<,llb,rrf,rrb,bbl,bbr';
          break;
        case 'bishop':
          piece.move = '(fl)<,(fr)<,(bl)<,(br)<';
          break;
        case 'queen':
          piece.move = 'cf<,cl<,cr<,cb<,(fl)<,(fr)<,(bl)<,(br)<';
          break;
        case 'king':
          piece.move = 'f,l,r,b';
          break;
      }
      pieces.push(piece);
    }
    player.pieces = pieces;
    return player.pieces;
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
      // socket.write('You have join the server!');
      // socket.write('your id: ' + id);
      if (this.player1 == null) {
        this.player1 = new Net_Player(socket);
        let data = {};
        data.message = this.new_pieces(this.player1);
        data.header = 'setPieces';
        let data_string = JSON.stringify(data);
        socket.write(data_string);
      } else if (this.player2 == null) {
        cl;
        this.player2 = new Net_Player(socket);
        this.new_pieces(this.player2);
        console.log(this.player2.pieces);
        socket.write('your player2');
      }
      socket.on('data', (data) => {
        console.log('clientData:');
        var buf = Buffer.from(data);
        console.log(buf.toString());
        socket.emit('test', { text: 'bob' });
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
