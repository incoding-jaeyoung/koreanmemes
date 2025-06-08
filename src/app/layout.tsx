import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/lib/auth";

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: {
    default: 'Korean Memes & Culture Hub - Share & Discover K-Culture',
    template: '%s | Korean Memes Hub'
  },
  description: 'Discover and share the best Korean memes, culture, and humor. Connect Korean culture with the world through translated content, K-Drama discussions, and cultural insights.',
  keywords: [
    'Korean memes',
    'K-culture',
    'Korean humor',
    'K-drama',
    'Korean lifestyle',
    'Korean community',
    'Korean translation',
    'Korean entertainment',
    'Korean trends',
    'K-pop culture',
    'Korean language',
    'Korean society'
  ],
  authors: [{ name: 'Korean Memes Hub Team' }],
  creator: 'Korean Memes Hub',
  publisher: 'Korean Memes Hub',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['ko_KR'],
    url: 'http://localhost:3000',
    siteName: 'Korean Memes Hub',
    title: 'Korean Memes & Culture Hub - Share & Discover K-Culture',
    description: 'Discover and share the best Korean memes, culture, and humor. Connect Korean culture with the world through translated content.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Korean Memes Hub - Korean Culture Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@KoreanMemesHub',
    creator: '@KoreanMemesHub',
    title: 'Korean Memes & Culture Hub',
    description: 'Discover and share the best Korean memes, culture, and humor with the world.',
    images: ['/twitter-image.jpg'],
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  alternates: {
    canonical: 'http://localhost:3000',
    languages: {
      'en-US': 'http://localhost:3000',
      'ko-KR': 'http://localhost:3000/ko',
    },
  },
  category: 'entertainment',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Korean Memes Hub',
  description: 'Korean culture and memes sharing platform',
  url: 'http://localhost:3000',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'http://localhost:3000/search?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
  sameAs: [
    'https://twitter.com/KoreanMemesHub',
    'https://www.instagram.com/koreanmemeshub',
    'https://www.youtube.com/c/koreanmemeshub',
  ],
  publisher: {
    '@type': 'Organization',
    name: 'Korean Memes Hub',
    logo: {
      '@type': 'ImageObject',
      url: 'http://localhost:3000/logo.png',
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🇰🇷</text></svg>" />
        <meta name="theme-color" content="#3B82F6" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
        <Header />
          <main className="container mx-auto px-4 py-8 flex-1">
          {children}
        </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
