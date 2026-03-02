import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// POST /api/notifications/welcome - 환영 알림 생성
export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        type: 'welcome',
        actor_id: user.id,
        actor_name: '',
        post_title: '',
        post_id: null,
        link_url: '/profile',
        is_read: false,
      });

    // unique index 충돌(중복) 에러는 무시
    if (error && error.code !== '23505') throw error;

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('POST /api/notifications/welcome error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
