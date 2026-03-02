/**
 * Cloudinary 동영상 URL → 썸네일 이미지 URL 변환
 * https://res.cloudinary.com/{cloud}/video/upload/{path}.mp4
 * → https://res.cloudinary.com/{cloud}/video/upload/so_auto,f_jpg,q_auto,w_400,h_225/{path}.jpg
 */
function cloudinaryVideoToThumb(videoUrl: string): string {
  return videoUrl.replace(
    /(res\.cloudinary\.com\/[^/]+\/video\/upload\/)(.*?)\.(mp4|webm|ogg|mov)(\?.*)?$/i,
    '$1so_2,f_jpg,q_auto,w_400,h_225/$2.jpg'
  );
}

/**
 * HTML content 내 Cloudinary <video> 태그에 poster 속성 동적 주입
 * (기존 저장된 글 포함)
 */
export function injectVideoPoster(content: string): string {
  return content.replace(
    /(<video\b(?![^>]*\bposter\b)[^>]*\bsrc=["'])(https:\/\/res\.cloudinary\.com\/[^"']+\.(mp4|webm|ogg|mov))["']([^>]*>)/gi,
    (_match, before, src, _ext, after) => {
      const poster = src.replace(
        /(res\.cloudinary\.com\/[^/]+\/video\/upload\/)(.*?)\.(mp4|webm|ogg|mov)(\?.*)?$/i,
        '$1so_2,f_jpg,q_auto,w_800/$2.jpg'
      );
      return `${before}${src}" poster="${poster}"${after}`;
    }
  );
}

/**
 * content에서 Cloudinary 동영상 public_id 목록 추출 (삭제용)
 */
export function extractCloudinaryVideoPublicIds(content: string): string[] {
  const regex = /res\.cloudinary\.com\/[^/]+\/video\/upload\/(?:[^/]+\/)?(vf6\/videos\/[^"'\s.]+|[^"'\s.]+)\.(mp4|webm|ogg|mov)/gi;
  const ids: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    ids.push(match[1]);
  }
  return ids;
}

/**
 * content에서 Supabase Storage 이미지 경로 목록 추출 (레거시 삭제용)
 * URL: https://{project}.supabase.co/storage/v1/object/public/post-images/{path}
 */
export function extractSupabaseImagePaths(content: string): string[] {
  const regex = /supabase\.co\/storage\/v1\/object\/public\/post-images\/([^"'\s>]+)/gi;
  const paths: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    paths.push(decodeURIComponent(match[1]));
  }
  return paths;
}

/**
 * content에서 Cloudinary 이미지 public_id 목록 추출 (삭제용)
 * URL: https://res.cloudinary.com/{cloud}/image/upload/{transforms}/vf6/images/{userId}/{filename}.ext
 */
export function extractCloudinaryImagePublicIds(content: string): string[] {
  const regex = /res\.cloudinary\.com\/[^/]+\/image\/upload\/(?:[^/]*\/)*(vf6\/(?:images|avatars)\/[^"'\s.>]+)/gi;
  const ids: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    ids.push(match[1]);
  }
  return [...new Set(ids)];
}

/**
 * content에서 썸네일 URL 추출
 * 1. Cloudinary 동영상 → 자동 썸네일
 * 2. YouTube: embed/watch URL → img.youtube.com/vi/{id}/mqdefault.jpg
 * 3. img src 추출
 * 4. 없으면 picsum fallback
 */
export function getThumbnailFromContent(
  content: string | undefined,
  postId: string
): string {
  if (!content || typeof content !== 'string') {
    return '/images/vf6-teaser-main.jpg';
  }

  // Cloudinary 동영상 썸네일 (data-src 속성에서 추출)
  const cloudinaryDataSrc = /data-src=["'](https:\/\/res\.cloudinary\.com\/[^"']+\.(mp4|webm|ogg|mov))[^"']*["']/i.exec(content);
  if (cloudinaryDataSrc?.[1]) {
    return cloudinaryVideoToThumb(cloudinaryDataSrc[1]);
  }
  // <video src= 패턴
  const videoSrc = /<video[^>]+src=["'](https:\/\/res\.cloudinary\.com\/[^"']+\.(mp4|webm|ogg|mov))[^"']*["']/i.exec(content);
  if (videoSrc?.[1]) {
    return cloudinaryVideoToThumb(videoSrc[1]);
  }

  // YouTube: embed/VIDEO_ID 또는 watch?v=VIDEO_ID
  const ytEmbed = /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/.exec(content);
  if (ytEmbed?.[1]) {
    return `https://img.youtube.com/vi/${ytEmbed[1]}/mqdefault.jpg`;
  }
  const ytWatch = /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/.exec(content);
  if (ytWatch?.[1]) {
    return `https://img.youtube.com/vi/${ytWatch[1]}/mqdefault.jpg`;
  }
  const ytShort = /youtu\.be\/([a-zA-Z0-9_-]+)/.exec(content);
  if (ytShort?.[1]) {
    return `https://img.youtube.com/vi/${ytShort[1]}/mqdefault.jpg`;
  }

  // img src
  const imgMatch = /<img[^>]+src=["']([^"']+)["']/.exec(content);
  if (imgMatch?.[1]) {
    return imgMatch[1];
  }

  return '/images/vf6-teaser-main.jpg';
}
