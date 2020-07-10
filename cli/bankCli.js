const inquirer = require('inquirer');
const Table = require('cli-table');
const Vorpal = require('vorpal');
const { prompt, getBranches, getIfsc, getPin } = require('./prompt');

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
    this.log(vorpal.chalk.green(status.message));
    callback();
  });
};

const addBalanceEnquiryCmd = function (vorpal, bank) {
  vorpal.command('balance').action(async function (args, callback) {
    const { accountNumber } = await inquirer.prompt(prompt.accountNumber);
    const { pin } = await inquirer.prompt(getPin(bank, accountNumber));
    const accountInfo = await bank.balanceEnquiry(pin);
    this.log(vorpal.chalk.green(`Available balance: ${accountInfo.balance}`));
    callback();
  });
};

const addWithdrawalCmd = function (vorpal, bank) {
  vorpal.command('withdraw').action(async function (args, callback) {
    const { accountNumber } = await inquirer.prompt(prompt.accountNumber);
    const { pin } = await inquirer.prompt(getPin(bank, accountNumber));
    const { amount } = await inquirer.prompt(prompt.amount);
    const status = await bank.withdraw({ accountNumber, pin, amount });
    const color = status.code ? vorpal.chalk.red : vorpal.chalk.green;
    this.log(color(status.message));
    callback();
  });
};

const addBankStatementCmd = function (vorpal, bank) {
  vorpal.command('bank statement').action(async function (args, callback) {
    const { accountNumber } = await inquirer.prompt(prompt.accountNumber);
    const { pin } = await inquirer.prompt(getPin(bank, accountNumber));
    const bankStatement = await bank.getBankStatement(pin);
    const head = ['Date', 'Description', 'Transaction amount', 'Balance'];
    const table = new Table({ head });
    const latestTransactions = bankStatement.reverse().slice(0, 10);
    latestTransactions.forEach((transaction) => {
      const { transaction_amount, balance, action, date } = transaction;
      table.push([date, action, transaction_amount, balance]);
    });
    console.log(table.toString());
  });
};

const addTransferCmd = function (vorpal, bank) {
  vorpal.command('transfer').action(async function (args, callback) {
    this.log(vorpal.chalk.cyan('Remitter: '));
    const { accountNumber } = await inquirer.prompt(prompt.accountNumber);
    const { pin } = await inquirer.prompt(getPin(bank, accountNumber));
    this.log(vorpal.chalk.cyan('Beneficiary: '));
    let beneficiary = await inquirer.prompt(prompt.accountNumber);
    const questions = [getIfsc(bank, accountNumber), prompt.amount];
    const { ifsc, amount } = await inquirer.prompt(questions);
    beneficiary = { ifsc, accountNumber: beneficiary.accountNumber };
    const remitter = { accountNumber, pin };
    const status = await bank.transfer(remitter, beneficiary, amount);
    const color = status.code ? vorpal.chalk.red : vorpal.chalk.green;
    this.log(color(status.message));
    callback();
  });
};

const addDelimiter = (vorpal) => vorpal.delimiter('bank $ ').show();

const addCmd = function (bank) {
  const vorpal = new Vorpal();
  addDelimiter(vorpal);
  addCreateCmd(vorpal, bank);
  addDepositCmd(vorpal, bank);
  addBalanceEnquiryCmd(vorpal, bank);
  addWithdrawalCmd(vorpal, bank);
  addBankStatementCmd(vorpal, bank);
  addTransferCmd(vorpal, bank);
};

module.exports = { addCmd };
