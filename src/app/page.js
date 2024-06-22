import Image from 'next/image';
import Link from 'next/link';
import SocialMediaLinks from './components/SocialMediaLinks';
import { chainIdToName } from '@/utils/chainIdToName';

export default function Home() {
  const chainNames = Object.values(chainIdToName);

  return (
    <div className="landing">
      <div className="hero flex column end">
        <div className="flex column gapped-mini">
          <h1>Hold crypto coins in stone</h1>
          <div className="info">Literally freeze it with no way out</div>
        </div>
        <div className="hero-buttons flex row gapped">
          <Link href="/hold">
            <button className="large">Use app</button>
          </Link>
          <Link href="#how-it-works">
            <button className="large nocolor">How it works</button>
          </Link>
          <Link href="#" target="_blank" rel="nofollow noopener noreferrer">
            <button className="large nocolor flex center-baseline gapped">
              <Image
                src={`/img/icons/youtube.svg`}
                width={25}
                height={25}
                alt=""
              />
              Guides
            </button>
          </Link>
        </div>
        <div className="socials flex start">
          <SocialMediaLinks size={30} isDesktop={true} />
        </div>
      </div>
      <div id="how-it-works" className="how-it-works flex column center gapped">
        <h2 className="flex center text">Don&apos;t miss again</h2>
        <div className="info">
          Chasing another X is so easy <br />
          with Diamond Hands
        </div>
        <div className="steps flex row center-baseline">
          <div className="step flex column center">
            <div>Pick a coin </div>
            <Image src={`/img/icons/coin.svg`} width={60} height={60} alt="" />
          </div>
          <Image
            className="arrow"
            src={`/img/icons/arrow-steps.svg`}
            width={40}
            height={40}
            alt=""
          />
          <div className="step flex column center">
            <div>Choose the target</div>
            <Image src={`/img/icons/chart.svg`} width={60} height={60} alt="" />
          </div>
          <Image
            className="arrow"
            src={`/img/icons/arrow-steps.svg`}
            width={40}
            height={40}
            alt=""
          />
          <div className="step flex column center">
            <div>Hold in contract</div>
            <Image
              src={`/img/icons/freeze.svg`}
              width={60}
              height={60}
              alt=""
            />
          </div>
        </div>
      </div>
      <div className="why-diamond-hands flex row center center-baseline">
        <h2>Why Diamond Hands?</h2>
        <div className="block-why flex column gapped">
          <b>Open-sourced code</b>
          <p>You can check verified contracts on GitHub or Block explorers.</p>
        </div>
        <div className="block-why flex column gapped">
          <b>Multichain support</b>
          <p>{chainNames.join(', ')} networks.</p>
        </div>
        <div className="block-why flex column gapped">
          <b>Revenue sharing</b>
          <p>
            Invite users and get 30% of collected fees forever. Directly to your
            address.
          </p>
        </div>
      </div>
      <div className="lets-go flex column center">
        <div className="flex center text">
          Stop being weak handed. No more fomo. Yes. It holds for you. Until any
          date or price.
        </div>
        <Link
          className="author flex row end center-baseline gapped"
          href="https://x.com/ethan_blockson"
          target="_blank"
          rel="nofollow noopener noreferrer"
        >
          <Image
            src={`/img/avatars/blockson.jpg`}
            width={40}
            height={40}
            alt=""
          />
          <Image src={`/img/icons/x-white.svg`} width={25} height={25} alt="" />
          <div>blockson</div>
        </Link>
        <Link href="/hold">
          <button className="large white">Try it now</button>
        </Link>
      </div>
    </div>
  );
}
