'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useScreenWidth } from '../hooks/useScreenWidth';
import {
  useWeb3Modal,
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from '@web3modal/ethers5/react';
import { getEtherBalance } from '@/calls/getEtherBalance';
import { getTokenPriceV2 } from '@/calls/getTokenPriceV2';
import { checkSpendingApproval } from '@/calls/checkSpendingApproval';
import { setSpendingApproval } from '@/calls/setSpendingApproval';
import { getRefAddressByRefCode } from '@/calls/getRefAddressByRefCode';
import { USD } from '@/data/USD';
import cutDecimals from '@/utils/cutDecimals';
import cutLongZeroNumber from '@/utils/cutLongZeroNumber';
import PickTokenModal from '../components/PickTokenModal';
import { symbolUSD } from '@/utils/symbolUSD';
import { formatDate } from '@/utils/formatDate';
import addDaysToDate from '@/utils/addDaysToDate';
import { fees } from '../../../fees';
import { chainCurrency } from '@/utils/chainCurrency';
import ConfirmDepositModal from '../components/ConfirmDepositModal';
import { LoadingComponent } from '../components/LoadingComponent';
import { decimalsUSD } from '@/utils/decimalsUSD';
import WaitingTxModal from '@/app/components/WaitingTxModal';

export default function Hold() {
  const screenWidth = useScreenWidth();
  const { open } = useWeb3Modal();
  const { walletProvider } = useWeb3ModalProvider();
  const { address, chainId } = useWeb3ModalAccount();

  const [isLoaded, setIsLoaded] = useState(false);
  const [depositType, setDepositType] = useState('Price');
  const [tokenAddress, setTokenAddress] = useState(null);
  const [tokenName, setTokenName] = useState('ETH');
  const [tokenSymbol, setTokenSymbol] = useState('ETH');
  const [tokenDecimals, setTokenDecimals] = useState(undefined);
  const [etherBalance, setEtherBalance] = useState(undefined);
  const [tokenBalance, setTokenBalance] = useState(undefined);
  const [amount, setAmount] = useState('');
  const [amountApproved, setAmountApproved] = useState(0);
  const [amountUSD, setAmountUSD] = useState(0);
  const [priceETHinUSD, setPriceETHinUSD] = useState(0);
  const [priceTOKENinETH, setPriceTOKENinETH] = useState(undefined);
  const [isErrorGettingPriceTOKEN, setIsErrorGettingPriceTOKEN] =
    useState(false);
  const [freezeForDays, setFreezeForDays] = useState(0);
  const [limitDays, setLimitDays] = useState(1825);
  const [unfreezeDate, setUnfreezeDate] = useState(new Date());
  const [freezeForX, setFreezeForX] = useState(1);
  const [isInUSD, setIsInUSD] = useState(true);
  const [limitX, setLimitX] = useState(100);
  const [refcode, setRefcode] = useState('');
  const [isValidRefCode, setIsValidRefCode] = useState(false);
  const [fee, setFee] = useState(undefined);

  const zeroAddress = '0x0000000000000000000000000000000000000000';
  const hintText = 'Confirm approval amount';

  const [isPickTokenModalVisible, setIsPickTokenModalVisible] = useState(false);
  const [isWaitingTxModalVisible, setIsWaitingTxModalVisible] = useState(false);
  const [isConfirmDepositModalVisible, setIsConfirmDepositModalVisible] =
    useState(false);

  useEffect(() => {
    setIsLoaded(false);
    if (address && chainId) {
      setTokenName(chainCurrency[chainId]);
      setTokenSymbol(chainCurrency[chainId]); // default token is ether
      const refcode = localStorage.getItem('refcode')?.toUpperCase();
      setRefcode(refcode);
      callGetRefAddressByRefCode(refcode);
      callGetEtherBalance();
      callGetPriceETHinUSD();
    }
    setIsLoaded(true);
  }, [address, chainId]);

  const callGetEtherBalance = async () => {
    const etherBalance = await getEtherBalance(walletProvider, address);
    setEtherBalance(etherBalance);
    setTokenBalance(etherBalance); // default token is ether
  };

  const callGetPriceETHinUSD = async () => {
    const dollarToEtherPrice = await getTokenPriceV2(
      chainId,
      walletProvider,
      USD[chainId],
      decimalsUSD[chainId],
      1, // 1 USD
      true,
    );
    // 1 / 0.000258740411587277 WETH = 3864.87 USD/WETH
    setPriceETHinUSD(1 / dollarToEtherPrice);
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

  const callCheckSpendingApproval = async (token, decimals, from) => {
    const amount = await checkSpendingApproval(
      chainId,
      walletProvider,
      token,
      decimals,
      from,
    );
    setAmountApproved(amount);
  };

  const callSetSpendingApproval = async () => {
    handleShowWaitingTxModal(true);
    const isApproved = await setSpendingApproval(
      chainId,
      walletProvider,
      tokenAddress,
    );
    callCheckSpendingApproval(tokenAddress, tokenDecimals, address);
    handleShowWaitingTxModal(false);
  };

  const callGetRefAddressByRefCode = async (refcode) => {
    const referrerAddress = await getRefAddressByRefCode(
      chainId,
      walletProvider,
      refcode,
    );
    const isExist = referrerAddress !== zeroAddress;
    isExist && setIsValidRefCode(true);
  };

  const handleAmount = (e) => {
    const inputAmount = parseFloat(e.target.value);
    if (inputAmount >= 0) {
      setAmount(inputAmount);
      handleAmountUSD(inputAmount);
      calcFee(inputAmount);
    } else {
      setAmount('');
      setAmountUSD(0);
    }
  };

  const handleAmountUSD = (inputAmount) => {
    tokenName === chainCurrency[chainId] &&
      setAmountUSD(inputAmount * priceETHinUSD);
    tokenAddress && setAmountUSD(inputAmount * priceTOKENinETH * priceETHinUSD);
  };

  const calcFee = (inputAmount) => {
    tokenName === chainCurrency[chainId] &&
      setFee((inputAmount * fees.deposit) / 100);
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
    let inputX = parseFloat(e.target.value);

    if (inputX < 10) {
      inputX = parseFloat(inputX.toFixed(2));
    } else if (inputX < 100) {
      inputX = parseFloat(inputX.toFixed(1));
    } else {
      inputX = Math.round(inputX);
    }

    setFreezeForX(inputX);
  };

  const handleDepositTypeTab = (typeString) => {
    setFreezeForDays(0);
    setUnfreezeDate(new Date());
    setFreezeForX(1);
    setDepositType(typeString);
  };

  const handleShowPickTokenModal = (boolean) => {
    setIsPickTokenModalVisible(boolean);
  };

  const handleShowWaitingTxModal = (boolean) => {
    setIsWaitingTxModalVisible(boolean);
  };

  const handleShowConfirmDepositModal = (boolean) => {
    setIsConfirmDepositModalVisible(boolean);
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
      setAmountUSD={setAmountUSD}
      callCheckSpendingApproval={callCheckSpendingApproval}
      callGetPriceTOKENinETH={callGetPriceTOKENinETH}
      setIsErrorGettingPriceTOKEN={setIsErrorGettingPriceTOKEN}
      setFreezeForDays={setFreezeForDays}
      setFreezeForX={setFreezeForX}
      setIsInUSD={setIsInUSD}
    />,
    <WaitingTxModal
      key="default"
      isWaitingTxModalVisible={isWaitingTxModalVisible}
      handleShowWaitingTxModal={handleShowWaitingTxModal}
      hintText={hintText}
    />,
    <ConfirmDepositModal
      key="default"
      isConfirmDepositModalVisible={isConfirmDepositModalVisible}
      handleShowConfirmDepositModal={handleShowConfirmDepositModal}
      depositType={depositType}
      tokenAddress={tokenAddress}
      tokenName={tokenName}
      tokenSymbol={tokenSymbol}
      tokenDecimals={tokenDecimals}
      tokenBalance={tokenBalance}
      etherBalance={etherBalance}
      amount={amount}
      amountUSD={amountUSD}
      priceETHinUSD={priceETHinUSD}
      priceTOKENinETH={priceTOKENinETH}
      freezeForDays={freezeForDays}
      unfreezeDate={unfreezeDate}
      freezeForX={freezeForX}
      isInUSD={isInUSD}
      refcode={refcode}
      isValidRefCode={isValidRefCode}
    />,
  ];

  return (
    <>
      {isPickTokenModalVisible && <>{modals[1]}</>}
      {isWaitingTxModalVisible && <>{modals[2]}</>}
      {isConfirmDepositModalVisible && <>{modals[3]}</>}
      {isLoaded ? (
        <div className="hold flex column center">
          <div className="holding-types flex row gapped">
            <button
              className={`deposit-tab flex center-baseline ${
                depositType === 'Price' && 'active'
              }`}
              onClick={() => handleDepositTypeTab('Price')}
            >
              <Image
                src={`/img/icons/chart.svg`}
                width={17}
                height={17}
                alt=""
              />
              {screenWidth <= 768 ? 'Price' : 'Until price'}
            </button>
            <button
              className={`deposit-tab flex center-baseline ${
                depositType === 'Date' && 'active'
              }`}
              onClick={() => handleDepositTypeTab('Date')}
            >
              <Image
                src={`/img/icons/clock.svg`}
                width={17}
                height={17}
                alt=""
              />
              {screenWidth <= 768 ? 'Date' : 'Until date'}
            </button>
            <button
              className={`deposit-tab flex center-baseline ${
                depositType === 'DateOrPrice' && 'active'
              }`}
              onClick={() => handleDepositTypeTab('DateOrPrice')}
            >
              <Image
                src={`/img/icons/clock.svg`}
                width={17}
                height={17}
                alt=""
              />
              <Image
                src={`/img/icons/chart.svg`}
                width={17}
                height={17}
                alt=""
              />
              {screenWidth <= 768 ? 'Date or price' : 'Until date or price'}
            </button>
          </div>
          <div className="form flex column">
            <div>Amount</div>
            <div className="pick-tokens flex space-between">
              <div className="left">
                <div className="token-amount">
                  <input
                    className="amount"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    autoComplete="off"
                    placeholder="0"
                    value={amount}
                    onChange={handleAmount}
                  />
                </div>
              </div>
              <div className="right flex center-baseline">
                <div className="token-address flex end">
                  <button
                    className="pick-token flex row center-baseline"
                    onClick={() =>
                      setIsPickTokenModalVisible(!isPickTokenModalVisible)
                    }
                    disabled={!address}
                  >
                    {tokenSymbol}
                    <Image
                      src={`/img/icons/arrow-down-black.svg`}
                      width={20}
                      height={20}
                      alt=""
                    />
                  </button>
                </div>
              </div>
            </div>
            <div className="usd-price flex space-between">
              {amountUSD > 0 ? (
                <div>${cutLongZeroNumber(amountUSD)}</div>
              ) : (
                <div></div>
              )}
              <div className="flex end">
                Balance:
                <span
                  className="token-balance"
                  onClick={() => {
                    setAmount(tokenBalance);
                    handleAmountUSD(tokenBalance);
                  }}
                >
                  {cutDecimals(tokenBalance, 4)}
                </span>
              </div>
            </div>
          </div>
          <div className="form flex column">
            {depositType !== 'Price' && (
              <div
                className={`date-slider flex space-between 
                ${
                  (isErrorGettingPriceTOKEN || priceTOKENinETH == 0) &&
                  'unavailable'
                }`}
              >
                <div className="left flex column gapped">
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
                  <div className="flex end">
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
                <div className="right flex column gapped-mini">
                  <input
                    className="white-input"
                    type="number"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="12"
                    value={freezeForDays}
                    onChange={handleDays}
                  />
                  <div className="flex end">days</div>
                </div>
              </div>
            )}
            {depositType === 'DateOrPrice' && (
              <div className="or-line flex space-between center-baseline">
                <div className="horizontal-line divided"></div>
                <div className="or">OR</div>
                <div className="horizontal-line divided"></div>
              </div>
            )}
            {depositType !== 'Date' && (
              <div
                className={`price-slider flex space-between 
                ${
                  (isErrorGettingPriceTOKEN || priceTOKENinETH == 0) &&
                  'unavailable'
                }`}
              >
                <div className="left flex column gapped">
                  <div className="flex row gapped-mini center-baseline">
                    <div>
                      Hold until {freezeForX ? freezeForX : '?'}X in{' '}
                      {isInUSD ? symbolUSD[chainId] : chainCurrency[chainId]}
                    </div>
                    {tokenName !== chainCurrency[chainId] &&
                      priceTOKENinETH * priceETHinUSD > 0.000001 && (
                        <button
                          className="mini"
                          onClick={() => setIsInUSD(!isInUSD)}
                        >
                          in{' '}
                          {isInUSD
                            ? chainCurrency[chainId]
                            : symbolUSD[chainId]}
                          ?
                        </button>
                      )}
                  </div>
                  <input
                    type="range"
                    id="slider"
                    name="slider"
                    min="1.01"
                    max={limitX + 0.1}
                    step="0.1"
                    value={freezeForX}
                    onChange={handleX}
                  />
                  <div className="flex row space-between">
                    <div className="flex row">
                      {tokenName === chainCurrency[chainId] ? (
                        <div>{cutDecimals(priceETHinUSD * freezeForX, 2)}</div>
                      ) : (
                        <>
                          {priceTOKENinETH ? (
                            <div>
                              {isInUSD
                                ? cutLongZeroNumber(
                                    priceTOKENinETH *
                                      priceETHinUSD *
                                      freezeForX,
                                  )
                                : cutLongZeroNumber(
                                    priceTOKENinETH * freezeForX,
                                  )}
                            </div>
                          ) : (
                            <div>...</div>
                          )}
                        </>
                      )}
                      &nbsp;
                      {tokenName === 'ETH'
                        ? symbolUSD[chainId]
                        : isInUSD
                        ? symbolUSD[chainId]
                        : chainCurrency[chainId]}
                      /
                      {tokenName === 'ETH'
                        ? chainCurrency[chainId]
                        : tokenSymbol}
                    </div>
                    <div>
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
                <div className="right flex column gapped-mini">
                  <input
                    className="white-input flex end"
                    type="number"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="100"
                    value={freezeForX}
                    onChange={handleX}
                  />
                  <div className="flex end">X&apos;s</div>
                </div>
              </div>
            )}
          </div>
          {amount > 0 &&
            amount <= tokenBalance &&
            priceTOKENinETH !== 0 &&
            !isErrorGettingPriceTOKEN && (
              <div className="result-info flex column gapped-mini">
                {isValidRefCode && (
                  <div className="flex space-between">
                    <div>Discount</div>
                    <div>{refcode} -20%</div>
                  </div>
                )}
                <div className="fee flex space-between">
                  <div>Fee</div>
                  <div className="flex row gapped">
                    {refcode && (
                      <div>
                        <s>
                          {fee * 0.8 >= 0.0001
                            ? cutDecimals(fee * 0.8, 4)
                            : '<0.0001'}
                          &nbsp;
                          {chainCurrency[chainId]}
                        </s>
                      </div>
                    )}
                    <div>
                      ≈{fee >= 0.0001 ? cutDecimals(fee, 4) : '<0.0001'}
                      &nbsp;
                      {chainCurrency[chainId]}
                    </div>
                  </div>
                </div>
              </div>
            )}
          <div className="buttons flex space-between">
            {isErrorGettingPriceTOKEN || priceTOKENinETH == 0 ? (
              <button disabled>Insufficient liquidity (V2)</button>
            ) : (
              <>
                {!address ? (
                  <button onClick={() => open()}>Connect wallet</button>
                ) : (
                  <>
                    {(!amount ||
                      amount > tokenBalance ||
                      (depositType === 'DateOrPrice' &&
                        (freezeForX < 1.01 || freezeForDays < 1)) ||
                      (depositType === 'Date' && freezeForDays < 1) ||
                      (depositType === 'Price' && freezeForX < 1.01)) && (
                      <button disabled>
                        {!amount
                          ? 'Enter an amount'
                          : amount > tokenBalance
                          ? `Insufficient ${tokenSymbol} balance`
                          : 'Set holding goal'}
                      </button>
                    )}
                    {amount <= tokenBalance &&
                      amount > 0 &&
                      ((depositType === 'DateOrPrice' &&
                        freezeForX >= 1.01 &&
                        freezeForDays >= 1) ||
                        (depositType === 'Date' && freezeForDays >= 1) ||
                        (depositType === 'Price' && freezeForX >= 1.01)) && (
                        <>
                          {tokenName !== chainCurrency[chainId] &&
                            amount > amountApproved && (
                              <button onClick={() => callSetSpendingApproval()}>
                                Approve
                              </button>
                            )}
                          <button
                            disabled={
                              tokenName !== chainCurrency[chainId] &&
                              amount > amountApproved
                            }
                            onClick={() => {
                              setIsConfirmDepositModalVisible(
                                !isConfirmDepositModalVisible,
                              );
                            }}
                          >
                            Hold
                          </button>
                        </>
                      )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <LoadingComponent />
      )}
    </>
  );
}
