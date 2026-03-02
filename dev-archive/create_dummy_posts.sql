-- ============================================
-- 간단한 더미 게시글 생성 (본인 계정 사용)
-- ============================================

DO $$
DECLARE
  my_user_id UUID;
BEGIN
  -- 본인 user_id 가져오기
  SELECT id INTO my_user_id FROM auth.users ORDER BY created_at LIMIT 1;

  -- 게시글 생성 (다양한 author_name으로)
  INSERT INTO posts (title, content, category, author_id, author_name, likes, views)
  VALUES 
    -- AkiraMain의 게시글
    (
      '아키라 초보자 가이드',
      '<h2>아키라 유키 시작하기</h2><p>안녕하세요! 아키라를 처음 시작하시는 분들을 위한 가이드입니다.</p><h3>기본 콤보</h3><ul><li>P+K → 6P+K</li><li>3P+K → 46P</li><li>2P → 6P</li></ul><p>아키라는 어렵지만 정말 재미있는 캐릭터입니다. 화이팅! 🥊</p>',
      '공략',
      my_user_id,
      'AkiraMain',
      5,
      120
    ),
    -- JackyBryant의 게시글
    (
      'Jacky Bryant Combo Guide',
      '<h2>Jacky''s Best Combos</h2><p>Here are some essential combos for Jacky players:</p><ul><li>Beat Knuckle → Somersault Kick</li><li>Low Kick → High Kick</li><li>Backfist → Elbow</li></ul><p>Practice these and you''ll dominate! ⚡</p>',
      '공략',
      my_user_id,
      'JackyBryant',
      3,
      85
    ),
    -- SarahFan의 게시글
    (
      'サラ・ブライアント攻略',
      '<h2>サラの基本戦術</h2><p>サラは素早い攻撃が特徴です。</p><h3>おすすめコンボ</h3><ul><li>フラミンゴスタンス活用</li><li>中段攻撃の使い分け</li><li>投げ技の重要性</li></ul><p>頑張ってください！ 🎮</p>',
      '공략',
      my_user_id,
      'SarahFan',
      2,
      67
    ),
    -- KageMaster의 게시글
    (
      '버추어 파이터 6 출시 예상',
      '<h2>VF6는 언제 나올까요?</h2><p>세가에서 버추어 파이터 6 개발 중이라는 소문이 있는데, 여러분 생각은 어떠신가요?</p><p>개인적으로는 2025년 말쯤 나올 것 같은데...</p><blockquote>세가 공식 발표를 기다리고 있습니다!</blockquote>',
      '토론',
      my_user_id,
      'KageMaster',
      7,
      156
    ),
    -- PaiChan의 게시글
    (
      '파이챈 추천 콤보',
      '<h2>파이챈 기본 콤보</h2><p>파이챈은 빠른 타격이 장점입니다.</p><ul><li>중단 → 하단 → 중단</li><li>백스텝 → 점프킥</li><li>회전킥 → 연타</li></ul><p>연습하면 강해집니다! 💪</p>',
      '공략',
      my_user_id,
      'PaiChan',
      4,
      92
    ),
    -- AkiraMain의 질문
    (
      '아키라 vs 잭키 매치업 질문',
      '<p>아키라로 잭키를 상대할 때 어떻게 해야 할까요?</p><p>잭키의 빠른 공격에 계속 당하는데 좋은 팁 있으신가요?</p><p>특히 비트 너클 대응이 어렵습니다...</p>',
      '질문',
      my_user_id,
      'AkiraMain',
      1,
      45
    ),
    -- WolfMain의 게시글
    (
      '울프 호크필드 기본 가이드',
      '<h2>울프 호크필드</h2><p>레슬링 스타일의 강력한 캐릭터입니다.</p><h3>핵심 기술</h3><ul><li>자이언트 스윙</li><li>백 드롭</li><li>니 리프트</li></ul><p>잡기 캐릭터의 진수를 보여드립니다! 🤼</p>',
      '공략',
      my_user_id,
      'WolfMain',
      6,
      110
    ),
    -- LionRafale의 게시글
    (
      'Lion Rafale Advanced Techniques',
      '<h2>Lion''s Advanced Combos</h2><p>Lion is all about speed and precision.</p><h3>Key Moves</h3><ul><li>Mantis Style transitions</li><li>Low sweep combos</li><li>Counter hit setups</li></ul><p>Master these and you''ll be unstoppable! 🦁</p>',
      '공략',
      my_user_id,
      'LionRafale',
      8,
      145
    );

  -- 댓글 생성
  INSERT INTO comments (post_id, content, author_id, author_name)
  SELECT 
    p.id,
    '좋은 가이드 감사합니다! 아키라 연습 중인데 많은 도움이 되었어요.',
    my_user_id,
    'JackyBryant'
  FROM posts p WHERE p.title = '아키라 초보자 가이드' LIMIT 1;

  INSERT INTO comments (post_id, content, author_id, author_name)
  SELECT 
    p.id,
    'ありがとうございます！とても参考になりました。',
    my_user_id,
    'SarahFan'
  FROM posts p WHERE p.title = '아키라 초보자 가이드' LIMIT 1;

  INSERT INTO comments (post_id, content, author_id, author_name)
  SELECT 
    p.id,
    '초보자에게 정말 유용한 정보네요! 👍',
    my_user_id,
    'KageMaster'
  FROM posts p WHERE p.title = '아키라 초보자 가이드' LIMIT 1;

  INSERT INTO comments (post_id, content, author_id, author_name)
  SELECT 
    p.id,
    'Great guide! I''ll practice these combos tonight.',
    my_user_id,
    'AkiraMain'
  FROM posts p WHERE p.title = 'Jacky Bryant Combo Guide' LIMIT 1;

  INSERT INTO comments (post_id, content, author_id, author_name)
  SELECT 
    p.id,
    'Beat Knuckle combo is my favorite! 🥊',
    my_user_id,
    'WolfMain'
  FROM posts p WHERE p.title = 'Jacky Bryant Combo Guide' LIMIT 1;

  INSERT INTO comments (post_id, content, author_id, author_name)
  SELECT 
    p.id,
    '잭키 상대로는 중거리를 유지하면서 견제하는 게 좋아요. 6P+K로 거리 조절하세요!',
    my_user_id,
    'AkiraMain'
  FROM posts p WHERE p.title = '아키라 vs 잭키 매치업 질문' LIMIT 1;

  INSERT INTO comments (post_id, content, author_id, author_name)
  SELECT 
    p.id,
    'As a Jacky player, I can say Akira''s shoulder ram is really effective against us!',
    my_user_id,
    'JackyBryant'
  FROM posts p WHERE p.title = '아키라 vs 잭키 매치업 질문' LIMIT 1;

  INSERT INTO comments (post_id, content, author_id, author_name)
  SELECT 
    p.id,
    '방어보다는 공격적으로 압박하는 게 좋습니다.',
    my_user_id,
    'PaiChan'
  FROM posts p WHERE p.title = '아키라 vs 잭키 매치업 질문' LIMIT 1;

  INSERT INTO comments (post_id, content, author_id, author_name)
  SELECT 
    p.id,
    'VF6 정말 기대되네요! 2025년에 나왔으면 좋겠어요.',
    my_user_id,
    'LionRafale'
  FROM posts p WHERE p.title = '버추어 파이터 6 출시 예상' LIMIT 1;

END $$;

-- 확인
SELECT title, author_name, category, likes, views FROM posts ORDER BY created_at DESC;
SELECT content, author_name FROM comments ORDER BY created_at DESC LIMIT 10;
