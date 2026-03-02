import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/notifications - 알림 목록 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // post_id 목록으로 번역 제목 조회 (언어별 표시용)
    const postIds = [...new Set((notifications ?? []).map((n: { post_id?: string | null }) => n.post_id).filter(Boolean))];
    let translationsByPostId: Record<string, { lang: string; title: string }[]> = {};
    if (postIds.length > 0) {
      const { data: translations } = await supabase
        .from('post_translations')
        .select('post_id, lang, title')
        .in('post_id', postIds);
      for (const row of translations ?? []) {
        if (!translationsByPostId[row.post_id]) translationsByPostId[row.post_id] = [];
        translationsByPostId[row.post_id].push({ lang: row.lang, title: row.title });
      }
    }

    const notificationsWithTranslations = (notifications ?? []).map((n: { post_id?: string | null; [key: string]: unknown }) => ({
      ...n,
      post_translations: (n.post_id && translationsByPostId[n.post_id]) ? translationsByPostId[n.post_id] : [],
    }));

    const { count, error: countError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (countError) throw countError;

    return NextResponse.json({
      notifications: notificationsWithTranslations,
      unread_count: count ?? 0,
    });
  } catch (error: any) {
    console.error('GET /api/notifications error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/notifications - 전체 알림 삭제
export async function DELETE() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('DELETE /api/notifications error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
