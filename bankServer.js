const Database = require('./src/database');
const Bank = require('./src/bank');
const { addUnauthorizedCmd } = require('./cli/homeCli');

const main = async function () {
  const bank = new Bank(new Database('./data/bank.db'));
  bank.start();
  await bank.show('account_info');
  await bank.show('activity_log');
  addUnauthorizedCmd(bank);
};

main();
