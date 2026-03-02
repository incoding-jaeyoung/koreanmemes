import { Fragment } from 'react';

interface VideoInfo {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  embedUrl: string;
}

interface VideoObjectJsonLdProps {
  videos: VideoInfo[];
}

/**
 * 게시글 본문의 YouTube 영상에 대한 JSON-LD VideoObject 스키마를 렌더링합니다.
 * Server Component에서만 사용하세요.
 */
export default function VideoObjectJsonLd({ videos }: VideoObjectJsonLdProps) {
  if (videos.length === 0) return null;

  const schemas = videos.map((video) => ({
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    thumbnailUrl: video.thumbnailUrl,
    embedUrl: video.embedUrl,
    potentialAction: {
      '@type': 'WatchAction',
      target: video.embedUrl,
    },
  }));

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}

/** HTML content에서 YouTube video ID 목록을 추출합니다. */
export function extractYoutubeVideoIds(html: string): string[] {
  const regex = /youtube(?:-nocookie)?\.com\/embed\/([a-zA-Z0-9_-]{11})/g;
  const ids: string[] = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    ids.push(match[1]);
  }
  return [...new Set(ids)];
}

/** YouTube video ID로부터 oEmbed 정보를 서버에서 가져옵니다. */
export async function fetchYoutubeInfos(videoIds: string[]): Promise<VideoInfo[]> {
  if (videoIds.length === 0) return [];

  const results = await Promise.allSettled(
    videoIds.map(async (id) => {
      const videoUrl = `https://www.youtube.com/watch?v=${id}`;
      const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;
      const res = await fetch(oEmbedUrl, { next: { revalidate: 86400 } });
      if (!res.ok) throw new Error(`oEmbed failed for ${id}`);
      const data = await res.json();
      return {
        videoId: id,
        title: data.title ?? id,
        thumbnailUrl: data.thumbnail_url ?? `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
        embedUrl: `https://www.youtube.com/embed/${id}`,
      } satisfies VideoInfo;
    })
  );

  return results
    .filter((r): r is PromiseFulfilledResult<VideoInfo> => r.status === 'fulfilled')
    .map((r) => r.value);
}
