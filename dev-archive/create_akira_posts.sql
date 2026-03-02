-- ============================================
-- 아키라 전용 게시글 생성
-- ============================================

DO $$
DECLARE
  my_user_id UUID;
BEGIN
  -- 본인 user_id 가져오기
  SELECT id INTO my_user_id FROM auth.users ORDER BY created_at LIMIT 1;

  -- 아키라 전용 게시글 생성
  INSERT INTO posts (title, content, category, author_id, author_name, character_id, likes, views)
  VALUES 
    -- 1. 벽 콤보 가이드
    (
      '아키라 벽 콤보 효율적인 루트 정리',
      '<h2>아키라 벽 콤보 완벽 가이드</h2>
      <p>벽 근처에서 아키라의 데미지를 극대화하는 콤보 루트를 정리했습니다.</p>
      
      <h3>기본 벽 콤보</h3>
      <ul>
        <li><strong>P+K → 벽 → 46P+K</strong>: 가장 기본적인 벽 콤보</li>
        <li><strong>3P+K → 벽 → 6P+K → 46P</strong>: 중거리 시작 콤보</li>
        <li><strong>66P+K → 벽 → 2P → 6P+K</strong>: 고데미지 루트</li>
      </ul>
      
      <h3>상황별 최적화</h3>
      <p>벽과의 거리에 따라 콤보를 조절해야 합니다:</p>
      <blockquote>
        <strong>근거리</strong>: 46P+K로 마무리<br>
        <strong>중거리</strong>: 6P+K → 46P 연계<br>
        <strong>원거리</strong>: 66P+K로 접근 후 콤보
      </blockquote>
      
      <h3>프레임 데이터</h3>
      <ul>
        <li>46P+K: 14프레임, 벽 바운스 유발</li>
        <li>6P+K: 16프레임, 높은 데미지</li>
        <li>66P+K: 18프레임, 긴 리치</li>
      </ul>
      
      <p>연습장에서 충분히 연습하세요! 🥊</p>',
      '공략',
      my_user_id,
      'AkiraMain',
      'akira',
      45,
      678
    ),
    
    -- 2. 프레임 데이터 분석
    (
      '아키라 기초 견제기 프레임 데이터 분석',
      '<h2>아키라 견제기 완벽 분석</h2>
      <p>아키라의 핵심 견제기들의 프레임 데이터를 정리했습니다.</p>
      
      <h3>필수 견제기</h3>
      <table>
        <tr><th>기술</th><th>발생</th><th>가드</th><th>히트</th></tr>
        <tr><td>P</td><td>10F</td><td>+2</td><td>+8</td></tr>
        <tr><td>6P</td><td>12F</td><td>-2</td><td>+5</td></tr>
        <tr><td>2P</td><td>11F</td><td>-1</td><td>+6</td></tr>
        <tr><td>K</td><td>13F</td><td>-4</td><td>+3</td></tr>
      </table>
      
      <h3>중거리 견제</h3>
      <ul>
        <li><strong>6P+K</strong>: 16F, 리치 좋음, 카운터 히트 시 콤보</li>
        <li><strong>3P+K</strong>: 18F, 중단, 히트 시 유리</li>
        <li><strong>66P</strong>: 14F, 빠른 중단 견제</li>
      </ul>
      
      <h3>심리전 활용</h3>
      <blockquote>
        P → 6P+K: 기본 압박 패턴<br>
        2P → 46P: 하단 후 중단 이지선다<br>
        K → 3P+K: 상단 후 중단 연계
      </blockquote>
      
      <p>프레임을 숙지하면 상대를 압도할 수 있습니다! 💪</p>',
      '공략',
      my_user_id,
      'FrameMaster',
      'akira',
      38,
      512
    ),
    
    -- 3. 캐릭터 상성 가이드
    (
      '아키라로 상대하기 까다로운 캐릭터 상성 가이드',
      '<h2>아키라 캐릭터 상성 분석</h2>
      <p>아키라로 플레이할 때 까다로운 캐릭터들과 대처법을 정리했습니다.</p>
      
      <h3>불리한 매치업</h3>
      
      <h4>🔴 잭키 브라이언트 (4:6)</h4>
      <ul>
        <li><strong>문제점</strong>: 빠른 공격 속도, 우수한 견제력</li>
        <li><strong>대처법</strong>: 중거리 유지, 6P+K로 견제, 잡기 활용</li>
        <li><strong>주의사항</strong>: 비트 너클 가드 후 반격 필수</li>
      </ul>
      
      <h4>🟡 카게마루 (5:5)</h4>
      <ul>
        <li><strong>문제점</strong>: 그림자 스텝, 빠른 이동</li>
        <li><strong>대처법</strong>: 넓은 판정의 기술 사용, 예측 공격</li>
        <li><strong>주의사항</strong>: 백스텝 후 반격 조심</li>
      </ul>
      
      <h3>유리한 매치업</h3>
      
      <h4>🟢 울프 호크필드 (6:4)</h4>
      <ul>
        <li><strong>장점</strong>: 리치 우위, 견제 우세</li>
        <li><strong>전략</strong>: 중거리 견제 위주, 잡기 회피</li>
        <li><strong>핵심</strong>: 거리 조절이 승패를 가른다</li>
      </ul>
      
      <h3>일반적인 대처법</h3>
      <blockquote>
        1. 상대 캐릭터의 주력 기술 파악<br>
        2. 거리 조절로 우위 확보<br>
        3. 프레임 유리한 상황에서 압박<br>
        4. 벽 근처로 몰아넣기
      </blockquote>
      
      <p>상성을 이해하면 승률이 올라갑니다! 🎯</p>',
      '공략',
      my_user_id,
      'StrategyKing',
      'akira',
      31,
      445
    ),
    
    -- 4. 초보자 가이드
    (
      '아키라 입문자를 위한 완벽 가이드',
      '<h2>아키라 시작하기</h2>
      <p>아키라를 처음 시작하는 분들을 위한 완벽 가이드입니다.</p>
      
      <h3>왜 아키라인가?</h3>
      <ul>
        <li>✅ 높은 데미지</li>
        <li>✅ 우수한 견제력</li>
        <li>✅ 멋진 기술 모션</li>
        <li>⚠️ 다소 높은 난이도</li>
      </ul>
      
      <h3>필수 기술 5가지</h3>
      <ol>
        <li><strong>P (잽)</strong>: 가장 빠른 기술, 압박용</li>
        <li><strong>6P+K</strong>: 중거리 견제의 핵심</li>
        <li><strong>46P+K</strong>: 벽 콤보 마무리</li>
        <li><strong>3P+K</strong>: 중단 견제기</li>
        <li><strong>2P</strong>: 하단 견제, 프레임 유리</li>
      </ol>
      
      <h3>기본 콤보 3가지</h3>
      <ul>
        <li>P+K → 6P+K</li>
        <li>3P+K → 46P</li>
        <li>2P → 6P</li>
      </ul>
      
      <h3>연습 순서</h3>
      <blockquote>
        <strong>1주차</strong>: 기본 기술 익히기<br>
        <strong>2주차</strong>: 기본 콤보 연습<br>
        <strong>3주차</strong>: 견제 패턴 익히기<br>
        <strong>4주차</strong>: 실전 적용
      </blockquote>
      
      <p>꾸준히 연습하면 누구나 마스터할 수 있습니다! 화이팅! 🥊</p>',
      '공략',
      my_user_id,
      'AkiraTeacher',
      'akira',
      52,
      789
    ),
    
    -- 5. 고급 테크닉
    (
      '아키라 고급 테크닉: 프레임 트랩과 심리전',
      '<h2>아키라 고급 테크닉</h2>
      <p>중급자 이상을 위한 고급 테크닉을 소개합니다.</p>
      
      <h3>프레임 트랩</h3>
      <p>상대의 반격을 유도하고 카운터를 노리는 기술입니다.</p>
      
      <h4>기본 프레임 트랩</h4>
      <ul>
        <li><strong>P (가드) → 6P+K</strong>: +2 프레임 활용</li>
        <li><strong>2P (히트) → 46P</strong>: +6 프레임 활용</li>
        <li><strong>6P (가드) → P</strong>: -2지만 잽으로 견제</li>
      </ul>
      
      <h3>심리전 패턴</h3>
      
      <h4>3단계 압박</h4>
      <ol>
        <li><strong>1단계</strong>: P → 6P+K (기본 압박)</li>
        <li><strong>2단계</strong>: P → 2P (하단 변화)</li>
        <li><strong>3단계</strong>: P → 잡기 (심리전)</li>
      </ol>
      
      <h3>고급 콤보</h3>
      <ul>
        <li>카운터 히트 6P+K → 46P+K → 벽 → 2P → 6P+K</li>
        <li>공중 히트 3P+K → 6P → 46P</li>
        <li>백 턴 상황 66P+K → 46P+K</li>
      </ul>
      
      <h3>상급자 팁</h3>
      <blockquote>
        💡 <strong>거리 조절</strong>: 아키라의 생명선<br>
        💡 <strong>프레임 숙지</strong>: 모든 상황 파악<br>
        💡 <strong>심리전</strong>: 패턴 변화로 상대 혼란<br>
        💡 <strong>벽 활용</strong>: 최대 데미지 추구
      </blockquote>
      
      <p>고급 테크닉을 마스터하면 진정한 아키라 장인이 됩니다! 🏆</p>',
      '공략',
      my_user_id,
      'AkiraGod',
      'akira',
      67,
      923
    );

  -- 댓글도 추가
  INSERT INTO comments (post_id, content, author_id, author_name)
  SELECT 
    p.id,
    '정말 유용한 정보네요! 감사합니다.',
    my_user_id,
    'Learner'
  FROM posts p WHERE p.character_id = 'akira' LIMIT 3;

END $$;

-- 확인
SELECT title, author_name, character_id, likes, views 
FROM posts 
WHERE character_id = 'akira'
ORDER BY created_at DESC;
