-- notifications 테이블에 welcome 타입 및 link_url 컬럼 추가

-- type CHECK 제약 업데이트 (welcome 추가)
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('comment', 'like', 'reply', 'welcome'));

-- 클릭 시 이동할 URL 컬럼 추가 (post_id 없는 알림용)
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS link_url TEXT;
