-- ============================================
-- 간단한 더미 데이터 생성 (본인 계정만 사용)
-- ============================================

-- 본인 프로필 업데이트
UPDATE profiles 
SET 
  username = 'FighterKing',
  comment = 'Let''s fight! 🥊',
  main_character_id = 'akira',
  psn_id = 'FighterKing_PSN',
  discord_id = 'FighterKing#1234',
  preferred_language = 'ko'
WHERE id = (SELECT id FROM auth.users ORDER BY created_at LIMIT 1);

-- 확인
SELECT username, comment, main_character_id FROM profiles;

-- ============================================
-- 참고: 다른 사용자명(AkiraMain, JackyBryant 등)은
-- 프로필이 없어도 기본 정보가 표시됩니다.
-- ============================================
