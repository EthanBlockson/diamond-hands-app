import Link from 'next/link';

export default function Header() {
  return (
    <div className="header flex space-between">
      <div className="left flex row center-baseline gapped">
        <Link href="/">
          <h1>Diamond Hands</h1>
        </Link>
        <div className="menu flex row gapped">
          <Link href="/hold">Hold</Link>
          <Link href="#">My holdings</Link>
          <Link href="/earn">Earn</Link>
        </div>
      </div>
      <div className="right">
        <w3m-button />
      </div>
    </div>
  );
}
