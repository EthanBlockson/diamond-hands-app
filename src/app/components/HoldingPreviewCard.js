import Image from 'next/image';
import {
  useWeb3Modal,
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from '@web3modal/ethers5/react';

export default function HoldingPreviewCard({ id }) {
  const { walletProvider } = useWeb3ModalProvider();
  const { address, chainId } = useWeb3ModalAccount();

  return (
    <div>
      <div className="chain-logo flex end">
        <Image
          src={`/img/chains/${chainId}.svg`}
          width={25}
          height={25}
          alt=""
        />
      </div>
      <div>{id}</div>
      <div className="token-header">
        <div className="token-amount">
          0.0001
          {/* {cutLongZeroNumber(holdingInfo.amount)} */}
        </div>
        <div className="token-name">
          PEPE (Pepe Coin)
          {/* {holdingInfo.isPureEther
        ? chainCurrency[chainId]
        : holdingTokenData
        ? `${holdingTokenData.symbol} (${holdingTokenData.name})`
        : '...'} */}
        </div>
      </div>
      <div className="progresses flex column gapped">
        <div className="progress-mini flex column">
          <div>until 28 May, 2024</div>
          <div className="progress-bar date">
            <div
              className="elapsed date"
              style={{
                width: `${50}%`,
              }}
            ></div>
          </div>
        </div>
        <div className="progress-mini flex column unavailable">
          <div>until -0.0001 ETH/PEPE</div>
          {/* <div>Price target wasnt set</div> */}
          <div className="progress-bar price">
            <div
              className="elapsed price"
              style={{
                width: `${0}%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
