import { ethers, Contract } from 'ethers';
import { contracts } from '../../contracts';

export const setSpendingApproval = async (
  chainId,
  walletProvider,
  tokenAddress,
) => {
  if (!chainId || !walletProvider || !tokenAddress) {
    console.error('Not enough data provided calling setSpendingApproval()');
    return;
  }

  const diamondContract = contracts[chainId];

  const ABI = [
    'function approve(address spender, uint256 value) public returns (bool)',
  ];

  try {
    const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
    const signer = ethersProvider.getSigner();
    const contract = new Contract(tokenAddress, ABI, signer);

    const maxUint256 = ethers.constants.MaxUint256;

    const tx = await contract.approve(diamondContract, maxUint256);
    await tx.wait(1);

    return true;
  } catch (err) {
    console.error('Error calling setSpendingApproval()', err);
    return null;
  }
};
