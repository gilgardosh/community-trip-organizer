import type React from 'react';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { Suspense } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { AppProvider } from '@/contexts/AppContext';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import { MainNav } from '@/components/layout/MainNav';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

/* Updated font configuration to use proper Next.js font loading */
const geistSans = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'טיולי השכונה',
  description: 'אפליקציה לתכנון טיולים משפחתיים בשכונה',
  generator: 'v0.app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="font-sans">
        <ErrorBoundary>
          <AuthProvider>
            <NotificationProvider>
              <AppProvider>
                <MainNav />
                <Suspense fallback={null}>{children}</Suspense>
                <Toaster />
              </AppProvider>
            </NotificationProvider>
          </AuthProvider>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  );
}
