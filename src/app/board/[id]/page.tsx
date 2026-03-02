import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import BoardDetailClient from './BoardDetailClient';
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
      title: 'Post Not Found',
    };
  }

  // extract text from html content
  const description = post.content
    ? post.content.replace(/<[^>]*>?/gm, '').slice(0, 160) + '...'
    : 'Virtua Fighter Community Post';

  return {
    title: post.title,
    description: description,
    openGraph: {
      title: post.title,
      description: description,
      type: 'article',
      authors: [post.author_name],
      // images included in layout.tsx will be used as default, or we can extract first image from content
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: description,
    }
  };
}

export default async function PostDetailPage({ params }: Props) {
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
      <BoardDetailClient processedContent={processedContent} />
    </>
  );
}

