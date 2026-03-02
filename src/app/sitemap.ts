import { MetadataRoute } from 'next';
import { createAdminClient } from '@/utils/supabase/admin';

// 24시간마다 재생성
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const supabase = createAdminClient();

  // 1. Static Routes
  const routes = [
    '',
    '/board',
    '/news',
    '/gallery',
    '/login',
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1,
  }));

  // 2. Dynamic Posts (Board, News, Gallery)
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, category, board_type, updated_at')
    .order('created_at', { ascending: false })
    .limit(1000);

  if (error) {
    console.error('[sitemap] posts 조회 실패:', error.message);
  }

  const postRoutes = (posts || []).map((post) => {
    let path = `/board/${post.id}`;

    if (['notice', 'update', 'event', 'official'].includes(post.category)) {
      path = `/news/${post.id}`;
    } else if (post.board_type === 'video') {
      path = `/gallery/${post.id}`;
    }

    return {
      url: `${siteUrl}${path}`,
      lastModified: new Date(post.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    };
  });

  return [...routes, ...postRoutes];
}
