import { ethers, Contract } from 'ethers';
import { contracts } from '../../contracts';
import { bigNumberTokensToNumber } from '@/utils/bigNumberTokensToNumber';
import { decimalsUSD } from '@/utils/decimalsUSD';

export const getHoldingInfo = async (chainId, walletProvider, _id) => {
  if (!chainId || !walletProvider || !_id) {
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

    const holdingInfoFormatted = {
      isActive: holdingInfo[0],
      isPureEther: holdingInfo[1],
      amount: bigNumberTokensToNumber(holdingInfo[2], 18),
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
      user: holdingInfo[10],
    };

    return holdingInfoFormatted;
  } catch (err) {
    console.error('Error calling getHoldingInfo()', err);
    return null;
  }
};
