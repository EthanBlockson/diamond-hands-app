'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
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
import { chainIdToNameLowerCase } from '@/utils/chainIdToNameLowerCase';
import { LoadingComponent } from '@/app/components/LoadingComponent';

export default function HoldingsByAddress({ params }) {
  const { chainName, ofAddress } = params;
  const { walletProvider } = useWeb3ModalProvider();
  const { address, chainId } = useWeb3ModalAccount();
  const { open } = useWeb3Modal();

  const [isLoaded, setIsLoaded] = useState(false);
  const [isNetworkMatch, setIsNetworkMatch] = useState(true);
  const [priceETHinUSD, setPriceETHinUSD] = useState(0);
  const [holdingsIds, setHoldingsIds] = useState(undefined);
  const [holdingsData, setHoldingsData] = useState([]);
  const [currentCursor, setCurrentCursor] = useState(undefined);
  const [isPaginationEnd, setIsPaginationEnd] = useState(false);
  const [isNoHoldings, setIsNoHoldings] = useState(false);

  useEffect(() => {
    clearAll();
    setIsLoaded(false);
    if (address && chainId) {
      const chainIdFromLink = nameToChainId[chainName];
      chainIdFromLink !== chainId
        ? setIsNetworkMatch(false)
        : setIsNetworkMatch(true);
      callGetPriceETHinUSD();
      callGetHoldingsData();
    }
    setIsLoaded(true);
  }, [address && chainId]);

  const callGetHoldingsData = async () => {
    const chainIdFromLink = nameToChainId[chainName];
    if (chainIdFromLink !== chainId) return;

    const fetchedHoldingIds = await callGetHoldingIds();
    if (!fetchedHoldingIds || fetchedHoldingIds.length === 0) {
      setIsNoHoldings(true);
      return;
    }

    const fetchedHoldingIdsReversed = [...fetchedHoldingIds].reverse();
    setHoldingsIds(fetchedHoldingIdsReversed);
    console.log(fetchedHoldingIds);
    console.log(fetchedHoldingIdsReversed);

    const step = 6;
    const cursor = currentCursor ? currentCursor : 0;
    const ids = fetchedHoldingIdsReversed.slice(cursor, cursor + step);
    console.log('ids length', ids.length);
    setCurrentCursor(cursor + step);

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

    holdingsData.length + holdingInfoArray.length >= fetchedHoldingIds.length &&
      setIsPaginationEnd(true);
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

  const clearAll = () => {
    setPriceETHinUSD(0);
    setHoldingsData([]);
    setCurrentCursor(undefined);
    setIsPaginationEnd(false);
  };

  const openNetworkSwitch = () => {
    open({ view: 'Networks' });
  };

  return (
    <>
      {isLoaded ? (
        <div className="holding flex column center">
          <h1>
            {address && address === ofAddress ? 'My Holdings' : 'Holdings'}
          </h1>
          {address && chainId ? (
            isValidEthereumAddress(ofAddress) ? (
              isNetworkMatch ? (
                holdingsData && holdingsData.length > 0 && priceETHinUSD ? (
                  <>
                    {address !== ofAddress && (
                      <div className="of-who low-opacity">
                        of {shortenAddress(ofAddress)}
                      </div>
                    )}
                    <div className="preview-cards flex wrap start">
                      {holdingsData.map((holdingData, id) => (
                        <div className="preview-card flex column" key={id}>
                          <Link
                            href={`/holdings/${chainIdToNameLowerCase[chainId]}/${holdingData.id}`}
                          >
                            <HoldingPreviewCard
                              id={holdingData.id}
                              holdingData={holdingData}
                              priceETHinUSD={priceETHinUSD}
                            />
                          </Link>
                        </div>
                      ))}
                    </div>
                    {!isPaginationEnd && (
                      <button
                        className="mini"
                        onClick={() => callGetHoldingsData()}
                      >
                        More
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {isNoHoldings ? (
                      <div className="empty flex column center gapped">
                        <Image
                          src={`/img/chains/${chainId}.svg`}
                          width={80}
                          height={80}
                          alt=""
                        />
                        <div>
                          {address === ofAddress ? (
                            'You'
                          ) : (
                            <>
                              Address <span>{ofAddress}</span>
                            </>
                          )}{' '}
                          dont have any holdings on {chainIdToName[chainId]}{' '}
                          chain
                        </div>
                      </div>
                    ) : (
                      <LoadingComponent />
                    )}
                  </>
                )
              ) : (
                <div className="unmatched network flex column center gapped">
                  <Image
                    src={`/img/chains/0.svg`}
                    width={80}
                    height={80}
                    alt=""
                  />
                  <div>Your wallet is connected to different network</div>
                  <div>
                    Please, switch network to{' '}
                    <b>{capitalizeFirstLetter(chainName)}</b>
                  </div>
                  <button className="mini" onClick={openNetworkSwitch}>
                    Switch
                  </button>
                </div>
              )
            ) : (
              <div className="empty address flex column center gapped">
                <Image
                  src={`/img/chains/0.svg`}
                  width={80}
                  height={80}
                  alt=""
                />
                <div>
                  Address <span>{ofAddress}</span> doesnt exist
                </div>
              </div>
            )
          ) : (
            <div className="empty connection flex column center gapped">
              <Image src={`/img/chains/0.svg`} width={80} height={80} alt="" />
              <div>Your wallet isnt connected</div>
              <button className="mini" onClick={openNetworkSwitch}>
                Connect
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
