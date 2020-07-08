const { queries, getNewAccountQuery } = require('./queries');

class Bank {
  constructor(db) {
    this.db = db;
  }

  start() {
    this.db.create(queries.accountHolders);
    this.db.create(queries.accountInfo);
    this.db.create(queries.activityLog);
  }

  createAccount(accountHolderInfo) {
    this.db.insert(getNewAccountQuery(accountHolderInfo));
  }
}

module.exports = Bank;
