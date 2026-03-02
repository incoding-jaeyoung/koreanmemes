import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/admin/settings - 사이트 설정 조회
export async function GET() {
  try {
    const supabase = await createClient();
    
    // 권한 확인 (관리자만 가능)
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

    const { data: settings, error } = await supabase
      .from('site_settings')
      .select('*');

    if (error) throw error;

    // 키-값 형태의 객체로 변환
    const settingsMap = settings.reduce((acc: any, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    return NextResponse.json(settingsMap);
  } catch (error: any) {
    console.error('GET /api/admin/settings error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/admin/settings - 사이트 설정 저장
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 권한 확인 (관리자만 가능)
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

    const { key, value } = await request.json();

    if (!key || !value) {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('site_settings')
      .upsert({ key, value })
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('POST /api/admin/settings error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
