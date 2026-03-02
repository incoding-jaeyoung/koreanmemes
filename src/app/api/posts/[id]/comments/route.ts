import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/posts/[id]/comments - 댓글 목록 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: postId } = await params;

    // 댓글 조회
    const { data: comments, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true }); // 오래된 순으로 정렬 (대댓글 구조 만들기 위해)

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json({ comments: [] });
    }

    const commentList = comments || [];

    // 작성자 정보 (country, avatar_url) 별도 조회 후 매핑
    if (commentList.length > 0) {
      const authorIds = [...new Set(commentList.map((c) => c.author_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, country, avatar_url, rank_level')
        .in('id', authorIds);

      const profileMap: Record<string, { country: string | null; avatar_url: string | null; rank_level: number | null }> = {};
      (profiles ?? []).forEach((p) => {
        profileMap[p.id] = {
          country: p.country ?? null,
          avatar_url: p.avatar_url ?? null,
          rank_level: p.rank_level ?? null,
        };
      });

      commentList.forEach((c) => {
        (c as any).author_country = profileMap[c.author_id]?.country || null;
        (c as any).author_avatar = profileMap[c.author_id]?.avatar_url || null;
        (c as any).author_rank_level = profileMap[c.author_id]?.rank_level ?? null;
      });
    }

    // 번역 별도 조회 후 댓글에 붙이기 (FK 관계 없이 안전하게 처리)
    if (commentList.length > 0) {
      const commentIds = commentList.map((c) => c.id);
      const { data: translations } = await supabase
        .from('comment_translations')
        .select('comment_id, lang, content')
        .in('comment_id', commentIds);

      const trMap: Record<string, { lang: string; content: string }[]> = {};
      (translations ?? []).forEach((tr) => {
        if (!trMap[tr.comment_id]) trMap[tr.comment_id] = [];
        trMap[tr.comment_id].push({ lang: tr.lang, content: tr.content });
      });

      commentList.forEach((c) => {
        (c as any).comment_translations = trMap[c.id] ?? [];
      });
    }

    return NextResponse.json({ comments: commentList });
  } catch (error: any) {
    console.error('GET /api/posts/[id]/comments error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/posts/[id]/comments - 댓글 작성
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: postId } = await params;
    
    // 세션 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 요청 본문 파싱
    const body = await request.json();
    const { content, parent_id, reply_to_comment_id, author_name, image_url, image_public_id } = body;

    if (!content?.trim() && !image_url) {
      return NextResponse.json(
        { error: 'Content or image is required' },
        { status: 400 }
      );
    }

    // image_public_id 경로 검증 (본인 폴더만 허용)
    if (image_public_id && !image_public_id.startsWith(`vf6/images/${user.id}/`)) {
      return NextResponse.json({ error: 'Invalid image ownership' }, { status: 403 });
    }

    // 프로필에서 닉네임(username) 가져오기
    let authorNickname = author_name || user.email?.split('@')[0] || '익명';
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profile?.username) {
        authorNickname = profile.username;
      }
    } catch (err) {
      console.warn('Profile fetch failed:', err);
    }

    // 댓글 저장
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        author_id: user.id,
        author_name: authorNickname,
        content: content ?? '',
        parent_id: parent_id || null,
        reply_to_comment_id: reply_to_comment_id || null,
        image_url: image_url || null,
        image_public_id: image_public_id || null,
      })
      .select()
      .single();

    if (error) throw error;

    // 알림 생성 (실패해도 댓글 작성은 성공으로 처리)
    try {
      const notificationsToInsert: any[] = [];

      if (parent_id) {
        // 대댓글: reply_to_comment_id가 있으면 실제 답글 대상, 없으면 parent_id 기준
        const notifyCommentId = reply_to_comment_id || parent_id;
        const { data: parentComment } = await supabase
          .from('comments')
          .select('author_id')
          .eq('id', notifyCommentId)
          .maybeSingle();

        if (parentComment && parentComment.author_id !== user.id) {
          // 게시글 제목 조회
          const { data: post } = await supabase
            .from('posts')
            .select('title')
            .eq('id', postId)
            .maybeSingle();

          notificationsToInsert.push({
            user_id: parentComment.author_id,
            type: 'reply',
            post_id: postId,
            comment_id: comment.id,
            actor_id: user.id,
            actor_name: authorNickname,
            post_title: post?.title ?? '',
          });
        }
      } else {
        // 댓글: 게시글 작성자에게 'comment' 알림
        const { data: post } = await supabase
          .from('posts')
          .select('author_id, title')
          .eq('id', postId)
          .maybeSingle();

        if (post && post.author_id !== user.id) {
          notificationsToInsert.push({
            user_id: post.author_id,
            type: 'comment',
            post_id: postId,
            comment_id: comment.id,
            actor_id: user.id,
            actor_name: authorNickname,
            post_title: post.title ?? '',
          });
        }
      }

      if (notificationsToInsert.length > 0) {
        await supabase.from('notifications').insert(notificationsToInsert);
      }
    } catch (notifError) {
      console.warn('Notification creation failed (non-critical):', notifError);
    }

    return NextResponse.json({ comment });
  } catch (error: any) {
    console.error('POST /api/posts/[id]/comments error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
