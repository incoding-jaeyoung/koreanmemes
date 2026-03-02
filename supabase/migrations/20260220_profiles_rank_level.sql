-- 프로필에 단위(랭크) 컬럼 추가 — 게임정보에서 선택, 게시판에서 작성자 단위 표시용
-- 1~46: Virtua Fighter 랭크 레벨, NULL이면 미선택
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS rank_level INTEGER CHECK (rank_level IS NULL OR (rank_level >= 1 AND rank_level <= 46));

COMMENT ON COLUMN profiles.rank_level IS 'VF 랭크(단위) 레벨 1~46. 게임정보에서 설정.';
