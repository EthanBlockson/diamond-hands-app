import { useState, useEffect, useRef, useContext } from 'react';
import useDetectOutsideClick from '../hooks/useDetectOutsideClick';

export default function PickTokenModal({
  isPickTokenModalVisible,
  handleShowPickTokenModal,
}) {
  const modalRef = useRef(null);

  useDetectOutsideClick(modalRef, () => {
    handleClosePickTokenModal();
  });

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
                  <div>🔍</div>
                  <input
                    type="text"
                    autoComplete="off"
                    placeholder="Paste address (0xab31...0acf)"
                  />
                </div>
                <div className="switch-chain">[chain]</div>
              </div>
              <div className="default-tokens flex row wrap gapped">
                <div className="token">ETH</div>
                <div className="token">WBTC</div>
              </div>
              <div className="horizontal-line"></div>
              <div className="search-results flex column gapped">
                <div>Search results</div>
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
                <div className="token-found flex space-between">
                  <div className="token-name">
                    <div>Tether</div>
                    <div className="flex row gapped">
                      <div>USDT</div>
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
