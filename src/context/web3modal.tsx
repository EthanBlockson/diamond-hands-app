'use client';

import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5/react';

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = '90dd8b20e402cedadae37101ab1e9387';

// 2. Set chains
const mainnet = {
  chainId: 1,
  name: 'Ethereum',
  currency: 'ETH',
  explorerUrl: 'https://etherscan.io',
  rpcUrl: 'https://rpc.ankr.com/eth',
};

const base = {
  chainId: 8453,
  name: 'Base',
  currency: 'ETH',
  explorerUrl: 'https://basescan.org/',
  rpcUrl: 'https://rpc.ankr.com/base',
};

const blast = {
  chainId: 81457,
  name: 'Blast',
  currency: 'ETH',
  explorerUrl: 'https://blastscan.io',
  rpcUrl: 'https://rpc.ankr.com/blast',
};

const arbitrum = {
  chainId: 42161,
  name: 'Arbitrum',
  currency: 'ETH',
  explorerUrl: 'https://arbiscan.io/',
  rpcUrl: 'https://rpc.ankr.com/arbitrum',
};

// const optimism = {
//   chainId: 10,
//   name: 'Optimism',
//   currency: 'ETH',
//   explorerUrl: 'https://optimistic.etherscan.io/',
//   rpcUrl: 'https://rpc.ankr.com/optimism',
// };

const polygon = {
  chainId: 137,
  name: 'Polygon',
  currency: 'ETH',
  explorerUrl: 'https://polygonscan.com/',
  rpcUrl: 'https://rpc.ankr.com/polygon',
};

const bsc = {
  chainId: 56,
  name: 'BSC',
  currency: 'BNB',
  explorerUrl: 'https://bscscan.com/',
  rpcUrl: 'https://rpc.ankr.com/bsc',
};

// 3. Create a metadata object
const metadata = {
  name: 'Diamond Hands',
  description: 'Hold your coins as you planned. Never break your targets.',
  url: 'https://diamond-hands.app', // origin must match your domain & subdomain
  icons: ['https://avatars.mywebsite.com/'],
};

// 4. Create Ethers config
const ethersConfig = defaultConfig({
  /*Required*/
  metadata,

  /*Optional*/
  enableEIP6963: true, // true by default
  enableInjected: true, // true by default
  enableCoinbase: true, // true by default
  rpcUrl: '...', // used for the Coinbase SDK
  defaultChainId: 1, // used for the Coinbase SDK
});

// 5. Create a Web3Modal instance
createWeb3Modal({
  ethersConfig,
  chains: [mainnet, base, blast, arbitrum, polygon, bsc],
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  enableOnramp: true, // Optional - false as default
});

export function Web3Modal({ children }) {
  return children;
}
