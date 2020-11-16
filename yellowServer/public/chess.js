class Player {
  constructor(color) {
    this.pieces = {};
    this.color = color;
  }
  addPiece(id, piece) {
    this.pieces[id] = piece;
  }
}
class LocationData {
  constructor() {
    this.continuous = true;
    this.f = 0;
    this.r = 0;
  }
}
class BoardData {
  constructor(row, col) {
    this.row = row;
    this.col = col;
    this.tile = 50;
    this.bd = {};
    for (let i = 0; i < row; i++) {
      for (let j = 0; j < col; j++) {
        let id = i.toString() + ',' + j.toString();
        this.bd[id] = null;
      }
    }
  }
  add_piece(piece) {
    this.bd[piece.print_loaction()] = piece;
  }
  get_piece(x, y) {
    let id = x.toString() + ',' + y.toString();
    let piece = this.bd[id];
    if (piece) {
      return piece;
    }
  }

  moves_possable(piece) {
    let newLocations = [];
    let string = piece.moves;
    let moves = string.split(',');
    for (let move of moves) {
      let x = 0;
      let y = 0;
      let pointerX = x;
      let pointerY = x;
      let flag = false;
      for (let char of move) {
        switch (char) {
          case 'c':
            flag = true;
            continue;
          case 'd':
            flag = false;
            continue;
          case 'f':
            y++;
            break;
          case 'l':
            x--;
            break;
          case 'r':
            x++;
            break;
          case 'b':
            y--;
            break;
          case 's':
            pointerX = x;
            pointerY = y;
            x = pointerX;
            y = pointerY;
            continue;
          case '*':
            x = pointerX;
            y = pointerY;
            continue;
          default:
            break;
        }
        if (flag) {
          let newX = piece.x + x * piece.ox;
          let newY = piece.y + y * piece.oy;
          newLocations.push(newX.toString() + ',' + newY.toString());
        }
      }

      if (!flag) {
        let newX = piece.x + x * piece.ox;
        let newY = piece.y + y * piece.oy;
        newLocations.push(newX.toString() + ',' + newY.toString());
      }
    }
    return newLocations;
  }
  render_piece(piece) {
    let x = piece.x * this.tile;
    let y = piece.y * this.tile;
    piece.element.setAttribute(`style`, `left:${x}px; top:${y}px;`);
  }
  printBd() {
    let i = this.row;
    let j = this.col;
    for (i = 0; i < this.row; i++) {
      let row = {};
      for (j = 0; j < this.col; j++) {
        let id = i.toString() + ',' + j.toString();
        row[id] = this.bd[id];
      }
      console.dirxml(row);
    }
  }
}
class Piece {
  // f, move forward 1 space,
  // b, move back 1 space,
  // l, move left 1 space,
  // r, move right 1 space,
  // s, save current loaction,
  // *, use save loaction is now current location,
  // prefix: c, continues movement.
  // postfix <, repete last movment.
  // () group as one step

  constructor(color = 'white', type = 'pawn') {
    this.color = color;
    this.x = 0;
    this.y = 0;
    this.ox = 1;
    this.oy = 1;
    this.type = type;
    this.moves = `cfsf*l*r`;
    this.attacks = `fl,fr`;
  }
  move(x, y) {
    this.x = x;
    this.y = y;
  }
  print_loaction() {
    return this.location.x.toString() + ',' + this.location.y.toString();
  }
}

module.exports = {
  Player: Player,
  LocationData: LocationData,
  BoardData: BoardData,
  Piece: Piece,
};
