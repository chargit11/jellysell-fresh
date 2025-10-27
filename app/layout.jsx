import { SidebarProvider } from '@/contexts/SidebarContext';
import './globals.css';

export const metadata = {
  title: 'JellySell',
  description: 'Your eBay management platform',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </body>
    </html>
  )
}
