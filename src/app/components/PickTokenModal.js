import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import {
  useWeb3Modal,
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from '@web3modal/ethers5/react';
import { isValidEthereumAddress } from '@/utils/isValidEthereumAddress';
import { hotTokens } from '@/data/hotTokens';
import useDetectOutsideClick from '../hooks/useDetectOutsideClick';

export default function PickTokenModal({
  isPickTokenModalVisible,
  handleShowPickTokenModal,
}) {
  const modalRef = useRef(null);
  const { open } = useWeb3Modal();
  const { address, chainId } = useWeb3ModalAccount();

  const [contractAddress, setContractAddress] = useState(undefined);
  const [isValidContractAddress, setIsValidContractAddress] = useState(true);
  const [blockDetectOutsideClick, setBlockDetectOutsideClick] = useState(false);

  const handleContractAddress = async (e) => {
    const address = e.target.value;
    setContractAddress(address);
    const isValid = isValidEthereumAddress(address);
    isValid || !address
      ? setIsValidContractAddress(true)
      : setIsValidContractAddress(false);
  };

  useDetectOutsideClick(modalRef, () => {
    !blockDetectOutsideClick && handleClosePickTokenModal();
  });

  const openModalSelectNetwork = () => {
    setBlockDetectOutsideClick(true);
    open({ view: 'Networks' });
  };

  const handleClosePickTokenModal = () => {
    handleShowPickTokenModal(false);
  };

  return (
    <>
      {isPickTokenModalVisible && (
        <div className="any-modal-background">
          <div className="any-modal flex column" ref={modalRef}>
            <div className="any-modal-header flex space-between">
              <h1>Select a token</h1>
              <div
                className="close-modal-icon"
                onClick={handleClosePickTokenModal}
              >
                X
              </div>
            </div>
            <div className="pick-token-modal flex column">
              <div className="search-block flex space-between">
                <div className="search-field flex row">
                  <Image
                    src={`/img/icons/search.svg`}
                    width={25}
                    height={25}
                    alt=""
                  />
                  <input
                    type="text"
                    autoComplete="off"
                    value={contractAddress}
                    onChange={handleContractAddress}
                    placeholder="Paste token address (0x...)"
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
                <div className="token">ETH</div>
                {hotTokens[chainId].map((token, i) => (
                  <div key={i} className="token">
                    {token.symbol}
                  </div>
                ))}
              </div>
              <div className="horizontal-line"></div>
              <div className="search-results flex column gapped">
                <div>Search results</div>
                {!isValidContractAddress && (
                  <div className="input-assist">
                    Token with input address doesnt exist
                  </div>
                )}
                <div className="token-found flex space-between">
                  <div className="token-name">
                    <div>Dai</div>
                    <div className="flex row gapped">
                      <div>DAI</div>
                      <div>0xDA10...0da1</div>
                    </div>
                  </div>
                  <div className="token-balance">0</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
