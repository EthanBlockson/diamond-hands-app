import { ethers, Contract } from 'ethers';
import { contracts } from '../../contracts';
import { getServiceFee } from './getServiceFee';
const crypto = require('crypto');

export const newHoldingToken = async (
  chainId,
  walletProvider,
  tokenAddress,
  freezeAmount,
  decimals,
  freezeForSeconds,
  freezeForX,
  isPriceGrowthGoalInUSD,
  refcode,
) => {
  if (!chainId || !walletProvider || !tokenAddress || !freezeAmount) {
    console.error('Not enough data provided calling newHoldingToken()');
    return;
  }

  const contractAddress = contracts[chainId];

  const serviceFeeNumber = await getServiceFee(
    3,
    chainId,
    walletProvider,
    tokenAddress,
    freezeAmount,
    decimals,
  );

  const freezeAmountInWei = ethers.utils.parseUnits(
    freezeAmount.toFixed(18),
    decimals,
  );
  const payableAmountInWei = ethers.utils.parseUnits(
    serviceFeeNumber.toFixed(18),
    18,
  );

  const freezeForXFormatted =
    freezeForX > 1 ? (freezeForX * 100).toFixed(0) : 0;

  const refcodeChecked = refcode
    ? refcode
    : crypto.randomBytes(16).toString('hex');

  const ABI = [
    'function newHoldingToken(address token, uint256 freezeAmount, uint256 freezeForSeconds, uint256 freezeForX, bool isPriceGrowthGoalInUSD, string memory refcode) public payable',
  ];

  try {
    const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
    const signer = ethersProvider.getSigner();
    const contract = new Contract(contractAddress, ABI, signer);

    // console.log([
    //   tokenAddress,
    //   freezeAmountInWei,
    //   freezeForSeconds,
    //   freezeForXFormatted,
    //   isPriceGrowthGoalInUSD,
    //   refcodeChecked,
    //   { value: payableAmountInWei },
    // ]); // TEMP

    const tx = await contract.newHoldingToken(
      tokenAddress,
      freezeAmountInWei,
      freezeForSeconds,
      freezeForXFormatted,
      isPriceGrowthGoalInUSD,
      refcodeChecked,
      { value: payableAmountInWei },
    );
    await tx.wait(1);

    return true;
  } catch (err) {
    console.error('Error calling newHoldingToken()', err);
    return null;
  }
};
