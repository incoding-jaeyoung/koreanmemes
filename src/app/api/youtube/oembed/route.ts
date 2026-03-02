import { NextRequest, NextResponse } from 'next/server';

const YOUTUBE_DOMAINS = ['youtube.com', 'www.youtube.com', 'youtu.be', 'm.youtube.com'];

function isYouTubeUrl(raw: string): boolean {
  try {
    const { hostname } = new URL(raw);
    return YOUTUBE_DOMAINS.includes(hostname);
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'URL required' }, { status: 400 });
  }

  if (!isYouTubeUrl(url)) {
    return NextResponse.json({ error: 'YouTube URL만 허용됩니다.' }, { status: 400 });
  }

  try {
    const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const response = await fetch(oEmbedUrl, {
      next: { revalidate: 86400 }, // 24시간 캐시
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch oEmbed data' }, { status: 400 });
    }

    const data = await response.json();
    return NextResponse.json({
      title: data.title ?? null,
      thumbnail_url: data.thumbnail_url ?? null,
      author_name: data.author_name ?? null,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch YouTube info' }, { status: 500 });
  }
}
