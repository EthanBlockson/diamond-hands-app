'use client';

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
import { getTokenPriceV2 } from '@/calls/getTokenPriceV2';
import { USDT } from '@/data/USDT';

export default function Holdings({ params }) {
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

    if (fetchedHoldingInfo.token !== zeroAddress) {
      const tokenEtherPrice = await fetchTokenData(fetchedHoldingInfo.token);

      fetchedHoldingInfo.holdAtPriceInWETH &&
        setPriceProgress(
          percentDifference(
            fetchedHoldingInfo.holdAtPriceInWETH,
            fetchedHoldingInfo.holdUntilPriceInWETH,
            tokenEtherPrice,
          ),
        );

      fetchedHoldingInfo.holdAtPriceInUSD &&
        setPriceProgress(
          percentDifference(
            fetchedHoldingInfo.holdAtPriceInUSD,
            fetchedHoldingInfo.holdUntilPriceInUSD,
            tokenEtherPrice * etherDollarPrice,
          ),
        );
    }

    fetchedHoldingInfo.holdUntilTimestamp &&
      setDateProgress(
        percentDifference(
          fetchedHoldingInfo.holdAtTimestamp,
          fetchedHoldingInfo.holdUntilTimestamp,
          currentTimestamp,
        ),
      );

    console.log(fetchedHoldingInfo); // TEMP
  };

  const fetchTokenData = async (contractAddress) => {
    const fetchedTokenData = await getERC20(
      walletProvider,
      contractAddress,
      address,
    );
    if (fetchedTokenData) {
      setHoldingTokenData(fetchedTokenData);
      const tokenEtherPrice = callGetPriceTOKENinETH(
        contractAddress,
        fetchedTokenData.decimals,
      );
      return tokenEtherPrice;
    } else {
      setHoldingTokenData(null);
    }
    console.log(fetchedTokenData); // TEMP
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
              {isNetworkMatch ? (
                <>
                  {holdingInfo.amount > 0 ? (
                    <div className="form flex column center">
                      <div className="chain-logo">
                        <Image
                          src={`/img/chains/${chainId}.svg`}
                          width={25}
                          height={25}
                          alt=""
                        />
                      </div>
                      <div className="flex column center">
                        <div className="token-name">
                          {holdingInfo.isPureEther
                            ? chainId === 56
                              ? 'BNB (Binance Coin)'
                              : 'ETH (Ethereum)'
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
                      {/* To date */}
                      {holdingInfo.holdUntilTimestamp ? (
                        <div className="progress flex column gapped">
                          <div className="flex space-between">
                            <div>⏱️</div>
                            <div>
                              holding until{' '}
                              {formatDate(holdingInfo.holdUntilTimestamp, true)}
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
                              WETH/{holdingTokenData.symbol}
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
                                WETH/{holdingTokenData?.symbol}
                              </div>
                              <div>
                                Current price:{' '}
                                {cutLongZeroNumber(priceTOKENinETH)} WETH/
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
                      {/* TODO: To ETH price in USDT */}
                      <div className="flex center">
                        <button disabled>Claim</button>
                      </div>
                    </div>
                  ) : (
                    <div className="form flex column center">
                      No holding found in {capitalizeFirstLetter(chainName)}{' '}
                      network with id #{id}
                    </div>
                  )}
                </>
              ) : (
                <div className="unmatched-network flex column center gapped">
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
