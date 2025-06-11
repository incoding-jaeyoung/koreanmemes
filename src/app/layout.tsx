import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/lib/auth";
import { Analytics } from "@vercel/analytics/next"



const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://www.koreanmemes.net'),
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
    url: 'https://www.koreanmemes.net',
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
    canonical: 'https://www.koreanmemes.net',
    languages: {
      'en-US': 'https://www.koreanmemes.net',
      'ko-KR': 'https://www.koreanmemes.net/ko',
    },
  },
  category: 'entertainment',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Korean Memes Hub',
  description: 'Korean culture and memes sharing platform',
  url: 'https://www.koreanmemes.net',
  potentialAction: {
    '@type': 'SearchAction',
          target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.koreanmemes.net/search?q={search_term_string}',
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
      url: 'https://www.koreanmemes.net/logo.png',
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
          suppressHydrationWarning
        />
        
        {/* Google Search Console 인증 - 실제 인증 코드로 교체 필요 */}
        <meta name="google-site-verification" content="hYSxfyjTyopTQGmDREZ1TdEV6RueIoe5_f_qjwZYopM" />
        
        {/* 추가 메타 태그 */}
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        
        {/* 사이트 브랜딩 */}
        <meta name="application-name" content="Korean Memes Hub" />
        <meta name="apple-mobile-web-app-title" content="Korean Memes" />
        <meta name="msapplication-TileColor" content="#3B82F6" />
        
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://www.koreanmemes.net" />
        <link rel="dns-prefetch" href="https://www.koreanmemes.net" />
        
        {/* Canonical link */}
        <link rel="canonical" href="https://www.koreanmemes.net" />
        
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🇰🇷</text></svg>" />
        <meta name="theme-color" content="#3B82F6" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" 
          rel="stylesheet" 
        />
        
        {/* Rich Snippets을 위한 추가 구조화 데이터 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Korean Memes Hub",
              "url": "https://www.koreanmemes.net",
              "description": "Platform for sharing Korean culture and humor with global audience",
              "applicationCategory": "EntertainmentApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": [
                "Korean meme sharing",
                "Cultural content translation", 
                "K-Drama discussions",
                "Korean humor community",
                "Image translation tools"
              ],
              "browserRequirements": "Requires JavaScript. Requires HTML5."
            })
          }}
          suppressHydrationWarning
        />
        
        {/* Google Analytics - Korean Memes Hub 전용 추적 코드 */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-9EBVKYDG3R" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-9EBVKYDG3R', {
                page_title: 'Korean Memes Hub',
                page_location: 'https://www.koreanmemes.net'
              });
            `,
          }}
        />
        
        {/* 페이지 로딩 성능 최적화 */}
        <link rel="prefetch" href="/api/posts" />
        <link rel="preload" href="/fonts/korean-font.woff2" as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
        <Header />
          <main className="container flex-1 px-4 py-8 mx-auto">
          {children}
        </main>
          <Footer />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
