const inquirer = require('inquirer');
const Table = require('cli-table');
const Vorpal = require('vorpal');
const { prompt, getIfsc, getPin } = require('./prompt');

class User {
  constructor(accountNumber, pin, bank) {
    this.accountNumber = accountNumber;
    this.pin = pin;
    this.bank = bank;
    this.vorpal = new Vorpal();
  }

  addDepositCmd() {
    this.vorpal.command('deposit').action(async function (args, callback) {
      const { accountNumber } = await inquirer.prompt(prompt.accountNumber);
      const questions = [getIfsc(this.bank, accountNumber), prompt.amount];
      const { ifsc, amount } = await inquirer.prompt(questions);
      const status = await this.bank.deposit({ accountNumber, ifsc, amount });
      this.log(this.vorpal.chalk.green(status.message));
      callback();
    });
  }

  addBalanceEnquiryCmd() {
    this.vorpal.command('balance').action(async function (args, callback) {
      const { accountNumber } = await inquirer.prompt(prompt.accountNumber);
      const { pin } = await inquirer.prompt(getPin(this.bank, accountNumber));
      const accountInfo = await this.bank.balanceEnquiry(pin);
      this.log(
        this.vorpal.chalk.green(`Available balance: ${accountInfo.balance}`)
      );
      callback();
    });
  }

  addWithdrawalCmd() {
    this.vorpal.command('withdraw').action(async function (args, callback) {
      const { accountNumber } = await inquirer.prompt(prompt.accountNumber);
      const { pin } = await inquirer.prompt(getPin(this.bank, accountNumber));
      const { amount } = await inquirer.prompt(prompt.amount);
      const status = await this.bank.withdraw({ accountNumber, pin, amount });
      const color = status.code
        ? this.vorpal.chalk.red
        : this.vorpal.chalk.green;
      this.log(color(status.message));
      callback();
    });
  }

  addBankStatementCmd() {
    this.vorpal
      .command('bank statement')
      .action(async function (args, callback) {
        const { accountNumber } = await inquirer.prompt(prompt.accountNumber);
        const { pin } = await inquirer.prompt(getPin(this.bank, accountNumber));
        const bankStatement = await this.bank.getBankStatement(pin);
        const head = ['Date', 'Description', 'Transaction amount', 'Balance'];
        const table = new Table({ head });
        const latestTransactions = bankStatement.reverse().slice(0, 10);
        latestTransactions.forEach((transaction) => {
          const { transaction_amount, balance, action, date } = transaction;
          table.push([date, action, transaction_amount, balance]);
        });
        console.log(table.toString());
      });
  }

  addTransferCmd() {
    this.vorpal.command('transfer').action(async function (args, callback) {
      this.log(this.vorpal.chalk.cyan('Remitter: '));
      const { accountNumber } = await inquirer.prompt(prompt.accountNumber);
      const { pin } = await inquirer.prompt(getPin(this.bank, accountNumber));
      this.log(this.vorpal.chalk.cyan('Beneficiary: '));
      let beneficiary = await inquirer.prompt(prompt.accountNumber);
      const questions = [getIfsc(this.bank, accountNumber), prompt.amount];
      const { ifsc, amount } = await inquirer.prompt(questions);
      beneficiary = { ifsc, accountNumber: beneficiary.accountNumber };
      const remitter = { accountNumber, pin };
      const status = await this.bank.transfer(remitter, beneficiary, amount);
      const color = status.code
        ? this.vorpal.chalk.red
        : this.vorpal.chalk.green;
      this.log(color(status.message));
      callback();
    });
  }

  addDelimiter() {
    this.vorpal.delimiter('bank->user $ ').show();
  }

  addCmd() {
    this.addDelimiter();
    this.addDepositCmd();
    this.addBalanceEnquiryCmd();
    this.addWithdrawalCmd();
    this.addBankStatementCmd();
    this.addTransferCmd();
  }
}

module.exports = { User };

// const addDepositCmd = function (vorpal, bank) {
//   vorpal.command('deposit').action(async function (args, callback) {
//     const { accountNumber } = await inquirer.prompt(prompt.accountNumber);
//     const questions = [getIfsc(bank, accountNumber), prompt.amount];
//     const { ifsc, amount } = await inquirer.prompt(questions);
//     const status = await bank.deposit({ accountNumber, ifsc, amount });
//     this.log(vorpal.chalk.green(status.message));
//     callback();
//   });
// };

// const addBalanceEnquiryCmd = function (vorpal, bank) {
//   vorpal.command('balance').action(async function (args, callback) {
//     const { accountNumber } = await inquirer.prompt(prompt.accountNumber);
//     const { pin } = await inquirer.prompt(getPin(bank, accountNumber));
//     const accountInfo = await bank.balanceEnquiry(pin);
//     this.log(vorpal.chalk.green(`Available balance: ${accountInfo.balance}`));
//     callback();
//   });
// };

// const addWithdrawalCmd = function (vorpal, bank) {
//   vorpal.command('withdraw').action(async function (args, callback) {
//     const { accountNumber } = await inquirer.prompt(prompt.accountNumber);
//     const { pin } = await inquirer.prompt(getPin(bank, accountNumber));
//     const { amount } = await inquirer.prompt(prompt.amount);
//     const status = await bank.withdraw({ accountNumber, pin, amount });
//     const color = status.code ? vorpal.chalk.red : vorpal.chalk.green;
//     this.log(color(status.message));
//     callback();
//   });
// };

// const addBankStatementCmd = function (vorpal, bank) {
//   vorpal.command('bank statement').action(async function (args, callback) {
//     const { accountNumber } = await inquirer.prompt(prompt.accountNumber);
//     const { pin } = await inquirer.prompt(getPin(bank, accountNumber));
//     const bankStatement = await bank.getBankStatement(pin);
//     const head = ['Date', 'Description', 'Transaction amount', 'Balance'];
//     const table = new Table({ head });
//     const latestTransactions = bankStatement.reverse().slice(0, 10);
//     latestTransactions.forEach((transaction) => {
//       const { transaction_amount, balance, action, date } = transaction;
//       table.push([date, action, transaction_amount, balance]);
//     });
//     console.log(table.toString());
//   });
// };

// const addTransferCmd = function (vorpal, bank) {
//   vorpal.command('transfer').action(async function (args, callback) {
//     this.log(vorpal.chalk.cyan('Remitter: '));
//     const { accountNumber } = await inquirer.prompt(prompt.accountNumber);
//     const { pin } = await inquirer.prompt(getPin(bank, accountNumber));
//     this.log(vorpal.chalk.cyan('Beneficiary: '));
//     let beneficiary = await inquirer.prompt(prompt.accountNumber);
//     const questions = [getIfsc(bank, accountNumber), prompt.amount];
//     const { ifsc, amount } = await inquirer.prompt(questions);
//     beneficiary = { ifsc, accountNumber: beneficiary.accountNumber };
//     const remitter = { accountNumber, pin };
//     const status = await bank.transfer(remitter, beneficiary, amount);
//     const color = status.code ? vorpal.chalk.red : vorpal.chalk.green;
//     this.log(color(status.message));
//     callback();
//   });
// };

// const addDelimiter = (vorpal) => vorpal.delimiter('bank->user $ ').show();

// const addCmd = function (bank) {
//   const vorpal = new Vorpal();
//   addDelimiter(vorpal);
//   addDepositCmd(vorpal, bank);
//   addBalanceEnquiryCmd(vorpal, bank);
//   addWithdrawalCmd(vorpal, bank);
//   addBankStatementCmd(vorpal, bank);
//   addTransferCmd(vorpal, bank);
// };

// module.exports = { addCmd };
