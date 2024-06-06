import { ethers, Contract } from 'ethers';

export const getERC20 = async (
  walletProvider,
  contractAddress,
  userAddress,
) => {
  if (!walletProvider || !contractAddress || !userAddress) {
    console.error('Not enough data provided calling getERC20()');
    return;
  }

  const ABI = [
    'function name() public view returns (string memory)',
    'function symbol() public view returns (string memory)',
    'function decimals() public view returns (uint8)',
    'function balanceOf(address account) view returns (uint256)',
  ];

  try {
    const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
    const signer = ethersProvider.getSigner();
    const contract = new Contract(contractAddress, ABI, signer);

    const [name, symbol, decimals, balanceBigNumber] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.balanceOf(userAddress),
    ]);

    const balanceString = ethers.utils.formatUnits(balanceBigNumber, decimals);
    const balanceNumber = parseFloat(balanceString);

    return { name, symbol, decimals, balanceNumber };
  } catch (err) {
    console.error('Error calling getERC20()', err);
    return null;
  }
};
