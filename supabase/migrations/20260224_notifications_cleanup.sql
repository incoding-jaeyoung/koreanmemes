-- pg_cron 확장 활성화 (Supabase 대시보드 Extensions에서 이미 활성화된 경우 무시됨)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 30일 지난 알림 자동 삭제 (매일 자정 UTC 실행)
SELECT cron.schedule(
  'delete-old-notifications',
  '0 0 * * *',
  $$
    DELETE FROM notifications
    WHERE created_at < now() - INTERVAL '30 days';
  $$
);
