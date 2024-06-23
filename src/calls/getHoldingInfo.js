import { ethers, Contract } from 'ethers';
import { contracts } from '../../contracts';
import { bigNumberTokensToNumber } from '@/utils/bigNumberTokensToNumber';
import { decimalsUSD } from '@/utils/decimalsUSD';
import { getERC20 } from './getERC20';

export const getHoldingInfo = async (
  chainId,
  walletProvider,
  _id,
  userAddress,
) => {
  if (!chainId || !walletProvider || !_id || !userAddress) {
    console.error('Not enough data provided calling getHoldingInfo()');
    return;
  }

  const contractAddress = contracts[chainId];

  const ABI = [
    'function getHoldingInfo(uint32 _id) external view returns (bool, bool, uint256, uint256, uint256, uint256, uint256, uint256, uint256, address, address)',
  ];

  try {
    const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
    const signer = ethersProvider.getSigner();
    const contract = new Contract(contractAddress, ABI, signer);

    const holdingInfo = await contract.getHoldingInfo(_id);

    let tokenData = {
      name: null,
      symbol: null,
      decimals: 18,
      balanceNumber: null,
    };
    if (!holdingInfo[1]) {
      tokenData = await getERC20(walletProvider, holdingInfo[9], userAddress);
    }

    const holdingInfoFormatted = {
      isActive: holdingInfo[0],
      isPureEther: holdingInfo[1],
      amount: bigNumberTokensToNumber(
        holdingInfo[2],
        holdingInfo[1] ? 18 : tokenData.decimals,
      ),
      holdAtTimestamp: holdingInfo[3].toNumber(),
      holdUntilTimestamp: holdingInfo[4].toNumber(),
      holdAtPriceInWETH: bigNumberTokensToNumber(holdingInfo[5], 18),
      holdUntilPriceInWETH: bigNumberTokensToNumber(holdingInfo[6], 18),
      holdAtPriceInUSD: bigNumberTokensToNumber(
        holdingInfo[7],
        decimalsUSD[chainId],
      ),
      holdUntilPriceInUSD: bigNumberTokensToNumber(
        holdingInfo[8],
        decimalsUSD[chainId],
      ),
      token: holdingInfo[9],
      name: tokenData.name,
      symbol: tokenData.symbol,
      decimals: tokenData.decimals,
      balance: tokenData.balanceNumber,
      user: holdingInfo[10],
    };

    return holdingInfoFormatted;
  } catch (err) {
    console.error('Error calling getHoldingInfo()', err);
    return null;
  }
};
