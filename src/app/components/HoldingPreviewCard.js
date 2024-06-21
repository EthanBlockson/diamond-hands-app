'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from '@web3modal/ethers5/react';
import cutDecimals from '@/utils/cutDecimals';
import cutLongZeroNumber from '@/utils/cutLongZeroNumber';
import { formatDate } from '@/utils/formatDate';
import { percentDifference } from '@/utils/percentDifference';
import { getERC20 } from '@/calls/getERC20';
import { getTokenPriceV2 } from '@/calls/getTokenPriceV2';
import { chainCurrency } from '@/utils/chainCurrency';
import { LoadingIndicator } from './LoadingIndicator';

export default function HoldingPreviewCard({ id, holdingData, priceETHinUSD }) {
  const { walletProvider } = useWeb3ModalProvider();
  const { address, chainId } = useWeb3ModalAccount();

  const [priceTOKENinETH, setPriceTOKENinETH] = useState(undefined);
  const [holdingTokenData, setHoldingTokenData] = useState(undefined);
  const [dateProgress, setDateProgress] = useState(undefined);
  const [priceProgress, setPriceProgress] = useState(undefined);
  const [isAbleToClaim, setIsAbleToClaim] = useState(false);

  const zeroAddress = '0x0000000000000000000000000000000000000000';
  const currentTimestamp = Math.floor(Date.now() / 1000);

  useEffect(() => {
    if (holdingData.holdUntilTimestamp) getDatePercentDifference();
    if (holdingData.holdUntilPriceInWETH || holdingData.holdUntilPriceInUSD)
      getPricePercentDifference();
  }, []);

  const getDatePercentDifference = async () => {
    if (holdingData.token !== zeroAddress) {
      await fetchTokenData(holdingData.token);
    }

    setDateProgress(
      percentDifference(
        holdingData.holdAtTimestamp,
        holdingData.holdUntilTimestamp,
        currentTimestamp,
      ),
    );

    if (currentTimestamp > holdingData.holdUntilTimestamp) {
      setIsAbleToClaim(true);
    }
  };

  const getPricePercentDifference = async () => {
    if (holdingData.isPureEther && holdingData.holdAtPriceInWETH) {
      setPriceProgress(
        100 - // price growing in this case is reverse progress
          percentDifference(
            holdingData.holdUntilPriceInWETH,
            holdingData.holdAtPriceInWETH,
            1 / priceETHinUSD,
          ),
      );
      if (1 / priceETHinUSD < holdingData.holdUntilPriceInWETH)
        setIsAbleToClaim(true);
    }

    if (holdingData.token !== zeroAddress) {
      const { tokenEtherPrice } = await fetchTokenData(holdingData.token);

      if (holdingData.holdAtPriceInWETH) {
        setPriceProgress(
          percentDifference(
            holdingData.holdAtPriceInWETH,
            holdingData.holdUntilPriceInWETH,
            tokenEtherPrice,
          ),
        );
        if (tokenEtherPrice > holdingData.holdUntilPriceInWETH) {
          setIsAbleToClaim(true);
        }
      }

      if (holdingData.holdAtPriceInUSD) {
        setPriceProgress(
          percentDifference(
            holdingData.holdAtPriceInUSD,
            holdingData.holdUntilPriceInUSD,
            tokenEtherPrice * priceETHinUSD,
          ),
        );
        if (tokenEtherPrice * priceETHinUSD > holdingData.holdUntilPriceInUSD) {
          setIsAbleToClaim(true);
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
      return { tokenEtherPrice };
    }
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

  return (
    <>
      {holdingTokenData || holdingData.isPureEther ? (
        <div>
          <div className="card-header flex space-between">
            <div className="id"># {id}</div>
            <div className="chain-logo flex end">
              <Image
                src={`/img/chains/${chainId}.svg`}
                width={25}
                height={25}
                alt=""
              />
            </div>
          </div>
          <div className="token-header">
            <div className="token-amount">
              {cutLongZeroNumber(holdingData.amount)}
            </div>
            <div className="token-name">
              {holdingData.isPureEther
                ? chainCurrency[chainId]
                : holdingTokenData
                ? `${holdingTokenData.symbol} (${holdingTokenData.name})`
                : '...'}
            </div>
          </div>
          {holdingData.isActive ? (
            <>
              {isAbleToClaim ? (
                <div className="ended able-to-claim">Withdraw</div>
              ) : (
                <div className="progresses flex column gapped">
                  {holdingData.holdUntilTimestamp ? (
                    <div className="progress-mini flex column">
                      <div>
                        Until {formatDate(holdingData.holdUntilTimestamp, true)}
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
                  ) : (
                    <div className="progress-mini flex column unavailable">
                      <div>Without date target</div>
                      <div className="progress-bar date">
                        <div
                          className="elapsed date"
                          style={{
                            width: `${0}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                  {holdingData.holdUntilPriceInWETH ||
                  holdingData.holdUntilPriceInUSD ? (
                    <div className="progress-mini flex column">
                      <div>
                        Until
                        {holdingData.isPureEther &&
                        holdingData.holdUntilPriceInWETH ? (
                          <div>
                            {cutDecimals(
                              1 / holdingData.holdUntilPriceInWETH,
                              2,
                            )}{' '}
                            USD/{chainCurrency[chainId]}
                          </div>
                        ) : null}
                        {holdingData.token !== zeroAddress &&
                        holdingData.holdUntilPriceInWETH ? (
                          <div>
                            {cutLongZeroNumber(
                              holdingData.holdUntilPriceInWETH,
                              true,
                            )}{' '}
                            {chainCurrency[chainId]}/{holdingTokenData.symbol}
                          </div>
                        ) : null}
                        {holdingData.token !== zeroAddress &&
                        holdingData.holdUntilPriceInUSD ? (
                          <div>
                            {cutLongZeroNumber(
                              holdingData.holdUntilPriceInUSD,
                              true,
                            )}{' '}
                            USD/{holdingTokenData.symbol}
                          </div>
                        ) : null}
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
                  ) : (
                    <div className="progress-mini flex column unavailable">
                      <div>Without price target</div>
                      <div className="progress-bar price">
                        <div
                          className="elapsed price"
                          style={{
                            width: `${0}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="ended finalized flex column center gapped">
                <Image
                  src={`/img/brand/hand.png`}
                  width={35}
                  height={35}
                  alt=""
                />
                <div>Diamond handed</div>
              </div>
              {/* {(holdingData.holdUntilTimestamp &&
                holdingData.holdUntilPriceInWETH) ||
              (holdingData.holdUntilTimestamp &&
                holdingData.holdUntilPriceInUSD) ? (
                <div className="finalized flex column center gapped">
                  💎
                  <div>
                    Successfuly held from{' '}
                    {formatDate(holdingData.holdAtTimestamp, true)}, to{' '}
                    {formatDate(holdingData.holdUntilTimestamp, true)}
                  </div>
                  <b>OR</b>
                  {holdingData.isPureEther &&
                  holdingData.holdUntilPriceInWETH ? (
                    <div>
                      {cutDecimals(1 / holdingData.holdAtPriceInWETH, 2)} USD/
                      {chainCurrency[chainId]} to{' '}
                      {cutDecimals(1 / holdingData.holdUntilPriceInWETH, 2)}{' '}
                      USD/{chainCurrency[chainId]}
                    </div>
                  ) : null}
                  {holdingData.token !== zeroAddress &&
                  holdingData.holdUntilPriceInWETH ? (
                    <div>
                      {cutLongZeroNumber(holdingData.holdAtPriceInWETH)}{' '}
                      {chainCurrency[chainId]}/{holdingTokenData?.symbol} to{' '}
                      {cutLongZeroNumber(
                        holdingData.holdUntilPriceInWETH,
                        true,
                      )}{' '}
                      {chainCurrency[chainId]}/{holdingTokenData.symbol}
                    </div>
                  ) : null}
                  {holdingData.token !== zeroAddress &&
                  holdingData.holdUntilPriceInUSD ? (
                    <div>
                      {cutLongZeroNumber(holdingData.holdAtPriceInUSD)} USD/
                      {holdingTokenData?.symbol} to{' '}
                      {cutLongZeroNumber(holdingData.holdUntilPriceInUSD, true)}{' '}
                      USD/{holdingTokenData.symbol}
                    </div>
                  ) : null}
                </div>
              ) : (
                <>
                  {holdingData.holdUntilTimestamp ? (
                    <div className="finalized flex column center gapped">
                      💎
                      <div>
                        Successfuly held from{' '}
                        {formatDate(holdingData.holdAtTimestamp, true)}, to{' '}
                        {formatDate(holdingData.holdUntilTimestamp, true)}
                      </div>
                    </div>
                  ) : null}
                  {holdingData.holdUntilPriceInWETH ||
                  holdingData.holdUntilPriceInUSD ? (
                    <div className="finalized flex column center gapped">
                      💎
                      <div>
                        Successfuly held from{' '}
                        {holdingData.isPureEther &&
                        holdingData.holdUntilPriceInWETH ? (
                          <div>
                            {cutDecimals(1 / holdingData.holdAtPriceInWETH, 2)}{' '}
                            USD/{chainCurrency[chainId]} to{' '}
                            {cutDecimals(
                              1 / holdingData.holdUntilPriceInWETH,
                              2,
                            )}{' '}
                            USD/{chainCurrency[chainId]}
                          </div>
                        ) : null}
                        {holdingData.token !== zeroAddress &&
                        holdingData.holdUntilPriceInWETH ? (
                          <div>
                            {cutLongZeroNumber(holdingData.holdAtPriceInWETH)}{' '}
                            {chainCurrency[chainId]}/{holdingTokenData?.symbol}{' '}
                            to{' '}
                            {cutLongZeroNumber(
                              holdingData.holdUntilPriceInWETH,
                              true,
                            )}{' '}
                            {chainCurrency[chainId]}/{holdingTokenData.symbol}
                          </div>
                        ) : null}
                        {holdingData.token !== zeroAddress &&
                        holdingData.holdUntilPriceInUSD ? (
                          <div>
                            {cutLongZeroNumber(holdingData.holdAtPriceInUSD)}{' '}
                            USD/
                            {holdingTokenData?.symbol} to{' '}
                            {cutLongZeroNumber(
                              holdingData.holdUntilPriceInUSD,
                              true,
                            )}{' '}
                            USD/{holdingTokenData.symbol}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </>
              )} */}
            </>
          )}
        </div>
      ) : (
        <LoadingIndicator />
      )}
    </>
  );
}
