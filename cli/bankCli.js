const inquirer = require('inquirer');
const { prompt, getBranches, getIfsc, getPin } = require('./prompt');
const Vorpal = require('vorpal');

const addCreateCmd = function (vorpal, bank) {
  vorpal.command('create account').action(async function (args, callback) {
    const answers = await inquirer.prompt(prompt.createAccount);
    const branch = await inquirer.prompt(getBranches(answers.bank));
    const status = await bank.createAccount(Object.assign(branch, answers));
    if (status.code === 0) {
      const { name, accountNumber, pin } = status.message;
      let msg = `${name} your account successfully created!!\n`;
      msg += `Your ac/no is ${accountNumber} and pin is ${pin}`;
      this.log(vorpal.chalk.green(msg));
      return callback();
    }
    this.log(vorpal.chalk.red(status.message));
    callback();
  });
};

const addDepositCmd = function (vorpal, bank) {
  vorpal.command('deposit').action(async function (args, callback) {
    const { accountNumber } = await inquirer.prompt(prompt.accountNumber);
    const questions = [getIfsc(bank, accountNumber), prompt.amount];
    const { ifsc, amount } = await inquirer.prompt(questions);
    const status = await bank.deposit({ accountNumber, ifsc, amount });
    const color = status.code === 0 ? vorpal.chalk.green : vorpal.chalk.red;
    this.log(color(status.message));
    callback();
  });
};

const addBalanceEnquiry = function (vorpal, bank) {
  vorpal.command('balance').action(async function (args, callback) {
    const { accountNumber } = await inquirer.prompt(prompt.accountNumber);
    const { pin } = await inquirer.prompt(getPin(bank, accountNumber));
    const accountInfo = await bank.balanceEnquiry(pin);
    this.log(vorpal.chalk.green(`Available balance: ${accountInfo.balance}`));
    callback();
  });
};

const addDelimiter = (vorpal) => vorpal.delimiter('bank $ ').show();

const addCmd = function (bank) {
  const vorpal = new Vorpal();
  addDelimiter(vorpal);
  addCreateCmd(vorpal, bank);
  addDepositCmd(vorpal, bank);
  addBalanceEnquiry(vorpal, bank);
};

module.exports = { addCmd };
