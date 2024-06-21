'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useWeb3ModalAccount } from '@web3modal/ethers5/react';
import { chainIdToNameLowerCase } from '@/utils/chainIdToNameLowerCase';
import SocialMediaLinks from './components/SocialMediaLinks';

export default function Footer() {
  const pathname = usePathname();
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
    <footer>
      {/* DESKTOP */}
      <div className="flex space-between">
        <div className="credits flex column end gapped">
          <div
            className="status"
            style={{ backgroundColor: isConnected ? '#40e0d0' : '#7d7d7d' }}
          ></div>
          <div>v1.0</div>
        </div>
        <SocialMediaLinks size={25} isDesktop={true} />
      </div>
      {/* MOBILE */}
      <div className="menu-mobile-block">
        <div className="menu-mobile flex space-between">
          <div className="links flex row">
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
          <div className="flex row">
            <SocialMediaLinks size={25} isDesktop={false} />
          </div>
        </div>
      </div>
    </footer>
  );
}
