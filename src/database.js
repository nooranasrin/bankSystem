const sqlite3 = require('sqlite3');

class Database {
  constructor(file) {
    this.db = new sqlite3.Database(file);
  }

  create(sql) {
    this.db.run(sql, (err) => err && console.log(err));
  }

  insert(sql) {
    this.db.run(sql, (err) => err && console.log(err));
  }

  update(sql) {
    this.db.run(sql, (err) => err && console.log(err));
  }

  select(sql) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, (err, res) => {
        err && reject(err);
        resolve(res);
      });
    });
  }
}

module.exports = Database;
