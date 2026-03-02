import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/gallery - 미디어 갤러리 목록 조회
 * board_type='video' 게시글만 조회 (DB 호환)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    const search = searchParams.get('search') || '';

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('posts_with_comments')
      .select('*', { count: 'exact' })
      .eq('board_type', 'video');

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

    // 작성자 프로필: country, rank_level (리스트 국기·단위 뱃지용)
    const authorIds = [...new Set((posts || []).map((p) => p.author_id).filter(Boolean))];
    let authorProfileMap: Record<string, { country?: string | null; rank_level?: number | null }> = {};
    if (authorIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, country, rank_level')
        .in('id', authorIds);
      for (const pr of profiles || []) {
        authorProfileMap[pr.id] = { country: pr.country ?? null, rank_level: pr.rank_level ?? null };
      }
    }

    const postsWithComments = (posts || []).map((post) => {
      const authorProfile = post.author_id ? authorProfileMap[post.author_id] : null;
      return {
        ...post,
        comments: post.comment_count ?? 0,
        post_translations: translationsMap[post.id] ?? [],
        author_country: authorProfile?.country ?? null,
        author_rank_level: authorProfile?.rank_level ?? null,
      };
    });

    return NextResponse.json({
      posts: postsWithComments,
      total: count || 0,
      page,
      limit,
    });
  } catch (error: any) {
    console.error('GET /api/gallery error:', error);
    return NextResponse.json({ error: '갤러리 목록을 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

/**
 * POST /api/gallery - 미디어 갤러리 게시글 작성
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, category, language } = body;

    if (!title || !content) {
      return NextResponse.json({ error: '제목과 내용을 입력해주세요.' }, { status: 400 });
    }

    let authorName = '익명';
    try {
      const { data: prof } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .maybeSingle();
      if (prof?.username) authorName = prof.username;
    } catch {}

    const postData: Record<string, unknown> = {
      title: title.trim(),
      content: content.trim(),
      category: category || 'free',
      board_type: 'video',
      author_id: user.id,
      author_name: authorName,
    };

    if (language) postData.language = language;

    const { data, error } = await supabase
      .from('posts')
      .insert(postData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ post: data }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/gallery error:', error);
    return NextResponse.json({ error: '게시글 작성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
