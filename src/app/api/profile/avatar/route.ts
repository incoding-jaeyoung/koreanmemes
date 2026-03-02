import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function extractCloudinaryPublicId(url: string): string | null {
  const match = /res\.cloudinary\.com\/[^/]+\/image\/upload\/(?:[^/]*\/)*(vf6\/avatars\/[^"'\s.>]+)/i.exec(url);
  return match?.[1] ?? null;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: '파일 크기는 1MB를 초과할 수 없습니다.' },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: '지원하지 않는 파일 형식입니다. (jpg, png, gif, webp만 가능)' },
        { status: 400 }
      );
    }

    // 기존 아바타 삭제 (Cloudinary)
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single();

    if (profile?.avatar_url) {
      const oldPublicId = extractCloudinaryPublicId(profile.avatar_url);
      if (oldPublicId) {
        await cloudinary.uploader.destroy(oldPublicId, { resource_type: 'image' }).catch((e) =>
          console.error('기존 아바타 삭제 실패 (non-blocking):', e)
        );
      }
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            folder: `vf6/avatars/${user.id}`,
            use_filename: false,
            unique_filename: true,
          },
          (error, result) => {
            if (error || !result) reject(error ?? new Error('업로드 실패'));
            else resolve(result as { secure_url: string; public_id: string });
          }
        );
        uploadStream.end(buffer);
      }
    );

    // f_auto: WebP/AVIF 자동 변환, q_auto: 품질 최적화, w_400,h_400,c_fill: 정사각형 크롭
    const optimizedUrl = uploadResult.secure_url.replace(
      '/image/upload/',
      '/image/upload/f_auto,q_auto,w_400,h_400,c_fill/'
    );

    // 프로필 업데이트
    await supabase
      .from('profiles')
      .update({ avatar_url: optimizedUrl })
      .eq('id', user.id);

    return NextResponse.json({
      url: optimizedUrl,
      publicId: uploadResult.public_id,
    });
  } catch (error: any) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { error: '아바타 업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
