import { ethers, Contract } from 'ethers';
import { contracts } from '../../contracts';

export const getHoldingIds = async (chainId, walletProvider, userAddress) => {
  if (!chainId || !walletProvider || !userAddress) {
    console.error('Not enough data provided calling getHoldingIds()');
    return;
  }

  const contractAddress = contracts[chainId];

  const ABI = [
    'function getHoldingIds(address userAddress) external view returns (uint32[])',
  ];

  try {
    const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
    const signer = ethersProvider.getSigner();
    const contract = new Contract(contractAddress, ABI, signer);

    const holdingIds = await contract.getHoldingIds(userAddress);

    return holdingIds;
  } catch (err) {
    console.error('Error calling getHoldingIds()', err);
    return null;
  }
};
