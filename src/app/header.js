'use client';

import Link from 'next/link';
import {
  useWeb3Modal,
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from '@web3modal/ethers5/react';
import { chainIdToNameLowerCase } from '@/utils/chainIdToNameLowerCase';

export default function Header() {
  const { walletProvider } = useWeb3ModalProvider();
  const { address, chainId } = useWeb3ModalAccount();

  return (
    <div className="header flex space-between">
      <div className="left flex row center-baseline gapped">
        <Link href="/">
          <h1>Diamond Hands</h1>
        </Link>
        <div className="menu flex row gapped">
          <Link href="/hold">Hold</Link>
          <Link
            href={`/holdings/${chainIdToNameLowerCase[chainId]}/address/${address}`}
          >
            My holdings
          </Link>
          <Link href="/earn">Earn</Link>
        </div>
      </div>
      <div className="right">
        <w3m-button />
      </div>
    </div>
  );
}
