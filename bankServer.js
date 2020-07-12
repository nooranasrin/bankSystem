const Database = require('./src/database');
const Bank = require('./src/bank');
const { addUnauthorizedCmd } = require('./cli/homeCli');

const main = function () {
  const bank = new Bank(new Database('./data/bank.db'));
  bank.start();
  addUnauthorizedCmd(bank);
};

main();
