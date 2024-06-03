import Link from 'next/link';

export default function Header() {
  return (
    <div className="header flex space-between">
      <div className="left flex row center-baseline gapped">
        <h1>Diamond Hands</h1>
        <div className="menu flex row gapped">
          <Link href="/">Landing</Link>
          <Link href="/hold">Hold</Link>
          <Link href="#">Release</Link>
          <Link href="#">Earn</Link>
        </div>
      </div>
      <div className="right">
        <w3m-button />
      </div>
    </div>
  );
}
