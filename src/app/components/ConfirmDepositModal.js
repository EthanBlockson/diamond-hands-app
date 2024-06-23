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
import { symbolUSD } from '@/utils/symbolUSD';
import { chainCurrency } from '@/utils/chainCurrency';
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
  amountUSD,
  priceETHinUSD,
  priceTOKENinETH,
  freezeForDays,
  unfreezeDate,
  freezeForX,
  isInUSD,
  refcode,
  isValidRefCode,
}) {
  const modalRef = useRef(null);
  const router = useRouter();
  const { walletProvider } = useWeb3ModalProvider();
  const { address, chainId } = useWeb3ModalAccount();

  const [serviceFee, setServiceFee] = useState();
  const [isWaitingForTx, setIsWaitingForTx] = useState(false);
  const isEther = tokenName === chainCurrency[chainId];

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
      toast.error('New holding creation denied');
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
      isInUSD,
      refcode,
    );
    if (deposit) {
      toast.success('New holding has been created');
      handleCloseConfirmDepositModal();
      router.push(
        `/holdings/${chainIdToNameLowerCase[chainId]}/address/${address}`,
      );
    } else {
      toast.error('New holding creation denied');
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
        <div>
          <div className="token-amount">{formatDate(unfreezeDate)}</div>
          <div className="token-date-under">{freezeForDays} days</div>
        </div>
      </div>
    );
  };

  const ToPriceBlock = () => {
    return (
      <div className="target flex gapped">
        <div>
          <div className="token-amount flex row wrap">
            {isEther ? (
              <div>{cutDecimals(priceETHinUSD * freezeForX, 2)}</div>
            ) : (
              <div>
                {isInUSD
                  ? cutLongZeroNumber(
                      priceTOKENinETH * priceETHinUSD * freezeForX,
                    )
                  : cutLongZeroNumber(priceTOKENinETH * freezeForX)}
              </div>
            )}
            {isEther
              ? symbolUSD[chainId]
              : isInUSD
              ? symbolUSD[chainId]
              : chainCurrency[chainId]}
            /{isEther ? chainCurrency[chainId] : tokenSymbol}
          </div>
          <div className="token-x-under">{freezeForX}x</div>
        </div>
      </div>
    );
  };

  return (
    <>
      {isConfirmDepositModalVisible && (
        <div className="any-modal-background">
          <div className="any-modal flex column" ref={modalRef}>
            <div className="any-modal-header flex space-between center-baseline">
              {!isWaitingForTx ? <h1>Review holding</h1> : <div></div>}
              <div
                className="close-modal-icon"
                onClick={handleCloseConfirmDepositModal}
              >
                <Image
                  src={`/img/icons/close.svg`}
                  width={30}
                  height={30}
                  alt=""
                />
              </div>
            </div>
            {!isWaitingForTx ? (
              <div className="confirm-deposit-modal flex column">
                <div className="little-text micro-header">Hold</div>
                <div className="target flex space-between gapped">
                  <div className="token">
                    <div className="token-amount">
                      {cutDecimals(amount, 2)} {tokenSymbol}
                    </div>
                    <div className="token-price-under">
                      ${cutLongZeroNumber(amountUSD)}
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
                    <div className="little-text micro-header">Until</div>
                    <ToDateBlock />
                    <div className="little-text micro-header">OR Until</div>
                    <ToPriceBlock />
                  </>
                )}
                {depositType === 'Date' && (
                  <>
                    <div className="little-text micro-header">Until</div>
                    <ToDateBlock />
                  </>
                )}
                {depositType === 'Price' && (
                  <>
                    <div className="little-text micro-header">Until</div>
                    <ToPriceBlock />
                  </>
                )}
                <div className="horizontal-line"></div>
                <div className="tx-details flex column gapped-mini">
                  <div className="flex space-between">
                    <div className="little-text">Chain</div>
                    <div className="little-text">{chainIdToName[chainId]}</div>
                  </div>
                  {isValidRefCode && (
                    <div className="flex space-between">
                      <div className="little-text">Discount</div>
                      <div className="little-text">{refcode} -20%</div>
                    </div>
                  )}
                  {serviceFee && (
                    <div className="flex space-between">
                      <div className="little-text">Service fee</div>
                      <div className="little-text">
                        {cutDecimals(serviceFee, 2)} {chainCurrency[chainId]}
                      </div>
                    </div>
                  )}
                </div>
                {etherBalance < serviceFee ||
                (isEther && etherBalance < amount + serviceFee) ? (
                  <button className="large" disabled>
                    Insufficient {chainCurrency[chainId]} balance
                  </button>
                ) : (
                  <button
                    className="large"
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
                <div className="flex center little-text micro-header">
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
