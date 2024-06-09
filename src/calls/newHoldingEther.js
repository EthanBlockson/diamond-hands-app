import { ethers, Contract } from 'ethers';
import { contracts } from '../../contracts';
import { getServiceFee } from './getServiceFee';
const crypto = require('crypto');

export const newHoldingEther = async (
  chainId,
  walletProvider,
  freezeAmount,
  freezeForSeconds,
  freezeForX,
  refcode,
) => {
  if (!chainId || !walletProvider || !freezeAmount) {
    console.error('Not enough data provided calling newHoldingEther()');
    return;
  }

  const contractAddress = contracts[chainId];

  const serviceFeeNumber = await getServiceFee(
    1,
    chainId,
    walletProvider,
    'ether',
    freezeAmount,
    18,
  );

  const freezeAmountInWei = ethers.utils.parseUnits(
    freezeAmount.toFixed(18),
    18,
  );
  const payableAmountInWei = ethers.utils.parseUnits(
    (freezeAmount + serviceFeeNumber).toFixed(18),
    18,
  );

  const freezeForXFormatted = freezeForX > 1 ? freezeForX * 100 : 0;

  const refcodeChecked = refcode
    ? refcode
    : crypto.randomBytes(16).toString('hex');

  const ABI = [
    'function newHoldingEther(uint256 freezeAmount, uint256 freezeForSeconds, uint256 freezeForX, string memory refcode) public payable',
  ];

  try {
    const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
    const signer = ethersProvider.getSigner();
    const contract = new Contract(contractAddress, ABI, signer);

    const tx = await contract.newHoldingEther(
      freezeAmountInWei,
      freezeForSeconds,
      freezeForXFormatted,
      refcodeChecked,
      { value: payableAmountInWei },
    );
    await tx.wait(1);

    return true;
  } catch (err) {
    console.error('Error calling newHoldingEther()', err);
    return null;
  }
};
