-- 대댓글의 실제 답글 대상 추적 (YouTube식 flat 구조에서 @mention 정확도 보장)
ALTER TABLE comments
  ADD COLUMN IF NOT EXISTS reply_to_comment_id UUID REFERENCES comments(id) ON DELETE SET NULL;
