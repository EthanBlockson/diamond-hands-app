import Link from 'next/link';
import Image from 'next/image';

export default function SocialMediaLinks({ size, isDesktop }) {
  return (
    <div
      className={`flex row ${
        isDesktop ? 'socials-desktop end' : 'socials-mobile center-baseline end'
      }`}
    >
      <Link
        href="https://x.com/DiamondHandsXXX"
        target="_blank"
        rel="nofollow noopener noreferrer"
      >
        <Image src={`/img/icons/x.svg`} width={size} height={size} alt="" />
      </Link>
      <Link
        href="https://discord.com/users/diamond_hands_app"
        target="_blank"
        rel="nofollow noopener noreferrer"
      >
        <Image
          src={`/img/icons/discord.svg`}
          width={size}
          height={size}
          alt=""
        />
      </Link>
      <Link
        href="https://t.me/diamond_hands_app"
        target="_blank"
        rel="nofollow noopener noreferrer"
      >
        <Image
          src={`/img/icons/telegram.svg`}
          width={size}
          height={size}
          alt=""
        />
      </Link>
      {isDesktop && (
        <>
          <Link
            href="https://www.youtube.com/@diamond_hands_app"
            target="_blank"
            rel="nofollow noopener noreferrer"
          >
            <Image
              src={`/img/icons/youtube.svg`}
              width={size}
              height={size}
              alt=""
            />
          </Link>
          <Link
            href="https:/github.com/#"
            target="_blank"
            rel="nofollow noopener noreferrer"
          >
            <Image
              src={`/img/icons/github.svg`}
              width={size}
              height={size}
              alt=""
            />
          </Link>
        </>
      )}
    </div>
  );
}
