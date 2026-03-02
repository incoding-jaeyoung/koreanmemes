import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/profile/[username] - 특정 유저 프로필 조회 (공개 정보만)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const supabase = await createClient();
    const { username } = await params;
    
    // URL 디코딩 (한글 등 처리)
    const decodedUsername = decodeURIComponent(username);

    // 프로필 조회 (공개 정보만)
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, comment, main_character_id, rank_level, preferred_language, psn_id, steam_id, xbox_gamertag, discord_id, role, is_banned')
      .eq('username', decodedUsername)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: '사용자를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      throw error;
    }

    // 한줄 코멘트 번역 조회
    const { data: commentTranslations } = await supabase
      .from('profile_translations')
      .select('lang, comment')
      .eq('profile_id', profile.id);

    if (commentTranslations) {
      (profile as any).comment_translations = commentTranslations;
    }

    // 활동 통계 조회
    const [postsResult, commentsResult, likesResult] = await Promise.all([
      supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('author_id', profile.id),
      supabase
        .from('comments')
        .select('id', { count: 'exact', head: true })
        .eq('author_id', profile.id),
      supabase
        .from('post_likes')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', profile.id),
    ]);

    const stats = {
      posts: postsResult.count || 0,
      comments: commentsResult.count || 0,
      likes_given: likesResult.count || 0,
    };

    // 최근 게시글 조회 (5개)
    const { data: recentPosts } = await supabase
      .from('posts')
      .select('id, title, category, created_at, likes, views, post_translations(lang, title)')
      .eq('author_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(5);

    // 최근 댓글 조회 (5개)
    const { data: recentComments } = await supabase
      .from('comments')
      .select('id, content, created_at, post_id, posts(id, title)')
      .eq('author_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(5);

    return NextResponse.json({ 
      profile, 
      stats,
      recentPosts: recentPosts || [],
      recentComments: recentComments || [],
    });
  } catch (error: any) {
    console.error('GET /api/profile/[username] error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
