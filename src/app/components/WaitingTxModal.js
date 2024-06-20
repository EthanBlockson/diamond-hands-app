'use client';

import Image from 'next/image';
import { useRef } from 'react';
import useDetectOutsideClick from '../hooks/useDetectOutsideClick';
import { LoadingIndicator } from './LoadingIndicator';

export default function WaitingTxModal({
  isWaitingTxModalVisible,
  handleShowWaitingTxModal,
  hintText,
}) {
  const modalRef = useRef(null);

  useDetectOutsideClick(modalRef, () => {
    handleCloseWaitingTxModal();
  });

  const handleCloseWaitingTxModal = () => {
    handleShowWaitingTxModal(false);
  };

  return (
    <>
      {isWaitingTxModalVisible && (
        <div className="any-modal-background">
          <div className="any-modal flex column" ref={modalRef}>
            <div className="any-modal-header flex space-between center-baseline">
              <div></div>
              <div
                className="close-modal-icon"
                onClick={handleCloseWaitingTxModal}
              >
                <Image
                  src={`/img/icons/close.svg`}
                  width={30}
                  height={30}
                  alt=""
                />
              </div>
            </div>
            <div className="confirm-deposit-waiting">
              <div className="info flex column center gapped">
                <LoadingIndicator />
                <div>{hintText}</div>
              </div>
              <div className="flex center little-text micro-header">
                Proceed in your wallet
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
