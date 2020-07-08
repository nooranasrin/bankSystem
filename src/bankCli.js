const inquirer = require('inquirer');
const { prompt, getBranches } = require('./prompt');
const Vorpal = require('vorpal');

const addCreateCmd = function (vorpal, bank) {
  vorpal.command('create account').action(async function (args, callback) {
    const answers = await inquirer.prompt(prompt.createAccount);
    const branch = await inquirer.prompt(getBranches(answers.bank));
    console.log(Object.assign(branch, answers));
    // bank.createAccount(Object.assign({branch},answers))
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
