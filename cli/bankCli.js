const inquirer = require('inquirer');
const { prompt, getBranches } = require('./prompt');
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

const addDelimiter = (vorpal) => vorpal.delimiter('bank $ ').show();

const addCmd = function (bank) {
  const vorpal = new Vorpal();
  addDelimiter(vorpal);
  addCreateCmd(vorpal, bank);
};

module.exports = { addCmd };
