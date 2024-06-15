'use client';

import { useState, useEffect } from 'react';
import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from '@web3modal/ethers5/react';
import { getEtherBalance } from '@/calls/getEtherBalance';
import { getTokenPriceV2 } from '@/calls/getTokenPriceV2';
import { checkSpendingApproval } from '@/calls/checkSpendingApproval';
import { setSpendingApproval } from '@/calls/setSpendingApproval';
import { getRefAddressByRefCode } from '@/calls/getRefAddressByRefCode';
import { USDT } from '@/data/USDT';
import cutDecimals from '@/utils/cutDecimals';
import cutLongZeroNumber from '@/utils/cutLongZeroNumber';
import PickTokenModal from '../components/PickTokenModal';
import { formatDate } from '@/utils/formatDate';
import addDaysToDate from '@/utils/addDaysToDate';
import { fees } from '../../../fees';
import { chainCurrency } from '@/utils/chainCurrency';
import ConfirmDepositModal from '../components/ConfirmDepositModal';

export default function Hold() {
  const { walletProvider } = useWeb3ModalProvider();
  const { address, chainId } = useWeb3ModalAccount();

  const [isConnected, setIsConnected] = useState(false);
  const [depositType, setDepositType] = useState('DateOrPrice');
  const [tokenAddress, setTokenAddress] = useState(null);
  const [tokenName, setTokenName] = useState('ETH');
  const [tokenSymbol, setTokenSymbol] = useState('ETH');
  const [tokenDecimals, setTokenDecimals] = useState(undefined);
  const [etherBalance, setEtherBalance] = useState(undefined);
  const [tokenBalance, setTokenBalance] = useState(undefined);
  const [amount, setAmount] = useState('');
  const [amountApproved, setAmountApproved] = useState(0);
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
  const [isValidRefCode, setIsValidRefCode] = useState(false);
  const [fee, setFee] = useState(undefined);

  const zeroAddress = '0x0000000000000000000000000000000000000000';

  const [isPickTokenModalVisible, setIsPickTokenModalVisible] = useState(false);
  const [isConfirmDepositModalVisible, setIsConfirmDepositModalVisible] =
    useState(false);

  useEffect(() => {
    if (address && chainId) {
      setTokenName(chainCurrency[chainId]);
      setTokenSymbol(chainCurrency[chainId]); // default token is ether
      const refcode = localStorage.getItem('refcode')?.toUpperCase();
      setRefcode(refcode);
      callGetRefAddressByRefCode(refcode);
      callGetEtherBalance();
      callGetPriceETHinUSD();
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
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
      USDT[chainId],
      6, // USDT decimals
      1, // 1 USDT
      true,
    );
    // 1 / 0.000258740411587277 WETH = 3864.87 USDT/WETH
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
    const isApproved = await setSpendingApproval(
      chainId,
      walletProvider,
      tokenAddress,
    );
    callCheckSpendingApproval(tokenAddress, tokenDecimals, address);
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

  // const callNewHoldingEther = async () => {
  //   const deposit = await newHoldingEther(
  //     chainId,
  //     walletProvider,
  //     amount,
  //     freezeForDays * 86400,
  //     freezeForX,
  //     refcode,
  //   );
  //   if (deposit) {
  //     toast.success('New holding has been created');
  //     router.push(
  //       `/holdings/${chainIdToNameLowerCase[chainId]}/address/${address}`,
  //     );
  //   } else {
  //     toast.error('Error trying to make new holding');
  //   }
  // };

  // const callNewHoldingToken = async () => {
  //   const deposit = await newHoldingToken(
  //     chainId,
  //     walletProvider,
  //     tokenAddress,
  //     amount,
  //     tokenDecimals,
  //     freezeForDays * 86400,
  //     freezeForX,
  //     isInUSDT,
  //     refcode,
  //   );
  //   if (deposit) {
  //     toast.success('New holding has been created');
  //     router.push(
  //       `/holdings/${chainIdToNameLowerCase[chainId]}/address/${address}`,
  //     );
  //   } else {
  //     toast.error('Error trying to make new holding');
  //   }
  // };

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
      setAmountUSDT={setAmountUSDT}
      callCheckSpendingApproval={callCheckSpendingApproval}
      callGetPriceTOKENinETH={callGetPriceTOKENinETH}
      setIsErrorGettingPriceTOKEN={setIsErrorGettingPriceTOKEN}
      setFreezeForDays={setFreezeForDays}
      setFreezeForX={setFreezeForX}
      setIsInUSDT={setIsInUSDT}
    />,
    <ConfirmDepositModal
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
      amountUSDT={amountUSDT}
      priceETHinUSD={priceETHinUSD}
      priceTOKENinETH={priceTOKENinETH}
      freezeForDays={freezeForDays}
      unfreezeDate={unfreezeDate}
      freezeForX={freezeForX}
      isInUSDT={isInUSDT}
      refcode={refcode}
      isValidRefCode={isValidRefCode}
    />,
  ];

  return (
    <>
      {isPickTokenModalVisible && <>{modals[1]}</>}
      {isConfirmDepositModalVisible && <>{modals[2]}</>}
      {isConnected ? (
        <div className="hold flex column center">
          <h1>New holding</h1>
          <div className="holding-types flex row gapped">
            <button
              disabled={depositType === 'DateOrPrice'}
              onClick={() => handleDepositTypeTab('DateOrPrice')}
            >
              Until date or price
            </button>
            <button
              disabled={depositType === 'Date'}
              onClick={() => handleDepositTypeTab('Date')}
            >
              Until date
            </button>
            <button
              disabled={depositType === 'Price'}
              onClick={() => handleDepositTypeTab('Price')}
            >
              Until price
            </button>
          </div>
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
                <div>
                  $
                  {amountUSDT < 0.0001
                    ? cutLongZeroNumber(amountUSDT)
                    : cutDecimals(amountUSDT, 2)}
                </div>
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
            {depositType !== 'Price' && (
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
            )}
            {depositType !== 'Date' && (
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
                      Hold until {freezeForX ? freezeForX : '?'}X in{' '}
                      {isInUSDT ? 'USDT' : 'ETH'}
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
                    min="1.01"
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
            )}
          </div>
          {amount > 0 &&
            amount <= tokenBalance &&
            priceTOKENinETH !== 0 &&
            !isErrorGettingPriceTOKEN && (
              <div className="result-info flex column">
                {isValidRefCode && (
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
          <div className="form flex column">
            <div className="buttons flex space-between gapped">
              {isErrorGettingPriceTOKEN || priceTOKENinETH == 0 ? (
                <button disabled>Insufficient liquidity (V2)</button>
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
                        {tokenName !== 'ETH' && amount > amountApproved && (
                          <button onClick={() => callSetSpendingApproval()}>
                            Approve
                          </button>
                        )}
                        <button
                          disabled={
                            tokenName !== 'ETH' && amount > amountApproved
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
            </div>
          </div>
        </div>
      ) : (
        <div>Waiting for wallet connection...</div>
      )}
    </>
  );
}
