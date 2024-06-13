'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  useWeb3Modal,
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from '@web3modal/ethers5/react';
import { nameToChainId } from '@/utils/nameToChainId';
import { shortenAddress } from '@/utils/shortenAddress';
import { isValidEthereumAddress } from '@/utils/isValidEthereumAddress';
import capitalizeFirstLetter from '@/utils/capitalizeFirstLetter';
import { getHoldingIds } from '@/calls/getHoldingIds';
import { chainIdToName } from '@/utils/chainIdToName';
import { getTokenPriceV2 } from '@/calls/getTokenPriceV2';
import { USDT } from '@/data/USDT';
import HoldingPreviewCard from '@/app/components/HoldingPreviewCard';
import { getHoldingInfo } from '@/calls/getHoldingInfo';

export default function HoldingsByAddress({ params }) {
  const { chainName, ofAddress } = params;
  const { walletProvider } = useWeb3ModalProvider();
  const { address, chainId } = useWeb3ModalAccount();
  const { open } = useWeb3Modal();

  const [isConnected, setIsConnected] = useState(false);
  const [isNetworkMatch, setIsNetworkMatch] = useState(true);
  const [priceETHinUSD, setPriceETHinUSD] = useState(0);
  const [holdingIds, setHoldingIds] = useState(undefined);
  const [holdingsData, setHoldingsData] = useState([]);
  const [currentCursor, setCurrentCursor] = useState(undefined);

  useEffect(() => {
    if (address && chainId) {
      setIsConnected(true);
      const chainIdFromLink = nameToChainId[chainName];
      chainIdFromLink !== chainId
        ? setIsNetworkMatch(false)
        : setIsNetworkMatch(true);
      callGetPriceETHinUSD();
      callGetHoldingsData();
    } else {
      setIsConnected(false);
    }
  }, [address && chainId]);

  const callGetHoldingsData = async () => {
    const fetchedHoldingIds = await callGetHoldingIds();
    const fetchedHoldingIdsReversed = [...fetchedHoldingIds].reverse();
    console.log(fetchedHoldingIds);
    console.log(fetchedHoldingIdsReversed);

    const step = 5;
    const start = fetchedHoldingIdsReversed.length - 1;
    const cursor = currentCursor ? currentCursor - step : start - step;
    const ids = fetchedHoldingIdsReversed.slice(cursor, cursor + step);
    setCurrentCursor(cursor);

    console.log('start', start);
    console.log('cursor', cursor);
    console.log('ids', ids);

    const holdingInfoPromises = ids.map(async (id) => {
      const holdingInfo = await getHoldingInfo(chainId, walletProvider, id);
      return { id, ...holdingInfo };
    });
    const holdingInfoArray = await Promise.all(holdingInfoPromises);
    console.log('holdingInfoArray', holdingInfoArray);
    setHoldingsData((prevHoldingsData) => [
      ...prevHoldingsData,
      ...holdingInfoArray,
    ]);
    console.log('prevHoldingsData', holdingsData);
  };

  const callGetHoldingIds = async () => {
    const fetchedHoldingIds = await getHoldingIds(
      chainId,
      walletProvider,
      ofAddress,
    );
    return fetchedHoldingIds;
  };

  const callGetPriceETHinUSD = async () => {
    console.log('callGetPriceETHinUSD');
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

  const openNetworkSwitch = () => {
    open({ view: 'Networks' });
  };

  return (
    <>
      {holdingsData.length === 0 ? (
        <div>Loading...</div>
      ) : (
        <>
          {isConnected && (
            <div className="holding flex column center">
              <h1>Holdings of {shortenAddress(ofAddress)}</h1>
              {currentCursor && currentCursor} currentCursor
              <button onClick={() => callGetHoldingsData()}>More</button>
              {isValidEthereumAddress(ofAddress) ? (
                <>
                  {isNetworkMatch ? (
                    <>
                      {holdingsData &&
                      holdingsData.length > 0 &&
                      priceETHinUSD ? (
                        <div className="preview-cards flex wrap start">
                          {holdingsData.map((holdingData, id) => (
                            <div className="preview-card flex column" key={id}>
                              <Link
                                href={`/holdings/${chainIdToName[
                                  chainId
                                ].toLowerCase()}/${holdingData.id}`}
                              >
                                <HoldingPreviewCard
                                  id={holdingData.id}
                                  holdingData={holdingData}
                                />
                              </Link>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="empty address flex column center">
                          Address <p>{ofAddress}</p> doesnt have any holdings at{' '}
                          {chainIdToName[chainId]} chain
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="unmatched network flex column center gapped">
                      <div>Your wallet is connected to another network</div>
                      <div>
                        Please, switch network to{' '}
                        {capitalizeFirstLetter(chainName)}
                      </div>
                      <button onClick={openNetworkSwitch}>Switch</button>
                    </div>
                  )}
                </>
              ) : (
                <div className="unmatched address flex column center gapped">
                  <div>Address {ofAddress} doesn't exist</div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}
