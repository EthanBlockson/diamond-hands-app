import { ethers, Contract } from 'ethers';
import { contracts } from '../../contracts';

export const withdrawHoldingToken = async (
  chainId,
  walletProvider,
  _id,
  fee,
  decimals,
) => {
  if (!chainId || !walletProvider || !_id || !decimals) {
    console.error('Not enough data provided calling withdrawHoldingToken()');
    return;
  }

  const contractAddress = contracts[chainId];

  const payableAmountInWei = ethers.utils.parseUnits(fee.toFixed(18), decimals);

  const ABI = ['function withdrawHoldingToken(uint32 _id) public payable'];

  try {
    const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
    const signer = ethersProvider.getSigner();
    const contract = new Contract(contractAddress, ABI, signer);

    const tx = await contract.withdrawHoldingToken(_id, {
      value: payableAmountInWei,
    });
    await tx.wait(1);

    return true;
  } catch (err) {
    console.error('Error calling withdrawHoldingToken()', err);
    return null;
  }
};
