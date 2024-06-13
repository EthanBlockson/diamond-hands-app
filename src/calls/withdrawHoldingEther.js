import { ethers, Contract } from 'ethers';
import { contracts } from '../../contracts';

export const withdrawHoldingEther = async (
  chainId,
  walletProvider,
  _id,
  fee,
) => {
  if (!chainId || !walletProvider || !_id) {
    console.error('Not enough data provided calling withdrawHoldingEther()');
    return;
  }

  const contractAddress = contracts[chainId];

  const payableAmountInWei = ethers.utils.parseUnits(fee.toFixed(18), 18);

  const ABI = ['function withdrawHoldingEther(uint32 _id) public payable'];

  try {
    const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
    const signer = ethersProvider.getSigner();
    const contract = new Contract(contractAddress, ABI, signer);

    const tx = await contract.withdrawHoldingEther(_id, {
      value: payableAmountInWei,
    });
    await tx.wait(1);

    return true;
  } catch (err) {
    console.error('Error calling withdrawHoldingEther()', err);
    return null;
  }
};
