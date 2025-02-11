'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import {
  useWeb3Modal,
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from '@web3modal/ethers5/react';
import { isValidEthereumAddress } from '@/utils/isValidEthereumAddress';
import { shortenAddress } from '@/utils/shortenAddress';
import cutDecimals from '@/utils/cutDecimals';
import { hotTokens } from '@/data/hotTokens';
import { getERC20 } from '@/calls/getERC20';
import { getEtherBalance } from '@/calls/getEtherBalance';
import useDetectOutsideClick from '../hooks/useDetectOutsideClick';
import { chainCurrency } from '@/utils/chainCurrency';

export default function PickTokenModal({
  isPickTokenModalVisible,
  handleShowPickTokenModal,
  setTokenAddress,
  setTokenName,
  setTokenSymbol,
  setTokenDecimals,
  setTokenBalance,
  setAmount,
  setAmountUSD,
  callCheckSpendingApproval,
  callGetPriceTOKENinETH,
  setIsErrorGettingPriceTOKEN,
  setFreezeForDays,
  setFreezeForX,
  setIsInUSD,
}) {
  const modalRef = useRef(null);
  const { open } = useWeb3Modal();
  const { walletProvider } = useWeb3ModalProvider();
  const { address, chainId } = useWeb3ModalAccount();

  const [contractAddress, setContractAddress] = useState('');
  const [isValidContractAddress, setIsValidContractAddress] = useState(true);
  const [searchResults, setSearchResults] = useState('');
  const [blockDetectOutsideClick, setBlockDetectOutsideClick] = useState(false);

  useEffect(() => {
    isValidEthereumAddress(contractAddress) && fetchTokenData();
  }, [contractAddress]);

  const fetchTokenData = async () => {
    const data = await getERC20(walletProvider, contractAddress, address);
    data ? setSearchResults(data) : setSearchResults(null);
  };

  const handleContractAddress = async (e) => {
    setSearchResults('');
    const address = e.target.value;
    setContractAddress(address);
    const isValid = isValidEthereumAddress(address);
    isValid || !address
      ? setIsValidContractAddress(true)
      : setIsValidContractAddress(false);
  };

  const pickEther = async () => {
    setTokenAddress(null);
    setTokenName(chainCurrency[chainId]);
    setTokenSymbol(chainCurrency[chainId]);
    const etherBalance = await getEtherBalance(walletProvider, address);
    setTokenBalance(etherBalance);
    setIsErrorGettingPriceTOKEN(false);
    setIsInUSD(true);
    handleClosePickTokenModal();
  };

  const pickTokenFromHot = async (tokenAddress, tokenName, tokenSymbol) => {
    handleClosePickTokenModal();
    setTokenAddress(tokenAddress);
    setTokenName(tokenName);
    setTokenSymbol(tokenSymbol);
    const { decimals, balanceNumber } = await getERC20(
      walletProvider,
      tokenAddress,
      address,
    );
    setTokenDecimals(decimals);
    setTokenBalance(balanceNumber);
    callGetPriceTOKENinETH(tokenAddress, decimals);
    callCheckSpendingApproval(tokenAddress, decimals, address);
    setIsInUSD(false);
  };

  const pickTokenFromSearch = async () => {
    setTokenAddress(contractAddress);
    setTokenName(searchResults.name);
    setTokenSymbol(searchResults.symbol);
    setTokenDecimals(searchResults.decimals);
    setTokenBalance(searchResults.balanceNumber);
    callGetPriceTOKENinETH(contractAddress, searchResults.decimals);
    callCheckSpendingApproval(contractAddress, searchResults.decimals, address);
    setIsInUSD(false);
    handleClosePickTokenModal();
  };

  useDetectOutsideClick(modalRef, () => {
    !blockDetectOutsideClick && handleClosePickTokenModal();
  });

  const openModalSelectNetwork = () => {
    setContractAddress('');
    setSearchResults('');
    setBlockDetectOutsideClick(true);
    open({ view: 'Networks' });
  };

  const handleClosePickTokenModal = () => {
    setAmount('');
    setAmountUSD(0);
    setFreezeForDays(0);
    setFreezeForX(1);
    handleShowPickTokenModal(false);
  };

  return (
    <>
      {isPickTokenModalVisible && (
        <div className="any-modal-background">
          <div className="any-modal flex column" ref={modalRef}>
            <div className="any-modal-header flex space-between center-baseline">
              <h1>Select a token</h1>
              <div
                className="close-modal-icon"
                onClick={handleClosePickTokenModal}
              >
                <Image
                  src={`/img/icons/close.svg`}
                  width={30}
                  height={30}
                  alt=""
                />
              </div>
            </div>
            <div className="pick-token-modal flex column">
              <div className="search-block flex space-between">
                <div className="search-field flex row center-baseline">
                  <Image
                    src={`/img/icons/search.svg`}
                    width={20}
                    height={20}
                    alt=""
                  />
                  <input
                    autoFocus
                    type="text"
                    autoComplete="off"
                    value={contractAddress}
                    onChange={handleContractAddress}
                    placeholder="Token address (0x...)"
                  />
                </div>
                <div
                  className="switch-chain flex row center-baseline"
                  onClick={openModalSelectNetwork}
                >
                  <Image
                    src={`/img/chains/${chainId}.svg`}
                    width={25}
                    height={25}
                    alt=""
                  />
                  <Image
                    src="/img/icons/arrow-down.svg"
                    width={10}
                    height={10}
                    alt=""
                  />
                </div>
              </div>
              <div className="default-tokens flex row wrap gapped">
                <div className="token" onClick={pickEther}>
                  {chainCurrency[chainId]}
                </div>
                {hotTokens[chainId] &&
                  hotTokens[chainId].map((token, i) => (
                    <div
                      key={i}
                      className="token"
                      onClick={() =>
                        pickTokenFromHot(
                          token.address,
                          token.name,
                          token.symbol,
                        )
                      }
                    >
                      {token.symbol}
                    </div>
                  ))}
              </div>
              <div className="search-results flex column">
                {contractAddress && (
                  <>
                    <div className="horizontal-line"></div>
                    <div className="low-opacity">Search results</div>
                    {!isValidContractAddress && (
                      <div className="no-token">
                        Provided address is incorrect
                      </div>
                    )}
                    {searchResults && (
                      <div
                        className="token-found flex space-between center-baseline"
                        onClick={pickTokenFromSearch}
                      >
                        <div className="token-name flex column gapped-mini">
                          <div className="name">{searchResults.name}</div>
                          <div className="symbol">{searchResults.symbol}</div>
                        </div>
                        <div className="token-balance">
                          {cutDecimals(searchResults.balanceNumber, 4)}
                        </div>
                      </div>
                    )}
                    {searchResults === null && (
                      <div className="no-token">Token not found</div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
