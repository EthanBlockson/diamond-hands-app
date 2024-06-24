'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();
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
    <>
      <div className="alert flex center">
        Currently in beta testing. Careful. All progress might be lost!
      </div>
      <div className="header flex space-between center-baseline">
        <div className="left flex row center-baseline gapped">
          <Link className="logo" href="/">
            <Image
              src={`/img/brand/logo-long.png`}
              width={135}
              height={36}
              alt=""
            />
          </Link>
          <div className="menu flex row">
            <Link
              href="/hold"
              className={pathname === '/hold' ? 'active' : undefined}
            >
              Hold
            </Link>
            {isConnected ? (
              <Link
                href={`/holdings/${chainIdToNameLowerCase[chainId]}/address/${address}`}
                className={
                  pathname.includes('/holdings') ? 'active' : undefined
                }
              >
                My holdings
              </Link>
            ) : null}
            <Link
              href="/earn"
              className={pathname === '/earn' ? 'active' : undefined}
            >
              Earn
            </Link>
          </div>
        </div>
        <div className="right flex row gapped">
          {isConnected ? (
            <>
              <button
                className="chain-selector flex row center-baseline"
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
                  width={13}
                  height={13}
                  alt=""
                />
              </button>
              <button
                className="wallet flex row gapped center-baseline"
                onClick={() => open()}
              >
                <div className="avatar"></div>
                <div>{address && shortenAddress(address)}</div>
              </button>
            </>
          ) : (
            <button
              className="connect"
              onClick={() => open({ view: 'Connect' })}
            >
              Connect
            </button>
          )}
        </div>
      </div>
    </>
  );
}
