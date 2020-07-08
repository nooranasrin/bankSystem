const Database = require('./src/database');
const Bank = require('./src/bank');
const { addCmd } = require('./src/bankCli');

const main = function () {
  const bank = new Bank(new Database('./data/bank.db'));
  bank.start();
  addCmd(bank);
};

main();
