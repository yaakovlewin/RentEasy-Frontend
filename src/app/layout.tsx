import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { DynamicHeader } from '@/components/layout/DynamicHeader';
import { DynamicLayout } from '@/components/layout/DynamicLayout';
import { Footer } from '@/components/layout/Footer';

import { ContextErrorBoundary } from '@/components/error-boundaries/ContextErrorBoundary';
import { GlobalErrorBoundary } from '@/components/error-boundaries/GlobalErrorBoundary';

import { AuthProvider } from '@/contexts/AuthContext';
import { SearchProvider } from '@/contexts/SearchContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { UIStateProvider } from '@/contexts/UIStateContext';

import { NotificationContainer } from '@/components/ui/NotificationContainer';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'RentEasy - Your Perfect Vacation Rental',
  description:
    'Discover unique vacation rentals around the world with RentEasy. Book your perfect stay with confidence.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <GlobalErrorBoundary>
          <ContextErrorBoundary contextName="UIStateProvider">
            <UIStateProvider>
              <ContextErrorBoundary contextName="NotificationProvider">
                <NotificationProvider>
                  <ContextErrorBoundary contextName="AuthProvider">
                    <AuthProvider>
                      <ContextErrorBoundary contextName="SearchProvider">
                        <SearchProvider>
                          <DynamicHeader />
                          <DynamicLayout>{children}</DynamicLayout>
                          <Footer />
                          
                          {/* Global notification container */}
                          <NotificationContainer position="top-right" />
                        </SearchProvider>
                      </ContextErrorBoundary>
                    </AuthProvider>
                  </ContextErrorBoundary>
                </NotificationProvider>
              </ContextErrorBoundary>
            </UIStateProvider>
          </ContextErrorBoundary>
        </GlobalErrorBoundary>
      </body>
    </html>
  );
}
