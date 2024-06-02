import '../app/scss/styles.scss';
import Header from './header';
import { Web3Modal } from '../context/web3modal';

export const metadata = {
  title: 'Diamond Hands',
  description: 'Hold your coins as you planned. Never break your targets.',
  // https://nextjs.org/docs/app/building-your-application/optimizing/metadata
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Web3Modal>
          <Header />
          {children}
        </Web3Modal>
      </body>
    </html>
  )
}
