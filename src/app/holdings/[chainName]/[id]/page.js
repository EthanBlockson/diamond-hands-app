'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import {
  useWeb3Modal,
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from '@web3modal/ethers5/react';
import { nameToChainId } from '@/utils/nameToChainId';
import { getHoldingInfo } from '@/calls/getHoldingInfo';
import capitalizeFirstLetter from '@/utils/capitalizeFirstLetter';
import { shortenAddress } from '@/utils/shortenAddress';
import { formatDate } from '@/utils/formatDate';
import { percentDifference } from '@/utils/percentDifference';
import cutLongZeroNumber from '@/utils/cutLongZeroNumber';
import cutDecimals from '@/utils/cutDecimals';
import { getTokenPriceV2 } from '@/calls/getTokenPriceV2';
import { USD } from '@/data/USD';
import { symbolUSD } from '@/utils/symbolUSD';
import { decimalsUSD } from '@/utils/decimalsUSD';
import { chainCurrency } from '@/utils/chainCurrency';
import { getServiceFee } from '@/calls/getServiceFee';
import { getEtherBalance } from '@/calls/getEtherBalance';
import { withdrawHoldingToken } from '@/calls/withdrawHoldingToken';
import { withdrawHoldingEther } from '@/calls/withdrawHoldingEther';
import toast from 'react-hot-toast';
import { chainIdToNameLowerCase } from '@/utils/chainIdToNameLowerCase';
import { LoadingComponent } from '@/app/components/LoadingComponent';
import WaitingTxModal from '@/app/components/WaitingTxModal';

export default function HoldingsById({ params }) {
  const { chainName, id } = params;
  const { walletProvider } = useWeb3ModalProvider();
  const { address, chainId } = useWeb3ModalAccount();
  const { open } = useWeb3Modal();

  const [isLoaded, setIsLoaded] = useState(false);
  const [isNetworkMatch, setIsNetworkMatch] = useState(true);
  const [holdingInfo, setHoldingInfo] = useState(undefined);
  const [holdingType, setHoldingType] = useState(undefined);
  // 0) only until date any coin, 1) ether until price, 2) token until weth price, 3) token until usd price
  const [dateProgress, setDateProgress] = useState(undefined);
  const [priceETHinUSD, setPriceETHinUSD] = useState(0);
  const [priceTOKENinETH, setPriceTOKENinETH] = useState(undefined);
  const [priceProgress, setPriceProgress] = useState(undefined);
  const [isAbleToClaim, setIsAbleToClaim] = useState(false);
  const [withdrawalFee, setWithdrawalFee] = useState(undefined);
  const [etherBalance, setEtherBalance] = useState(undefined);
  const [isNoHoldings, setIsNoHoldings] = useState(false);

  const zeroAddress = '0x0000000000000000000000000000000000000000';
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const hintText = 'Confirm withdrawal';

  const [isWaitingTxModalVisible, setIsWaitingTxModalVisible] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    if (address && chainId) {
      const chainIdFromLink = nameToChainId[chainName];
      chainIdFromLink !== chainId
        ? setIsNetworkMatch(false)
        : setIsNetworkMatch(true);
      multiCallGetHoldingInfo();
    }
    setIsLoaded(true);
  }, [address && chainId]);

  const multiCallGetHoldingInfo = async () => {
    const fetchedHoldingInfo = await getHoldingInfo(
      chainId,
      walletProvider,
      id,
      address,
    );

    if (!fetchedHoldingInfo || fetchedHoldingInfo.amount === 0) {
      setIsNoHoldings(true);
      return;
    } else if (fetchedHoldingInfo.amount > 0) {
      setHoldingInfo(fetchedHoldingInfo);
    }

    const etherDollarPrice = await callGetPriceETHinUSD();

    if (
      fetchedHoldingInfo.isPureEther &&
      fetchedHoldingInfo.holdAtPriceInWETH
    ) {
      setHoldingType(1);
      setPriceProgress(
        100 - // price growing in this case is reverse progress
          percentDifference(
            fetchedHoldingInfo.holdUntilPriceInWETH,
            fetchedHoldingInfo.holdAtPriceInWETH,
            1 / etherDollarPrice,
          ),
      );
      if (1 / etherDollarPrice < fetchedHoldingInfo.holdUntilPriceInWETH)
        await handleTokenAbleToClaim(
          fetchedHoldingInfo.token,
          fetchedHoldingInfo.amount,
          18,
          2,
        );
    }

    if (
      fetchedHoldingInfo.isPureEther &&
      fetchedHoldingInfo.holdUntilTimestamp
    ) {
      setHoldingType(0);
      setDateProgress(
        percentDifference(
          fetchedHoldingInfo.holdAtTimestamp,
          fetchedHoldingInfo.holdUntilTimestamp,
          currentTimestamp,
        ),
      );
      if (currentTimestamp > fetchedHoldingInfo.holdUntilTimestamp) {
        await handleTokenAbleToClaim(
          fetchedHoldingInfo.token,
          fetchedHoldingInfo.amount,
          18,
          2,
        );
      }
    }

    if (fetchedHoldingInfo.token !== zeroAddress) {
      const { tokenEtherPrice } = await fetchTokenPrice(
        fetchedHoldingInfo.token,
        fetchedHoldingInfo.decimals,
      );

      if (fetchedHoldingInfo.holdAtPriceInWETH) {
        setHoldingType(2);
        setPriceProgress(
          percentDifference(
            fetchedHoldingInfo.holdAtPriceInWETH,
            fetchedHoldingInfo.holdUntilPriceInWETH,
            tokenEtherPrice,
          ),
        );
        if (tokenEtherPrice > fetchedHoldingInfo.holdUntilPriceInWETH) {
          await handleTokenAbleToClaim(
            fetchedHoldingInfo.token,
            fetchedHoldingInfo.amount,
            fetchedHoldingInfo.decimals,
            4,
          );
        }
      }

      if (fetchedHoldingInfo.holdAtPriceInUSD) {
        setHoldingType(3);
        setPriceProgress(
          percentDifference(
            fetchedHoldingInfo.holdAtPriceInUSD,
            fetchedHoldingInfo.holdUntilPriceInUSD,
            tokenEtherPrice * etherDollarPrice,
          ),
        );
        if (
          tokenEtherPrice * etherDollarPrice >
          fetchedHoldingInfo.holdUntilPriceInUSD
        ) {
          await handleTokenAbleToClaim(
            fetchedHoldingInfo.token,
            fetchedHoldingInfo.amount,
            fetchedHoldingInfo.decimals,
            4,
          );
        }
      }

      if (fetchedHoldingInfo.holdUntilTimestamp) {
        setHoldingType(0);
        setDateProgress(
          percentDifference(
            fetchedHoldingInfo.holdAtTimestamp,
            fetchedHoldingInfo.holdUntilTimestamp,
            currentTimestamp,
          ),
        );
        if (currentTimestamp > fetchedHoldingInfo.holdUntilTimestamp) {
          await handleTokenAbleToClaim(
            fetchedHoldingInfo.token,
            fetchedHoldingInfo.amount,
            fetchedHoldingInfo.decimals,
            4,
          );
        }
      }
    }
  };

  const fetchTokenPrice = async (contractAddress, decimals) => {
    const tokenEtherPrice = await callGetPriceTOKENinETH(
      contractAddress,
      decimals,
    );
    return { tokenEtherPrice };
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
    return 1 / dollarToEtherPrice;
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
    return tokenEtherPrice;
  };

  const callGetServiceFee = async (token, amount, decimals, path) => {
    const serviceFee = await getServiceFee(
      path,
      chainId,
      walletProvider,
      token,
      amount,
      decimals,
    );
    return serviceFee;
  };

  const callGetEtherBalance = async () => {
    const etherBalance = await getEtherBalance(walletProvider, address);
    setEtherBalance(etherBalance);
  };

  const handleTokenAbleToClaim = async (token, amount, decimals, path) => {
    await callGetEtherBalance();
    const fee = await callGetServiceFee(token, amount, decimals, path);
    setWithdrawalFee(fee);
    setIsAbleToClaim(true);
  };

  const callWithdrawHoldingEther = async () => {
    handleShowWaitingTxModal(true);
    const tx = await withdrawHoldingEther(
      chainId,
      walletProvider,
      id,
      withdrawalFee,
    );
    if (tx) {
      multiCallGetHoldingInfo();
      toast.success(`${chainCurrency[chainId]} withdrawn successfully!`);
    } else {
      toast.error(
        `Error trying to withdrawn ${chainCurrency[chainId]} from holding`,
      );
    }
    handleShowWaitingTxModal(false);
  };

  const callWithdrawHoldingToken = async () => {
    handleShowWaitingTxModal(true);
    const tx = await withdrawHoldingToken(
      chainId,
      walletProvider,
      id,
      withdrawalFee,
      holdingInfo.decimals,
    );
    if (tx) {
      multiCallGetHoldingInfo();
      toast.success('Tokens withdrawn successfully!');
    } else {
      toast.error('Error trying to withdraw tokens from holding');
    }
    handleShowWaitingTxModal(false);
  };

  const openNetworkSwitch = () => {
    open({ view: 'Networks' });
  };

  const TickerPair = () => {
    return holdingInfo.isPureEther
      ? `${symbolUSD[chainId]}/${chainCurrency[chainId]}`
      : holdingInfo.holdUntilPriceInWETH
      ? `${chainCurrency[chainId]}/${
          holdingInfo?.symbol ? holdingInfo.symbol : '...'
        }`
      : holdingInfo.holdUntilPriceInUSD
      ? `${symbolUSD[chainId]}/${
          holdingInfo?.symbol ? holdingInfo.symbol : '...'
        }`
      : null;
  };

  const ToDateBlock = () => {
    return (
      <>
        {holdingInfo.isActive ? (
          <div className="progress flex column gapped">
            <div className="flex center text">
              <div className="progress-header flex row center-baseline gapped-mini">
                <Image
                  src={`/img/icons/clock.svg`}
                  width={17}
                  height={17}
                  alt=""
                />
                Until date {formatDate(holdingInfo.holdUntilTimestamp, true)}
              </div>
            </div>
            <div className="progress-bar date">
              <div
                className="elapsed date"
                style={{
                  width: `${dateProgress ? dateProgress : 0}%`,
                }}
              ></div>
            </div>
          </div>
        ) : null}
      </>
    );
  };

  const ToPriceBlock = () => {
    return (
      <>
        {holdingInfo.isActive ? (
          <div className="progress flex column gapped">
            <div className="flex space-between">
              <div style={{ width: '17px' }}></div>
              <div className="progress-header flex row center center-baseline gapped-mini">
                <Image
                  src={`/img/icons/chart.svg`}
                  width={17}
                  height={17}
                  alt=""
                />
                Until price{' '}
                {holdingInfo.isPureEther
                  ? cutDecimals(1 / holdingInfo.holdUntilPriceInWETH, 2)
                  : holdingInfo.holdUntilPriceInWETH
                  ? cutLongZeroNumber(holdingInfo.holdUntilPriceInWETH)
                  : holdingInfo.holdUntilPriceInUSD
                  ? cutLongZeroNumber(holdingInfo.holdUntilPriceInUSD)
                  : null}{' '}
                <TickerPair />
              </div>
              <div className="tooltip">
                <Image
                  src={`/img/icons/info.svg`}
                  width={21}
                  height={21}
                  alt=""
                />
                <div className="tooltiptext">
                  <div className="flex column gapped-mini">
                    <b>Current price</b>
                    {holdingInfo.isPureEther
                      ? cutDecimals(priceETHinUSD, 2)
                      : holdingInfo.holdUntilPriceInWETH
                      ? cutLongZeroNumber(priceTOKENinETH)
                      : holdingInfo.holdUntilPriceInUSD
                      ? cutLongZeroNumber(priceTOKENinETH * priceETHinUSD)
                      : null}{' '}
                    <TickerPair />
                  </div>
                  <br />
                  <div className="flex column gapped-mini">
                    <b>Started at</b>
                    {holdingInfo.isPureEther
                      ? cutDecimals(1 / holdingInfo.holdAtPriceInWETH, 2)
                      : holdingInfo.holdUntilPriceInWETH
                      ? cutLongZeroNumber(holdingInfo.holdAtPriceInWETH)
                      : holdingInfo.holdUntilPriceInUSD
                      ? cutLongZeroNumber(holdingInfo.holdAtPriceInUSD)
                      : null}{' '}
                    <TickerPair />
                  </div>
                </div>
              </div>
            </div>
            <div className="progress-bar price">
              <div
                className="elapsed price"
                style={{
                  width: `${priceProgress ? priceProgress : 0}%`,
                }}
              ></div>
            </div>
          </div>
        ) : null}
      </>
    );
  };

  const FinalizedToDateBlock = () => {
    return (
      <div className="flex center text bold">
        From {formatDate(holdingInfo.holdAtTimestamp, true)}, to{' '}
        {formatDate(holdingInfo.holdUntilTimestamp, true)}
      </div>
    );
  };

  const FinalizedToPriceBlock = () => {
    return (
      <div className="flex center text bold">
        <div>
          From{' '}
          {holdingInfo.isPureEther
            ? cutDecimals(1 / holdingInfo.holdAtPriceInWETH, 2)
            : holdingInfo.holdUntilPriceInWETH
            ? cutLongZeroNumber(holdingInfo.holdAtPriceInWETH)
            : holdingInfo.holdUntilPriceInUSD
            ? cutLongZeroNumber(holdingInfo.holdAtPriceInUSD)
            : null}{' '}
          <TickerPair /> to{' '}
          {holdingInfo.isPureEther
            ? cutDecimals(1 / holdingInfo.holdUntilPriceInWETH, 2)
            : holdingInfo.holdUntilPriceInWETH
            ? cutLongZeroNumber(holdingInfo.holdUntilPriceInWETH)
            : holdingInfo.holdUntilPriceInUSD
            ? cutLongZeroNumber(holdingInfo.holdUntilPriceInUSD)
            : null}{' '}
          <TickerPair />
        </div>
      </div>
    );
  };

  const handleShowWaitingTxModal = (boolean) => {
    setIsWaitingTxModalVisible(boolean);
  };

  const modals = [
    null,
    <WaitingTxModal
      key="default"
      isWaitingTxModalVisible={isWaitingTxModalVisible}
      handleShowWaitingTxModal={handleShowWaitingTxModal}
      hintText={hintText}
    />,
  ];

  return (
    <>
      {isWaitingTxModalVisible && <>{modals[1]}</>}
      {isLoaded ? (
        <div className="holding flex column center">
          <h1>Holdings explorer</h1>
          {isNetworkMatch ? (
            <>
              {holdingInfo && holdingInfo.amount > 0 ? (
                <>
                  <Link
                    href={`/holdings/${chainIdToNameLowerCase[chainId]}/address/${holdingInfo.user}`}
                    className="breadcrumb"
                  >
                    ← Back to{' '}
                    {holdingInfo.user === address
                      ? 'my holdings'
                      : `holdings of ${shortenAddress(holdingInfo.user)}`}
                  </Link>
                  <div className="form wide flex column">
                    <div className="flex space-between">
                      <div className="id"># {id}</div>
                      <div className="chain-logo">
                        <Image
                          src={`/img/chains/${chainId}.svg`}
                          width={35}
                          height={35}
                          alt=""
                        />
                      </div>
                    </div>
                    <div className="flex column center">
                      <div className="token-amount">
                        {cutDecimals(holdingInfo.amount, 4)}
                      </div>
                      <Link
                        href={
                          holdingInfo.token !== zeroAddress
                            ? `https://dexscreener.com/search?q=${holdingInfo.token}`
                            : `https://ethereum.org`
                        }
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                      >
                        <div className="token-name colored-hover">
                          {holdingInfo.isPureEther
                            ? chainCurrency[chainId]
                            : holdingInfo
                            ? `${holdingInfo.symbol} (${holdingInfo.name})`
                            : '...'}
                        </div>
                      </Link>
                    </div>

                    {holdingInfo.isActive && (
                      <div className="active-progress flex column gapped">
                        {holdingInfo.holdUntilTimestamp ? (
                          <ToDateBlock />
                        ) : null}
                        {holdingInfo.holdUntilTimestamp &&
                        (holdingInfo.holdUntilPriceInWETH ||
                          holdingInfo.holdUntilPriceInUSD) ? (
                          <div className="or-line flex space-between center-baseline">
                            <div className="horizontal-line divided"></div>
                            <div className="or">OR</div>
                            <div className="horizontal-line divided"></div>
                          </div>
                        ) : null}
                        {holdingInfo.holdUntilPriceInWETH ||
                        holdingInfo.holdUntilPriceInUSD ? (
                          <ToPriceBlock />
                        ) : null}
                      </div>
                    )}

                    {!holdingInfo.isActive && (
                      <div className="finalized flex column  gapped">
                        <div className="finalized-head flex column center gapped">
                          <Image
                            src={`/img/brand/hand.png`}
                            width={35}
                            height={35}
                            alt=""
                          />
                          Diamond handed
                        </div>
                        {holdingInfo.holdUntilTimestamp ? (
                          <FinalizedToDateBlock />
                        ) : null}
                        {holdingInfo.holdUntilTimestamp &&
                        (holdingInfo.holdUntilPriceInWETH ||
                          holdingInfo.holdUntilPriceInUSD) ? (
                          <div className="or-line flex space-between center-baseline">
                            <div className="horizontal-line divided blue"></div>
                            <div className="or">OR</div>
                            <div className="horizontal-line divided blue"></div>
                          </div>
                        ) : null}
                        {holdingInfo.holdUntilPriceInWETH ||
                        holdingInfo.holdUntilPriceInUSD ? (
                          <FinalizedToPriceBlock />
                        ) : null}
                      </div>
                    )}

                    <div className="low-opacity micro-text flex center">
                      Started at {formatDate(holdingInfo.holdAtTimestamp, true)}{' '}
                      by {shortenAddress(holdingInfo.user)}
                    </div>
                  </div>

                  {holdingInfo.isActive &&
                    holdingInfo.user === address &&
                    withdrawalFee !== undefined &&
                    isAbleToClaim && (
                      <div className="result-info flex column">
                        <div className="flex space-between">
                          <div>Fee</div>
                          <div className="fee-amount">
                            {cutDecimals(withdrawalFee, 4)}{' '}
                            {chainCurrency[chainId]}
                          </div>
                        </div>
                      </div>
                    )}

                  {!isAbleToClaim && holdingInfo.user === address && (
                    <div className="buttons flex">
                      <button disabled>On hold</button>
                    </div>
                  )}

                  {holdingInfo.isActive &&
                    holdingInfo.user === address &&
                    withdrawalFee !== undefined &&
                    etherBalance && (
                      <div className="buttons flex">
                        <button
                          disabled={!isAbleToClaim}
                          onClick={() => {
                            holdingInfo.isPureEther
                              ? callWithdrawHoldingEther()
                              : callWithdrawHoldingToken();
                          }}
                        >
                          {isAbleToClaim
                            ? etherBalance >= withdrawalFee
                              ? 'Withdraw'
                              : `Insufficient ${chainCurrency[chainId]} balance`
                            : 'Waiting for target'}
                        </button>
                      </div>
                    )}
                </>
              ) : (
                <>
                  {isNoHoldings ? (
                    <div className="empty flex column center text gapped">
                      <Image
                        src={`/img/chains/${chainId}.svg`}
                        width={80}
                        height={80}
                        alt=""
                      />
                      <div>
                        No holding with id <span>#{id}</span> found in{' '}
                        {capitalizeFirstLetter(chainName)} network
                      </div>
                    </div>
                  ) : (
                    <LoadingComponent />
                  )}
                </>
              )}
            </>
          ) : (
            <div className="unmatched network flex column center text gapped">
              <Image src={`/img/chains/0.svg`} width={80} height={80} alt="" />
              <div>Your wallet is connected to different network</div>
              <div>
                Please, switch network to{' '}
                <b>{capitalizeFirstLetter(chainName)}</b>
              </div>
              <button className="mini" onClick={openNetworkSwitch}>
                Switch
              </button>
            </div>
          )}
        </div>
      ) : (
        <LoadingComponent />
      )}
    </>
  );
}
