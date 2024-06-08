'use client';

import { useState, useEffect } from 'react';
import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from '@web3modal/ethers5/react';
import { getEtherBalance } from '@/calls/getEtherBalance';
import { getTokenPriceV2 } from '@/calls/getTokenPriceV2';
import { USDT } from '@/data/USDT';
import cutDecimals from '@/utils/cutDecimals';
import cutLongZeroNumber from '@/utils/cutLongZeroNumber';
import PickTokenModal from '../components/PickTokenModal';
import { formatDate } from '@/utils/formatDate';
import addDaysToDate from '@/utils/addDaysToDate';
import { fees } from '../../../fees';

export default function Hold() {
  const { walletProvider } = useWeb3ModalProvider();
  const { address, chainId } = useWeb3ModalAccount();

  const [isConnected, setIsConnected] = useState(false);
  const [tokenAddress, setTokenAddress] = useState(null);
  const [tokenName, setTokenName] = useState('ETH');
  const [tokenSymbol, setTokenSymbol] = useState('ETH');
  const [tokenDecimals, setTokenDecimals] = useState(undefined);
  const [tokenBalance, setTokenBalance] = useState(undefined);
  const [amount, setAmount] = useState('');
  const [amountUSDT, setAmountUSDT] = useState(0);
  const [priceETHinUSD, setPriceETHinUSD] = useState(0);
  const [priceTOKENinETH, setPriceTOKENinETH] = useState(undefined);
  const [isErrorGettingPriceTOKEN, setIsErrorGettingPriceTOKEN] =
    useState(false);
  const [freezeForDays, setFreezeForDays] = useState(0);
  const [limitDays, setLimitDays] = useState(1825);
  const [unfreezeDate, setUnfreezeDate] = useState(new Date());
  const [freezeForX, setFreezeForX] = useState(1);
  const [isInUSDT, setIsInUSDT] = useState(true);
  const [limitX, setLimitX] = useState(100);
  const [refcode, setRefcode] = useState('');
  const [fee, setFee] = useState(undefined);

  const [isPickTokenModalVisible, setIsPickTokenModalVisible] = useState(false);

  useEffect(() => {
    if (address && chainId) {
      // Default token is ether
      setTokenName(chainId === 56 ? 'BNB' : 'ETH');
      setTokenSymbol(chainId === 56 ? 'BNB' : 'ETH');
      callGetEtherBalance();
      callGetPriceETHinUSD();
      setRefcode(localStorage.getItem('refcode')?.toUpperCase());
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  }, [address, chainId]);

  const callGetEtherBalance = async () => {
    const etherBalance = await getEtherBalance(walletProvider, address);
    setTokenBalance(etherBalance);
  };

  const callGetPriceETHinUSD = async () => {
    const etherDollarPrice = await getTokenPriceV2(
      chainId,
      walletProvider,
      USDT[chainId],
      6, // USDT decimals
      1, // 1 USDT
      true,
    );
    // 1 / 0.000258740411587277 WETH = 3864.87 USDT/WETH
    setPriceETHinUSD(1 / etherDollarPrice);
  };

  const callGetPriceTOKENinETH = async (token, decimals) => {
    const tokenEtherPrice = await getTokenPriceV2(
      chainId,
      walletProvider,
      token,
      decimals,
      1, // 1 TOKEN
      true,
    );
    setPriceTOKENinETH(tokenEtherPrice);
    tokenEtherPrice && setIsErrorGettingPriceTOKEN(false);
    !tokenEtherPrice && setIsErrorGettingPriceTOKEN(true);
  };

  const callGetDepositFeeForExactTOKENs = async () => {
    const currentPrice = await getTokenPriceV2(
      chainId,
      walletProvider,
      tokenAddress,
      tokenDecimals,
      amount,
      true,
    );
    const finalFee = (currentPrice * fees.deposit) / 100;
    return finalFee;
  };

  const handleAmount = (e) => {
    const inputAmount = parseFloat(e.target.value);
    if (inputAmount >= 0) {
      setAmount(inputAmount);
      handleAmountUSDT(inputAmount);
      calcFee(inputAmount);
    } else {
      setAmount('');
      setAmountUSDT(0);
    }
  };

  const handleAmountUSDT = (inputAmount) => {
    tokenName === 'ETH' && setAmountUSDT(inputAmount * priceETHinUSD);
    tokenAddress &&
      setAmountUSDT(inputAmount * priceTOKENinETH * priceETHinUSD);
  };

  const calcFee = (inputAmount) => {
    tokenName === 'ETH' && setFee((inputAmount * fees.deposit) / 100);
    tokenAddress &&
      setFee((inputAmount * priceTOKENinETH * fees.deposit) / 100);
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
      key="default"
      isPickTokenModalVisible={isPickTokenModalVisible}
      handleShowPickTokenModal={handleShowPickTokenModal}
      setTokenAddress={setTokenAddress}
      setTokenName={setTokenName}
      setTokenSymbol={setTokenSymbol}
      setTokenDecimals={setTokenDecimals}
      setTokenBalance={setTokenBalance}
      setAmount={setAmount}
      setAmountUSDT={setAmountUSDT}
      callGetPriceTOKENinETH={callGetPriceTOKENinETH}
      setIsErrorGettingPriceTOKEN={setIsErrorGettingPriceTOKEN}
      setFreezeForDays={setFreezeForDays}
      setFreezeForX={setFreezeForX}
      setIsInUSDT={setIsInUSDT}
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
              {amountUSDT > 0 ? (
                <div>${cutDecimals(amountUSDT, 2)}</div>
              ) : (
                <div></div>
              )}
              <div className="flex end">
                Balance:
                <span
                  className="token-balance"
                  onClick={() => {
                    setAmount(tokenBalance);
                    handleAmountUSDT(tokenBalance);
                  }}
                >
                  {cutDecimals(tokenBalance, 4)}
                </span>
              </div>
            </div>
            <div
              className={`date-slider flex space-between 
                ${
                  (isErrorGettingPriceTOKEN || priceTOKENinETH == 0) &&
                  'unavailable'
                }`}
            >
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
            <div
              className={`price-slider flex space-between 
                ${
                  (isErrorGettingPriceTOKEN || priceTOKENinETH == 0) &&
                  'unavailable'
                }`}
            >
              <div className="left">
                <div className="flex row gapped">
                  <div>
                    Hold until {freezeForX}X in {isInUSDT ? 'USDT' : 'ETH'}
                  </div>
                  {tokenName !== 'ETH' &&
                    priceTOKENinETH * priceETHinUSD > 0.000001 && (
                      <button
                        className="mini"
                        onClick={() => setIsInUSDT(!isInUSDT)}
                      >
                        in {isInUSDT ? 'ETH' : 'USDT'}?
                      </button>
                    )}
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
                <div className="flex row">
                  {tokenName === 'ETH' ? (
                    <div>{cutDecimals(priceETHinUSD * freezeForX, 2)}</div>
                  ) : (
                    <>
                      {priceTOKENinETH ? (
                        <div>
                          {isInUSDT
                            ? cutLongZeroNumber(
                                priceTOKENinETH * priceETHinUSD * freezeForX,
                              )
                            : cutLongZeroNumber(priceTOKENinETH * freezeForX)}
                        </div>
                      ) : (
                        <div>...</div>
                      )}
                    </>
                  )}
                  &nbsp;
                  {tokenName === 'ETH' ? 'USDT' : isInUSDT ? 'USDT' : 'ETH'}/
                  {tokenName === 'ETH' ? 'ETH' : tokenSymbol}
                </div>
              </div>
              <div className="right">
                <input
                  type="number"
                  autoComplete="off"
                  placeholder="100"
                  value={freezeForX}
                  onChange={handleX}
                />
                <div>X&apos;s</div>
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
          {amount > 0 &&
            amount <= tokenBalance &&
            priceTOKENinETH !== 0 &&
            !isErrorGettingPriceTOKEN && (
              <div className="result-info flex column">
                {refcode && (
                  <div className="flex space-between">
                    <div>Discount</div>
                    <div>{refcode} -20%</div>
                  </div>
                )}
                <div className="flex space-between">
                  <div>Fee</div>
                  <div className="flex row gapped">
                    {refcode && (
                      <div>
                        <s>
                          {fee * 0.8 >= 0.0001
                            ? cutDecimals(fee * 0.8, 4)
                            : '<0.0001'}
                          &nbsp;
                          {chainId === 56 ? 'BNB' : 'ETH'}
                        </s>
                      </div>
                    )}
                    <div>
                      ≈{fee >= 0.0001 ? cutDecimals(fee, 4) : '<0.0001'}
                      &nbsp;
                      {chainId === 56 ? 'BNB' : 'ETH'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          <div className="form flex column">
            <div className="buttons flex space-between gapped">
              {isErrorGettingPriceTOKEN || priceTOKENinETH == 0 ? (
                <button disabled>Insufficient liquidity (V2)</button>
              ) : (
                <>
                  {!amount && <button disabled>Enter an amount</button>}
                  {amount > tokenBalance && (
                    <button disabled>Insufficient {tokenSymbol} balance</button>
                  )}
                  {amount <= tokenBalance && amount > 0 && (
                    <>
                      {tokenName !== 'ETH' && <button>Approve</button>}
                      <button disabled>Hold</button>
                    </>
                  )}
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
