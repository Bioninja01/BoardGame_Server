const readline = require('readline');

class Command {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }
  ask() {
    this.rl.question('Command: ', function (answer) {
      if (answer == 'exit') {
        this.rl.close();
      } else {
        eval(answer);
        this.ask();
      }
    });
  }
}

module.exports = {
  Command: Command,
};
