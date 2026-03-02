-- 캐릭터별 무브리스트 영상 설정
CREATE TABLE character_move_videos (
  character_slug text PRIMARY KEY,
  video_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 캐릭터 기술 데이터
CREATE TABLE character_moves (
  id serial PRIMARY KEY,
  character_slug text NOT NULL REFERENCES character_move_videos(character_slug) ON DELETE CASCADE,
  name text NOT NULL,
  command text NOT NULL,
  category text DEFAULT '기본 기술',
  sort_order int DEFAULT 0,
  start_time float,
  end_time float,
  hit_level text,
  damage text,
  startup text,
  active text,
  total text,
  recovery text,
  hit_adv text,
  counter_adv text,
  crouch_hit_adv text,
  crouch_counter_adv text,
  stun text,
  evade_dir text,
  throw_break text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_character_moves_slug ON character_moves(character_slug);
CREATE INDEX idx_character_moves_sort ON character_moves(character_slug, sort_order);

-- RLS 활성화
ALTER TABLE character_move_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_moves ENABLE ROW LEVEL SECURITY;

-- character_move_videos RLS 정책
CREATE POLICY "character_move_videos_read_all" ON character_move_videos
  FOR SELECT USING (true);

CREATE POLICY "character_move_videos_write_admin" ON character_move_videos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- character_moves RLS 정책
CREATE POLICY "character_moves_read_all" ON character_moves
  FOR SELECT USING (true);

CREATE POLICY "character_moves_write_admin" ON character_moves
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );
