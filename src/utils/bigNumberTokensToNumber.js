import { ethers } from 'ethers';

export function bigNumberTokensToNumber(bigNumber, decimals) {
  const formattedString = ethers.utils.formatUnits(bigNumber, decimals);
  return parseFloat(formattedString);
}
