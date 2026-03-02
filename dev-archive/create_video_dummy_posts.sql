-- ============================================
-- 동영상 게시판 더미 글 생성
-- Supabase SQL Editor에서 실행하세요
-- ============================================

DO $$
DECLARE
  my_user_id UUID;
BEGIN
  -- 본인 user_id 가져오기
  SELECT id INTO my_user_id FROM auth.users ORDER BY created_at LIMIT 1;

  -- 동영상 게시판 더미 (board_type='video'), content에 YouTube URL 포함 → 썸네일 자동 추출
  INSERT INTO posts (title, content, category, author_id, author_name, board_type, likes, views)
  VALUES
    (
      '아키라 기본 콤보 완벽 가이드 - 초보자 필수',
      '<h2>아키라 콤보 튜토리얼</h2><p>버추어 파이터 5 풀스펙 아키라의 핵심 콤보를 영상으로 정리했습니다.</p><p>https://www.youtube.com/watch?v=dQw4w9WgXcQ</p><p>P+K → 6P+K, 3P+K → 46P 등 기본 루트 위주로 설명합니다.</p>',
      'combo_guide',
      my_user_id,
      'AkiraMain',
      'video',
      42,
      1250
    ),
    (
      'VF5 유키 결승전 - 명경기 하이라이트',
      '<p>대회 결승전 하이라이트입니다. 아키라 vs 사라 매치업.</p><p>https://www.youtube.com/watch?v=jNQXAC9IVRw</p><p>고수들의 심리전과 프레임 활용을 배워보세요!</p>',
      'match_tournament',
      my_user_id,
      'VFFan',
      'video',
      89,
      3420
    ),
    (
      '잭키 벽 콤보 10선 - 데미지 극대화',
      '<h2>Jacky Wall Combos</h2><p>벽 근처에서 사용하는 잭키의 강력한 콤보 모음입니다.</p><p>https://www.youtube.com/watch?v=kXYuUjwUz0M</p><ul><li>Beat Knuckle → Somersault</li><li>Low → High → Wall Bounce</li></ul>',
      'combo_guide',
      my_user_id,
      'JackyBryant',
      'video',
      67,
      2890
    ),
    (
      '초보자를 위한 VF5 시스템 가이드',
      '<p>버추어 파이터 5의 기본 시스템(프레임, 가드, 잡기 등)을 쉽게 설명하는 영상입니다.</p><p>https://www.youtube.com/watch?v=RgKAFK5djSk</p><p>처음 시작하는 분들께 추천!</p>',
      'combo_guide',
      my_user_id,
      'VFTeacher',
      'video',
      156,
      5120
    ),
    (
      '카게마루 그림자 스텝 활용법 실전 영상',
      '<h2>그림자 스텝 마스터</h2><p>카게마루 시그니처 기술의 활용법을 실전 영상으로 분석합니다.</p><p>https://www.youtube.com/watch?v=OPf0YbXqDm0</p>',
      'today_match',
      my_user_id,
      'KageMaster',
      'video',
      78,
      2100
    ),
    (
      '사라 플라밍고 스탠스 고급 테크닉',
      '<p>플라밍고 스탠스의 다양한 파생기와 심리전 활용법.</p><p>https://www.youtube.com/watch?v=9E6bBswenbg</p><p>중급자 이상 추천.</p>',
      'combo_guide',
      my_user_id,
      'SarahFan',
      'video',
      45,
      1890
    ),
    (
      '프로 대회 풀매치 - 퍼스트 투 10',
      '<p>해외 프로 대회 풀매치 영상입니다. 메타 분석용으로 참고하세요.</p><p>https://www.youtube.com/watch?v=9bZkp7q19f0</p>',
      'match_tournament',
      my_user_id,
      'ProWatcher',
      'video',
      124,
      6780
    ),
    (
      '울프 자이언트 스윙 잡기 콤보',
      '<h2>Wolf Grapple Combos</h2><p>울프 호크필드 잡기 후 이어지는 콤보 정리.</p><p>https://www.youtube.com/watch?v=2Vv-BfVoq4g</p>',
      'combo_guide',
      my_user_id,
      'WolfMain',
      'video',
      53,
      1670
    ),
    (
      '2005년 VF5 전국대회 결승 - 전설의 명경기',
      '<p>고인의 생전 개쩔었던 순간. 2005년 전국대회 결승전 리플레이.</p><p>https://www.youtube.com/watch?v=dQw4w9WgXcQ</p>',
      'legendary',
      my_user_id,
      'VFHistorian',
      'video',
      312,
      15800
    ),
    (
      'VF 커뮤니티 모임 영상 - 자유 대전 하이라이트',
      '<p>지난 주 커뮤니티 모임에서 찍은 자유 대전 하이라이트입니다.</p><p>https://www.youtube.com/watch?v=jNQXAC9IVRw</p>',
      'free',
      my_user_id,
      'CommunityFan',
      'video',
      28,
      890
    );

END $$;

-- 확인
SELECT title, category, author_name, likes, views, board_type
FROM posts
WHERE board_type = 'video'
ORDER BY created_at DESC;
