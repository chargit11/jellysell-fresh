import './globals.css';

export const metadata = {
  title: 'JellySell',
  description: 'The fastest way to sell something.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
