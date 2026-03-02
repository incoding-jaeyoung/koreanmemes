-- 댓글 이미지 첨부 기능
ALTER TABLE comments ADD COLUMN image_url TEXT DEFAULT NULL;
ALTER TABLE comments ADD COLUMN image_public_id TEXT DEFAULT NULL;
