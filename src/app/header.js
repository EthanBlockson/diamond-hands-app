'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import {
  useWeb3Modal,
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from '@web3modal/ethers5/react';
import { chainIdToNameLowerCase } from '@/utils/chainIdToNameLowerCase';
import { shortenAddress } from '@/utils/shortenAddress';
import isSupportedChainId from '@/utils/isSupportedChainId';

export default function Header() {
  const { open } = useWeb3Modal();
  const { walletProvider } = useWeb3ModalProvider();
  const { address, chainId } = useWeb3ModalAccount();

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (address && chainId) {
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  }, [address, chainId]);

  return (
    <div className="header flex space-between">
      <div className="left flex row center-baseline gapped">
        <Link href="/">
          <h1>Diamond Hands</h1>
        </Link>
        <div className="menu flex row gapped">
          <Link href="/hold">Hold</Link>
          {isConnected ? (
            <Link
              href={`/holdings/${chainIdToNameLowerCase[chainId]}/address/${address}`}
            >
              My holdings
            </Link>
          ) : null}
          <Link href="/earn">Earn</Link>
        </div>
      </div>
      <div className="right flex row gapped">
        {isConnected ? (
          <>
            <button
              className="flex row center-baseline gapped"
              onClick={() => open({ view: 'Networks' })}
            >
              <Image
                src={`/img/chains/${
                  isSupportedChainId(chainId) ? chainId : 0
                }.svg`}
                width={25}
                height={25}
                alt=""
              />
              <Image
                src={`/img/icons/arrow-down.svg`}
                width={15}
                height={15}
                alt=""
              />
            </button>
            <button onClick={() => open()}>{shortenAddress(address)}</button>
          </>
        ) : (
          <button onClick={() => open({ view: 'Connect' })}>Connect</button>
        )}
      </div>
    </div>
  );
}
