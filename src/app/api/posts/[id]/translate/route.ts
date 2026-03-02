import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { translateContent, translateTitle, type SupportedLang } from '@/utils/gemini';
import { NextRequest, NextResponse } from 'next/server';

const SUPPORTED_LANGS: SupportedLang[] = ['ko', 'en', 'ja'];

// POST /api/posts/[id]/translate
// body: { targetLang: 'en' | 'ja' | 'ko' }
// 1) DB에 이미 번역된 content가 있으면 즉시 반환
// 2) 없으면 Gemini API 번역 → DB upsert → 반환
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { targetLang } = body as { targetLang: string };

    if (!SUPPORTED_LANGS.includes(targetLang as SupportedLang)) {
      return NextResponse.json({ error: 'Unsupported language' }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. 원본 게시글 조회 (title도 포함 — upsert 시 필요)
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('title, content, language')
      .eq('id', id)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // 원본 언어와 동일하면 번역 불필요
    if (post.language === targetLang) {
      return NextResponse.json({ content: post.content, cached: true });
    }

    const adminClient = createAdminClient();

    // 2. DB 캐시 확인 — title/content 레코드 모두 가져옴
    const { data: existing } = await adminClient
      .from('post_translations')
      .select('title, content')
      .eq('post_id', id)
      .eq('lang', targetLang)
      .maybeSingle();

    // content가 이미 있으면 캐시 반환
    if (existing?.content) {
      return NextResponse.json({ content: existing.content, cached: true });
    }

    // 3. Gemini 번역
    console.log(`[POST /api/posts/${id}/translate] Translating content to ${targetLang}, content length:`, post.content?.length ?? 0);

    const translatedContent = await translateContent(post.content, targetLang as SupportedLang, post.language as SupportedLang);
    console.log('[POST /api/posts/[id]/translate] Translation completed, result length:', translatedContent?.length ?? 0);

    if (!translatedContent) {
      // 번역 스킵 대상(너무 짧은 글 등) — 원본 반환
      console.warn('[POST /api/posts/[id]/translate] Translation skipped (content too short or empty)');
      return NextResponse.json({ content: post.content, cached: false });
    }

    // 4. DB 저장 — 레코드 존재 여부에 따라 update / insert 분기
    //    (upsert에 title 미포함 시 NOT NULL 제약 위반 방지)
    let saveError;
    if (existing) {
      // 이미 레코드 있음(Phase 1 title 번역) → content만 update
      const { error } = await adminClient
        .from('post_translations')
        .update({ content: translatedContent })
        .eq('post_id', id)
        .eq('lang', targetLang);
      saveError = error;
    } else {
      // 레코드 없음 → title도 번역하여 함께 insert
      let translatedTitle = post.title; // fallback
      try {
        const titleTranslations = await translateTitle(post.title, [targetLang as SupportedLang], post.language as SupportedLang);
        translatedTitle = titleTranslations[targetLang as SupportedLang] || post.title;
      } catch (titleErr) {
        console.warn('Title translation failed, using original:', titleErr);
      }

      const { error } = await adminClient
        .from('post_translations')
        .insert({ post_id: id, lang: targetLang, title: translatedTitle, content: translatedContent });
      saveError = error;
    }

    if (saveError) {
      console.error('Translation save error:', saveError);
    }

    return NextResponse.json({ content: translatedContent, cached: false });
  } catch (error: any) {
    console.error('POST /api/posts/[id]/translate error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
