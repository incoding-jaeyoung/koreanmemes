import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/posts/[id]/like - 좋아요 토글
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { id: postId } = await params;

    const { data, error } = await supabase.rpc('toggle_post_like', {
      p_post_id: postId,
    });

    if (error) {
      console.error('toggle_post_like rpc error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 좋아요가 추가된 경우에만 알림 생성 (취소는 알림 없음)
    const liked = data?.liked ?? data === true;
    if (liked) {
      try {
        const { data: post } = await supabase
          .from('posts')
          .select('author_id, title')
          .eq('id', postId)
          .maybeSingle();

        if (post && post.author_id !== user.id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', user.id)
            .maybeSingle();

          const actorName = profile?.username || user.email?.split('@')[0] || '';

          await supabase.from('notifications').insert({
            user_id: post.author_id,
            type: 'like',
            post_id: postId,
            actor_id: user.id,
            actor_name: actorName,
            post_title: post.title ?? '',
          });
        }
      } catch (notifError) {
        console.warn('Notification creation failed (non-critical):', notifError);
      }
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('POST /api/posts/[id]/like error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// GET /api/posts/[id]/like - 현재 사용자의 좋아요 상태 확인
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ liked: false });
    }

    const { id: postId } = await params;

    const { data } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .maybeSingle();

    return NextResponse.json({ liked: !!data });
  } catch (error: any) {
    console.error('GET /api/posts/[id]/like error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
