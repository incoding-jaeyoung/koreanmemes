import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { headers } from 'next/headers';

// POST /api/posts/[id]/view - 조회수 1 증가 (IP 기반 24시간 중복 방지)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // IP 추출
    const headersList = await headers();
    const forwarded = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const ip = forwarded?.split(',')[0].trim() ?? realIp ?? 'unknown';

    // IP + postId 조합으로 해시 생성 (레인보우 테이블 방어)
    const ipHash = createHash('sha256').update(ip + id).digest('hex');

    // SECURITY DEFINER 함수로 RLS 우회 (비로그인 포함 조회수 증가)
    const { data, error } = await supabase.rpc('increment_view_count', {
      p_post_id: id,
      p_ip_hash: ipHash,
    });

    if (error) throw error;

    return NextResponse.json({ success: true, views: data.views, counted: data.counted });
  } catch (error: any) {
    console.error('POST /api/posts/[id]/view error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
