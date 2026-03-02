import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/comments?post_id=[id] - 특정 게시글의 댓글 목록 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('post_id');
    
    if (!postId) {
      return NextResponse.json(
        { error: 'post_id가 필요합니다.' },
        { status: 400 }
      );
    }
    
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    return NextResponse.json({ comments: data });
  } catch (error: any) {
    console.error('GET /api/comments error:', error);
    return NextResponse.json(
      { error: '댓글 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST /api/comments - 댓글 작성
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { post_id, content } = body;
    
    if (!post_id || !content) {
      return NextResponse.json(
        { error: '게시글 ID와 내용을 입력해주세요.' },
        { status: 400 }
      );
    }
    
    // 프로필에서 username 가져오기
    let authorName = '익명';
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profile?.username) {
        authorName = profile.username;
      }
    } catch (err) {
      console.warn('Profile fetch failed:', err);
    }
    
    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id,
        content: content.trim(),
        author_id: user.id,
        author_name: authorName,
      })
      .select()
      .single();
    
    if (error) throw error;

    // 알림 생성 (실패해도 댓글 작성은 성공으로 처리)
    try {
      const { data: post } = await supabase
        .from('posts')
        .select('author_id, title')
        .eq('id', post_id)
        .maybeSingle();

      if (post && post.author_id !== user.id) {
        await supabase.from('notifications').insert({
          user_id: post.author_id,
          type: 'comment',
          post_id,
          comment_id: data.id,
          actor_id: user.id,
          actor_name: authorName,
          post_title: post.title ?? '',
        });
      }
    } catch (notifError) {
      console.warn('Notification creation failed (non-critical):', notifError);
    }

    return NextResponse.json({ comment: data }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/comments error:', error);
    return NextResponse.json(
      { error: '댓글 작성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
