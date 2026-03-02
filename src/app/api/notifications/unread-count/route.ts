import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/notifications/unread-count - 미읽음 수 조회 (경량 쿼리)
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ count: 0 });
    }

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) throw error;

    return NextResponse.json({ count: count ?? 0 });
  } catch (error: any) {
    console.error('GET /api/notifications/unread-count error:', error);
    return NextResponse.json({ count: 0 });
  }
}
