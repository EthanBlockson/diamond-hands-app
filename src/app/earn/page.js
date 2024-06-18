'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import {
  useWeb3Modal,
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from '@web3modal/ethers5/react';
import { createMyRefCode } from '@/calls/createMyRefCode';
import { getRefs } from '@/calls/getRefs';
import cutDecimals from '@/utils/cutDecimals';
import { chainIdToName } from '@/utils/chainIdToName';
import toast from 'react-hot-toast';
import { LoadingComponent } from '../components/LoadingComponent';

export default function Earn() {
  const { open } = useWeb3Modal();
  const { walletProvider } = useWeb3ModalProvider();
  const { address, chainId } = useWeb3ModalAccount();

  const [isLoaded, setIsLoaded] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [isWrongCode, setIsWrongCode] = useState(false);
  const [myCode, setMyCode] = useState(undefined);
  const [totalInvited, setTotalInvited] = useState(undefined);
  const [totalProfit, setTotalProfit] = useState(undefined);

  useEffect(() => {
    setIsLoaded(false);
    if (address && chainId) {
      callGetRefs();
    } else {
      clearAll();
    }
    setIsLoaded(true);
  }, [address, chainId]);

  const callGetRefs = async () => {
    const { refcodeString, totalRefs, totalRefGainsNumber } = await getRefs(
      chainId,
      walletProvider,
      address,
    );
    setMyCode(refcodeString);
    setTotalInvited(totalRefs);
    setTotalProfit(totalRefGainsNumber);
  };

  const callCreateMyRefCode = async () => {
    const creation = await createMyRefCode(
      chainId,
      walletProvider,
      address,
      newCode,
    );
    if (creation) {
      toast.success('New refcode created successfully');
      callGetRefs();
    } else {
      {
        toast.error('Refcode creation returned error');
      }
    }
  };

  const handleInputRefcode = (event) => {
    const value = event.target.value.toUpperCase();
    const regex = /^[A-Za-z0-9]{0,16}$/;
    if (regex.test(value)) {
      setNewCode(value);
      setIsWrongCode(false);
    } else {
      setNewCode(value);
      setIsWrongCode(true);
    }
  };

  const handleBufferCopied = (refcode) => {
    const link = `https://diamond-hands.app/invite/${refcode}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard');
  };

  const clearAll = () => {
    setMyCode(undefined);
    setTotalInvited(undefined);
    setTotalProfit(undefined);
  };

  return (
    <>
      {isLoaded ? (
        <div className="earn flex column center">
          <h1>Earn with referrals</h1>
          <div className="details flex column center">
            <Image
              src={`/img/icons/promo.svg`}
              width={140}
              height={140}
              alt=""
            />
            <div className="flex column center gapped-mini">
              <div>
                Get <b>30% share</b> of each deposit or withdrawal fees{' '}
                <u>forever</u>
              </div>
              <div>Invited user get 20% discount on deposits</div>
            </div>
          </div>
          {!address ? (
            <div className="connection flex">
              {!address && (
                <button className="large" onClick={() => open()}>
                  Connect wallet
                </button>
              )}
            </div>
          ) : (
            <>
              {myCode ? (
                <>
                  <div
                    className="form flex column"
                    onClick={() => handleBufferCopied(myCode)}
                  >
                    <div>My referral link</div>
                    <div className="copy-refcode flex row gapped">
                      <input
                        className="link"
                        type="text"
                        value={`diamond-hands.app/invite/${myCode}`}
                        readOnly
                      />
                      <button className="mini">Copy</button>
                    </div>
                  </div>
                  <div className="form flex column center">
                    <div>Total referrals ({chainIdToName[chainId]} chain)</div>
                    <div className="earned-ether flex">{totalInvited}</div>
                  </div>
                  <div className="form flex column center">
                    <div>Total earnings ({chainIdToName[chainId]} chain)</div>
                    <div className="earned-ether flex">
                      {cutDecimals(totalProfit)} ETH
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="form flex column">
                    <div>Create your refcode to start inviting</div>
                    <div className="create-refcode flex row gapped">
                      <input
                        autoFocus
                        className="code"
                        type="text"
                        autoComplete="off"
                        placeholder="SATOSHI"
                        value={newCode}
                        onChange={handleInputRefcode}
                      />
                      <button
                        className="mini"
                        disabled={!address || isWrongCode || !newCode}
                        onClick={callCreateMyRefCode}
                      >
                        Create
                      </button>
                    </div>
                    {isWrongCode && (
                      <div>*Only latin letters and numbers is allowed</div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      ) : (
        <LoadingComponent />
      )}
    </>
  );
}
