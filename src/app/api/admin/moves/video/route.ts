import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function checkAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return null;
  return user;
}

// GET /api/admin/moves/video - 캐릭터 영상 설정 목록
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await checkAdmin(supabase);
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    let query = supabase.from('character_move_videos').select('*');
    if (slug) query = query.eq('character_slug', slug);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ videos: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/admin/moves/video - 캐릭터 영상 설정 (upsert)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await checkAdmin(supabase);
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { character_slug, video_id, video_url } = await request.json();

    if (!character_slug || !video_id) {
      return NextResponse.json({ error: 'character_slug, video_id는 필수입니다.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('character_move_videos')
      .upsert({ character_slug, video_id, video_url: video_url || null, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ video: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
