import { ethers, Contract } from 'ethers';
import { contracts } from '../../contracts';

export const getTokenPriceV2 = async (
  chainId,
  walletProvider,
  tokenAddress,
  tokenDecimals,
  tokenAmount,
  isTokenSell,
) => {
  if (
    !chainId ||
    !walletProvider ||
    !tokenAddress ||
    !tokenDecimals ||
    !tokenAmount ||
    !isTokenSell
  ) {
    console.error('Not enough data provided calling getTokenPriceV2()');
    return;
  }

  const contractAddress = contracts[chainId];
  const tokenAmountInWei = ethers.utils.parseUnits(
    tokenAmount.toString(),
    tokenDecimals,
  );

  const ABI = [
    'function getTokenPriceV2(address token, uint256 tokenAmount, bool isTokenSell) public view returns (uint256)',
  ];

  try {
    const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
    const signer = ethersProvider.getSigner();
    const contract = new Contract(contractAddress, ABI, signer);

    const etherPriceBigNumber = await contract.getTokenPriceV2(
      tokenAddress,
      tokenAmountInWei,
      isTokenSell,
    );

    const etherPriceString = ethers.utils.formatUnits(etherPriceBigNumber, 18); // decimals
    const etherPriceNumber = parseFloat(etherPriceString);

    return etherPriceNumber;
  } catch (err) {
    console.error('Error calling getTokenPriceV2()', err);
    return null;
  }
};
