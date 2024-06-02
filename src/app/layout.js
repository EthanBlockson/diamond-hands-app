import '../app/scss/styles.scss';

export const metadata = {
  title: 'Diamond Hands',
  description: 'Hold your coins as you planned. Never break your targets.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
