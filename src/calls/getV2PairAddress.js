import { ethers, Contract } from 'ethers';
import { V2Factory } from '@/data/V2Factory';
import { WETH } from '@/data/WETH';

export const getV2PairAddress = async (
  chainId,
  walletProvider,
  tokenAddress,
) => {
  if (!chainId || !walletProvider || !tokenAddress) {
    console.error('Not enough data provided calling getV2PairAddress()');
    return;
  }

  const contractAddress = V2Factory[chainId];
  const wethAddress = WETH[chainId];

  const ABI = [
    'function getPair(address tokenA, address tokenB) external view returns (address pair)',
  ];

  try {
    const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
    const signer = ethersProvider.getSigner();
    const contract = new Contract(contractAddress, ABI, signer);

    const pairAddress = await contract.getPair(wethAddress, tokenAddress);

    return pairAddress;
  } catch (err) {
    console.error('Error calling getV2PairAddress()', err);
    return null;
  }
};
