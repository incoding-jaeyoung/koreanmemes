import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/** slug에서 character_id 추출 (예: "akira-yuki" → "akira") */
function getCharacterId(slug: string): string {
  return slug.split('-')[0];
}

// GET /api/characters/[slug]/board - 캐릭터별 게시판 글 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createClient();
    const { slug } = await params;
    const searchParams = request.nextUrl.searchParams;

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');

    const characterId = getCharacterId(slug);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // posts_with_comments 뷰로 댓글 수 포함 조회 (N+1 해결)
    let query = supabase
      .from('posts_with_comments')
      .select('*', { count: 'exact' })
      .eq('character_id', characterId);

    // 검색 필터
    if (search) {
      const s = search.replace(/[\\%_]/g, '\\$&');
      query = query.or(`title.ilike.%${s}%,content.ilike.%${s}%`);
    }

    const { data: posts, error, count } = await query
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching character posts:', error);
      return NextResponse.json({ posts: [], total: 0 });
    }

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

    // 작성자 프로필 rank_level (게시판 단위 표시용)
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
      limit
    });
  } catch (error: any) {
    console.error('GET /api/characters/[slug]/board error:', error);
    return NextResponse.json({ posts: [], total: 0 });
  }
}

// POST /api/characters/[slug]/board - 캐릭터 게시판 글 작성
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createClient();
    const { slug } = await params;
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, content, category, language, rank_level: rankLevel } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: '제목과 내용을 입력해주세요.' },
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

    const characterId = getCharacterId(slug);

    const postData: any = {
      title: title.trim(),
      content: content.trim(),
      category: category || 'tips',
      author_id: user.id,
      author_name: authorName,
      character_id: characterId,
      board_type: 'character',
    };

    if (language) {
      postData.language = language;
    }
    const level = rankLevel != null ? Number(rankLevel) : null;
    if (level !== null && Number.isInteger(level) && level >= 1 && level <= 46) {
      postData.rank_level = level;
    }

    const { data, error } = await supabase
      .from('posts')
      .insert(postData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ post: data }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/characters/[slug]/board error:', error);
    return NextResponse.json(
      { error: '게시글 작성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
