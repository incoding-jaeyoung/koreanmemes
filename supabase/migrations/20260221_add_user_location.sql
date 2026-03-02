-- ============================================================
-- Add Location Tracking to Profiles
-- ============================================================

-- profiles 테이블에 위치 정보 컬럼 추가
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS region TEXT,
  ADD COLUMN IF NOT EXISTS signup_ip TEXT;

-- 인덱스 추가 (국가별 필터링 성능 향상)
CREATE INDEX IF NOT EXISTS idx_profiles_country ON profiles(country);

-- 코멘트 추가
COMMENT ON COLUMN profiles.country IS 'ISO 3166-1 alpha-2 country code (e.g., KR, US, JP)';
COMMENT ON COLUMN profiles.region IS 'Region/City name from geolocation';
COMMENT ON COLUMN profiles.signup_ip IS 'IP address at signup (optional, for analytics)';
