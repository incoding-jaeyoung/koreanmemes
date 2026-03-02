import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { translateComments, SupportedLang } from '@/utils/gemini';

const BATCH_SIZE = 20;

// POST /api/posts/[id]/comments/translate
// commentIds[], targetLang 수신 → DB 캐시 우선 → 미번역분만 Gemini 배치 호출 → upsert → 반환
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await createClient(); // 인증 확인용 (미사용 변수 제거)
    await params; // postId는 미사용 (향후 postId 기반 로깅·제한 시 활용)
    const adminClient = createAdminClient();

    const body = await request.json();
    const { commentIds, targetLang } = body as {
      commentIds: string[];
      targetLang: SupportedLang;
    };

    if (!commentIds?.length || !targetLang) {
      return NextResponse.json(
        { error: 'commentIds and targetLang are required' },
        { status: 400 }
      );
    }

    // 1. DB에서 기존 번역 조회
    const { data: existing } = await adminClient
      .from('comment_translations')
      .select('comment_id, content')
      .in('comment_id', commentIds)
      .eq('lang', targetLang);

    const existingMap: Record<string, string> = {};
    (existing ?? []).forEach(tr => {
      if (tr.content) existingMap[tr.comment_id] = tr.content;
    });

    // 2. 미번역 ID만 추출
    const untranslatedIds = commentIds.filter(id => !existingMap[id]);

    // 3. 원본 댓글 조회 (미번역분만)
    const newTranslations: Record<string, string> = {};
    if (untranslatedIds.length > 0) {
      const { data: comments } = await adminClient
        .from('comments')
        .select('id, content')
        .in('id', untranslatedIds);

      const toTranslate = (comments ?? []).filter(c => c.content?.trim());

      if (toTranslate.length > 0) {
        // 20개씩 청크 처리
        const chunks: typeof toTranslate[] = [];
        for (let i = 0; i < toTranslate.length; i += BATCH_SIZE) {
          chunks.push(toTranslate.slice(i, i + BATCH_SIZE));
        }

        for (const chunk of chunks) {
          const input = chunk.map(c => ({ id: c.id, text: c.content as string }));
          const translated = await translateComments(input, targetLang);
          Object.assign(newTranslations, translated);
        }

        // 4. DB 저장 (upsert) — adminClient로 RLS 우회
        if (Object.keys(newTranslations).length > 0) {
          const rows = Object.entries(newTranslations).map(([comment_id, content]) => ({
            comment_id,
            lang: targetLang,
            content,
          }));
          const { error: upsertError } = await adminClient
            .from('comment_translations')
            .upsert(rows, { onConflict: 'comment_id,lang' });
          if (upsertError) {
            console.error('[comment translate] upsert error:', upsertError);
          }
        }
      }
    }

    return NextResponse.json({
      translations: { ...existingMap, ...newTranslations },
    });
  } catch (error: any) {
    console.error('POST /api/posts/[id]/comments/translate error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
