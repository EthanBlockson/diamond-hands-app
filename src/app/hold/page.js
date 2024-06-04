'use client';

import { useState, useEffect } from 'react';
import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from '@web3modal/ethers5/react';
import { getEtherBalance } from '@/calls/getEtherBalance';
import cutDecimals from '@/utils/cutDecimals';
import PickTokenModal from '../components/PickTokenModal';

export default function Hold() {
  const { walletProvider } = useWeb3ModalProvider();
  const { address, chainId } = useWeb3ModalAccount();

  const [tokenAddress, setTokenAddress] = useState(undefined);
  const [tokenName, setTokenName] = useState('ETH');
  const [tokenSymbol, setTokenSymbol] = useState('ETH');
  const [tokenBalance, setTokenBalance] = useState(undefined);

  const [isPickTokenModalVisible, setIsPickTokenModalVisible] = useState(false);

  useEffect(() => {
    // Default token is ether
    setTokenAddress(null);
    setTokenName(chainId === 56 ? 'BNB' : 'ETH');
    setTokenSymbol(chainId === 56 ? 'BNB' : 'ETH');
    callGetEtherBalance();
  }, [address, chainId]);

  const callGetEtherBalance = async () => {
    const etherBalance = await getEtherBalance(walletProvider, address);
    setTokenBalance(etherBalance);
  };

  const handleShowPickTokenModal = (boolean) => {
    setIsPickTokenModalVisible(boolean);
  };

  const modals = [
    null,
    <PickTokenModal
      isPickTokenModalVisible={isPickTokenModalVisible}
      handleShowPickTokenModal={handleShowPickTokenModal}
    />,
  ];

  return (
    <>
      {isPickTokenModalVisible && <>{modals[1]}</>}
      <div className="hold flex column center">
        <h1>New holding</h1>
        <div className="form flex column">
          <div className="pick-tokens flex space-between">
            <div className="left">
              <div className="token-amount">
                <div>Amount</div>
                <input
                  className="amount"
                  type="number"
                  autoComplete="off"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="right">
              <div className="token-address">
                <div>Token</div>
                <button
                  onClick={() =>
                    setIsPickTokenModalVisible(!isPickTokenModalVisible)
                  }
                >
                  {tokenSymbol}
                </button>
                <div>Balance: {cutDecimals(tokenBalance)}</div>
              </div>
            </div>
          </div>
          <div className="date-slider flex space-between">
            <div className="left">
              <div>Hold until May 12, 2024</div>
              <input type="range" id="slider" name="slider" min="0" max="100" />
            </div>
            <div className="right">
              <input type="text" autoComplete="off" placeholder="12" />
              <div>days</div>
            </div>
          </div>
          <div className="price-slider flex space-between">
            <div className="left">
              <div className="flex row gapped">
                <div>Hold until 10.2X in {tokenSymbol}</div>
                <button className="mini">change to USDT</button>
              </div>
              <input type="range" id="slider" name="slider" min="0" max="100" />
              <div>0.0000001 {tokenSymbol}/TOKEN</div>
            </div>
            <div className="right">
              <input type="text" autoComplete="off" placeholder="100" />
              <div>X's</div>
            </div>
          </div>
        </div>
        <div className="form discount flex column center">
          <div>Enter promocode to get 20% fee discount forever!</div>
          <div className="flex row gapped">
            <input type="text" autoComplete="off" placeholder="CODE" />
            <button className="mini">Check</button>
          </div>
        </div>
        <div className="result-info flex column">
          <div className="flex space-between">
            <div>Fee</div>
            <div className="flex row gapped">
              <div>
                <s>0.000123 {tokenSymbol}</s>
              </div>
              <div>0.0001 {tokenSymbol}</div>
            </div>
          </div>
          <div className="flex space-between">
            <div>Discount</div>
            <div>PASHATECHNIQUE -20%</div>
          </div>
        </div>
        <div className="form flex column">
          <div className="buttons flex space-between gapped">
            <button>Approve</button>
            <button disabled>Hold</button>
          </div>
        </div>
      </div>
    </>
  );
}
