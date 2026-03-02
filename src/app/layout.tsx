import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import "react-tweet/theme.css";
import { createClient } from "@/utils/supabase/server";
import { logout } from "@/app/auth/actions";
import { LanguageProvider } from "@/context/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LocationUpdater from "@/components/LocationUpdater";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next"
import { siteConfig } from "@/config/site";

export const dynamic = 'force-dynamic';

const siteUrl = siteConfig.url;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteConfig.name} | K-pop 팬 커뮤니티 | K-pop Fan Community | K-popファンコミュニティ`,
    template: `%s | ${siteConfig.name}`,
  },
  description: `${siteConfig.description} — K-pop 아티스트 소식, 팬 게시판, 다국어 자동번역(KO/EN/JA). Global K-pop fan community with artist news, fan boards & real-time AI translation. K-popファンコミュニティ — アーティスト情報・掲示板・多言語対応。`,
  keywords: [
    "K-pop", "Kpop", "K-pop community", "K-pop fan", "Korean pop music",
    "케이팝", "케이팝 커뮤니티", "K-pop 팬", "K-pop 아티스트", "팬 커뮤니티",
    "Kポップ", "Kポップコミュニティ", "韓国音楽", "ファンコミュニティ"
  ],
  alternates: {
    languages: {
      'ko': siteUrl,
      'en': siteUrl,
      'ja': siteUrl,
      'x-default': siteUrl,
    },
  },
  openGraph: {
    title: `${siteConfig.name} | K-pop 팬 커뮤니티`,
    description: `${siteConfig.description} — 아티스트 소식, 팬 게시판, 다국어 AI 자동번역. Artist news, fan boards, multilingual AI translation.`,
    url: siteUrl,
    siteName: siteConfig.name,
    locale: "en_US",
    alternateLocale: ["ko_KR", "ja_JP"],
    type: "website",
    images: [`${siteUrl}/og-image.jpg`],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | K-pop 팬 커뮤니티`,
    description: `${siteConfig.description} — 아티스트 소식, 팬 게시판, 다국어 AI 자동번역. Artist news, fan boards, multilingual AI translation.`,
    images: [`${siteUrl}/og-image.jpg`],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteConfig.name,
  alternateName: ['KpopCommunity', '케이팝 커뮤니티', 'Kポップコミュニティ', 'K-pop Fan Community'],
  url: siteUrl,
  description: `${siteConfig.description}. Supports Korean, English, and Japanese with real-time AI translation.`,
  inLanguage: ['ko-KR', 'en-US', 'ja-JP'],
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${siteUrl}/board?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteConfig.name,
  url: siteUrl,
  logo: `${siteUrl}/og-image.jpg`,
  description: `${siteConfig.description}. Available in Korean, English, and Japanese.`,
  sameAs: [],
};

function detectHtmlLang(acceptLanguage: string): string {
  const primary = acceptLanguage.split(',')[0].split(';')[0].trim().toLowerCase();
  if (primary.startsWith('ja')) return 'ja';
  if (primary.startsWith('en')) return 'en';
  return 'ko';
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';
  const htmlLang = detectHtmlLang(acceptLanguage);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const isSupabaseConfigured = supabaseUrl && !supabaseUrl.includes('your-supabase-url')

  let user = null;
  let profile = null;

  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      user = supabaseUser;

      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username, role, avatar_url')
          .eq('id', user.id)
          .single();
        profile = profileData;
      }
    } catch (e) {
      console.error('Supabase auth failed:', e);
    }
  }

  const gaId = process.env.NEXT_PUBLIC_GA_ID || "";

  return (
    <html lang={htmlLang} suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="/fonts/PretendardVariable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
      </head>
      <body className="antialiased flex flex-col min-h-screen">
        <LanguageProvider>
          <LocationUpdater />
          <Header user={user} profile={profile} logout={logout} />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </LanguageProvider>
        {gaId && <GoogleAnalytics gaId={gaId} />}
        <Analytics />
      </body>
    </html>
  );
}
