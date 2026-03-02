-- ============================================
-- posts 테이블에 character_id 컬럼 추가
-- ============================================

-- 1. character_id 컬럼 추가
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS character_id TEXT;

-- 2. 인덱스 추가 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_posts_character_id 
ON posts(character_id);

-- 3. 확인
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'posts' 
AND column_name = 'character_id';
