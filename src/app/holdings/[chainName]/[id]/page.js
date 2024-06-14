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
import { getERC20 } from '@/calls/getERC20';
import capitalizeFirstLetter from '@/utils/capitalizeFirstLetter';
import { shortenAddress } from '@/utils/shortenAddress';
import { formatDate } from '@/utils/formatDate';
import { percentDifference } from '@/utils/percentDifference';
import cutLongZeroNumber from '@/utils/cutLongZeroNumber';
import cutDecimals from '@/utils/cutDecimals';
import { getTokenPriceV2 } from '@/calls/getTokenPriceV2';
import { USDT } from '@/data/USDT';
import { chainCurrency } from '@/utils/chainCurrency';
import { getServiceFee } from '@/calls/getServiceFee';
import { getEtherBalance } from '@/calls/getEtherBalance';
import { withdrawHoldingToken } from '@/calls/withdrawHoldingToken';
import { withdrawHoldingEther } from '@/calls/withdrawHoldingEther';
import toast from 'react-hot-toast';
import { chainIdToNameLowerCase } from '@/utils/chainIdToNameLowercase';

export default function HoldingsById({ params }) {
  const { chainName, id } = params;
  const { walletProvider } = useWeb3ModalProvider();
  const { address, chainId } = useWeb3ModalAccount();
  const { open } = useWeb3Modal();

  const [isConnected, setIsConnected] = useState(false);
  const [isNetworkMatch, setIsNetworkMatch] = useState(true);
  const [holdingInfo, setHoldingInfo] = useState(undefined);
  const [holdingTokenData, setHoldingTokenData] = useState(undefined);
  const [dateProgress, setDateProgress] = useState(undefined);
  const [priceETHinUSD, setPriceETHinUSD] = useState(0);
  const [priceTOKENinETH, setPriceTOKENinETH] = useState(undefined);
  const [priceProgress, setPriceProgress] = useState(undefined);
  const [isAbleToClaim, setIsAbleToClaim] = useState(false);
  const [withdrawalFee, setWithdrawalFee] = useState(undefined);
  const [etherBalance, setEtherBalance] = useState(undefined);

  const zeroAddress = '0x0000000000000000000000000000000000000000';
  const currentTimestamp = Math.floor(Date.now() / 1000);

  useEffect(() => {
    if (address && chainId) {
      setIsConnected(true);
      const chainIdFromLink = nameToChainId[chainName];
      chainIdFromLink !== chainId
        ? setIsNetworkMatch(false)
        : setIsNetworkMatch(true);
      multiCallGetHoldingInfo();
    } else {
      setIsConnected(false);
    }
  }, [address && chainId]);

  const multiCallGetHoldingInfo = async () => {
    const fetchedHoldingInfo = await getHoldingInfo(
      chainId,
      walletProvider,
      id,
    );

    fetchedHoldingInfo && setHoldingInfo(fetchedHoldingInfo);

    const etherDollarPrice = await callGetPriceETHinUSD();

    if (
      fetchedHoldingInfo.isPureEther &&
      fetchedHoldingInfo.holdAtPriceInWETH
    ) {
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
      const { fetchedTokenData, tokenEtherPrice } = await fetchTokenData(
        fetchedHoldingInfo.token,
      );

      if (fetchedHoldingInfo.holdAtPriceInWETH) {
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
            fetchedTokenData.decimals,
            4,
          );
        }
      }

      if (fetchedHoldingInfo.holdAtPriceInUSD) {
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
            fetchedTokenData.decimals,
            4,
          );
        }
      }

      if (fetchedHoldingInfo.holdUntilTimestamp) {
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
            fetchedTokenData.decimals,
            4,
          );
        }
      }
    }
  };

  const fetchTokenData = async (contractAddress) => {
    const fetchedTokenData = await getERC20(
      walletProvider,
      contractAddress,
      address,
    );
    if (fetchedTokenData) {
      setHoldingTokenData(fetchedTokenData);
      const tokenEtherPrice = await callGetPriceTOKENinETH(
        contractAddress,
        fetchedTokenData.decimals,
      );
      return { fetchedTokenData, tokenEtherPrice };
    } else {
      setHoldingTokenData(null);
    }
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
  };

  const callWithdrawHoldingToken = async () => {
    const tx = await withdrawHoldingToken(
      chainId,
      walletProvider,
      id,
      withdrawalFee,
      holdingTokenData.decimals,
    );
    if (tx) {
      multiCallGetHoldingInfo();
      toast.success('Tokens withdrawn successfully!');
    } else {
      toast.error('Error trying to withdraw tokens from holding');
    }
  };

  const openNetworkSwitch = () => {
    open({ view: 'Networks' });
  };

  return (
    <>
      {holdingInfo === undefined ? (
        <div>Loading...</div>
      ) : (
        <>
          {isConnected && (
            <div className="holding flex column center">
              <h1>Holdings explorer</h1>
              <Link
                href={`/holdings/${chainIdToNameLowerCase[chainId]}/address/${address}`}
                className="flex start"
              >
                ← Back to my holdings
              </Link>
              {isNetworkMatch ? (
                <>
                  {holdingInfo.amount > 0 ? (
                    <>
                      <div className="form wide flex column center">
                        <div className="chain-logo">
                          <Image
                            src={`/img/chains/${chainId}.svg`}
                            width={25}
                            height={25}
                            alt=""
                          />
                        </div>
                        <div className="flex column center">
                          <div className="token-amount">
                            {cutLongZeroNumber(holdingInfo.amount)}
                          </div>
                          <div className="token-name">
                            {holdingInfo.isPureEther
                              ? chainCurrency[chainId]
                              : holdingTokenData
                              ? `${holdingTokenData.symbol} (${holdingTokenData.name})`
                              : '...'}
                          </div>
                          <div>
                            {holdingInfo.token !== zeroAddress
                              ? shortenAddress(holdingInfo.token)
                              : null}
                          </div>
                        </div>
                        <div className="held-by low-opacity flex column center">
                          <div>held by {shortenAddress(holdingInfo.user)}</div>
                          <div>
                            at {formatDate(holdingInfo.holdAtTimestamp, true)}
                          </div>
                          <div>with id {id}</div>
                        </div>
                        {holdingInfo.isActive ? (
                          <>
                            {/* To date */}
                            {holdingInfo.holdUntilTimestamp ? (
                              <div className="progress flex column gapped">
                                <div className="flex space-between">
                                  <div>⏱️</div>
                                  <div>
                                    holding until{' '}
                                    {formatDate(
                                      holdingInfo.holdUntilTimestamp,
                                      true,
                                    )}
                                  </div>
                                </div>
                                <div className="progress-bar date">
                                  <div
                                    className="elapsed date"
                                    style={{
                                      width: `${dateProgress}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            ) : null}
                            {/* To price WETH */}
                            {holdingInfo.holdUntilPriceInWETH &&
                            holdingInfo.isPureEther == false &&
                            holdingTokenData &&
                            priceETHinUSD &&
                            priceTOKENinETH ? (
                              <div className="progress flex column gapped">
                                <div className="flex space-between">
                                  <div></div>
                                  <div>
                                    holding until{' '}
                                    {cutLongZeroNumber(
                                      holdingInfo.holdUntilPriceInWETH,
                                      true,
                                    )}{' '}
                                    {chainCurrency[chainId]}/
                                    {holdingTokenData.symbol}
                                  </div>
                                </div>
                                <div className="progress-bar price">
                                  <div
                                    className="elapsed price"
                                    style={{
                                      width: `${priceProgress}%`,
                                    }}
                                  ></div>
                                </div>
                                {holdingInfo.holdUntilPriceInWETH ? (
                                  <>
                                    <div>Progress: {priceProgress}%</div>
                                    <div>
                                      Started at:{' '}
                                      {cutLongZeroNumber(
                                        holdingInfo.holdAtPriceInWETH,
                                      )}{' '}
                                      {chainCurrency[chainId]}/
                                      {holdingTokenData?.symbol}
                                    </div>
                                    <div>
                                      Current price:{' '}
                                      {cutLongZeroNumber(priceTOKENinETH)}{' '}
                                      {chainCurrency[chainId]}/
                                      {holdingTokenData?.symbol}
                                    </div>
                                  </>
                                ) : null}
                              </div>
                            ) : null}
                            {/* To TOKEN price in USDT */}
                            {holdingInfo.holdUntilPriceInUSD &&
                            holdingInfo.isPureEther == false &&
                            holdingTokenData &&
                            priceETHinUSD &&
                            priceTOKENinETH ? (
                              <div className="progress flex column gapped">
                                <div className="flex space-between">
                                  <div></div>
                                  <div>
                                    holding until{' '}
                                    {cutLongZeroNumber(
                                      holdingInfo.holdUntilPriceInUSD,
                                      true,
                                    )}{' '}
                                    USDT/{holdingTokenData.symbol}
                                  </div>
                                </div>
                                <div className="progress-bar price">
                                  <div
                                    className="elapsed price"
                                    style={{
                                      width: `${priceProgress}%`,
                                    }}
                                  ></div>
                                </div>
                                {holdingInfo.holdUntilPriceInUSD ? (
                                  <>
                                    <div>Progress: {priceProgress}%</div>
                                    <div>
                                      Started at:{' '}
                                      {cutLongZeroNumber(
                                        holdingInfo.holdAtPriceInUSD,
                                      )}{' '}
                                      USDT/{holdingTokenData?.symbol}
                                    </div>
                                    <div>
                                      Current price:{' '}
                                      {cutLongZeroNumber(
                                        priceTOKENinETH * priceETHinUSD,
                                      )}{' '}
                                      USDT/
                                      {holdingTokenData?.symbol}
                                    </div>
                                  </>
                                ) : null}
                              </div>
                            ) : null}
                            {/* To ETH price in USDT */}
                            {holdingInfo.isPureEther == true &&
                            holdingInfo.holdAtPriceInWETH &&
                            priceETHinUSD ? (
                              <div className="progress flex column gapped">
                                <div className="flex space-between">
                                  <div></div>
                                  <div>
                                    holding until{' '}
                                    {cutDecimals(
                                      1 / holdingInfo.holdUntilPriceInWETH,
                                      2,
                                    )}{' '}
                                    USDT/{chainCurrency[chainId]}
                                  </div>
                                </div>
                                <div className="progress-bar price">
                                  <div
                                    className="elapsed price"
                                    style={{
                                      width: `${priceProgress}%`,
                                    }}
                                  ></div>
                                </div>
                                {holdingInfo.holdUntilPriceInWETH ? (
                                  <>
                                    <div>Progress: {priceProgress}%</div>
                                    <div>
                                      Started at:{' '}
                                      {cutDecimals(
                                        1 / holdingInfo.holdAtPriceInWETH,
                                        2,
                                      )}{' '}
                                      USDT/{chainCurrency[chainId]}
                                    </div>
                                    <div>
                                      Current price:{' '}
                                      {cutDecimals(priceETHinUSD, 2)} USDT/
                                      {chainCurrency[chainId]}
                                    </div>
                                  </>
                                ) : null}
                              </div>
                            ) : null}
                          </>
                        ) : (
                          <>
                            {(holdingInfo.holdUntilTimestamp &&
                              holdingInfo.holdUntilPriceInWETH) ||
                            (holdingInfo.holdUntilTimestamp &&
                              holdingInfo.holdUntilPriceInUSD) ? (
                              <>
                                <div className="finalized flex column center gapped">
                                  💎
                                  <div>
                                    Successfuly held from{' '}
                                    {formatDate(
                                      holdingInfo.holdAtTimestamp,
                                      true,
                                    )}
                                    , to{' '}
                                    {formatDate(
                                      holdingInfo.holdUntilTimestamp,
                                      true,
                                    )}{' '}
                                    <b>OR</b>
                                    {/* To date and WETH price */}
                                    {holdingInfo.holdUntilPriceInWETH &&
                                    holdingInfo.isPureEther == false &&
                                    holdingTokenData &&
                                    priceETHinUSD &&
                                    priceTOKENinETH ? (
                                      <div>
                                        from{' '}
                                        {cutLongZeroNumber(
                                          holdingInfo.holdAtPriceInWETH,
                                        )}{' '}
                                        {chainCurrency[chainId]}/
                                        {holdingTokenData?.symbol} to{' '}
                                        {cutLongZeroNumber(
                                          holdingInfo.holdUntilPriceInWETH,
                                          true,
                                        )}{' '}
                                        {chainCurrency[chainId]}/
                                        {holdingTokenData.symbol}
                                      </div>
                                    ) : null}
                                    {/* To date and TOKEN price in USDT */}
                                    {holdingInfo.holdUntilPriceInUSD &&
                                    holdingInfo.isPureEther == false &&
                                    holdingTokenData &&
                                    priceETHinUSD &&
                                    priceTOKENinETH ? (
                                      <div>
                                        from{' '}
                                        {cutLongZeroNumber(
                                          holdingInfo.holdAtPriceInUSD,
                                        )}{' '}
                                        USDT/{holdingTokenData?.symbol} to{' '}
                                        {cutLongZeroNumber(
                                          holdingInfo.holdUntilPriceInUSD,
                                          true,
                                        )}{' '}
                                        USDT/{holdingTokenData.symbol}
                                      </div>
                                    ) : null}
                                    {/* To date and ETH price in USDT */}
                                    {holdingInfo.isPureEther == true &&
                                    holdingInfo.holdAtPriceInWETH &&
                                    priceETHinUSD ? (
                                      <div>
                                        from{' '}
                                        {cutDecimals(
                                          1 / holdingInfo.holdAtPriceInWETH,
                                          2,
                                        )}{' '}
                                        USDT/{chainCurrency[chainId]} to{' '}
                                        {cutDecimals(
                                          1 / holdingInfo.holdUntilPriceInWETH,
                                          2,
                                        )}{' '}
                                        USDT/{chainCurrency[chainId]}
                                      </div>
                                    ) : null}
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                {/* To date */}
                                {holdingInfo.holdUntilTimestamp ? (
                                  <div className="finalized flex column center gapped">
                                    💎
                                    <div>
                                      Successfuly held from{' '}
                                      {formatDate(
                                        holdingInfo.holdAtTimestamp,
                                        true,
                                      )}
                                      , to{' '}
                                      {formatDate(
                                        holdingInfo.holdUntilTimestamp,
                                        true,
                                      )}
                                    </div>
                                  </div>
                                ) : null}
                                {/* To price WETH */}
                                {holdingInfo.holdUntilPriceInWETH &&
                                holdingInfo.isPureEther == false &&
                                holdingTokenData &&
                                priceETHinUSD &&
                                priceTOKENinETH ? (
                                  <div className="finalized flex column center gapped">
                                    💎
                                    <div>
                                      Successfully held from{' '}
                                      {cutLongZeroNumber(
                                        holdingInfo.holdAtPriceInWETH,
                                      )}{' '}
                                      {chainCurrency[chainId]}/
                                      {holdingTokenData?.symbol} to{' '}
                                      {cutLongZeroNumber(
                                        holdingInfo.holdUntilPriceInWETH,
                                        true,
                                      )}{' '}
                                      {chainCurrency[chainId]}/
                                      {holdingTokenData.symbol}
                                    </div>
                                  </div>
                                ) : null}
                                {/* To TOKEN price in USDT */}
                                {holdingInfo.holdUntilPriceInUSD &&
                                holdingInfo.isPureEther == false &&
                                holdingTokenData &&
                                priceETHinUSD &&
                                priceTOKENinETH ? (
                                  <div className="finalized flex column center gapped">
                                    💎
                                    <div>
                                      Successfully held from{' '}
                                      {cutLongZeroNumber(
                                        holdingInfo.holdAtPriceInUSD,
                                      )}{' '}
                                      USDT/{holdingTokenData?.symbol} to{' '}
                                      {cutLongZeroNumber(
                                        holdingInfo.holdUntilPriceInUSD,
                                        true,
                                      )}{' '}
                                      USDT/{holdingTokenData.symbol}
                                    </div>
                                  </div>
                                ) : null}
                                {/* To ETH price in USDT */}
                                {holdingInfo.isPureEther == true &&
                                holdingInfo.holdAtPriceInWETH &&
                                priceETHinUSD ? (
                                  <div className="finalized flex column center gapped">
                                    💎
                                    <div>
                                      Successfully held from{' '}
                                      {cutDecimals(
                                        1 / holdingInfo.holdAtPriceInWETH,
                                        2,
                                      )}{' '}
                                      USDT/{chainCurrency[chainId]} to{' '}
                                      {cutDecimals(
                                        1 / holdingInfo.holdUntilPriceInWETH,
                                        2,
                                      )}{' '}
                                      USDT/{chainCurrency[chainId]}
                                    </div>
                                  </div>
                                ) : null}
                              </>
                            )}
                          </>
                        )}
                      </div>

                      {holdingInfo.isActive &&
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

                      {holdingInfo.isActive &&
                        holdingInfo.user === address &&
                        withdrawalFee !== undefined &&
                        etherBalance && (
                          <div className="form flex column">
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
                                    : 'Insufficient ETH balance'
                                  : 'Waiting for target'}
                              </button>
                            </div>
                          </div>
                        )}
                    </>
                  ) : (
                    <div className="form flex column center">
                      No holding found in {capitalizeFirstLetter(chainName)}{' '}
                      network with id #{id}
                    </div>
                  )}
                </>
              ) : (
                <div className="unmatched network flex column center gapped">
                  <div>Your wallet is connected to another network</div>
                  <div>
                    Please, switch network to {capitalizeFirstLetter(chainName)}
                  </div>
                  <button onClick={openNetworkSwitch}>Switch</button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}
