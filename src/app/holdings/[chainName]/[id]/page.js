'use client';

import { useState, useEffect } from 'react';
import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from '@web3modal/ethers5/react';
import { nameToChainId } from '@/utils/nameToChainId';

export default function Holdings({ params }) {
  const { chainName, id } = params;
  const { walletProvider } = useWeb3ModalProvider();
  const { address, chainId } = useWeb3ModalAccount();

  const [isNetworkMatch, setIsNetworkMatch] = useState(true);

  useEffect(() => {
    const chainIdFromLink = nameToChainId[chainName];
    chainIdFromLink !== chainId
      ? setIsNetworkMatch(false)
      : setIsNetworkMatch(true);
  }, [chainId]);

  return (
    <>
      <div>{isNetworkMatch ? <div>match</div> : <div>not match</div>}</div>
    </>
  );
}
