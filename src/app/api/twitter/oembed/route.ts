import { NextRequest, NextResponse } from 'next/server';

/**
 * Twitter oEmbed API 프록시
 * 클라이언트에서 직접 호출할 수 없으므로 서버에서 프록시
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&theme=dark&dnt=true&omit_script=true`;
    // 동일 URL은 24시간 캐시 (트윗 내용은 거의 변경되지 않음)
    const response = await fetch(oembedUrl, {
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      throw new Error("Twitter oEmbed API failed");
    }

    const data = await response.json();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error('Twitter oEmbed error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tweet' },
      { status: 500 }
    );
  }
}
