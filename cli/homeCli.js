const inquirer = require('inquirer');
const Vorpal = require('vorpal');
const { User } = require('./bankCli');
const { prompt, getBranches, getPin } = require('./prompt');

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

const addLoginCmd = function (vorpal, bank) {
  vorpal.command('login').action(async function (args, callback) {
    const { accountNumber } = await inquirer.prompt(prompt.accountNumber);
    const { pin } = await inquirer.prompt(getPin(bank, accountNumber));
    const user = new User(accountNumber, pin, bank, vorpal);
    user.addCmd();
    this.log(vorpal.chalk.green('Successfully logged in'));
    callback();
  });
};

const addClearCmd = function (vorpal) {
  vorpal.command('clear').action((args, callback) => {
    console.clear();
    callback();
  });
};

const addDelimiter = (vorpal) =>
  vorpal.delimiter(vorpal.chalk.yellow('\nbank-> ')).show();

const addUnauthorizedCmd = function (bank) {
  const vorpal = new Vorpal();
  addDelimiter(vorpal);
  addClearCmd(vorpal);
  addCreateCmd(vorpal, bank);
  addLoginCmd(vorpal, bank);
};

module.exports = { addUnauthorizedCmd };
