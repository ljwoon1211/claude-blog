import type { Metadata } from 'next';
import { Fraunces, IBM_Plex_Mono } from 'next/font/google';

import { Footer } from '@/shared/layout/footer';
import { Header } from '@/shared/layout/header';
import { Toaster } from '@/shared/ui/sonner';

import './globals.css';
import { Providers } from './providers';

const fraunces = Fraunces({
  variable: '--font-display',
  subsets: ['latin'],
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? 'https://localhost:3000',
  ),
  title: {
    default: 'Devlog.',
    template: '%s | Devlog.',
  },
  description: '기술을 탐구하고, 배움을 기록하고, 성장을 공유하는 공간',
  openGraph: {
    type: 'website',
    siteName: 'Devlog.',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Devlog."
          href="/feed.xml"
        />
      </head>
      <body
        className={`${fraunces.variable} ${ibmPlexMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
