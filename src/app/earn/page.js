'use client';

import { useState, useEffect } from 'react';
import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from '@web3modal/ethers5/react';
import { createMyRefCode } from '@/calls/createMyRefCode';
import { getRefs } from '@/calls/getRefs';
import cutDecimals from '@/utils/cutDecimals';
import { chainIdToName } from '@/utils/chainIdToName';
import toast from 'react-hot-toast';

export default function Earn() {
  const { walletProvider } = useWeb3ModalProvider();
  const { address, chainId } = useWeb3ModalAccount();

  const [isConnected, setIsConnected] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [isWrongCode, setIsWrongCode] = useState(false);
  const [myCode, setMyCode] = useState(undefined);
  const [totalInvited, setTotalInvited] = useState(undefined);
  const [totalProfit, setTotalProfit] = useState(undefined);

  useEffect(() => {
    if (address && chainId) {
      setIsConnected(true);
      callGetRefs();
    } else {
      setIsConnected(false);
    }
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

  return (
    <>
      {myCode === undefined ||
      totalInvited === undefined ||
      totalProfit === undefined ? (
        <div>Loading...</div>
      ) : (
        <>
          {isConnected ? (
            <div className="earn flex column center">
              <h1>Earn with referrals</h1>
              <div className="details flex column center">
                <div>
                  Get 30% share of all deposit or withdrawal fees forever
                </div>
                <div>Invited user get 20% discount on deposits</div>
              </div>
              {myCode ? (
                <>
                  <div className="form flex column">
                    <div>My referral link</div>
                    <div className="copy-refcode flex row gapped">
                      <input
                        className="link"
                        type="text"
                        value={`https://diamond-hands.app/invite/${myCode}`}
                        readOnly
                      />
                      <button onClick={() => handleBufferCopied(myCode)}>
                        Copy
                      </button>
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
                <div className="form flex column">
                  <div>Create your refcode to start inviting</div>
                  <div className="create-refcode flex row gapped">
                    <input
                      className="code"
                      type="text"
                      autoComplete="off"
                      placeholder="MYCODE"
                      value={newCode}
                      onChange={handleInputRefcode}
                    />
                    <button
                      disabled={isWrongCode || !newCode}
                      onClick={callCreateMyRefCode}
                    >
                      Create
                    </button>
                  </div>
                  {isWrongCode && (
                    <div>*Only latin letters and numbers is allowed</div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div>Waiting for wallet connection...</div>
          )}
        </>
      )}
    </>
  );
}
