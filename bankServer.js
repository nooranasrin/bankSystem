const Database = require('./src/database');
const Bank = require('./src/bank');
const { addCmd } = require('./cli/bankCli');

const main = async function () {
  const bank = new Bank(new Database('./data/bank.db'));
  bank.start();
  await bank.show('account_info');
  addCmd(bank);
};

main();
