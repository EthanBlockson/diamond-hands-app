const chainIds = [1, 42161, 10, 137, 8453, 81457, 56];

export default function isSupportedChainId(chainId) {
  return chainIds.includes(chainId);
}
