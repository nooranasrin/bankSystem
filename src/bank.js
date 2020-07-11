const {
  queries,
  getNewAccountQuery,
  retrievalQuery,
  getAccountInfoQuery,
  getDepositQuery,
  getActivityLogInsertQuery,
  getWithdrawalQuery,
} = require('./queries');
const availableBanks = require('./banksInfo.json');

const getBranchInfo = function (bank, branchName) {
  const branches = availableBanks[bank];
  return branches.find((branch) => branch.branchName === branchName);
};

class Bank {
  constructor(db) {
    this.db = db;
  }

  start() {
    this.db.create(queries.accountHolders);
    this.db.create(queries.accountInfo);
    this.db.create(queries.activityLog);
  }

  async createPin() {
    const pin = Math.floor(Math.random(4) * 10000);
    const sql = retrievalQuery('account_info');
    const existingAccounts = await this.db.select(sql);
    existingAccounts.forEach((accountInfo) => {
      if (accountInfo.id === pin) return this.createPin();
    });
    return pin;
  }

  createAccountNumber(bank) {
    const accountNumber = Math.floor(Math.random(15) * 1000000000000000);
    const allBranches = availableBanks[bank].map((branch) => branch.ifsc);
    allBranches.forEach(async (ifsc) => {
      const sql = retrievalQuery(`account_info`, { ifsc: ifsc });
      const existingAccounts = await this.db.select(sql);
      existingAccounts.forEach((accountInfo) => {
        if (accountInfo.accountNumber === accountNumber)
          return this.createAccountNumber(bank);
      });
    });
    return accountNumber;
  }

  async createAccount(accountHolderInfo) {
    try {
      const pin = await this.createPin();
      const sql = getNewAccountQuery(pin, accountHolderInfo);
      await this.db.insert(sql);
      const { branch, bank, name } = accountHolderInfo;
      const { ifsc } = getBranchInfo(bank, branch);
      const accountNumber = this.createAccountNumber(bank);
      await this.db.insert(getAccountInfoQuery(pin, accountNumber, ifsc));
      return { message: { name, accountNumber, pin }, code: 0 };
    } catch (err) {
      return { message: 'Failed: enter the valid details', code: 1 };
    }
  }

  async addTransactionIntoLog(fields, action, amount) {
    let sql = retrievalQuery('account_info', fields);
    const [account] = await this.db.select(sql);
    const { id, balance } = account;
    sql = getActivityLogInsertQuery(id, action, amount, balance);
    await this.db.insert(sql);
  }

  async deposit(depositInfo) {
    const { amount, pin, accountNumber } = depositInfo;
    const fields = { account_number: accountNumber, id: pin };
    await this.db.update(getDepositQuery(amount, fields));
    await this.addTransactionIntoLog(fields, 'deposit', amount);
    return { message: `successfully deposited ${amount}`, code: 0 };
  }

  async withdraw(withdrawInfo) {
    const { amount, pin, accountNumber } = withdrawInfo;
    const sql = retrievalQuery('account_info', { id: pin });
    const [account] = await this.db.select(sql);
    if (account.balance >= amount) {
      await this.db.update(getWithdrawalQuery(withdrawInfo));
      const fields = { account_number: accountNumber, id: pin };
      await this.addTransactionIntoLog(fields, 'withdrawal', amount);
      return { message: `Withdrawal successful ${amount}`, code: 0 };
    }
    return { message: `Not sufficient balance in your account`, code: 1 };
  }

  async transfer(remitter, beneficiary, amount) {
    const sql = retrievalQuery('account_info', { id: remitter.pin });
    const [account] = await this.db.select(sql);
    if (account.balance >= amount) {
      await this.db.update(getWithdrawalQuery({ amount, pin: remitter.pin }));
      const account_number = remitter.accountNumber;
      const id = remitter.pin;
      let fields = { account_number, id };
      await this.addTransactionIntoLog(fields, 'Transfer', amount * -1);

      fields = {
        account_number: beneficiary.accountNumber,
        ifsc: beneficiary.ifsc,
      };
      await this.db.update(getDepositQuery(amount, fields));
      const { accountNumber, ifsc } = beneficiary;
      fields = { account_number: accountNumber, ifsc };
      await this.addTransactionIntoLog(fields, 'Transfer', amount);
      return { message: `Successfully transferred ${amount}`, code: 0 };
    }
    return { message: `Not sufficient balance in your account`, code: 1 };
  }

  async getBankStatement(pin) {
    const sql = retrievalQuery('activity_log', { id: pin });
    return await this.db.select(sql);
  }

  async validateBy(fields) {
    const sql = retrievalQuery('account_info', fields);
    const account = await this.db.select(sql);
    return account.length;
  }

  async balanceEnquiry(pin) {
    const sql = retrievalQuery('account_info', { id: pin });
    const [account] = await this.db.select(sql);
    return account;
  }

  async show(table) {
    const data = await this.db.select(`select * from ${table}`);
    console.table(data);
  }
}

module.exports = Bank;
