'use client';

import { useState, useEffect } from 'react';
import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from '@web3modal/ethers5/react';
import { getEtherBalance } from '@/calls/getEtherBalance';
import cutDecimals from '@/utils/cutDecimals';
import PickTokenModal from '../components/PickTokenModal';
import { formatDate } from '@/utils/formatDate';
import addDaysToDate from '@/utils/addDaysToDate';

export default function Hold() {
  const { walletProvider } = useWeb3ModalProvider();
  const { address, chainId } = useWeb3ModalAccount();

  const [isConnected, setIsConnected] = useState(false);
  const [tokenAddress, setTokenAddress] = useState(undefined);
  const [tokenName, setTokenName] = useState('ETH');
  const [tokenSymbol, setTokenSymbol] = useState('ETH');
  const [tokenDecimals, setTokenDecimals] = useState(undefined);
  const [tokenBalance, setTokenBalance] = useState(undefined);
  const [amount, setAmount] = useState('');
  const [freezeForDays, setFreezeForDays] = useState(0);
  const [limitDays, setLimitDays] = useState(1825);
  const [unfreezeDate, setUnfreezeDate] = useState(new Date());
  const [freezeForX, setFreezeForX] = useState(1);
  const [limitX, setLimitX] = useState(100);
  const [promocode, setPromocode] = useState('');

  const [isPickTokenModalVisible, setIsPickTokenModalVisible] = useState(false);

  useEffect(() => {
    if (address) {
      // Default token is ether
      setTokenAddress('ether');
      setTokenName(chainId === 56 ? 'BNB' : 'ETH');
      setTokenSymbol(chainId === 56 ? 'BNB' : 'ETH');
      callGetEtherBalance();
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  }, [address, chainId]);

  const callGetEtherBalance = async () => {
    const etherBalance = await getEtherBalance(walletProvider, address);
    setTokenBalance(etherBalance);
  };

  const handleAmount = (e) => {
    const inputAmount = parseFloat(e.target.value);
    setAmount(inputAmount);
    // setAmountUSDT(inputPC * price);
  };

  const handleDays = (e) => {
    const today = new Date();
    const inputDays = parseFloat(e.target.value);
    setFreezeForDays(inputDays);
    inputDays > 0
      ? setUnfreezeDate(addDaysToDate(today, inputDays))
      : setUnfreezeDate(today);
  };

  const handleX = (e) => {
    const inputX = parseFloat(e.target.value);
    setFreezeForX(inputX);
  };

  const handleShowPickTokenModal = (boolean) => {
    setIsPickTokenModalVisible(boolean);
  };

  const modals = [
    null,
    <PickTokenModal
      isPickTokenModalVisible={isPickTokenModalVisible}
      handleShowPickTokenModal={handleShowPickTokenModal}
      setTokenAddress={setTokenAddress}
      setTokenName={setTokenName}
      setTokenSymbol={setTokenSymbol}
      setTokenDecimals={setTokenDecimals}
      setTokenBalance={setTokenBalance}
    />,
  ];

  return (
    <>
      {isPickTokenModalVisible && <>{modals[1]}</>}
      {isConnected ? (
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
                    min="0"
                    autoComplete="off"
                    placeholder="0"
                    value={amount}
                    onChange={handleAmount}
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
                </div>
              </div>
            </div>
            <div className="flex space-between">
              <div>$0.00</div>
              <div className="flex end">
                Balance:
                <span
                  className="token-balance"
                  onClick={() => setAmount(tokenBalance)}
                >
                  {cutDecimals(tokenBalance)}
                </span>
              </div>
            </div>
            <div className="date-slider flex space-between">
              <div className="left">
                <div>Hold until {formatDate(unfreezeDate)}</div>
                <input
                  type="range"
                  id="slider"
                  name="slider"
                  min="1"
                  max={limitDays}
                  value={freezeForDays}
                  onChange={handleDays}
                />
              </div>
              <div className="right">
                <input
                  type="number"
                  autoComplete="off"
                  placeholder="12"
                  value={freezeForDays}
                  onChange={handleDays}
                />
                <div>days</div>
                {freezeForDays === limitDays && (
                  <button
                    className="mini"
                    onClick={() => setLimitDays(limitDays * 2)}
                  >
                    more!
                  </button>
                )}
              </div>
            </div>
            <div className="price-slider flex space-between">
              <div className="left">
                <div className="flex row gapped">
                  <div>
                    Hold until {freezeForX}X in {tokenSymbol}
                  </div>
                  <button className="mini">change to USDT</button>
                </div>
                <input
                  type="range"
                  id="slider"
                  name="slider"
                  min="1"
                  max={limitX}
                  step="0.1"
                  value={freezeForX}
                  onChange={handleX}
                />
                <div>0.0000001 {tokenSymbol}/TOKEN</div>
              </div>
              <div className="right">
                <input
                  type="number"
                  autoComplete="off"
                  placeholder="100"
                  value={freezeForX}
                  onChange={handleX}
                />
                <div>X's</div>
                {freezeForX === limitX && (
                  <button
                    className="mini"
                    onClick={() => setLimitX(limitX * 4)}
                  >
                    more!
                  </button>
                )}
              </div>
            </div>
          </div>
          {amount > 0 && amount <= tokenBalance && (
            <div className="result-info flex column">
              <div className="flex space-between">
                <div>Fee</div>
                <div className="flex row gapped">
                  <div>
                    <s>0.000123 {chainId === 56 ? 'BNB' : 'ETH'}</s>
                  </div>
                  <div>0.0001 {chainId === 56 ? 'BNB' : 'ETH'}</div>
                </div>
              </div>
              <div className="flex space-between">
                <div>Discount</div>
                <div>PASHATECHNIQUE -20%</div>
              </div>
            </div>
          )}
          <div className="form flex column">
            <div className="buttons flex space-between gapped">
              {!amount && <button disabled>Enter an amount</button>}
              {amount > tokenBalance && (
                <button disabled>Insufficient {tokenSymbol} balance</button>
              )}
              {amount <= tokenBalance && amount > 0 && (
                <>
                  <button>Approve</button>
                  <button disabled>Hold</button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div>Waiting for wallet connection...</div>
      )}
    </>
  );
}
