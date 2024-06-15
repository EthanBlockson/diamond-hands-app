import { ethers, Contract } from 'ethers';
import { contracts } from '../../contracts';
const crypto = require('crypto');

export const getRefAddressByRefCode = async (
  chainId,
  walletProvider,
  refcode,
) => {
  if (!chainId || !walletProvider) {
    console.error('Not enough data provided calling getRefAddressByRefCode()');
    return;
  }

  const contractAddress = contracts[chainId];

  const ABI = [
    'function getRefAddressByRefCode(string memory refCode) public view returns (address refAddress)',
  ];

  const refcodeChecked = refcode
    ? refcode
    : crypto.randomBytes(16).toString('hex');

  try {
    const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
    const signer = ethersProvider.getSigner();
    const contract = new Contract(contractAddress, ABI, signer);

    const referrerAddress = await contract.getRefAddressByRefCode(
      refcodeChecked,
    );

    return referrerAddress;
  } catch (err) {
    console.error('Error calling getRefAddressByRefCode()', err);
    return null;
  }
};
