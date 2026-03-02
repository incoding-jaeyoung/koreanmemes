-- ============================================
-- 마이페이지 DB 스키마 확장
-- ============================================

-- profiles 테이블에 새 필드 추가
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS main_character_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS psn_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS steam_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS xbox_gamertag TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS discord_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS comment TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'ko';

-- 제약 조건 추가
ALTER TABLE profiles ADD CONSTRAINT comment_length_check 
  CHECK (char_length(comment) <= 100);

ALTER TABLE profiles ADD CONSTRAINT preferred_language_check 
  CHECK (preferred_language IN ('ko', 'en', 'ja'));

-- ============================================
-- Storage RLS 정책 (avatars 버킷용)
-- ============================================

-- 사용자는 자신의 아바타만 업로드 가능
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 모든 사용자가 아바타 조회 가능
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- 사용자는 자신의 아바타만 삭제 가능
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 사용자는 자신의 아바타만 업데이트 가능
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
