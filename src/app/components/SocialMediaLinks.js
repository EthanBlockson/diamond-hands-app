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
        href="https://discord.com/users/DiamondHandsApp"
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
        href="https://t.me/DiamondHandsApp"
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
    </div>
  );
}
