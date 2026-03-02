"use client";

import { useLanguage } from "@/context/LanguageContext";

const content = {
  ko: {
    lastModified: "최종 수정일: 2026년 2월 20일",
    sections: [
      {
        title: "1. 수집하는 개인정보",
        body: (
          <>
            <p className="mb-2">서비스는 다음과 같은 개인정보를 수집합니다:</p>
            <ul className="list-disc list-inside space-y-1 text-neutral-400">
              <li><strong>필수 정보:</strong> 이메일 주소, 비밀번호(암호화 저장)</li>
              <li><strong>선택 정보:</strong> 닉네임, 프로필 이미지, 주 캐릭터, 게임 계정 정보(PSN, Steam, Xbox, Discord), 코멘트</li>
            </ul>
          </>
        ),
      },
      {
        title: "1-1. Google 로그인(Google Sign-In)을 통해 수집·이용·보관하는 정보",
        body: (
          <>
            <p className="mb-2">Google 계정으로 로그인할 경우, Google에서 아래 정보를 서비스에 전달합니다:</p>
            <ul className="list-disc list-inside space-y-1 text-neutral-400 mb-3">
              <li>이메일 주소, 표시 이름, 프로필 사진(선택 시)</li>
            </ul>
            <p className="mb-2"><strong>이용 목적:</strong> 회원 식별, 계정 생성·관리, 커뮤니티 내 프로필 표시(이름·프로필 사진은 선택 사항)에만 사용합니다.</p>
            <p className="mb-2"><strong>보관:</strong> 위 정보는 인증·데이터베이스 서비스 제공업체(Supabase)를 통해 저장되며, 암호화 등 보안 조치가 적용된 환경에 보관됩니다.</p>
            <p className="mb-2"><strong>제3자 제공·판매:</strong> Google을 통해 수집한 정보를 제3자에게 판매·대여하거나, 마케팅 목적으로 제3자와 공유하지 않습니다.</p>
            <p>Google 계정 권한은 Google 계정 설정에서 언제든지 철회할 수 있습니다.</p>
          </>
        ),
      },
      {
        title: "2. 개인정보 수집 방법",
        body: (
          <ul className="list-disc list-inside space-y-1 text-neutral-400">
            <li>회원가입 시 직접 입력</li>
            <li>프로필 수정 시 직접 입력</li>
          </ul>
        ),
      },
      {
        title: "3. 개인정보 이용 목적",
        body: (
          <>
            <p className="mb-2">수집한 개인정보는 다음 목적으로만 이용됩니다:</p>
            <ul className="list-disc list-inside space-y-1 text-neutral-400">
              <li>회원 식별 및 본인 확인</li>
              <li>서비스 제공 (게시글 작성, 댓글 작성 등)</li>
              <li>커뮤니티 활동 지원</li>
              <li>서비스 개선 및 통계 분석</li>
            </ul>
          </>
        ),
      },
      {
        title: "4. 개인정보 보유 및 이용 기간",
        body: (
          <p>
            회원 탈퇴 시 모든 개인정보는 <strong>즉시 삭제</strong>됩니다.
            단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.
          </p>
        ),
      },
      {
        title: "5. 개인정보 제3자 제공",
        body: (
          <p>
            서비스는 회원의 개인정보를 <strong>제3자에게 제공하지 않습니다</strong>.
            단, 법령에 의해 요구되는 경우는 예외로 합니다.
          </p>
        ),
      },
      {
        title: "6. 개인정보 처리 위탁",
        body: (
          <>
            <p className="mb-2">서비스는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리를 위탁합니다:</p>
            <ul className="list-disc list-inside space-y-1 text-neutral-400 mb-3">
              <li><strong>Supabase(https://supabase.com):</strong> 회원 인증(이메일·비밀번호 로그인, Google 로그인 포함) 및 데이터베이스 저장 서비스</li>
            </ul>
            <p className="mb-2">Supabase를 통해 저장되는 정보: 로그인용 이메일, 사용자 식별자, 프로필 정보(닉네임, 아바타 등). 위탁업체는 당사 지시에 따라 처리하며, 이용자 정보를 자사 광고·마케팅에 사용하지 않습니다. 보관 시 암호화 등 보안 조치가 적용됩니다.</p>
          </>
        ),
      },
      {
        title: "7. 회원의 권리",
        body: (
          <>
            <p className="mb-2">회원은 다음과 같은 권리를 가집니다:</p>
            <ul className="list-disc list-inside space-y-1 text-neutral-400">
              <li>개인정보 열람 및 수정 (프로필 페이지)</li>
              <li>개인정보 삭제 (회원 탈퇴)</li>
              <li>개인정보 처리 정지 요구</li>
            </ul>
          </>
        ),
      },
      {
        title: "8. 개인정보 보호책임자",
        body: (
          <p>
            개인정보 관련 문의사항이 있으시면 커뮤니티 내 문의 게시판을 이용해 주시기 바랍니다.
          </p>
        ),
      },
      {
        title: "9. 만 14세 미만 아동",
        body: (
          <p>
            서비스는 만 14세 미만 아동의 개인정보를 수집하지 않습니다.
          </p>
        ),
      },
      {
        title: "10. 개인정보처리방침 변경",
        body: (
          <p>
            본 방침은 필요에 따라 변경될 수 있으며, 변경 시 서비스 내 공지사항을 통해 안내합니다.
          </p>
        ),
      },
    ],
  },
  en: {
    lastModified: "Last modified: February 20, 2026",
    sections: [
      {
        title: "1. Personal Information We Collect",
        body: (
          <>
            <p className="mb-2">The Service collects the following personal information:</p>
            <ul className="list-disc list-inside space-y-1 text-neutral-400">
              <li><strong>Required:</strong> Email address, password (stored in encrypted form)</li>
              <li><strong>Optional:</strong> Nickname, profile image, main character, game account information (PSN, Steam, Xbox, Discord), comments</li>
            </ul>
          </>
        ),
      },
      {
        title: "1-1. Data We Receive and Use Through Google Sign-In",
        body: (
          <>
            <p className="mb-2">When you sign in with Google, Google provides us with the following information:</p>
            <ul className="list-disc list-inside space-y-1 text-neutral-400 mb-3">
              <li>Email address, display name, and profile picture (if you grant access)</li>
            </ul>
            <p className="mb-2"><strong>Purpose of use:</strong> We use this data only to identify you, create and manage your account, and optionally display your name and profile picture within the community.</p>
            <p className="mb-2"><strong>Storage:</strong> This information is stored via our authentication and database provider (Supabase) in a secure environment with encryption and other safeguards.</p>
            <p className="mb-2"><strong>No sale or third-party sharing:</strong> We do not sell, rent, or share data obtained through Google with third parties for marketing or advertising purposes.</p>
            <p>You may revoke our access to your Google account at any time in your Google account settings.</p>
          </>
        ),
      },
      {
        title: "2. Methods of Collection",
        body: (
          <ul className="list-disc list-inside space-y-1 text-neutral-400">
            <li>Directly provided by the user upon registration</li>
            <li>Directly provided by the user when editing their profile</li>
          </ul>
        ),
      },
      {
        title: "3. Purpose of Use",
        body: (
          <>
            <p className="mb-2">Collected personal information is used solely for the following purposes:</p>
            <ul className="list-disc list-inside space-y-1 text-neutral-400">
              <li>Member identification and identity verification</li>
              <li>Service provision (posting, commenting, etc.)</li>
              <li>Supporting community activities</li>
              <li>Service improvement and statistical analysis</li>
            </ul>
          </>
        ),
      },
      {
        title: "4. Retention Period",
        body: (
          <p>
            Upon account deletion, all personal information is <strong>immediately deleted</strong>.
            Exceptions apply where retention is required by applicable law, in which case data is retained for the legally prescribed period.
          </p>
        ),
      },
      {
        title: "5. Disclosure to Third Parties",
        body: (
          <p>
            The Service <strong>does not disclose members&apos; personal information to third parties</strong>.
            Exceptions apply where disclosure is required by applicable law.
          </p>
        ),
      },
      {
        title: "6. Processing Delegation",
        body: (
          <>
            <p className="mb-2">To provide seamless service, we delegate certain personal data processing as follows:</p>
            <ul className="list-disc list-inside space-y-1 text-neutral-400 mb-3">
              <li><strong>Supabase (https://supabase.com):</strong> Authentication (email/password and Google Sign-In) and database storage</li>
            </ul>
            <p className="mb-2">Data stored via Supabase includes: email used for login, user identifiers, and profile information (nickname, avatar, etc.). The processor acts only on our instructions and does not use your data for its own advertising or marketing. Stored data is protected by encryption and other security measures.</p>
          </>
        ),
      },
      {
        title: "7. Member Rights",
        body: (
          <>
            <p className="mb-2">Members have the following rights:</p>
            <ul className="list-disc list-inside space-y-1 text-neutral-400">
              <li>Access and correction of personal information (profile page)</li>
              <li>Deletion of personal information (account deletion)</li>
              <li>Right to request suspension of processing</li>
            </ul>
          </>
        ),
      },
      {
        title: "8. Privacy Officer",
        body: (
          <p>
            For any inquiries regarding personal information, please use the community inquiry board.
          </p>
        ),
      },
      {
        title: "9. Children Under 14",
        body: (
          <p>
            The Service does not knowingly collect personal information from children under the age of 14.
          </p>
        ),
      },
      {
        title: "10. Amendments to This Policy",
        body: (
          <p>
            This Privacy Policy may be amended as necessary. Any changes will be announced via the in-service notice board.
          </p>
        ),
      },
    ],
  },
  ja: {
    lastModified: "最終更新日：2026年2月20日",
    sections: [
      {
        title: "1. 収集する個人情報",
        body: (
          <>
            <p className="mb-2">サービスは以下の個人情報を収集します：</p>
            <ul className="list-disc list-inside space-y-1 text-neutral-400">
              <li><strong>必須情報：</strong>メールアドレス、パスワード（暗号化して保存）</li>
              <li><strong>任意情報：</strong>ニックネーム、プロフィール画像、メインキャラクター、ゲームアカウント情報（PSN、Steam、Xbox、Discord）、コメント</li>
            </ul>
          </>
        ),
      },
      {
        title: "1-1. Googleログイン（Google Sign-In）により取得・利用・保管する情報",
        body: (
          <>
            <p className="mb-2">Googleアカウントでログインする場合、Googleから以下の情報が当サービスに提供されます：</p>
            <ul className="list-disc list-inside space-y-1 text-neutral-400 mb-3">
              <li>メールアドレス、表示名、プロフィール写真（許可した場合）</li>
            </ul>
            <p className="mb-2"><strong>利用目的：</strong>会員の識別、アカウントの作成・管理、コミュニティ内でのプロフィール表示（名前・プロフィール写真は任意）にのみ使用します。</p>
            <p className="mb-2"><strong>保管：</strong>上記情報は認証・データベースサービス提供者（Supabase）を通じて保存され、暗号化等のセキュリティ措置が講じられた環境で保管されます。</p>
            <p className="mb-2"><strong>第三者提供・販売：</strong>Google経由で取得した情報を第三者に販売・貸与したり、マーケティング目的で第三者と共有することはありません。</p>
            <p>Googleアカウントの権限は、Googleアカウント設定からいつでも取り消すことができます。</p>
          </>
        ),
      },
      {
        title: "2. 個人情報の収集方法",
        body: (
          <ul className="list-disc list-inside space-y-1 text-neutral-400">
            <li>会員登録時にユーザーが直接入力</li>
            <li>プロフィール編集時にユーザーが直接入力</li>
          </ul>
        ),
      },
      {
        title: "3. 利用目的",
        body: (
          <>
            <p className="mb-2">収集した個人情報は、以下の目的にのみ使用されます：</p>
            <ul className="list-disc list-inside space-y-1 text-neutral-400">
              <li>会員の識別および本人確認</li>
              <li>サービスの提供（投稿、コメント等）</li>
              <li>コミュニティ活動のサポート</li>
              <li>サービスの改善および統計分析</li>
            </ul>
          </>
        ),
      },
      {
        title: "4. 保有期間",
        body: (
          <p>
            退会時には、すべての個人情報が<strong>直ちに削除</strong>されます。
            ただし、関連法令により保存が必要な場合は、定められた期間中保管いたします。
          </p>
        ),
      },
      {
        title: "5. 第三者への提供",
        body: (
          <p>
            サービスは会員の個人情報を<strong>第三者に提供しません</strong>。
            ただし、法令により開示が求められる場合はこの限りではありません。
          </p>
        ),
      },
      {
        title: "6. 個人情報処理の委託",
        body: (
          <>
            <p className="mb-2">円滑なサービス提供のため、以下のとおり個人情報の処理を委託しています：</p>
            <ul className="list-disc list-inside space-y-1 text-neutral-400 mb-3">
              <li><strong>Supabase（https://supabase.com）：</strong>会員認証（メール・パスワードログイン、Googleログイン含む）およびデータベース保存サービス</li>
            </ul>
            <p className="mb-2">Supabaseを通じて保存される情報：ログイン用メールアドレス、ユーザー識別子、プロフィール情報（ニックネーム、アバター等）。委託先は当社の指示に従って処理し、利用者情報を自社の広告・マーケティングに利用しません。保管時には暗号化等のセキュリティ措置が講じられています。</p>
          </>
        ),
      },
      {
        title: "7. 会員の権利",
        body: (
          <>
            <p className="mb-2">会員は以下の権利を有します：</p>
            <ul className="list-disc list-inside space-y-1 text-neutral-400">
              <li>個人情報の閲覧および修正（プロフィールページ）</li>
              <li>個人情報の削除（退会）</li>
              <li>個人情報の処理停止の要求</li>
            </ul>
          </>
        ),
      },
      {
        title: "8. 個人情報保護責任者",
        body: (
          <p>
            個人情報に関するお問い合わせは、コミュニティ内のお問い合わせ掲示板をご利用ください。
          </p>
        ),
      },
      {
        title: "9. 14歳未満の方について",
        body: (
          <p>
            サービスは14歳未満の方の個人情報を収集いたしません。
          </p>
        ),
      },
      {
        title: "10. プライバシーポリシーの変更",
        body: (
          <p>
            本ポリシーは必要に応じて変更されることがあります。変更の際はサービス内のお知らせにてご案内いたします。
          </p>
        ),
      },
    ],
  },
};

export default function PrivacyContent() {
  const { locale } = useLanguage();
  const lang = (locale as keyof typeof content) in content ? (locale as keyof typeof content) : "ko";
  const t = content[lang];

  return (
    <div className="space-y-6 text-neutral-300">
      <p className="text-neutral-400">{t.lastModified}</p>
      {t.sections.map((section) => (
        <section key={section.title}>
          <h2 className="text-xl font-bold mb-3">{section.title}</h2>
          {section.body}
        </section>
      ))}
    </div>
  );
}
