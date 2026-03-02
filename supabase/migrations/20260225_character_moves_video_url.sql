-- YouTube 영상 삭제 시 fallback용 자체 호스팅 URL
ALTER TABLE character_move_videos ADD COLUMN IF NOT EXISTS video_url text;
