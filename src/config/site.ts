export const siteConfig = {
  name: 'Kpop Community',
  description: 'Global K-pop fan community',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  defaultLocale: 'ko',
} as const;
