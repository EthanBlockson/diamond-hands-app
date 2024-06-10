import '../app/scss/styles.scss';
import Header from './header';
import { Web3Modal } from '../context/web3modal';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'Diamond Hands',
  description: 'Hold your coins as you planned. Never break your targets.',
  // https://nextjs.org/docs/app/building-your-application/optimizing/metadata
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Web3Modal>
          <Toaster
            toastOptions={{
              duration: 7000,
              position: 'bottom-center',
              icon: false,
              style: {
                zIndex: 9999,
                background: '#fff',
                color: '#333',
                // boxShadow: 'none',
              },
              error: {
                style: {
                  backgroundColor: 'red',
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
        </Web3Modal>
      </body>
    </html>
  );
}
