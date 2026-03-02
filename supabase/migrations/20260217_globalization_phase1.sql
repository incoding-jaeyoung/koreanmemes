-- ============================================================
-- Phase 1: Globalization - Translation Tables
-- ============================================================

-- posts 테이블에 language 컬럼 추가 (없는 경우)
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'ko';

-- post_translations 테이블 생성
CREATE TABLE IF NOT EXISTS post_translations (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id     UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  lang        TEXT NOT NULL,
  title       TEXT NOT NULL,
  content     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT post_translations_post_id_lang_key UNIQUE (post_id, lang)
);

-- comment_translations 테이블 생성 (Phase 2 대비)
CREATE TABLE IF NOT EXISTS comment_translations (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id  UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  lang        TEXT NOT NULL,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT comment_translations_comment_id_lang_key UNIQUE (comment_id, lang)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_post_translations_post_id ON post_translations(post_id);
CREATE INDEX IF NOT EXISTS idx_comment_translations_comment_id ON comment_translations(comment_id);

-- RLS 활성화
ALTER TABLE post_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_translations ENABLE ROW LEVEL SECURITY;

-- post_translations: 누구나 읽기 가능, 서비스 역할만 쓰기
DO $$ BEGIN
  CREATE POLICY "post_translations_select" ON post_translations
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "post_translations_all_service" ON post_translations
    FOR ALL USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- comment_translations: 누구나 읽기 가능, 서비스 역할만 쓰기
DO $$ BEGIN
  CREATE POLICY "comment_translations_select" ON comment_translations
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "comment_translations_all_service" ON comment_translations
    FOR ALL USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
