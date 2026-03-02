import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import NewsDetailClient from './NewsDetailClient';
import VideoObjectJsonLd, {
  extractYoutubeVideoIds,
  fetchYoutubeInfos,
} from '@/components/seo/VideoObjectJsonLd';
import { injectImageAlts, injectIframeTitles } from '@/utils/seoHtml';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
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
    return {
      title: 'News Not Found',
    };
  }

  const description = post.content
    ? post.content.replace(/<[^>]*>?/gm, '').slice(0, 160) + '...'
    : 'Virtua Fighter News';

  return {
    title: post.title,
    description: description,
    openGraph: {
      title: post.title,
      description: description,
      type: 'article',
      authors: [post.author_name],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: description,
    }
  };
}

export default async function NewsDetailPage({ params }: Props) {
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
      <NewsDetailClient processedContent={processedContent} />
    </>
  );
}

