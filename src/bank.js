const {
  queries,
  getNewAccountQuery,
  retrievalQuery,
  getAccountInfoQuery,
  getDepositQuery,
  getActivityLogInsertQuery,
  getWithdrawalQuery,
  getBasicInfoQuery,
} = require('./queries');
const availableBanks = require('./banksInfo.json');

const getBranchInfo = function (bank, branchName) {
  const branches = availableBanks[bank];
  return branches.find((branch) => branch.branchName === branchName);
};

class Bank {
  constructor(db) {
    this.db = db;
    this.pin;
    this.accountNumber;
  }

  updateUser(accountNumber, pin) {
    this.accountNumber = accountNumber;
    this.pin = pin;
  }

  async start() {
    await this.db.create(queries.accountHolders);
    await this.db.create(queries.accountInfo);
    await this.db.create(queries.activityLog);
  }

  async getAccountHolder(fields) {
    const sql = getBasicInfoQuery(fields);
    const [accountHolder] = await this.db.select(sql);
    return accountHolder;
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

  async addTransactionIntoLog(fields, description, type, amount) {
    let sql = retrievalQuery('account_info', fields);
    const [account] = await this.db.select(sql);
    const { id, balance } = account;
    const transactionInfo = { pin: id, description, amount, balance, type };
    sql = getActivityLogInsertQuery(transactionInfo);
    await this.db.insert(sql);
  }

  async deposit(amount) {
    const fields = { account_number: this.accountNumber, id: this.pin };
    await this.db.update(getDepositQuery(amount, fields));
    await this.addTransactionIntoLog(fields, 'Deposit', 'Credit', amount);
    return { message: `successfully deposited ${amount}`, code: 0 };
  }

  async withdraw(amount, description = 'Withdrawal') {
    const accountNumber = this.accountNumber;
    const sql = retrievalQuery('account_info', { id: this.pin });
    const [account] = await this.db.select(sql);
    if (account.balance >= amount) {
      const withdrawInfo = { accountNumber, pin: this.pin, amount };
      await this.db.update(getWithdrawalQuery(withdrawInfo));
      const fields = { account_number: accountNumber, id: this.pin };
      await this.addTransactionIntoLog(fields, description, 'Debit', amount);
      return { message: `Withdrawal successful ${amount}`, code: 0 };
    }
    return { message: `Not sufficient balance in your account`, code: 1 };
  }

  async transfer(beneficiary, amount) {
    const account_number = this.accountNumber;
    const id = this.pin;
    const remitterFields = { account_number, id };
    const { accountNumber, ifsc } = beneficiary;
    let beneficiaryFields = { account_number: accountNumber, ifsc };

    const accountHolder = await this.getAccountHolder(beneficiaryFields);
    let action = `Transferred to ${accountHolder.name}`;
    const withdrawalStatus = await this.withdraw(amount, action);
    if (!withdrawalStatus.code) {
      const { name } = await this.getAccountHolder(remitterFields);
      action = `Transferred from ${name}`;
      const fields = { id: accountHolder.id, account_number: accountNumber };
      await this.db.update(getDepositQuery(amount, fields));
      await this.addTransactionIntoLog(fields, action, 'Credit', amount);
      return { message: `Successfully transferred ${amount}`, code: 0 };
    }
    return withdrawalStatus;
  }

  async getBankStatement() {
    let sql = retrievalQuery('activity_log', { id: this.pin });
    return await this.db.select(sql);
  }

  async validateBy(fields) {
    const sql = retrievalQuery('account_info', fields);
    const account = await this.db.select(sql);
    return account.length;
  }

  async balanceEnquiry() {
    const sql = retrievalQuery('account_info', { id: this.pin });
    const [account] = await this.db.select(sql);
    return account;
  }

  async show(table) {
    const data = await this.db.select(`select * from ${table}`);
    console.table(data);
  }
}

module.exports = Bank;
