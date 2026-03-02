import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/admin/stats/visitors - 오늘 방문자 / 재방문자 수 조회 (관리자 전용)
export async function GET() {
  try {
    const supabase = await createClient();

    // 권한 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const admin = createAdminClient();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIso = today.toISOString();

    // listUsers()로 전체 auth 유저를 페이지 순회하여 수집
    let todayVisitors = 0;
    let returningVisitors = 0;
    let page = 1;
    const perPage = 1000;

    while (true) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
      if (error || !data?.users?.length) break;

      for (const authUser of data.users) {
        const lastSignIn = authUser.last_sign_in_at;
        if (lastSignIn && lastSignIn >= todayIso) {
          todayVisitors++;
          // 재방문: 오늘 방문했지만 오늘 가입한 신규가 아닌 경우
          if (authUser.created_at && authUser.created_at < todayIso) {
            returningVisitors++;
          }
        }
      }

      if (data.users.length < perPage) break;
      page++;
    }

    return NextResponse.json({ todayVisitors, returningVisitors });
  } catch (error: any) {
    console.error('GET /api/admin/stats/visitors error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
