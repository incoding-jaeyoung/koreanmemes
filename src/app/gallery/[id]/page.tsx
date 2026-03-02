import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import GalleryDetailClient from './GalleryDetailClient';
import VideoObjectJsonLd, {
  extractYoutubeVideoIds,
  fetchYoutubeInfos,
} from '@/components/seo/VideoObjectJsonLd';
import { injectImageAlts, injectIframeTitles } from '@/utils/seoHtml';

export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function extractFirstImage(html: string): string | null {
  const match = /<img[^>]+src=["']([^"']+)["']/i.exec(html);
  return match ? match[1] : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from('posts')
    .select('title, content, author_name')
    .eq('id', id)
    .single();

  if (!post) {
    return { title: 'Post Not Found' };
  }

  const description = post.content
    ? post.content.replace(/<[^>]*>?/gm, '').slice(0, 160) + '...'
    : 'Virtua Fighter Media Gallery';

  const firstImage = post.content ? extractFirstImage(post.content) : null;
  const firstYoutubeId = post.content ? extractYoutubeVideoIds(post.content)[0] : undefined;
  const youtubeThumbnail = firstYoutubeId
    ? `https://img.youtube.com/vi/${firstYoutubeId}/maxresdefault.jpg`
    : null;
  const ogImages = [firstImage ?? youtubeThumbnail ?? `${siteUrl}/og-image.jpg`];

  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      authors: [post.author_name],
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: ogImages,
    },
  };
}

export default async function GalleryDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from('posts')
    .select('title, content')
    .eq('id', id)
    .single();

  const videoIds = post?.content ? extractYoutubeVideoIds(post.content) : [];
  const videos = await fetchYoutubeInfos(videoIds);

  let processedContent = post?.content ?? undefined;
  if (post?.content) {
    const titleMap = new Map(videos.map((v) => [v.videoId, v.title]));
    processedContent = injectIframeTitles(post.content, titleMap);
    processedContent = injectImageAlts(processedContent, post.title ?? '');
  }

  return (
    <>
      <VideoObjectJsonLd videos={videos} />
      <GalleryDetailClient processedContent={processedContent} />
    </>
  );
}
