# 이메일 인증 설정 가이드

## 문제 상황
네이버, 다음 등 국내 메일 서비스에서 Supabase 인증 메일이 도착하지 않거나 스팸함으로 분류되는 문제가 발생할 수 있습니다.

## 원인
- Supabase 기본 SMTP는 해외 IP를 사용하여 국내 메일 서비스의 스팸 필터에 걸림
- SPF/DKIM 설정 부재로 발신자 인증 실패
- 네이버/다음은 특히 해외 발신 메일에 엄격한 필터 적용

## 해결 방법

### 1. 커스텀 SMTP 설정 (필수)

Supabase에서 신뢰할 수 있는 SMTP 서비스를 사용하도록 설정합니다.

#### 추천 SMTP 서비스

**1) SendGrid (추천)**
- 무료 플랜: 월 100통
- 설정 간편, 한국어 지원
- 회원가입: https://sendgrid.com

**설정 방법**:
```bash
1. SendGrid 가입 → Settings → API Keys → Create API Key
2. 권한: "Mail Send" Full Access
3. API Key 복사 (한 번만 표시됨)
```

**2) AWS SES**
- 가격: 첫 62,000통 무료 (EC2에서 발송 시)
- 한국 리전(ap-northeast-2) 사용 가능
- 가장 안정적이고 저렴

**설정 방법**:
```bash
1. AWS Console → SES → SMTP Settings
2. Create SMTP Credentials
3. Username, Password 복사
```

**3) Mailgun**
- 무료 플랜: 월 5,000통
- 유럽/미국 서버

---

### 2. Supabase에 SMTP 설정하기

#### 2-1. Supabase Dashboard 설정

1. **Supabase Dashboard** 접속
   - https://supabase.com/dashboard

2. **프로젝트 선택** → **Authentication** → **Email Templates**

3. **SMTP Settings** 클릭

4. **SendGrid 예시**:
   ```
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: [SendGrid API Key]
   Sender email: noreply@yourdomain.com
   Sender name: VF6 Community
   ```

5. **AWS SES 예시** (서울 리전):
   ```
   Host: email-smtp.ap-northeast-2.amazonaws.com
   Port: 587
   Username: [SMTP Username from AWS]
   Password: [SMTP Password from AWS]
   Sender email: noreply@yourdomain.com
   Sender name: VF6 Community
   ```

6. **Test** 버튼으로 테스트 메일 발송

7. **Save** 버튼 클릭

#### 2-2. 도메인 인증 (선택, 권장)

발신 신뢰도를 높이기 위해 자신의 도메인을 인증합니다.

**SendGrid 도메인 인증**:
1. SendGrid → Settings → Sender Authentication → Authenticate Your Domain
2. DNS 레코드 추가 (CNAME 3개)
3. Verify 버튼 클릭

**AWS SES 도메인 인증**:
1. SES → Verified Identities → Create Identity
2. Domain 선택 → 도메인 입력
3. DNS 레코드 추가 (CNAME, TXT)
4. Verification 대기 (1~24시간)

---

### 3. 이메일 템플릿 커스터마이징

Supabase Dashboard → Authentication → Email Templates에서 템플릿을 수정할 수 있습니다.

#### 회원가입 확인 이메일 예시

**제목**: VF6 커뮤니티 이메일 인증

**본문**:
```html
<h2>VF6 커뮤니티에 오신 것을 환영합니다! 🎉</h2>

<p>아래 버튼을 클릭하여 이메일 인증을 완료해주세요.</p>

<a href="{{ .ConfirmationURL }}"
   style="display: inline-block; padding: 12px 24px; background-color: #0ea5e9;
          color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
  이메일 인증하기
</a>

<p style="color: #666; font-size: 12px; margin-top: 20px;">
  링크가 작동하지 않으면 아래 URL을 복사하여 브라우저에 붙여넣으세요:<br>
  {{ .ConfirmationURL }}
</p>

<p style="color: #999; font-size: 11px; margin-top: 30px;">
  본인이 가입하지 않았다면 이 이메일을 무시하세요.
</p>
```

---

### 4. 네이버/다음 메일 사용자를 위한 대안

SMTP 설정 없이 당장 해결이 필요한 경우:

1. **Gmail/Outlook 사용 권장**
   - 회원가입 시 Gmail/Outlook 사용 안내

2. **스팸함 확인 안내 강화**
   - 이미 코드에 반영됨 (`src/app/login/page.tsx`)

3. **재발송 기능 활용**
   - 2~5분 대기 후 재발송 버튼 사용

4. **메일 필터 설정 안내**
   - 네이버: `noreply@yourdomain.com`을 수신허용 목록에 추가
   - 다음: 환경설정 → 스팸메일 차단 → 수신허용 목록

---

### 5. 테스트 방법

1. **로컬 환경에서 테스트**:
   ```bash
   # .env.local 확인
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

   # 개발 서버 실행
   npm run dev
   ```

2. **회원가입 시도**:
   - 본인의 Gmail, 네이버, 다음 메일로 테스트
   - 각 메일 서비스별 도착 시간 및 스팸 분류 확인

3. **로그 확인**:
   - Supabase Dashboard → Logs → Email Logs
   - 발송 성공/실패 여부 확인

---

### 6. 비용 예상

| 서비스 | 무료 한도 | 추가 비용 |
|--------|-----------|-----------|
| SendGrid | 월 100통 | $19.95/월 (40,000통) |
| AWS SES | 월 62,000통* | $0.10/1,000통 |
| Mailgun | 월 5,000통 | $35/월 (50,000통) |

*EC2에서 발송 시. 일반 인터넷은 월 1,000통 무료

**예상 사용량**:
- 소규모 커뮤니티 (100명): 월 200~300통
- 중규모 커뮤니티 (1,000명): 월 2,000~3,000통

→ **SendGrid 무료 플랜으로 충분** (초기 단계)
→ **AWS SES** (성장 후 비용 효율적)

---

### 7. 문제 해결 (Troubleshooting)

#### 메일이 여전히 안 오는 경우

1. **Supabase 로그 확인**:
   - Dashboard → Logs → Email Logs
   - 에러 메시지 확인

2. **SMTP 설정 재확인**:
   - Host, Port, Username, Password 정확한지 확인
   - SendGrid: Port 587 (TLS) 사용

3. **발신자 이메일 확인**:
   - 인증된 도메인 사용 권장
   - 무료 도메인(예: @gmail.com)은 차단될 수 있음

4. **Rate Limit 확인**:
   - Supabase는 기본적으로 Rate Limit 적용
   - 같은 이메일로 짧은 시간에 여러 번 재발송 시 차단

5. **네이버 메일 특이사항**:
   - 네이버는 특히 엄격하여 SMTP 설정 후에도 지연될 수 있음
   - **해결책**: Gmail/Outlook 사용 권장

---

### 8. 권장 사항

✅ **지금 바로 설정하세요**:
1. SendGrid 무료 계정 생성 (5분 소요)
2. Supabase SMTP 설정 (3분 소요)
3. 테스트 메일 발송

✅ **추후 설정 (선택)**:
1. 커스텀 도메인 구입 (예: vf6.community)
2. 도메인 인증 (SPF/DKIM)
3. AWS SES로 마이그레이션 (비용 절감)

---

### 9. 참고 자료

- [Supabase SMTP 공식 문서](https://supabase.com/docs/guides/auth/auth-smtp)
- [SendGrid 시작 가이드](https://docs.sendgrid.com/for-developers/sending-email/getting-started-smtp)
- [AWS SES 한국어 가이드](https://docs.aws.amazon.com/ko_kr/ses/latest/dg/send-email-smtp.html)

---

### 10. 요약

**문제**: 네이버 메일로 인증 메일 안 옴
**원인**: Supabase 기본 SMTP + 네이버 스팸 필터
**해결**: SendGrid/AWS SES 커스텀 SMTP 설정
**소요 시간**: 약 10분
**비용**: 무료 (SendGrid 무료 플랜)

**지금 당장 할 일**:
1. SendGrid 가입 → API Key 발급
2. Supabase Dashboard → SMTP 설정
3. 테스트 메일 발송
4. 사용자에게 Gmail/Outlook 권장 안내
