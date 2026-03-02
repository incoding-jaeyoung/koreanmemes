import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    rules: [
      {
        // 일반 크롤러: 공개 API는 허용, 민감한 경로만 차단
        userAgent: '*',
        allow: [
          '/',
          '/llms.txt',
          '/api/posts/',
          '/api/board/',
          '/api/news/',
          '/api/gallery/',
          '/api/comments/',
        ],
        disallow: [
          '/admin/',
          '/api/auth/',
          '/api/admin/',
          '/api/upload/',
          '/api/profile/',
          '/api/posts/*/like',
          '/api/posts/*/view',
          '/api/posts/*/pin',
          '/api/posts/*/translate',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
