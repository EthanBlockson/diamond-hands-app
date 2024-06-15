'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from '@web3modal/ethers5/react';
import useDetectOutsideClick from '../hooks/useDetectOutsideClick';
import cutDecimals from '@/utils/cutDecimals';
import cutLongZeroNumber from '@/utils/cutLongZeroNumber';
import { formatDate } from '@/utils/formatDate';
import { chainIdToName } from '@/utils/chainIdToName';
import { getServiceFee } from '@/calls/getServiceFee';
import { newHoldingEther } from '@/calls/newHoldingEther';
import { newHoldingToken } from '@/calls/newHoldingToken';
import { chainIdToNameLowerCase } from '@/utils/chainIdToNameLowerCase';
import { LoadingIndicator } from './LoadingIndicator';
import toast from 'react-hot-toast';

export default function ConfirmDepositModal({
  isConfirmDepositModalVisible,
  handleShowConfirmDepositModal,
  depositType,
  tokenAddress,
  tokenName,
  tokenSymbol,
  tokenDecimals,
  tokenBalance,
  etherBalance,
  amount,
  amountUSDT,
  priceETHinUSD,
  priceTOKENinETH,
  freezeForDays,
  unfreezeDate,
  freezeForX,
  isInUSDT,
  refcode,
  isValidRefCode,
}) {
  const modalRef = useRef(null);
  const router = useRouter();
  const { walletProvider } = useWeb3ModalProvider();
  const { address, chainId } = useWeb3ModalAccount();

  const [serviceFee, setServiceFee] = useState();
  const [isWaitingForTx, setIsWaitingForTx] = useState(false);
  const isEther = tokenName === 'ETH';

  useEffect(() => {
    callGetServiceFee();
  }, []);

  const callGetServiceFee = async () => {
    const feeNumber = await getServiceFee(
      isEther ? 1 : 3,
      chainId,
      walletProvider,
      isEther ? 'ether' : tokenAddress,
      amount,
      isEther ? 18 : tokenDecimals,
    );
    setServiceFee(feeNumber);
  };

  const callNewHoldingEther = async () => {
    setIsWaitingForTx(true);
    const deposit = await newHoldingEther(
      chainId,
      walletProvider,
      amount,
      freezeForDays * 86400,
      freezeForX,
      refcode,
    );
    if (deposit) {
      toast.success('New holding has been created');
      handleCloseConfirmDepositModal();
      router.push(
        `/holdings/${chainIdToNameLowerCase[chainId]}/address/${address}`,
      );
    } else {
      toast.error('Error trying to make new holding');
    }
    setIsWaitingForTx(false);
  };

  const callNewHoldingToken = async () => {
    setIsWaitingForTx(true);
    const deposit = await newHoldingToken(
      chainId,
      walletProvider,
      tokenAddress,
      amount,
      tokenDecimals,
      freezeForDays * 86400,
      freezeForX,
      isInUSDT,
      refcode,
    );
    if (deposit) {
      toast.success('New holding has been created');
      handleCloseConfirmDepositModal();
      router.push(
        `/holdings/${chainIdToNameLowerCase[chainId]}/address/${address}`,
      );
    } else {
      toast.error('Error trying to make new holding');
    }
    setIsWaitingForTx(false);
  };

  useDetectOutsideClick(modalRef, () => {
    handleCloseConfirmDepositModal();
  });

  const handleCloseConfirmDepositModal = () => {
    handleShowConfirmDepositModal(false);
  };

  const ToDateBlock = () => {
    return (
      <div className="target flex gapped">
        <div className="token">
          <div className="token-amount">{formatDate(unfreezeDate)}</div>
          <div className="token-symbol">{freezeForDays} days</div>
        </div>
      </div>
    );
  };

  const ToPriceBlock = () => {
    return (
      <div className="target flex gapped">
        <div className="token">
          <div className="token-amount flex row wrap">
            {isEther ? (
              <div>{cutDecimals(priceETHinUSD * freezeForX, 2)}</div>
            ) : (
              <div>
                {isInUSDT
                  ? cutLongZeroNumber(
                      priceTOKENinETH * priceETHinUSD * freezeForX,
                    )
                  : cutLongZeroNumber(priceTOKENinETH * freezeForX)}
              </div>
            )}
            {isEther ? 'USDT' : isInUSDT ? 'USDT' : 'ETH'}/
            {isEther ? 'ETH' : tokenSymbol}
          </div>
          <div className="token-symbol">{freezeForX}x</div>
        </div>
      </div>
    );
  };

  return (
    <>
      {isConfirmDepositModalVisible && (
        <div className="any-modal-background">
          <div className="any-modal flex column" ref={modalRef}>
            <div className="any-modal-header flex space-between">
              {!isWaitingForTx ? <h1>Review holding</h1> : <div></div>}
              <div
                className="close-modal-icon"
                onClick={handleCloseConfirmDepositModal}
              >
                X
              </div>
            </div>
            {!isWaitingForTx ? (
              <div className="confirm-deposit-modal flex column">
                <div className="micro-header">Hold</div>
                <div className="target flex space-between gapped">
                  <div className="token">
                    <div className="token-amount">
                      {cutDecimals(amount, 2)} {tokenSymbol}
                    </div>
                    <div className="token-symbol">
                      ${cutLongZeroNumber(amountUSDT)}
                    </div>
                  </div>
                  <div className="chain">
                    <Image
                      src={`/img/chains/${chainId}.svg`}
                      width={25}
                      height={25}
                      alt=""
                    />
                  </div>
                </div>
                {depositType === 'DateOrPrice' && (
                  <>
                    <div className="micro-header">Until</div>
                    <ToDateBlock />
                    <div className="micro-header">OR Until</div>
                    <ToPriceBlock />
                  </>
                )}
                {depositType === 'Date' && (
                  <>
                    <div className="micro-header">Until</div>
                    <ToDateBlock />
                  </>
                )}
                {depositType === 'Price' && (
                  <>
                    <div className="micro-header">Until</div>
                    <ToPriceBlock />
                  </>
                )}
                <div className="horizontal-line"></div>
                <div className="tx-details">
                  <div className="flex space-between">
                    <div className="micro-header">Chain</div>
                    <div className="micro-header">{chainIdToName[chainId]}</div>
                  </div>
                  {isValidRefCode && (
                    <div className="flex space-between">
                      <div className="micro-header">Discount</div>
                      <div className="micro-header">{refcode} -20%</div>
                    </div>
                  )}
                  {serviceFee && (
                    <div className="flex space-between">
                      <div className="micro-header">Service fee</div>
                      <div className="micro-header">
                        {cutDecimals(serviceFee, 2)} ETH
                      </div>
                    </div>
                  )}
                </div>
                {etherBalance < serviceFee ||
                (isEther && etherBalance < amount + serviceFee) ? (
                  <button disabled>Insufficient ETH balance</button>
                ) : (
                  <button
                    onClick={() => {
                      isEther ? callNewHoldingEther() : callNewHoldingToken();
                    }}
                  >
                    Confirm hold
                  </button>
                )}
              </div>
            ) : (
              <div className="confirm-deposit-waiting">
                <div className="info flex column center gapped">
                  <LoadingIndicator />
                  <div>Confirm holding</div>
                  <div className="token-amount">
                    {cutDecimals(amount, 2)} {tokenSymbol}
                  </div>
                </div>
                <div className="flex center micro-header">
                  Proceed in your wallet
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
