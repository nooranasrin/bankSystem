const inquirer = require('inquirer');
const Table = require('cli-table');
const Vorpal = require('vorpal');
const { prompt, getIfsc, getPin } = require('./prompt');

class User {
  constructor(accountNumber, pin, bank, homeVorpal) {
    this.accountNumber = accountNumber;
    this.pin = pin;
    this.bank = bank;
    this.vorpal = new Vorpal();
    this.homeVorpal = homeVorpal;
  }

  get accountInfo() {
    return { pin: this.pin, accountNumber: this.accountNumber };
  }

  getColor(code) {
    return code ? this.vorpal.chalk.red : this.vorpal.chalk.green;
  }

  addDepositCmd() {
    const user = this;
    this.vorpal.command('deposit').action(async function (args, callback) {
      const { amount } = await inquirer.prompt(prompt.amount);
      const depositInfo = Object.assign({ amount }, user.accountInfo);
      const status = await user.bank.deposit(depositInfo);
      this.log(user.vorpal.chalk.green(status.message));
      callback();
    });
  }

  addBalanceEnquiryCmd() {
    const user = this;
    this.vorpal.command('balance').action(async function (args, callback) {
      const accountInfo = await user.bank.balanceEnquiry(user.pin);
      this.log(
        user.vorpal.chalk.green(`Available balance: ${accountInfo.balance}`)
      );
      callback();
    });
  }

  addWithdrawalCmd() {
    const user = this;
    this.vorpal.command('withdraw').action(async function (args, callback) {
      const { amount } = await inquirer.prompt(prompt.amount);
      const withdrawalInfo = Object.assign({ amount }, user.accountInfo);
      const status = await user.bank.withdraw(withdrawalInfo);
      const color = user.getColor(status.code);
      this.log(color(status.message));
      callback();
    });
  }

  addBankStatementCmd() {
    const user = this;
    this.vorpal
      .command('bank statement')
      .action(async function (args, callback) {
        const bankStatement = await user.bank.getBankStatement(user.pin);
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
  }

  addTransferCmd() {
    const user = this;
    this.vorpal.command('transfer').action(async function (args, callback) {
      this.log(user.vorpal.chalk.cyan('Beneficiary: '));
      const { accountNumber } = await inquirer.prompt(prompt.accountNumber);
      const questions = [getIfsc(user.bank, accountNumber), prompt.amount];
      const { ifsc, amount } = await inquirer.prompt(questions);
      const beneficiary = { ifsc, accountNumber };
      const remitter = user.accountInfo;
      const status = await user.bank.transfer(remitter, beneficiary, amount);
      const color = user.getColor(status.code);
      this.log(color(status.message));
      callback();
    });
  }

  addLogout() {
    const user = this;
    this.vorpal.command('logout').action(function () {
      user.homeVorpal.show();
    });
  }

  addClearCmd() {
    this.vorpal.command('clear').action((args, callback) => {
      console.clear();
      callback();
    });
  }

  addDelimiter() {
    this.vorpal.delimiter(this.vorpal.chalk.yellow(`\nbank->user-> `)).show();
  }

  addCmd() {
    this.addDelimiter();
    this.addClearCmd();
    this.addDepositCmd();
    this.addBalanceEnquiryCmd();
    this.addWithdrawalCmd();
    this.addBankStatementCmd();
    this.addTransferCmd();
    this.addLogout();
  }
}

module.exports = { User };
