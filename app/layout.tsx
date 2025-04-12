// app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { UserContextProvider } from '@/context/UserContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Real Estate Website',
  description: 'Find your dream property',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserContextProvider>
          <Header />
          <main className="min-h-screen bg-gray-50">{children}</main>
          <Footer />
        </UserContextProvider>
      </body>
    </html>
  );
}
