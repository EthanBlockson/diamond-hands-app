import { ethers, Contract } from 'ethers';
import { contracts } from '../../contracts';

export const getRefs = async (chainId, walletProvider, userAddress) => {
  if (!chainId || !walletProvider || !userAddress) {
    console.error('Not enough data provided calling getRefs()');
    return;
  }

  const contractAddress = contracts[chainId];

  const ABI = [
    'function getRefCodeByAddress(address userAddress) public view returns (bytes32)',
    'function getTotalRefs(address userAddress) public view returns (uint32)',
    'function getTotalRefGains(address userAddress) public view returns (uint256)',
  ];

  try {
    const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
    const signer = ethersProvider.getSigner();
    const contract = new Contract(contractAddress, ABI, signer);

    const refcodeBytes32 = await contract.getRefCodeByAddress(userAddress);
    const refcodeString =
      refcodeBytes32 === ethers.constants.HashZero
        ? null
        : ethers.utils.parseBytes32String(refcodeBytes32);

    const totalRefs = await contract.getTotalRefs(userAddress);

    const totalRefGainsBigNumber = await contract.getTotalRefGains(userAddress);
    const totalRefGainsString = ethers.utils.formatUnits(
      totalRefGainsBigNumber,
      18,
    ); // decimals
    const totalRefGainsNumber = parseFloat(totalRefGainsString);

    return { refcodeString, totalRefs, totalRefGainsNumber };
  } catch (err) {
    console.error('Error calling getRefs()', err);
    return null;
  }
};
