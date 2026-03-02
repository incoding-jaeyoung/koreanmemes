import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { translateTitle, type SupportedLang } from '@/utils/gemini';
import { extractCloudinaryVideoPublicIds, extractCloudinaryImagePublicIds, extractSupabaseImagePaths } from '@/utils/thumbnail';
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALL_LANGS: SupportedLang[] = ['ko', 'en', 'ja'];

// GET /api/posts/[id] - 게시글 상세 조회 (translations 포함)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // 게시글 조회 (translations 포함)
    const { data: post, error } = await supabase
      .from('posts')
      .select('*, post_translations(*)')
      .eq('id', id)
      .single();

    if (error) throw error;

    // 작성자 프로필(아바타, 단위) 조회
    let author_avatar: string | null = null;
    let author_rank_level: number | null = null;
    if (post.author_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url, rank_level')
        .eq('id', post.author_id)
        .single();
      author_avatar = profile?.avatar_url ?? null;
      author_rank_level = profile?.rank_level ?? null;
    }

    // 댓글 수 조회
    const { count: commentCount } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', id);

    return NextResponse.json({
      post: {
        ...post,
        author_avatar,
        author_rank_level,
        comment_count: commentCount || 0,
      },
    });
  } catch (error: any) {
    console.error('GET /api/posts/[id] error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: error.code === 'PGRST116' ? 404 : 500 }
    );
  }
}

// PATCH /api/posts/[id] - 게시글 수정 (작성자 본인만)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { title, content, category, rank_level: rankLevel } = body;

    // 작성자 및 기존 제목/본문/언어 확인
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('author_id, title, content, language')
      .eq('id', id)
      .single();


    if (fetchError) throw fetchError;

    if (post.author_id !== user.id) {
      return NextResponse.json(
        { error: '본인의 글만 수정할 수 있습니다.' },
        { status: 403 }
      );
    }

    const updatePayload: Record<string, unknown> = {
      title: title?.trim(),
      content: content?.trim(),
      category,
      updated_at: new Date().toISOString(),
    };
    if (rankLevel !== undefined) {
      const level = rankLevel === null || rankLevel === '' ? null : Number(rankLevel);
      updatePayload.rank_level = level !== null && Number.isInteger(level) && level >= 1 && level <= 46 ? level : null;
    }

    const { data, error } = await supabase
      .from('posts')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    const titleChanged = title && title.trim() !== post.title;
    const contentChanged = content !== undefined && content.trim() !== post.content;

    if (titleChanged || contentChanged) {
      try {
        const adminClient = createAdminClient();
        const originalLang: SupportedLang = ALL_LANGS.includes(post.language as SupportedLang)
          ? (post.language as SupportedLang)
          : 'ko';

        if (titleChanged) {
          // 제목 변경: 번역 레코드 전체 삭제 후 새 제목으로 재번역
          await adminClient
            .from('post_translations')
            .delete()
            .eq('post_id', id);

          const targetLangs = ALL_LANGS.filter(l => l !== originalLang);
          const translations = await translateTitle(title.trim(), targetLangs, originalLang);

          const translationRows = Object.entries(translations)
            .filter(([, t]) => !!t)
            .map(([lang, translatedTitle]) => ({
              post_id: id,
              lang,
              title: translatedTitle as string,
            }));

          if (translationRows.length > 0) {
            const { error: transError } = await adminClient
              .from('post_translations')
              .insert(translationRows);
            if (transError) console.error('Translation re-insert error:', transError);
          }
        } else if (contentChanged) {
          // 본문만 변경: 번역 content를 null로 무효화 (제목 번역은 유지)
          await adminClient
            .from('post_translations')
            .update({ content: null })
            .eq('post_id', id);
        }
      } catch (transErr) {
        console.error('Translation invalidation failed (non-blocking):', transErr);
      }
    }

    // 수정 후 content에서 제거된 미디어 파일 삭제 (비동기)
    if (content !== undefined && post.content) {
      const oldVideoIds = extractCloudinaryVideoPublicIds(post.content);
      const newVideoIds = new Set(extractCloudinaryVideoPublicIds(content));
      const removedVideoIds = oldVideoIds.filter((id) => !newVideoIds.has(id));

      const oldImageIds = extractCloudinaryImagePublicIds(post.content);
      const newImageIds = new Set(extractCloudinaryImagePublicIds(content));
      const removedImageIds = oldImageIds.filter((p) => !newImageIds.has(p));

      // 레거시: Supabase에 올라간 이미지 처리
      const oldLegacyPaths = extractSupabaseImagePaths(post.content);
      const newLegacyPaths = new Set(extractSupabaseImagePaths(content));
      const removedLegacyPaths = oldLegacyPaths.filter((p) => !newLegacyPaths.has(p));

      if (removedVideoIds.length > 0 || removedImageIds.length > 0 || removedLegacyPaths.length > 0) {
        Promise.all([
          ...removedVideoIds.map((pid) =>
            cloudinary.uploader.destroy(pid, { resource_type: 'video' }).catch((e) =>
              console.error('Cloudinary video delete (patch) error:', pid, e)
            )
          ),
          ...removedImageIds.map((pid) =>
            cloudinary.uploader.destroy(pid, { resource_type: 'image' }).catch((e) =>
              console.error('Cloudinary image delete (patch) error:', pid, e)
            )
          ),
          removedLegacyPaths.length > 0
            ? supabase.storage.from('post-images').remove(removedLegacyPaths).catch((e) =>
                console.error('Supabase legacy image delete (patch) error:', e)
              )
            : Promise.resolve(),
        ]);
      }
    }

    return NextResponse.json({ post: data });
  } catch (error: any) {
    console.error('PATCH /api/posts/[id] error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[id] - 게시글 삭제 (작성자 본인만)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // 작성자 확인 (content도 함께 조회 — Cloudinary 영상 삭제용)
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('author_id, content')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    if (post.author_id !== user.id) {
      return NextResponse.json(
        { error: '본인의 글만 삭제할 수 있습니다.' },
        { status: 403 }
      );
    }

    // 삭제 (CASCADE로 post_translations도 자동 삭제)
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // 미디어 파일 삭제 (비동기, 실패해도 응답에 영향 없음)
    if (post.content) {
      const videoIds = extractCloudinaryVideoPublicIds(post.content);
      const imageIds = extractCloudinaryImagePublicIds(post.content);
      const legacyImagePaths = extractSupabaseImagePaths(post.content);

      Promise.all([
        ...videoIds.map((pid) =>
          cloudinary.uploader.destroy(pid, { resource_type: 'video' }).catch((e) =>
            console.error('Cloudinary video delete error:', pid, e)
          )
        ),
        ...imageIds.map((pid) =>
          cloudinary.uploader.destroy(pid, { resource_type: 'image' }).catch((e) =>
            console.error('Cloudinary image delete error:', pid, e)
          )
        ),
        legacyImagePaths.length > 0
          ? supabase.storage.from('post-images').remove(legacyImagePaths).catch((e) =>
              console.error('Supabase legacy image delete error:', e)
            )
          : Promise.resolve(),
      ]);
    }

    return NextResponse.json({ message: '게시글이 삭제되었습니다.' });
  } catch (error: any) {
    console.error('DELETE /api/posts/[id] error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
