-- ============================================
-- 가짜 회원 정보 및 게시글 생성
-- ============================================

-- 1. RLS 임시 비활성화 (더미 데이터 삽입용)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. 가짜 UUID 생성 (고정값 사용)
DO $$
DECLARE
  user1_id UUID := '11111111-1111-1111-1111-111111111111';
  user2_id UUID := '22222222-2222-2222-2222-222222222222';
  user3_id UUID := '33333333-3333-3333-3333-333333333333';
  user4_id UUID := '44444444-4444-4444-4444-444444444444';
  user5_id UUID := '55555555-5555-5555-5555-555555555555';
BEGIN

  -- 3. 가짜 프로필 생성
  INSERT INTO profiles (id, username, comment, main_character_id, psn_id, discord_id, preferred_language)
  VALUES 
    (user1_id, 'AkiraMain', 'Akira player from Korea 🇰🇷', 'akira', 'AkiraMain_PSN', 'AkiraMain#1234', 'ko'),
    (user2_id, 'JackyBryant', 'Speed is everything! ⚡', 'jacky', 'JackySpeed', 'JackyBryant#5678', 'en'),
    (user3_id, 'SarahFan', '格闘ゲーム大好き！ 🎮', 'sarah', NULL, 'SarahFan#9999', 'ja'),
    (user4_id, 'KageMaster', 'Shadow master! 🥷', 'kage', 'KageMaster_PSN', NULL, 'ko'),
    (user5_id, 'PaiChan', '파이챈으로 승리! 💪', 'pai', NULL, 'PaiChan#7777', 'ko')
  ON CONFLICT (id) DO NOTHING;

  -- 4. 가짜 회원으로 게시글 작성
  INSERT INTO posts (title, content, category, author_id, author_name)
  VALUES 
    -- AkiraMain의 게시글
    (
      '아키라 초보자 가이드',
      '<h2>아키라 유키 시작하기</h2><p>안녕하세요! 아키라를 처음 시작하시는 분들을 위한 가이드입니다.</p><h3>기본 콤보</h3><ul><li>P+K → 6P+K</li><li>3P+K → 46P</li><li>2P → 6P</li></ul><p>아키라는 어렵지만 정말 재미있는 캐릭터입니다. 화이팅! 🥊</p>',
      '공략',
      user1_id,
      'AkiraMain'
    ),
    -- JackyBryant의 게시글
    (
      'Jacky Bryant Combo Guide',
      '<h2>Jacky''s Best Combos</h2><p>Here are some essential combos for Jacky players:</p><ul><li>Beat Knuckle → Somersault Kick</li><li>Low Kick → High Kick</li><li>Backfist → Elbow</li></ul><p>Practice these and you''ll dominate! ⚡</p>',
      '공략',
      user2_id,
      'JackyBryant'
    ),
    -- SarahFan의 게시글
    (
      'サラ・ブライアント攻略',
      '<h2>サラの基本戦術</h2><p>サラは素早い攻撃が特徴です。</p><h3>おすすめコンボ</h3><ul><li>フラミンゴスタンス活用</li><li>中段攻撃の使い分け</li><li>投げ技の重要性</li></ul><p>頑張ってください！ 🎮</p>',
      '공략',
      user3_id,
      'SarahFan'
    ),
    -- KageMaster의 게시글
    (
      '버추어 파이터 6 출시 예상',
      '<h2>VF6는 언제 나올까요?</h2><p>세가에서 버추어 파이터 6 개발 중이라는 소문이 있는데, 여러분 생각은 어떠신가요?</p><p>개인적으로는 2025년 말쯤 나올 것 같은데...</p>',
      '토론',
      user4_id,
      'KageMaster'
    ),
    -- PaiChan의 게시글
    (
      '파이챈 추천 콤보',
      '<h2>파이챈 기본 콤보</h2><p>파이챈은 빠른 타격이 장점입니다.</p><ul><li>중단 → 하단 → 중단</li><li>백스텝 → 점프킥</li></ul><p>연습하면 강해집니다! 💪</p>',
      '공략',
      user5_id,
      'PaiChan'
    ),
    -- AkiraMain의 질문
    (
      '아키라 vs 잭키 매치업 질문',
      '<p>아키라로 잭키를 상대할 때 어떻게 해야 할까요?</p><p>잭키의 빠른 공격에 계속 당하는데 좋은 팁 있으신가요?</p>',
      '질문',
      user1_id,
      'AkiraMain'
    );

  -- 5. 댓글 작성
  INSERT INTO comments (post_id, content, author_id, author_name)
  SELECT 
    p.id,
    '좋은 가이드 감사합니다! 아키라 연습 중인데 많은 도움이 되었어요.',
    user2_id,
    'JackyBryant'
  FROM posts p WHERE p.title = '아키라 초보자 가이드';

  INSERT INTO comments (post_id, content, author_id, author_name)
  SELECT 
    p.id,
    'ありがとうございます！とても参考になりました。',
    user3_id,
    'SarahFan'
  FROM posts p WHERE p.title = '아키라 초보자 가이드';

  INSERT INTO comments (post_id, content, author_id, author_name)
  SELECT 
    p.id,
    '초보자에게 정말 유용한 정보네요! 👍',
    user4_id,
    'KageMaster'
  FROM posts p WHERE p.title = '아키라 초보자 가이드';

  INSERT INTO comments (post_id, content, author_id, author_name)
  SELECT 
    p.id,
    'Great guide! I''ll practice these combos tonight.',
    user1_id,
    'AkiraMain'
  FROM posts p WHERE p.title = 'Jacky Bryant Combo Guide';

  INSERT INTO comments (post_id, content, author_id, author_name)
  SELECT 
    p.id,
    'Beat Knuckle combo is my favorite! 🥊',
    user4_id,
    'KageMaster'
  FROM posts p WHERE p.title = 'Jacky Bryant Combo Guide';

  INSERT INTO comments (post_id, content, author_id, author_name)
  SELECT 
    p.id,
    '잭키 상대로는 중거리를 유지하면서 견제하는 게 좋아요. 6P+K로 거리 조절하세요!',
    user1_id,
    'AkiraMain'
  FROM posts p WHERE p.title = '아키라 vs 잭키 매치업 질문';

  INSERT INTO comments (post_id, content, author_id, author_name)
  SELECT 
    p.id,
    'As a Jacky player, I can say Akira''s shoulder ram is really effective against us!',
    user2_id,
    'JackyBryant'
  FROM posts p WHERE p.title = '아키라 vs 잭키 매치업 질문';

  INSERT INTO comments (post_id, content, author_id, author_name)
  SELECT 
    p.id,
    '방어보다는 공격적으로 압박하는 게 좋습니다.',
    user5_id,
    'PaiChan'
  FROM posts p WHERE p.title = '아키라 vs 잭키 매치업 질문';

  -- 6. 좋아요 추가
  INSERT INTO post_likes (post_id, user_id)
  SELECT p.id, user2_id FROM posts p WHERE p.title = '아키라 초보자 가이드'
  ON CONFLICT DO NOTHING;

  INSERT INTO post_likes (post_id, user_id)
  SELECT p.id, user3_id FROM posts p WHERE p.title = '아키라 초보자 가이드'
  ON CONFLICT DO NOTHING;

  INSERT INTO post_likes (post_id, user_id)
  SELECT p.id, user4_id FROM posts p WHERE p.title = '아키라 초보자 가이드'
  ON CONFLICT DO NOTHING;

  INSERT INTO post_likes (post_id, user_id)
  SELECT p.id, user1_id FROM posts p WHERE p.title = 'Jacky Bryant Combo Guide'
  ON CONFLICT DO NOTHING;

  INSERT INTO post_likes (post_id, user_id)
  SELECT p.id, user5_id FROM posts p WHERE p.title = 'Jacky Bryant Combo Guide'
  ON CONFLICT DO NOTHING;

  -- 7. 게시글 좋아요 수 업데이트
  UPDATE posts SET likes = 3 WHERE title = '아키라 초보자 가이드';
  UPDATE posts SET likes = 2 WHERE title = 'Jacky Bryant Combo Guide';
  UPDATE posts SET likes = 1 WHERE title = 'サラ・ブライアント攻略';

END $$;

-- 8. RLS 다시 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 9. 확인
SELECT username, comment, main_character_id FROM profiles WHERE id::text LIKE '11111111%' OR id::text LIKE '22222222%';
SELECT title, author_name, category FROM posts ORDER BY created_at DESC LIMIT 10;
SELECT content, author_name FROM comments ORDER BY created_at DESC LIMIT 10;
