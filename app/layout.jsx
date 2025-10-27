import { SidebarProvider } from '@/contexts/SidebarContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </body>
    </html>
  );
}
