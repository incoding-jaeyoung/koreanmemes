import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Cloudinary 이미지 삭제 (서버 사이드 전용)
 * 실패해도 예외를 throw하지 않고 false 반환
 */
export async function deleteCloudinaryImage(publicId: string): Promise<boolean> {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    return true;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
}
