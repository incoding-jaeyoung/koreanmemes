-- ============================================
-- 더미 데이터 생성 (간단 버전)
-- ============================================

-- 참고: 이 스크립트는 본인 계정만 사용합니다.
-- 여러 사용자처럼 보이게 하기 위해 author_name을 다르게 설정합니다.

-- ============================================
-- 1. 본인 프로필 업데이트
-- ============================================

-- 본인 계정의 user_id 확인
-- SELECT id, email FROM auth.users;

-- 본인 프로필 업데이트 (첫 번째 사용자)
UPDATE profiles 
SET 
  username = 'FighterKing',
  comment = 'Let''s fight! 🥊',
  main_character_id = 'akira',
  psn_id = 'FighterKing_PSN',
  discord_id = 'FighterKing#1234',
  preferred_language = 'ko',
  avatar_url = NULL
WHERE id = (SELECT id FROM auth.users ORDER BY created_at LIMIT 1);

-- ============================================
-- 2. 더미 게시글 생성 (다양한 작성자명으로)
-- ============================================

-- 본인 계정으로 여러 게시글 작성 (author_name만 다르게)
DO $$
DECLARE
  user_id_var UUID;
BEGIN
  -- 본인 user_id 가져오기
  SELECT id INTO user_id_var FROM auth.users ORDER BY created_at LIMIT 1;

  -- 게시글 1 (AkiraMain)
  INSERT INTO posts (title, content, category, author_id, author_name)
  VALUES (
    '아키라 초보자 가이드',
    '<h2>아키라 유키 시작하기</h2><p>안녕하세요! 아키라를 처음 시작하시는 분들을 위한 가이드입니다.</p><h3>기본 콤보</h3><ul><li>P+K → 6P+K</li><li>3P+K → 46P</li><li>2P → 6P</li></ul><p>아키라는 어렵지만 정말 재미있는 캐릭터입니다. 화이팅! 🥊</p>',
    '공략',
    user_id_var,
    'AkiraMain'
  );

  -- 게시글 2 (JackyBryant)
  INSERT INTO posts (title, content, category, author_id, author_name)
  VALUES (
    'Jacky Bryant Combo Guide',
    '<h2>Jacky''s Best Combos</h2><p>Here are some essential combos for Jacky players:</p><ul><li>Beat Knuckle → Somersault Kick</li><li>Low Kick → High Kick</li><li>Backfist → Elbow</li></ul><p>Practice these and you''ll dominate! ⚡</p>',
    '공략',
    user_id_var,
    'JackyBryant'
  );

  -- 게시글 3 (SarahFan)
  INSERT INTO posts (title, content, category, author_id, author_name)
  VALUES (
    'サラ・ブライアント攻略',
    '<h2>サラの基本戦術</h2><p>サラは素早い攻撃が特徴です。</p><h3>おすすめコンボ</h3><ul><li>フラミンゴスタンス活用</li><li>中段攻撃の使い分け</li><li>投げ技の重要性</li></ul><p>頑張ってください！ 🎮</p>',
    '공략',
    user_id_var,
    'SarahFan'
  );

  -- 게시글 4 (FighterKing - 본인)
  INSERT INTO posts (title, content, category, author_id, author_name)
  VALUES (
    '아키라 vs 잭키 매치업 질문',
    '<p>아키라로 잭키를 상대할 때 어떻게 해야 할까요?</p><p>잭키의 빠른 공격에 계속 당하는데 좋은 팁 있으신가요?</p>',
    '질문',
    user_id_var,
    'FighterKing'
  );

  -- 게시글 5 (KageMaster)
  INSERT INTO posts (title, content, category, author_id, author_name)
  VALUES (
    '버추어 파이터 6 출시 예상',
    '<h2>VF6는 언제 나올까요?</h2><p>세가에서 버추어 파이터 6 개발 중이라는 소문이 있는데, 여러분 생각은 어떠신가요?</p><p>개인적으로는 2025년 말쯤 나올 것 같은데...</p>',
    '토론',
    user_id_var,
    'KageMaster'
  );

  -- 게시글 6 (PaiChan)
  INSERT INTO posts (title, content, category, author_id, author_name)
  VALUES (
    '파이챈 추천 콤보',
    '<h2>파이챈 기본 콤보</h2><p>파이챈은 빠른 타격이 장점입니다.</p><ul><li>중단 → 하단 → 중단</li><li>백스텝 → 점프킥</li></ul><p>연습하면 강해집니다! 💪</p>',
    '공략',
    user_id_var,
    'PaiChan'
  );

END $$;

-- ============================================
-- 3. 더미 댓글 생성
-- ============================================

DO $$
DECLARE
  user_id_var UUID;
  post_id_1 UUID;
  post_id_2 UUID;
  post_id_4 UUID;
BEGIN
  SELECT id INTO user_id_var FROM auth.users ORDER BY created_at LIMIT 1;
  SELECT id INTO post_id_1 FROM posts WHERE title = '아키라 초보자 가이드';
  SELECT id INTO post_id_2 FROM posts WHERE title = 'Jacky Bryant Combo Guide';
  SELECT id INTO post_id_4 FROM posts WHERE title = '아키라 vs 잭키 매치업 질문';

  -- 첫 번째 게시글에 댓글
  INSERT INTO comments (post_id, content, author_id, author_name)
  VALUES (
    post_id_1,
    '좋은 가이드 감사합니다! 아키라 연습 중인데 많은 도움이 되었어요.',
    user_id_var,
    'JackyBryant'
  );

  INSERT INTO comments (post_id, content, author_id, author_name)
  VALUES (
    post_id_1,
    'ありがとうございます！とても参考になりました。',
    user_id_var,
    'SarahFan'
  );

  INSERT INTO comments (post_id, content, author_id, author_name)
  VALUES (
    post_id_1,
    '초보자에게 정말 유용한 정보네요! 👍',
    user_id_var,
    'FighterKing'
  );

  -- 두 번째 게시글에 댓글
  INSERT INTO comments (post_id, content, author_id, author_name)
  VALUES (
    post_id_2,
    'Great guide! I''ll practice these combos tonight.',
    user_id_var,
    'AkiraMain'
  );

  INSERT INTO comments (post_id, content, author_id, author_name)
  VALUES (
    post_id_2,
    'Beat Knuckle combo is my favorite! 🥊',
    user_id_var,
    'KageMaster'
  );

  -- 질문 게시글에 답변
  INSERT INTO comments (post_id, content, author_id, author_name)
  VALUES (
    post_id_4,
    '잭키 상대로는 중거리를 유지하면서 견제하는 게 좋아요. 6P+K로 거리 조절하세요!',
    user_id_var,
    'AkiraMain'
  );

  INSERT INTO comments (post_id, content, author_id, author_name)
  VALUES (
    post_id_4,
    'As a Jacky player, I can say Akira''s shoulder ram is really effective against us!',
    user_id_var,
    'JackyBryant'
  );

  INSERT INTO comments (post_id, content, author_id, author_name)
  VALUES (
    post_id_4,
    '방어보다는 공격적으로 압박하는 게 좋습니다.',
    user_id_var,
    'PaiChan'
  );

END $$;

-- ============================================
-- 4. 더미 좋아요 생성
-- ============================================

DO $$
DECLARE
  user_id_var UUID;
  post_id_1 UUID;
  post_id_2 UUID;
  post_id_3 UUID;
BEGIN
  SELECT id INTO user_id_var FROM auth.users ORDER BY created_at LIMIT 1;
  SELECT id INTO post_id_1 FROM posts WHERE title = '아키라 초보자 가이드';
  SELECT id INTO post_id_2 FROM posts WHERE title = 'Jacky Bryant Combo Guide';
  SELECT id INTO post_id_3 FROM posts WHERE title = 'サラ・ブライアント攻略';

  -- 좋아요 추가 (중복 방지)
  INSERT INTO post_likes (post_id, user_id)
  VALUES (post_id_1, user_id_var)
  ON CONFLICT DO NOTHING;

  INSERT INTO post_likes (post_id, user_id)
  VALUES (post_id_2, user_id_var)
  ON CONFLICT DO NOTHING;

  INSERT INTO post_likes (post_id, user_id)
  VALUES (post_id_3, user_id_var)
  ON CONFLICT DO NOTHING;

END $$;

-- ============================================
-- 5. 게시글 좋아요 수 업데이트
-- ============================================

UPDATE posts SET likes = 3 WHERE title = '아키라 초보자 가이드';
UPDATE posts SET likes = 2 WHERE title = 'Jacky Bryant Combo Guide';
UPDATE posts SET likes = 1 WHERE title = 'サラ・ブライアント攻略';

-- ============================================
-- 완료!
-- ============================================

-- 확인 쿼리:
SELECT id, title, author_name, category, likes FROM posts ORDER BY created_at DESC;
SELECT id, content, author_name, post_id FROM comments ORDER BY created_at DESC;
