import Link from 'next/link';
import Image from 'next/image';

export default function SocialMediaLinks({ size, isDesktop, isLanding }) {
  return (
    <div
      className={`flex row ${
        isDesktop
          ? 'socials-desktop end'
          : isLanding
          ? 'socials-landing end'
          : 'socials-mobile center-baseline end'
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
        href="https://discord.gg/89DgsTx2"
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
        href="https://t.me/diamond_hands_chat"
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
      {isDesktop ||
        (isLanding && (
          <>
            <Link
              href="https://youtube.com/@diamond_hands_app"
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
              href="https://github.com/Diamond-Hands-App"
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
        ))}
    </div>
  );
}
