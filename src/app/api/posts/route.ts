import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { translateTitle, type SupportedLang } from '@/utils/gemini';
import { NextRequest, NextResponse } from 'next/server';

const ALL_LANGS: SupportedLang[] = ['ko', 'en', 'ja'];

// GET /api/posts - 게시글 목록 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // 쿼리 파라미터
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const artist = searchParams.get('artist');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'latest'; // latest, popular, views

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // 쿼리 빌더 (translations 포함)
    let query = supabase
      .from('posts')
      .select('*, post_translations(*)', { count: 'exact' });

    // 카테고리 필터
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    // 아티스트 태그 필터
    if (artist) {
      query = query.eq('artist_tag', artist);
    }

    // 검색 (제목 + 내용)
    if (search) {
      const s = search.replace(/[\\%_]/g, '\\$&');
      query = query.or(`title.ilike.%${s}%,content.ilike.%${s}%`);
    }

    // 정렬
    switch (sort) {
      case 'popular':
        query = query.order('likes', { ascending: false });
        break;
      case 'views':
        query = query.order('views', { ascending: false });
        break;
      case 'latest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    // 페이지네이션
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      posts: data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error('GET /api/posts error:', error);
    return NextResponse.json(
      { error: '게시글 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST /api/posts - 새 게시글 작성
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
    const { title, content, category, language, artist_tag: artistTag } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: '제목과 내용을 입력해주세요.' },
        { status: 400 }
      );
    }

    const originalLang: SupportedLang = ALL_LANGS.includes(language) ? language : 'ko';

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

    const insertPayload: Record<string, unknown> = {
      title: title.trim(),
      content: content.trim(),
      category: category || 'chat',
      author_id: user.id,
      author_name: authorName,
      language: originalLang,
    };
    if (artistTag && typeof artistTag === 'string' && artistTag.trim()) {
      insertPayload.artist_tag = artistTag.trim();
    }

    const { data, error } = await supabase
      .from('posts')
      .insert(insertPayload)
      .select()
      .single();

    if (error) throw error;

    // 번역 (비동기, 실패해도 원본 글 영향 없음) — admin 클라이언트로 RLS 우회
    try {
      const adminClient = createAdminClient();
      const targetLangs = ALL_LANGS.filter(l => l !== originalLang);
      console.log(`[POST /api/posts] Translating title "${title}" from ${originalLang} to:`, targetLangs);

      const translations = await translateTitle(title.trim(), targetLangs, originalLang);
      console.log('[POST /api/posts] Translation result:', translations);

      const translationRows = Object.entries(translations)
        .filter(([, t]) => !!t)
        .map(([lang, translatedTitle]) => ({
          post_id: data.id,
          lang,
          title: translatedTitle as string,
        }));

      console.log('[POST /api/posts] Rows to insert:', translationRows.length);

      if (translationRows.length > 0) {
        const { error: transError } = await adminClient
          .from('post_translations')
          .insert(translationRows);
        if (transError) {
          console.error('Translation insert error:', transError);
        } else {
          console.log('[POST /api/posts] Translation insert successful');
        }
      } else {
        console.warn('[POST /api/posts] No translation rows to insert');
      }
    } catch (transErr) {
      console.error('Title translation failed (non-blocking):', transErr);
    }

    return NextResponse.json({ post: data }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/posts error:', error);
    return NextResponse.json(
      { error: '게시글 작성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
