const inquirer = require('inquirer');
const Table = require('cli-table');
const Vorpal = require('vorpal');
const { prompt, getIfsc } = require('./prompt');

const addDepositCmd = function (bank, vorpal) {
  vorpal.command('deposit').action(async function (args, callback) {
    const { amount } = await inquirer.prompt(prompt.amount);
    const status = await bank.deposit(amount);
    this.log(vorpal.chalk.green(status.message));
    callback();
  });
};

const addBalanceEnquiryCmd = function (bank, vorpal) {
  vorpal.command('balance').action(async function (args, callback) {
    const accountInfo = await bank.balanceEnquiry();
    this.log(vorpal.chalk.green(`Available balance: ${accountInfo.balance}`));
    callback();
  });
};

const addWithdrawalCmd = function (bank, vorpal) {
  vorpal.command('withdraw').action(async function (args, callback) {
    const { amount } = await inquirer.prompt(prompt.amount);
    const status = await bank.withdraw(amount);
    const color = status.code ? vorpal.chalk.red : vorpal.chalk.green;
    this.log(color(status.message));
    callback();
  });
};

const addBankStatementCmd = function (bank, vorpal) {
  vorpal.command('bank statement').action(async function (args, callback) {
    const bankStatement = await bank.getBankStatement();
    let head = ['Date', 'Description', 'Type', 'Transaction amount'];
    const table = new Table({ head: head.concat(['Balance']) });
    const latestTransactions = bankStatement.reverse().slice(0, 10);
    latestTransactions.forEach((transaction) => {
      const { transaction_amount, date } = transaction;
      const { description, balance, type } = transaction;
      table.push([date, description, type, transaction_amount, balance]);
    });
    console.log(table.toString());
    callback();
  });
};

const addTransferCmd = function (bank, vorpal) {
  vorpal.command('transfer').action(async function (args, callback) {
    this.log(vorpal.chalk.cyan('Beneficiary: '));
    const { accountNumber } = await inquirer.prompt(prompt.accountNumber);
    const questions = [getIfsc(bank, accountNumber), prompt.amount];
    const { ifsc, amount } = await inquirer.prompt(questions);
    const beneficiary = { ifsc, accountNumber };
    const status = await bank.transfer(beneficiary, amount);
    const color = status.code ? vorpal.chalk.red : vorpal.chalk.green;
    this.log(color(status.message));
    callback();
  });
};

const addLogout = function (vorpal, homeVorpal) {
  vorpal.command('logout').action(function () {
    homeVorpal.show();
  });
};

const addClearCmd = function (vorpal) {
  vorpal.command('clear').action((args, callback) => {
    console.clear();
    callback();
  });
};

const addDelimiter = function (vorpal) {
  vorpal.delimiter(vorpal.chalk.yellow(`\nbank->user-> `)).show();
};

const addCmd = function (bank, homeVorpal) {
  const vorpal = new Vorpal();
  addDelimiter(vorpal);
  addClearCmd(vorpal);
  addDepositCmd(bank, vorpal);
  addBalanceEnquiryCmd(bank, vorpal);
  addWithdrawalCmd(bank, vorpal);
  addBankStatementCmd(bank, vorpal);
  addTransferCmd(bank, vorpal);
  addLogout(vorpal, homeVorpal);
};

module.exports = { addCmd };
