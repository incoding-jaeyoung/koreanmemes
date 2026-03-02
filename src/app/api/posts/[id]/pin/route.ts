import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const body = await request.json();
    const { is_pinned } = body;

    // 1. 현재 사용자 및 프로필 권한 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    // 2. 게시글 고정 상태 업데이트
    const { data, error } = await supabase
      .from('posts')
      .update({ is_pinned: !!is_pinned })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      is_pinned: data.is_pinned 
    });
  } catch (error: any) {
    console.error('POST /api/posts/[id]/pin error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
