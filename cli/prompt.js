const availableBanks = require('../src/banksInfo.json');

const prompt = {
  createAccount: [
    {
      type: 'input',
      name: 'name',
      message: 'Enter your name',
    },
    {
      type: 'input',
      name: 'dob',
      default: 'YYYY-MM-DD',
      message: 'Enter your date of birth',
    },
    {
      type: 'input',
      name: 'phone',
      message: 'Enter your phone number',
    },
    {
      type: 'input',
      name: 'aadharNumber',
      message: 'Enter your aadhar number',
    },
    {
      type: 'list',
      choices: Object.keys(availableBanks),
      name: 'bank',
      message: 'Select your bank ',
    },
  ],
  accountNumber: [
    {
      type: 'intput',
      name: 'accountNumber',
      message: 'Enter account number',
    },
  ],
  amount: { type: 'intput', name: 'amount', message: 'Enter the amount' },
};

const getBranches = function (bankName) {
  const branches = availableBanks[bankName].map((branch) => branch.branchName);
  return {
    type: 'list',
    choices: branches,
    name: 'branch',
    message: 'Select your branch ',
  };
};

const getIfsc = function (bank, accountNumber) {
  return {
    type: 'input',
    name: 'ifsc',
    message: 'Enter the ifsc',
    validate: async (ifsc) => {
      const status = await bank.isValidAccount(accountNumber, ifsc);
      if (!status) return 'invalid account number or ifsc';
      return true;
    },
  };
};

const getPin = function (bank, accountNumber) {
  return {
    type: 'input',
    name: 'pin',
    message: 'Enter your pin',
    validate: async (pin) => {
      const status = await bank.isValidUser(accountNumber, pin);
      if (!status) return 'invalid account number or pin';
      return true;
    },
  };
};

module.exports = { prompt, getBranches, getIfsc, getPin };
