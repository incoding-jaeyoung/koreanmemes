import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const supabase = await createClient();
    const { username } = await params;
    const body = await request.json();
    const { is_banned } = body;

    // 1. 현재 사용자 및 프로필 권한 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (adminProfile?.role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    // 2. 대상 사용자 차단 상태 업데이트
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_banned: !!is_banned })
      .eq('username', decodeURIComponent(username))
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      is_banned: data.is_banned 
    });
  } catch (error: any) {
    console.error('POST /api/profile/[username]/ban error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
