-- 1. 현재 관리자 계정 확인 (먼저 실행해서 user_id 확인)
SELECT p.id, p.username, p.role, u.email
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'damanegi1979@naver.com';

-- 2. 닉네임 변경: 다마네기 → VF MANIA
UPDATE profiles
SET username = 'VF MANIA', updated_at = now()
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'damanegi1979@naver.com'
);

-- 3. 이메일 변경: damanegi1979@naver.com → contact@incoding.co.kr
UPDATE auth.users
SET email = 'contact@incoding.co.kr',
    email_confirmed_at = now(),
    updated_at = now()
WHERE email = 'damanegi1979@naver.com';

-- 4. 변경 결과 확인
SELECT p.id, p.username, p.role, u.email
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'contact@incoding.co.kr';
