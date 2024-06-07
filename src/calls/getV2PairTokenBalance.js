import { ethers, Contract } from 'ethers';

export const getV2PairTokenBalance = async (
  walletProvider,
  pairAddress,
  tokenAddress,
  decimals,
) => {
  if (!walletProvider || !pairAddress || !tokenAddress) {
    console.error('Not enough data provided calling getV2PairTokenBalance()');
    return;
  }

  const contractAddress = tokenAddress;

  const ABI = ['function balanceOf(address account) view returns (uint256)'];

  try {
    const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
    const signer = ethersProvider.getSigner();
    const contract = new Contract(contractAddress, ABI, signer);

    const balanceBigNumber = await contract.balanceOf(pairAddress);
    const balanceString = ethers.utils.formatUnits(balanceBigNumber, decimals);
    const balanceNumber = parseFloat(balanceString);

    return balanceNumber;
  } catch (err) {
    console.error('Error calling getV2PairTokenBalance()', err);
    return null;
  }
};
