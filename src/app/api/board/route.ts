import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/board - 게시글 목록 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    const search = searchParams.get('search') || '';
    
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // 자유게시판 전용 (board_type='general') — posts_with_comments 뷰로 N+1 해결
    let query = supabase.from('posts_with_comments').select('*', { count: 'exact' }).eq('board_type', 'general');

    if (search) {
      const s = search.replace(/[\\%_]/g, '\\$&');
      query = query.or(`title.ilike.%${s}%,content.ilike.%${s}%`);
    }

    const { data: posts, error, count } = await query
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    // post_translations 별도 조회 후 merge
    const postIds = (posts || []).map((p) => p.id);
    let translationsMap: Record<string, any[]> = {};
    if (postIds.length > 0) {
      const { data: translations } = await supabase
        .from('post_translations')
        .select('post_id, lang, title')
        .in('post_id', postIds);
      for (const tr of translations || []) {
        if (!translationsMap[tr.post_id]) translationsMap[tr.post_id] = [];
        translationsMap[tr.post_id].push(tr);
      }
    }

    // 작성자 프로필에서 rank_level 조회 (게시판 단위 표시용)
    const authorIds = [...new Set((posts || []).map((p) => p.author_id).filter(Boolean))];
    let authorRankMap: Record<string, number | null> = {};
    if (authorIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, rank_level')
        .in('id', authorIds);
      for (const pr of profiles || []) {
        authorRankMap[pr.id] = pr.rank_level ?? null;
      }
    }

    // 뷰에서 comment_count → comments로 매핑 + translations + 작성자 단위
    const postsWithComments = (posts || []).map((post) => ({
      ...post,
      comments: post.comment_count ?? 0,
      post_translations: translationsMap[post.id] ?? [],
      author_rank_level: post.author_id ? authorRankMap[post.author_id] ?? null : null,
    }));

    return NextResponse.json({
      posts: postsWithComments,
      total: count || 0,
      page,
      limit,
    });
  } catch (error: any) {
    console.error('GET /api/board error:', error);
    return NextResponse.json(
      { error: '게시글 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
