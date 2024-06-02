import Link from 'next/link'

export default function Header() {
    return (
        <div>
            <h1>Diamond Hands</h1>
            <div className='menu flex row gapped'>
                <Link href="/">Landing</Link>
                <Link href="/hold">Hold</Link>
                <Link href="#">Release</Link>
                <Link href="#">Earn</Link>
            </div>
            <w3m-button />
        </div>
    )
}