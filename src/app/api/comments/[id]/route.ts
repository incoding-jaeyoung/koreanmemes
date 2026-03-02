import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { deleteCloudinaryImage } from '@/utils/cloudinary';
import { NextRequest, NextResponse } from 'next/server';

// DELETE /api/comments/[id] - 댓글 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // 세션 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 관리자 여부 확인
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    const isAdmin = profile?.role === 'admin';

    // 기존 이미지 public_id 조회
    const { data: existing } = await supabase
      .from('comments')
      .select('image_public_id, author_id')
      .eq('id', id)
      .maybeSingle();

    // 소프트 삭제: 관리자는 RLS 우회, 일반 사용자는 본인 댓글만
    if (isAdmin) {
      const adminSupabase = createAdminClient();
      const { error } = await adminSupabase
        .from('comments')
        .update({ is_deleted: true, content: '', image_url: null, image_public_id: null })
        .eq('id', id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('comments')
        .update({ is_deleted: true, content: '', image_url: null, image_public_id: null })
        .eq('id', id)
        .eq('author_id', user.id);
      if (error) throw error;
    }

    // Cloudinary 이미지 삭제 (실패해도 댓글 삭제는 성공)
    if (existing?.image_public_id) {
      await deleteCloudinaryImage(existing.image_public_id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE /api/comments/[id] error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/comments/[id] - 댓글 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // 세션 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 요청 본문 파싱
    const body = await request.json();
    const { content, image_url, image_public_id, remove_image } = body;

    if (!content?.trim() && !image_url && !remove_image) {
      return NextResponse.json(
        { error: 'Content or image is required' },
        { status: 400 }
      );
    }

    // 기존 댓글 조회 (이미지 교체/삭제 시 기존 public_id 필요)
    const { data: existing } = await supabase
      .from('comments')
      .select('image_public_id')
      .eq('id', id)
      .eq('author_id', user.id)
      .maybeSingle();

    const updateData: Record<string, unknown> = { content: content ?? '' };

    if (remove_image) {
      updateData.image_url = null;
      updateData.image_public_id = null;
    } else if (image_url !== undefined) {
      updateData.image_url = image_url || null;
      updateData.image_public_id = image_public_id || null;
    }

    // 댓글 수정
    const { data: comment, error } = await supabase
      .from('comments')
      .update(updateData)
      .eq('id', id)
      .eq('author_id', user.id) // 본인 댓글만 수정 가능
      .select()
      .single();

    if (error) throw error;

    // 이미지 교체 또는 삭제 시 기존 Cloudinary 이미지 정리
    const oldPublicId = existing?.image_public_id;
    const newPublicId = updateData.image_public_id as string | null | undefined;
    if (oldPublicId && (remove_image || (newPublicId && newPublicId !== oldPublicId))) {
      await deleteCloudinaryImage(oldPublicId);
    }

    // 번역 캐시 무효화 (내용 변경 시 기존 번역 삭제) — adminClient로 RLS 우회
    const adminClient = createAdminClient();
    await adminClient
      .from('comment_translations')
      .delete()
      .eq('comment_id', id);

    return NextResponse.json({ comment });
  } catch (error: any) {
    console.error('PUT /api/comments/[id] error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
