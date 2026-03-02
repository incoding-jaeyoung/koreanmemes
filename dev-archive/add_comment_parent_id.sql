-- ============================================
-- 댓글 대댓글 지원을 위한 스키마 수정
-- ============================================

-- 1. parent_id 컬럼 추가
ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES comments(id) ON DELETE CASCADE;

-- 2. 인덱스 추가 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);

-- 3. RLS (Row Level Security) 정책 확인 및 추가
-- 댓글은 누구나 볼 수 있음
CREATE POLICY "Comments are viewable by everyone" 
ON comments FOR SELECT 
USING ( true );

-- 로그인한 사용자는 댓글 작성 가능
CREATE POLICY "Users can insert their own comments" 
ON comments FOR INSERT 
WITH CHECK ( auth.uid() = author_id );

-- 본인은 자신의 댓글 수정 가능
CREATE POLICY "Users can update their own comments" 
ON comments FOR UPDATE 
USING ( auth.uid() = author_id );

-- 본인은 자신의 댓글 삭제 가능
CREATE POLICY "Users can delete their own comments" 
ON comments FOR DELETE 
USING ( auth.uid() = author_id );
