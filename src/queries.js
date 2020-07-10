const queries = {
  accountHolders: `create table if not exists account_holders
                  (id integer primary key autoincrement, name varchar(15) not null,
                  dob date not null,
                  phone numeric(10) not null, aadhar_no numeric(12)unique not null)`,

  accountInfo: `create table if not exists account_info(id numeric(4) primary key, 
                account_number numeric(15) not null, ifsc varchar(10) not null,balance integer)`,

  activityLog: `create table if not exists activity_log(id numeric(4) not null,
                action varchar(10) not null, transaction_amount numeric(5) not null, balance numeric(10) not null,
                time date not null)`,
};

const getNewAccountQuery = function (pin, accountHolderInfo) {
  const { name, dob, phone, aadharNumber } = accountHolderInfo;
  return `insert into account_holders values(${pin},"${name}",'${dob}', ${phone},${aadharNumber})`;
};

const getAccountInfoQuery = function (pin, accountNumber, ifsc) {
  return `insert into account_info values(${pin},${accountNumber},"${ifsc}",0)`;
};

const retrievalQuery = function (table, keyValues) {
  let sql = `select * from ${table} `;
  if (keyValues) {
    sql += 'where ';
    const fields = Object.keys(keyValues);
    fields.forEach((key, index) => {
      sql += `${key} = "${keyValues[key]}"`;
      sql += index === fields.length - 1 ? '' : ` and `;
    });
  }
  return sql;
};

const getDepositQuery = function (depositInfo) {
  const { amount, accountNumber, ifsc } = depositInfo;
  return `update account_info set balance = balance+${amount} where ifsc="${ifsc}" and account_number=${accountNumber}`;
};

const getActivityLogInsertQuery = function (pin, action, amount, balance) {
  return `insert into activity_log values(${pin},"${action}",${amount},${balance},DATE('now'))`;
};

const getWithdrawalQuery = function (withdrawalInfo) {
  const { amount, pin } = withdrawalInfo;
  return `update account_info set balance = balance-${amount} where id=${pin}`;
};

module.exports = {
  queries,
  getNewAccountQuery,
  getAccountInfoQuery,
  retrievalQuery,
  getDepositQuery,
  getActivityLogInsertQuery,
  getWithdrawalQuery,
};
