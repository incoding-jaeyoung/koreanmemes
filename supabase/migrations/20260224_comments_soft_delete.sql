-- 댓글 소프트 삭제 (Reddit식: 삭제해도 대댓글 유지)
ALTER TABLE comments
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
