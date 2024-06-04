const { ethers } = require('ethers');

function isValidEthereumAddress(address) {
  try {
    ethers.utils.getAddress(address);
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = { isValidEthereumAddress };
