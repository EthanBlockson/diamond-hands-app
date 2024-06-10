import { ethers, Contract } from 'ethers';
import { contracts } from '../../contracts';

export const createMyRefCode = async (
  chainId,
  walletProvider,
  userAddress,
  newCode,
) => {
  if (!chainId || !walletProvider || !userAddress || !newCode) {
    console.error('Not enough data provided calling createMyRefCode()');
    return;
  }

  const contractAddress = contracts[chainId];

  const ABI = ['function createMyRefcode(string memory refCode) public'];

  try {
    const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
    const signer = ethersProvider.getSigner();
    const contract = new Contract(contractAddress, ABI, signer);

    const tx = await contract.createMyRefcode(newCode);
    await tx.wait(1);

    return true;
  } catch (err) {
    console.error('Error calling createMyRefCode()', err);
    return null;
  }
};
