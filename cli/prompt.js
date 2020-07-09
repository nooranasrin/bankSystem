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

module.exports = { prompt, getBranches };
