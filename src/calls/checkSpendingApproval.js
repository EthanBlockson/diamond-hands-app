import { ethers, Contract } from 'ethers';
import { contracts } from '../../contracts';

export const checkSpendingApproval = async (
  chainId,
  walletProvider,
  tokenAddress,
  decimals,
  userAddress,
) => {
  if (
    !chainId ||
    !walletProvider ||
    !tokenAddress ||
    !decimals ||
    !userAddress
  ) {
    console.error('Not enough data provided calling checkSpendingApproval()');
    return;
  }

  const diamondContract = contracts[chainId];

  const ABI = [
    'function allowance(address owner, address spender) external view returns (uint256)',
  ];

  try {
    const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
    const signer = ethersProvider.getSigner();
    const contract = new Contract(tokenAddress, ABI, signer);

    const allowanceBigNumber = await contract.allowance(
      userAddress,
      diamondContract,
    );
    const allowanceString = ethers.utils.formatUnits(
      allowanceBigNumber,
      decimals,
    );
    const allowanceNumber = parseFloat(allowanceString);

    return allowanceNumber;
  } catch (err) {
    console.error('Error calling checkSpendingApproval()', err);
    return null;
  }
};
