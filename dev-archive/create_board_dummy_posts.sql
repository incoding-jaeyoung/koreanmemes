-- ============================================
-- 자유게시판 더미 글 생성
-- ============================================

DO $$
DECLARE
  my_user_id UUID;
BEGIN
  -- 본인 user_id 가져오기
  SELECT id INTO my_user_id FROM auth.users ORDER BY created_at LIMIT 1;

  -- 자유게시판 더미 게시글 생성 (30개)
  INSERT INTO posts (title, content, category, author_id, author_name, likes, views)
  VALUES 
    -- 토론 게시글
    (
      '버추어 파이터 6 출시 예상 시기는?',
      '<h2>VF6 언제 나올까요?</h2><p>세가에서 버추어 파이터 6 개발 중이라는 소문이 있는데, 여러분 생각은 어떠신가요?</p><p>개인적으로는 2026년 말쯤 나올 것 같은데...</p><blockquote>세가 공식 발표를 기다리고 있습니다!</blockquote>',
      '토론',
      my_user_id,
      'FighterKing',
      15,
      234
    ),
    (
      'VF5 vs 철권8 어떤 게 더 재미있나요?',
      '<p>두 게임 다 해봤는데 각자 장단점이 있는 것 같아요.</p><ul><li>VF5: 깊이 있는 시스템, 리얼한 격투</li><li>철권8: 화려한 연출, 많은 캐릭터</li></ul><p>여러분은 어떤 게 더 좋으세요?</p>',
      '토론',
      my_user_id,
      'AkiraMain',
      23,
      456
    ),
    (
      '온라인 대전 래그 너무 심한데 저만 그런가요?',
      '<p>요즘 온라인 대전하면 래그가 심해서 제대로 플레이가 안 되네요.</p><p>특히 저녁 시간대에 심한 것 같은데, 다른 분들은 어떠신가요?</p>',
      '토론',
      my_user_id,
      'JackyBryant',
      8,
      178
    ),
    (
      '초보자가 시작하기 좋은 캐릭터 추천해주세요',
      '<p>버추어 파이터를 처음 시작하는데 어떤 캐릭터로 시작하는 게 좋을까요?</p><p>격투 게임 경험은 조금 있습니다.</p>',
      '질문',
      my_user_id,
      'NewFighter',
      12,
      289
    ),
    (
      '프레임 데이터 어디서 볼 수 있나요?',
      '<p>캐릭터별 프레임 데이터를 확인하고 싶은데 어디서 볼 수 있을까요?</p><p>추천 사이트나 앱 있으면 알려주세요!</p>',
      '질문',
      my_user_id,
      'DataHunter',
      6,
      145
    ),
    (
      '아케이드 스틱 추천 부탁드립니다',
      '<p>VF 플레이용 아케이드 스틱을 사려고 하는데 추천 좀 해주세요.</p><p>예산은 20만원 정도입니다.</p>',
      '질문',
      my_user_id,
      'GearSeeker',
      9,
      198
    ),
    (
      '아키라 초보자 가이드',
      '<h2>아키라 유키 시작하기</h2><p>안녕하세요! 아키라를 처음 시작하시는 분들을 위한 가이드입니다.</p><h3>기본 콤보</h3><ul><li>P+K → 6P+K</li><li>3P+K → 46P</li><li>2P → 6P</li></ul><p>아키라는 어렵지만 정말 재미있는 캐릭터입니다. 화이팅! 🥊</p>',
      '공략',
      my_user_id,
      'AkiraMain',
      45,
      678
    ),
    (
      '잭키 브라이언트 벽 콤보 모음',
      '<h2>Jacky Wall Combos</h2><p>벽 근처에서 사용할 수 있는 잭키의 강력한 콤보들입니다.</p><ul><li>Beat Knuckle → Wall → Somersault Kick</li><li>Low Kick → High Kick → Wall Bounce</li></ul><p>연습하면 데미지가 엄청납니다! ⚡</p>',
      '공략',
      my_user_id,
      'JackyBryant',
      38,
      512
    ),
    (
      '카게마루 그림자 스텝 활용법',
      '<h2>그림자 스텝 마스터하기</h2><p>카게마루의 시그니처 무브인 그림자 스텝 활용법입니다.</p><p>타이밍이 중요하니 연습장에서 충분히 연습하세요!</p>',
      '공략',
      my_user_id,
      'KageMaster',
      31,
      445
    ),
    (
      '오늘 랭크전 10연승 달성!',
      '<p>드디어 오늘 랭크전에서 10연승을 달성했습니다! 🎉</p><p>아키라로 플레이했는데 정말 기분이 좋네요.</p><p>다들 화이팅입니다!</p>',
      '후기',
      my_user_id,
      'AkiraMain',
      27,
      312
    ),
    (
      '첫 대회 참가 후기',
      '<p>어제 처음으로 오프라인 대회에 참가했습니다.</p><p>결과는 좋지 않았지만 많은 걸 배웠어요.</p><p>고수분들 실력이 정말 대단하더라고요!</p>',
      '후기',
      my_user_id,
      'NewFighter',
      19,
      267
    ),
    (
      'VF 커뮤니티 사이트 오픈 축하합니다!',
      '<p>드디어 한국 VF 커뮤니티 사이트가 생겼네요!</p><p>앞으로 많은 정보 공유 부탁드립니다. 🥊</p>',
      '잡담',
      my_user_id,
      'FighterKing',
      42,
      589
    ),
    (
      '여러분이 가장 좋아하는 캐릭터는?',
      '<p>VF 시리즈에서 가장 좋아하는 캐릭터가 누구인가요?</p><p>저는 아키라입니다! 어렵지만 멋있어요.</p>',
      '잡담',
      my_user_id,
      'AkiraMain',
      35,
      421
    ),
    (
      '울프 호크필드 기본 가이드',
      '<h2>울프 호크필드</h2><p>레슬링 스타일의 강력한 캐릭터입니다.</p><h3>핵심 기술</h3><ul><li>자이언트 스윙</li><li>백 드롭</li><li>니 리프트</li></ul><p>잡기 캐릭터의 진수를 보여드립니다! 🤼</p>',
      '공략',
      my_user_id,
      'WolfMain',
      29,
      398
    ),
    (
      '사라 브라이언트 플라밍고 스탠스 활용',
      '<h2>플라밍고 스탠스 완벽 가이드</h2><p>사라의 시그니처 스탠스인 플라밍고를 마스터해봅시다.</p><p>다양한 파생기와 심리전이 가능합니다!</p>',
      '공략',
      my_user_id,
      'SarahFan',
      33,
      467
    ),
    (
      '파이챈 추천 콤보',
      '<h2>파이챈 기본 콤보</h2><p>파이챈은 빠른 타격이 장점입니다.</p><ul><li>중단 → 하단 → 중단</li><li>백스텝 → 점프킥</li><li>회전킥 → 연타</li></ul><p>연습하면 강해집니다! 💪</p>',
      '공략',
      my_user_id,
      'PaiChan',
      26,
      356
    ),
    (
      '라이온 라팔 고급 테크닉',
      '<h2>Lion Advanced Techniques</h2><p>Lion is all about speed and precision.</p><h3>Key Moves</h3><ul><li>Mantis Style transitions</li><li>Low sweep combos</li><li>Counter hit setups</li></ul><p>Master these and you''ll be unstoppable! 🦁</p>',
      '공략',
      my_user_id,
      'LionRafale',
      37,
      523
    ),
    (
      '아키라 vs 잭키 매치업 질문',
      '<p>아키라로 잭키를 상대할 때 어떻게 해야 할까요?</p><p>잭키의 빠른 공격에 계속 당하는데 좋은 팁 있으신가요?</p><p>특히 비트 너클 대응이 어렵습니다...</p>',
      '질문',
      my_user_id,
      'AkiraMain',
      14,
      245
    ),
    (
      '카게 vs 울프 상성 어떤가요?',
      '<p>카게로 울프를 상대하는 게 너무 어려운데 저만 그런가요?</p><p>잡기 캐릭터 상대하는 팁 좀 알려주세요!</p>',
      '질문',
      my_user_id,
      'KageMaster',
      11,
      189
    ),
    (
      '랭크 시스템 개선 필요한 것 같아요',
      '<p>현재 랭크 시스템이 좀 불합리한 것 같은데 여러분 생각은 어떠신가요?</p><p>승점 계산 방식이 개선되었으면 좋겠어요.</p>',
      '토론',
      my_user_id,
      'RankWarrior',
      18,
      298
    ),
    (
      '오프라인 대회 일정 공유합니다',
      '<h2>2026년 VF 대회 일정</h2><p>올해 예정된 VF 대회 일정을 공유합니다.</p><ul><li>3월: 서울 지역 예선</li><li>6월: 전국 대회</li><li>9월: 아시아 챔피언십</li></ul><p>많은 참여 부탁드립니다!</p>',
      '공지',
      my_user_id,
      'EventManager',
      52,
      712
    ),
    (
      '초보자를 위한 용어 정리',
      '<h2>VF 용어 사전</h2><p>초보자분들을 위한 기본 용어 정리입니다.</p><ul><li>프레임: 공격의 속도와 경직</li><li>확정: 막을 수 없는 공격</li><li>심리전: 상대의 행동 예측</li></ul>',
      '공략',
      my_user_id,
      'TeacherVF',
      41,
      634
    ),
    (
      '패드 vs 스틱 어떤 게 나을까요?',
      '<p>VF를 패드로 할지 스틱으로 할지 고민 중입니다.</p><p>각각 장단점이 있을 것 같은데 조언 부탁드립니다!</p>',
      '질문',
      my_user_id,
      'ControllerDebate',
      16,
      278
    ),
    (
      '오늘 고수한테 완패했습니다 ㅠㅠ',
      '<p>랭크전에서 고수를 만나서 완전히 털렸어요.</p><p>리플레이 보면서 공부해야겠습니다...</p><p>아직 갈 길이 멀네요!</p>',
      '후기',
      my_user_id,
      'Learner',
      13,
      223
    ),
    (
      'VF 역사와 시리즈 소개',
      '<h2>버추어 파이터 시리즈 역사</h2><p>1993년 첫 출시 이후 30년이 넘는 역사를 가진 VF 시리즈.</p><p>각 시리즈별 특징과 발전 과정을 정리해봤습니다.</p>',
      '정보',
      my_user_id,
      'VFHistorian',
      39,
      567
    ),
    (
      '스테이지별 벽 위치 정리',
      '<h2>Stage Wall Positions</h2><p>각 스테이지별 벽 위치와 활용법을 정리했습니다.</p><p>벽 콤보를 연습하실 때 참고하세요!</p>',
      '공략',
      my_user_id,
      'StageExpert',
      28,
      412
    ),
    (
      '커스터마이징 자랑 좀 할게요!',
      '<p>제 캐릭터 커스터마이징 완성했어요!</p><p>정말 멋지게 나온 것 같아서 자랑하고 싶었습니다 ㅎㅎ</p>',
      '잡담',
      my_user_id,
      'Fashionista',
      24,
      334
    ),
    (
      '해외 프로 선수 경기 영상 모음',
      '<h2>Must-Watch Pro Matches</h2><p>해외 프로 선수들의 명경기 영상을 모아봤습니다.</p><p>고수들의 플레이를 보면서 많이 배워보세요!</p>',
      '정보',
      my_user_id,
      'VideoCollector',
      46,
      689
    ),
    (
      '다음 주 정기 모임 공지',
      '<p>다음 주 토요일 오후 2시에 정기 모임이 있습니다.</p><p>장소는 강남 게임센터이고, 자유 대전 및 친선전 예정입니다.</p><p>많은 참여 부탁드립니다!</p>',
      '공지',
      my_user_id,
      'Organizer',
      31,
      445
    ),
    (
      '여러분의 VF 입문 계기는?',
      '<p>저는 친구 따라 게임센터 갔다가 VF를 처음 접했어요.</p><p>여러분은 어떻게 VF를 시작하게 되셨나요?</p>',
      '잡담',
      my_user_id,
      'Storyteller',
      22,
      367
    );

  -- 댓글도 추가 (각 게시글에 2-3개씩)
  INSERT INTO comments (post_id, content, author_id, author_name)
  SELECT 
    p.id,
    '좋은 정보 감사합니다! 많은 도움이 되었어요.',
    my_user_id,
    'Commenter1'
  FROM posts p WHERE p.author_id = my_user_id LIMIT 10;

  INSERT INTO comments (post_id, content, author_id, author_name)
  SELECT 
    p.id,
    '저도 같은 생각입니다. 공감합니다!',
    my_user_id,
    'Commenter2'
  FROM posts p WHERE p.author_id = my_user_id LIMIT 15;

END $$;

-- 확인
SELECT title, author_name, category, likes, views 
FROM posts 
ORDER BY created_at DESC 
LIMIT 20;
