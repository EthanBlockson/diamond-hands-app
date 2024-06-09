import { ethers, Contract } from 'ethers';
import { contracts } from '../../contracts';

export const getServiceFee = async (
  path, // 1) ether deposit, 2) ether widthdraw, 3) token deposit, 4) token withdraw
  chainId,
  walletProvider,
  tokenAddress,
  tokenAmount,
  tokenDecimals,
) => {
  if (
    !path ||
    !chainId ||
    !walletProvider ||
    !tokenAddress ||
    !tokenAmount ||
    !tokenDecimals
  ) {
    console.error('Not enough data provided calling getServiceFee()');
    return;
  }

  const contractAddress = contracts[chainId];
  const tokenAmountInWei = ethers.utils.parseUnits(
    tokenAmount.toFixed(18),
    tokenDecimals,
  );

  const ABI = [
    'function getEtherDepositFee(uint256 etherAmount) public view returns (uint256)',
    'function getEtherWithdrawalFee(uint256 etherAmount) public view returns (uint256)',
    'function getTokenDepositFee(address token, uint256 tokenAmount) public view returns (uint256)',
    'function getTokenWithdrawalFee(address token, uint256 tokenAmount) public view returns (uint256)',
  ];

  try {
    const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
    const signer = ethersProvider.getSigner();
    const contract = new Contract(contractAddress, ABI, signer);

    const types = [
      undefined,
      () => contract.getEtherDepositFee(tokenAmountInWei),
      () => contract.getEtherWithdrawalFee(tokenAmountInWei),
      () => contract.getTokenDepositFee(tokenAddress, tokenAmountInWei),
      () => contract.getTokenWithdrawalFee(tokenAddress, tokenAmountInWei),
    ];

    const etherFeeBigNumber = await types[path]();
    const etherFeeString = ethers.utils.formatUnits(etherFeeBigNumber, 18);
    const etherFeeNumber = parseFloat(etherFeeString);

    return etherFeeNumber;
  } catch (err) {
    console.error('Error calling getServiceFee()', err);
    return null;
  }
};
