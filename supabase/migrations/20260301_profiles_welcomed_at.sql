-- profiles 테이블에 welcomed_at 컬럼 추가
-- 환영 페이지 방문 여부를 알림 대신 이 컬럼으로 판별 (알림 삭제해도 재방문 방지)

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS welcomed_at TIMESTAMPTZ;

-- 기존 환영 알림이 있는 유저들은 이미 환영된 것으로 처리
UPDATE profiles p
SET welcomed_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM notifications n
  WHERE n.user_id = p.id
  AND n.type = 'welcome'
);
