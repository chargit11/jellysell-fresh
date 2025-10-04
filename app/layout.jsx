import './globals.css';

export const metadata = {
  title: 'JellySell',
  description: 'Multi-platform marketplace management',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
