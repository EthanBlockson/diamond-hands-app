import { ethers } from 'ethers';

export const getEtherBalance = async (walletProvider, address) => {
  if (!walletProvider || !address) {
    console.error('Not enough data provided calling getEtherBalance()');
    return;
  }

  try {
    const ethersProvider = new ethers.providers.Web3Provider(walletProvider);

    const balance = await ethersProvider.getBalance(address);
    const balanceString = ethers.utils.formatEther(balance);
    const balanceNumber = parseFloat(balanceString);

    return balanceNumber;
  } catch (err) {
    console.error('Error calling getEtherBalance()', err);
    return 0;
  }
};
