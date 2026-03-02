-- K-pop 스키마 전환: 게임 특화 컬럼 제거 및 artist_tag 추가

ALTER TABLE posts DROP COLUMN IF EXISTS rank;
ALTER TABLE posts DROP COLUMN IF EXISTS level;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS artist_tag TEXT;

ALTER TABLE profiles DROP COLUMN IF EXISTS rank;
ALTER TABLE profiles DROP COLUMN IF EXISTS level;
