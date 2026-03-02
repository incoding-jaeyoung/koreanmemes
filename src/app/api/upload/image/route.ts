import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// DELETE /api/upload/image - 에디터에서 이미지 제거 시 Cloudinary 정리
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { publicId } = await request.json();
    if (!publicId || typeof publicId !== 'string') {
      return NextResponse.json({ error: 'publicId가 올바르지 않습니다.' }, { status: 400 });
    }

    // 본인 폴더 파일만 삭제 가능
    if (!publicId.startsWith(`vf6/images/${user.id}/`)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE /api/upload/image error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
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
        { error: '파일 크기는 5MB를 초과할 수 없습니다.' },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: '지원하지 않는 파일 형식입니다. (jpg, png, gif, webp만 가능)' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            folder: `vf6/images/${user.id}`,
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

    // f_auto: WebP/AVIF 자동 변환, q_auto: 품질 자동 최적화
    const optimizedUrl = uploadResult.secure_url.replace(
      '/image/upload/',
      '/image/upload/f_auto,q_auto/'
    );

    return NextResponse.json({
      url: optimizedUrl,
      publicId: uploadResult.public_id,
    });
  } catch (error: any) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { error: error?.message ?? '이미지 업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
