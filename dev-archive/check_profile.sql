-- DB에서 프로필 직접 확인
-- Supabase SQL Editor에서 실행

-- 1. 모든 프로필 확인
SELECT id, username, comment, preferred_language 
FROM profiles;

-- 2. auth.users와 profiles 조인해서 확인
SELECT 
  u.email,
  p.username,
  p.comment,
  p.preferred_language
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- 3. username이 '다마네기'인 프로필 찾기
SELECT * FROM profiles WHERE username = '다마네기';

-- 4. username이 'FighterKing'인 프로필 찾기
SELECT * FROM profiles WHERE username = 'FighterKing';
