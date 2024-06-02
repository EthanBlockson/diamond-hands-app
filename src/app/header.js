import Link from 'next/link'

export default function Header() {
    return (
        <div>
            <h1>Logo</h1>
            <div className='menu flex row'>
                <Link href="/">Home</Link>
                <Link href="/landing">Landing</Link>
            </div>
            <w3m-button />
        </div>
    )
}