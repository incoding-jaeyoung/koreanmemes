-- Phase 2: Database Schema 확장
-- Supabase SQL Editor에서 실행하세요

-- 1. 댓글 테이블 생성
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id),
  author_name TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. 좋아요 테이블 생성 (중복 방지)
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(post_id, user_id)
);

-- 3. posts 테이블에 updated_at 추가
ALTER TABLE posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- 4. comments 테이블 RLS 정책
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read comments" ON comments;
CREATE POLICY "Allow public read comments" ON comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert comments" ON comments;
CREATE POLICY "Allow authenticated insert comments" ON comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow users to update own comments" ON comments;
CREATE POLICY "Allow users to update own comments" ON comments FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Allow users to delete own comments" ON comments;
CREATE POLICY "Allow users to delete own comments" ON comments FOR DELETE USING (auth.uid() = author_id);

-- 5. post_likes 테이블 RLS 정책
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read likes" ON post_likes;
CREATE POLICY "Allow public read likes" ON post_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated manage likes" ON post_likes;
CREATE POLICY "Allow authenticated manage likes" ON post_likes FOR ALL USING (auth.uid() = user_id);

-- 6. posts 테이블에 삭제 정책 추가
DROP POLICY IF EXISTS "Allow users to delete own posts" ON posts;
CREATE POLICY "Allow users to delete own posts" ON posts FOR DELETE USING (auth.uid() = author_id);
