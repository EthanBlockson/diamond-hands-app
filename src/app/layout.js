import '../app/scss/styles.scss';
import { isDevMode } from '../../isDevMode';
import { Suspense } from 'react';
import Script from 'next/script';
import Header from './header';
import Footer from './footer';
import { Web3Modal } from '../context/web3modal';
import { Toaster } from 'react-hot-toast';
import { GoogleAnalytics } from '@next/third-parties/google';
import { YandexMetrika } from '@/context/YandexMetrika';

export const metadata = {
  title: 'Diamond Hands ◆ Freeze your crypto coins',
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
          {!isDevMode && (
            <>
              <Script id="metrika-counter" strategy="afterInteractive">
                {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                      m[i].l=1*new Date();
                      for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                      k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
                      (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
         
                      ym(97648185, "init", {
                            defer: true,
                            clickmap:true,
                            trackLinks:true,
                            accurateTrackBounce:true,
                            webvisor:true
                      });`}
              </Script>
              <Suspense fallback={<></>}>
                <YandexMetrika />
              </Suspense>
              <GoogleAnalytics gaId="G-HH1Z9FFRQF" />
            </>
          )}
          <Header />
          {children}
          <Footer />
        </Web3Modal>
      </body>
    </html>
  );
}
