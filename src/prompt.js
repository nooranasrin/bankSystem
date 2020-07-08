const banks = {
  federal: [{ branchName: 'bangalore', ifsc: 'fedbang123' }],
};

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
      default: 'dd-mm-yyyy',
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
      choices: Object.keys(banks),
      name: 'bank',
      message: 'Select your bank ',
    },
  ],
};

const getBranches = function (bankName) {
  const branches = banks[bankName].map((branch) => branch.branchName);
  return {
    type: 'list',
    choices: branches,
    name: 'branch',
    message: 'Select your branch ',
  };
};

// -> name, dob, address, phone, aadhar_no, select_bank, select_branch

module.exports = { prompt, getBranches };
