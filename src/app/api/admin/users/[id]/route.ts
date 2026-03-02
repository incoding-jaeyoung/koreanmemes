import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { extractCloudinaryVideoPublicIds, extractCloudinaryImagePublicIds, extractSupabaseImagePaths } from '@/utils/thumbnail';
import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const dynamic = 'force-dynamic';

// PATCH /api/admin/users/[id] - 사용자 정보 업데이트 (관리자 전용)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // 1. 권한 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (adminProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. 업데이트 데이터 추출
    const { role, is_banned } = await request.json();
    const updates: any = {};
    if (role !== undefined) updates.role = role;
    if (is_banned !== undefined) updates.is_banned = is_banned;

    // 3. 업데이트 실행
    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ profile: updatedProfile });
  } catch (error: any) {
    console.error('PATCH /api/admin/users/[id] error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] - 사용자 계정 삭제 (관리자 전용)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // 1. 권한 확인 (일반 클라이언트로 현재 사용자 검증)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (adminProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const admin = createAdminClient();

    // 2. 사용자 게시글의 미디어 파일 정리 (posts 삭제 전에 처리)
    const { data: userPosts } = await admin
      .from('posts')
      .select('content')
      .eq('author_id', id);

    if (userPosts && userPosts.length > 0) {
      const allContent = userPosts.map((p: any) => p.content || '').join('\n');
      const videoIds = extractCloudinaryVideoPublicIds(allContent);
      const imageIds = extractCloudinaryImagePublicIds(allContent);
      const legacyImagePaths = extractSupabaseImagePaths(allContent);

      await Promise.all([
        ...videoIds.map((pid) =>
          cloudinary.uploader.destroy(pid, { resource_type: 'video' }).catch((e) =>
            console.error('Cloudinary video delete (user delete) error:', pid, e)
          )
        ),
        ...imageIds.map((pid) =>
          cloudinary.uploader.destroy(pid, { resource_type: 'image' }).catch((e) =>
            console.error('Cloudinary image delete (user delete) error:', pid, e)
          )
        ),
        legacyImagePaths.length > 0
          ? admin.storage.from('post-images').remove(legacyImagePaths).catch((e) =>
              console.error('Supabase legacy image delete (user delete) error:', e)
            )
          : Promise.resolve(),
      ]);
    }

    // 3. 연관 데이터 삭제 (FK 제약으로 인한 auth 삭제 실패 방지)
    await admin.from('post_likes').delete().eq('user_id', id);
    await admin.from('comments').delete().eq('author_id', id);
    await admin.from('posts').delete().eq('author_id', id);
    await admin.from('profiles').delete().eq('id', id);

    // 4. Auth 유저 삭제 (Supabase auth.users에서 완전 삭제)
    const { error: authError } = await admin.auth.admin.deleteUser(id);
    if (authError) throw authError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE /api/admin/users/[id] error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
