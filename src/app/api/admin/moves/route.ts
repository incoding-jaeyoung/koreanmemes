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

// GET /api/admin/moves - 전체 기술 목록 (어드민)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await checkAdmin(supabase);
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    let query = supabase
      .from('character_moves')
      .select('*')
      .order('sort_order', { ascending: true });

    if (slug) query = query.eq('character_slug', slug);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ moves: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/admin/moves - 기술 생성
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await checkAdmin(supabase);
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const {
      character_slug, name, command, category, sort_order,
      start_time, end_time, hit_level, damage, startup, active,
      total, recovery, hit_adv, counter_adv, crouch_hit_adv,
      crouch_counter_adv, stun, evade_dir, throw_break, notes,
    } = body;

    if (!character_slug || !name || !command) {
      return NextResponse.json({ error: 'character_slug, name, command는 필수입니다.' }, { status: 400 });
    }

    const { data, error } = await supabase.from('character_moves').insert({
      character_slug, name, command, category: category || '기본 기술',
      sort_order: sort_order ?? 0,
      start_time, end_time, hit_level, damage, startup, active,
      total, recovery, hit_adv, counter_adv, crouch_hit_adv,
      crouch_counter_adv, stun, evade_dir, throw_break, notes,
    }).select().single();

    if (error) throw error;

    return NextResponse.json({ move: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
