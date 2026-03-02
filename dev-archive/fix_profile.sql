-- 본인 프로필 확인 및 설정
-- Supabase SQL Editor에서 실행

-- 1. 현재 사용자 ID와 username 확인
SELECT id, email, raw_user_meta_data->>'username' as username
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 2. profiles 테이블 확인
SELECT id, username, comment, main_character_id
FROM profiles
ORDER BY id
LIMIT 5;

-- 3. 본인 프로필이 없으면 생성 (첫 번째 사용자 기준)
-- 주의: 이미 프로필이 있으면 실행하지 마세요!
INSERT INTO profiles (id, username, preferred_language)
SELECT id, COALESCE(raw_user_meta_data->>'username', email), 'ko'
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
LIMIT 1;

-- 4. username 업데이트 (본인 계정)
UPDATE profiles
SET username = '다마네기'  -- 원하는 username으로 변경
WHERE id = (SELECT id FROM auth.users ORDER BY created_at LIMIT 1);
