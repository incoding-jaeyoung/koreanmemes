"use client";

import { useLanguage } from "@/context/LanguageContext";

const content = {
  ko: {
    lastModified: "최종 수정일: 2026년 2월 20일",
    sections: [
      {
        title: "1. 목적",
        body: (
          <p>
            본 약관은 버추어파이터 커뮤니티(이하 &quot;서비스&quot;)의 이용에 관한 기본적인 사항을 규정함을 목적으로 합니다.
          </p>
        ),
      },
      {
        title: "2. 제3자 로그인(Google 로그인)",
        body: (
          <>
            <p className="mb-2">서비스는 Google 계정을 이용한 로그인(Google Sign-In)을 제공합니다. Google 로그인을 사용하는 경우:</p>
            <ul className="list-disc list-inside space-y-1 text-neutral-400">
              <li>Google 서비스 약관 및 Google 개인정보처리방침에 동의한 것으로 간주됩니다.</li>
              <li>당사가 Google로부터 귀하의 이메일, 표시 이름, 프로필 사진(선택 시)을 수신하여 계정 생성 및 서비스 제공에 이용하는 것에 동의한 것으로 봅니다.</li>
              <li>해당 데이터의 수집·이용·보관에 대한 구체적 내용은 개인정보처리방침을 참고해 주세요.</li>
            </ul>
          </>
        ),
      },
      {
        title: "3. 서비스 이용",
        body: (
          <>
            <p className="mb-2">회원은 다음과 같은 서비스를 이용할 수 있습니다:</p>
            <ul className="list-disc list-inside space-y-1 text-neutral-400">
              <li>게시글 작성 및 댓글 작성</li>
              <li>캐릭터별 커뮤니티 참여</li>
              <li>프로필 관리 및 게임 정보 공유</li>
            </ul>
          </>
        ),
      },
      {
        title: "4. 금지 행위",
        body: (
          <>
            <p className="mb-2">회원은 다음 행위를 해서는 안 됩니다:</p>
            <ul className="list-disc list-inside space-y-1 text-neutral-400">
              <li>타인에 대한 욕설, 비방, 명예훼손</li>
              <li>불법 콘텐츠 게시 (저작권 침해, 음란물 등)</li>
              <li>스팸, 광고성 게시물 무단 게시</li>
              <li>타인의 개인정보 무단 수집 및 공개</li>
              <li>서비스 운영 방해 행위</li>
            </ul>
          </>
        ),
      },
      {
        title: "5. 계정 정지 및 이용 제한",
        body: (
          <p>
            위 금지 행위를 위반한 경우, 사전 통보 없이 게시물 삭제, 계정 정지 등의 조치를 취할 수 있습니다.
          </p>
        ),
      },
      {
        title: "6. 면책 조항",
        body: (
          <>
            <p className="mb-2">서비스는 다음 사항에 대해 책임을 지지 않습니다:</p>
            <ul className="list-disc list-inside space-y-1 text-neutral-400">
              <li>회원이 게시한 정보의 정확성 및 신뢰성</li>
              <li>서비스 이용 중 발생한 손해</li>
              <li>천재지변, 불가항력으로 인한 서비스 중단</li>
            </ul>
          </>
        ),
      },
      {
        title: "7. 회원 탈퇴",
        body: (
          <p>
            회원은 언제든지 프로필 페이지에서 회원 탈퇴를 요청할 수 있으며,
            탈퇴 시 모든 개인정보는 즉시 삭제됩니다.
          </p>
        ),
      },
      {
        title: "8. 약관 변경",
        body: (
          <p>
            본 약관은 필요에 따라 변경될 수 있으며, 변경 시 서비스 내 공지사항을 통해 안내합니다.
          </p>
        ),
      },
    ],
  },
  en: {
    lastModified: "Last modified: February 20, 2026",
    sections: [
      {
        title: "1. Purpose",
        body: (
          <p>
            These Terms of Service govern the use of the Virtua Fighter Community (hereinafter &quot;Service&quot;) and set forth the basic rules and conditions applicable to all members.
          </p>
        ),
      },
      {
        title: "2. Third-Party Login (Google Sign-In)",
        body: (
          <>
            <p className="mb-2">The Service offers sign-in with your Google account (Google Sign-In). By using Google Sign-In, you acknowledge and agree that:</p>
            <ul className="list-disc list-inside space-y-1 text-neutral-400">
              <li>You are subject to Google&apos;s Terms of Service and Google&apos;s Privacy Policy.</li>
              <li>You consent to our receiving your email address, display name, and profile picture (if you grant access) from Google for account creation and service provision.</li>
              <li>Details on how we collect, use, and store this data are set out in our Privacy Policy.</li>
            </ul>
          </>
        ),
      },
      {
        title: "3. Use of Service",
        body: (
          <>
            <p className="mb-2">Members may use the following features of the Service:</p>
            <ul className="list-disc list-inside space-y-1 text-neutral-400">
              <li>Creating posts and comments</li>
              <li>Participating in character-specific communities</li>
              <li>Managing profiles and sharing game information</li>
            </ul>
          </>
        ),
      },
      {
        title: "4. Prohibited Conduct",
        body: (
          <>
            <p className="mb-2">Members must not engage in any of the following conduct:</p>
            <ul className="list-disc list-inside space-y-1 text-neutral-400">
              <li>Harassment, defamation, or abuse directed at other users</li>
              <li>Posting illegal content (copyright infringement, obscene material, etc.)</li>
              <li>Unauthorized posting of spam or commercial advertisements</li>
              <li>Unauthorized collection or disclosure of other users&apos; personal information</li>
              <li>Any conduct that interferes with the operation of the Service</li>
            </ul>
          </>
        ),
      },
      {
        title: "5. Account Suspension and Restrictions",
        body: (
          <p>
            In the event of a violation of the prohibited conduct listed above, we reserve the right to remove content, suspend accounts, or take other appropriate measures without prior notice.
          </p>
        ),
      },
      {
        title: "6. Disclaimer of Liability",
        body: (
          <>
            <p className="mb-2">The Service shall not be held liable for the following:</p>
            <ul className="list-disc list-inside space-y-1 text-neutral-400">
              <li>The accuracy or reliability of information posted by members</li>
              <li>Any damages arising from the use of the Service</li>
              <li>Service interruptions caused by natural disasters or force majeure events</li>
            </ul>
          </>
        ),
      },
      {
        title: "7. Account Deletion",
        body: (
          <p>
            Members may request account deletion at any time from the profile page.
            Upon deletion, all personal information will be immediately and permanently removed.
          </p>
        ),
      },
      {
        title: "8. Amendments to Terms",
        body: (
          <p>
            These Terms of Service may be amended as necessary. Any changes will be announced via the in-service notice board.
          </p>
        ),
      },
    ],
  },
  ja: {
    lastModified: "最終更新日：2026年2月20日",
    sections: [
      {
        title: "1. 目的",
        body: (
          <p>
            本規約は、バーチャファイターコミュニティ（以下「サービス」）の利用に関する基本的な事項を定めることを目的とします。
          </p>
        ),
      },
      {
        title: "2. 第三者ログイン（Googleログイン）",
        body: (
          <>
            <p className="mb-2">サービスではGoogleアカウントによるログイン（Google Sign-In）を提供しています。Googleログインを利用する場合：</p>
            <ul className="list-disc list-inside space-y-1 text-neutral-400">
              <li>Googleのサービス規約およびGoogleのプライバシーポリシーに同意したものとみなされます。</li>
              <li>当社がGoogleからお客様のメールアドレス、表示名、プロフィール写真（許可した場合）を受け取り、アカウント作成およびサービス提供に利用することに同意したものとみなされます。</li>
              <li>当該データの収集・利用・保管の詳細は個人情報保護方針（プライバシーポリシー）をご参照ください。</li>
            </ul>
          </>
        ),
      },
      {
        title: "3. サービスの利用",
        body: (
          <>
            <p className="mb-2">会員は以下のサービスを利用することができます：</p>
            <ul className="list-disc list-inside space-y-1 text-neutral-400">
              <li>投稿およびコメントの作成</li>
              <li>キャラクター別コミュニティへの参加</li>
              <li>プロフィール管理およびゲーム情報の共有</li>
            </ul>
          </>
        ),
      },
      {
        title: "4. 禁止行為",
        body: (
          <>
            <p className="mb-2">会員は以下の行為を行ってはなりません：</p>
            <ul className="list-disc list-inside space-y-1 text-neutral-400">
              <li>他のユーザーへの誹謗中傷、侮辱、名誉毀損</li>
              <li>違法なコンテンツの投稿（著作権侵害、わいせつ物等）</li>
              <li>スパムや広告目的の投稿の無断掲載</li>
              <li>他のユーザーの個人情報の無断収集および公開</li>
              <li>サービスの運営を妨害する行為</li>
            </ul>
          </>
        ),
      },
      {
        title: "5. アカウントの停止および利用制限",
        body: (
          <p>
            上記の禁止行為に違反した場合、事前の通知なく投稿の削除やアカウントの停止等の措置を講じることがあります。
          </p>
        ),
      },
      {
        title: "6. 免責事項",
        body: (
          <>
            <p className="mb-2">サービスは以下の事項について責任を負いません：</p>
            <ul className="list-disc list-inside space-y-1 text-neutral-400">
              <li>会員が投稿した情報の正確性および信頼性</li>
              <li>サービス利用中に生じた損害</li>
              <li>天災地変や不可抗力によるサービスの中断</li>
            </ul>
          </>
        ),
      },
      {
        title: "7. 退会",
        body: (
          <p>
            会員はいつでもプロフィールページから退会を申請することができます。
            退会時には、すべての個人情報が直ちに削除されます。
          </p>
        ),
      },
      {
        title: "8. 規約の変更",
        body: (
          <p>
            本規約は必要に応じて変更されることがあります。変更の際はサービス内のお知らせにてご案内いたします。
          </p>
        ),
      },
    ],
  },
};

export default function TermsContent() {
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
