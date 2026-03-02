-- 게시판 글에 단위(랭크) 표시용 컬럼 추가
-- 1~46: docs/virtua_fighter_ranks.html 기준 VF 랭크 레벨, NULL이면 미선택
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS rank_level INTEGER CHECK (rank_level IS NULL OR (rank_level >= 1 AND rank_level <= 46));

COMMENT ON COLUMN posts.rank_level IS 'Virtua Fighter 랭크 레벨 (1~46). 단위 선택 시 사용.';
