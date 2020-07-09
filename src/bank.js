const {
  queries,
  getNewAccountQuery,
  retrievalQuery,
  getAccountInfoQuery,
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

  createAccountNumber(bank) {
    const accountNumber = Math.floor(Math.random(15) * 10000000000000000);
    const allBranches = availableBanks[bank].map((branch) => branch.ifsc);
    allBranches.forEach(async (ifsc) => {
      const sql = retrievalQuery(`account_info`, 'ifsc', ifsc);
      const existingAccounts = await this.db.select(sql);
      existingAccounts.forEach((accountInfo) => {
        if (accountInfo.accountNumber === accountNumber)
          return this.createAccountNumber(bank);
      });
    });
    return accountNumber;
  }

  async show(table) {
    const data = await this.db.select(`select * from ${table}`);
    console.table(data);
  }
}

module.exports = Bank;
