import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { translateTitle, type SupportedLang } from '@/utils/gemini';
import { NextRequest, NextResponse } from 'next/server';

const ALL_LANGS: SupportedLang[] = ['ko', 'en', 'ja'];

export const dynamic = 'force-dynamic';

/**
 * GET /api/news - 새소식 목록 조회
 *
 * posts 테이블에서 board_type='news' 인 게시글을 조회합니다.
 * board_type 컬럼이 아직 없는 경우를 대비해 컬럼 존재 여부를 확인 후
 * 없으면 전체 조회로 fallback 합니다.
 * (DB에 board_type 컬럼이 추가되면 fallback 로직은 제거 가능합니다)
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

    // 새소식 전용 (board_type='news') — posts_with_comments 뷰로 N+1 해결
    let query = supabase
      .from('posts_with_comments')
      .select('*', { count: 'exact' })
      .eq('board_type', 'news');

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

    const postsWithComments = (posts || []).map((post) => ({
      ...post,
      comments: post.comment_count ?? 0,
      post_translations: translationsMap[post.id] ?? [],
    }));

    return NextResponse.json({
      posts: postsWithComments,
      total: count || 0,
      page,
      limit,
    });
  } catch (error: any) {
    console.error('GET /api/news error:', error);
    return NextResponse.json({ error: '새소식 목록을 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

/**
 * POST /api/news - 새소식 작성 (관리자 전용)
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

    // 관리자 권한 확인
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: '관리자만 새소식을 작성할 수 있습니다.' }, { status: 403 });
    }

    const body = await request.json();
    const { title, content, category, language } = body;

    if (!title || !content) {
      return NextResponse.json({ error: '제목과 내용을 입력해주세요.' }, { status: 400 });
    }

    // 언어 기본값 설정
    const originalLang: SupportedLang = ALL_LANGS.includes(language) ? language : 'ko';

    let authorName = '관리자';
    try {
      const { data: prof } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .maybeSingle();
      if (prof?.username) authorName = prof.username;
    } catch {}

    const postData: any = {
      title: title.trim(),
      content: content.trim(),
      category: category || 'notice',
      board_type: 'news',
      author_id: user.id,
      author_name: authorName,
      language: originalLang,
    };

    const { data, error } = await supabase
      .from('posts')
      .insert(postData)
      .select()
      .single();

    if (error) throw error;

    // 제목 번역 (비동기, 실패해도 원본 글 영향 없음)
    try {
      const adminClient = createAdminClient();
      const targetLangs = ALL_LANGS.filter(l => l !== originalLang);
      console.log(`[POST /api/news] Translating title "${title}" from ${originalLang} to:`, targetLangs);

      const translations = await translateTitle(title.trim(), targetLangs);
      console.log('[POST /api/news] Translation result:', translations);

      const translationRows = Object.entries(translations)
        .filter(([, t]) => !!t)
        .map(([lang, translatedTitle]) => ({
          post_id: data.id,
          lang,
          title: translatedTitle as string,
        }));

      console.log('[POST /api/news] Rows to insert:', translationRows.length);

      if (translationRows.length > 0) {
        const { error: transError } = await adminClient
          .from('post_translations')
          .insert(translationRows);
        if (transError) {
          console.error('[POST /api/news] Translation insert error:', transError);
        } else {
          console.log('[POST /api/news] Translation insert successful');
        }
      } else {
        console.warn('[POST /api/news] No translation rows to insert');
      }
    } catch (transErr) {
      console.error('[POST /api/news] Title translation failed (non-blocking):', transErr);
    }

    return NextResponse.json({ post: data }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/news error:', error);
    return NextResponse.json({ error: '새소식 작성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
