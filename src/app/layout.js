import '../app/scss/styles.scss';
import Header from './header';
import Footer from './footer';
import { Web3Modal } from '../context/web3modal';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'Diamond Hands ◆ Hold crypto tokens for sure',
  description:
    'Hold your coins as you planned. Never break your targets. Freeze them to exact date or X price growth in ETH or USD.',
  // https://nextjs.org/docs/app/building-your-application/optimizing/metadata
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex column">
        <Web3Modal>
          <Toaster
            toastOptions={{
              duration: 5000,
              position: 'top-center',
              icon: false,
              style: {
                zIndex: 9999,
                background: '#40e0d0',
                color: '#fff',
                boxShadow: 'none',
              },
              error: {
                style: {
                  backgroundColor: '#222',
                  color: '#fff',
                },
              },
            }}
            containerStyle={{
              bottom: 50,
            }}
            containerClassName="toasts"
          />
          <Header />
          {children}
          <Footer />
        </Web3Modal>
      </body>
    </html>
  );
}
